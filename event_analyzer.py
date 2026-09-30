import os
import json
import requests
import re

def extract_themes(event_description: str, interests: str) -> list:
    """
    Extracts high-level topics/themes derived strictly from the user's event description and interests.
    Uses Gemini API if available, or dynamic NLP keyword/phrase extraction from the input text.
    Does NOT return hardcoded default topics or garbage stop words.
    """
    event_desc = event_description.strip()
    user_int = interests.strip()
    
    if not event_desc and not user_int:
        return []
    
    # Try using Gemini API if key is available
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key and api_key != "MY_GEMINI_API_KEY" and api_key.strip():
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        prompt = (
            f"Extract 2 to 4 concise, key topic terms strictly present in or directly relevant to the following event and user interests.\n\n"
            f"Event Description: {event_desc}\n"
            f"User Interests: {user_int}\n\n"
            f"Output ONLY a valid JSON list of strings. Example: [\"Quantum Computing\", \"Machine Learning\"]. No other text or markdown."
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
                if isinstance(parsed, list) and len(parsed) > 0:
                    return [str(x).strip() for x in parsed[:4]]
        except Exception:
            pass

    # Dynamic NLP Keyword / Keyphrase Extraction from user's actual text
    extracted_topics = []
    
    # 1. Extract interest terms explicitly listed by user
    if user_int:
        for item in re.split(r'[,;.]', user_int):
            clean_item = item.strip()
            if len(clean_item) > 1 and clean_item.lower() not in [t.lower() for t in extracted_topics]:
                if clean_item.lower() == "ai":
                    extracted_topics.append("AI")
                elif clean_item.lower() == "ml":
                    extracted_topics.append("Machine Learning")
                else:
                    extracted_topics.append(clean_item.title())

    # Stop words and generic noise words to filter out
    stop_words = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", 
        "by", "from", "up", "about", "into", "over", "after", "is", "are", "was", "were", 
        "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", 
        "should", "can", "could", "may", "might", "must", "this", "that", "these", "those", 
        "your", "their", "our", "its", "event", "session", "conference", "meetup", "summit",
        "any", "some", "other", "also", "main", "many", "all", "observable", "which", "what",
        "how", "why", "who", "where", "when", "there", "here", "just", "more", "most"
    }

    words = re.findall(r'\b[A-Za-z0-9\-]+\b', event_desc)
    
    for w in words:
        if len(extracted_topics) >= 4:
            break
        w_clean = w.strip()
        if len(w_clean) > 3 and w_clean.lower() not in stop_words:
            formatted = w_clean.upper() if w_clean.lower() in ["ai", "ml", "llm", "api", "nlp"] else w_clean.capitalize()
            if formatted.lower() not in [t.lower() for t in extracted_topics]:
                extracted_topics.append(formatted)

    return extracted_topics[:4]
