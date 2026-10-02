import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env
load_dotenv()

# Retrieve Gemini API Key
api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or ""
api_key = api_key.strip()

if not api_key:
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line_clean = line.strip()
                if line_clean.startswith("GEMINI_API_KEY=") or line_clean.startswith("GOOGLE_API_KEY="):
                    api_key = line_clean.split("=", 1)[1].strip()
                    break
                elif line_clean and not line_clean.startswith("#") and not line_clean.startswith("OPENAI"):
                    api_key = line_clean

if not api_key:
    print("❌ Error: GEMINI_API_KEY or GOOGLE_API_KEY not found in .env file.")
    exit(1)

print(f"🔑 Gemini API Key detected: {api_key[:8]}...{api_key[-4:]}\n")

try:
    genai.configure(api_key=api_key)
    
    # Priority list of fast & active models
    LATEST_MODELS = [
        "gemini-3.5-flash",
        "gemini-3.8-flash",
        "gemini-flash-latest",
        "gemini-3.7-flash",
        "gemini-3.5-flash-lite"
    ]
    
    print("=" * 65)
    print("🚀 TESTING GEMINI FLASH MODELS")
    print("=" * 65)
    
    for model_name in LATEST_MODELS:
        print(f"\n🔍 Testing '{model_name}'...")
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Respond with 'Active and Ready!' in 3 words.")
            print(f"  🎉 SUCCESS! Model '{model_name}' is WORKING!")
            print(f"  🤖 AI Response: \"{response.text.strip()}\"")
            break  # Exit on first successful active model
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "quota" in err_str.lower():
                print(f"  ⚠️ Quota limit reached for '{model_name}' (HTTP 429). Trying next model...")
            else:
                print(f"  ❌ Error for '{model_name}': {err_str[:120]}")

    print("\n" + "=" * 65)

except Exception as e:
    print(f"❌ Configuration Error: {e}")
