# Regression tests: visitor tracking, contact form (recaptcha skipped w/o keys), admin auth & APIs, cron digest
import os
import uuid
import pytest
import requests
from pymongo import MongoClient
from dotenv import dotenv_values

FE_ENV = dotenv_values("/app/frontend/.env")
BE_ENV = dotenv_values("/app/backend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or FE_ENV["REACT_APP_BACKEND_URL"]).rstrip("/")
ADMIN_EMAIL = "support@beskarit.com"
ADMIN_PASSWORD = "zMJlbbYHynU4ATOF"
CRON_SECRET = BE_ENV["CRON_SECRET"]
db = MongoClient(BE_ENV["MONGO_URL"])[BE_ENV["DB_NAME"]]


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"admin login failed {r.status_code} {r.text}")
    return s


@pytest.fixture(scope="module", autouse=True)
def cleanup():
    yield
    db.visitors.delete_many({"visitor_id": {"$regex": "^TEST_"}})
    db.contacts.delete_many({"name": {"$regex": "^TEST_"}})
    db.login_attempts.delete_many({"identifier": {"$regex": "test_lockout_"}})


def visit(vid, **kw):
    body = {"visitor_id": vid, "domain": "privacy-terms-fix.preview.emergentagent.com", "path": "/",
            "language": "en-US", "languages": ["en-US", "en"], "timezone": "Asia/Kolkata", "screen": "1920x1080"}
    body.update(kw)
    return requests.post(f"{BASE_URL}/api/track/visit", json=body,
                         headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"})


# Health
def test_health():
    r = requests.get(f"{BASE_URL}/api/health")
    assert r.status_code == 200 and r.json()["status"] == "healthy"


# Tracking
def test_track_visit_google_referrer(admin_session):
    vid = f"TEST_{uuid.uuid4().hex[:12]}"
    r = visit(vid, referrer="https://www.google.com/search?q=beskar")
    assert r.status_code == 200 and r.json()["ok"] is True
    r = visit(vid, path="/Privacy-Policy")
    assert r.status_code == 200
    v = db.visitors.find_one({"visitor_id": vid})
    assert v["source"] == "Google"
    assert v["page_views"] == 2
    assert [p["path"] for p in v["pages"]] == ["/", "/Privacy-Policy"]
    assert v["ip"] and v["ip"] != "unknown"
    assert "Chrome" in v["browser"] and "Windows" in v["os"] and v["device"] == "Desktop"
    assert v["language"] == "en-US" and v["timezone"] == "Asia/Kolkata"
    assert v["domain"].startswith("privacy-terms-fix")
    assert isinstance(v.get("geo"), dict)
    print("geo:", v.get("geo"), "ip:", v["ip"])
    # admin API exposes it without _id
    lst = admin_session.get(f"{BASE_URL}/api/admin/visitors").json()
    found = [x for x in lst["visitors"] if x["visitor_id"] == vid]
    assert found and "_id" not in found[0]


def test_track_visit_geo_populated():
    vid = f"TEST_{uuid.uuid4().hex[:12]}"
    visit(vid)
    v = db.visitors.find_one({"visitor_id": vid})
    assert v["geo"].get("country"), f"geo empty for ip {v['ip']}: {v['geo']}"


def test_track_visit_utm_campaign():
    vid = f"TEST_{uuid.uuid4().hex[:12]}"
    r = visit(vid, referrer="https://www.google.com/", utm={"source": "newsletter", "medium": "email", "evil": "x"})
    assert r.status_code == 200
    v = db.visitors.find_one({"visitor_id": vid})
    assert v["source"] == "Campaign: newsletter"
    assert "evil" not in v["utm"]


def test_track_visit_direct_and_validation():
    vid = f"TEST_{uuid.uuid4().hex[:12]}"
    visit(vid)
    assert db.visitors.find_one({"visitor_id": vid})["source"] == "Direct"
    r = visit("short")
    assert r.status_code == 422


def test_track_sections_and_delete():
    vid = f"TEST_{uuid.uuid4().hex[:12]}"
    visit(vid)
    r = requests.post(f"{BASE_URL}/api/track/sections", json={"visitor_id": vid, "sections": ["products", "services", "products"]})
    assert r.status_code == 200
    assert sorted(db.visitors.find_one({"visitor_id": vid})["sections"]) == ["products", "services"]
    r = requests.delete(f"{BASE_URL}/api/track/{vid}")
    assert r.status_code == 200
    assert db.visitors.find_one({"visitor_id": vid}) is None


# Contact
def test_contact_validation():
    r = requests.post(f"{BASE_URL}/api/contact", json={"name": "TEST_x", "email": "bad", "message": "hi"})
    assert r.status_code == 422
    r = requests.post(f"{BASE_URL}/api/contact", json={"email": "a@b.com", "message": "hi"})
    assert r.status_code == 422
    r = requests.post(f"{BASE_URL}/api/contact", json={"name": "TEST_x", "email": "a@b.com", "message": ""})
    assert r.status_code == 422


def test_contact_with_visitor_snapshot(admin_session):
    vid = f"TEST_{uuid.uuid4().hex[:12]}"
    visit(vid, referrer="https://www.bing.com/")
    r = requests.post(f"{BASE_URL}/api/contact", json={"name": "TEST_Snap", "email": "test@example.com",
                                                       "company": "TestCo", "message": "hello", "visitor_id": vid})
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["success"] is True and d["email_sent"] is False and isinstance(d["id"], str)
    lst = admin_session.get(f"{BASE_URL}/api/admin/contacts").json()["contacts"]
    c = next(x for x in lst if x["id"] == d["id"])
    assert c["client_ip"] and c["visitor_id"] == vid
    assert c["visitor"]["source"] == "Bing" and "_id" not in c["visitor"]
    assert c["recaptcha_score"] is None


def test_contact_without_visitor():
    r = requests.post(f"{BASE_URL}/api/contact", json={"name": "TEST_NoVid", "email": "test@example.com",
                                                       "message": "hello", "visitor_id": "TEST_nonexistent"})
    assert r.status_code == 200
    c = db.contacts.find_one({"name": "TEST_NoVid"})
    assert c["visitor"] is None and c["visitor_id"] is None and c["client_ip"]


# Admin auth
def test_admin_apis_require_auth():
    assert requests.get(f"{BASE_URL}/api/admin/visitors").status_code == 401
    assert requests.get(f"{BASE_URL}/api/admin/contacts").status_code == 401
    assert requests.post(f"{BASE_URL}/api/admin/send-digest").status_code == 401
    assert requests.get(f"{BASE_URL}/api/auth/me").status_code == 401
    assert requests.get(f"{BASE_URL}/api/admin/visitors", headers={"Authorization": "Bearer garbage"}).status_code == 401


def test_cron_digest_auth():
    assert requests.get(f"{BASE_URL}/api/cron/digest").status_code == 401
    assert requests.get(f"{BASE_URL}/api/cron/digest", headers={"Authorization": "Bearer wrong"}).status_code == 401
    r = requests.get(f"{BASE_URL}/api/cron/digest", headers={"Authorization": f"Bearer {CRON_SECRET}"})
    assert r.status_code == 200 and r.json()["sent"] is False and "visitors" in r.json()


def test_login_sets_httponly_cookie_and_me():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    sc = r.headers.get("set-cookie", "").lower()
    assert "admin_token=" in sc and "httponly" in sc and "secure" in sc
    tok = r.json()["token"]
    me = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {tok}"})
    assert me.status_code == 200 and me.json()["email"] == ADMIN_EMAIL and me.json()["role"] == "admin"


def test_bcrypt_hash_format():
    a = db.admins.find_one({"email": ADMIN_EMAIL})
    assert a["password_hash"].startswith("$2b$")


def test_wrong_password_401():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "test_lockout_a@example.com", "password": "nope"})
    assert r.status_code == 401 and r.json()["detail"] == "Invalid email or password"


def test_bruteforce_lockout():
    email = f"test_lockout_{uuid.uuid4().hex[:6]}@example.com"
    codes = [requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": "bad"}).status_code for _ in range(6)]
    assert codes[:5] == [401] * 5 and codes[5] == 429, codes


def test_send_digest_authed(admin_session):
    r = admin_session.post(f"{BASE_URL}/api/admin/send-digest")
    assert r.status_code == 200 and r.json()["sent"] is False


def test_logout_clears_cookie():
    s = requests.Session()
    s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert s.get(f"{BASE_URL}/api/auth/me").status_code == 200
    s.post(f"{BASE_URL}/api/auth/logout")
    assert s.get(f"{BASE_URL}/api/auth/me").status_code == 401
