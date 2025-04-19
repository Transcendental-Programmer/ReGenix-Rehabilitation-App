

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// Import from external libraries - with correct imports
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";
// Import POSE_CONNECTIONS from the correct location
import { POSE_CONNECTIONS } from "@mediapipe/pose";

// Joint mapping for pose detection
const jointMap = {
  "nose": 0,
  "left_eye_inner": 1,
  "left_eye": 2, 
  "left_eye_outer": 3,
  "right_eye_inner": 4,
  "right_eye": 5,
  "right_eye_outer": 6,
  "left_ear": 7,
  "right_ear": 8,
  "mouth_left": 9,
  "mouth_right": 10,
  "left_shoulder": 11,
  "right_shoulder": 12,
  "left_elbow": 13,
  "right_elbow": 14,
  "left_wrist": 15,
  "right_wrist": 16,
  "left_pinky": 17,
  "right_pinky": 18,
  "left_index": 19,
  "right_index": 20,
  "left_thumb": 21,
  "right_thumb": 22,
  "left_hip": 23,
  "right_hip": 24,
  "left_knee": 25,
  "right_knee": 26,
  "left_ankle": 27,
  "right_ankle": 28,
  "left_heel": 29,
  "right_heel": 30,
  "left_foot_index": 31,
  "right_foot_index": 32
};

// Helper Geometric Functions
const midpoint = (p1: any, p2: any) => {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    z: (p1.z + p2.z) / 2
  };
};

const distance = (p1: any, p2: any) => {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) +
    Math.pow(p2.y - p1.y, 2) +
    Math.pow(p2.z - p1.z, 2)
  );
};

const calculateAngle = (a: any, b: any, c: any) => {
  const ab = {
    x: b.x - a.x,
    y: b.y - a.y
  };
  const bc = {
    x: c.x - b.x,
    y: c.y - b.y
  };
  
  const dotProduct = (ab.x * bc.x) + (ab.y * bc.y);
  const abMagnitude = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
  const bcMagnitude = Math.sqrt(bc.x * bc.x + bc.y * bc.y);
  
  const angleRadians = Math.acos(dotProduct / (abMagnitude * bcMagnitude));
  return angleRadians * (180 / Math.PI);
};

const perpendicularDistance = (lineStart: any, lineEnd: any, point: any) => {
  const lineLength = distance(lineStart, lineEnd);
  
  const area = Math.abs(
    0.5 * (
      (lineStart.x * lineEnd.y - lineEnd.x * lineStart.y) +
      (lineEnd.x * point.y - point.x * lineEnd.y) +
      (point.x * lineStart.y - lineStart.x * point.y)
    )
  );
  
  return (2 * area) / lineLength;
};

// Exercise-Specific Functions
const calculateKneeAlignment = (landmarks: any[]) => {
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  
  const hipDistance = Math.sqrt(
    Math.pow(rightHip.x - leftHip.x, 2) + 
    Math.pow(rightHip.y - leftHip.y, 2)
  );
  
  const kneeDistance = Math.sqrt(
    Math.pow(rightKnee.x - leftKnee.x, 2) + 
    Math.pow(rightKnee.y - leftKnee.y, 2)
  );
  
  return kneeDistance / hipDistance;
};

const checkBodyAlignment = (landmarks: any[]) => {
  const shoulders = midpoint(landmarks[11], landmarks[12]);
  const hips = midpoint(landmarks[23], landmarks[24]);
  const ankles = midpoint(landmarks[27], landmarks[28]);
  
  // Calculate deviation from straight line
  const deviation = perpendicularDistance(
    shoulders, ankles, hips
  );
  
  return deviation / distance(shoulders, ankles);
};

const calculateHipHinge = (currentLandmarks: any[], startingLandmarks: any[]) => {
  const currentHipAngle = calculateAngle(
    currentLandmarks[11], // shoulder
    currentLandmarks[23], // hip
    currentLandmarks[25]  // knee
  );
  
  const currentKneeAngle = calculateAngle(
    currentLandmarks[23], // hip
    currentLandmarks[25], // knee
    currentLandmarks[27]  // ankle
  );
  
  const startingHipAngle = calculateAngle(
    startingLandmarks[11],
    startingLandmarks[23],
    startingLandmarks[25]
  );
  
  const startingKneeAngle = calculateAngle(
    startingLandmarks[23],
    startingLandmarks[25],
    startingLandmarks[27]
  );
  
  const hipAngleChange = Math.abs(currentHipAngle - startingHipAngle);
  const kneeAngleChange = Math.abs(currentKneeAngle - startingKneeAngle);
  
  return hipAngleChange / kneeAngleChange;
};

const checkKneeAlignment = (landmarks: any[], activeLeg: string) => {
  const kneeIdx = activeLeg === 'left' ? 25 : 26;
  const ankleIdx = activeLeg === 'left' ? 27 : 28;
  const toeIdx = activeLeg === 'left' ? 31 : 32;
  
  const knee = landmarks[kneeIdx];
  const ankle = landmarks[ankleIdx];
  const toe = landmarks[toeIdx];
  
  // Calculate if knee projects beyond toe
  const kneeProjection = (knee.x - ankle.x) / (toe.x - ankle.x);
  
  return kneeProjection;
};

const checkNeckPosition = (landmarks: any[]) => {
  const nose = landmarks[0];
  const leftEar = landmarks[7];
  const rightEar = landmarks[8];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  
  // Calculate midpoints
  const earMidpoint = midpoint(leftEar, rightEar);
  const shoulderMidpoint = midpoint(leftShoulder, rightShoulder);
  
  // Forward head position is when nose projects too far forward of ear-shoulder line
  const earShoulderAngle = calculateAngle(earMidpoint, shoulderMidpoint, { x: shoulderMidpoint.x, y: 0 });
  const noseProjection = perpendicularDistance(earMidpoint, shoulderMidpoint, nose);
  
  return { earShoulderAngle, noseProjection };
};

const checkElbowStability = (landmarks: any[]) => {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  
  // Calculate torso centerline
  const shoulderMidpoint = midpoint(leftShoulder, rightShoulder);
  const hipMidpoint = midpoint(leftHip, rightHip);
  
  // Find perpendicular distance from elbows to centerline
  const leftElbowDeviation = perpendicularDistance(shoulderMidpoint, hipMidpoint, leftElbow);
  const rightElbowDeviation = perpendicularDistance(shoulderMidpoint, hipMidpoint, rightElbow);
  
  // Normalize by arm length
  const leftArmLength = distance(leftShoulder, leftElbow);
  const rightArmLength = distance(rightShoulder, rightElbow);
  
  return {
    leftElbowStability: leftElbowDeviation / leftArmLength,
    rightElbowStability: rightElbowDeviation / rightArmLength
  };
};

export default function Exercise() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const exerciseName = searchParams.get("exercise");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [repCount, setRepCount] = useState(0);
  const [stage, setStage] = useState("N/A");
  const [feedback, setFeedback] = useState("Waiting...");
  const [lighting, setLighting] = useState("Checking...");
  const [currentSet, setCurrentSet] = useState(1);
  const [latestFeedback, setLatestFeedback] = useState<{
    affected_joints?: string[];
    affected_segments?: [string, string][];
    feedback_flags?: string[];
    rep_score?: number;
    score_label?: string;
    advanced_metrics?: Record<string, number>;
  } | null>(null);

  // State for visibility check
  const [visibilityStatus, setVisibilityStatus] = useState("Checking...");
  // State for movement speed check
  const [movementStatus, setMovementStatus] = useState("Checking...");
  // Previous landmarks for movement speed check
  const prevLandmarksRef = useRef<any[]>([]);

  // Exercise Parameters
  const totalSets = 3;      // Default sets per exercise
  const repsGoal = 10;      // Default reps per set
  const BRIGHTNESS_THRESHOLD = 80;
  const VISIBILITY_THRESHOLD = 0.5;
  const REQUIRED_VISIBLE_RATIO = 0.75;
  const CONTROLLED_MOVEMENT_THRESHOLD = 0.03;
  
  const setCompleteDialogShown = useRef(false);
  const cameraRef = useRef<any>(null);
  const startingLandmarksRef = useRef<any[]>([]);

  useEffect(() => {
    if (!exerciseName) {
      alert("No exercise specified!");
      navigate("/");
      return;
    }

    // Make sure DOM elements are available
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) {
      console.error("Video or canvas element not found");
      return;
    }
    
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Canvas context not available");
      return;
    }

    const getJointIndex = (jointName: string) => jointMap[jointName as keyof typeof jointMap] ?? -1;

    const getAverageBrightness = (video: HTMLVideoElement) => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return 0;
      
      tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
      const { data } = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        const brightness = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        totalBrightness += brightness;
      }
      return totalBrightness / (data.length / 4);
    };

    const resetExerciseState = async () => {
      try {
        await fetch(`http://localhost:8000/reset/${exerciseName}`, { method: "POST" });
        setRepCount(0);
        startingLandmarksRef.current = [];
      } catch (err) {
        console.error("Reset error:", err);
      }
    };

    // Import Pose from @mediapipe/pose
    if (!window.Pose) {
      console.error("Pose detection is not available. Make sure to include MediaPipe Pose library.");
      setFeedback("Pose detection not available");
      return;
    }

    const pose = new window.Pose({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    pose.onResults(async (results: any) => {
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.poseLandmarks) {
        // Check visibility
        const visibleLandmarks = results.poseLandmarks.filter(
          (landmark: any) => landmark.visibility > VISIBILITY_THRESHOLD
        );
        
        const visibilityRatio = visibleLandmarks.length / results.poseLandmarks.length;
        setVisibilityStatus(
          visibilityRatio >= REQUIRED_VISIBLE_RATIO 
            ? "Good" 
            : "Poor - Please ensure your full body is visible"
        );
        
        // Check movement speed
        if (prevLandmarksRef.current.length > 0) {
          let totalMovement = 0;
          for (let i = 0; i < results.poseLandmarks.length; i++) {
            const curr = results.poseLandmarks[i];
            const prev = prevLandmarksRef.current[i];
            if (curr && prev) {
              totalMovement += Math.sqrt(
                Math.pow(curr.x - prev.x, 2) + 
                Math.pow(curr.y - prev.y, 2)
              );
            }
          }
          const avgMovement = totalMovement / results.poseLandmarks.length;
          
          setMovementStatus(
            avgMovement <= CONTROLLED_MOVEMENT_THRESHOLD 
              ? "Good" 
              : "Too Fast - Please move more slowly for accurate tracking"
          );
          
          // Skip processing if movement is too fast
          if (avgMovement > CONTROLLED_MOVEMENT_THRESHOLD) {
            prevLandmarksRef.current = [...results.poseLandmarks];
            ctx.restore();
            return;
          }
        }
        
        // Store landmarks for next comparison
        prevLandmarksRef.current = [...results.poseLandmarks];
        
        // Store starting landmarks for exercises that need it (like deadlifts)
        if (startingLandmarksRef.current.length === 0) {
          startingLandmarksRef.current = [...results.poseLandmarks];
        }

        // Draw connections first (bones)
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 2,
        });

        // Highlight problem segments if feedback available
        if (latestFeedback?.affected_segments) {
          latestFeedback.affected_segments.forEach(([start, end]) => {
            const startJoint = getJointIndex(start);
            const endJoint = getJointIndex(end);
            if (startJoint !== -1 && endJoint !== -1) {
              drawConnectors(ctx, results.poseLandmarks, [[startJoint, endJoint]], {
                color: "#FF0000",
                lineWidth: 3,
              });
            }
          });
        }

        // Draw landmarks (joints)
        drawLandmarks(ctx, results.poseLandmarks, {
          color: "#FF0000",
          lineWidth: 1,
          fillColor: "#FFFFFF",
        });

        // Highlight problem joints if feedback available
        if (latestFeedback?.affected_joints) {
          latestFeedback.affected_joints.forEach((jointName) => {
            const jointIndex = getJointIndex(jointName);
            if (jointIndex !== -1) {
              const landmark = results.poseLandmarks[jointIndex];
              if (landmark) {
                ctx.fillStyle = "#FF0000";
                ctx.strokeStyle = "#FFFFFF";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 8, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
              }
            }
          });
        }

        // Only proceed if lighting, visibility, and movement are acceptable
        if (visibilityRatio >= REQUIRED_VISIBLE_RATIO) {
          try {
            const res = await fetch(`http://localhost:8000/landmarks/${exerciseName}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ landmarks: results.poseLandmarks }),
            });

            const data = await res.json();
            const currentReps = data.counter ?? data.repCount ?? 0;

            setRepCount(currentReps);
            setStage(data.repState ?? data.stage ?? "N/A");
            setFeedback(data.feedback ?? "N/A");
            setLatestFeedback({
              affected_joints: data.affected_joints ?? [],
              affected_segments: data.affected_segments ?? [],
              feedback_flags: data.feedback_flags ?? [],
              rep_score: data.rep_score ?? 0,
              score_label: data.score_label ?? "",
              advanced_metrics: data.advanced_metrics ?? {}
            });

            if (currentReps >= repsGoal && !setCompleteDialogShown.current) {
              setCompleteDialogShown.current = true;

              setTimeout(() => {
                if (currentSet < totalSets) {
                  alert(`Set ${currentSet} completed! Click OK to start set ${currentSet + 1}.`);
                  setCurrentSet((prev) => prev + 1);
                  resetExerciseState();
                } else {
                  alert("Workout completed! Great job!");
                  navigate("/");
                }
                setCompleteDialogShown.current = false;
              }, 100);
            }
          } catch (err) {
            console.error("Backend error:", err);
            setFeedback("Connection error. Check backend server.");
          }
        }
      }

      ctx.restore();
    });

    cameraRef.current = new Camera(video, {
      onFrame: async () => {
        if (video.videoWidth > 0) { // Make sure video is loaded
          const brightness = getAverageBrightness(video);
          if (brightness < BRIGHTNESS_THRESHOLD) {
            setLighting("Too Dark");
            setFeedback("Lighting is too dark. Please improve your lighting.");
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
          } else {
            setLighting("Good");
            await pose.send({ image: video });
          }
        }
      },
      width: 640,
      height: 480,
    });

    cameraRef.current.start().catch((err: Error) => {
      console.error("Camera error:", err);
      alert("Failed to start camera. Check permissions.");
    });

    return () => {
      if (cameraRef.current) cameraRef.current.stop();
    };

  }, [exerciseName, currentSet, navigate]);

  // Function to get exercise-specific metrics for display
  const getExerciseMetrics = () => {
    if (!latestFeedback?.advanced_metrics) return null;
    
    const metrics = latestFeedback.advanced_metrics;
    const metricRows = Object.entries(metrics).map(([key, value]) => (
      <p key={key}><strong>{key.replace(/_/g, " ")}:</strong> {value.toFixed(1)}</p>
    ));
    
    return metricRows.length > 0 ? (
      <div className="metrics-box">
        <h3>Advanced Metrics</h3>
        {metricRows}
      </div>
    ) : null;
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>{exerciseName ? exerciseName.replace("_", " ").toUpperCase() : "Exercise"}</h2>
      <video ref={videoRef} style={{ display: "none" }} playsInline></video>
      <canvas ref={canvasRef} width={640} height={480} style={{ border: "1px solid black" }} />
      
      <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-around", flexWrap: "wrap" }}>
        <div className="stats-box" style={{ margin: "10px", padding: "15px", border: "1px solid #ccc", borderRadius: "8px", minWidth: "200px" }}>
          <h3>Exercise Stats</h3>
          <p><strong>Lighting:</strong> {lighting}</p>
          <p><strong>Visibility:</strong> {visibilityStatus}</p>
          <p><strong>Movement:</strong> {movementStatus}</p>
          <p><strong>Reps:</strong> {repCount} / {repsGoal}</p>
          <p><strong>Set:</strong> {currentSet} / {totalSets}</p>
          <p><strong>Stage:</strong> {stage}</p>
        </div>
        
        <div className="feedback-box" style={{ margin: "10px", padding: "15px", border: "1px solid #ccc", borderRadius: "8px", minWidth: "200px" }}>
          <h3>Feedback</h3>
          <p>{feedback}</p>
          {latestFeedback?.rep_score && (
            <p><strong>Score:</strong> {latestFeedback.rep_score} - {latestFeedback.score_label}</p>
          )}
        </div>
        
        {getExerciseMetrics()}
      </div>
    </div>
  );
}

// Extend the Window interface to include the Pose constructor
declare global {
  interface Window {
    Pose: any;
  }
}