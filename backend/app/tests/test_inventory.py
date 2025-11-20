"""Test inventory/tag endpoints."""
from fastapi.testclient import TestClient


def test_agent_crud(client: TestClient, admin_headers):
    resp = client.post(
        "/api/agents",
        headers=admin_headers,
        json={"name": "agent-api", "vm_hostname": "agent-api.local", "os_type": "linux", "architecture": "amd64"},
    )
    assert resp.status_code == 201
    agent = resp.json()

    get_resp = client.get(f"/api/agents/{agent['id']}", headers=admin_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == "agent-api"

    list_resp = client.get("/api/agents", headers=admin_headers)
    assert list_resp.status_code == 200
    assert any(r["id"] == agent["id"] for r in list_resp.json())

    upd_resp = client.put(
        f"/api/agents/{agent['id']}",
        headers=admin_headers,
        json={"status": "maintenance"},
    )
    assert upd_resp.status_code == 200
    assert upd_resp.json()["status"] == "maintenance"

    del_resp = client.delete(f"/api/agents/{agent['id']}", headers=admin_headers)
    assert del_resp.status_code == 204


def test_tool_and_toolchain_flow(client: TestClient, admin_headers):
    tool_resp = client.post(
        "/api/tools",
        headers=admin_headers,
        json={"name": "Node.js", "type": "binary", "category": "language_runtime"},
    )
    assert tool_resp.status_code == 201
    tool = tool_resp.json()

    tc_resp = client.post(
        "/api/toolchains",
        headers=admin_headers,
        json={"name": "default-ci", "description": "core"},
    )
    assert tc_resp.status_code == 201
    toolchain = tc_resp.json()

    set_resp = client.put(
        f"/api/toolchains/{toolchain['id']}/tools",
        headers=admin_headers,
        json={"tool_ids": [tool["id"]]},
    )
    assert set_resp.status_code == 200

    list_resp = client.get("/api/toolchains", headers=admin_headers)
    assert list_resp.status_code == 200
    assert any(tc["id"] == toolchain["id"] for tc in list_resp.json())


def test_tag_uniqueness(client: TestClient, admin_headers):
    first = client.post("/api/tags", headers=admin_headers, json={"name": "outage"})
    assert first.status_code == 201
    dup = client.post("/api/tags", headers=admin_headers, json={"name": "outage"})
    assert dup.status_code == 409
