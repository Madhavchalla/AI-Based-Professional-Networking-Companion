import os
import requests
import json

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

def generate_conversation_starters(event_description: str, interests: str, themes: list) -> list:
    """
    Generates 2-3 conversation starters using Google Gemini API if key is present,
    or falls back to local intelligent generation.
    """
    interests_list = [i.strip() for i in interests.split(",") if i.strip()]
    primary_interest = interests_list[0] if len(interests_list) > 0 else "technology"
    secondary_interest = interests_list[1] if len(interests_list) > 1 else "innovation"
    
    themes_str = ", ".join(themes)
    interests_str = ", ".join(interests_list)
    
    # Try using Google Gemini API if key is available
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if api_key and api_key.strip() and "YOUR_GEMINI" not in api_key.upper():
        prompt = (
            f"Generate exactly two engaging conversation starters for a user attending a professional networking event.\n\n"
            f"Event Themes: {themes_str}\n"
            f"User Interests: {interests_str}\n\n"
            f"Starter 1: An icebreaker question focusing on {themes_str} and {primary_interest}.\n"
            f"Starter 2: A thought-provoking follow-up topic about future developments in {primary_interest}.\n\n"
            f"Output exactly a JSON list of 2 strings. Example format: [\"Starter 1\", \"Starter 2\"]. Output no other text or markdown."
        )
        
        models = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-pro-latest", "gemini-3.5-flash", "gemini-1.5-flash"]
        for model in models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key.strip()}"
            try:
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}]
                }
                res = requests.post(url, json=payload, timeout=8)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                        if text.startswith("```"):
                            text = text.replace("```json", "").replace("```", "").strip()
                        parsed = json.loads(text)
                        if isinstance(parsed, list) and len(parsed) >= 2:
                            return [str(x).strip() for x in parsed[:2]]
            except Exception:
                continue

    # Local fallback generator if Gemini is not configured or fails
    starter1 = (
        f"I'm attending a networking event focused on {themes_str}. "
        f"I'm personally interested in {interests_str}. "
        f"What are three creative and engaging conversation starters I could use to break the ice?"
    )
    
    starter2 = (
        f"I have always been interested in learning more about the field of {primary_interest} "
        f"as an intersection. The current research on {primary_interest} is very concerning to "
        f"many experts in the field, especially regarding future developments."
    )
    
    return [starter1, starter2]
