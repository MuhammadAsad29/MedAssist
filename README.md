<div align="center">

# 🩺 MedAssist AI
### Next-Gen AI-Powered Medical Lab Report Analyzer & Clinical Assistant

[![Python Version](https://img.shields.io/badge/python-3.10%20%7C%203.11-blue?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask Framework](https://img.shields.io/badge/Flask-3.0+-black?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Google Gemini Vision](https://img.shields.io/badge/Google%20Gemini-3.5%20%2F%203.8%20Flash-orange?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel%20Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

Translating complex laboratory jargon and clinical diagnostic scans into clear, actionable health insights with Multi-Lingual Support and Context-Aware AI Chat.

[Key Features](#-key-features) • [System Architecture](#-system-architecture) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start--installation) • [Vercel Deployment](#-1-click-free-vercel-deployment) • [Disclaimer](#-medical-disclaimer)

</div>

---

## 📌 Problem & Vision

Medical laboratory reports—such as Complete Blood Counts (CBC), Comprehensive Metabolic Panels (CMP), Lipid Profiles, and Thyroid Panels—are loaded with complex abbreviations, units, and numeric intervals. Patients often struggle to interpret these critical markers, leading to unnecessary anxiety or delayed follow-ups.

**MedAssist AI** bridges this clinical gap. By combining **Optical Character Recognition (OCR)**, **Multimodal Vision AI (Google Gemini 3.5 / 3.8 Flash)**, and **Clinical NLP**, it transforms raw PDF or image lab reports into structured tables, risk-scored breakdowns, personalized dietary/doctor recommendations, and multi-lingual conversational summaries.

---

## ✨ Key Features

### 👁️ 1. Multimodal Document Ingestion
* Upload scanned images (**JPEG, PNG, WEBP, BMP**) or multi-page digital **PDF** reports (up to 16 MB).
* High-clarity contrast enhancement and noise reduction pipeline via Pillow buffers.

### 🧪 2. Automated Clinical Structuring & Severity Categorization
* Automatically extracts **Test Name**, **Measured Value**, **Unit**, and **Normal Reference Range**.
* Dynamic Clinical Scoring:
  * 🟢 **Normal**: Value resides safely within physiological reference limits.
  * 🟡 **Abnormal**: Moderately elevated or depressed parameters.
  * 🔴 **Critical**: Dangerously out-of-range metrics requiring prompt clinical attention.

### 🗣️ 3. Multi-Lingual Response Engine
Choose your preferred response language with instant UI and AI synthesis:
* 🇬🇧 **English** (Standard Clinical Summary)
* 🇵🇰 **اردو (Urdu Script)** (Complete Nastaliq typography support)
* 🗣️ **Roman Urdu** (*"Aapka Hemoglobin 9.2 g/dL hai jo normal se kam hai, iska matlab hai aapko khoon ki kami (Anemia) ho sakti hai..."*)

### 🩺 4. Personalized AI Health Recommendations
Generates 4 tailored clinical advice categories based on identified abnormalities:
* 🥗 **Dietary & Nutrition Advice**: Specific foods to include or avoid (e.g., iron-rich foods, low-glycemic diets).
* 👨‍⚕️ **Specialist Consultations**: Guidance on which doctor (Hematologist, Cardiologist, Endocrinologist, etc.) to visit.
* 📅 **Follow-up Timeline**: Recommended repeat testing intervals.
* ⚠️ **Red Flags & Warning Signs**: Critical symptoms that require emergency medical care.

### 💬 5. Interactive "Chat with your Report" AI Bot
* Ask specific health queries directly to the AI Assistant.
* Context-aware chatbot with full memory of your report metrics.
* Instant 1-click question chips (*"Diet Advice"*, *"Which Doctor?"*, *"Any Danger?"*, *"Explain Simply"*).

### ⚡ 6. Instant 1-Click Sample Testing
* Includes 3 built-in real-world lab cases for instant evaluation:
  * **Anemia Panel (CBC)**
  * **Lipid & Metabolic Panel**
  * **Thyroid & Liver Function (LFT)**

### 📄 7. Print-Ready & Downloadable PDF Summary
* Formatted clinical summary report styled with dedicated `@media print` CSS for downloading as PDF or printing for doctor appointments.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client["1. Modern Web Frontend"]
        A[User Upload: Image / PDF / Sample Report] --> B[Language Selector: EN / UR / Roman Urdu]
    end

    subgraph Backend["2. Flask Serverless Core (app.py)"]
        B --> C{File Type?}
        C -->|PDF| D[pypdf Text & Metadata Extraction]
        C -->|Image| E[Pillow Image Preprocessing & Optimization]
        D & E --> F[Prompt & Multi-Lingual Injection]
    end

    subgraph AI_Engine["3. Multimodal Reasoning (Google Gemini)"]
        F --> G[Gemini 3.5 / 3.8 Flash Vision Engine]
        G --> H[Strict Structured JSON Response]
    end

    subgraph Presentation["4. Dashboard & Interactive Services"]
        H --> I[Structured Test Table & Severity Badges]
        H --> J[4-Tier Personalized Recommendation Cards]
        H --> K[Context-Aware Medical AI Chatbot (/api/chat)]
        H --> L[Downloadable / Printable Clinical PDF]
    end
```

---

## 💻 Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | Python 3.11, Flask 3.0+ | Serverless web routing & REST API |
| **AI / LLM** | Google Gemini 3.5 / 3.8 Flash | Multimodal Vision, OCR, & Clinical NLP |
| **PDF Processing** | `pypdf` | Serverless-compatible digital PDF text extraction |
| **Image Pipeline** | `Pillow` (PIL) | Contrast enhancement & dimensional optimization |
| **Frontend** | Vanilla HTML5, Modern CSS3, JavaScript (ES6+) | Glassmorphic, responsive, dark/light UI |
| **Icons & Typography** | FontAwesome 6, Plus Jakarta Sans, Noto Nastaliq Urdu | Clean medical aesthetic & typography |
| **Deployment** | Vercel Serverless Functions | 100% Free cloud hosting |

---

## 🚀 Quick Start & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/MuhammadAsad29/MedAssist.git
cd MedAssist
```

### 2. Set Up Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=YOUR_FREE_GEMINI_API_KEY
```
> 💡 *You can get a 100% free Gemini API Key in seconds from [Google AI Studio](https://aistudio.google.com/app/apikey) (No credit card required).*

### 5. Run the Application
```bash
python app.py
```
Open your browser at **`http://127.0.0.1:5000`**.

---

## ☁️ 1-Click Free Vercel Deployment

This project is built from the ground up to be **100% Vercel Serverless Ready** with zero heavy C-binaries:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy MedAssist AI"
   git push origin main
   ```
2. Go to **[Vercel](https://vercel.com/)** and click **"Add New Project"**.
3. Import your **`MedAssist`** GitHub repository.
4. Add your Environment Variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `your_api_key_here`
5. Click **Deploy** — your application will be live across global CDNs in under 30 seconds!

---

## 📁 Repository Structure

```
MedAssist/
├── api/
│   └── index.py            # Vercel serverless WSGI entrypoint
├── templates/
│   └── index.html          # Clinical Dashboard UI
├── static/
│   ├── css/
│   │   └── style.css       # Responsive medical design & dark mode
│   └── js/
│       └── app.js          # Interactive frontend & AI chat engine
├── app.py                  # Core Flask backend & Gemini integration
├── check_models.py         # Diagnostic utility to test active AI models
├── vercel.json             # Serverless deployment configuration
├── requirements.txt        # Lightweight dependency manifest
├── .env.example            # Environment template
└── README.md               # Documentation
```

---

## ⚠️ Medical Disclaimer

> **IMPORTANT**: **MedAssist AI** is an artificial intelligence-based informational and educational tool designed to assist in organizing and understanding lab test data. **It does not provide medical diagnoses, clinical treatment plans, or formal prescriptions.** Always consult a qualified, licensed medical physician or healthcare professional for clinical decision-making.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
