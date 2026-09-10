import hashlib
import hmac
import json
import time
from typing import Dict, Any, Optional
from .config import settings

def hash_document_payload(payload: Dict[str, Any]) -> str:
    """Computes a deterministic SHA-256 hash of document metadata."""
    serialized = json.dumps(payload, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

def generate_tamper_seal(doc_number: str, outcome: str, timestamp: float) -> str:
    """Generates an HMAC-SHA256 digital tamper seal for audit certificates."""
    message = f"{doc_number}:{outcome}:{timestamp}"
    return hmac.new(
        settings.SECRET_SALT.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

def mask_pii_string(value: Optional[str], visible_chars: int = 2) -> str:
    """Masks sensitive PII string for DPDP Act compliance (e.g. PASSPORT# -> PA*****45)."""
    if not value or len(value) <= (visible_chars * 2):
        return "****"
    return f"{value[:visible_chars]}{'*' * (len(value) - visible_chars * 2)}{value[-visible_chars:]}"

def anonymize_inspection_record(record: Dict[str, Any]) -> Dict[str, Any]:
    """Produces a DPDP-compliant sanitized record for public analytics & logging."""
    sanitized = record.copy()
    if "document_number" in sanitized:
        sanitized["document_number_masked"] = mask_pii_string(sanitized["document_number"])
        del sanitized["document_number"]
    if "full_name" in sanitized:
        sanitized["full_name_masked"] = mask_pii_string(sanitized["full_name"], visible_chars=1)
        del sanitized["full_name"]
    return sanitized
