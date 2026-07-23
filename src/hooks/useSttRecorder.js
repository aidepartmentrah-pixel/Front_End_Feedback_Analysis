// src/hooks/useSttRecorder.js
// Microphone recording + speech-to-text transcription hook.
import { useState, useRef } from "react";
import { transcribeAudio } from "../api/insertRecord";

export function useSttRecorder(onTranscription) {
  const [recording, setRecording] = useState(false);
  const [sttLoading, setSttLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  async function startRecording() {
    // Browser blocks microphone on non-HTTPS pages
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      alert("Microphone requires a secure connection.\n\nPlease open the app using:\nhttps://" + window.location.hostname + "\n\nIf you see a certificate warning, click Advanced → Proceed.");
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support microphone access on this connection.\nPlease use https://" + window.location.hostname);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      // Record with whatever mimeType the browser actually supports, and
      // carry that same type through to the blob/file -- MediaRecorder's
      // default output isn't always webm/opus (e.g. Firefox uses ogg/opus),
      // and labeling the wrong bytes as "audio/webm" can decode
      // inconsistently depending on browser/codec build.
      const mimeCandidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"];
      const mimeType = mimeCandidates.find((t) => MediaRecorder.isTypeSupported(t)) || "";
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const actualType = mr.mimeType || mimeType || "audio/webm";
        const extension = actualType.includes("ogg") ? "ogg" : "webm";
        const blob = new Blob(chunksRef.current, { type: actualType });
        const file = new File([blob], `recording.${extension}`, { type: actualType });
        try {
          setSttLoading(true);
          const resp = await transcribeAudio(file);
          if (resp?.text || resp?.transcription) {
            onTranscription(resp.text || resp.transcription);
          } else {
            console.warn("[STT] Transcription response had no text:", resp);
            alert("Transcription completed but returned no text. Please try again or type manually.");
          }
        } catch (err) {
          console.error("[STT] Transcription failed:", err);
          const status = err.response?.status;
          if (status) {
            alert(`Transcription failed (server returned ${status}). Please try again or type manually.`);
          } else {
            alert("Transcription failed — check your connection and try again, or type manually.");
          }
        } finally {
          setSttLoading(false);
        }
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch (err) {
      if (err.name === "NotAllowedError") {
        alert("Microphone access was denied.\nPlease allow microphone access in your browser and try again.");
      } else {
        alert("Could not start microphone: " + err.message);
      }
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }

  return { recording, sttLoading, startRecording, stopRecording };
}
