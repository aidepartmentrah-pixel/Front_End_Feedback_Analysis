// src/components/insert/ActionButtons.js
import React from "react";
import { Box, Button, Typography } from "@mui/joy";
import SendIcon from "@mui/icons-material/Send";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

const ActionButtons = ({ onExtract, onAddRecord, loading, hasComplaintText }) => {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: "8px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
        {loading ? "Saving..." : "➕ Add Record"}
      </Button>

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
