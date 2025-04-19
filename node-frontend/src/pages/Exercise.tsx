import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// Import MediaPipe scripts (make sure they're loaded in public/index.html or use CDN dynamically)
import { Pose } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks, POSE_CONNECTIONS } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";

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

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [repCount, setRepCount] = useState(0);
  const [stage, setStage] = useState("N/A");
  const [feedback, setFeedback] = useState("Waiting...");
  const [lighting, setLighting] = useState("Checking...");
  const [currentSet, setCurrentSet] = useState(1);
  const [latestFeedback, setLatestFeedback] = useState(null);

  const totalSets = 3;
  const repsGoal = 10;
  const BRIGHTNESS_THRESHOLD = 80;

  let setCompleteDialogShown = useRef(false);

  useEffect(() => {
    if (!exerciseName) {
      alert("No exercise specified!");
      navigate("/");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let camera;

    const getJointIndex = (jointName) => jointMap[jointName] ?? -1;

    const getAverageBrightness = (video) => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
      const { data } = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        const brightness = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        totalBrightness += brightness;
      }
      return totalBrightness / (data.length / 4);
    };

    const resetExerciseState = () => {
      fetch(`http://localhost:8000/reset/${exerciseName}`, { method: "POST" }).catch(console.error);
      setRepCount(0);
    };

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    pose.onResults(async (results) => {
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
            ctx.fillStyle = "#FF0000";
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 8, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
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
    });

    camera = new Camera(video, {
      onFrame: async () => {
        const brightness = getAverageBrightness(video);
        if (brightness < BRIGHTNESS_THRESHOLD) {
          setLighting("Too Dark");
          setFeedback("Lighting is too dark. Please improve your lighting.");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
          setLighting("Good");
          await pose.send({ image: video });
        }
      },
      width: 640,
      height: 480,
    });

    camera.start().catch((err) => {
      console.error("Camera error:", err);
      alert("Failed to start camera. Check permissions.");
    });

    return () => {
      if (camera) camera.stop();
    };
  }, [exerciseName, currentSet]);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>{exerciseName?.replace("_", " ").toUpperCase()}</h2>
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
