import type {
  UserProfile,
  ConversationSession,
  MatchedPerson,
  FollowUpResponse,
  WikiReference,
  AnalyticsData,
} from './types';

const API_BASE = 'http://localhost:8000/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Network request failed' }));
    throw new Error(err.detail || 'API Error');
  }
  return res.json();
}

export const api = {
  // Profile
  getProfile: async (): Promise<UserProfile> => {
    try {
      return await fetchJson<UserProfile>(`${API_BASE}/profile`);
    } catch {
      return {
        name: "Alex Morgan",
        status: "Final Year AI & CS Student",
        skills: ["Machine Learning", "Python", "React", "Data Ethics", "FastAPI"],
        interests: ["Artificial Intelligence", "Generative AI", "Career Growth", "Patient Safety", "Data Ethics"],
        career_goals: "Targeting AI Research & Machine Learning Engineering roles at top tech companies.",
        preferred_goals: ["Find a mentor", "Explore career opportunities", "Meet researchers"],
        conversation_style: "Balanced (Technical + Professional)"
      };
    }
  },

  updateProfile: async (profile: UserProfile): Promise<UserProfile> => {
    try {
      return await fetchJson<UserProfile>(`${API_BASE}/profile`, {
        method: 'POST',
        body: JSON.stringify(profile),
      });
    } catch {
      return profile;
    }
  },

  // Event Analysis & Multi-Step Conversation Generator
  generateConversation: async (payload: {
    event_description: string;
    interests: string;
    networking_goal: string;
    person_context?: string;
  }): Promise<{
    topics: string[];
    gpt2_base_starters: string[];
    multi_step_flow: any[];
  }> => {
    try {
      return await fetchJson(`${API_BASE}/generate-conversation`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const themes = ["AI Ethics", "Generative AI", "Healthcare Tech"];
      return {
        topics: themes,
        gpt2_base_starters: [
          `I'm attending an event on ${payload.event_description}. Interested in ${payload.interests}. What icebreakers can I use?`,
          `Learning about ${payload.interests.split(',')[0]} is key to understanding modern industry shifts.`
        ],
        multi_step_flow: [
          {
            step: 1,
            stage: "Opening Icebreaker",
            question: `Hi! What brings you to this event focusing on ${themes[0]}?`,
            explanation: "Gentle icebreaker to initiate conversation."
          },
          {
            step: 2,
            stage: "Follow-Up Question",
            question: `How are teams in your organization navigating ${themes[1]} right now?`,
            explanation: `Aligns with your goal: '${payload.networking_goal}'.`
          },
          {
            step: 3,
            stage: "Deeper Technical / Industry Focus",
            question: `What challenges or ethical trade-offs do you see when implementing ${payload.interests.split(',')[0]}?`,
            explanation: "Deepens the technical dialogue based on your interests."
          },
          {
            step: 4,
            stage: "Connection & Closing Question",
            question: "It was great chatting! Would you be open to connecting on LinkedIn or grabbing a quick coffee sometime?",
            explanation: "Natural transition to build a lasting connection."
          }
        ]
      };
    }
  },

  // Person Matcher
  matchPerson: async (payload: {
    name: string;
    title: string;
    person_interests: string[];
    notes?: string;
  }): Promise<MatchedPerson> => {
    try {
      return await fetchJson<MatchedPerson>(`${API_BASE}/match-person`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const common = ["Generative AI", "Machine Learning"];
      return {
        id: "p_" + Date.now(),
        name: payload.name,
        title: payload.title,
        interests: payload.person_interests,
        common_interests: common,
        match_percentage: 88,
        reason_to_connect: "Strong alignment in Generative AI research and career growth.",
        suggested_opener: `Hi ${payload.name.split(' ')[0]}, I noticed your work in ${payload.title}. I've been exploring ${common[0]} as well—what project are you currently most focused on?`,
        notes: payload.notes
      };
    }
  },

  // Wikipedia Topic Reference
  getWikiReference: async (query: string): Promise<WikiReference> => {
    try {
      return await fetchJson<WikiReference>(`${API_BASE}/wiki-reference?query=${encodeURIComponent(query)}`);
    } catch {
      return {
        query,
        reference_summary: `${query.toUpperCase()}: Artificial Intelligence (AI) refers to computer systems capable of performing complex tasks that historically required human intelligence, such as reasoning, learning, and problem-solving. In modern applications, transformer models and deep learning drive major breakthroughs.`,
        source: "Wikipedia API (Topic Information Reference)"
      };
    }
  },

  // Post-Conversation Follow-Up Assistant
  generateFollowUp: async (payload: {
    person_name: string;
    event_name: string;
    notes: string;
  }): Promise<FollowUpResponse> => {
    try {
      return await fetchJson<FollowUpResponse>(`${API_BASE}/generate-followup`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const firstName = payload.person_name.split(' ')[0] || 'there';
      return {
        person_name: payload.person_name,
        event_name: payload.event_name,
        notes: payload.notes,
        email_subject: `Great meeting you at ${payload.event_name}!`,
        followup_message: `Hi ${firstName},\n\nIt was a pleasure meeting you at ${payload.event_name}. I really enjoyed our conversation regarding "${payload.notes}".\n\nI'd love to stay connected and follow your work. Let me know if you'd be open to catching up for a brief coffee sometime!\n\nBest regards,\nAlex Morgan`
      };
    }
  },

  // Feedback Logger
  logFeedback: async (starter_text: string, action: 'like' | 'dislike', category?: string) => {
    try {
      return await fetchJson(`${API_BASE}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ starter_text, action, category }),
      });
    } catch {
      return { success: true };
    }
  },

  // Sessions & History
  getHistory: async (): Promise<ConversationSession[]> => {
    try {
      return await fetchJson<ConversationSession[]>(`${API_BASE}/history`);
    } catch {
      return [];
    }
  },

  saveSession: async (session: any) => {
    try {
      return await fetchJson(`${API_BASE}/history`, {
        method: 'POST',
        body: JSON.stringify(session),
      });
    } catch {
      return session;
    }
  },

  // Saved People
  getPeople: async (): Promise<MatchedPerson[]> => {
    try {
      return await fetchJson<MatchedPerson[]>(`${API_BASE}/people`);
    } catch {
      return [];
    }
  },

  // Analytics
  getAnalytics: async (): Promise<AnalyticsData> => {
    try {
      return await fetchJson<AnalyticsData>(`${API_BASE}/analytics`);
    } catch {
      return {
        total_events: 5,
        total_people: 8,
        total_conversations: 18,
        upvotes: 14,
        downvotes: 2,
        positive_rate: 87.5,
        goal_breakdown: {
          "Find a mentor": 3,
          "Explore career opportunities": 2,
          "Meet researchers": 2,
          "Learn about industry trends": 1
        },
        top_topics: [
          ["Artificial Intelligence", 5],
          ["Generative AI", 4],
          ["Patient Safety", 3],
          ["Data Ethics", 2],
          ["Machine Learning", 2]
        ],
        preferences: {
          technical_weight: 0.8,
          career_weight: 0.7,
          industry_weight: 0.6,
          research_weight: 0.75
        }
      };
    }
  }
};
