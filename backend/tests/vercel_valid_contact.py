# Vercel runtime with valid local Mongo: health 200 and contact POST 200 JSON (reCAPTCHA/Brevo unset -> skipped). Drops beskarit_vtest.
import os, sys
sys.path.insert(0, "/app/frontend/api"); os.chdir("/tmp")
import index
from starlette.testclient import TestClient
from pymongo import MongoClient
c = TestClient(index.app, raise_server_exceptions=False)
res = []
def chk(n, cond, x=""):
    res.append(bool(cond)); print(("PASS " if cond else "FAIL ") + n + " -> " + x)
r = c.get("/api/health"); chk("health 200", r.status_code == 200 and r.json()["status"] == "healthy", r.text)
r = c.post("/api/contact", json={"name": "Vtest", "email": "vtest@example.com", "company": "ACME", "message": "hello test message"})
chk("contact 200 success", r.status_code == 200 and r.json().get("success") is True and isinstance(r.json().get("id"), str), r.text[:200])
cid = r.json().get("id")
chk("contact persisted", index.contacts.find_one({"email": "vtest@example.com"}) is not None)
r = c.post("/api/contact", json={"name": "", "email": "bad", "message": ""}); chk("invalid contact 422 json", r.status_code == 422 and "detail" in r.json(), str(r.status_code))
m = MongoClient("mongodb://localhost:27017"); m.drop_database("beskarit_vtest")
chk("dropped", "beskarit_vtest" not in m.list_database_names())
print(f"{sum(res)}/{len(res)} passed")
