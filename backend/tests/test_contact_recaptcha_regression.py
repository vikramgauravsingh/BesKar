# Regression (preview, reCAPTCHA Enterprise configured): contact without/invalid token -> 400 + spam_blocks row; track visit 200; health
import os, uuid, pytest, requests
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv("/app/backend/.env")
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
db = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]
TAG = f"test-recap-{uuid.uuid4().hex[:6]}@example.com"


@pytest.fixture(scope="module", autouse=True)
def cleanup():
    yield
    db.spam_blocks.delete_many({"email": TAG})
    db.contacts.delete_many({"email": TAG})
    db.visitors.delete_many({"visitor_id": {"$regex": "^TEST_"}})


def test_health():
    r = requests.get(f"{BASE_URL}/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "healthy", "message": "This is the way", "missing_settings": [], "database": "connected"}


def test_contact_missing_token_400_and_block():
    r = requests.post(f"{BASE_URL}/api/contact", json={"name": "TEST", "email": TAG, "message": "hello test"})
    assert r.status_code == 400
    assert "human" in r.json()["detail"]
    assert db.spam_blocks.find_one({"email": TAG, "reason": "Missing token"})


def test_contact_invalid_token_400_and_block():
    r = requests.post(f"{BASE_URL}/api/contact", json={"name": "TEST", "email": TAG, "message": "hello test", "recaptcha_token": "bogus-token"})
    assert r.status_code == 400, r.text
    assert db.spam_blocks.find_one({"email": TAG, "reason": {"$regex": "^Invalid token"}})
    assert db.contacts.count_documents({"email": TAG}) == 0


def test_track_visit():
    r = requests.post(f"{BASE_URL}/api/track/visit", json={"visitor_id": "TEST_vid_" + uuid.uuid4().hex[:8], "domain": "x.com", "path": "/"})
    assert r.status_code == 200 and r.json() == {"ok": True}
