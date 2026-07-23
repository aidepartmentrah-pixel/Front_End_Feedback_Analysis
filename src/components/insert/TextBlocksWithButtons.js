// src/components/insert/TextBlocksWithButtons.js
import React, { useState, useRef } from "react";
import { Box, Card, Typography, Textarea, Button, Grid, CircularProgress } from "@mui/joy";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import ClearIcon from "@mui/icons-material/Clear";
import { transcribeAudio } from "../../api/insertRecord";

const TextBlocksWithButtons = ({ complaintText, additionalNotes, optionalThirdText, onTextChange, onTranscriptionComplete, validationErrors = {} }) => {
  const [recording, setRecording] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const textBlocks = [
    { field: "complaint_text", label: "📝 Complaint Text", placeholder: "Enter complaint details...", required: true },
    { field: "immediate_action", label: "⚡ Immediate Action", placeholder: "Enter immediate action taken...", required: true },
    { field: "taken_action", label: "🏥 الإجراءات المتخذة", placeholder: "أدخل الإجراءات المتخذة...", required: true },
  ];

  // Browsers don't record raw WAV -- MediaRecorder always encodes to
  // whatever the browser actually supports (webm/opus on Chrome/Edge,
  // ogg/opus on Firefox). Recording without a mimeType and then labeling
  // the result "audio/wav" mislabels the real content, which can decode
  // inconsistently (or silently produce empty/garbage text) depending on
  // the browser/codec build -- pick a mimeType MediaRecorder actually
  // supports and carry that same type through to the uploaded file so the
  // label always matches the real bytes.
  const getSupportedMimeType = () => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
    ];
    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  };

  const handleStartRecording = async (field) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const actualType = mediaRecorder.mimeType || mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: actualType });
        await handleTranscribe(field, audioBlob, actualType);
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

  const handleTranscribe = async (field, audioBlob, mimeType) => {
    try {
      setIsTranscribing(true);

      // Name/type must match the blob's REAL encoding (see getSupportedMimeType
      // above) -- the backend's extension check (stt_router.py) only accepts
      // the file if the name's extension matches what's actually inside.
      const extension = (mimeType || audioBlob.type || "").includes("ogg") ? "ogg" : "webm";
      const audioFile = new File([audioBlob], `recording.${extension}`, { type: mimeType || audioBlob.type });

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
        background: "#c8e4e6",
        border: "1px solid rgba(31, 111, 115, 0.3)",
        boxShadow: "0 4px 12px rgba(31, 111, 115, 0.1)",
      }}
    >
      <Typography level="h3" sx={{ color: "#1F6F73", fontWeight: 700, mb: 2 }}>
        Feedback Texts
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
              <Typography level="body-sm" sx={{ fontWeight: 600, mb: 1, color: "#2BBCC4" }}>
                {block.label} {block.required && "*"}
              </Typography>
              <Textarea
                placeholder={block.placeholder}
                minRows={4}
                value={getFieldValue(block.field)}
                onChange={(e) => onTextChange(block.field, e.target.value)}
                sx={{
                  borderRadius: "8px",
                  borderColor: validationErrors[block.field] ? "#ff4757" : undefined,
                  "&:focus-within": {
                    borderColor: validationErrors[block.field] ? "#ff4757" : "#2BBCC4",
                  },
                }}
                slotProps={{
                  textarea: {
                    dir: block.field === "taken_action" ? "rtl" : "ltr"
                  }
                }}
              />
              {validationErrors[block.field] && (
                <Typography level="body-xs" sx={{ color: "#ff4757", mt: 0.5 }}>
                  {validationErrors[block.field]}
                </Typography>
              )}
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
                    variant="solid"
                    startDecorator={<MicIcon />}
                    onClick={() => handleStartRecording(block.field)}
                    disabled={recording !== null || isTranscribing}
                    sx={{ 
                      flex: 1,
                      backgroundColor: "#1F6F73",
                      "&:hover": { backgroundColor: "#164F53" },
                    }}
                  >
                    🎤 Record
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="solid"
                  startDecorator={<ClearIcon />}
                  onClick={() => handleClear(block.field)}
                  sx={{ 
                    flex: 1,
                    backgroundColor: "#78909c",
                    "&:hover": { backgroundColor: "#546e7a" },
                  }}
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
