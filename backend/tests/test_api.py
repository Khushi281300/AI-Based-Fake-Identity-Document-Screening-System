import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.models import init_db

@pytest.fixture(autouse=True)
def setup_database():
    init_db()

def test_health_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ONLINE"
        assert "services" in data

def test_watchlist_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/blacklist/watchlist")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "SUCCESS"
        assert len(data["watchlist"]) >= 1

def test_blockchain_ledger_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/blockchain/ledger/blocks")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "SUCCESS"
        assert data["chain_valid"] is True
