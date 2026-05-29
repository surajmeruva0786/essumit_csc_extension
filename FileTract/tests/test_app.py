import os
import sys

os.environ["RATELIMIT_ENABLED"] = "false"

PROJECT_DIR = os.path.dirname(os.path.dirname(__file__))
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

import local_db
from app import app


def setup_test_db(tmp_path):
    local_db.DB_PATH = os.path.join(tmp_path, "desktop_apps.db")
    local_db.init_db()
    local_db.cache.delete_pattern("filetract:local_db:*")


def test_health_check_reports_backend_status():
    client = app.test_client()

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.get_json()["status"] == "healthy"


def test_applications_can_be_saved_and_listed(tmp_path):
    setup_test_db(tmp_path)
    client = app.test_client()

    response = client.post(
        "/api/desktop/applications",
        json={
            "id": "REFTEST001",
            "name": "Test Citizen",
            "service": "Income Certificate",
            "riskScore": 12,
            "fields_json": {"income": "100000"},
        },
    )
    assert response.status_code == 200
    assert response.get_json()["id"] == "REFTEST001"

    list_response = client.get("/api/desktop/applications")
    applications = list_response.get_json()

    assert list_response.status_code == 200
    assert applications[0]["id"] == "REFTEST001"
    assert applications[0]["fields_json"]["income"] == "100000"


def test_staged_sync_flow_returns_selected_application(tmp_path):
    setup_test_db(tmp_path)
    local_db.save_application(
        {
            "id": "REFSYNC001",
            "name": "Sync Citizen",
            "service": "Domicile",
            "fields_json": {"district": "Raipur"},
        }
    )
    client = app.test_client()

    stage_response = client.post("/api/sync/stage", json={"application_id": "REFSYNC001"})
    staged_response = client.get("/api/sync/get_staged")

    assert stage_response.status_code == 200
    assert staged_response.status_code == 200
    assert staged_response.get_json()["data"]["id"] == "REFSYNC001"


def test_upload_rejects_missing_files():
    client = app.test_client()

    response = client.post("/api/upload", data={})

    assert response.status_code == 400
    assert "No files provided" in response.get_json()["error"]
