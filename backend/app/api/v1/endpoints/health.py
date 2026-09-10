from fastapi import APIRouter
import time

router = APIRouter()

@router.get("/health", tags=["System"])
async def get_health_status():
    return {
        "status": "ONLINE",
        "system": "AI-Based Fake Identity & Document Screening Grid",
        "version": "1.0.0",
        "timestamp": time.time(),
        "services": {
            "forensics_engine": "ACTIVE",
            "mrz_validator": "ACTIVE",
            "biometric_matcher": "ACTIVE",
            "risk_engine": "ACTIVE",
            "blockchain_ledger": "ACTIVE"
        }
    }
