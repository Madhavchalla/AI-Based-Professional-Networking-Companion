import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY")

event_description = "A summit on AI-driven Cybersecurity and Ethical Hacking, focusing on zero-trust architectures and automated vulnerability assessment."
interests = "Ethical Hacking, Penetration Testing, AI Threat Detection"
goal = "Seeking Mentorship"
themes = ["Cybersecurity", "Ethical Hacking", "Zero-Trust"]

prompt = f"""You are an expert executive networking coach. Generate a 4-step professional networking conversation sequence for an attendee speaking to a peer, speaker, or expert at an event.

Context:
- Event: {event_description}
- User Interests: {interests}
- User Goal: {goal}
- Key Themes: {", ".join(themes)}

Create natural, realistic, highly specific questions (NOT generic templates like "Hi! What brings you to..."). 
The questions must reflect actual domain knowledge of {interests} and {themes[0]}.

Generate 4 steps. Each step must have 3 distinct options (Option 1: Technical & Direct, Option 2: Casual & Engaging, Option 3: Strategic & Goal-Focused).

Step 1: Opening Icebreaker (low-pressure, context-driven conversation starter)
Step 2: Follow-Up Question (connects event topic to the user's goal: {goal})
Step 3: Deeper Technical / Industry Focus (explores real-world challenges, trade-offs, or innovations in {interests})
Step 4: Connection & Closing Question (smooth transition to stay in touch, connect on LinkedIn, or grab coffee)

Output ONLY a JSON array with 4 objects. Each object must have:
- "step": integer (1, 2, 3, 4)
- "stage": string (e.g. "Step 1 • Opening Icebreaker")
- "explanation": string (brief context of the phase)
- "options": list of 3 strings (the 3 distinct question options)
- "question": string (copy of options[0])

No markdown, no markdown backticks, just raw JSON.
"""

# Let's list models from Gemini API first!
list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
r = requests.get(list_url)
print("List models status:", r.status_code)
if r.status_code == 200:
    models_data = r.json()
    gen_models = [m["name"].replace("models/", "") for m in models_data.get("models", []) if "generateContent" in m.get("supportedGenerationMethods", [])]
    print("Available generateContent models:", gen_models[:10])
else:
    print("List models error:", r.text[:200])
    gen_models = ["gemini-3.8-flash", "gemini-2.0-flash", "gemini-1.5-flash-8b", "gemini-flash-latest"]

for model in gen_models[:8]:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    print(f"\nTrying model {model}...")
    try:
        res = requests.post(url, json=payload, timeout=10)
        print("Status:", res.status_code)
        if res.status_code == 200:
            data = res.json()
            candidates = data.get("candidates", [])
            if candidates:
                text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                if text.startswith("```"):
                    text = text.replace("```json", "").replace("```", "").strip()
                parsed = json.loads(text)
                print("SUCCESS! Output structure:")
                print(json.dumps(parsed, indent=2))
                break
        else:
            print("Error response:", res.text[:250])
    except Exception as e:
        print("Exception:", e)
