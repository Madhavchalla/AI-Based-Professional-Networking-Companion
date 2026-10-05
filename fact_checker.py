import requests

HEADERS = {'User-Agent': 'PersonalizedNetworkingAssistant/2.0 (networking.assistant@example.com)'}

def fetch_wiki_summary(title_str: str):
    try:
        url = 'https://en.wikipedia.org/w/api.php'
        params = {
            'action': 'query',
            'format': 'json',
            'prop': 'extracts',
            'exintro': 1,
            'explaintext': 1,
            'redirects': 1,
            'titles': title_str
        }
        res = requests.get(url, headers=HEADERS, params=params, timeout=5)
        if res.status_code == 200:
            pages = res.json().get('query', {}).get('pages', {})
            for pid, p in pages.items():
                if pid == "-1":
                    continue
                title = p.get('title', title_str)
                extract = p.get('extract', '').strip()
                if extract and len(extract) > 40 and "may refer to:" not in extract.lower() and "refer to:" not in extract.lower():
                    return title, extract
    except Exception:
        pass
    return None, None

def verify_fact(query: str) -> str:
    """
    Verifies a fact or looks up a term using Wikipedia API.
    Resolves compound topics and disambiguation pages (e.g. 'Hacking', 'Blockchain in Healthcare').
    Returns a summarized reference.
    """
    if not query or not query.strip():
        return "Please enter a query to fact check."
        
    query_clean = query.strip()
    
    # 1. Try direct title fetch with redirect handling
    t, s = fetch_wiki_summary(query_clean)
    if s:
        return f"(Reference for '{t}'): " + (s[:600] + "..." if len(s) > 600 else s)

    # 2. Use Wikipedia Full-Text Search API (action=query&list=search)
    try:
        url = 'https://en.wikipedia.org/w/api.php'
        params = {
            'action': 'query',
            'list': 'search',
            'srsearch': query_clean,
            'srlimit': 6,
            'format': 'json'
        }
        res = requests.get(url, headers=HEADERS, params=params, timeout=5)
        if res.status_code == 200:
            search_items = res.json().get('query', {}).get('search', [])
            for item in search_items:
                candidate_title = item.get('title')
                if candidate_title:
                    t, s = fetch_wiki_summary(candidate_title)
                    if s:
                        return f"(Reference for '{t}'): " + (s[:600] + "..." if len(s) > 600 else s)
    except Exception:
        pass

    # 3. Fallback: try primary keywords
    words = [w for w in query_clean.split() if len(w) > 2 and w.lower() not in ["in", "for", "the", "and", "with"]]
    for w in words:
        t, s = fetch_wiki_summary(w)
        if s:
            return f"(Reference for '{t}'): " + (s[:600] + "..." if len(s) > 600 else s)

    return f"No matching Wikipedia entry found for '{query_clean}'."
