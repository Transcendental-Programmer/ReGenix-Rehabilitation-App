document.addEventListener("DOMContentLoaded", function() {
  // Get exercise name from URL
  const urlParams = new URLSearchParams(window.location.search);
  const exerciseName = urlParams.get('exercise');
  
  if (!exerciseName) {
    alert("No exercise specified!");
    window.location.href = "index.html";
    return;
  }

  // Update page title
  document.getElementById("exercise-title").textContent = 
    exerciseName.replace("_", " ").toUpperCase();

  // Setup variables
  const videoElement = document.getElementById('input-video');
  const canvasElement = document.getElementById('output-canvas');
  const canvasCtx = canvasElement.getContext('2d');
  
  const repCountElement = document.getElementById('rep-count');
  const stageStatusElement = document.getElementById('stage-status');
  const feedbackElement = document.getElementById('feedback');
  const lightingStatusElement = document.getElementById('lighting-status');
  const setCounterElement = document.getElementById('set-counter');
  const targetRepsElement = document.getElementById('target-reps');
  
  // Exercise parameters
  const totalSets = 3;
  const repsGoal = 10;
  let currentSet = 1;
  let currentReps = 0;

  // Fine-tuning parameters
  const BRIGHTNESS_THRESHOLD = 80;
  const CONTROLLED_MOVEMENT_THRESHOLD = 0.03;
  const VISIBILITY_THRESHOLD = 0.5;
  const REQUIRED_VISIBLE_RATIO = 0.75;

  // Previous landmarks for movement tracking
  let prevLandmarks = null;

  // Helper: compute average brightness
  function getAverageBrightness(video) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth || video.width;
    tempCanvas.height = video.videoHeight || video.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    let totalBrightness = 0;
    const count = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      const brightness = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      totalBrightness += brightness;
    }
    return totalBrightness / count;
  }

  // Setup MediaPipe Pose
  const pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
  });

  pose.onResults((results) => {
    // Draw video frame
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    // Draw pose skeleton if landmarks detected
    if (results.poseLandmarks) {
      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
      drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 1 });
      canvasCtx.restore();

      // Check landmark visibility
      const totalLandmarks = results.poseLandmarks.length;
      const visibleCount = results.poseLandmarks.filter(lm => lm.visibility >= VISIBILITY_THRESHOLD).length;
      
      if (visibleCount / totalLandmarks < REQUIRED_VISIBLE_RATIO) {
        feedbackElement.textContent = "Pose unstable: Not enough landmarks visible. Adjust your position.";
        return;
      }
      
      // Ensure controlled movement
      if (prevLandmarks) {
        const fastMovement = results.poseLandmarks.some((lm, index) => {
          const prevLm = prevLandmarks[index];
          if (!prevLm) return false;
          const dx = lm.x - prevLm.x;
          const dy = lm.y - prevLm.y;
          const displacement = Math.sqrt(dx * dx + dy * dy);
          return displacement > CONTROLLED_MOVEMENT_THRESHOLD;
        });
        
        if (fastMovement) {
          feedbackElement.textContent = "Movement too fast. Please move slowly and controlled.";
          prevLandmarks = results.poseLandmarks;
          return; // Skip sending data to backend
        }
      }
      
      // Update previous landmarks
      prevLandmarks = [...results.poseLandmarks];

      // Send landmark data to backend
      fetch(`http://localhost:8000/landmarks/${exerciseName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landmarks: results.poseLandmarks })
      })
        .then(res => res.json())
        .then(data => {
          // Update UI with exercise data
          repCountElement.textContent = data.counter || data.repCount || 0;
          stageStatusElement.textContent = data.repState || data.stage || "N/A";
          feedbackElement.textContent = data.feedback || "N/A";
          
          // Update current reps count
          currentReps = data.counter || data.repCount || 0;
          targetRepsElement.textContent = `${currentReps} / ${repsGoal}`;
          
          // Check if set is complete
          if (currentReps >= repsGoal) {
            if (currentSet < totalSets) {
              currentSet++;
              setCounterElement.textContent = `${currentSet} / ${totalSets}`;
              alert(`Set ${currentSet - 1} completed! Starting set ${currentSet}`);
            } else {
              alert("Workout completed! Great job!");
              window.location.href = "index.html";
            }
          }
        })
        .catch(err => {
          console.error('Error communicating with backend:', err);
          feedbackElement.textContent = "Connection error. Check backend server.";
        });
    }
  });

  // Setup camera
  const camera = new Camera(videoElement, {
    onFrame: async () => {
      // Check lighting conditions
      const brightness = getAverageBrightness(videoElement);
      if (brightness < BRIGHTNESS_THRESHOLD) {
        lightingStatusElement.textContent = "Too Dark";
        feedbackElement.textContent = "Lighting is too dark. Please improve your lighting.";
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        return;
      } else {
        lightingStatusElement.textContent = "Good";
        await pose.send({ image: videoElement });
      }
    },
    width: 640,
    height: 480
  });

  // Start the camera
  camera.start()
    .then(() => {
      console.log("Camera started successfully");
    })
    .catch(err => {
      console.error("Error starting camera:", err);
      alert("Failed to start camera. Please check your camera permissions and reload.");
    });
});
