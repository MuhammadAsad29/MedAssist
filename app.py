import os
import json
import io
import re
import time
from datetime import datetime
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from PIL import Image, ImageEnhance
import pypdf
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Retrieve Gemini API Key from environment or .env
gemini_api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or ""
gemini_api_key = gemini_api_key.strip()

if not gemini_api_key:
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line_clean = line.strip()
                if line_clean.startswith("GEMINI_API_KEY=") or line_clean.startswith("GOOGLE_API_KEY="):
                    gemini_api_key = line_clean.split("=", 1)[1].strip()
                    break
                elif line_clean and not line_clean.startswith("#") and not line_clean.startswith("OPENAI"):
                    gemini_api_key = line_clean

# Configure Google Generative AI
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)

# Initialize Flask app
app = Flask(__name__, template_folder="templates", static_folder="static")
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max upload size

# Verified fast Gemini models
GEMINI_MODELS = [
    "gemini-3.5-flash",
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.7-flash",
    "gemini-3.5-flash-lite",
    "gemini-pro-latest"
]

# Language mapping descriptions
LANGUAGE_INSTRUCTIONS = {
    "en": "Respond in clear, professional English.",
    "ur": "تمام وضاحتی جملے، سمری، اور تجاویز کو خالص اور شائستہ اردو رسم الخط (Urdu Script) میں لکھیں۔",
    "roman_ur": "Tamam test ki explanations, overall summary, aur suggestions/recommendations ko asaan aur aam faham Roman Urdu (Urdu written in English alphabets, e.g., 'Aapka Hemoglobin kam hai jis ki wajah se khoon ki kami ho sakti hai') mein likhein."
}

# Pre-defined sample medical lab reports for instant 1-click testing
SAMPLE_REPORTS = {
    "cbc": {
        "title": "Complete Blood Count (CBC) - Anemia Case",
        "description": "Lab report showing low Hemoglobin, low RBC, and microcytic indices indicating iron deficiency anemia.",
        "text": """CENTRAL CLINICAL LABORATORY - LAB REPORT
Patient Name: John Doe    Age: 42    Gender: Male    Date: 2026-09-15
Test Description              Result      Unit       Reference Range    Status
-------------------------------------------------------------------------------
Hemoglobin (Hb)               9.2         g/dL       13.5 - 17.5        LOW
Red Blood Cell Count (RBC)    3.8         M/uL       4.5 - 5.9          LOW
Hematocrit (HCT)              29.5        %          41.0 - 50.0        LOW
Mean Corpuscular Volume (MCV) 72.0        fL         80.0 - 100.0       LOW
White Blood Cell Count (WBC)  6.4         K/uL       4.5 - 11.0         NORMAL
Platelet Count                310         K/uL       150 - 450          NORMAL
Mean Corpuscular Hb (MCH)     24.0        pg         27.0 - 33.0        LOW
RDW                           16.8        %          11.5 - 14.5        HIGH
Neutrophils                   60          %          40 - 70            NORMAL
Lymphocytes                   30          %          20 - 40            NORMAL
Monocytes                     6           %          2 - 8              NORMAL
Eosinophils                   3           %          1 - 4              NORMAL
Basophils                     1           %          0 - 2              NORMAL"""
    },
    "lipid": {
        "title": "Comprehensive Lipid & Metabolic Panel",
        "description": "Cardiovascular risk profile showing elevated LDL cholesterol, triglycerides, and fasting blood glucose.",
        "text": """METROPOLITAN DIAGNOSTIC LABS - LIPID & METABOLIC REPORT
Patient Name: Jane Smith    Age: 54    Gender: Female    Date: 2026-09-28
Test Description              Result      Unit       Reference Range    Status
-------------------------------------------------------------------------------
Fasting Blood Glucose         138         mg/dL      70 - 99            HIGH
HbA1c                         6.8         %          4.0 - 5.6          HIGH
Total Cholesterol             248         mg/dL      < 200              HIGH
Triglycerides                 220         mg/dL      < 150              HIGH
HDL Cholesterol (Good)        38          mg/dL      > 50               LOW
LDL Cholesterol (Calculated)  166         mg/dL      < 100              HIGH
VLDL Cholesterol              44          mg/dL      5 - 30             HIGH
Cholesterol / HDL Ratio       6.5         Ratio      < 4.5              HIGH
Serum Creatinine              0.9         mg/dL      0.6 - 1.2          NORMAL
eGFR                          88          mL/min     > 60               NORMAL
Uric Acid                     5.2         mg/dL      2.4 - 6.0          NORMAL"""
    },
    "liver_thyroid": {
        "title": "Thyroid & Liver Function Panel (LFT)",
        "description": "Hepatic enzymes and thyroid hormones showing elevated TSH (hypothyroidism) and mild ALT elevation.",
        "text": """APEX PATHOLOGY LABORATORY - ENDOCRINE & HEPATIC REPORT
Patient Name: Alex Brown    Age: 36    Gender: Female    Date: 2026-10-01
Test Description              Result      Unit       Reference Range    Status
-------------------------------------------------------------------------------
Thyroid Stimulating Hormone   7.85        uIU/mL     0.40 - 4.20        HIGH
Free Thyroxine (FT4)          0.72        ng/dL      0.80 - 1.80        LOW
Total T3                      85          ng/dL      80 - 200           NORMAL
Total Bilirubin               0.8         mg/dL      0.2 - 1.2          NORMAL
Direct Bilirubin              0.2         mg/dL      0.0 - 0.3          NORMAL
ALT (SGPT)                    58          U/L        7 - 45             HIGH
AST (SGOT)                    42          U/L        8 - 40             HIGH
Alkaline Phosphatase (ALP)    85          U/L        44 - 147           NORMAL
Total Protein                 7.1         g/dL       6.0 - 8.3          NORMAL
Serum Albumin                 4.3         g/dL       3.5 - 5.2          NORMAL"""
    }
}


def preprocess_image(image_bytes):
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        max_dim = 1600
        if max(img.size) > max_dim:
            img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.1)
        return img
    except Exception:
        return Image.open(io.BytesIO(image_bytes))


def extract_text_from_pdf(pdf_bytes):
    try:
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        extracted_pages = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            if text.strip():
                extracted_pages.append(f"--- Page {i+1} ---\n{text}")
        return "\n\n".join(extracted_pages)
    except Exception:
        return ""


def robust_json_cleaner(raw_string):
    text = raw_string.strip()
    text = re.sub(r"^```json\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"^```\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    json_match = re.search(r'(\{[\s\S]*\})', text)
    if json_match:
        extracted = json_match.group(1)
        try:
            return json.loads(extracted)
        except json.JSONDecodeError:
            fixed = extracted.rstrip()
            if not fixed.endswith("}"):
                fixed += '"}]}'
            try:
                return json.loads(fixed)
            except Exception:
                pass

    raise ValueError("Could not parse valid JSON from AI response.")


def analyze_with_gemini(text_content=None, pil_image=None, language="en"):
    """
    Executes medical report analysis with Google Gemini with multi-language output
    and comprehensive personalized clinical recommendations.
    """
    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["en"])

    system_prompt = f"""You are an expert AI Clinical Pathology Assistant and Medical Consultant.
Analyze this medical laboratory report and generate a complete, structured JSON response.

CRITICAL LANGUAGE INSTRUCTION:
{lang_instruction}
Ensure all explanations, overall_summary, diet_lifestyle_suggestions, specialist_consultation, and warning_precautions are written strictly in the chosen language: ({language}). Test names, numbers, and units should remain clinically accurate.

Output MUST be a valid JSON object matching this schema:
{{
  "patient_info": {{
    "name": "Patient Name or Unknown",
    "age": "Age or Unknown",
    "gender": "Gender or Unknown",
    "date": "Report Date or Unknown",
    "lab_name": "Laboratory Name or Unknown"
  }},
  "raw_extracted_text": "Cleaned summary text of the report",
  "structured_tests": [
    {{
      "test_name": "Standardized Test Name (e.g., Hemoglobin, Fasting Glucose)",
      "measured_value": "The numeric or textual result (e.g., 9.2)",
      "unit": "Measurement unit (e.g., g/dL, mg/dL)",
      "normal_range": "Reference range (e.g., 13.5 - 17.5)",
      "status": "Normal | Abnormal | Critical",
      "explanation": "Concise 1-2 sentence empathetic explanation in the selected language explaining what this test means for the patient."
    }}
  ],
  "overall_summary": "Comprehensive clinical summary paragraph in the selected language summarizing the patient's health status and highlighting key findings.",
  "risk_level": "Low | Moderate | High",
  "recommendations": {{
    "diet_and_nutrition": [
      "Specific dietary tip or food to eat / avoid based on the abnormal findings"
    ],
    "specialist_consultation": [
      "Which specific medical specialist to consult (e.g., Hematologist, Cardiologist, Endocrinologist, GP) and reason why"
    ],
    "follow_up_tests": [
      "Recommended repeat or additional tests with suggested timeframe"
    ],
    "warning_precautions": [
      "Symptoms or warning signs to watch out for that require immediate attention"
    ]
  }},
  "disclaimer": "This analysis is for educational and informational purposes only. Always consult a qualified physician for clinical diagnosis and treatment."
}}

Rules:
1. Accurately extract all test rows.
2. Determine status: Normal (in range), Abnormal (moderately out of range), Critical (severely out of range).
3. Ensure every text field (explanations, summary, recommendations) respects the requested language ({language}).
"""

    prompt = system_prompt + "\n\nExtract and structure the medical report into the required JSON schema:"

    start_time = time.time()
    last_error = None

    for model_name in GEMINI_MODELS:
        try:
            print(f"⚡ [Gemini] Calling '{model_name}' (Language: {language})...")
            
            generation_config = {
                "temperature": 0.1,
                "max_output_tokens": 8192,
                "response_mime_type": "application/json"
            }
            
            model = genai.GenerativeModel(
                model_name=model_name,
                generation_config=generation_config
            )

            contents = [prompt]
            if pil_image:
                contents.append(pil_image)
            elif text_content:
                contents.append(f"Report Content:\n{text_content}")
            else:
                raise ValueError("No input data provided.")

            response = model.generate_content(contents)
            
            elapsed = round(time.time() - start_time, 2)
            print(f"🎉 [Gemini] Analyzed with '{model_name}' in {elapsed}s!")
            
            parsed_data = robust_json_cleaner(response.text)
            return parsed_data
        except Exception as e:
            last_error = e
            print(f"⚠️ [Gemini] Model '{model_name}' failed: {e}")
            continue

    raise last_error


def chat_with_medical_report(message, report_context, chat_history=[], language="en"):
    """
    Context-aware interactive conversational chat with the patient's lab report.
    """
    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["en"])

    system_prompt = f"""You are MedAssist AI, a caring, knowledgeable, and empathetic AI Medical Assistant.
The user is asking questions regarding their medical laboratory report.

REPORT CONTEXT:
{json.dumps(report_context, indent=2, ensure_ascii=False)}

CRITICAL INSTRUCTIONS:
1. Language Requirement: {lang_instruction}
2. Directly refer to the patient's specific lab metrics, values, and normal ranges from the report context above.
3. If they ask for recommendations (diet, exercise, lifestyle, which doctor to visit), give clear, safe, and medically grounded practical guidance.
4. If a test value is critical or dangerous, gently advise prompt medical consultation.
5. Keep answers clear, supportive, and formatted with bullet points for readability.
6. Always maintain the medical disclaimer: you are an AI assistant, not their prescribing doctor.
"""

    formatted_history = []
    for turn in chat_history[-6:]:
        role = "user" if turn.get("sender") == "user" else "model"
        formatted_history.append({"role": role, "parts": [turn.get("text", "")]})

    current_prompt = f"System Context:\n{system_prompt}\n\nUser Question:\n{message}"

    for model_name in GEMINI_MODELS:
        try:
            model = genai.GenerativeModel(model_name=model_name)
            chat = model.start_chat(history=formatted_history)
            response = chat.send_message(current_prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Chat model '{model_name}' failed: {e}")
            continue

    return "I apologize, but I am currently unable to process your question. Please try again in a moment or consult your doctor directly."


# --- Flask Routes ---

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/sample/<sample_id>")
def get_sample(sample_id):
    if sample_id in SAMPLE_REPORTS:
        return jsonify({
            "success": True,
            "sample": SAMPLE_REPORTS[sample_id]
        })
    return jsonify({"success": False, "error": "Sample report not found."}), 404


@app.route("/api/analyze", methods=["POST"])
def analyze_report():
    active_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or gemini_api_key
    if not active_key:
        return jsonify({
            "success": False,
            "error": "Gemini API Key is missing. Please set GEMINI_API_KEY in your .env file."
        }), 400

    genai.configure(api_key=active_key)

    language = request.args.get("lang", "en")

    # Check for direct text analysis (sample reports or text input)
    if request.is_json:
        data = request.get_json()
        report_text = data.get("text", "").strip()
        lang = data.get("language", language)
        if not report_text:
            return jsonify({"success": False, "error": "No text content provided."}), 400
        
        try:
            analysis = analyze_with_gemini(text_content=report_text, language=lang)
            return jsonify({"success": True, "data": analysis})
        except Exception as e:
            return jsonify({"success": False, "error": f"Gemini AI Analysis error: {str(e)}"}), 500

    # Check for file upload (Image or PDF)
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file uploaded."}), 400

    file = request.files['file']
    lang = request.form.get("language", language)

    if file.filename == '':
        return jsonify({"success": False, "error": "Selected file has no filename."}), 400

    filename = file.filename.lower()
    file_bytes = file.read()

    if not file_bytes:
        return jsonify({"success": False, "error": "Uploaded file is empty."}), 400

    try:
        if filename.endswith(".pdf"):
            extracted_text = extract_text_from_pdf(file_bytes)
            if not extracted_text:
                extracted_text = f"[Scanned PDF Report: {filename}]"
            analysis = analyze_with_gemini(text_content=extracted_text, language=lang)
        elif any(filename.endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp", ".bmp"]):
            pil_image = preprocess_image(file_bytes)
            analysis = analyze_with_gemini(pil_image=pil_image, language=lang)
        else:
            return jsonify({"success": False, "error": "Unsupported file format. Please upload JPG, PNG, WEBP, or PDF."}), 400

        return jsonify({"success": True, "data": analysis})
    except Exception as e:
        return jsonify({"success": False, "error": f"Gemini AI Error: {str(e)}"}), 500


@app.route("/api/chat", methods=["POST"])
def chat_endpoint():
    active_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or gemini_api_key
    if not active_key:
        return jsonify({"success": False, "error": "Gemini API Key missing."}), 400

    genai.configure(api_key=active_key)
    
    data = request.get_json() or {}
    message = data.get("message", "").strip()
    report_context = data.get("report_context", {})
    chat_history = data.get("chat_history", [])
    language = data.get("language", "en")

    if not message:
        return jsonify({"success": False, "error": "Message is required."}), 400

    try:
        reply = chat_with_medical_report(message, report_context, chat_history, language)
        return jsonify({"success": True, "reply": reply})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/health")
def health_check():
    active_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or gemini_api_key
    return jsonify({
        "status": "healthy",
        "service": "AI Medical Lab Reports Analyzer & Multi-Lingual Assistant",
        "engine": "Google Gemini 3.5/3.8 Flash (Vision & Clinical AI)",
        "languages": ["English (en)", "Urdu (ur)", "Roman Urdu (roman_ur)"],
        "api_configured": bool(active_key)
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Medical Assistant Flask Server on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
