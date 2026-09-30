import os
import requests
import json

def generate_conversation_starters(event_description: str, interests: str, themes: list) -> list:
    """
    Generates 2-3 conversation starters.
    Mimics GPT-2 text generation pipeline.
    """
    interests_list = [i.strip() for i in interests.split(",") if i.strip()]
    primary_interest = interests_list[0] if len(interests_list) > 0 else "technology"
    secondary_interest = interests_list[1] if len(interests_list) > 1 else "innovation"
    
    themes_str = ", ".join(themes)
    interests_str = ", ".join(interests_list)
    
    # Try using Gemini API if key is available
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key and api_key != "MY_GEMINI_API_KEY" and api_key.strip():
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        prompt = (
            f"You are GPT-2, a text-generation language model.\n"
            f"Generate exactly two conversation starters for a user attending a networking event.\n\n"
            f"Event Themes: {themes_str}\n"
            f"User Interests: {interests_str}\n\n"
            f"Make Starter 1 exactly the prompt template style: "
            f"'I'm attending a networking event focused on {themes_str}. I'm personally interested in {interests_str}. What are three creative and engaging conversation starters I could use to break the ice?'\n\n"
            f"Make Starter 2 a more speculative, human-like completion in GPT-2 style (which can end slightly incomplete, e.g., 'I have always been interested in learning more about the field of {primary_interest} and how it impacts {secondary_interest}. Recently, I was reading about...'):\n\n"
            f"Output exactly a JSON list of 2 strings. Example format: [\"Starter 1\", \"Starter 2\"]. No other text or markdown."
        )
        try:
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "responseMimeType": "application/json"
                }
            }
            res = requests.post(url, json=payload, timeout=8)
            if res.status_code == 200:
                data = res.json()
                text = data["contents"][0]["parts"][0]["text"].strip()
                parsed = json.loads(text)
                if isinstance(parsed, list) and len(parsed) >= 2:
                    return [str(x).strip() for x in parsed[:2]]
        except Exception as e:
            pass

    # Local fallback generator if Gemini is not working or API key is not present
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
