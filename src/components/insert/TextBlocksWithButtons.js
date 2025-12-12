// src/components/insert/TextBlocksWithButtons.js
import React, { useState } from "react";
import { Box, Card, Typography, Textarea, Button, Grid } from "@mui/joy";
import MicIcon from "@mui/icons-material/Mic";
import ClearIcon from "@mui/icons-material/Clear";

const TextBlocksWithButtons = ({ complaintText, additionalNotes, optionalThirdText, onTextChange }) => {
  const [recording, setRecording] = useState(null);

  const textBlocks = [
    { field: "complaint_text", label: "📝 Complaint Text", placeholder: "Enter complaint details..." },
    { field: "immediate_action", label: "⚡ Immediate Action", placeholder: "Enter immediate action taken..." },
    { field: "taken_action", label: "🏥 الإجراءات المتخذة", placeholder: "أدخل الإجراءات المتخذة..." },
  ];

  const handleRecord = (field) => {
    // Placeholder for actual audio recording
    setRecording(field);
    setTimeout(() => {
      setRecording(null);
      // In production: trigger audio recording and transcription API
    }, 2000);
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
                <Button
                  size="sm"
                  variant="outlined"
                  startDecorator={<MicIcon />}
                  onClick={() => handleRecord(block.field)}
                  disabled={recording === block.field}
                  sx={{ flex: 1 }}
                >
                  {recording === block.field ? "Recording..." : "🎤 Record"}
                </Button>
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
