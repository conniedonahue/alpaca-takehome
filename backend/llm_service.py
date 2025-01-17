import time

# Mock function
def mock_process_note_with_llm(draft_note: str) -> str:
    """Simulates sending a draft note to an LLM and receiving a processed result."""
    time.sleep(2)  # Simulating a processing delay
    return f"Processed: {draft_note}"

import openai
from fastapi import HTTPException, Depends
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Set OpenAI API key from .env file
openai.api_key = os.getenv("OPENAI_API_KEY")

# Prompt engineering example for clinical writing style
def generate_clinical_note(draft_note: str) -> str:
    """
    Sends the draft note to OpenAI and returns the generated note with clinical writing style.
    Args:
        draft_note (str): The raw draft note.
    Returns:
        str: The generated clinical note.
    """
    prompt = f"""
    You are an experienced clinical therapist. Transform the following draft into a clear, professional clinical summary in ABA (Applied Behavioral Analysis) style. Focus only on summarizing the key clinical observations and interventions.

    Guidelines:
    - Write in a clear, concise paragraph format
    - Do not include date, time, or session logistics as fields, or a signature 
    - Focus on behaviors, interventions, and outcomes
    - Use objective, professional language
    - Keep the format simple and straightforward

    Draft note:
    {draft_note}
    """
    
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an experienced clinical therapist."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        print("RESPONSE: ", response)
        return response.choices[0].message.content
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating note: {str(e)}")

