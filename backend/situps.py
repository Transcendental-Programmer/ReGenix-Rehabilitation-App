import numpy as np
from state import exercise_state
from feedback_config import SITUP_CONFIG
from score_config import calculate_rep_score

def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
         angle = 360 - angle
    return angle

def check_neck_strain(nose, neck, shoulder):
    """
    Check if there's excessive neck strain by measuring the angle between
    nose, neck, and shoulders
    """
    if not nose or not neck or not shoulder:
        return False
        
    neck_angle = calculate_angle(nose, neck, shoulder)
    # If neck is too flexed (looking down too much), it might indicate strain
    return neck_angle < 150

def process_landmarks(landmarks, tolerance, session_id=None):
    """
    Process landmarks for situp form analysis with enhanced feedback
    """
    hip_angles = []
    neck_strain_detected = False
    
    # Extract left side landmarks for hip angle calculation
    try:
        left_shoulder = [landmarks[11]['x'], landmarks[11]['y']]
        left_hip = [landmarks[23]['x'], landmarks[23]['y']]
        left_knee = [landmarks[25]['x'], landmarks[25]['y']]
        
        left_hip_angle = calculate_angle(left_shoulder, left_hip, left_knee)
        hip_angles.append(left_hip_angle)
        
        # Check for neck strain
        nose = [landmarks[0]['x'], landmarks[0]['y']]
        neck = [(landmarks[11]['x'] + landmarks[12]['x'])/2, 
                (landmarks[11]['y'] + landmarks[12]['y'])/2 - 0.05]  # Estimate neck position
        mid_shoulder = [(landmarks[11]['x'] + landmarks[12]['x'])/2,
                       (landmarks[11]['y'] + landmarks[12]['y'])/2]
        
        if check_neck_strain(nose, neck, mid_shoulder):
            neck_strain_detected = True
    except Exception:
        pass
    
    # Extract right side landmarks for hip angle calculation
    try:
        right_shoulder = [landmarks[12]['x'], landmarks[12]['y']]
        right_hip = [landmarks[24]['x'], landmarks[24]['y']]
        right_knee = [landmarks[26]['x'], landmarks[26]['y']]
        
        right_hip_angle = calculate_angle(right_shoulder, right_hip, right_knee)
        hip_angles.append(right_hip_angle)
    except Exception:
        pass

    if not hip_angles:
        return {"error": "Insufficient landmarks data."}

    # Average the hip angles
    avg_hip_angle = sum(hip_angles) / len(hip_angles)
    
    # Retrieve current state for sit-ups
    state = exercise_state.get("situps", {"counter": 0, "stage": "up", "feedback": "N/A"})
    stage = state.get("stage", "up")
    counter = state.get("counter", 0)

    # Sit-up detection logic
    if avg_hip_angle > 160:  # Lying flat
        stage = "down"
    elif avg_hip_angle < 120 and stage == "down":  # Sitting up
        stage = "up"
        counter += 1

    # Generate detailed feedback
    feedback = []
    
    # Check sit-up height
    if stage == "up":
        if avg_hip_angle > SITUP_CONFIG["HIP_ANGLE_MAX"] + 10:
            feedback.append(SITUP_CONFIG["FEEDBACK"]["NOT_HIGH_ENOUGH"])
        elif avg_hip_angle < SITUP_CONFIG["HIP_ANGLE_MIN"] - 5:
            feedback.append(SITUP_CONFIG["FEEDBACK"]["TOO_HIGH"])
    
    # Check for neck strain
    if neck_strain_detected:
        feedback.append(SITUP_CONFIG["FEEDBACK"]["PULLING_NECK"])
    
    # If no specific feedback issues, provide general positive feedback
    if not feedback:
        feedback = [SITUP_CONFIG["FEEDBACK"]["GOOD_FORM"]]

    # Calculate rep score
    rep_score, score_label = calculate_rep_score("situps", feedback)
    
    # Compile the feedback into a string
    feedback_message = " | ".join(feedback)
    
    # Log the rep if this is a new rep and we have a session ID
    if counter > state.get("counter", 0) and session_id:
        try:
            from session_state import record_rep
            metrics = {
                "hip_angle": avg_hip_angle,
                "neck_strain": neck_strain_detected
            }
            record_rep(session_id, "situps", feedback, metrics)
        except ImportError:
            # Session state module not available, continue without logging
            pass

    new_state = {
        "counter": counter,
        "stage": stage,
        "hipAngle": avg_hip_angle,
        "neckStrain": neck_strain_detected,
        "feedback": feedback_message,
        "rep_score": rep_score,
        "score_label": score_label,
        "feedback_flags": feedback
    }
    
    exercise_state["situps"] = new_state
    return new_state
