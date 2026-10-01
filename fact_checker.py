import wikipediaapi
import requests

def verify_fact(query: str) -> str:
    """
    Verifies a fact or looks up a term using Wikipedia API.
    Resolves compound topics (e.g. 'Blockchain in Healthcare') using Wikipedia search.
    Returns a summarized reference.
    """
    if not query or not query.strip():
        return "Please enter a query to fact check."
        
    query_clean = query.strip()
    
    try:
        wiki = wikipediaapi.Wikipedia(
            user_agent='PersonalizedNetworkingAssistant/2.0 (networking.assistant@example.com)',
            language='en'
        )
        
        # 1. Try direct exact match
        page = wiki.page(query_clean)
        if page.exists() and len(page.summary.strip()) > 50:
            summary = page.summary
            return summary[:600] + "..." if len(summary) > 600 else summary

        # 2. Use Wikipedia OpenSearch API to resolve compound/phrase queries
        search_url = "https://en.wikipedia.org/w/api.php"
        params = {
            "action": "opensearch",
            "search": query_clean,
            "limit": 3,
            "namespace": 0,
            "format": "json"
        }
        res = requests.get(search_url, params=params, timeout=5)
        if res.status_code == 200:
            data = res.json()
            if len(data) >= 2 and len(data[1]) > 0:
                top_title = data[1][0]
                search_page = wiki.page(top_title)
                if search_page.exists() and len(search_page.summary.strip()) > 50:
                    summary = search_page.summary
                    return f"(Reference for '{top_title}'): " + (summary[:600] + "..." if len(summary) > 600 else summary)

        # 3. Fallback: Try first main keyword before preposition (e.g. 'Blockchain in Healthcare' -> 'Blockchain')
        if " in " in query_clean.lower() or " for " in query_clean.lower():
            main_term = query_clean.split()[0]
            term_page = wiki.page(main_term)
            if term_page.exists() and len(term_page.summary.strip()) > 50:
                summary = term_page.summary
                return f"(Reference for '{main_term}'): " + (summary[:600] + "..." if len(summary) > 600 else summary)

        return f"No matching Wikipedia entry found for '{query_clean}'."
    except Exception as e:
        return f"Error retrieving facts from Wikipedia: {str(e)}"
