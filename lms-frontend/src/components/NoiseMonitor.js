import { useEffect } from "react";

export default function NoiseMonitor({ onViolation }) {
  useEffect(() => {
    let interval;
    let audioContext;
    let stream;
    const lastViolationAtRef = { current: 0 };

    const startNoise = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        console.warn("Microphone permission denied/unavailable", e);
        return;
      }

      audioContext = new (window.AudioContext || window.webkitAudioContext)();

      const tryResume = async () => {
        try {
          if (audioContext && audioContext.state === "suspended") {
            await audioContext.resume();
          }
        } catch {}
      };

      // Autoplay policies can suspend AudioContext until a user gesture
      await tryResume();
      const onFirstGesture = () => {
        tryResume();
        window.removeEventListener("click", onFirstGesture, true);
        window.removeEventListener("touchstart", onFirstGesture, true);
        window.removeEventListener("keydown", onFirstGesture, true);
      };
      window.addEventListener("click", onFirstGesture, true);
      window.addEventListener("touchstart", onFirstGesture, true);
      window.addEventListener("keydown", onFirstGesture, true);

      const mic = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      mic.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);

      interval = setInterval(() => {
        analyser.getByteTimeDomainData(data);

        // RMS volume (sensitive to slight noise)
        let sumSq = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sumSq += v * v;
        }
        const rms = Math.sqrt(sumSq / data.length);

        if (rms > 0.035) {
          const now = Date.now();
          if (now - lastViolationAtRef.current < 2500) return;
          lastViolationAtRef.current = now;
          onViolation("noise");
        }
      }, 400);
    };

    startNoise();

    return () => {
      if (interval) clearInterval(interval);
      try {
        if (stream) stream.getTracks().forEach((t) => t.stop());
      } catch {}
      try {
        if (audioContext && audioContext.state !== "closed") audioContext.close();
      } catch {}
    };
  }, [onViolation]);

  return null;
}