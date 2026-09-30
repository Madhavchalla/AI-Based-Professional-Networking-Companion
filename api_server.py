import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import existing modular AI services
from event_analyzer import extract_themes
from topic_generator import generate_conversation_starters
from fact_checker import verify_fact

# Import database services
import database

app = FastAPI(
    title="AI-Based Professional Networking Companion API",
    description="Backend API powering AI theme extraction, multi-step conversation flows, person matching, Wikipedia fact references, follow-up generators, and user authentication.",
    version="2.1.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    status: Optional[str] = "AI Engineer & Researcher"

class LoginRequest(BaseModel):
    email: str
    password: str

class ProfileModel(BaseModel):
    name: str
    status: str
    skills: List[str]
    interests: List[str]
    career_goals: str
    preferred_goals: List[str]
    conversation_style: str
    email: Optional[str] = None

class EventAnalyzeRequest(BaseModel):
    event_description: str
    interests: str

class PersonMatchRequest(BaseModel):
    name: str
    title: str
    person_interests: List[str]
    notes: Optional[str] = ""

class MultiStepConversationRequest(BaseModel):
    event_description: str
    interests: str
    networking_goal: str
    themes: Optional[List[str]] = None
    person_context: Optional[str] = None

class FollowUpRequest(BaseModel):
    person_name: str
    event_name: str
    notes: str
    conversation_highlights: Optional[str] = ""

class FeedbackRequest(BaseModel):
    starter_text: str
    action: str  # "like" or "dislike"
    category: Optional[str] = "general"

class SessionSaveRequest(BaseModel):
    event_name: str
    event_description: str
    interests: str
    goal: str
    topics: List[str]
    starters: List[dict]
    notes: Optional[str] = ""

# API Routes

@app.get("/")
def root():
    return {"message": "AI-Based Professional Networking Companion API Server is running."}

# Authentication Routes
@app.post("/api/auth/register")
def register(req: RegisterRequest):
    if not req.email.strip() or not req.password.strip():
        raise HTTPException(status_code=400, detail="Email and password are required.")
    res = database.register_user(req.name, req.email, req.password, req.status)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@app.post("/api/auth/login")
def login(req: LoginRequest):
    if not req.email.strip() or not req.password.strip():
        raise HTTPException(status_code=400, detail="Email and password are required.")
    res = database.login_user(req.email, req.password)
    if "error" in res:
        raise HTTPException(status_code=401, detail=res["error"])
    return res

@app.get("/api/auth/me")
def get_me():
    return database.get_profile()

@app.post("/api/auth/logout")
def logout():
    return {"message": "Logged out successfully."}

# Profile Routes
@app.get("/api/profile")
def get_profile():
    return database.get_profile()

@app.post("/api/profile")
def update_profile(profile: ProfileModel):
    return database.update_profile(profile.dict())

# Event Analysis Route
@app.post("/api/analyze-event")
def analyze_event(req: EventAnalyzeRequest):
    if not req.event_description.strip():
        raise HTTPException(status_code=400, detail="Event description is required.")
    
    topics = extract_themes(req.event_description, req.interests)
    return {
        "event_description": req.event_description,
        "interests": req.interests,
        "topics": topics
    }

# Multi-Step Conversation Generator
@app.post("/api/generate-conversation")
def generate_conversation_flow(req: MultiStepConversationRequest):
    event_desc = req.event_description.strip()
    user_interests = req.interests.strip()
    goal = req.networking_goal.strip() or "Build professional connections"
    
    themes = req.themes or extract_themes(event_desc, user_interests)
    themes_str = ", ".join(themes)
    
    prefs = database.load_db().get("preferences", {})
    
    opening = f"Hi! What brings you to this session on {themes[0] if themes else 'the event topics'}?"
    
    if "mentor" in goal.lower():
        follow_up = f"I'm really interested in building expertise in {user_interests.split(',')[0] if user_interests else 'this space'}. How did you navigate your career path in this domain?"
        deeper = f"Looking back at your recent projects in {themes_str}, what's one key decision or lesson that shaped your current approach?"
        closing = f"I've learned so much from your perspective! Would you be open to connecting on LinkedIn or grabbing a brief virtual coffee sometime?"
    elif "internship" in goal.lower() or "career" in goal.lower():
        follow_up = f"My background is in {user_interests.split(',')[0] if user_interests else 'tech'}, and I'm looking to apply my skills. How are teams in your organization tackling {themes[0]} right now?"
        deeper = f"What key skills or experience do you value most when bringing new team members into {themes_str} projects?"
        closing = f"This was super insightful! May I share my resume or connect with you on LinkedIn to stay updated on future opportunities?"
    elif "research" in goal.lower():
        follow_up = f"I notice you work around {themes_str}. What current research questions or methodologies are you most excited about right now?"
        deeper = f"How do you address open challenges like data quality or ethics when working on {user_interests.split(',')[0]}?"
        closing = f"I'd love to follow your research work! Could I add you on LinkedIn or exchange contact details?"
    else:
        follow_up = f"What specific aspect of {themes[0] if themes else 'the event'} aligns most with your current focus?"
        deeper = f"How do you see trends in {user_interests.split(',')[0] if user_interests else 'this area'} evolving over the next couple of years?"
        closing = f"It was fantastic exchanging ideas with you! Let's definitely stay connected on LinkedIn."

    gpt2_starters = generate_conversation_starters(event_desc, user_interests, themes)

    multi_step_flow = [
        {
            "step": 1,
            "stage": "Opening Icebreaker",
            "question": opening,
            "explanation": "Gentle, low-pressure question to break the ice naturally."
        },
        {
            "step": 2,
            "stage": "Follow-Up Question",
            "question": follow_up,
            "explanation": f"Explores current work while aligning with your goal: '{goal}'."
        },
        {
            "step": 3,
            "stage": "Deeper Technical / Industry Focus",
            "question": deeper,
            "explanation": f"Drives a meaningful conversation around {themes_str} and {user_interests}."
        },
        {
            "step": 4,
            "stage": "Connection & Closing Question",
            "question": closing,
            "explanation": "Seamless transition to secure contact info and build a lasting professional link."
        }
    ]

    return {
        "event_description": event_desc,
        "interests": user_interests,
        "networking_goal": goal,
        "topics": themes,
        "gpt2_base_starters": gpt2_starters,
        "multi_step_flow": multi_step_flow
    }

# Smart Person & Interest Matcher
@app.post("/api/match-person")
def match_person(req: PersonMatchRequest):
    user_profile = database.get_profile()
    user_interests = [i.lower().strip() for i in user_profile.get("interests", [])]
    person_interests = [i.strip() for i in req.person_interests]
    
    common = []
    for pi in person_interests:
        for ui in user_interests:
            if ui in pi.lower() or pi.lower() in ui or any(w in pi.lower() for w in ui.split()):
                if pi not in common:
                    common.append(pi)

    overlap_count = len(common)
    match_percentage = min(95, max(40, 50 + (overlap_count * 20)))
    
    reason = (
        f"You share strong alignment in {', '.join(common)}." if common 
        else f"Complementary roles in {req.title} and {user_profile.get('status')} offering cross-disciplinary perspective."
    )
    
    opener = (
        f"Hi {req.name.split()[0]}, I noticed your work in {common[0] if common else req.title}. "
        f"I've been exploring {user_interests[0] if user_interests else 'this field'} as well—what project are you currently most focused on?"
    )
    
    matched_person_obj = {
        "name": req.name,
        "title": req.title,
        "interests": req.person_interests,
        "common_interests": common if common else [req.person_interests[0]] if req.person_interests else ["Technology"],
        "match_percentage": match_percentage,
        "reason_to_connect": reason,
        "suggested_opener": opener,
        "notes": req.notes
    }
    
    database.add_person(matched_person_obj)
    return matched_person_obj

# Wikipedia Fact Verification
@app.get("/api/wiki-reference")
def get_wiki_reference(query: str):
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query is required.")
    summary = verify_fact(query)
    return {
        "query": query,
        "reference_summary": summary,
        "source": "Wikipedia API (Topic Information Reference)"
    }

# Post-Conversation Follow-Up Assistant
@app.post("/api/generate-followup")
def generate_followup(req: FollowUpRequest):
    name = req.person_name.strip() or "there"
    event = req.event_name.strip() or "the event"
    notes = req.notes.strip()
    
    first_name = name.split()[0]
    subject = f"Great meeting you at {event}!"
    
    body = (
        f"Hi {first_name},\n\n"
        f"It was a pleasure meeting you at {event}. I really enjoyed our conversation"
    )
    
    if notes:
        body += f", especially your insights on: \"{notes}\"."
    else:
        body += " and learning more about your work."
        
    body += (
        f"\n\nI'd love to stay in touch and follow your work. "
        f"Let me know if you'd ever be open to catching up for a brief virtual coffee!\n\n"
        f"Best regards,\n"
        f"{database.get_profile().get('name', 'Challa Madhav')}"
    )
    
    return {
        "person_name": name,
        "event_name": event,
        "notes": notes,
        "email_subject": subject,
        "followup_message": body
    }

# History & Session Management
@app.get("/api/history")
def get_history():
    return database.get_sessions()

@app.post("/api/history")
def save_session(session: SessionSaveRequest):
    return database.add_session(session.dict())

# Saved People List
@app.get("/api/people")
def get_people():
    return database.get_people()

# Feedback Logger
@app.post("/api/feedback")
def log_feedback(req: FeedbackRequest):
    return database.log_feedback_item(req.starter_text, req.action, req.category)

# Analytics Endpoint
@app.get("/api/analytics")
def get_analytics():
    return database.get_analytics()
