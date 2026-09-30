from event_analyzer import extract_themes
from topic_generator import generate_conversation_starters
from fact_checker import verify_fact

def test_extract_themes():
    # Test with standard public health example
    topics = extract_themes("AI in Public Health", "data ethics, patient safety, machine learning")
    assert isinstance(topics, list)
    assert len(topics) == 3
    assert "AI" in topics or "healthcare" in topics or "robotics" in topics

def test_generate_conversation_starters():
    themes = ["AI", "healthcare", "robotics"]
    starters = generate_conversation_starters(
        "AI in Public Health", 
        "data ethics, patient safety, machine learning", 
        themes
    )
    assert isinstance(starters, list)
    assert len(starters) == 2
    assert "focused on" in starters[0] or "networking" in starters[0]

def test_verify_fact():
    res = verify_fact("blockchain")
    assert isinstance(res, str)
    assert len(res) > 0
