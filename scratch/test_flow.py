import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()
key = os.getenv('GEMINI_API_KEY')

prompt = """You are an expert executive networking coach. Generate a 4-phase networking conversation sequence for an attendee speaking with a speaker/mentor.
EVENT TITLE: Generative AI
NETWORKING GOAL: Find a mentor
EVENT DESCRIPTION: artificial intelligence focused on creating new, original content rather than just analyzing existing data
USER INTERESTS: LLMs and RAG

Generate 4 stages. For EVERY stage, provide 3 distinct, highly realistic, organic, non-templated options (Option 1, Option 2, Option 3).
Stage 1: Opening Icebreaker (natural opening comment about the event or Generative AI)
Stage 2: Follow-Up Question (explores career guidance & mentorship in LLMs & RAG)
Stage 3: Deeper Technical Focus (asks an insightful technical question about RAG architecture or vector search)
Stage 4: Connection Closing (natural request for LinkedIn connection or coffee chat)

Output ONLY valid JSON object with keys stage1, stage2, stage3, stage4 containing arrays of 3 strings. Example:
{"stage1": ["s1_opt1", "s1_opt2", "s1_opt3"], "stage2": ["s2_opt1", "s2_opt2", "s2_opt3"], "stage3": ["s3_opt1", "s3_opt2", "s3_opt3"], "stage4": ["s4_opt1", "s4_opt2", "s4_opt3"]}
"""

models = ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.7-flash", "gemini-flash-latest"]
for model in models:
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}'
    try:
        res = requests.post(url, json={'contents': [{'parts': [{'text': prompt}]}]}, timeout=12)
        print('MODEL:', model, 'STATUS:', res.status_code)
        if res.status_code == 200:
            text = res.json()['candidates'][0]['content']['parts'][0]['text'].strip()
            if text.startswith('```'):
                text = text.replace('```json', '').replace('```', '').strip()
            data = json.loads(text)
            print('STAGE 1 OPTIONS:\n', json.dumps(data.get('stage1'), indent=2))
            print('STAGE 2 OPTIONS:\n', json.dumps(data.get('stage2'), indent=2))
            print('STAGE 3 OPTIONS:\n', json.dumps(data.get('stage3'), indent=2))
            print('STAGE 4 OPTIONS:\n', json.dumps(data.get('stage4'), indent=2))
            break
    except Exception as e:
        print('Error:', e)
