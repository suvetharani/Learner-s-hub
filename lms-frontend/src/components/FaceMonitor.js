import { useEffect } from "react";
import * as faceapi from "face-api.js";

export default function FaceMonitor({ videoRef, onViolation }) {

  useEffect(() => {

    let interval;

    const startDetection = async () => {

      // Load model once
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");

      interval = setInterval(async () => {

        if (!videoRef.current || videoRef.current.readyState !== 4) return;

        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );

        if (detections.length === 0) {

          console.warn("⚠ Face not detected");

          onViolation("no-face");

        }

      }, 2000);

    };

    startDetection();

    return () => clearInterval(interval);

  }, [videoRef, onViolation]);

  return null;
}