from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import time
from typing import Optional

# Import the process_landmarks functions
from bicep_curls import process_landmarks as process_bicep_curls
from deadlifts import process_landmarks as process_deadlifts
from lunges import process_landmarks as process_lunges
from pushups import process_landmarks as process_pushups
from situps import process_landmarks as process_situps
from squats import process_landmarks as process_squats

# Create the FastAPI app
app = FastAPI(title="ReGenix: Innovative Exercise Analysis API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your domain.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Commented router includes - uncomment when ready to use
# try:
#     from routers.session_router import router as session_router
#     from routers.reference_router import router as reference_router
#     # Add routers
#     app.include_router(session_router)
#     app.include_router(reference_router)
# except ImportError:
#     print("Router modules not available. Basic functionality only.")

@app.get("/")
def home():
    return {"message": "Welcome to ReGenix API"}

@app.post("/landmarks/{exercise_name}")
async def process_exercise_landmarks(
    exercise_name: str,
    request: Request,
    tolerance: int = 10,
    session_id: Optional[str] = None
):
    """Process landmarks for exercise analysis"""
    start_time = time.time()
    
    try:
        data = await request.json()
        landmarks = data.get("landmarks")
        if not landmarks:
            return JSONResponse({"error": "No landmarks provided"}, status_code=400)
        
        # Route the processing to the corresponding module
        if exercise_name == "bicep_curls":
            result = process_bicep_curls(landmarks, tolerance, session_id)
        elif exercise_name == "deadlifts":
            result = process_deadlifts(landmarks, tolerance)
        elif exercise_name == "lunges":
            result = process_lunges(landmarks, tolerance)
        elif exercise_name == "pushups":
            result = process_pushups(landmarks, tolerance)
        elif exercise_name == "situps":
            result = process_situps(landmarks, tolerance)
        elif exercise_name == "squats":
            result = process_squats(landmarks, tolerance)
        else:
            return JSONResponse({"error": "Exercise not found"}, status_code=404)
        
        # Add processing time
        processing_time = time.time() - start_time
        result["processing_time_ms"] = round(processing_time * 1000, 2)
        
        return JSONResponse(result)
    except Exception as e:
        return JSONResponse(
            {"error": f"Processing error: {str(e)}"}, 
            status_code=500
        )

@app.get("/status")
def status():
    """API status endpoint"""
    return {
        "status": "operational",
        "version": "1.0.0",
        "timestamp": time.time()
    }
