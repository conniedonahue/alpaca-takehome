import time

# Mock function
def process_note_with_llm(draft_note: str) -> str:
    """Simulates sending a draft note to an LLM and receiving a processed result."""
    time.sleep(2)  # Simulating a processing delay
    return f"Processed: {draft_note}"
