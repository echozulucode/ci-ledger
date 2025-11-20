from datetime import datetime, timedelta

from fastapi.testclient import TestClient


def _create_agent(client: TestClient, admin_headers):
    resp = client.post(
        "/api/agents",
        headers=admin_headers,
        json={"name": "agent-1", "vm_hostname": "agent-1.local", "os_type": "linux", "architecture": "amd64"},
    )
    assert resp.status_code == 201
    return resp.json()


def _create_tool(client: TestClient, admin_headers):
    resp = client.post(
        "/api/tools",
        headers=admin_headers,
        json={"name": "Python", "type": "python_package", "category": "language_runtime"},
    )
    assert resp.status_code == 201
    return resp.json()


def _create_tag(client: TestClient, admin_headers, name="outage"):
    resp = client.post("/api/tags", headers=admin_headers, json={"name": name})
    assert resp.status_code == 201
    return resp.json()


def test_event_crud_flow(client: TestClient, admin_headers):
    agent = _create_agent(client, admin_headers)
    tool = _create_tool(client, admin_headers)
    tag = _create_tag(client, admin_headers)

    payload = {
        "title": "Python upgraded",
        "description": "Upgrade to 3.11",
        "timestamp": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
        "event_type": "tool_update",
        "severity": "warning",
        "source": "automated",
        "agent_ids": [agent["id"]],
        "tool_versions": [
            {
                "tool_id": tool["id"],
                "version_from": "3.10.8",
                "version_to": "3.11.2",
            }
        ],
        "tag_ids": [tag["id"]],
    }

    # Create
    resp = client.post("/api/events", headers=admin_headers, json=payload)
    assert resp.status_code == 201, resp.text
    event = resp.json()
    assert event["title"] == payload["title"]

    # List with filter
    list_resp = client.get("/api/events", headers=admin_headers, params={"agent_id": agent["id"]})
    assert list_resp.status_code == 200
    assert any(e["id"] == event["id"] for e in list_resp.json())

    # Update severity
    update_resp = client.put(
        f"/api/events/{event['id']}",
        headers=admin_headers,
        json={"severity": "critical"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["severity"] == "critical"

    # Delete
    del_resp = client.delete(f"/api/events/{event['id']}", headers=admin_headers)
    assert del_resp.status_code == 204

    # Ensure gone
    get_resp = client.get(f"/api/events/{event['id']}", headers=admin_headers)
    assert get_resp.status_code == 404


def test_non_admin_cannot_create_event(client: TestClient, auth_headers):
    resp = client.post(
        "/api/events",
        headers=auth_headers,
        json={
            "title": "should fail",
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "outage",
            "severity": "info",
            "source": "manual",
        },
    )
    assert resp.status_code == 403
