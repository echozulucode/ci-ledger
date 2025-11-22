import hmac
import hashlib
import json
from datetime import datetime

from fastapi import status

from app.core.config import settings


def _signature(secret: str, body: bytes) -> str:
    return "sha256=" + hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()


def test_rejects_missing_signature_when_secret_set(client, session):
    settings.WEBHOOK_HMAC_SECRET = "topsecret"
    payload = {
        "job_name": "build-api",
        "build_number": 42,
        "status": "SUCCESS",
    }
    response = client.post("/api/webhooks/jenkins", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_ingests_jenkins_webhook_and_creates_event(client, admin_headers, session):
    settings.WEBHOOK_HMAC_SECRET = "topsecret"
    payload = {
        "job_name": "build-api",
        "build_number": 42,
        "status": "FAILURE",
        "agent": "agent-1",
        "message": "Build failed",
        "tools": [{"name": "node", "version": "20.10.0"}],
        "tags": ["rollout"],
        "timestamp": datetime.utcnow().isoformat(),
    }
    body = json.dumps(payload).encode("utf-8")
    sig = _signature(settings.WEBHOOK_HMAC_SECRET, body)

    response = client.post(
        "/api/webhooks/jenkins",
        data=body,
        headers={
            "Content-Type": "application/json",
            "X-Hub-Signature-256": sig,
        },
    )
    assert response.status_code == status.HTTP_202_ACCEPTED
    event = response.json()
    assert event["title"].startswith("Jenkins build-api #42")
    assert event["severity"] == "critical"
    assert event["event_type"] == "outage"
    assert event["agents"][0]["name"] == "agent-1"

    # Verify event shows up in standard listing (auth required)
    list_resp = client.get("/api/events", headers=admin_headers)
    assert list_resp.status_code == 200
    events = list_resp.json()
    assert len(events) == 1
    assert events[0]["source"] == "webhook"
