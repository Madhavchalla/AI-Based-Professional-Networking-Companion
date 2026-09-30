import streamlit as st
import os
import json
from datetime import datetime

# Import custom modular services
from event_analyzer import extract_themes
from topic_generator import generate_conversation_starters
from fact_checker import verify_fact

# Ensure state lists are initialized
if "extracted_topics" not in st.session_state:
    st.session_state.extracted_topics = []
if "conversation_starters" not in st.session_state:
    st.session_state.conversation_starters = []
if "last_event" not in st.session_state:
    st.session_state.last_event = ""
if "last_interests" not in st.session_state:
    st.session_state.last_interests = ""
if "show_feedback" not in st.session_state:
    st.session_state.show_feedback = False

# Local data files
HISTORY_FILE = "history.json"
FEEDBACK_FILE = "feedback.json"

def load_json(filepath):
    if not os.path.exists(filepath):
        return []
    try:
        with open(filepath, "r") as f:
            return json.load(f)
    except Exception:
        return []

def save_json(filepath, data):
    try:
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        st.error(f"Error saving to {filepath}: {e}")

def log_feedback(starter_text, action):
    feedbacks = load_json(FEEDBACK_FILE)
    # Check if this exact starter already has feedback to avoid duplicates
    existing = [f for f in feedbacks if f.get("starter_text") == starter_text]
    if existing:
        # Update existing feedback
        for f in feedbacks:
            if f.get("starter_text") == starter_text:
                f["feedback"] = action
                f["timestamp"] = datetime.now().isoformat()
    else:
        new_feedback = {
            "timestamp": datetime.now().isoformat(),
            "starter_text": starter_text,
            "feedback": action
        }
        feedbacks.insert(0, new_feedback)
    save_json(FEEDBACK_FILE, feedbacks)
    st.success(f"Feedback logged successfully!")
    st.rerun()

def log_history(event_desc, interests, topics, starters):
    histories = load_json(HISTORY_FILE)
    new_history = {
        "timestamp": datetime.now().isoformat(),
        "event_description": event_desc,
        "interests": interests,
        "extracted_topics": topics,
        "starters": starters
    }
    histories.insert(0, new_history)
    save_json(HISTORY_FILE, histories)

def format_topics(topics):
    lines = ["["]
    for idx, topic in enumerate(topics):
        lines.append(f"  {idx} : \"{topic}\"")
    lines.append("]")
    return "\n".join(lines)

# Set page configuration
st.set_page_config(
    page_title="Personalized Networking Assistant",
    page_icon="🤝",
    layout="wide"
)

# Custom premium styling injected via HTML/CSS
st.markdown("""
<style>
    /* Dark Theme & Background */
    [data-testid="stAppViewContainer"] {
        background: linear-gradient(135deg, #0e111a 0%, #151928 100%) !important;
        color: #e2e8f0 !important;
        font-family: 'Inter', system-ui, sans-serif !important;
    }
    [data-testid="stHeader"] {
        background: rgba(0,0,0,0) !important;
    }
    
    /* Input Styling */
    textarea, input, [data-baseweb="textarea"], [data-baseweb="input"] {
        background-color: #1a1f33 !important;
        color: #ffffff !important;
        border: 1px solid #2e3452 !important;
        border-radius: 6px !important;
    }
    
    /* Labels and Help Texts */
    label, p, span {
        color: #e2e8f0 !important;
    }
    
    /* Primary buttons (Glowing Orange-Red) */
    div.stButton > button {
        background-color: #ff5e3a !important;
        color: white !important;
        border: none !important;
        border-radius: 4px !important;
        padding: 0.6rem 1.4rem !important;
        font-weight: 700 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
        box-shadow: 0 4px 15px rgba(255, 94, 58, 0.4) !important;
        transition: all 0.2s ease-in-out !important;
    }
    div.stButton > button:hover {
        background-color: #ff7856 !important;
        box-shadow: 0 6px 22px rgba(255, 94, 58, 0.6) !important;
        transform: translateY(-1px) !important;
    }
    div.stButton > button:active {
        transform: translateY(1px) !important;
    }

    /* Tabs Styling */
    button[data-baseweb="tab"] {
        color: #8c9ba5 !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        background: transparent !important;
        border: none !important;
        padding: 10px 20px !important;
    }
    button[data-baseweb="tab"][aria-selected="true"] {
        color: #ff5e3a !important;
        border-bottom: 3px solid #ff5e3a !important;
    }
    
    /* Code block custom theme */
    code, pre {
        background-color: #131726 !important;
        color: #ff7856 !important;
        border: 1px solid #252b45 !important;
        border-radius: 6px !important;
    }
    
    /* Custom Sidebar styling */
    .sidebar-panel {
        background: rgba(255, 255, 255, 0.02) !important;
        border-right: 1px solid rgba(255, 255, 255, 0.05);
        padding: 20px;
        border-radius: 10px;
    }
</style>
""", unsafe_allow_html=True)

# Fetch latest telemetry / feedback statistics
feedbacks = load_json(FEEDBACK_FILE)
upvotes = len([f for f in feedbacks if f.get("feedback") == "like"])
downvotes = len([f for f in feedbacks if f.get("feedback") == "dislike"])
total_votes = upvotes + downvotes
pos_pct = (upvotes / total_votes * 100.0) if total_votes > 0 else 0.0

# Two-column dynamic layout to recreate the technical design of the dashboard
col_side, col_main = st.columns([1, 3], gap="large")

with col_side:
    st.markdown("""
    <div style="margin-bottom: 25px;">
        <span style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">📋 LIVE DASHBOARD</span><br/>
        <span style="font-size: 11px; color: #ff5e3a; font-weight: bold; letter-spacing: 1.5px;">REAL-TIME ENGAGEMENT</span>
    </div>
    """, unsafe_allow_html=True)
    
    # Render Metrics exactly like the screen mockup
    st.markdown(f"""
    <div style="display: flex; gap: 30px; align-items: center; margin-top: 15px; margin-bottom: 35px; background: rgba(255,255,255,0.02); padding: 20px 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
      <div style="text-align: left;">
        <div style="font-size: 34px; font-weight: 900; color: #ffffff; line-height: 1;">{upvotes}</div>
        <div style="font-size: 10px; color: #ff5e3a; font-weight: bold; letter-spacing: 1px; margin-top: 5px;">🔥 UP</div>
      </div>
      <div style="text-align: left; margin-left: 10px;">
        <div style="font-size: 34px; font-weight: 900; color: #ffffff; line-height: 1;">{downvotes}</div>
        <div style="font-size: 10px; color: #ff5e3a; font-weight: bold; letter-spacing: 1px; margin-top: 5px;">👎 DOWN</div>
      </div>
      <div style="text-align: left; margin-left: 10px;">
        <div style="font-size: 34px; font-weight: 900; color: #00ffd0; line-height: 1;">{pos_pct:.1f}%</div>
        <div style="font-size: 10px; color: #00ffd0; font-weight: bold; letter-spacing: 1px; margin-top: 5px;">POSITIVE</div>
      </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("### RECENT HISTORY")
    histories = load_json(HISTORY_FILE)
    if not histories:
        st.info("No event history yet. Analyze an event to populate.")
    else:
        # Display up to 5 recent queries
        for h in histories[:5]:
            desc = h.get("event_description", "Untitled Event")
            if len(desc) > 35:
                desc = desc[:32] + "..."
            ts = h.get("timestamp", "")
            # Format timestamp for beauty
            try:
                dt = datetime.fromisoformat(ts)
                time_str = dt.strftime("%b %d, %H:%M")
            except Exception:
                time_str = ts
            st.markdown(f"**{desc}**  \n*{time_str}*")
            st.markdown("---")
            
    # Refresh dashboard button to trigger update
    if st.button("🔄 Refresh Dashboard", key="btn_refresh"):
        st.rerun()

with col_main:
    # Branding Header
    st.markdown("""
    <div>
        <span style="font-size: 12px; color: #ff5e3a; font-weight: bold; letter-spacing: 2.5px;">NETWORKING INTELLIGENCE • SEASON 1</span>
        <h1 style="font-size: 46px; font-weight: 900; color: #ffffff; margin-top: 5px; margin-bottom: 15px; letter-spacing: -0.5px;">🤝 PERSONALIZED NETWORKING ASSISTANT</h1>
        <p style="font-size: 16px; color: #a0aec0; line-height: 1.6; margin-bottom: 25px; max-width: 800px;">
            Walk into any room already knowing what to say. Analyze the event, get conversation starters written for the moment, and verify the facts before you drop them at the table.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # "How It Works" Card Layout inside an expander
    with st.expander("▶ How It Works", expanded=True):
        st.markdown("""
        <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-top: 10px;">
          <div style="flex: 1; min-width: 200px; padding: 20px; background: rgba(255,255,255,0.02); border-left: 4px solid #ff5e3a; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <div style="font-size: 32px; font-weight: 900; color: #ff5e3a; margin-bottom: 5px;">01</div>
            <div style="font-size: 15px; font-weight: bold; color: #ffffff; margin-bottom: 8px;">Analyze the Event</div>
            <div style="font-size: 12px; color: #a0aec0; line-height: 1.5;">Paste the event description. DistilBERT scores it against networking themes so you know the room before you walk in.</div>
          </div>
          <div style="flex: 1; min-width: 200px; padding: 20px; background: rgba(255,255,255,0.02); border-left: 4px solid #ff5e3a; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <div style="font-size: 32px; font-weight: 900; color: #ff5e3a; margin-bottom: 5px;">02</div>
            <div style="font-size: 15px; font-weight: bold; color: #ffffff; margin-bottom: 8px;">Generate the Opener</div>
            <div style="font-size: 12px; color: #a0aec0; line-height: 1.5;">GPT-2 drafts 2-3 conversation starters tuned to the detected theme, refined further with context about who you're meeting.</div>
          </div>
          <div style="flex: 1; min-width: 200px; padding: 20px; background: rgba(255,255,255,0.02); border-left: 4px solid #ff5e3a; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <div style="font-size: 32px; font-weight: 900; color: #ff5e3a; margin-bottom: 5px;">03</div>
            <div style="font-size: 15px; font-weight: bold; color: #ffffff; margin-bottom: 8px;">Verify the Claim</div>
            <div style="font-size: 12px; color: #a0aec0; line-height: 1.5;">Cross-check any fact you plan to mention against Wikipedia before it leaves your mouth.</div>
          </div>
        </div>
        """, unsafe_allow_html=True)
        st.write("")

    # Interactive Step-by-Step Dashboard Tabs
    tab1, tab2, tab3 = st.tabs(["① Analyze Event", "② Generate Conversation Starters", "③ Fact Check"])
    
    with tab1:
        st.markdown("### 📝 Input Event Details")
        event_desc = st.text_area(
            "Enter Event Description",
            value="AI in Public Health",
            placeholder="e.g. AI in Public Health, Climate Change and Urban Planning",
            key="event_input_tab1"
        )

        interests = st.text_input(
            "Your Interests (comma-separated)",
            value="data ethics, patient safety, machine learning",
            placeholder="e.g. data ethics, patient safety, machine learning",
            key="interests_input_tab1"
        )

        # Generate Button
        if st.button("Generate Conversation Starters", key="btn_generate_starters"):
            if not event_desc.strip() or not interests.strip():
                st.warning("Please fill out both the event description and your interests.")
            else:
                with st.spinner("Analyzing event themes and generating conversation starters..."):
                    # Extract themes
                    topics = extract_themes(event_desc, interests)
                    st.session_state.extracted_topics = topics
                    
                    # Generate starters
                    starters = generate_conversation_starters(event_desc, interests, topics)
                    st.session_state.conversation_starters = starters
                    
                    st.session_state.last_event = event_desc
                    st.session_state.last_interests = interests
                    
                    # Save to history logger
                    log_history(event_desc, interests, topics, starters)
                    st.success("Successfully analyzed themes and generated starters! Click tab ② to view them.")

        # Display results if generated
        if st.session_state.extracted_topics:
            st.markdown("### 🧠 Extracted Topics:")
            st.code(format_topics(st.session_state.extracted_topics), language="json")

    with tab2:
        st.markdown("### 💬 Conversation Starters")
        if not st.session_state.conversation_starters:
            st.info("No conversation starters generated yet. Go to tab ① and click 'Generate Conversation Starters' first!")
        else:
            st.write(f"Showing starters generated for: **{st.session_state.last_event}**")
            
            for idx, starter in enumerate(st.session_state.conversation_starters):
                st.markdown(f"• {starter}")
                
                # Aligned horizontal thumbs up/down buttons
                col1, col2, _ = st.columns([0.08, 0.08, 0.84])
                with col1:
                    if st.button("👍", key=f"like_{idx}_tab2"):
                        log_feedback(starter, "like")
                with col2:
                    if st.button("👎", key=f"dislike_{idx}_tab2"):
                        log_feedback(starter, "dislike")
                st.write("")

        # Divider
        st.markdown("---")

        # Feedback History Section
        st.markdown("### 📁 View Feedback History")
        
        if st.button("Show Feedback", key="toggle_feedback_tab2"):
            st.session_state.show_feedback = not st.session_state.show_feedback
            
        if st.session_state.show_feedback:
            feedbacks = load_json(FEEDBACK_FILE)
            if not feedbacks:
                st.info("No feedback has been logged yet.")
            else:
                for item in feedbacks:
                    emoji = "👍" if item.get("feedback") == "like" else "👎"
                    text = item.get("starter_text", "")
                    timestamp = item.get("timestamp", "")
                    
                    st.markdown(f"**{emoji}** {text}")
                    st.markdown(f"🕐 {timestamp}")
                    st.markdown("---")

    with tab3:
        st.markdown("### 🔍 Quick Fact Verification")
        st.write("Prepare for your next networking event by quickly verifying topics and concepts using the Wikipedia API.")
        
        fact_query = st.text_input(
            "Enter a topic or fact to verify",
            value="blockchain in healthcare",
            placeholder="e.g. blockchain in healthcare, smart cities, data ethics",
            key="fact_query_tab3"
        )
        
        if st.button("Verify Fact", key="btn_verify_tab3"):
            if not fact_query.strip():
                st.warning("Please enter a concept or query.")
            else:
                with st.spinner("Retrieving summarized reference from Wikipedia..."):
                    summary = verify_fact(fact_query)
                    st.markdown("#### 📖 Fact Verification Summary:")
                    st.info(summary)
