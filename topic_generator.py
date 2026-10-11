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
    
    themes_clean = [t for t in themes if t and t.lower() not in ["today", "landscape", "occurrence", "recent"]]
    themes_str = ", ".join(themes_clean) if themes_clean else primary_interest
    interests_str = ", ".join(interests_list)
    
    # Try using Google Gemini API if key is available
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if api_key and api_key.strip() and "YOUR_GEMINI" not in api_key.upper():
        prompt = (
            f"Generate exactly two natural, engaging conversation starters for a user attending a professional networking event.\n\n"
            f"Event Context: {event_description}\n"
            f"Key Themes: {themes_str}\n"
            f"User Interests: {interests_str}\n\n"
            f"Starter 1: An icebreaker question focusing on {primary_interest} in the context of the event.\n"
            f"Starter 2: A thought-provoking follow-up question about real-world developments in {primary_interest}.\n\n"
            f"Output exactly a JSON list of 2 strings. Example format: [\"Starter 1\", \"Starter 2\"]. Output no other text or markdown."
        )
        
        models = ["gemini-flash-lite-latest", "gemini-2.5-flash-lite", "gemini-flash-latest", "gemini-pro-latest"]
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
        f"I've been following the discussions on {primary_interest} closely today. "
        f"How is your team approaching practical implementation in this space?"
    )
    
    starter2 = (
        f"Given the rapid developments in {primary_interest}, what do you see as the biggest "
        f"technical trade-off or challenge when deploying these solutions in production?"
    )
    
    return [starter1, starter2]


def generate_multi_stage_sequence(
    event_title: str,
    event_description: str,
    interests: str,
    networking_goal: str,
    themes: list
) -> list:
    """
    Generates a full 4-stage multi-option conversation sequence tailored to the event, user interests, and networking goal.
    Uses Google Gemini API for 100% natural AI generation when available, with an organic local fallback.
    """
    interests_list = [i.strip() for i in interests.split(",") if i.strip()]
    primary_interest = interests_list[0] if interests_list else "technology"
    
    themes_clean = [t for t in themes if t and t.lower() not in ["today", "landscape", "occurrence", "recent", "advancement"]]
    themes_str = ", ".join(themes_clean) if themes_clean else primary_interest
    goal = networking_goal.strip() or "Build professional connections"
    
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if api_key and api_key.strip() and "YOUR_GEMINI" not in api_key.upper():
        prompt = f"""You are a top-tier executive networking coach. Generate a 4-step professional networking conversation sequence for an attendee speaking to a peer, speaker, mentor, or expert at an event.

Context:
- Event Title/Context: {event_title or "Networking Event"}
- Event Description: {event_description}
- User Interests: {interests}
- User Goal: {goal}
- Key Topics/Themes: {themes_str}

CRITICAL RULES FOR GENERATION:
1. Write 100% realistic, context-specific questions spoken naturally by an attendee approaching someone at this specific event.
2. DO NOT use generic template patterns like "Hi! What brings you to this session on [Topic]?" or "Looking back at recent advancements in [List of words]...".
3. Write with genuine domain terminology related to {interests} and {event_description}.
4. Provide 3 DISTINCT options for each of the 4 steps (Option 1: Technical & Direct, Option 2: Conversational & Engaging, Option 3: Strategic & Goal-Focused).

The 4 steps are:
Step 1 • Opening Icebreaker: Natural, context-driven conversation starter referencing the event topics or talks.
Step 2 • Follow-Up Question: Connects the discussion naturally to the user's specific goal ({goal}).
Step 3 • Deeper Technical / Industry Focus: Explores real-world challenges, trade-offs, architecture, or industry trends.
Step 4 • Connection & Closing Question: Smooth transition to exchange contact info, LinkedIn profiles, or schedule a follow-up.

Output ONLY a JSON array with 4 objects. Format:
[
  {{
    "step": 1,
    "stage": "Step 1 • Opening Icebreaker",
    "explanation": "Gentle, context-driven icebreaker tailored to the event atmosphere.",
    "options": ["Option 1...", "Option 2...", "Option 3..."],
    "question": "Option 1..."
  }},
  {{
    "step": 2,
    "stage": "Step 2 • Follow-Up Question",
    "explanation": "Connects event topic to your goal: {goal}.",
    "options": ["Option 1...", "Option 2...", "Option 3..."],
    "question": "Option 1..."
  }},
  {{
    "step": 3,
    "stage": "Step 3 • Deeper Technical / Industry Focus",
    "explanation": "Drives meaningful technical dialogue around key challenges.",
    "options": ["Option 1...", "Option 2...", "Option 3..."],
    "question": "Option 1..."
  }},
  {{
    "step": 4,
    "stage": "Step 4 • Connection & Closing Question",
    "explanation": "Natural transition to stay connected post-event.",
    "options": ["Option 1...", "Option 2...", "Option 3..."],
    "question": "Option 1..."
  }}
]
No markdown codeblocks or extra text. Output ONLY valid raw JSON.
"""
        models = ["gemini-flash-lite-latest", "gemini-2.5-flash-lite", "gemini-flash-latest", "gemini-pro-latest"]
        for model in models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key.strip()}"
            try:
                payload = {"contents": [{"parts": [{"text": prompt}]}]}
                res = requests.post(url, json=payload, timeout=10)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                        if text.startswith("```"):
                            text = text.replace("```json", "").replace("```", "").strip()
                        parsed = json.loads(text)
                        if isinstance(parsed, list) and len(parsed) == 4:
                            # Verify structure
                            valid = True
                            for item in parsed:
                                if "options" not in item or not isinstance(item["options"], list) or len(item["options"]) == 0:
                                    valid = False
                                    break
                                item["question"] = item["options"][0]
                            if valid:
                                return parsed
            except Exception:
                continue

    # Organic Fallback Generator if Gemini API is offline or unconfigured
    # Step 1: Openers
    step1_options = [
        f"I really enjoyed the insights shared about {primary_interest} today. How are you and your team approaching these ideas in your current work?",
        f"The discussions around {themes_str} have been really compelling. What has been the most impactful takeaway for you at this event so far?",
        f"It's great meeting someone else focused on {primary_interest}. Are you presenting on a session today or exploring the main tracks?"
    ]
    
    # Step 2: Follow-up based on goal
    goal_lower = goal.lower()
    if "mentor" in goal_lower:
        step2_options = [
            f"I'm actively working to deepen my expertise in {primary_interest}. Looking back, what key decisions or experiences helped shape your career in this domain?",
            f"As someone passionate about growing in {primary_interest}, I'd love to hear how you approached building strong practical foundations early in your journey.",
            f"What key challenges did you navigate when leading complex initiatives around {themes_str}, and what advice would you give to someone building expertise?"
        ]
    elif "internship" in goal_lower or "career" in goal_lower or "job" in goal_lower:
        step2_options = [
            f"My background centers on {primary_interest}, and I'm actively exploring high-impact team opportunities. What technical capabilities or qualities do you value most when expanding your team?",
            f"How is your organization currently expanding its technical initiatives around {themes_str}, and what kind of projects are taking priority?",
            f"I'm looking to transition into roles focused on {primary_interest}. What advice would you give to someone aiming to make a strong contribution right away?"
        ]
    elif "research" in goal_lower or "collaborat" in goal_lower:
        step2_options = [
            f"My current focus is in {primary_interest}. What open research questions or experimental methodologies in this space are you most excited about right now?",
            f"What data quality or validation challenges have you encountered when applying {themes_str} models in practice?",
            f"How do you see current research in {primary_interest} transitioning into production-ready solutions over the coming year?"
        ]
    else:
        step2_options = [
            f"How has your organization's technical strategy around {primary_interest} evolved over the past year?",
            f"What is the biggest operational or technical bottleneck your team faces when working with {themes_str}?",
            f"Where do you see the most promising opportunities emerging in {primary_interest} over the coming months?"
        ]

    # Step 3: Deeper Technical
    step3_options = [
        f"When scaling applications in {primary_interest}, how do you balance real-time performance requirements with security and system reliability?",
        f"What trade-offs or architectural decisions have been most critical when implementing {themes_str} pipelines in practice?",
        f"Given how rapidly {primary_interest} is evolving, what core practices or tools have proven most reliable in your day-to-day workflow?"
    ]

    # Step 4: Closings
    step4_options = [
        f"This has been an incredibly insightful chat! Would you be open to connecting on LinkedIn so we can stay in touch?",
        f"I'd love to follow your work in {primary_interest}. May I drop you a quick note on LinkedIn or exchange contact details?",
        f"I know there's a lot happening at the event today, but I'd value picking your brain further. Would you be open to a brief 15-minute virtual coffee next week?"
    ]

    return [
        {
            "step": 1,
            "stage": "Step 1 • Opening Icebreaker",
            "explanation": "Gentle, low-pressure icebreaker tailored to the event atmosphere.",
            "options": step1_options,
            "question": step1_options[0]
        },
        {
            "step": 2,
            "stage": "Step 2 • Follow-Up Question",
            "explanation": f"Connects the conversation naturally to your goal: '{goal}'.",
            "options": step2_options,
            "question": step2_options[0]
        },
        {
            "step": 3,
            "stage": "Step 3 • Deeper Technical / Industry Focus",
            "explanation": f"Drives meaningful technical dialogue around {themes_str}.",
            "options": step3_options,
            "question": step3_options[0]
        },
        {
            "step": 4,
            "stage": "Step 4 • Connection & Closing Question",
            "explanation": "Smooth transition to exchange contact info and build a lasting professional link.",
            "options": step4_options,
            "question": step4_options[0]
        }
    ]
