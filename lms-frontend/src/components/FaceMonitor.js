import * as faceapi from "face-api.js";
import { useEffect } from "react";

export default function FaceMonitor(videoRef) {

  useEffect(() => {

    const loadModels = async () => {

      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");

      detectFaces();
    };

    const detectFaces = async () => {

      setInterval(async () => {

        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );

        if (detections.length > 1) {
          alert("Multiple faces detected!");
        }

      }, 3000);

    };

    loadModels();

  }, []);

}