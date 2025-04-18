import numpy as np
import time
from state import exercise_state
from feedback_config import SQUAT_CONFIG, SQUAT_METRICS, ADVANCED_FEEDBACK

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
         angle = 360 - angle
    return angle

def calculate_knee_projection(hip, knee, ankle):
    """Calculate how far knee extends beyond toes (normalized by limb length)"""
    # Convert to numpy arrays for vector math
    hip = np.array(hip)
    knee = np.array(knee)
    ankle = np.array(ankle)
    
    # Get the ankle-to-knee vector direction
    ankle_knee_vector = knee - ankle
    ankle_knee_length = np.linalg.norm(ankle_knee_vector)
    if ankle_knee_length == 0:  # Avoid division by zero
        return 0
    
    # Project the knee point onto the vertical line from ankle
    projection = ankle_knee_vector[0] / ankle_knee_length  # Normalized horizontal component
    
    return projection  # Positive means knee is forward of ankle

def calculate_torso_angle(shoulder, hip):
    """Calculate torso angle from vertical (0 degrees is perfectly upright)"""
    # Calculate the angle between the torso and the vertical axis
    vertical_vector = np.array([0, -1])  # Upward vertical vector
    torso_vector = np.array([shoulder[0] - hip[0], shoulder[1] - hip[1]])
    
    # Normalize the torso vector
    torso_length = np.linalg.norm(torso_vector)
    if torso_length == 0:  # Avoid division by zero
        return 0
    torso_vector = torso_vector / torso_length
    
    # Calculate angle using dot product
    dot_product = np.dot(vertical_vector, torso_vector)
    angle = np.arccos(np.clip(dot_product, -1.0, 1.0)) * 180.0 / np.pi
    
    return angle

def calculate_knee_valgus(hip, knee, ankle):
    """Calculate knee valgus angle (inward collapse) in the frontal plane"""
    hip = np.array(hip)
    knee = np.array(knee)
    ankle = np.array(ankle)
    
    # Create vectors from knee to hip and knee to ankle
    knee_to_hip = hip - knee
    knee_to_ankle = ankle - knee
    
    # Project vectors onto frontal plane (assuming y is height)
    knee_to_hip_frontal = np.array([knee_to_hip[0], 0, knee_to_hip[2] if len(knee_to_hip) > 2 else 0])
    knee_to_ankle_frontal = np.array([knee_to_ankle[0], 0, knee_to_ankle[2] if len(knee_to_ankle) > 2 else 0])
    
    # Calculate angle between the two vectors in frontal plane
    dot_product = np.dot(knee_to_hip_frontal, knee_to_ankle_frontal)
    magnitude1 = np.linalg.norm(knee_to_hip_frontal)
    magnitude2 = np.linalg.norm(knee_to_ankle_frontal)
    
    if magnitude1 * magnitude2 == 0:  # Avoid division by zero
        return 0
    
    cosine = dot_product / (magnitude1 * magnitude2)
    angle = np.arccos(np.clip(cosine, -1.0, 1.0)) * 180.0 / np.pi
    
    return angle

def process_landmarks(landmarks, tolerance, session_id=None):
    """
    Process landmarks for squat form analysis with enhanced feedback and advanced metrics
    """
    knee_angles = []
    knee_projections = []
    torso_angles = []
    knee_valgus_angles = []  # New metric: knee valgus angle
    
    # Record timestamp for tempo analysis
    current_time = time.time()
    
    # Extract and calculate left side measurements
    try:
        left_shoulder = [landmarks[11]['x'], landmarks[11]['y']]
        left_hip = [landmarks[23]['x'], landmarks[23]['y']]
        left_knee = [landmarks[25]['x'], landmarks[25]['y']]
        left_ankle = [landmarks[27]['x'], landmarks[27]['y']]
        
        # Calculate standard metrics
        left_knee_angle = calculate_angle(left_hip, left_knee, left_ankle)
        left_knee_projection = calculate_knee_projection(left_hip, left_knee, left_ankle)
        left_torso_angle = calculate_torso_angle(left_shoulder, left_hip)
        
        # Calculate advanced metrics
        left_knee_valgus = calculate_knee_valgus(left_hip, left_knee, left_ankle)
        
        knee_angles.append(left_knee_angle)
        knee_projections.append(left_knee_projection)
        torso_angles.append(left_torso_angle)
        knee_valgus_angles.append(left_knee_valgus)
    except Exception as e:
        pass

    # Extract and calculate right side measurements
    try:
        right_shoulder = [landmarks[12]['x'], landmarks[12]['y']]
        right_hip = [landmarks[24]['x'], landmarks[24]['y']]
        right_knee = [landmarks[26]['x'], landmarks[26]['y']]
        right_ankle = [landmarks[28]['x'], landmarks[28]['y']]
        
        # Calculate standard metrics
        right_knee_angle = calculate_angle(right_hip, right_knee, right_ankle)
        right_knee_projection = calculate_knee_projection(right_hip, right_knee, right_ankle)
        right_torso_angle = calculate_torso_angle(right_shoulder, right_hip)
        
        # Calculate advanced metrics
        right_knee_valgus = calculate_knee_valgus(right_hip, right_knee, right_ankle)
        
        knee_angles.append(right_knee_angle)
        knee_projections.append(right_knee_projection)
        torso_angles.append(right_torso_angle)
        knee_valgus_angles.append(right_knee_valgus)
    except Exception as e:
        pass

    if not knee_angles:
        return {"error": "Insufficient landmarks data."}

    # Average the standard measurements
    avg_knee_angle = sum(knee_angles) / len(knee_angles)
    avg_knee_projection = sum(knee_projections) / len(knee_projections)
    avg_torso_angle = sum(torso_angles) / len(torso_angles)
    avg_knee_valgus = sum(knee_valgus_angles) / len(knee_valgus_angles) if knee_valgus_angles else 0
    
    # Calculate left-right asymmetry (new metric)
    knee_asymmetry = abs(knee_angles[0] - knee_angles[1]) if len(knee_angles) > 1 else 0

    # Retrieve the current state
    state = exercise_state.get("squats", {
        "counter": 0,
        "stage": "up",
        "repCounted": False,
        "currentMinKnee": None,
        "currentMinTrunk": None,
        "feedback": "N/A",
        "last_stage_time": current_time,
        "descent_time": 0
    })
    
    stage = state.get("stage", "up")
    counter = state.get("counter", 0)
    last_stage_time = state.get("last_stage_time", current_time)
    
    # Calculate phase timing for tempo analysis
    phase_duration = current_time - last_stage_time
    
    # Squat detection logic (same as before)
    if avg_knee_angle > 160:  # Standing relatively straight
        if stage == "down":
            # We just completed a rep, so calculate the concentric duration
            concentric_time = phase_duration
            state["concentric_time"] = concentric_time
        stage = "up"
        last_stage_time = current_time  # Reset the timer for the next phase
    elif avg_knee_angle < SQUAT_CONFIG["KNEE_ANGLE_MIN"] + 5 and stage == "up":  # Squatting down
        # We just completed the descent, calculate the eccentric duration
        descent_time = phase_duration
        state["descent_time"] = descent_time
        stage = "down"
        last_stage_time = current_time  # Reset the timer for the next phase
        counter += 1

    # Generate detailed feedback including advanced metrics
    feedback = []
    
    # Check squat depth
    if stage == "down":
        if avg_knee_angle > SQUAT_CONFIG["KNEE_ANGLE_MAX"] + 10:
            feedback.append(SQUAT_CONFIG["FEEDBACK"]["DEPTH_TOO_SHALLOW"])
        else:
            feedback.append(SQUAT_CONFIG["FEEDBACK"]["DEPTH_GOOD"])
    
    # Check knee forward projection
    if avg_knee_projection > SQUAT_CONFIG["KNEE_FORWARD_MAX"]:
        feedback.append(SQUAT_CONFIG["FEEDBACK"]["KNEES_TOO_FORWARD"])
    
    # Check torso angle
    if avg_torso_angle > SQUAT_CONFIG["TORSO_ANGLE_MAX"]:
        feedback.append(SQUAT_CONFIG["FEEDBACK"]["BACK_TOO_BENT"])
    
    # Advanced feedback based on new metrics
    if avg_knee_valgus > SQUAT_METRICS["KNEE_VALGUS_MAX"]:
        feedback.append(ADVANCED_FEEDBACK["SQUAT_KNEE_VALGUS"])
        
    if knee_asymmetry > SQUAT_METRICS["KNEE_SYMMETRY_MAX"]:
        feedback.append(ADVANCED_FEEDBACK["SQUAT_ASYMMETRY"])
        
    # Check descent speed if we just completed a descent
    if stage == "down" and "descent_time" in state:
        descent_time = state["descent_time"]
        if descent_time < SQUAT_METRICS["DESCENT_TIME_MIN"]:
            feedback.append(ADVANCED_FEEDBACK["SQUAT_DESCENT_FAST"])
    
    # If no specific feedback issues, provide general positive feedback
    if not feedback:
        feedback = [SQUAT_CONFIG["FEEDBACK"]["GOOD_FORM"]]

    # Compile the feedback into a string
    feedback_message = " | ".join(feedback)

    # Prepare all metrics for session tracking
    advanced_metrics = {
        "knee_angle": avg_knee_angle,
        "torso_angle": avg_torso_angle,
        "knee_projection": avg_knee_projection,
        "knee_valgus": avg_knee_valgus,
        "knee_asymmetry": knee_asymmetry,
        "descent_time": state.get("descent_time", 0),
        "concentric_time": state.get("concentric_time", 0),
    }
    
    # Log the rep if this is a new rep and we have a session ID
    if counter > state.get("counter", 0) and session_id:
        try:
            from session_state import record_rep
            record_rep(session_id, "squats", feedback, advanced_metrics)
        except ImportError:
            # Session state module not available, continue without logging
            pass

    # Update state with metrics for potential future use
    new_state = {
        "counter": counter,
        "stage": stage,
        "repCounted": False,
        "currentMinKnee": avg_knee_angle,
        "currentTorsoAngle": avg_torso_angle,
        "kneeProjection": avg_knee_projection,
        "kneeValgus": avg_knee_valgus,
        "kneeAsymmetry": knee_asymmetry,
        "last_stage_time": last_stage_time,
        "descent_time": state.get("descent_time", 0),
        "concentric_time": state.get("concentric_time", 0),
        "feedback": feedback_message,
        "feedback_flags": feedback,
        "advanced_metrics": advanced_metrics
    }
    
    exercise_state["squats"] = new_state
    return new_state
