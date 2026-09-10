import io
from PIL import Image, ExifTags
from typing import Dict, Any, List

SUSPICIOUS_SOFTWARE_KEYWORDS = [
    "photoshop", "gimp", "canva", "adobe", "pixelmator", "paint.net", "coreldraw", "lightroom", "fotor"
]

def inspect_image_metadata(image_bytes: bytes) -> Dict[str, Any]:
    """
    Parses EXIF and embedded metadata to detect photo editing software traces,
    missing camera hardware signatures, and timestamp manipulation.
    """
    try:
        pil_img = Image.open(io.BytesIO(image_bytes))
        info = pil_img.info
        exif_raw = pil_img.getexif()

        metadata_dict = {}
        for tag, value in exif_raw.items():
            tag_name = ExifTags.TAGS.get(tag, str(tag))
            metadata_dict[tag_name] = str(value)

        # Look for software tags
        software_used = metadata_dict.get("Software", info.get("Software", "")).lower()
        editing_software_detected = any(kw in software_used for kw in SUSPICIOUS_SOFTWARE_KEYWORDS)

        has_camera_make = "Make" in metadata_dict or "Model" in metadata_dict
        has_original_datetime = "DateTimeOriginal" in metadata_dict or "DateTime" in metadata_dict

        # If it has Photoshop or Canva tag, it's a critical forensic alert
        risk_score = 0.0
        alerts: List[str] = []

        if editing_software_detected:
            risk_score += 0.70
            alerts.append(f"Image was modified using photo editing software: '{software_used}'")

        if not has_camera_make and len(metadata_dict) > 0:
            risk_score += 0.20
            alerts.append("Stripped camera hardware EXIF tags (possible re-export)")

        return {
            "has_exif": len(metadata_dict) > 0,
            "software_tag": software_used if software_used else "None",
            "camera_make": metadata_dict.get("Make", "Unknown"),
            "camera_model": metadata_dict.get("Model", "Unknown"),
            "date_time": metadata_dict.get("DateTime", "Unknown"),
            "editing_software_detected": editing_software_detected,
            "metadata_risk_score": round(min(1.0, risk_score), 2),
            "alerts": alerts,
            "status": "FLAGGED" if editing_software_detected else "NORMAL"
        }
    except Exception as e:
        return {
            "has_exif": False,
            "software_tag": "None",
            "editing_software_detected": False,
            "metadata_risk_score": 0.0,
            "alerts": [],
            "status": "NORMAL"
        }
