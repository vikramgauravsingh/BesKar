# Tests: admin stats API (charts + spam), reCAPTCHA block recording (unit, mocked), 365-day retention cleanup (cron + unit)
import os
import sys
import uuid
from datetime import datetime, timezone, timedelta
from unittest.mock import patch, MagicMock

import pytest
import requests
from fastapi import HTTPException
from pymongo import MongoClient
from dotenv import dotenv_values

FE_ENV = dotenv_values("/app/frontend/.env")
BE_ENV = dotenv_values("/app/backend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or FE_ENV["REACT_APP_BACKEND_URL"]).rstrip("/")
ADMIN_EMAIL = "support@beskarit.com"
ADMIN_PASSWORD = "zMJlbbYHynU4ATOF"
CRON_SECRET = BE_ENV["CRON_SECRET"]
db = MongoClient(BE_ENV["MONGO_URL"])[BE_ENV["DB_NAME"]]

sys.path.insert(0, "/app/backend")
os.chdir("/app/backend")
import server  # noqa: E402


def iso_days_ago(d):
    return (datetime.now(timezone.utc) - timedelta(days=d)).isoformat()


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"admin login failed {r.status_code}")
    return s


@pytest.fixture(scope="module", autouse=True)
def cleanup():
    yield
    db.visitors.delete_many({"visitor_id": {"$regex": "^TEST_RET"}})
    db.geo_cache.delete_many({"ip": {"$regex": "^TEST_RET"}})
    db.spam_blocks.delete_many({"email": {"$regex": "^test_unit_"}})
    db.spam_blocks.delete_many({"name": {"$regex": "^TEST_RET"}})
    db.contacts.delete_many({"name": {"$regex": "^TEST_RET"}})


# ---------- /api/admin/stats ----------
class TestStats:
    def test_stats_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/admin/stats")
        assert r.status_code == 401

    def test_stats_structure(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/admin/stats")
        assert r.status_code == 200
        d = r.json()
        assert d["retention_days"] == 365
        for k in ("countries", "sources", "sections"):
            assert isinstance(d[k], list)
            for i in d[k]:
                assert set(i.keys()) == {"label", "count"} and isinstance(i["count"], int)
        sp = d["spam"]
        for k in ("accepted", "blocked", "avg_score", "unscored", "min_score", "blocks"):
            assert k in sp
        assert sp["min_score"] == 0.5
        assert sp["accepted"] == db.contacts.count_documents({})
        assert sp["blocked"] == db.spam_blocks.count_documents({})
        assert any(b.get("email") == "test-bot@x.com" for b in sp["blocks"])
        assert all("_id" not in b for b in sp["blocks"])
        assert sp["avg_score"] is not None  # TEST Score contact has 0.9

    def test_stats_sections_limit_and_sorted(self, admin_session):
        d = admin_session.get(f"{BASE_URL}/api/admin/stats").json()
        assert len(d["sections"]) <= 10 and len(d["countries"]) <= 8
        counts = [i["count"] for i in d["sources"]]
        assert counts == sorted(counts, reverse=True)

    def test_contacts_include_score(self, admin_session):
        cs = admin_session.get(f"{BASE_URL}/api/admin/contacts").json()["contacts"]
        t = [c for c in cs if c["email"] == "test-score@x.com"]
        assert t and t[0]["recaptcha_score"] == 0.9


# ---------- verify_recaptcha / record_block (mocked Google) ----------
WHO = {"ip": "1.2.3.4", "name": "TEST_RET unit", "email": None}


def resp(valid=True, action="contact_submit", host="beskarit.com", score=0.9, status=200):
    m = MagicMock()
    m.status_code = status
    m.text = ""
    m.json.return_value = {"tokenProperties": {"valid": valid, "action": action, "hostname": host,
                                               "invalidReason": None if valid else "EXPIRED"},
                           "riskAnalysis": {"score": score}}
    return m


@pytest.fixture
def configured(monkeypatch):
    monkeypatch.setattr(server, "RECAPTCHA_API_KEY", "k")
    monkeypatch.setattr(server, "RECAPTCHA_SITE_KEY", "s")
    monkeypatch.setattr(server, "RECAPTCHA_PROJECT_ID", "p")
    monkeypatch.setattr(server, "RECAPTCHA_HOSTNAMES", {"beskarit.com"})


def run_block(case, mock_resp=None, token="tok"):
    who = dict(WHO, email=f"test_unit_{case}@x.com")
    with patch.object(server.httpx, "post", return_value=mock_resp):
        with pytest.raises(HTTPException) as e:
            server.verify_recaptcha(token, "1.2.3.4", "ua", who)
    assert e.value.status_code == 400
    row = db.spam_blocks.find_one({"email": who["email"]})
    assert row is not None
    return row


class TestRecaptchaBlocks:
    def test_unconfigured_skips(self):
        assert server.verify_recaptcha(None, "1.1.1.1", "ua", WHO) is None

    def test_missing_token(self, configured):
        row = run_block("missing", token=None)
        assert row["reason"] == "Missing token" and row["score"] is None

    def test_invalid_token(self, configured):
        row = run_block("invalid", resp(valid=False))
        assert row["reason"].startswith("Invalid token")

    def test_low_score(self, configured):
        row = run_block("low", resp(score=0.1))
        assert row["reason"] == "Low score" and row["score"] == 0.1 and row["hostname"] == "beskarit.com"

    def test_wrong_host(self, configured):
        row = run_block("host", resp(host="evil.com"))
        assert row["reason"].startswith("Wrong website")

    def test_wrong_action(self, configured):
        row = run_block("action", resp(action="login"))
        assert row["reason"].startswith("Wrong action")

    def test_good_score_passes(self, configured):
        with patch.object(server.httpx, "post", return_value=resp(score=0.9)):
            assert server.verify_recaptcha("tok", "1.2.3.4", "ua", dict(WHO, email="test_unit_ok@x.com")) == 0.9
        assert db.spam_blocks.find_one({"email": "test_unit_ok@x.com"}) is None

    def test_google_error_503_no_block(self, configured):
        with patch.object(server.httpx, "post", return_value=resp(status=500)):
            with pytest.raises(HTTPException) as e:
                server.verify_recaptcha("tok", "1.2.3.4", "ua", dict(WHO, email="test_unit_503@x.com"))
        assert e.value.status_code == 503


# ---------- retention cleanup ----------
def seed_old():
    vid_old, vid_new = f"TEST_RET_old_{uuid.uuid4().hex[:6]}", f"TEST_RET_new_{uuid.uuid4().hex[:6]}"
    db.visitors.insert_many([{"visitor_id": vid_old, "last_seen": iso_days_ago(400)},
                             {"visitor_id": vid_new, "last_seen": iso_days_ago(10)}])
    db.geo_cache.insert_many([{"ip": "TEST_RET_old", "geo": {}, "at": iso_days_ago(400)},
                              {"ip": "TEST_RET_new", "geo": {}, "at": iso_days_ago(1)}])
    db.spam_blocks.insert_many([{"name": "TEST_RET_old", "created_at": iso_days_ago(400)},
                                {"name": "TEST_RET_new", "created_at": iso_days_ago(1)}])
    db.contacts.insert_many([{"name": "TEST_RET_old", "email": "a@x.com", "message": "m", "created_at": iso_days_ago(400), "visitor": {"ip": "x"}},
                             {"name": "TEST_RET_new", "email": "b@x.com", "message": "m", "created_at": iso_days_ago(1), "visitor": {"ip": "y"}}])
    return vid_old, vid_new


def assert_cleaned(vid_old, vid_new):
    assert db.visitors.find_one({"visitor_id": vid_old}) is None
    assert db.visitors.find_one({"visitor_id": vid_new}) is not None
    assert db.geo_cache.find_one({"ip": "TEST_RET_old"}) is None
    assert db.geo_cache.find_one({"ip": "TEST_RET_new"}) is not None
    assert db.spam_blocks.find_one({"name": "TEST_RET_old"}) is None
    assert db.spam_blocks.find_one({"name": "TEST_RET_new"}) is not None
    old_c = db.contacts.find_one({"name": "TEST_RET_old"})
    assert old_c is not None and old_c["visitor"] is None
    assert db.contacts.find_one({"name": "TEST_RET_new"})["visitor"] == {"ip": "y"}


class TestRetention:
    def test_cron_unauthorized(self):
        assert requests.get(f"{BASE_URL}/api/cron/digest").status_code == 401
        assert requests.get(f"{BASE_URL}/api/cron/digest", headers={"Authorization": "Bearer nope"}).status_code == 401

    def test_cron_runs_cleanup(self):
        vid_old, vid_new = seed_old()
        r = requests.get(f"{BASE_URL}/api/cron/digest", headers={"Authorization": f"Bearer {CRON_SECRET}"})
        assert r.status_code == 200
        d = r.json()
        assert "cleanup" in d and d["cleanup"]["visitors"] >= 1 and d["cleanup"]["geo_cache"] >= 1
        assert d["cleanup"]["spam_blocks"] >= 1 and d["cleanup"]["contact_snapshots"] >= 1
        assert d["sent"] is False
        assert_cleaned(vid_old, vid_new)

    def test_cleanup_function_direct(self):
        vid_old, vid_new = seed_old()
        res = server.cleanup_old_data()
        assert res["visitors"] >= 1
        assert_cleaned(vid_old, vid_new)

    def test_daily_job_calls_cleanup(self):
        with patch.object(server, "cleanup_old_data") as c, patch.object(server, "send_digest") as s:
            server.daily_job()
        c.assert_called_once() and s.assert_called_once()

    def test_scheduler_job_registered(self):
        # scheduler job config: 9:00 Asia/Kolkata
        import inspect
        src = inspect.getsource(server.start_scheduler)
        assert 'hour=9' in src and 'Asia/Kolkata' in src and 'daily_job' in src
