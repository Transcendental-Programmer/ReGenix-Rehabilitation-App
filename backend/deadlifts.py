import numpy as np
from state import exercise_state
from feedback_config import DEADLIFT_CONFIG

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
         angle = 360 - angle
    return angle

def process_landmarks(landmarks, tolerance=0.0):
    """
    Process landmarks for deadlift form analysis with enhanced feedback
    """
    back_angles = []
    hip_angles = []
    
    # Calculate back angle (neck to hips to knees)
    try:
        # Neck (upper back): use nose as a proxy if neck isn't reliable
        neck = [landmarks[0]['x'], landmarks[0]['y']]  # Use nose as a reference point
        
        # Mid hip point for better center of mass representation
        mid_hip = [(landmarks[23]['x'] + landmarks[24]['x'])/2, 
                   (landmarks[23]['y'] + landmarks[24]['y'])/2]
        
        # Mid knee point
        mid_knee = [(landmarks[25]['x'] + landmarks[26]['x'])/2, 
                    (landmarks[25]['y'] + landmarks[26]['y'])/2]
        
        # Back angle is the angle from neck through hips to knees
        back_angle = calculate_angle(neck, mid_hip, mid_knee)
        back_angles.append(back_angle)
        
        # Hip angle (shoulder-hip-knee) for hip hinge depth
        mid_shoulder = [(landmarks[11]['x'] + landmarks[12]['x'])/2,
                       (landmarks[11]['y'] + landmarks[12]['y'])/2]
        hip_angle = calculate_angle(mid_shoulder, mid_hip, mid_knee)
        hip_angles.append(hip_angle)
    except Exception as e:
        pass

    if not back_angles:
        return {"error": "Insufficient landmarks data."}

    # Average the angles
    avg_back_angle = sum(back_angles) / len(back_angles)
    avg_hip_angle = sum(hip_angles) / len(hip_angles) if hip_angles else 180

    # Retrieve the current state
    state = exercise_state.get("deadlifts", {"repCount": 0, "stage": "up", "feedback": "N/A"})
    stage = state.get("stage", "up")
    counter = state.get("repCount", 0)

    # Deadlift detection logic
    if avg_back_angle > 160:  # Standing upright
        if stage == "down":
            stage = "up"
            counter += 1
    elif avg_back_angle < DEADLIFT_CONFIG["HIP_HINGE_DEPTH_MIN"]:  # Bent position
        stage = "down"

    # Generate detailed feedback
    feedback = []
    
    # Check back angle safety - this is critical for deadlift
    if avg_back_angle < DEADLIFT_CONFIG["BACK_ANGLE_WARNING"]:
        feedback.append(DEADLIFT_CONFIG["FEEDBACK"]["BACK_TOO_BENT"])
    
    # Check hip hinge depth
    if stage == "down":
        if avg_hip_angle > DEADLIFT_CONFIG["HIP_HINGE_DEPTH_MAX"]:
            feedback.append(DEADLIFT_CONFIG["FEEDBACK"]["NOT_DEEP_ENOUGH"])
        elif avg_hip_angle < DEADLIFT_CONFIG["HIP_HINGE_DEPTH_MIN"] - 10:
            feedback.append(DEADLIFT_CONFIG["FEEDBACK"]["TOO_DEEP"])
    
    # Check if standing fully upright at the top
    if stage == "up" and avg_back_angle < DEADLIFT_CONFIG["BACK_ANGLE_MIN"]:
        feedback.append(DEADLIFT_CONFIG["FEEDBACK"]["STAND_STRAIGHT"])
    
    # If no specific feedback issues, provide general positive feedback
    if not feedback:
        feedback = [DEADLIFT_CONFIG["FEEDBACK"]["GOOD_FORM"]]

    # Compile the feedback into a string
    feedback_message = " | ".join(feedback)

    new_state = {
        "repCount": counter,
        "stage": stage,
        "backAngle": avg_back_angle,
        "hipAngle": avg_hip_angle,
        "feedback": feedback_message
    }
    
    exercise_state["deadlifts"] = new_state
    return new_state