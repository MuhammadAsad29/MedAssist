# 🩺 MedAssist AI
### Next-Gen AI-Powered Medical Lab Report Analyzer & Multi-Lingual Clinical Assistant

[![Live Demo](https://img.shields.io/badge/Live%20Demo-med--assist--lilac.vercel.app-00dfa2?style=for-the-badge&logo=vercel&logoColor=black)](https://med-assist-lilac.vercel.app/)
[![Python Version](https://img.shields.io/badge/python-3.10%20%7C%203.11-blue?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask Framework](https://img.shields.io/badge/Flask-3.0+-black?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Google Gemini Vision](https://img.shields.io/badge/Google%20Gemini-3.5%20%2F%203.8%20Flash-orange?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel%20Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://med-assist-lilac.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

Translating complex laboratory diagnostic reports and scans into clear, actionable health insights with Multi-Lingual Support (English, Urdu, Roman Urdu), 4-tier personalized clinical recommendations, and context-aware interactive AI chat.

🌐 **Live Application:** [https://med-assist-lilac.vercel.app/](https://med-assist-lilac.vercel.app/)

[Live Demo](https://med-assist-lilac.vercel.app/) • [Key Features](#-key-features) • [System Architecture](#-system-architecture) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start--installation) • [Vercel Deployment](#-1-click-free-vercel-deployment) • [API Reference](#-api-reference) • [Project Structure](#-repository-structure) • [Disclaimer](#-medical-disclaimer)

---

## 📌 Problem & Vision

Medical laboratory reports—such as Complete Blood Counts (CBC), Comprehensive Metabolic Panels (CMP), Lipid Profiles, and Liver/Thyroid Panels—are filled with medical jargon, abbreviations, and complex numeric ranges. Patients often struggle to interpret these critical markers, leading to unnecessary health anxiety or delayed doctor consultations.

**MedAssist AI** bridges this clinical communication gap. By combining **Optical Character Recognition (OCR)**, **Multimodal Vision AI (Google Gemini 3.5 / 3.8 Flash)**, and **Clinical NLP**, it transforms raw PDF or image lab reports into structured tables, risk-scored summaries, tailored dietary/doctor recommendations, and multi-lingual conversational insights.

---

## ✨ Key Features

### 👁️ 1. Multimodal Document Ingestion
* Upload scanned images (**JPEG, PNG, WEBP, BMP**) or multi-page digital **PDF** reports (up to 16 MB).
* High-clarity contrast enhancement and noise reduction pipeline via Pillow buffers.

### 🧪 2. Automated Clinical Structuring & Severity Categorization
* Automatically extracts **Test Name**, **Measured Value**, **Unit**, and **Normal Reference Range**.
* Dynamic Clinical Severity Badges:
  * 🟢 **Normal**: Value resides safely within physiological reference limits.
  * 🟡 **Abnormal**: Moderately elevated or depressed parameters.
  * 🔴 **Critical**: Dangerously out-of-range metrics requiring urgent medical attention.

### 🗣️ 3. Multi-Lingual Response Engine
Choose your preferred response language with seamless UI and AI synthesis:
* 🇬🇧 **English** (Standard Clinical Summary & Patient Explanations)
* 🇵🇰 **اردو (Urdu Script)** (Complete Nastaliq typography support)
* 🗣️ **Roman Urdu** (*"Aapka Hemoglobin 9.2 g/dL hai jo normal se kam hai, iska matlab hai aapko khoon ki kami (Anemia) ho sakti hai..."*)

### 🩺 4. Personalized AI Health Recommendations
Generates 4 tailored clinical advice categories based on identified abnormalities:
* 🥗 **Dietary & Nutrition Advice**: Specific foods to include or avoid (e.g., iron-rich foods, low-glycemic diets).
* 👨‍⚕️ **Specialist Consultations**: Guidance on which doctor (Hematologist, Cardiologist, Endocrinologist, etc.) to visit.
* 📅 **Follow-up Timeline**: Recommended repeat testing intervals.
* ⚠️ **Red Flags & Warning Signs**: Critical symptoms that require emergency medical care.

### 💬 5. Interactive "Chat with your Report" AI Assistant
* Ask specific questions directly to the AI Doctor Assistant.
* Context-aware chatbot with full memory of your report metrics and chat history.
* Built-in Markdown-to-HTML parser ensuring crisp typography (no raw asterisks, hash signs, or dashes).
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
| **Backend Framework** | Python 3.11, Flask 3.0+ | Serverless web routing & REST API |
| **AI / LLM Core** | Google Gemini 3.5 / 3.8 Flash | Multimodal Vision, OCR, & Clinical NLP |
| **PDF Processing** | `pypdf` | Serverless-compatible digital PDF text extraction |
| **Image Pipeline** | `Pillow` (PIL) | Contrast enhancement & dimensional optimization |
| **Frontend** | Vanilla HTML5, Modern CSS3, JavaScript (ES6+) | Glassmorphic, responsive, dark/light UI |
| **Icons & Typography** | FontAwesome 6, Plus Jakarta Sans, Noto Nastaliq Urdu | Clean medical aesthetic & typography |
| **Edge & Static Delivery**| Vercel Edge CDN (`public/static/`) | High-speed global asset caching |
| **Live Hosting** | Vercel Serverless Functions | [med-assist-lilac.vercel.app](https://med-assist-lilac.vercel.app/) |

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

The application is deployed live at: **[https://med-assist-lilac.vercel.app/](https://med-assist-lilac.vercel.app/)**

To deploy your own instance:

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy MedAssist AI to Vercel"
   git push origin main
   ```
2. Open **[Vercel Dashboard](https://vercel.com/dashboard)** and click **"Add New Project"**.
3. Import your **`MedAssist`** GitHub repository.
4. Add your Environment Variable:
   - **Key**: `GEMINI_API_KEY` (or `GOOGLE_API_KEY`)
   - **Value**: `your_gemini_api_key`
5. Click **Deploy** — your application will be live across global CDNs in under 30 seconds!

> 🔒 **Tip**: If your Vercel deployment asks for login on preview links, navigate to **Project Settings ➔ Deployment Protection** and disable **Vercel Authentication** to make your app publicly accessible.

---

## 🔌 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/` | `GET` | Main Medical Dashboard UI |
| `/api/analyze?lang={en\|ur\|roman_ur}` | `POST` | Upload Image/PDF or text payload for AI extraction & structuring |
| `/api/chat` | `POST` | Interactive conversational query with report context |
| `/api/sample/<sample_id>` | `GET` | Fetches sample lab report data (`cbc`, `lipid`, `liver_thyroid`) |
| `/api/health` | `GET` | Health check endpoint returning AI engine and configuration status |

---

## 📁 Repository Structure

```
MedAssist/
├── api/
│   └── index.py            # Vercel serverless WSGI entrypoint
├── public/                 # Edge CDN Static Delivery
│   └── static/
│       ├── css/style.css   # Responsive glassmorphic styles & dark mode
│       └── js/app.js       # Client frontend engine & chat handler
├── templates/
│   └── index.html          # Main Clinical Dashboard UI
├── static/                 # Local development assets
│   ├── css/style.css
│   └── js/app.js
├── app.py                  # Core Flask backend, Gemini AI vision & chat logic
├── check_models.py         # Utility script to test available Gemini models
├── vercel.json             # Vercel routing & serverless build configuration
├── requirements.txt        # Lightweight dependency manifest
├── .env.example            # Environment variable template
└── README.md               # Comprehensive documentation
```

---

## ⚠️ Medical Disclaimer

> **IMPORTANT**: **MedAssist AI** is an artificial intelligence-based informational and educational tool designed to assist in organizing and understanding lab test data. **It does not provide medical diagnoses, clinical treatment plans, or formal prescriptions.** Always consult a qualified, licensed medical physician or healthcare professional for clinical decision-making.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
