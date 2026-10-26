from dotenv import load_dotenv
load_dotenv()

import os
import html
import logging
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from urllib.parse import urlparse

import bcrypt
import httpx
import jwt
import sib_api_v3_sdk
from bson import ObjectId
from fastapi import FastAPI, HTTPException, Request, Response, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from pymongo import MongoClient, DESCENDING
from starlette.middleware.base import BaseHTTPMiddleware
from user_agents import parse as parse_ua

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Beskar API")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        return response


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPPORT_EMAIL = os.environ["SUPPORT_EMAIL"]
SENDER_EMAIL = os.environ["SENDER_EMAIL"]
SENDER_NAME = os.environ.get("SENDER_NAME", "Beskar")
BREVO_API_KEY = os.environ.get("BREVO_API_KEY")
RECAPTCHA_API_KEY = os.environ.get("RECAPTCHA_API_KEY")
RECAPTCHA_SITE_KEY = os.environ.get("RECAPTCHA_SITE_KEY")
RECAPTCHA_PROJECT_ID = os.environ.get("RECAPTCHA_PROJECT_ID")
RECAPTCHA_MIN_SCORE = float(os.environ.get("RECAPTCHA_MIN_SCORE", "0.5"))
RECAPTCHA_HOSTNAMES = {h.strip() for h in os.environ.get("RECAPTCHA_HOSTNAMES", "").split(",") if h.strip()}
JWT_SECRET = os.environ["JWT_SECRET"]
ADMIN_EMAIL = os.environ["ADMIN_EMAIL"].lower()
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]
CRON_SECRET = os.environ.get("CRON_SECRET")

db = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]
contacts = db["contacts"]
visitors = db["visitors"]
geo_cache = db["geo_cache"]
admins = db["admins"]
spam_blocks = db["spam_blocks"]
login_attempts = db["login_attempts"]


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    return (fwd.split(",")[0].strip() if fwd else "") or request.headers.get("x-real-ip", "") or (request.client.host if request.client else "unknown")


def lookup_geo(ip: str) -> dict:
    cached = geo_cache.find_one({"ip": ip}, {"_id": 0, "geo": 1})
    if cached:
        return cached["geo"]
    geo = {}
    try:
        r = httpx.get(f"http://ip-api.com/json/{ip}?fields=status,country,regionName,city,isp", timeout=3)
        d = r.json()
        if d.get("status") == "success":
            geo = {"country": d.get("country"), "region": d.get("regionName"), "city": d.get("city"), "isp": d.get("isp")}
    except Exception as e:
        logger.warning(f"Geo lookup failed: {e}")
    if geo:
        geo_cache.update_one({"ip": ip}, {"$set": {"ip": ip, "geo": geo, "at": now_iso()}}, upsert=True)
    return geo


SEARCH_ENGINES = {"google": "Google", "bing": "Bing", "duckduckgo": "DuckDuckGo", "yahoo": "Yahoo", "yandex": "Yandex",
                  "baidu": "Baidu", "ecosia": "Ecosia", "linkedin": "LinkedIn", "lnkd": "LinkedIn", "facebook": "Facebook",
                  "t.co": "X / Twitter", "twitter": "X / Twitter", "chatgpt": "ChatGPT", "perplexity": "Perplexity"}


def classify_source(referrer: str, utm: dict) -> str:
    if utm.get("source"):
        return f"Campaign: {utm['source']}"
    host = urlparse(referrer).netloc.lower() if referrer else ""
    if not host:
        return "Direct"
    for key, name in SEARCH_ENGINES.items():
        if key in host:
            return name
    return host


# ---------- Visitor tracking ----------

class TrackVisit(BaseModel):
    visitor_id: str = Field(min_length=8, max_length=64)
    domain: str = Field(max_length=255)
    path: str = Field(max_length=500)
    referrer: str = Field(default="", max_length=1000)
    utm: dict = {}
    language: str = Field(default="", max_length=50)
    languages: List[str] = []
    timezone: str = Field(default="", max_length=80)
    screen: str = Field(default="", max_length=30)


class TrackSections(BaseModel):
    visitor_id: str = Field(min_length=8, max_length=64)
    sections: List[str] = Field(max_length=50)


@app.post("/api/track/visit")
def track_visit(body: TrackVisit, request: Request):
    ip = client_ip(request)
    ua_str = request.headers.get("user-agent", "")[:500]
    ua = parse_ua(ua_str)
    utm = {k: str(v)[:200] for k, v in (body.utm or {}).items() if k in ("source", "medium", "campaign", "term", "content")}
    existing = visitors.find_one({"visitor_id": body.visitor_id}, {"_id": 1})
    update = {
        "$set": {
            "last_seen": now_iso(), "ip": ip, "geo": lookup_geo(ip), "user_agent": ua_str,
            "browser": f"{ua.browser.family} {ua.browser.version_string}".strip(),
            "os": f"{ua.os.family} {ua.os.version_string}".strip(),
            "device": "Mobile" if ua.is_mobile else "Tablet" if ua.is_tablet else "Bot" if ua.is_bot else "Desktop",
            "domain": body.domain, "language": body.language, "languages": body.languages[:10],
            "timezone": body.timezone, "screen": body.screen,
        },
        "$push": {"pages": {"$each": [{"path": body.path, "at": now_iso()}], "$slice": -100}},
        "$inc": {"page_views": 1},
    }
    if not existing:
        update["$set"].update({"first_seen": now_iso(), "referrer": body.referrer, "utm": utm,
                               "source": classify_source(body.referrer, utm)})
    visitors.update_one({"visitor_id": body.visitor_id}, update, upsert=True)
    return {"ok": True}


@app.post("/api/track/sections")
def track_sections(body: TrackSections):
    secs = [s[:60] for s in body.sections]
    visitors.update_one({"visitor_id": body.visitor_id}, {"$addToSet": {"sections": {"$each": secs}}})
    return {"ok": True}


@app.delete("/api/track/{visitor_id}")
def forget_visitor(visitor_id: str):
    visitors.delete_one({"visitor_id": visitor_id})
    return {"ok": True}


# ---------- Email ----------

def send_email(subject: str, html_content: str, reply_to: Optional[dict] = None) -> bool:
    if not BREVO_API_KEY:
        logger.warning("BREVO_API_KEY not configured - email skipped")
        return False
    conf = sib_api_v3_sdk.Configuration()
    conf.api_key["api-key"] = BREVO_API_KEY
    api = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(conf))
    msg = sib_api_v3_sdk.SendSmtpEmail(to=[{"email": SUPPORT_EMAIL, "name": "Beskar Support"}],
                                       sender={"email": SENDER_EMAIL, "name": SENDER_NAME},
                                       reply_to=reply_to, subject=subject, html_content=html_content)
    try:
        api.send_transac_email(msg)
        return True
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        return False


def visitor_rows(v: dict) -> str:
    e = lambda x: html.escape(str(x or "—"))
    geo = v.get("geo") or {}
    rows = [("Visitor ID", v.get("visitor_id")), ("IP", v.get("ip")),
            ("Location", ", ".join(filter(None, [geo.get("city"), geo.get("region"), geo.get("country")]))),
            ("Browser", v.get("browser")), ("OS / Device", f"{v.get('os', '')} / {v.get('device', '')}"),
            ("Domain", v.get("domain")), ("Came from", v.get("source")), ("Referrer", v.get("referrer")),
            ("Language", v.get("language")), ("Time zone", v.get("timezone")),
            ("Pages viewed", ", ".join(dict.fromkeys(p["path"] for p in v.get("pages", [])))),
            ("Sections viewed", ", ".join(v.get("sections", []))), ("First seen", v.get("first_seen"))]
    return "".join(f"<tr><td style='padding:4px 12px 4px 0;color:#64748b'>{e(k)}</td><td>{e(val)}</td></tr>" for k, val in rows)


# ---------- Contact ----------

class ContactForm(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    company: str = Field(default="", max_length=150)
    message: str = Field(min_length=1, max_length=5000)
    recaptcha_token: Optional[str] = Field(default=None, max_length=4096)
    visitor_id: Optional[str] = Field(default=None, max_length=64)


def record_block(who: dict, reason: str, score=None, hostname=None):
    spam_blocks.insert_one({"created_at": now_iso(), "reason": reason, "score": score, "hostname": hostname, **who})


def verify_recaptcha(token: Optional[str], ip: str, user_agent: str, who: dict) -> Optional[float]:
    if not (RECAPTCHA_API_KEY and RECAPTCHA_SITE_KEY and RECAPTCHA_PROJECT_ID):
        logger.warning("reCAPTCHA Enterprise not configured - spam check skipped")
        return None
    if not token:
        record_block(who, "Missing token")
        raise HTTPException(status_code=400, detail="We couldn't verify you're human. Please refresh and try again.")
    event = {"token": token, "siteKey": RECAPTCHA_SITE_KEY, "expectedAction": "contact_submit",
             "userAgent": user_agent, "userIpAddress": ip}
    try:
        r = httpx.post(f"https://recaptchaenterprise.googleapis.com/v1/projects/{RECAPTCHA_PROJECT_ID}/assessments",
                       params={"key": RECAPTCHA_API_KEY}, json={"event": event}, timeout=5)
    except httpx.HTTPError:
        raise HTTPException(status_code=503, detail="Spam check is temporarily unavailable. Please try again.")
    if r.status_code != 200:
        logger.error(f"reCAPTCHA Enterprise error {r.status_code}: {r.text[:300]}")
        raise HTTPException(status_code=503, detail="Spam check is temporarily unavailable. Please try again.")
    a = r.json()
    props, risk = a.get("tokenProperties") or {}, a.get("riskAnalysis") or {}
    score = risk.get("score")
    host_ok = not RECAPTCHA_HOSTNAMES or (props.get("hostname") or "").lower() in RECAPTCHA_HOSTNAMES
    if not props.get("valid") or props.get("action") != "contact_submit" or not host_ok \
            or not isinstance(score, (int, float)) or score < RECAPTCHA_MIN_SCORE:
        logger.info(f"reCAPTCHA rejected: valid={props.get('valid')} reason={props.get('invalidReason')} "
                    f"action={props.get('action')} host={props.get('hostname')} score={score} reasons={risk.get('reasons')}")
        reason = (f"Invalid token ({props.get('invalidReason')})" if not props.get("valid")
                  else f"Wrong action ({props.get('action')})" if props.get("action") != "contact_submit"
                  else f"Wrong website ({props.get('hostname')})" if not host_ok else "Low score")
        record_block(who, reason, score if isinstance(score, (int, float)) else None, props.get("hostname"))
        raise HTTPException(status_code=400, detail="We couldn't verify you're human. Please try again.")
    return score


@app.post("/api/contact")
def submit_contact(form: ContactForm, request: Request):
    ip = client_ip(request)
    score = verify_recaptcha(form.recaptcha_token, ip, request.headers.get("user-agent", "")[:500],
                             {"ip": ip, "name": form.name, "email": form.email})
    visitor = visitors.find_one({"visitor_id": form.visitor_id}, {"_id": 0}) if form.visitor_id else None
    doc = {"name": form.name, "email": form.email, "company": form.company, "message": form.message,
           "created_at": now_iso(), "client_ip": ip, "recaptcha_score": score,
           "visitor_id": form.visitor_id if visitor else None, "visitor": visitor}
    contact_id = str(contacts.insert_one(doc).inserted_id)
    e = html.escape
    body = f"""<div style="font-family:Arial,sans-serif;max-width:640px">
      <h2 style="color:#0ea5e9">New Contact Form Submission</h2>
      <p><b>Name:</b> {e(form.name)}<br><b>Email:</b> {e(form.email)}<br><b>Company:</b> {e(form.company or 'Not provided')}</p>
      <p><b>Message:</b></p><p style="white-space:pre-wrap">{e(form.message)}</p>
      <p style="color:#64748b">reCAPTCHA score: {score if score is not None else "not configured"} &middot; IP: {e(ip)}</p>
      <h3>Visitor details</h3>
      {('<table style="font-size:13px">' + visitor_rows(visitor) + '</table>') if visitor else '<p>Visitor did not accept cookies, so no browsing details were collected.</p>'}
    </div>"""
    sent = send_email(f"New Contact: {form.name} - {form.company or 'Individual'}", body, {"email": form.email, "name": form.name})
    return {"success": True, "id": contact_id, "email_sent": sent,
            "message": f"Thank you for reaching out. Our team at {SUPPORT_EMAIL} will be in touch soon."}


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "This is the way"}


@app.get("/api/support-email")
def get_support_email():
    return {"email": SUPPORT_EMAIL}


# ---------- Admin auth ----------

def hash_pw(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()


def check_pw(p: str, h: str) -> bool:
    return bcrypt.checkpw(p.encode(), h.encode())


def ensure_setup():
    admins.create_index("email", unique=True)
    login_attempts.create_index("identifier")
    visitors.create_index("visitor_id", unique=True)
    visitors.create_index([("last_seen", DESCENDING)])
    contacts.create_index([("created_at", DESCENDING)])
    spam_blocks.create_index([("created_at", DESCENDING)])
    existing = admins.find_one({"email": ADMIN_EMAIL})
    if not existing:
        admins.insert_one({"email": ADMIN_EMAIL, "password_hash": hash_pw(ADMIN_PASSWORD), "role": "admin", "created_at": now_iso()})
    elif not check_pw(ADMIN_PASSWORD, existing["password_hash"]):
        admins.update_one({"email": ADMIN_EMAIL}, {"$set": {"password_hash": hash_pw(ADMIN_PASSWORD)}})


ensure_setup()


@app.on_event("startup")
def startup():
    cleanup_old_data()
    start_scheduler()


class LoginBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


def current_admin(request: Request) -> dict:
    token = request.cookies.get("admin_token")
    auth = request.headers.get("Authorization", "")
    if not token and auth.startswith("Bearer "):
        token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Session expired, please log in again")
    user = admins.find_one({"_id": ObjectId(payload["sub"])}, {"password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"id": str(user["_id"]), "email": user["email"], "role": user["role"]}


@app.post("/api/auth/login")
def login(body: LoginBody, request: Request, response: Response):
    email = body.email.lower()
    ident = f"{client_ip(request)}:{email}"
    att = login_attempts.find_one({"identifier": ident})
    if att and datetime.fromisoformat(att["last"]) <= datetime.now(timezone.utc) - timedelta(minutes=15):
        login_attempts.delete_one({"identifier": ident})
    elif att and att.get("count", 0) >= 5:
        raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
    user = admins.find_one({"email": email})
    if not user or not check_pw(body.password, user["password_hash"]):
        login_attempts.update_one({"identifier": ident}, {"$inc": {"count": 1}, "$set": {"last": now_iso()}}, upsert=True)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    login_attempts.delete_one({"identifier": ident})
    token = jwt.encode({"sub": str(user["_id"]), "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=12)},
                       JWT_SECRET, algorithm="HS256")
    response.set_cookie("admin_token", token, httponly=True, secure=True, samesite="lax", max_age=43200, path="/")
    return {"email": email, "role": user["role"], "token": token}


@app.post("/api/auth/logout")
def logout(response: Response):
    response.delete_cookie("admin_token", path="/")
    return {"ok": True}


@app.get("/api/auth/me")
def me(admin: dict = Depends(current_admin)):
    return admin


# ---------- Admin data ----------

@app.get("/api/admin/visitors")
def list_visitors(limit: int = 200, admin: dict = Depends(current_admin)):
    items = list(visitors.find({}, {"_id": 0}).sort("last_seen", DESCENDING).limit(min(limit, 1000)))
    return {"visitors": items, "total": visitors.count_documents({})}


@app.get("/api/admin/contacts")
def list_contacts(limit: int = 200, admin: dict = Depends(current_admin)):
    items = []
    for c in contacts.find({}).sort("created_at", DESCENDING).limit(min(limit, 1000)):
        c["id"] = str(c.pop("_id"))
        items.append(c)
    return {"contacts": items}


@app.get("/api/admin/stats")
def admin_stats(admin: dict = Depends(current_admin)):
    def top(field, unwind=False, limit=8):
        pipe = ([{"$unwind": f"${field}"}] if unwind else []) + [
            {"$match": {field: {"$nin": [None, ""]}}},
            {"$group": {"_id": f"${field}", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}, {"$limit": limit}]
        return [{"label": d["_id"], "count": d["count"]} for d in visitors.aggregate(pipe)]
    scores = [c["recaptcha_score"] for c in contacts.find({"recaptcha_score": {"$ne": None}}, {"recaptcha_score": 1})]
    blocks = list(spam_blocks.find({}, {"_id": 0}).sort("created_at", DESCENDING).limit(200))
    return {
        "countries": top("geo.country"), "sources": top("source"), "sections": top("sections", unwind=True, limit=10),
        "spam": {"accepted": contacts.count_documents({}), "blocked": spam_blocks.count_documents({}),
                 "avg_score": round(sum(scores) / len(scores), 2) if scores else None,
                 "unscored": contacts.count_documents({"recaptcha_score": None}),
                 "min_score": RECAPTCHA_MIN_SCORE, "blocks": blocks},
        "retention_days": RETENTION_DAYS,
    }


RETENTION_DAYS = 365


def cleanup_old_data() -> dict:
    cutoff = (datetime.now(timezone.utc) - timedelta(days=RETENTION_DAYS)).isoformat()
    result = {
        "visitors": visitors.delete_many({"last_seen": {"$lt": cutoff}}).deleted_count,
        "geo_cache": geo_cache.delete_many({"at": {"$lt": cutoff}}).deleted_count,
        "spam_blocks": spam_blocks.delete_many({"created_at": {"$lt": cutoff}}).deleted_count,
        "contact_snapshots": contacts.update_many({"created_at": {"$lt": cutoff}, "$or": [{"visitor": {"$ne": None}}, {"client_ip": {"$ne": None}}]},
                                                  {"$set": {"visitor": None, "visitor_id": None, "client_ip": None}}).modified_count,
    }
    logger.info(f"Retention cleanup: {result}")
    return result


def daily_job():
    cleanup_old_data()
    send_digest()


def send_digest(hours: int = 24) -> dict:
    since = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
    recent = list(visitors.find({"last_seen": {"$gte": since}}, {"_id": 0}).sort("last_seen", DESCENDING).limit(500))
    msgs = contacts.count_documents({"created_at": {"$gte": since}})
    blocks = "".join(f"<table style='font-size:13px;border-top:1px solid #e2e8f0;margin-top:12px'>{visitor_rows(v)}</table>" for v in recent)
    body = f"""<div style="font-family:Arial,sans-serif;max-width:680px"><h2 style="color:#0ea5e9">Beskar visitor log — last {hours}h</h2>
      <p><b>{len(recent)}</b> visitors (who accepted cookies) &middot; <b>{msgs}</b> contact messages</p>{blocks or '<p>No visitors in this period.</p>'}</div>"""
    sent = send_email(f"Beskar visitor log: {len(recent)} visitors in the last {hours}h", body)
    return {"sent": sent, "visitors": len(recent), "contacts": msgs}


@app.post("/api/admin/send-digest")
def admin_send_digest(admin: dict = Depends(current_admin)):
    return send_digest()


@app.get("/api/cron/digest")
def cron_digest(authorization: str = Header(default="")):
    if not CRON_SECRET or not secrets.compare_digest(authorization, f"Bearer {CRON_SECRET}"):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"cleanup": cleanup_old_data(), **send_digest()}


_scheduler = None


def start_scheduler():
    global _scheduler
    if _scheduler or os.environ.get("VERCEL"):
        return
    from apscheduler.schedulers.background import BackgroundScheduler
    _scheduler = BackgroundScheduler(timezone="Asia/Kolkata")
    _scheduler.add_job(daily_job, "cron", hour=9, minute=0)
    _scheduler.start()
