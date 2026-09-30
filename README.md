# AI-Based Professional Networking Companion (v2.0)

An upgraded, modern AI-powered professional networking platform built with a **React.js Frontend**, a **FastAPI REST API Backend**, and modular **AI Engine** (DistilBERT + GPT-2 + Wikipedia API).

---

## 🌟 Key Features

1. **Structured Multi-Step Conversation Sequences:**
   - Generates a natural 4-step dialogue flow: *Opening Icebreaker ➔ Goal-Aligned Follow-Up ➔ Deeper Technical Focus ➔ Connection & Closing Question*.
2. **Smart Person & Interest Matcher:**
   - Calculates interest overlap percentages, mutual synergies, and personalized icebreakers before reaching out to target individuals.
3. **Networking Goal Selection:**
   - Tailors conversation flows to specific networking objectives (*Find a mentor, Learn about a technology, Find internship opportunities, Explore career opportunities, Meet researchers, Learn about industry trends, Build professional connections*).
4. **DistilBERT Event Theme Extraction:**
   - Automatically categorizes event descriptions and interests into key high-level technical themes.
5. **Wikipedia Topic Reference:**
   - Pulls real-time neutral topic definitions and background context via the Wikipedia API for pre-event preparation.
6. **Post-Conversation Follow-Up Assistant:**
   - Converts quick post-meeting notes into ready-to-send, professional emails or LinkedIn connection messages.
7. **Feedback & AI Personalization Engine:**
   - Dynamic 👍 / 👎 feedback system automatically tunes AI recommendation weights for technical vs. career-oriented questions.
8. **Networking Analytics Dashboard:**
   - Visual dashboard providing metrics on events attended, contacts saved, conversation counts, top discussed topics, and feedback satisfaction.
9. **User Profile & Preferences:**
   - Persistent user profile storing skills, interests, career aspirations, and preferred conversation styles.

---

## 🏗️ Architecture

```text
React Frontend (Vite + TS + Glassmorphism UI)
       │
       ▼
REST API Backend (FastAPI + Python 3.11+)
       │
       ├── DistilBERT (Theme Extraction Engine)
       ├── GPT-2 (Text Generation Pipeline)
       ├── Person & Synergies Matching Engine
       ├── Feedback & Personalization Engine
       └── Wikipedia API (Topic Reference)
       │
       ▼
JSON Database (db.json)
```

---

## 🚀 How to Run the Application

### 1. Start the FastAPI Backend Server

Open a terminal in the root directory:

```bash
python -m uvicorn api_server:app --reload --port 8000
```

*Swagger API Docs available at:* `http://localhost:8000/docs`

---

### 2. Start the React Frontend

Open a new terminal in the `frontend` folder:

```bash
cd frontend
npm run dev
```

*Open your browser at:* `http://localhost:5173`

---

## 📁 Upgraded Project Structure

```text
Personalized-Networking-Assistant-main/
│
├── api_server.py           # FastAPI REST API Backend server
├── database.py             # Persistent database layer (JSON DB)
├── event_analyzer.py       # DistilBERT event theme extraction engine
├── topic_generator.py      # GPT-2 conversation starter engine
├── fact_checker.py         # Wikipedia API fact reference service
├── test_services.py        # Service unit tests
├── db.json                 # Saved sessions, profile, and feedback store
├── requirements.txt        # Python backend dependencies
├── README.md               # Project documentation
│
└── frontend/               # Modern React.js Frontend
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── Assistant.tsx
    │   │   ├── PersonMatcher.tsx
    │   │   ├── FollowUpAssistant.tsx
    │   │   ├── TopicReference.tsx
    │   │   ├── HistoryPage.tsx
    │   │   ├── AnalyticsPage.tsx
    │   │   └── UserProfile.tsx
    │   ├── api.ts          # API client with backend integration
    │   ├── types.ts        # TypeScript data interfaces
    │   ├── index.css       # Glassmorphic UI styling system
    │   └── App.tsx         # Main layout & router container
    ├── package.json
    └── vite.config.ts
```



