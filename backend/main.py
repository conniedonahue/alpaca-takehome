from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from schemas import SessionNoteCreate, SessionNoteUpdate
from db.dependencies import get_db
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from datetime import datetime
import os

from llm_service import process_note_with_llm
from db.models import SessionNote

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/session-notes/")
async def create_session_note(
    session_note: SessionNoteCreate, db: Session = Depends(get_db)
):
    """ 
    Saves note draft and submits for AI processing 
    
    Args: 
        session_note
        db

    Returns:
        JSON: Generated Note
    
    """
     # Save the draft note to the database
    db_note = SessionNote(
        session_duration=session_note.session_duration,
        session_type=session_note.session_type,
        draft_note=session_note.notes,  # Assuming 'observations' is the draft note
    )
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)

    # Process the note using LLM (e.g., OpenAI, etc.)
    generated_note = process_note_with_llm(db_note.draft_note)

    # Update the generated note in the database
    db_note.generated_note = generated_note
    db.commit()
    
    return {"note_id": db_note.id, "generated_note": generated_note}

@app.patch("/session-notes/{note_id}")
async def update_final_note(
    note_id: int,
    session_note_update: SessionNoteUpdate,  
    db: Session = Depends(get_db)
):
    """ 
    Updates the final_note field for an existing session note.
    
    Args: 
        note_id (int): ID of the note to be updated.
        final_note (str): The new final note to be saved.
        db (Session): Database session.

    Returns:
        JSON: Updated note with final_note field.
    """
    db_note = db.query(SessionNote).filter(SessionNote.id == note_id).first()

    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")

    db_note.final_note = session_note_update.final_note
    db_note.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_note)
    
    return {"note_id": db_note.id, "final_note": db_note.final_note}


@app.get("/")
async def health_check():
    return {"status": "healthy"}