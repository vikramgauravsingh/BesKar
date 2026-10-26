# Vercel cold-start: malformed MONGO_URL must not crash import; health 503 lists MONGO_URL; contact returns JSON 503.
# Run: env -i VERCEL=1 MONGO_URL='<bad>' DB_NAME=x SUPPORT_EMAIL=.. SENDER_EMAIL=.. JWT_SECRET=.. ADMIN_EMAIL=.. ADMIN_PASSWORD=.. /tmp/t314/bin/python this_file
import os, sys, time
sys.path.insert(0, "/app/frontend/api")
os.chdir("/tmp")
print(f"MONGO_URL={os.environ.get('MONGO_URL')!r}")
t0 = time.time()
try:
    import index
    print(f"PASS import ({time.time()-t0:.1f}s) MISSING_ENV={index.MISSING_ENV}")
except BaseException as e:
    print(f"FAIL import crashed: {type(e).__name__}: {e}"); sys.exit(1)
from starlette.testclient import TestClient
c = TestClient(index.app, raise_server_exceptions=False)
t = time.time(); r = c.get("/api/health")
ok = r.status_code == 503 and any(m.startswith("MONGO_URL") for m in r.json().get("missing_settings", []))
print(("PASS" if ok else "FAIL") + f" health {r.status_code} {r.text} ({time.time()-t:.1f}s)")
t = time.time()
r = c.post("/api/contact", json={"name": "Vtest", "email": "vtest@example.com", "company": "", "message": "hello test message here", "recaptcha_token": "x"})
try:
    j = r.json(); isjson = True
except Exception:
    isjson = False
ok = r.status_code == 503 and isjson and "not fully configured" in j.get("detail", "")
print(("PASS" if ok else "FAIL") + f" contact {r.status_code} {r.text[:150]} ({time.time()-t:.1f}s)")
r = c.post("/api/auth/login", json={"email": "a@b.com", "password": "x"})
print(("PASS" if r.status_code == 503 else "FAIL") + f" login {r.status_code}")
