import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// Import from external libraries - with correct imports
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";
// Import POSE_CONNECTIONS from the correct location
import { POSE_CONNECTIONS } from "@mediapipe/pose";

// Joint mapping for pose detection
const jointMap = {
  nose: 0,
  left_shoulder: 11,
  right_shoulder: 12,
  left_elbow: 13,
  right_elbow: 14,
  left_wrist: 15,
  right_wrist: 16,
  left_hip: 23,
  right_hip: 24,
  left_knee: 25,
  right_knee: 26,
  left_ankle: 27,
  right_ankle: 28,
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
    affected_joints?: number[];
    affected_segments?: [string, string][];
  } | null>(null);

  const totalSets = 3;
  const repsGoal = 10;
  const BRIGHTNESS_THRESHOLD = 80;
  const setCompleteDialogShown = useRef(false);
  const cameraRef = useRef<any>(null);

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
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 2,
        });

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

        drawLandmarks(ctx, results.poseLandmarks, {
          color: "#FF0000",
          lineWidth: 1,
          fillColor: "#FFFFFF",
        });

        if (latestFeedback?.affected_joints) {
          latestFeedback.affected_joints.forEach((jointIndex) => {
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
          });
        }

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

  return (
    <div style={{ textAlign: "center" }}>
      <h2>{exerciseName ? exerciseName.replace("_", " ").toUpperCase() : "Exercise"}</h2>
      <video ref={videoRef} style={{ display: "none" }} playsInline></video>
      <canvas ref={canvasRef} width={640} height={480} style={{ border: "1px solid black" }} />
      <div style={{ marginTop: "1rem" }}>
        <p><strong>Lighting:</strong> {lighting}</p>
        <p><strong>Reps:</strong> {repCount} / {repsGoal}</p>
        <p><strong>Set:</strong> {currentSet} / {totalSets}</p>
        <p><strong>Stage:</strong> {stage}</p>
        <p><strong>Feedback:</strong> {feedback}</p>
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