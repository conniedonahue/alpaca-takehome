from pydantic import BaseModel

# Handles input validation
class SessionNoteCreate(BaseModel):
    session_duration: int
    session_type: str
    notes: str

    class Config:
        orm_mode = True
