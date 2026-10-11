import requests
import json

url = "http://localhost:8000/api/generate-conversation"
payload = {
    "event_description": "Annual Summit on Ethical Hacking and Penetration Testing, focusing on web security, vulnerability assessment, and zero-trust security models.",
    "interests": "Ethical Hacking, Penetration Testing",
    "networking_goal": "Seeking Mentorship"
}

try:
    res = requests.post(url, json=payload, timeout=15)
    print("API Status:", res.status_code)
    if res.status_code == 200:
        data = res.json()
        print("\nExtracted Topics:", data.get("topics"))
        print("\nMulti-Step Flow Options Generated:\n")
        for step in data.get("multi_step_flow", []):
            print(f"[{step['stage']}]")
            for idx, opt in enumerate(step.get("options", []), 1):
                print(f"   Option {idx}: {opt}")
            print()
    else:
        print("API Error:", res.text)
except Exception as e:
    print("Exception connecting to local API server:", e)
