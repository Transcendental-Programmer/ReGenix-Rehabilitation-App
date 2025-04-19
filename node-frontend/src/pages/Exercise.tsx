import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// Import from MediaPipe libraries
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";
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

// Types for landmarks and feedback
interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface FeedbackData {
  affected_joints?: string[];
  affected_segments?: [string, string][];
  feedback_flags?: string[];
  rep_score?: number;
  score_label?: string;
  advanced_metrics?: Record<string, number>;
  counter?: number;
  repCount?: number;
  repState?: string;
  stage?: string;
  feedback?: string;
}

const Exercise: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const exerciseName = searchParams.get("exercise");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [repCount, setRepCount] = useState<number>(0);
  const [stage, setStage] = useState<string>("N/A");
  const [feedback, setFeedback] = useState<string>("Waiting for camera...");
  const [lighting, setLighting] = useState<string>("Checking...");
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [latestFeedback, setLatestFeedback] = useState<FeedbackData | null>(null);
  const [cameraReady, setCameraReady] = useState<boolean>(false);

  // State for visibility and movement tracking
  const [visibilityStatus, setVisibilityStatus] = useState<string>("Checking...");
  const [movementStatus, setMovementStatus] = useState<string>("Checking...");
  
  // Exercise Parameters
  const totalSets = 3;
  const repsGoal = 10;
  const BRIGHTNESS_THRESHOLD = 80;
  const VISIBILITY_THRESHOLD = 0.5;
  const REQUIRED_VISIBLE_RATIO = 0.75;
  const CONTROLLED_MOVEMENT_THRESHOLD = 0.03;
  
  // References for tracking
  const prevLandmarksRef = useRef<Landmark[]>([]);
  const setCompleteDialogShown = useRef<boolean>(false);
  const cameraRef = useRef<any>(null);
  const poseRef = useRef<any>(null);
  const startingLandmarksRef = useRef<Landmark[]>([]);

  // Helper functions
  const getJointIndex = (jointName: string): number => {
    return jointMap[jointName as keyof typeof jointMap] ?? -1;
  };

  const getAverageBrightness = (video: HTMLVideoElement): number => {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth || 1;
    tempCanvas.height = video.videoHeight || 1;
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

  const resetExerciseState = async (): Promise<void> => {
    try {
      await fetch(`http://localhost:8000/reset/${exerciseName}`, { method: "POST" });
      setRepCount(0);
      startingLandmarksRef.current = [];
    } catch (err) {
      console.error("Reset error:", err);
    }
  };

  // Setup MediaPipe Pose
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

    // Update page title
    document.title = `ReGenix - ${exerciseName.replace("_", " ").toUpperCase()}`;

    // Initialize MediaPipe Pose
    const setupPose = async () => {
      try {
        // Wait for the Pose class to be available
        if (typeof window.Pose !== 'function') {
          console.log("Waiting for MediaPipe Pose to load...");
          setFeedback("Loading pose detection...");
          setTimeout(setupPose, 500);
          return;
        }

        console.log("Creating Pose instance");
        setFeedback("Initializing pose detection...");
        
        const pose = new window.Pose({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });

        pose.onResults((results: any) => {
          // Ensure canvas context is still valid
          const currentCtx = canvas.getContext("2d");
          if (!currentCtx) return;

          currentCtx.save();
          currentCtx.clearRect(0, 0, canvas.width, canvas.height);
          currentCtx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

          if (results.poseLandmarks) {
            // Check visibility
            const visibleLandmarks = results.poseLandmarks.filter(
              (landmark: Landmark) => landmark.visibility && landmark.visibility > VISIBILITY_THRESHOLD
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
                currentCtx.restore();
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
            drawConnectors(currentCtx, results.poseLandmarks, POSE_CONNECTIONS, {
              color: "#00FF00",  // Default green color
              lineWidth: 2 
            });

            // Highlight problem segments if feedback available
            if (latestFeedback?.affected_segments) {
              latestFeedback.affected_segments.forEach(([start, end]) => {
                const startJoint = getJointIndex(start);
                const endJoint = getJointIndex(end);
                if (startJoint !== -1 && endJoint !== -1) {
                  drawConnectors(currentCtx, results.poseLandmarks, [[startJoint, endJoint]], {
                    color: "#FF0000",  // Red for problem areas
                    lineWidth: 3,
                  });
                }
              });
            }

            // Draw landmarks (joints)
            drawLandmarks(currentCtx, results.poseLandmarks, {
              color: "#FF0000",  // Default red color
              lineWidth: 1,
              fillColor: "#FFFFFF"  // White fill
            });

            // Highlight problem joints if feedback available
            if (latestFeedback?.affected_joints) {
              latestFeedback.affected_joints.forEach((jointName) => {
                const jointIndex = getJointIndex(jointName);
                if (jointIndex !== -1) {
                  const landmark = results.poseLandmarks[jointIndex];
                  if (landmark) {
                    currentCtx.fillStyle = "#FF0000";  // Red
                    currentCtx.strokeStyle = "#FFFFFF";  // White outline
                    currentCtx.lineWidth = 2;
                    currentCtx.beginPath();
                    currentCtx.arc(
                      landmark.x * canvas.width, 
                      landmark.y * canvas.height, 
                      8,  // Larger radius for emphasis
                      0, 2 * Math.PI
                    );
                    currentCtx.fill();
                    currentCtx.stroke();
                  }
                }
              });
            }

            // Only send landmarks to backend if visibility is good
            if (visibilityRatio >= REQUIRED_VISIBLE_RATIO) {
              fetch(`http://localhost:8000/landmarks/${exerciseName}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ landmarks: results.poseLandmarks }),
              })
                .then(res => res.json())
                .then((data: FeedbackData) => {
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

                  // Check if set is complete
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
                })
                .catch(err => {
                  console.error("Backend error:", err);
                  setFeedback("Connection error. Check backend server.");
                });
            }
          }

          currentCtx.restore();
        });

        // Store pose reference
        poseRef.current = pose;
        console.log("Pose setup complete");
        
        // Now setup the camera
        setupCamera();
      } catch (error) {
        console.error("Error setting up MediaPipe Pose:", error);
        setFeedback("Failed to initialize pose detection. Please reload.");
      }
    };

    // Setup camera
    const setupCamera = async () => {
      try {
        console.log("Setting up camera");
        setFeedback("Initializing camera...");
        
        if (!video || !poseRef.current) {
          console.error("Video element or Pose not available");
          return;
        }

        // Request camera permissions explicitly
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: false
          });
          // Stop the stream immediately to avoid conflicts with Camera utility
          stream.getTracks().forEach(track => track.stop());
        } catch (error) {
          console.error("Camera permission denied:", error);
          setFeedback("Camera permission denied. Please allow camera access and reload.");
          return;
        }

        // Create Camera instance
        const camera = new Camera(video, {
          onFrame: async () => {
            // Only proceed if camera is ready and video dimensions are available
            if (video.videoWidth && video.videoHeight) {
              setCameraReady(true);
              
              const brightness = getAverageBrightness(video);
              if (brightness < BRIGHTNESS_THRESHOLD) {
                setLighting("Too Dark");
                setFeedback("Lighting is too dark. Please improve your lighting.");
                
                const ctx = canvas.getContext("2d");
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
              } else {
                setLighting("Good");
                if (poseRef.current) {
                  await poseRef.current.send({ image: video });
                }
              }
            }
          },
          width: 640,
          height: 480,
        });

        // Start camera with error handling
        console.log("Starting camera");
        camera.start()
          .then(() => {
            console.log("Camera started successfully");
            setFeedback("Camera started. Please stand back to ensure your full body is visible.");
            cameraRef.current = camera;
          })
          .catch((err: Error) => {
            console.error("Error starting camera:", err);
            setFeedback("Failed to start camera. Please check permissions and reload.");
          });
      } catch (error) {
        console.error("Camera setup error:", error);
        setFeedback("Camera setup failed. Please reload the page.");
      }
    };

    // Start the setup process
    setupPose();

    // Cleanup function
    return () => {
      console.log("Cleaning up camera and pose");
      if (cameraRef.current) {
        try {
          cameraRef.current.stop();
        } catch (error) {
          console.error("Error stopping camera:", error);
        }
      }
    };
  }, [exerciseName, currentSet, navigate, repsGoal, totalSets]);

  // Function to get exercise-specific metrics for display
  const getAdvancedMetrics = () => {
    if (!latestFeedback?.advanced_metrics) return null;
    
    const metrics = latestFeedback.advanced_metrics;
    const metricRows = Object.entries(metrics).map(([key, value]) => (
      <p key={key}><strong>{key.replace(/_/g, " ")}:</strong> {value.toFixed(1)}</p>
    ));
    
    return metricRows.length > 0 ? (
      <div className="stat-box metrics-box">
        <h3>Advanced Metrics</h3>
        {metricRows}
      </div>
    ) : null;
  };

  return (
    <div className="exercise-page">
      <header className="exercise-header">
        <h1 id="exercise-title">
          {exerciseName ? exerciseName.replace("_", " ").toUpperCase() : "Exercise"}
        </h1>
        <button 
          className="back-home" 
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>
      </header>
      
      <div className="video-container">
        {/* Video element with explicit attributes for camera access */}
        <video 
          ref={videoRef} 
          style={{ display: "none" }} 
          playsInline 
          autoPlay 
          muted
        />
        <canvas 
          ref={canvasRef} 
          width={640} 
          height={480} 
          className="output-canvas"
        />
        {!cameraReady && (
          <div className="camera-loading">
            <p>{feedback}</p>
          </div>
        )}
      </div>
      
      <div className="stats-container">
        <div className="stat-box">
          <h3>Rep Counter</h3>
          <p id="rep-count">{repCount}</p>
        </div>
        <div className="stat-box">
          <h3>Stage</h3>
          <p id="stage-status">{stage}</p>
        </div>
        <div className="stat-box">
          <h3>Feedback</h3>
          <p id="feedback">{feedback}</p>
        </div>
        <div className="stat-box">
          <h3>Lighting</h3>
          <p id="lighting-status">{lighting}</p>
        </div>
        <div className="stat-box">
          <h3>Visibility</h3>
          <p id="visibility-status">{visibilityStatus}</p>
        </div>
        <div className="stat-box">
          <h3>Movement</h3>
          <p id="movement-status">{movementStatus}</p>
        </div>
        <div className="stat-box">
          <h3>Set</h3>
          <p id="set-counter">{currentSet} / {totalSets}</p>
        </div>
        <div className="stat-box">
          <h3>Target Reps</h3>
          <p id="target-reps">{repCount} / {repsGoal}</p>
        </div>
        
        {latestFeedback?.rep_score && (
          <div className="stat-box">
            <h3>Form Score</h3>
            <p id="form-score">{latestFeedback.rep_score.toFixed(1)} - {latestFeedback.score_label}</p>
          </div>
        )}
        
        {getAdvancedMetrics()}
      </div>
    </div>
  );
};

// Add TypeScript interface for Window object to include MediaPipe's Pose
declare global {
  interface Window {
    Pose: any;
  }
}

export default Exercise;