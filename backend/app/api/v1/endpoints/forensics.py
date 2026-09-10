import base64
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ....services.forensics import (
    compute_error_level_analysis,
    compute_srm_residuals,
    compute_jpeg_ghosts,
    detect_copy_move_forgery,
    analyze_2d_fft_moire,
    generate_gradcam_saliency,
    inspect_image_metadata
)
from ....utils.image_converter import base64_to_cv2, cv2_to_base64

router = APIRouter()

class ForensicsRequest(BaseModel):
    image_base64: str

@router.post("/analyze-all", tags=["Forensics"])
async def run_full_forensics(req: ForensicsRequest):
    try:
        image = base64_to_cv2(req.image_base64)
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image payload")

        # Extract raw bytes for EXIF
        raw_b64 = req.image_base64.split(",")[1] if "," in req.image_base64 else req.image_base64
        raw_bytes = base64.b64decode(raw_b64)

        # 1. ELA
        ela_map, ela_gray, ela_metrics = compute_error_level_analysis(image)
        
        # 2. SRM Noise
        srm_map, srm_metrics = compute_srm_residuals(image)
        
        # 3. JPEG Ghost
        ghost_map, ghost_metrics = compute_jpeg_ghosts(image)
        
        # 4. Copy-Move
        copy_move_map, copy_move_metrics = detect_copy_move_forgery(image)
        
        # 5. 2D FFT Moire
        moire_map, moire_metrics = analyze_2d_fft_moire(image)
        
        # 6. Deep Tamper + Grad-CAM
        gradcam_map, deep_metrics = generate_gradcam_saliency(image, ela_gray)
        
        # 7. EXIF Metadata
        exif_metrics = inspect_image_metadata(raw_bytes)

        return {
            "status": "SUCCESS",
            "layers": {
                "ela_heatmap_base64": cv2_to_base64(ela_map),
                "srm_noise_base64": cv2_to_base64(srm_map),
                "jpeg_ghost_base64": cv2_to_base64(ghost_map),
                "copy_move_base64": cv2_to_base64(copy_move_map),
                "fft_moire_base64": cv2_to_base64(moire_map),
                "gradcam_saliency_base64": cv2_to_base64(gradcam_map)
            },
            "metrics": {
                "ela": ela_metrics,
                "srm": srm_metrics,
                "jpeg_ghost": ghost_metrics,
                "copy_move": copy_move_metrics,
                "recapture": moire_metrics,
                "deep_tamper": deep_metrics,
                "exif": exif_metrics
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
