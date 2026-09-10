from pydantic import BaseModel
from typing import List

class Settings(BaseModel):
    PROJECT_NAME: str = "AI-Based Fake Identity & Document Screening System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Forensic Thresholds
    ELA_QUALITY_STEP: int = 90
    ELA_SCALE_FACTOR: int = 15
    ELA_TAMPER_THRESHOLD: float = 0.42
    
    SRM_RESIDUAL_THRESHOLD: float = 0.38
    FFT_MOIRE_PEAK_THRESHOLD: float = 0.55
    COPY_MOVE_MIN_MATCHES: int = 8
    
    # Biometric Thresholds
    FACE_MATCH_PASS_THRESHOLD: float = 0.72
    FACE_MATCH_REVIEW_THRESHOLD: float = 0.58
    PASSIVE_LIVENESS_THRESHOLD: float = 0.65
    
    # Risk Engine Weights
    WEIGHT_QUALITY: float = 0.10
    WEIGHT_MRZ: float = 0.20
    WEIGHT_FORENSICS: float = 0.25
    WEIGHT_BIOMETRICS: float = 0.25
    WEIGHT_DATABASE: float = 0.20
    
    # Risk Cutoffs
    VERIFIED_SCORE_MIN: float = 85.0
    REVIEW_SCORE_MIN: float = 60.0
    
    # Database
    DATABASE_URL: str = "sqlite:///./screening_system.db"
    
    # Secret Key for cryptographic hashing
    SECRET_SALT: str = "AGY_SECURE_BORDER_SCREENING_2026_KEY"

settings = Settings()
