"""
API Router for Session Management
------------------------------
Provides endpoints for managing exercise sessions
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import time
from datetime import datetime

from session_state import (
    start_session, end_session, get_session, record_rep
)

router = APIRouter(prefix="/session", tags=["session"])

# Data models
class SessionRequest(BaseModel):
    user_id: Optional[str] = None
    exercise_type: Optional[str] = None

class RecordRepRequest(BaseModel):
    exercise: str
    feedback_flags: List[str]
    metrics: Optional[Dict[str, Any]] = None

@router.post("/start")
async def api_start_session(request: SessionRequest):
    session_id = start_session(request.user_id, request.exercise_type)
    return {"session_id": session_id, "start_time": datetime.now().isoformat()}

@router.post("/{session_id}/record")
async def api_record_rep(session_id: str, request: RecordRepRequest):
    rep_data = record_rep(
        session_id, 
        request.exercise, 
        request.feedback_flags, 
        request.metrics
    )
    if "error" in rep_data:
        raise HTTPException(status_code=404, detail=rep_data["error"])
    return rep_data

@router.get("/{session_id}")
async def api_get_session(session_id: str):
    session = get_session(session_id)
    if "error" in session:
        raise HTTPException(status_code=404, detail=session["error"])
    return session

@router.post("/{session_id}/end")
async def api_end_session(session_id: str, background_tasks: BackgroundTasks):
    # Use background tasks to avoid blocking while saving session data
    def end_session_task(sid):
        summary = end_session(sid)
        return summary
        
    background_tasks.add_task(end_session_task, session_id)
    return {"message": f"Ending session {session_id}"}

@router.get("/{session_id}/summary")
async def api_get_session_summary(session_id: str):
    session = get_session(session_id)
    if "error" in session:
        raise HTTPException(status_code=404, detail=session["error"])
        
    # Create a summary if session exists
    if not session.get("completed"):
        return {
            "session_id": session["session_id"],
            "status": "in_progress",
            "metrics": session["metrics"]
        }
    else:
        # Return the completed summary
        return {
            "session_id": session["session_id"],
            "status": "completed",
            "start_time": session["start_time"],
            "end_time": session["end_time"],
            "duration_seconds": session["duration_seconds"],
            "total_reps": session["metrics"]["total_reps"],
            "average_score": session["metrics"]["average_score"],
            "exercises": session["metrics"]["exercises"]
        }
