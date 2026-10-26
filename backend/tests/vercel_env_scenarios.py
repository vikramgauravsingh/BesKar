# Vercel cold-start resilience check: imports /app/frontend/api/index.py under the env given by the caller
# (run with `env -i VERCEL=1 ... <venv>/bin/python this_file <scenario>`) and checks no import crash + 503/200 behaviour.
# Scenarios: missing_jwt | bad_mongo | full
import os, sys, time
scenario = sys.argv[1]
sys.path.insert(0, "/app/frontend/api")
os.chdir("/tmp")
results = []
def check(name, cond, extra=""):
    results.append(bool(cond)); print(("PASS " if cond else "FAIL ") + name + (f" -> {extra}" if extra else ""))
t0 = time.time()
try:
    import index
    check("import does not crash", True, f"{time.time()-t0:.1f}s")
except Exception as e:
    check("import does not crash", False, repr(e)); sys.exit(1)
from starlette.testclient import TestClient
c = TestClient(index.app)  # no context manager: Vercel may not run lifespan/startup
if scenario == "missing_jwt":
    r = c.get("/api/health"); j = r.json()
    check("health 503 lists JWT_SECRET", r.status_code == 503 and "JWT_SECRET" in j["missing_settings"] and j["status"] == "misconfigured", r.text)
    r = c.post("/api/auth/login", json={"email": "a@b.com", "password": "x"})
    check("login 503", r.status_code == 503 and "not fully configured" in r.json()["detail"], f"{r.status_code} {r.text}")
    r = c.get("/api/admin/stats"); check("admin stats 503", r.status_code == 503, str(r.status_code))
    r = c.post("/api/track/visit", json={"visitor_id": "TEST_vid_123456", "domain": "x.com", "path": "/"})
    check("track 503", r.status_code == 503, str(r.status_code))
elif scenario == "bad_mongo":
    t = time.time(); r = c.get("/api/health"); j = r.json()
    check("health 503 database unreachable", r.status_code == 503 and j["database"] == "unreachable" and j["missing_settings"] == [], f"{r.text} ({time.time()-t:.1f}s)")
    t = time.time()
    try:
        r = c.post("/api/auth/login", json={"email": "admin@example.com", "password": "x"})
        print(f"INFO login with unreachable DB -> {r.status_code} {r.text[:150]} ({time.time()-t:.1f}s)")
    except Exception as e:
        print(f"INFO login with unreachable DB raised {type(e).__name__} ({time.time()-t:.1f}s) -> would be a 500")
    check("setup not marked done", index._setup_done is False)
elif scenario == "full":
    r = c.get("/api/health"); check("health 200", r.status_code == 200 and r.json()["status"] == "healthy" and r.json()["database"] == "connected", r.text)
    r = c.post("/api/auth/login", json={"email": os.environ["ADMIN_EMAIL"].upper(), "password": os.environ["ADMIN_PASSWORD"]})
    check("login uppercased email 200", r.status_code == 200 and "token" in r.json(), r.text[:120])
    tok = r.json().get("token", ""); c.cookies.clear()
    r = c.get("/api/admin/stats", headers={"Authorization": f"Bearer {tok}"}); check("admin stats bearer 200", r.status_code == 200 and "spam" in r.json(), str(r.status_code))
    c.cookies.clear(); r = c.get("/api/admin/stats"); check("admin stats no token 401", r.status_code == 401, str(r.status_code))
    r = c.post("/api/auth/login", json={"email": os.environ["ADMIN_EMAIL"], "password": "wrong"}); check("bad login 401", r.status_code == 401)
    check("admin seeded lowercase", index.admins.find_one({"email": os.environ["ADMIN_EMAIL"].strip().lower()}) is not None)
    check("scheduler not started", index._scheduler is None)
    from pymongo import MongoClient
    MongoClient("mongodb://localhost:27017").drop_database("beskarit_vtest")
    check("beskarit_vtest dropped", "beskarit_vtest" not in MongoClient("mongodb://localhost:27017").list_database_names())
print(f"[{scenario}] {sum(results)}/{len(results)} passed")
