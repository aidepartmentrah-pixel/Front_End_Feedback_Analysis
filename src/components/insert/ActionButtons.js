// src/components/insert/ActionButtons.js
import React from "react";
import { Box, Button, Typography, LinearProgress } from "@mui/joy";
import SendIcon from "@mui/icons-material/Send";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

const ActionButtons = ({ onExtract, onAddRecord, loading, hasComplaintText, isFormValid = true }) => {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: "8px",
        background: "#2e7d32",
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button
        size="lg"
        variant="solid"
        color="neutral"
        startDecorator={<AutoFixHighIcon />}
        onClick={onExtract}
        disabled={!hasComplaintText || loading}
        loading={loading}
        sx={{
          flex: 1,
          minWidth: "150px",
          fontWeight: 700,
          "&:disabled": {
            opacity: 0.6,
          },
        }}
      >
        {loading ? "Processing..." : "🤖 Extract"}
      </Button>

      <Typography sx={{ color: "white", fontWeight: 600 }}>OR</Typography>

      <Button
        size="lg"
        variant="solid"
        color="success"
        startDecorator={<SendIcon />}
        onClick={onAddRecord}
        disabled={!hasComplaintText || loading || !isFormValid}
        loading={loading}
        sx={{
          flex: 1,
          minWidth: "150px",
          fontWeight: 700,
          "&:disabled": {
            opacity: 0.6,
          },
        }}
        title={!isFormValid ? "Please fill all required fields (*)" : ""}
      >
        {loading ? "Saving..." : "➕ Add Record"}
      </Button>

      {/* Progress Bar - Show when loading */}
      {loading && (
        <Box sx={{ width: "100%", mt: 2 }}>
          <LinearProgress 
            variant="plain" 
            sx={{ 
              height: 6,
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#4caf50"
              }
            }} 
          />
          <Typography 
            level="body-sm" 
            sx={{ 
              color: "white", 
              textAlign: "center", 
              mt: 1, 
              fontWeight: 600,
              opacity: 0.9
            }}
          >
            🤖 Processing with AI models... Please wait
          </Typography>
        </Box>
      )}

      <Box sx={{ width: "100%", mt: 1 }}>
        <Typography level="body-xs" sx={{ color: "rgba(255, 255, 255, 0.9)", textAlign: "center" }}>
          💡 <strong>Extract:</strong> Auto-populate NER & Classification fields using AI (optional)<br />
          <strong>Add Record:</strong> Submit the record to database with current field values
        </Typography>
      </Box>
    </Box>
  );
};

export default ActionButtons;
