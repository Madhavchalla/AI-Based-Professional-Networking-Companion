import os
import json
from datetime import datetime

DB_FILE = "db.json"

DEFAULT_DB = {
    "profile": {
        "name": "Challa Madhav",
        "status": "AI Engineer & Researcher",
        "skills": ["Machine Learning", "Python", "React", "Data Ethics", "FastAPI"],
        "interests": ["Artificial Intelligence", "Generative AI", "Career Growth", "Patient Safety", "Data Ethics"],
        "career_goals": "Targeting AI Research & Machine Learning Engineering roles at top tech companies.",
        "preferred_goals": ["Find a mentor", "Explore career opportunities", "Meet researchers"],
        "conversation_style": "Balanced (Technical + Professional)"
    },
    "sessions": [],
    "people": [
        {
            "id": "person_1",
            "name": "Dr. Rahul Sharma",
            "title": "Senior AI Researcher at BioHealth AI",
            "interests": ["Generative AI", "Machine Learning", "Patient Safety", "Healthcare AI"],
            "notes": "Met at AI Health Summit. Working on LLM safety in clinical diagnosis.",
            "common_interests": ["Generative AI", "Machine Learning", "Patient Safety"],
            "reason_to_connect": "High overlap in AI healthcare ethics and machine learning application.",
            "suggested_opener": "What challenges are you seeing when deploying LLM models in patient care?",
            "created_at": "2026-09-28T10:30:00"
        },
        {
            "id": "person_2",
            "name": "Priya Nair",
            "title": "Lead Product Manager at CloudTech",
            "interests": ["Career Growth", "Data Ethics", "AI Product Management"],
            "notes": "Spoke about transition from ML engineering to AI product management.",
            "common_interests": ["Career Growth", "Data Ethics"],
            "reason_to_connect": "Great contact for career advice on AI product strategy.",
            "suggested_opener": "How do you evaluate ethical tradeoffs when prioritizing AI feature roadmaps?",
            "created_at": "2026-09-29T14:15:00"
        }
    ],
    "feedback": [],
    "preferences": {
        "technical_weight": 0.5,
        "career_weight": 0.5,
        "industry_weight": 0.5,
        "research_weight": 0.5
    }
}

def init_db():
    if not os.path.exists(DB_FILE):
        save_db(DEFAULT_DB)

def load_db():
    init_db()
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return DEFAULT_DB

def save_db(data):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

# Profile functions
def get_profile():
    db = load_db()
    return db.get("profile", DEFAULT_DB["profile"])

def update_profile(profile_data):
    db = load_db()
    db["profile"] = profile_data
    save_db(db)
    return db["profile"]

# Sessions / History functions
def get_sessions():
    db = load_db()
    return db.get("sessions", [])

def add_session(session):
    db = load_db()
    if "sessions" not in db:
        db["sessions"] = []
    session["id"] = f"session_{len(db['sessions']) + 1}_{int(datetime.now().timestamp())}"
    session["created_at"] = datetime.now().isoformat()
    db["sessions"].insert(0, session)
    save_db(db)
    return session

# People matching functions
def get_people():
    db = load_db()
    return db.get("people", [])

def add_person(person):
    db = load_db()
    if "people" not in db:
        db["people"] = []
    person["id"] = f"person_{len(db['people']) + 1}_{int(datetime.now().timestamp())}"
    person["created_at"] = datetime.now().isoformat()
    db["people"].insert(0, person)
    save_db(db)
    return person

# Feedback functions
def log_feedback_item(starter_text, action, category="general"):
    db = load_db()
    if "feedback" not in db:
        db["feedback"] = []
    
    new_entry = {
        "timestamp": datetime.now().isoformat(),
        "starter_text": starter_text,
        "feedback": action,
        "category": category
    }
    db["feedback"].insert(0, new_entry)
    
    # Update preference weights based on feedback
    prefs = db.get("preferences", DEFAULT_DB["preferences"])
    text_lower = starter_text.lower()
    
    delta = 0.1 if action == "like" else -0.1
    if any(w in text_lower for w in ["model", "algorithm", "technical", "code", "architecture", "data", "ml", "bert", "gpt"]):
        prefs["technical_weight"] = max(0.1, min(1.0, prefs.get("technical_weight", 0.5) + delta))
    if any(w in text_lower for w in ["career", "role", "growth", "mentor", "internship", "job", "opportunity", "hire"]):
        prefs["career_weight"] = max(0.1, min(1.0, prefs.get("career_weight", 0.5) + delta))
    if any(w in text_lower for w in ["trend", "industry", "market", "field", "future", "product"]):
        prefs["industry_weight"] = max(0.1, min(1.0, prefs.get("industry_weight", 0.5) + delta))
    if any(w in text_lower for w in ["research", "paper", "study", "experiment", "ethics", "finding"]):
        prefs["research_weight"] = max(0.1, min(1.0, prefs.get("research_weight", 0.5) + delta))
        
    db["preferences"] = prefs
    save_db(db)
    return {"feedback": new_entry, "preferences": prefs}

def get_analytics():
    db = load_db()
    sessions = db.get("sessions", [])
    people = db.get("people", [])
    feedbacks = db.get("feedback", [])
    
    total_conversations = sum(len(s.get("multi_step_flow", [])) for s in sessions) + len(feedbacks)
    upvotes = len([f for f in feedbacks if f.get("feedback") == "like"])
    downvotes = len([f for f in feedbacks if f.get("feedback") == "dislike"])
    
    # Goal distribution
    goal_counts = {}
    for s in sessions:
        g = s.get("goal", "Build professional connections")
        goal_counts[g] = goal_counts.get(g, 0) + 1
        
    # Topic distribution
    topic_counts = {}
    for s in sessions:
        for t in s.get("topics", []):
            topic_counts[t] = topic_counts.get(t, 0) + 1
            
    return {
        "total_events": len(sessions),
        "total_people": len(people),
        "total_conversations": max(total_conversations, len(sessions) * 3 + len(people)),
        "upvotes": upvotes,
        "downvotes": downvotes,
        "positive_rate": round((upvotes / (upvotes + downvotes) * 100), 1) if (upvotes + downvotes) > 0 else 100.0,
        "goal_breakdown": goal_counts,
        "top_topics": sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:5],
        "preferences": db.get("preferences", DEFAULT_DB["preferences"])
    }
