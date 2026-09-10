from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from ....services.mrz.parser import parse_mrz_text
from ....services.ocr.engine import reconcile_viz_with_mrz

router = APIRouter()

class MRZVerifyRequest(BaseModel):
    mrz_lines: List[str]
    viz_fields: Optional[Dict[str, Any]] = None

@router.post("/verify-mrz", tags=["MRZ & OCR"])
async def verify_mrz_endpoint(req: MRZVerifyRequest):
    try:
        mrz_result = parse_mrz_text(req.mrz_lines)
        reconciliation = {}
        if req.viz_fields:
            reconciliation = reconcile_viz_with_mrz(req.viz_fields, mrz_result)
        
        return {
            "status": "SUCCESS",
            "mrz": mrz_result,
            "reconciliation": reconciliation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
