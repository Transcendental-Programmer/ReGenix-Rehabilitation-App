import numpy as np
from state import exercise_state
from feedback_config import SQUAT_CONFIG

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

def process_landmarks(landmarks, tolerance):
    knee_angles = []
    knee_projections = []
    torso_angles = []
    
    # Extract and calculate left side measurements
    try:
        left_shoulder = [landmarks[11]['x'], landmarks[11]['y']]
        left_hip = [landmarks[23]['x'], landmarks[23]['y']]
        left_knee = [landmarks[25]['x'], landmarks[25]['y']]
        left_ankle = [landmarks[27]['x'], landmarks[27]['y']]
        
        # Calculate angle and metrics
        left_knee_angle = calculate_angle(left_hip, left_knee, left_ankle)
        left_knee_projection = calculate_knee_projection(left_hip, left_knee, left_ankle)
        left_torso_angle = calculate_torso_angle(left_shoulder, left_hip)
        
        knee_angles.append(left_knee_angle)
        knee_projections.append(left_knee_projection)
        torso_angles.append(left_torso_angle)
    except Exception as e:
        pass

    # Extract and calculate right side measurements
    try:
        right_shoulder = [landmarks[12]['x'], landmarks[12]['y']]
        right_hip = [landmarks[24]['x'], landmarks[24]['y']]
        right_knee = [landmarks[26]['x'], landmarks[26]['y']]
        right_ankle = [landmarks[28]['x'], landmarks[28]['y']]
        
        # Calculate angle and metrics
        right_knee_angle = calculate_angle(right_hip, right_knee, right_ankle)
        right_knee_projection = calculate_knee_projection(right_hip, right_knee, right_ankle)
        right_torso_angle = calculate_torso_angle(right_shoulder, right_hip)
        
        knee_angles.append(right_knee_angle)
        knee_projections.append(right_knee_projection)
        torso_angles.append(right_torso_angle)
    except Exception as e:
        pass

    if not knee_angles:
        return {"error": "Insufficient landmarks data."}

    # Average the measurements
    avg_knee_angle = sum(knee_angles) / len(knee_angles)
    avg_knee_projection = sum(knee_projections) / len(knee_projections)
    avg_torso_angle = sum(torso_angles) / len(torso_angles)

    # Retrieve the current state
    state = exercise_state.get("squats", {
        "counter": 0,
        "stage": "up",
        "repCounted": False,
        "currentMinKnee": None,
        "currentMinTrunk": None,
        "feedback": "N/A"
    })
    
    stage = state.get("stage", "up")
    counter = state.get("counter", 0)

    # Squat detection logic
    if avg_knee_angle > 160:  # Standing relatively straight
        stage = "up"
    elif avg_knee_angle < SQUAT_CONFIG["KNEE_ANGLE_MIN"] + 5 and stage == "up":  # Squatting down
        stage = "down"
        counter += 1

    # Generate detailed feedback
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
    
    # If no specific feedback issues, provide general positive feedback
    if not feedback:
        feedback = [SQUAT_CONFIG["FEEDBACK"]["GOOD_FORM"]]

    # Compile the feedback into a string
    feedback_message = " | ".join(feedback)

    # Update state with metrics for potential future use
    new_state = {
        "counter": counter,
        "stage": stage,
        "repCounted": False,
        "currentMinKnee": avg_knee_angle,
        "currentTorsoAngle": avg_torso_angle,
        "kneeProjection": avg_knee_projection,
        "feedback": feedback_message
    }
    
    exercise_state["squats"] = new_state
    return new_state
