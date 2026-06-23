// src/components/incident/SpeechToTextButton.jsx
// Mic button for a single textarea — records audio and transcribes it.
import React from "react";
import { IconButton, CircularProgress } from "@mui/joy";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import { useSttRecorder } from "../../hooks/useSttRecorder";

const SpeechToTextButton = ({ onTranscription }) => {
  const { recording, sttLoading, startRecording, stopRecording } = useSttRecorder(onTranscription);
  if (sttLoading) return <CircularProgress size="sm" />;
  return (
    <IconButton
      size="sm"
      variant={recording ? "solid" : "soft"}
      color={recording ? "danger" : "neutral"}
      onClick={recording ? stopRecording : startRecording}
      title={recording ? "Stop recording" : "Record speech"}
    >
      {recording ? <StopIcon /> : <MicIcon />}
    </IconButton>
  );
};

export default SpeechToTextButton;
