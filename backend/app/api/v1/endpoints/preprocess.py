from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from ....services.preprocessing import assess_image_quality, rectify_document, apply_clahe
from ....utils.image_converter import base64_to_cv2, cv2_to_base64

router = APIRouter()

class PreprocessRequest(BaseModel):
    image_base64: str
    auto_rectify: bool = True
    apply_enhancement: bool = True
    custom_corners: Optional[List[List[float]]] = None

@router.post("/quality-and-rectify", tags=["Preprocessing"])
async def preprocess_document(req: PreprocessRequest):
    try:
        image = base64_to_cv2(req.image_base64)
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image encoding")

        # 1. Quality Assessment
        quality_info = assess_image_quality(image)

        # 2. Rectification
        rectified_image, corners = rectify_document(image, req.custom_corners) if req.auto_rectify else (image, [])

        # 3. Enhancement
        if req.apply_enhancement:
            enhanced_image = apply_clahe(rectified_image)
        else:
            enhanced_image = rectified_image

        return {
            "status": "SUCCESS",
            "quality": quality_info,
            "detected_corners": corners,
            "rectified_image_base64": cv2_to_base64(rectified_image),
            "enhanced_image_base64": cv2_to_base64(enhanced_image)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
