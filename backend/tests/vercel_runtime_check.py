# Vercel serverless runtime check: imports /app/frontend/api/index.py under a given Python venv
# and exercises key endpoints via starlette TestClient. Run: cd /app/frontend/api && <venv>/bin/python -W error::DeprecationWarning? (no) this file
import os, sys, warnings
warnings.simplefilter("always")
os.environ.update({"MONGO_URL": "mongodb://localhost:27017", "DB_NAME": "beskarit_vtest",
                   "SUPPORT_EMAIL": "support@example.com", "SENDER_EMAIL": "noreply@example.com",
                   "JWT_SECRET": "dummy-secret-for-tests-only-0123456789", "ADMIN_EMAIL": "admin@example.com",
                   "ADMIN_PASSWORD": "DummyPass123!", "VERCEL": "1"})
sys.path.insert(0, "/app/frontend/api")
os.chdir("/app/frontend/api")
results = []
def check(name, cond, extra=""):
    results.append(cond); print(("PASS " if cond else "FAIL ") + name + (f" -> {extra}" if extra else ""))
with warnings.catch_warnings(record=True) as w:
    import index
    from starlette.testclient import TestClient
    with TestClient(index.app) as c:
        r = c.get("/api/health"); check("health", r.status_code == 200 and r.json()["status"] == "healthy", r.text)
        r = c.post("/api/track/visit", json={"visitor_id": "TEST_vid_123456", "domain": "x.com", "path": "/"})
        check("track visit", r.status_code == 200, r.text[:200])
        r = c.post("/api/contact", json={"name": "TEST", "email": "t@example.com", "message": "Hello there from test", "visitor_id": "TEST_vid_123456"})
        check("contact valid", r.status_code == 200 and r.json().get("success") is True, r.text[:200])
        r = c.post("/api/contact", json={"name": "TEST", "email": "bad-email", "message": "Hello there"})
        check("contact invalid 422", r.status_code == 422, str(r.status_code))
        r = c.post("/api/auth/login", json={"email": "admin@example.com", "password": "DummyPass123!"})
        check("login", r.status_code == 200 and "token" in r.json(), r.text[:120])
        tok = r.json().get("token", "")
        c.cookies.clear()
        for p in ["/api/admin/stats", "/api/admin/visitors", "/api/admin/contacts", "/api/auth/me"]:
            r1 = c.get(p, headers={"Authorization": f"Bearer {tok}"}); check(f"{p} with token", r1.status_code == 200, str(r1.status_code))
            c.cookies.clear()
            r2 = c.get(p); check(f"{p} no token 401", r2.status_code == 401, str(r2.status_code))
        r = c.post("/api/auth/login", json={"email": "admin@example.com", "password": "wrong"})
        check("bad login 401", r.status_code == 401, str(r.status_code))
        r = c.get("/api/cron/digest"); check("cron no auth 401", r.status_code == 401, str(r.status_code))
        check("scheduler not started on VERCEL", index._scheduler is None)
        h = index.admins.find_one({"email": "admin@example.com"})["password_hash"]
        check("bcrypt $2b$", h.startswith("$2b$"))
    print("WARNINGS:", [f"{x.category.__name__}: {str(x.message)[:150]}" for x in w])
from pymongo import MongoClient
MongoClient("mongodb://localhost:27017").drop_database("beskarit_vtest")
print("DB dropped:", "beskarit_vtest" not in MongoClient("mongodb://localhost:27017").list_database_names())
print(f"Python {sys.version.split()[0]}: {sum(results)}/{len(results)} passed")
