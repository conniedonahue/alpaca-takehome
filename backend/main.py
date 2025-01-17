from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from schemas import SessionNoteCreate
from db.dependencies import get_db
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os

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
    return {"message": "Session note created successfully!"}

@app.get("/")
async def health_check():
    return {"status": "healthy"}