"""
Exercise Feedback Configuration
-------------------------------
Research-backed thresholds and constants for providing accurate posture feedback.
These values are derived from exercise science research and biomechanical guidelines.

References:
- Knee angle during squats: Journal of Strength and Conditioning Research (2018)
- Torso angles: International Journal of Sports Physical Therapy (2019)
- Joint angles for safe exercise: American College of Sports Medicine guidelines
"""

# Global feedback categories
FEEDBACK_CATEGORIES = {
    "EXCELLENT": "Excellent form! Keep it up!",
    "GOOD": "Good form, continue with the exercise.",
    "NEEDS_IMPROVEMENT": "Your form needs some improvement.",
    "POOR": "Please adjust your form to avoid potential injury."
}

# Squat thresholds
SQUAT_CONFIG = {
    # Knee angle thresholds (degrees)
    "KNEE_ANGLE_MIN": 80,          # Minimum acceptable knee angle at bottom position
    "KNEE_ANGLE_OPTIMAL": 90,      # Optimal knee angle at bottom position (90° = thighs parallel to ground)
    "KNEE_ANGLE_MAX": 100,         # Maximum ideal knee angle at bottom position
    
    # Torso/back angle thresholds (degrees from vertical)
    "TORSO_ANGLE_MAX": 30,         # Maximum forward lean angle
    
    # Knee forward projection threshold
    "KNEE_FORWARD_MAX": 0.1,       # Maximum acceptable knee forward projection beyond toes (normalized)
    
    # Feedback messages
    "FEEDBACK": {
        "DEPTH_TOO_SHALLOW": "Squat deeper - aim for thighs parallel to the ground",
        "DEPTH_GOOD": "Good squat depth",
        "KNEES_TOO_FORWARD": "Keep knees behind toes",
        "BACK_TOO_BENT": "Keep your chest more upright",
        "GOOD_FORM": "Good squat form"
    }
}

# Deadlift thresholds
DEADLIFT_CONFIG = {
    # Back angle thresholds (degrees)
    "BACK_ANGLE_MIN": 150,         # Minimum (safe) back angle
    "BACK_ANGLE_WARNING": 140,     # Warning threshold for back angle
    
    # Hip hinge depth
    "HIP_HINGE_DEPTH_MIN": 120,    # Minimum hip angle for proper depth
    "HIP_HINGE_DEPTH_MAX": 140,    # Maximum hip angle for proper depth
    
    # Feedback messages
    "FEEDBACK": {
        "BACK_TOO_BENT": "Keep your back straighter to avoid injury",
        "NOT_DEEP_ENOUGH": "Bend lower for proper form - hinge at the hips",
        "TOO_DEEP": "Don't go too low - maintain tension in hamstrings",
        "STAND_STRAIGHT": "Stand fully upright at the top of the movement",
        "GOOD_FORM": "Good deadlift form"
    }
}

# Pushup thresholds
PUSHUP_CONFIG = {
    # Elbow angle thresholds (degrees)
    "ELBOW_ANGLE_MIN": 40,         # Minimum elbow angle at bottom
    "ELBOW_ANGLE_OPTIMAL": 45,     # Optimal elbow angle at bottom
    "ELBOW_ANGLE_MAX": 60,         # Maximum recommended elbow angle at bottom
    
    # Body alignment detection (shoulder-hip-ankle should be in line)
    "ALIGNMENT_THRESHOLD": 0.1,    # Maximum allowable deviation from straight line
    
    # Feedback messages
    "FEEDBACK": {
        "TOO_SHALLOW": "Lower your chest closer to the ground",
        "TOO_DEEP": "Don't go too low - protect your shoulders",
        "HIPS_TOO_HIGH": "Keep your body in a straight line - don't pike your hips",
        "HIPS_TOO_LOW": "Don't sag in the middle - engage your core",
        "GOOD_DEPTH": "Good pushup depth",
        "GOOD_FORM": "Good pushup form"
    }
}

# Lunges thresholds
LUNGE_CONFIG = {
    # Front knee angle thresholds (degrees)
    "FRONT_KNEE_ANGLE_MIN": 75,    # Minimum acceptable knee angle at bottom
    "FRONT_KNEE_ANGLE_OPTIMAL": 85, # Optimal knee angle at bottom
    "FRONT_KNEE_ANGLE_MAX": 95,    # Maximum ideal knee angle at bottom
    
    # Knee over toe threshold
    "KNEE_OVER_TOE_THRESHOLD": 0.05, # Maximum acceptable knee forward projection beyond toes (normalized)
    
    # Torso upright position
    "TORSO_UPRIGHT_MIN": 170,      # Minimum angle for upright torso
    
    # Feedback messages
    "FEEDBACK": {
        "KNEE_TOO_FORWARD": "Front knee is too far forward - keep behind toes",
        "NOT_DEEP_ENOUGH": "Go deeper - front thigh should be parallel to ground",
        "TOO_DEEP": "Don't go too low - protect your knees",
        "TORSO_LEANING": "Keep torso upright",
        "GOOD_FORM": "Good lunge form"
    }
}

# Situp thresholds
SITUP_CONFIG = {
    # Hip angle thresholds (degrees) - angle between shoulder, hip and knee
    "HIP_ANGLE_MIN": 30,           # Minimum hip angle at top position
    "HIP_ANGLE_OPTIMAL": 40,       # Optimal hip angle at top position
    "HIP_ANGLE_MAX": 60,           # Maximum recommended hip angle 
    
    # Feedback messages
    "FEEDBACK": {
        "NOT_HIGH_ENOUGH": "Come up higher - get your shoulders further off the ground",
        "TOO_HIGH": "Don't strain by coming up too high",
        "PULLING_NECK": "Don't pull on your neck - focus on using your core",
        "GOOD_FORM": "Good situp form"
    }
}

# Bicep curl thresholds
BICEP_CURL_CONFIG = {
    # Elbow angle thresholds (degrees)
    "ELBOW_ANGLE_MIN": 40,         # Minimum elbow angle at top (most flexed)
    "ELBOW_ANGLE_MAX": 60,         # Maximum elbow angle at top
    "ELBOW_EXTENSION_MIN": 150,    # Minimum elbow extension at bottom

    # Shoulder stability - detecting excessive shoulder movement
    "SHOULDER_MOVEMENT_THRESHOLD": 0.05, # Maximum acceptable shoulder movement (normalized)
    
    # Feedback messages
    "FEEDBACK": {
        "INCOMPLETE_CURL": "Curl the weight fully up - get your hand closer to shoulder",
        "INCOMPLETE_EXTENSION": "Extend your arm more at the bottom",
        "USING_MOMENTUM": "Use less momentum - control the motion",
        "SHOULDER_SWINGING": "Keep your shoulders stable - don't swing",
        "GOOD_CURL": "Good bicep curl form"
    }
}
