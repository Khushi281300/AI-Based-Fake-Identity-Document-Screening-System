# 🛡️ AI-Based Fake Identity & Document Screening System

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg?logo=react&logoColor=black)](https://vitejs.dev)
[![OpenCV](https://img.shields.io/badge/CV-OpenCV%20%7C%20PyTorch-5C3EE8.svg?logo=opencv&logoColor=white)](https://opencv.org)
[![ICAO](https://img.shields.io/badge/Standard-ICAO%20Doc%209303-blue.svg)](https://www.icao.int)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An industrial-grade, real-time, explainable, risk-based border checkpoint document screening and identity verification platform. It verifies passports, visas, national IDs, and permits while detecting forged documents, altered photos, fake MRZ check digits, screen-replay recaptures, and biometric impersonation.

---

## 🌟 Key Capabilities & Features

### 1. 🔍 Multi-Layer Classical & Deep Document Forensics
- **Error Level Analysis (ELA)**: Recompression delta mapping highlighting spliced fonts, altered numbers, or pasted faces in distinct thermal colormaps (Inferno/Jet).
- **Spatial Rich Model (SRM) Noise Analysis**: High-pass residual filter bank (KV & 3x3 min-max) detecting micro-texture inconsistencies from digital editing tools.
- **JPEG Ghost Detection**: Multi-scale compression difference analysis revealing regions with differing compression histories.
- **Copy-Move Clone Detection**: ORB keypoint descriptor clustering and RANSAC affine transformation checks to identify cloned stamps, seals, or numbers.
- **2D FFT Moire & Screen Recapture Detector**: High-frequency spectral peak analysis identifying screen pixel raster grids, display reflections, and device bezels.
- **Deep Tamper Classifier & Grad-CAM**: 4-channel (RGB + ELA) CNN with Grad-CAM visual saliency heatmaps for explainable tamper localization.
- **EXIF Metadata Auditor**: Flags editing software footprints (Photoshop, Canva, GIMP), missing camera hardware tags, and timestamp discrepancies.

### 2. 📑 ICAO Doc 9303 MRZ & OCR Cross-Reconciliation
- **ICAO 9303 Parser**: Supports **TD1** (3x30 ID), **TD2** (2x36 Visa), and **TD3** (2x44 Passport) Machine Readable Zones.
- **7-3-1 Weight Check-Digit Algorithm**: Mathematical validation of Document Number, Date of Birth, Expiry Date, and Composite Checksum.
- **OCR Auto-Confusion Corrector**: Smart matrix correction for common optical misreads (`O<->0`, `I<->1`, `S<->5`, `Z<->2`, `B<->8`).
- **Visual Inspection Zone (VIZ) Cross-Check**: Reconciles visual text fields against MRZ payloads to flag subtle forgery.

### 3. 👤 Biometrics, Liveness & Anti-Spoofing
- **Face Embedding Matching**: ArcFace / MobileFaceNet deep feature extraction with Cosine Similarity and risk-tiered thresholds.
- **Passive Texture Anti-Spoofing**: Frequency analysis and MiniFASNet-style texture classification to detect printed photos and screen replays.
- **Active Challenge-Response Liveness**: Interactive state machine with Eye Aspect Ratio (EAR) blink detection, head pose yaw/pitch tracking, and mouth aspect ratio (MAR) analysis.
- **Soft Biometric Verification**: Cross-checks estimated age and gender with document DOB and sex fields.

### 4. ⚖️ Explainable Multi-Signal Risk Engine
- **Weighted Multi-Factor Fusion**:
  - Document Quality (10%)
  - MRZ Integrity & Check Digits (20%)
  - Forensics & ELA Splicing (25%)
  - Biometrics & Liveness (25%)
  - Database Watchlist & Expiry (20%)
- **Deterministic 3-Way Verdict**:
  - 🟢 **VERIFIED**: High confidence across all forensic, MRZ, and biometric signals.
  - 🟡 **MANUAL REVIEW**: Borderline signals, degraded document quality, or minor OCR ambiguity.
  - 🔴 **REJECTED**: Fatal flags (Watchlist hit, Invalid MRZ check digit, Tampered photo, Spoofed face).
- **Officer Decision Override**: Border control officers can submit overrides with mandatory audit justification notes.

### 5. 🔗 Database, Identity Graph & Blockchain Ledger
- **Watchlist & Interpol Search**: Real-time checking against active blacklists and watchlists.
- **Duplicate Identity Graph**: Vector index matching faces across multiple identities to uncover multi-alias travel fraud.
- **Cryptographic SHA-256 Merkle Ledger**: Generates immutable audit trails and verifiable tamper-proof digital certificates with QR verification.
- **DPDP Act Compliance**: Biometric hash encryption, PII redaction, and strict data sanitization.

---

## 🏛️ System Architecture

```
+----------------------------------------------------------------------------------------------------+
|                                  OFFICER WEB DASHBOARD (React + Vite)                              |
|  - Live Scanner / File Upload (Blur & Glare Guides)  - Dual Side-by-Side Visual Forensics Viewer   |
|  - Active Webcam Biometric Capture & Liveness Modal   - Interactive MRZ & Field Verification Card   |
|  - Explainable AI Risk Score & Forensic Breakdown    - Checkpoint Analytics & Audit Trail Explorer |
+---------------------------------------------------+------------------------------------------------+
                                                    | REST API / WebSockets
                                                    v
+----------------------------------------------------------------------------------------------------+
|                                   FASTAPI HIGH-PERFORMANCE BACKEND                                 |
|  [ Ingestion & CV Preprocessing ] -> [ Forensics Engine (ELA, SRM, Moire, GradCAM) ]               |
|  [ ICAO MRZ & OCR Engine ]        -> [ Biometrics & Active Liveness Subsystem ]                    |
|  [ Risk Scoring & Fusion ]        -> [ Blacklist, Identity Graph & SHA-256 Blockchain Ledger ]     |
+----------------------------------------------------------------------------------------------------+
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend Swagger Documentation will be live at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Dashboard will be live at: `http://localhost:5173`

---

## 🧪 Testing

Run backend test suite:
```bash
cd backend
pytest tests/ -v
```

---

## 📄 License
This project is licensed under the MIT License.
