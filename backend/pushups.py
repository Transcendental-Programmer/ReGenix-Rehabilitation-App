import numpy as np
import mediapipe as mp
from state import exercise_state
from feedback_config import PUSHUP_CONFIG
from score_config import calculate_rep_score

def calculate_angle(a, b, c):
    a = np.array(a)  # First point (shoulder)
    b = np.array(b)  # Mid point (elbow)
    c = np.array(c)  # End point (wrist)
    
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    
    if angle > 180.0:
        angle = 360 - angle
    return angle

def check_body_alignment(shoulder, hip, ankle):
    """Check if body is in a straight line during pushup"""
    points = np.array([shoulder, hip, ankle])
    
    # Calculate the best-fit line through the points
    x = points[:, 0]
    y = points[:, 1]
    
    if len(set(x)) <= 1:  # Avoid division by zero if points are vertical
        return 0  # Perfect alignment
    
    # Calculate line of best fit
    coeffs = np.polyfit(x, y, 1)
    line_y = np.polyval(coeffs, x)
    
    # Calculate mean squared error as a measure of alignment
    mse = np.mean((y - line_y) ** 2)
    return mse  # Lower is better (closer to a straight line)

# Setup MediaPipe Pose for landmark indexing
mp_pose = mp.solutions.pose

def process_landmarks(landmarks, tolerance, session_id=None):
    """
    Process landmarks for pushup form analysis with enhanced feedback
    """
    try:
        # Extract landmarks
        left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                        landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
        right_shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                         landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
        left_elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
        right_elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                      landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
        left_wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
        right_wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                      landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]
        left_hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                   landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
        right_hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x,
                    landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y]
        left_ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
        right_ankle = [landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].x,
                      landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].y]
    except Exception:
        return {"error": "Insufficient landmarks data."}
    
    # Calculate elbow angles
    left_angle = calculate_angle(left_shoulder, left_elbow, left_wrist)
    right_angle = calculate_angle(right_shoulder, right_elbow, right_wrist)
    avg_elbow_angle = (left_angle + right_angle) / 2
    
    # Calculate body alignment (shoulder-hip-ankle)
    mid_shoulder = [(left_shoulder[0] + right_shoulder[0])/2, (left_shoulder[1] + right_shoulder[1])/2]
    mid_hip = [(left_hip[0] + right_hip[0])/2, (left_hip[1] + right_hip[1])/2]
    mid_ankle = [(left_ankle[0] + right_ankle[0])/2, (left_ankle[1] + right_ankle[1])/2]
    
    alignment_score = check_body_alignment(mid_shoulder, mid_hip, mid_ankle)
    
    # Retrieve or initialize pushup state
    state = exercise_state.get("pushups", {"counter": 0, "stage": "up", "feedback": "N/A"})
    stage = state.get("stage", "up")
    counter = state.get("counter", 0)
    
    # Pushup counter logic
    if avg_elbow_angle > 150:  # Arms extended (up position)
        stage = "up"
    elif avg_elbow_angle < PUSHUP_CONFIG["ELBOW_ANGLE_MIN"] + 10 and stage == "up":  # Arms bent (down position)
        stage = "down"
        counter += 1
    
    # Generate detailed feedback
    feedback = []
    
    # Check elbow angle (depth)
    if stage == "down":
        if avg_elbow_angle > PUSHUP_CONFIG["ELBOW_ANGLE_MAX"] + 10:
            feedback.append(PUSHUP_CONFIG["FEEDBACK"]["TOO_SHALLOW"])
        elif avg_elbow_angle < PUSHUP_CONFIG["ELBOW_ANGLE_MIN"] - 5:
            feedback.append(PUSHUP_CONFIG["FEEDBACK"]["TOO_DEEP"])
        else:
            feedback.append(PUSHUP_CONFIG["FEEDBACK"]["GOOD_DEPTH"])
    
    # Check body alignment
    if alignment_score > PUSHUP_CONFIG["ALIGNMENT_THRESHOLD"]:
        # Determine if hips are too high or too low
        if mid_hip[1] < (mid_shoulder[1] + mid_ankle[1])/2:  # Y increases downward
            feedback.append(PUSHUP_CONFIG["FEEDBACK"]["HIPS_TOO_HIGH"])
        else:
            feedback.append(PUSHUP_CONFIG["FEEDBACK"]["HIPS_TOO_LOW"])
    
    # If no specific feedback issues, provide general positive feedback
    if not feedback:
        feedback = [PUSHUP_CONFIG["FEEDBACK"]["GOOD_FORM"]]

    # Calculate rep score
    rep_score, score_label = calculate_rep_score("pushups", feedback)

    # Compile the feedback into a string
    feedback_message = " | ".join(feedback)
    
    # Log the rep if this is a new rep and we have a session ID
    if counter > state.get("counter", 0) and session_id:
        try:
            from session_state import record_rep
            metrics = {
                "elbow_angle": avg_elbow_angle,
                "alignment_score": alignment_score
            }
            record_rep(session_id, "pushups", feedback, metrics)
        except ImportError:
            # Session state module not available, continue without logging
            pass
    
    new_state = {
        "counter": counter,
        "stage": stage,
        "elbowAngle": avg_elbow_angle,
        "alignmentScore": alignment_score,
        "feedback": feedback_message,
        "rep_score": rep_score,
        "score_label": score_label,
        "feedback_flags": feedback
    }
    
    exercise_state["pushups"] = new_state
    return new_state
