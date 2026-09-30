export interface UserProfile {
  name: string;
  status: string;
  skills: string[];
  interests: string[];
  career_goals: string;
  preferred_goals: string[];
  conversation_style: string;
}

export interface MultiStepQuestion {
  step: number;
  stage: string;
  question: string;
  explanation: string;
}

export interface ConversationSession {
  id?: string;
  event_name: string;
  event_description: string;
  interests: string;
  goal: string;
  topics: string[];
  multi_step_flow: MultiStepQuestion[];
  gpt2_base_starters?: string[];
  notes?: string;
  created_at?: string;
}

export interface MatchedPerson {
  id?: string;
  name: string;
  title: string;
  interests: string[];
  common_interests: string[];
  match_percentage: number;
  reason_to_connect: string;
  suggested_opener: string;
  notes?: string;
  created_at?: string;
}

export interface FollowUpResponse {
  person_name: string;
  event_name: string;
  notes: string;
  email_subject: string;
  followup_message: string;
}

export interface WikiReference {
  query: string;
  reference_summary: string;
  source: string;
}

export interface AnalyticsData {
  total_events: number;
  total_people: number;
  total_conversations: number;
  upvotes: number;
  downvotes: number;
  positive_rate: number;
  goal_breakdown: Record<string, number>;
  top_topics: [string, number][];
  preferences: {
    technical_weight: number;
    career_weight: number;
    industry_weight: number;
    research_weight: number;
  };
}
