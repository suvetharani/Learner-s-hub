import { useEffect } from "react";

export default function NoiseMonitor({ onViolation }) {

  useEffect(() => {

    let interval;

    const startNoise = async () => {

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioContext = new AudioContext();

      const mic = audioContext.createMediaStreamSource(stream);

      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 256;

      mic.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);

      interval = setInterval(() => {

        analyser.getByteTimeDomainData(data);

        let sum = 0;

        for (let i = 0; i < data.length; i++) {
          sum += Math.abs(data[i] - 128);
        }

        const volume = sum / data.length;

        if (volume > 15) {

          console.warn("⚠ Noise detected");

          onViolation("noise");

        }

      }, 2000);

    };

    startNoise();

    return () => clearInterval(interval);

  }, [onViolation]);

  return null;

}