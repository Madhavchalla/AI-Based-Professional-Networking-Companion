import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()
key = os.getenv('GEMINI_API_KEY')
url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={key}'

prompt = """
You are an expert executive networking coach.
Create a 4-stage networking conversation sequence for an event attendee speaking with a speaker, mentor, or professional.

EVENT TITLE: Generative AI
NETWORKING GOAL: Find a mentor
EVENT DESCRIPTION: artificial intelligence focused on creating new, original content rather than just analyzing existing data
USER INTERESTS: LLM's and RAG

Generate 4 stages. For EVERY stage, provide 3 distinct, natural, highly realistic, human-like conversation options (Option 1, Option 2, Option 3) that an attendee can naturally say to a mentor or speaker.

STAGES:
1. Opening Icebreaker (natural, non-templated opening remarks complimenting the event/talk or sharing enthusiasm for Generative AI)
2. Follow-Up Question (explores career advice and mentorship specifically for LLM's and RAG)
3. Deeper Technical / Industry Focus (asking an insightful question about RAG architecture, vector databases, or LLM fine-tuning)
4. Connection & Closing (requesting LinkedIn connection or a 15-minute coffee chat)

CRITICAL INSTRUCTION:
DO NOT use generic fill-in-the-blank template sentences like 'Hi! What brings you to this session on X'. Make each option sound like a real, articulate human speaking directly to a mentor.

Return STRICTLY a JSON object in this format:
{
  "stage1": ["Option 1", "Option 2", "Option 3"],
  "stage2": ["Option 1", "Option 2", "Option 3"],
  "stage3": ["Option 1", "Option 2", "Option 3"],
  "stage4": ["Option 1", "Option 2", "Option 3"]
}
"""

res = requests.post(url, json={'contents': [{'parts': [{'text': prompt}]}]})
print('STATUS:', res.status_code)
if res.status_code == 200:
    text = res.json()['candidates'][0]['content']['parts'][0]['text'].strip()
    if text.startswith('```'):
        text = text.replace('```json', '').replace('```', '').strip()
    print('GEMINI OUTPUT:\n', text)
