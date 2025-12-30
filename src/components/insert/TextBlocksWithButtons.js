// src/components/insert/TextBlocksWithButtons.js
import React, { useState, useRef } from "react";
import { Box, Card, Typography, Textarea, Button, Grid, CircularProgress } from "@mui/joy";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import ClearIcon from "@mui/icons-material/Clear";
import { transcribeAudio } from "../../api/insertRecord";

const TextBlocksWithButtons = ({ complaintText, additionalNotes, optionalThirdText, onTextChange, onTranscriptionComplete }) => {
  const [recording, setRecording] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const textBlocks = [
    { field: "complaint_text", label: "📝 Complaint Text", placeholder: "Enter complaint details..." },
    { field: "immediate_action", label: "⚡ Immediate Action", placeholder: "Enter immediate action taken..." },
    { field: "taken_action", label: "🏥 الإجراءات المتخذة", placeholder: "أدخل الإجراءات المتخذة..." },
  ];

  const handleStartRecording = async (field) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleTranscribe(field, audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(field);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setRecording(null);
    }
  };

  const handleTranscribe = async (field, audioBlob) => {
    try {
      setIsTranscribing(true);
      
      // Convert blob to file
      const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });
      
      // Call STT API
      const response = await transcribeAudio(audioFile);
      const transcribedText = response.text || response.transcription || "";
      
      // Update the text field
      onTextChange(field, transcribedText);
      
      // If this is the complaint text, notify parent to trigger NER
      if (field === "complaint_text" && onTranscriptionComplete) {
        onTranscriptionComplete(transcribedText);
      }
      
    } catch (error) {
      console.error("Error transcribing audio:", error);
      alert("Failed to transcribe audio. Please try again or type manually.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleClear = (field) => {
    onTextChange(field, "");
  };

  const getFieldValue = (field) => {
    if (field === "complaint_text") return complaintText;
    if (field === "immediate_action") return additionalNotes;
    if (field === "taken_action") return optionalThirdText;
    return "";
  };

  return (
    <Card
      sx={{
        mb: 3,
        p: 3,
        background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
        border: "1px solid rgba(102, 126, 234, 0.1)",
        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.08)",
      }}
    >
      <Typography level="h3" sx={{ color: "#1a1e3f", fontWeight: 700, mb: 2 }}>
        Step 1: Raw Feedback Texts
      </Typography>

      {isTranscribing && (
        <Box sx={{ mb: 2, p: 2, borderRadius: "8px", background: "#e3f2fd", display: "flex", alignItems: "center", gap: 2 }}>
          <CircularProgress size="sm" />
          <Typography level="body-sm">Transcribing audio...</Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {textBlocks.map((block) => (
          <Grid xs={12} key={block.field}>
            <Box>
              <Typography level="body-sm" sx={{ fontWeight: 600, mb: 1, color: "#667eea" }}>
                {block.label}
              </Typography>
              <Textarea
                placeholder={block.placeholder}
                minRows={4}
                value={getFieldValue(block.field)}
                onChange={(e) => onTextChange(block.field, e.target.value)}
                sx={{
                  borderRadius: "8px",
                  "&:focus-within": {
                    borderColor: "#667eea",
                  },
                }}
                slotProps={{
                  textarea: {
                    dir: block.field === "taken_action" ? "rtl" : "ltr"
                  }
                }}
              />
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                {recording === block.field ? (
                  <Button
                    size="sm"
                    variant="solid"
                    color="danger"
                    startDecorator={<StopIcon />}
                    onClick={handleStopRecording}
                    sx={{ flex: 1 }}
                  >
                    ⏹️ Stop Recording
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outlined"
                    startDecorator={<MicIcon />}
                    onClick={() => handleStartRecording(block.field)}
                    disabled={recording !== null || isTranscribing}
                    sx={{ flex: 1 }}
                  >
                    🎤 Record
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outlined"
                  color="danger"
                  startDecorator={<ClearIcon />}
                  onClick={() => handleClear(block.field)}
                  sx={{ flex: 1 }}
                >
                  Clear
                </Button>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Typography
        level="body-xs"
        sx={{
          mt: 2,
          color: "#999",
          fontStyle: "italic",
        }}
      >
        💡 Tip: Click "Record" to capture audio input, which will be transcribed to text. Or manually type your complaint details.
      </Typography>
    </Card>
  );
};

export default TextBlocksWithButtons;
