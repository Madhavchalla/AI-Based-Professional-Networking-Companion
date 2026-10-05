import os
import json
import hashlib
from datetime import datetime

DB_FILE = "db.json"

DEFAULT_DB = {
    "users": {},  # Maps token -> user_object
    "email_to_token": {}  # Maps email -> token
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

# Get user by bearer token
def get_user_by_token(token: str):
    if not token or not token.strip():
        return None
    db = load_db()
    users = db.get("users", {})
    clean_token = token.replace("Bearer ", "").strip()
    return users.get(clean_token)

# Register User with 100% Isolated Data Space
def register_user(name: str, email: str, password: str, status: str = "Professional"):
    db = load_db()
    users = db.get("users", {})
    email_map = db.get("email_to_token", {})
    
    email_clean = email.strip().lower()
    if email_clean in email_map:
        return {"error": "An account with this email already exists."}
        
    pwd_hash = hashlib.sha256(password.encode()).hexdigest()
    user_id = f"usr_{int(datetime.now().timestamp() * 1000)}"
    token = f"token_{user_id}_{hashlib.md5(email_clean.encode()).hexdigest()[:8]}"
    
    user_obj = {
        "id": user_id,
        "token": token,
        "name": name.strip(),
        "email": email_clean,
        "password_hash": pwd_hash,
        "status": status.strip() or "Professional",
        "skills": [],
        "interests": [],
        "career_goals": "Configure your career goals in the User Profile tab.",
        "preferred_goals": ["Build professional connections"],
        "conversation_style": "Balanced (Technical + Professional)",
        "sessions": [],
        "people": [],
        "feedback": [],
        "preferences": {
            "technical_weight": 0.5,
            "career_weight": 0.5,
            "industry_weight": 0.5,
            "research_weight": 0.5
        }
    }
    
    users[token] = user_obj
    email_map[email_clean] = token
    db["users"] = users
    db["email_to_token"] = email_map
    save_db(db)
    
    # Return user object without sensitive hash
    res = {k: v for k, v in user_obj.items() if k not in ["password_hash", "sessions", "people", "feedback"]}
    return res

# Login User
def login_user(email: str, password: str):
    db = load_db()
    email_map = db.get("email_to_token", {})
    users = db.get("users", {})
    
    email_clean = email.strip().lower()
    token = email_map.get(email_clean)
    
    if not token or token not in users:
        return {"error": "No account found with this email. Please register."}
        
    user_obj = users[token]
    pwd_hash = hashlib.sha256(password.encode()).hexdigest()
    
    if user_obj.get("password_hash") != pwd_hash:
        return {"error": "Invalid password. Please try again."}
        
    res = {k: v for k, v in user_obj.items() if k not in ["password_hash", "sessions", "people", "feedback"]}
    return res

# Profile Functions (Token-Isolated)
def get_profile(token: str = None):
    user = get_user_by_token(token)
    if not user:
        return {
            "name": "",
            "email": "",
            "status": "Not Signed In",
            "skills": [],
            "interests": [],
            "career_goals": "",
            "preferred_goals": [],
            "conversation_style": "Balanced (Technical + Professional)"
        }
    return {
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "status": user.get("status", ""),
        "skills": user.get("skills", []),
        "interests": user.get("interests", []),
        "career_goals": user.get("career_goals", ""),
        "preferred_goals": user.get("preferred_goals", []),
        "conversation_style": user.get("conversation_style", "Balanced (Technical + Professional)")
    }

def update_profile(profile_data: dict, token: str = None):
    user = get_user_by_token(token)
    if not user:
        return profile_data
        
    db = load_db()
    u_token = user["token"]
    if u_token in db.get("users", {}):
        db["users"][u_token]["name"] = profile_data.get("name", db["users"][u_token]["name"])
        db["users"][u_token]["status"] = profile_data.get("status", db["users"][u_token]["status"])
        db["users"][u_token]["skills"] = profile_data.get("skills", db["users"][u_token]["skills"])
        db["users"][u_token]["interests"] = profile_data.get("interests", db["users"][u_token]["interests"])
        db["users"][u_token]["career_goals"] = profile_data.get("career_goals", db["users"][u_token]["career_goals"])
        db["users"][u_token]["preferred_goals"] = profile_data.get("preferred_goals", db["users"][u_token]["preferred_goals"])
        db["users"][u_token]["conversation_style"] = profile_data.get("conversation_style", db["users"][u_token]["conversation_style"])
        save_db(db)
        return get_profile(u_token)
    return profile_data

# User-Isolated Sessions / History Functions
def get_sessions(token: str = None):
    user = get_user_by_token(token)
    if not user:
        return []
    return user.get("sessions", [])

def add_session(session: dict, token: str = None):
    user = get_user_by_token(token)
    if not user:
        return {"error": "Authentication required to save networking sessions."}
        
    db = load_db()
    u_token = user["token"]
    user_sessions = db["users"][u_token].get("sessions", [])
    
    session["id"] = f"session_{len(user_sessions) + 1}_{int(datetime.now().timestamp())}"
    session["created_at"] = datetime.now().isoformat()
    
    user_sessions.insert(0, session)
    db["users"][u_token]["sessions"] = user_sessions
    save_db(db)
    return session

# User-Isolated Contacts / People Functions
def get_people(token: str = None):
    user = get_user_by_token(token)
    if not user:
        return []
    return user.get("people", [])

def add_person(person: dict, token: str = None):
    user = get_user_by_token(token)
    if not user:
        return {"error": "Authentication required to save contacts."}
        
    db = load_db()
    u_token = user["token"]
    user_people = db["users"][u_token].get("people", [])
    
    person["id"] = f"person_{len(user_people) + 1}_{int(datetime.now().timestamp())}"
    person["created_at"] = datetime.now().isoformat()
    
    user_people.insert(0, person)
    db["users"][u_token]["people"] = user_people
    save_db(db)
    return person

# User-Isolated Feedback Functions
def log_feedback_item(starter_text: str, action: str, category: str = "general", token: str = None):
    user = get_user_by_token(token)
    if not user:
        return {"success": True}
        
    db = load_db()
    u_token = user["token"]
    user_feedback = db["users"][u_token].get("feedback", [])
    
    new_entry = {
        "timestamp": datetime.now().isoformat(),
        "starter_text": starter_text,
        "feedback": action,
        "category": category
    }
    user_feedback.insert(0, new_entry)
    db["users"][u_token]["feedback"] = user_feedback
    save_db(db)
    return {"feedback": new_entry}

# User-Isolated Analytics
def get_analytics(token: str = None):
    user = get_user_by_token(token)
    if not user:
        return {
            "total_events": 0,
            "total_people": 0,
            "total_conversations": 0,
            "upvotes": 0,
            "downvotes": 0,
            "positive_rate": 0.0,
            "goal_breakdown": {},
            "top_topics": [],
            "preferences": {"technical_weight": 0.5, "career_weight": 0.5, "industry_weight": 0.5, "research_weight": 0.5}
        }
        
    sessions = user.get("sessions", [])
    people = user.get("people", [])
    feedbacks = user.get("feedback", [])
    
    total_events = len(sessions)
    total_people = len(people)
    total_conversations = sum(len(s.get("starters", s.get("multi_step_flow", []))) for s in sessions)
    
    upvotes = len([f for f in feedbacks if f.get("feedback") == "like"])
    downvotes = len([f for f in feedbacks if f.get("feedback") == "dislike"])
    
    goal_counts = {}
    for s in sessions:
        g = s.get("goal", "Build professional connections")
        goal_counts[g] = goal_counts.get(g, 0) + 1
        
    topic_counts = {}
    for s in sessions:
        for t in s.get("topics", []):
            topic_counts[t] = topic_counts.get(t, 0) + 1
            
    pos_rate = round((upvotes / (upvotes + downvotes) * 100), 1) if (upvotes + downvotes) > 0 else 0.0
    
    return {
        "total_events": total_events,
        "total_people": total_people,
        "total_conversations": total_conversations,
        "upvotes": upvotes,
        "downvotes": downvotes,
        "positive_rate": pos_rate,
        "goal_breakdown": goal_counts,
        "top_topics": sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:5],
        "preferences": user.get("preferences", {"technical_weight": 0.5, "career_weight": 0.5, "industry_weight": 0.5, "research_weight": 0.5})
    }
