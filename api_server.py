import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Header
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
    version="2.4.0"
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
    status: Optional[str] = "Professional"

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

def format_list_human(items: List[str]) -> str:
    clean_items = [i.strip() for i in items if i and i.strip() and i.lower() not in ["any", "observable", "some", "other"]]
    if not clean_items:
        return "these key topics"
    if len(clean_items) == 1:
        return clean_items[0]
    if len(clean_items) == 2:
        return f"{clean_items[0]} and {clean_items[1]}"
    return f"{', '.join(clean_items[:-1])}, and {clean_items[-1]}"

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
def get_me(authorization: Optional[str] = Header(None)):
    return database.get_profile(authorization)

@app.post("/api/auth/logout")
def logout():
    return {"message": "Logged out successfully."}

# Profile Routes
@app.get("/api/profile")
def get_profile(authorization: Optional[str] = Header(None)):
    return database.get_profile(authorization)

@app.post("/api/profile")
def update_profile(profile: ProfileModel, authorization: Optional[str] = Header(None)):
    return database.update_profile(profile.dict(), authorization)

# Event Analysis Route
@app.post("/api/analyze-event")
def analyze_event(req: EventAnalyzeRequest):
    event_desc = req.event_description.strip()
    interests = req.interests.strip()
    
    if not event_desc:
        raise HTTPException(status_code=400, detail="Event description is required.")
    if not interests:
        raise HTTPException(status_code=400, detail="Your specific interests are required.")
        
    topics = extract_themes(event_desc, interests)
    if not topics:
        raise HTTPException(status_code=400, detail="Could not extract meaningful topics from the provided text. Please provide more detail.")
        
    return {
        "event_description": event_desc,
        "interests": interests,
        "topics": topics
    }

# Multi-Step Conversation Generator (Multi-Option per Phase)
@app.post("/api/generate-conversation")
def generate_conversation_flow(req: MultiStepConversationRequest):
    event_desc = req.event_description.strip()
    user_interests = req.interests.strip()
    goal = req.networking_goal.strip() or "Build professional connections"
    
    if not event_desc:
        raise HTTPException(status_code=400, detail="Event description is required to generate conversation starters.")
    if not user_interests:
        raise HTTPException(status_code=400, detail="Please specify your interests before generating conversation starters.")
    
    themes = req.themes or extract_themes(event_desc, user_interests)
    if not themes:
        themes = [i.strip() for i in user_interests.split(",") if i.strip()]
        
    themes_str = format_list_human(themes)
    primary_interest = user_interests.split(',')[0].strip() if user_interests else themes[0]
    first_theme = themes[0] if themes else "this topic"
    
    openers = [
        f"Hi! What brings you to this session on {first_theme}?",
        f"Hello! Have you been following the recent developments in {themes_str}?",
        f"Hi there! What has been the most interesting talk or topic for you at this event so far?"
    ]
    
    if "mentor" in goal.lower():
        follow_ups = [
            f"I'm really interested in building expertise in {primary_interest}. How did you navigate your career path in this domain?",
            f"As someone working around {themes_str}, what advice would you give to someone looking to grow in this area?",
            f"What were some pivotal experiences or projects that helped you master {primary_interest}?"
        ]
    elif "internship" in goal.lower() or "career" in goal.lower():
        follow_ups = [
            f"My background is in {primary_interest}, and I'm actively exploring new opportunities. How are teams in your organization tackling {first_theme} right now?",
            f"What key technical skills or project experience do you value most when hiring for {primary_interest} roles?",
            f"How is your team expanding its efforts in {themes_str}, and what kind of projects are you focusing on?"
        ]
    elif "research" in goal.lower():
        follow_ups = [
            f"I notice your work touches on {themes_str}. What current research questions or methodologies are you most excited about right now?",
            f"What open research challenges in {primary_interest} do you feel are currently under-explored?",
            f"How are you approaching experimental validation or data collection in your {first_theme} projects?"
        ]
    else:
        follow_ups = [
            f"What specific aspect of {first_theme} aligns most with your current projects?",
            f"How is your organization approaching current industry trends in {themes_str}?",
            f"What has been your main focus or initiative recently regarding {primary_interest}?"
        ]

    deeper_questions = [
        f"Looking back at recent advancements in {themes_str}, what's one key decision or architecture lesson that shaped your current approach?",
        f"How do you address open challenges like data quality, security, or ethics when working on {primary_interest}?",
        f"Where do you see the biggest technical bottlenecks or breakthroughs happening in {first_theme} over the next couple of years?"
    ]

    closings = [
        f"I've learned so much from your perspective! Would you be open to connecting on LinkedIn or exchanging contact info?",
        f"This was a super insightful conversation! Would you be open to catching up for a brief 15-minute virtual coffee sometime?",
        f"I'd love to stay updated on your work with {primary_interest}. May I follow up with you on LinkedIn?"
    ]

    gpt2_starters = generate_conversation_starters(event_desc, user_interests, themes)

    multi_step_flow = [
        {
            "step": 1,
            "stage": "Step 1 • Opening Icebreaker",
            "explanation": "Gentle, low-pressure icebreakers to initiate conversation naturally.",
            "options": openers,
            "question": openers[0]
        },
        {
            "step": 2,
            "stage": "Step 2 • Follow-Up Question",
            "explanation": f"Explores current work while aligning with your goal: '{goal}'.",
            "options": follow_ups,
            "question": follow_ups[0]
        },
        {
            "step": 3,
            "stage": "Step 3 • Deeper Technical / Industry Focus",
            "explanation": f"Drives a meaningful conversation around {themes_str}.",
            "options": deeper_questions,
            "question": deeper_questions[0]
        },
        {
            "step": 4,
            "stage": "Step 4 • Connection & Closing Question",
            "explanation": "Seamless transition to secure contact info and build a lasting professional link.",
            "options": closings,
            "question": closings[0]
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
def match_person(req: PersonMatchRequest, authorization: Optional[str] = Header(None)):
    person_name = req.name.strip()
    person_title = req.title.strip()
    person_interests = [i.strip() for i in req.person_interests if i.strip()]
    
    if not person_name or not person_title:
        raise HTTPException(status_code=400, detail="Person name and title/role are required for matching.")
        
    user_profile = database.get_profile(authorization)
    user_interests = [i.lower().strip() for i in user_profile.get("interests", [])]
    
    common = []
    for pi in person_interests:
        for ui in user_interests:
            if ui in pi.lower() or pi.lower() in ui or any(w in pi.lower() for w in ui.split()):
                if pi not in common:
                    common.append(pi)

    overlap_count = len(common)
    match_percentage = min(95, max(40, 50 + (overlap_count * 20))) if common else 50
    
    reason = (
        f"You share strong alignment in {format_list_human(common)}." if common 
        else f"Complementary background between {person_title} and your focus on {format_list_human(user_interests) if user_interests else 'tech'}."
    )
    
    opener = (
        f"Hi {person_name.split()[0]}, I noticed your work in {common[0] if common else person_title}. "
        f"I've been exploring {user_interests[0] if user_interests else 'this area'} as well—what project are you currently most focused on?"
    )
    
    matched_person_obj = {
        "name": person_name,
        "title": person_title,
        "interests": person_interests,
        "common_interests": common if common else person_interests,
        "match_percentage": match_percentage,
        "reason_to_connect": reason,
        "suggested_opener": opener,
        "notes": req.notes
    }
    
    res = database.add_person(matched_person_obj, authorization)
    if isinstance(res, dict) and "error" in res:
        matched_person_obj["saved"] = False
        matched_person_obj["save_message"] = res["error"]
    else:
        matched_person_obj["saved"] = True
        
    return matched_person_obj

# Wikipedia Fact Verification
@app.get("/api/wiki-reference")
def get_wiki_reference(query: str):
    if not query.strip():
        raise HTTPException(status_code=400, detail="Search topic query is required.")
    summary = verify_fact(query)
    return {
        "query": query,
        "reference_summary": summary,
        "source": "Wikipedia API (Topic Information Reference)"
    }

# Post-Conversation Follow-Up Assistant
@app.post("/api/generate-followup")
def generate_followup(req: FollowUpRequest, authorization: Optional[str] = Header(None)):
    name = req.person_name.strip()
    event = req.event_name.strip()
    notes = req.notes.strip()
    
    if not name or not event or not notes:
        raise HTTPException(status_code=400, detail="Person name, event name, and conversation notes are required.")
    
    first_name = name.split()[0]
    subject = f"Great meeting you at {event}!"
    
    profile = database.get_profile(authorization)
    profile_name = profile.get('name', '')
    sender = profile_name if (profile_name and profile_name != "Guest User") else "Professional Networker"
    
    body = (
        f"Hi {first_name},\n\n"
        f"It was a pleasure meeting you at {event}. I really enjoyed our conversation regarding \"{notes}\".\n\n"
        f"I'd love to stay in touch and follow your work. Let me know if you'd ever be open to catching up for a brief virtual coffee!\n\n"
        f"Best regards,\n"
        f"{sender}"
    )
    
    return {
        "person_name": name,
        "event_name": event,
        "notes": notes,
        "email_subject": subject,
        "followup_message": body
    }

# User-Scoped History & Session Management
@app.get("/api/history")
def get_history(authorization: Optional[str] = Header(None)):
    return database.get_sessions(authorization)

@app.post("/api/history")
def save_session(session: SessionSaveRequest, authorization: Optional[str] = Header(None)):
    res = database.add_session(session.dict(), authorization)
    if isinstance(res, dict) and "error" in res:
        raise HTTPException(status_code=401, detail=res["error"])
    return res

# User-Scoped Saved People List
@app.get("/api/people")
def get_people(authorization: Optional[str] = Header(None)):
    return database.get_people(authorization)

# Feedback Logger
@app.post("/api/feedback")
def log_feedback(req: FeedbackRequest, authorization: Optional[str] = Header(None)):
    return database.log_feedback_item(req.starter_text, req.action, req.category, authorization)

# Analytics Endpoint
@app.get("/api/analytics")
def get_analytics(authorization: Optional[str] = Header(None)):
    return database.get_analytics(authorization)

