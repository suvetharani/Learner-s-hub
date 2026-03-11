import { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";

// Features implemented:
// 1) Multiple face detection
// 2) Eye movement (left/right – frequent yaw changes)
// 3) Looking down (phone use)
// 4) Face not centered
// 5) Face disappearing frequently
// 6) Talking detection (mouth movement)
// 7) Face bounding box visualization

export default function FaceMonitor({ videoRef, overlayRef, onViolation }) {
  const lastViolationAtByTypeRef = useRef({});
  const lookAwayTimestampsRef = useRef([]);
  const lookDownTimestampsRef = useRef([]);
  const eyeMoveTimestampsRef = useRef([]);
  const noFaceTimestampsRef = useRef([]);
  const mouthMoveTimestampsRef = useRef([]);

  useEffect(() => {
    let interval;

    const startDetection = async () => {
      const baseUri = `${process.env.PUBLIC_URL || ""}/models`;

      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.isLoaded
            ? Promise.resolve()
            : faceapi.nets.ssdMobilenetv1.loadFromUri(baseUri),
          faceapi.nets.faceLandmark68Net.isLoaded
            ? Promise.resolve()
            : faceapi.nets.faceLandmark68Net.loadFromUri(baseUri),
        ]);
      } catch (e) {
        console.error("Failed to load face-api models from /models", e);
        return;
      }

      interval = setInterval(async () => {
        const video = videoRef.current;
        if (!video || video.readyState !== 4) return;

        const now = Date.now();

        const recordViolation = (type) => {
          const last = lastViolationAtByTypeRef.current[type] || 0;
          if (now - last < 6000) return; // debounce per type
          lastViolationAtByTypeRef.current[type] = now;
          onViolation(type);
        };

        const results = await faceapi
          .detectAllFaces(
            video,
            new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
          )
          .withFaceLandmarks();

        // Draw bounding boxes
        const canvas = overlayRef?.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          const vw = video.videoWidth || video.clientWidth;
          const vh = video.videoHeight || video.clientHeight;
          if (vw && vh) {
            if (canvas.width !== vw) canvas.width = vw;
            if (canvas.height !== vh) canvas.height = vh;
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          results.forEach((res) => {
            const box = res.detection.box;
            ctx.strokeStyle = "#00ff7f";
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.font = "12px sans-serif";
            ctx.fillText("Face detected", box.x + 4, box.y + 14);
          });
        }

        // --- Feature 5: face disappearing frequently ---
        if (results.length === 0) {
          noFaceTimestampsRef.current.push(now);
          noFaceTimestampsRef.current = noFaceTimestampsRef.current.filter(
            (t) => now - t < 15000
          );

          if (noFaceTimestampsRef.current.length >= 3) {
            noFaceTimestampsRef.current = [];
            recordViolation("no-face-frequent");
          } else {
            recordViolation("no-face");
          }
          return;
        }

        // --- Feature 1: multiple faces ---
        if (results.length > 1) {
          recordViolation("multiple-faces");
        }

        // Analyse the primary face (closest / highest score)
        const best = results[0];
        const { detection, landmarks } = best;
        const box = detection.box;

        const vw = video.videoWidth || video.clientWidth;
        const vh = video.videoHeight || video.clientHeight;

        // --- Feature 4: face not centered ---
        if (vw && vh) {
          const faceCx = box.x + box.width / 2;
          const faceCy = box.y + box.height / 2;
          const frameCx = vw / 2;
          const frameCy = vh / 2;

          const dx = Math.abs(faceCx - frameCx) / Math.max(1, vw);
          const dy = Math.abs(faceCy - frameCy) / Math.max(1, vh);

          if (dx > 0.25 || dy > 0.25) {
            recordViolation("face-off-center");
          }
        }

        // Landmark-based features
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        const nose = landmarks.getNose();
        const mouth = landmarks.getMouth();

        if (leftEye.length && rightEye.length && nose.length) {
          const leftEyeCenter = leftEye.reduce(
            (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
            { x: 0, y: 0 }
          );
          leftEyeCenter.x /= leftEye.length;
          leftEyeCenter.y /= leftEye.length;

          const rightEyeCenter = rightEye.reduce(
            (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
            { x: 0, y: 0 }
          );
          rightEyeCenter.x /= rightEye.length;
          rightEyeCenter.y /= rightEye.length;

          const noseCenter = nose.reduce(
            (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
            { x: 0, y: 0 }
          );
          noseCenter.x /= nose.length;
          noseCenter.y /= nose.length;

          const eyeLineWidth = Math.max(
            1,
            rightEyeCenter.x - leftEyeCenter.x
          );
          const yawRatio =
            (noseCenter.x - leftEyeCenter.x) / eyeLineWidth; // ~0.5 centered

          const eyeCenterY =
            (leftEyeCenter.y + rightEyeCenter.y) / 2;
          const pitchRatio =
            (noseCenter.y - eyeCenterY) / Math.max(1, box.height);

          const isLookingLeftOrRight = yawRatio < 0.35 || yawRatio > 0.65;
          const isLookingDown = pitchRatio > 0.3;

          // --- Feature 2: eye movement (frequent yaw changes) ---
          if (Math.abs(yawRatio - 0.5) > 0.12) {
            eyeMoveTimestampsRef.current.push(now);
          }
          eyeMoveTimestampsRef.current =
            eyeMoveTimestampsRef.current.filter((t) => now - t < 20000);
          if (eyeMoveTimestampsRef.current.length >= 6) {
            eyeMoveTimestampsRef.current = [];
            recordViolation("eye-movement");
          }

          // --- Feature 3: looking down (phone use) ---
          if (isLookingLeftOrRight) {
            lookAwayTimestampsRef.current.push(now);
          }
          lookAwayTimestampsRef.current =
            lookAwayTimestampsRef.current.filter((t) => now - t < 20000);
          if (lookAwayTimestampsRef.current.length >= 4) {
            lookAwayTimestampsRef.current = [];
            recordViolation("look-away");
          }

          if (isLookingDown) {
            lookDownTimestampsRef.current.push(now);
          }
          lookDownTimestampsRef.current =
            lookDownTimestampsRef.current.filter((t) => now - t < 20000);
          if (lookDownTimestampsRef.current.length >= 3) {
            lookDownTimestampsRef.current = [];
            recordViolation("look-down");
          }
        }

        // --- Feature 6: talking (mouth movement) ---
        if (mouth.length) {
          // Approximate mouth openness: distance between top and bottom lip
          const topLip = mouth.slice(13, 16); // approximate upper inner lip
          const bottomLip = mouth.slice(17, 20); // approximate lower inner lip

          const topY =
            topLip.reduce((acc, p) => acc + p.y, 0) / topLip.length;
          const bottomY =
            bottomLip.reduce((acc, p) => acc + p.y, 0) / bottomLip.length;

          const mouthOpen = (bottomY - topY) / Math.max(1, box.height);

          if (mouthOpen > 0.09) {
            mouthMoveTimestampsRef.current.push(now);
          }
          mouthMoveTimestampsRef.current =
            mouthMoveTimestampsRef.current.filter((t) => now - t < 15000);
          if (mouthMoveTimestampsRef.current.length >= 6) {
            mouthMoveTimestampsRef.current = [];
            recordViolation("talking");
          }
        }
      }, 800);
    };

    startDetection();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [videoRef, overlayRef, onViolation]);

  return null;
}