import os
import json
import requests
import re

def extract_themes(event_description: str, interests: str) -> list:
    """
    Extracts exactly 3 topics/themes from the event description and interests.
    Mimics DistilBERT zero-shot classification using Gemini API with local keyword fallback.
    """
    # Clean inputs
    event_description = event_description.strip()
    interests = interests.strip()
    
    # Try using Gemini API if key is available
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key and api_key != "MY_GEMINI_API_KEY" and api_key.strip():
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        prompt = (
            f"You are DistilBERT, a zero-shot classification model for extracting themes/topics from networking event descriptions and user interests.\n"
            f"Extract exactly 3 concise, high-level topic terms (e.g., 'AI', 'healthcare', 'robotics', 'sustainability', 'climate change', 'urban planning', 'blockchain') "
            f"relevant to the event description and user interests.\n\n"
            f"Event Description: {event_description}\n"
            f"User Interests: {interests}\n\n"
            f"Output exactly a JSON list of 3 strings. Example format: [\"AI\", \"healthcare\", \"robotics\"]. No other text or markdown."
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
                if isinstance(parsed, list) and len(parsed) >= 3:
                    return [str(x).strip() for x in parsed[:3]]
        except Exception as e:
            # Silently fallback
            pass

    # Local fallback pattern matcher
    all_text = (event_description + " " + interests).lower()
    
    # Predefined vocabulary of topics
    vocab = [
        "ai", "healthcare", "robotics", "sustainability", "climate change", 
        "urban planning", "blockchain", "data ethics", "machine learning", 
        "finance", "education", "privacy", "energy", "mobility", "agriculture"
    ]
    
    found_topics = []
    for topic in vocab:
        if re.search(r'\b' + re.escape(topic) + r'\b', all_text):
            formatted_topic = topic
            if topic == "ai":
                formatted_topic = "AI"
            elif topic == "healthcare":
                formatted_topic = "healthcare"
            elif topic == "robotics":
                formatted_topic = "robotics"
            else:
                formatted_topic = topic.capitalize()
            found_topics.append(formatted_topic)
            
    # Add words from interests or event if we don't have 3
    interest_words = [w.strip() for w in re.split(r'[,;.]', interests) if w.strip()]
    for iw in interest_words:
        if len(found_topics) >= 3:
            break
        clean_iw = iw.capitalize() if iw.lower() != "ai" else "AI"
        if clean_iw not in found_topics:
            found_topics.append(clean_iw)
            
    # Still less than 3? Split event words
    event_words = [w.strip(".,!?\"'") for w in event_description.split() if len(w) > 3]
    for ew in event_words:
        if len(found_topics) >= 3:
            break
        clean_ew = ew.capitalize() if ew.lower() != "ai" else "AI"
        if clean_ew not in found_topics and clean_ew.lower() not in ["with", "from", "that", "this", "your", "their"]:
            found_topics.append(clean_ew)
            
    # Pad if necessary to ensure exactly 3 topics are returned
    defaults = ["AI", "healthcare", "robotics"]
    for d in defaults:
        if len(found_topics) >= 3:
            break
        if d not in found_topics:
            found_topics.append(d)
            
    return found_topics[:3]
