from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from ....services.biometrics import (
    extract_face_crop,
    extract_face_embedding,
    compare_faces,
    compute_passive_liveness,
    verify_active_challenge
)
from ....utils.image_converter import base64_to_cv2, cv2_to_base64

router = APIRouter()

class BiometricCompareRequest(BaseModel):
    document_image_base64: str
    live_face_base64: str

class LivenessChallengeRequest(BaseModel):
    challenge_type: str  # BLINK, TURN_HEAD_LEFT, TURN_HEAD_RIGHT, OPEN_MOUTH
    frame_metrics: Dict[str, float]

class PassiveLivenessRequest(BaseModel):
    live_face_base64: str

@router.post("/compare-faces", tags=["Biometrics"])
async def compare_faces_endpoint(req: BiometricCompareRequest):
    try:
        doc_img = base64_to_cv2(req.document_image_base64)
        live_img = base64_to_cv2(req.live_face_base64)
        if doc_img is None or live_img is None:
            raise HTTPException(status_code=400, detail="Invalid image input")

        doc_face_crop, crop_box = extract_face_crop(doc_img)
        if doc_face_crop is None:
            doc_face_crop = doc_img

        match_result = compare_faces(doc_face_crop, live_img)
        passive_liveness = compute_passive_liveness(live_img)

        return {
            "status": "SUCCESS",
            "match": match_result,
            "passive_liveness": passive_liveness,
            "doc_face_crop_base64": cv2_to_base64(doc_face_crop),
            "face_box": crop_box
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/liveness/passive", tags=["Biometrics"])
async def passive_liveness_endpoint(req: PassiveLivenessRequest):
    try:
        live_img = base64_to_cv2(req.live_face_base64)
        if live_img is None:
            raise HTTPException(status_code=400, detail="Invalid live face image")
        res = compute_passive_liveness(live_img)
        return {"status": "SUCCESS", "liveness": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/liveness/active-challenge", tags=["Biometrics"])
async def active_challenge_endpoint(req: LivenessChallengeRequest):
    try:
        res = verify_active_challenge(req.challenge_type, req.frame_metrics)
        return {"status": "SUCCESS", "challenge_result": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
