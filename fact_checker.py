import wikipediaapi

def verify_fact(query: str) -> str:
    """
    Verifies a fact or looks up a term using the Wikipedia API.
    Returns a summarized reference.
    """
    if not query or not query.strip():
        return "Please enter a query to fact check."
        
    try:
        # Initialize with professional user agent
        wiki = wikipediaapi.Wikipedia(
            user_agent='PersonalizedNetworkingAssistant/1.0 (peethamahanthi@gmail.com)',
            language='en'
        )
        page = wiki.page(query)
        if page.exists():
            summary = page.summary
            if len(summary) > 600:
                return summary[:600] + "..."
            return summary
        else:
            # Try capitalizing query to match wiki indexing
            capitalized = " ".join([w.capitalize() for w in query.split()])
            page_cap = wiki.page(capitalized)
            if page_cap.exists():
                summary = page_cap.summary
                if len(summary) > 600:
                    return summary[:600] + "..."
                return summary
            return f"No matching Wikipedia entry found for '{query}'."
    except Exception as e:
        return f"Error retrieving facts from Wikipedia: {str(e)}"
