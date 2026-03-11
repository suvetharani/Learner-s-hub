import { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";

export default function FaceMonitor({ videoRef, onViolation }) {

  const lookAwayTimestampsRef = useRef([]);
  const lookDownTimestampsRef = useRef([]);
  const lastViolationAtByTypeRef = useRef({});
  const hasLandmarksRef = useRef(false);

  useEffect(() => {

    let interval;

    const startDetection = async () => {

      const baseUri = `${process.env.PUBLIC_URL || ""}/models`;

      // Load tiny face detector (required)
      try {
        if (!faceapi.nets.tinyFaceDetector.isLoaded) {
          await faceapi.nets.tinyFaceDetector.loadFromUri(baseUri);
        }
      } catch (e) {
        console.error("Failed to load tinyFaceDetector model from /models", e);
        return;
      }

      // Try to load landmarks for true head-pose (optional)
      try {
        if (!faceapi.nets.faceLandmark68TinyNet.isLoaded) {
          await faceapi.nets.faceLandmark68TinyNet.loadFromUri(baseUri);
        }
        hasLandmarksRef.current = true;
      } catch (e) {
        console.warn(
          "faceLandmark68Tiny model not found in /models. Falling back to bounding-box based head pose."
        );
        hasLandmarksRef.current = false;
      }

      interval = setInterval(async () => {

        if (!videoRef.current || videoRef.current.readyState !== 4) return;

        let detections;
        if (hasLandmarksRef.current) {
          detections = await faceapi
            .detectAllFaces(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks(true);
        } else {
          detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          );
        }

        const now = Date.now();

        const recordViolation = (type) => {
          const last = lastViolationAtByTypeRef.current[type] || 0;
          if (now - last < 8000) return; // debounce per type
          lastViolationAtByTypeRef.current[type] = now;
          onViolation(type);
        };

        if (detections.length === 0) {

          console.warn("⚠ Face not detected");

          recordViolation("no-face");

        }

        if (detections.length > 1) {
          console.warn("⚠ Multiple faces detected");
          recordViolation("multiple-faces");
          const { landmarks, detection } = best;
          const box = detection?.box;
        }

        if (detections.length >= 1) {
          const best = detections[0];

          let isLookingLeftOrRight = false;
          let isLookingDown = false;

          if (hasLandmarksRef.current && best.landmarks && best.detection) {
            // True head-pose using landmarks
            const { landmarks, detection } = best;
            const box = detection.box;

            const leftEye = landmarks.getLeftEye?.();
            const rightEye = landmarks.getRightEye?.();
            const nose = landmarks.getNose?.();

            if (leftEye?.length && rightEye?.length && nose?.length && box) {
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
                (noseCenter.x - leftEyeCenter.x) / eyeLineWidth; // ~0.5 when centered

              const eyeCenterY =
                (leftEyeCenter.y + rightEyeCenter.y) / 2;
              const pitchRatio =
                (noseCenter.y - eyeCenterY) / Math.max(1, box.height);

              isLookingLeftOrRight = yawRatio < 0.35 || yawRatio > 0.65;
              isLookingDown = pitchRatio > 0.28;
            }
          } else if (best.detection && videoRef.current) {
            // Fallback: use bounding box vs frame center
            const box = best.detection.box;
            const video = videoRef.current;
            if (video.videoWidth && video.videoHeight) {
              const faceCx = box.x + box.width / 2;
              const faceCy = box.y + box.height / 2;
              const frameCx = video.videoWidth / 2;
              const frameCy = video.videoHeight / 2;

              const dx =
                Math.abs(faceCx - frameCx) / Math.max(1, video.videoWidth);
              const dy =
                (faceCy - frameCy) / Math.max(1, video.videoHeight);

              isLookingLeftOrRight = dx > 0.22;
              isLookingDown = dy > 0.18;
            }
          }

          if (isLookingLeftOrRight || isLookingDown) {

            if (isLookingLeftOrRight) {
              lookAwayTimestampsRef.current.push(now);
            }
            lookAwayTimestampsRef.current = lookAwayTimestampsRef.current.filter((t) => now - t < 20000);
            // "looks down (phone usage)" => repeated down looks
            if (lookAwayTimestampsRef.current.length >= 4) {
              lookAwayTimestampsRef.current = [];
              console.warn("⚠ Frequent looking away detected");
              recordViolation("look-away");
            }

            if (isLookingDown) {
              lookDownTimestampsRef.current.push(now);
            }
            lookDownTimestampsRef.current = lookDownTimestampsRef.current.filter((t) => now - t < 20000);
            if (lookDownTimestampsRef.current.length >= 3) {
              lookDownTimestampsRef.current = [];
              console.warn("⚠ Frequent looking down detected");
              recordViolation("look-down");
            }
          }
        }

      }, 2000);

    };

    startDetection();

    return () => clearInterval(interval);

  }, [videoRef, onViolation]);

  return null;
}