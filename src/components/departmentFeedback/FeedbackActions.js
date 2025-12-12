// src/components/departmentFeedback/FeedbackActions.js
import React from "react";
import { Box, Button, CircularProgress } from "@mui/joy";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";

const FeedbackActions = ({ onSave, onSaveAndClose, onCancel, saving, canSave }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        justifyContent: "flex-end",
        pt: 3,
        borderTop: "1px solid #e0e0e0",
      }}
    >
      <Button
        variant="outlined"
        startDecorator={<CloseIcon />}
        onClick={onCancel}
        disabled={saving}
        sx={{
          borderColor: "#999",
          color: "#666",
        }}
      >
        إلغاء (Cancel)
      </Button>

      <Button
        startDecorator={saving ? <CircularProgress size="sm" /> : <SaveIcon />}
        onClick={onSave}
        disabled={!canSave || saving}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontWeight: 700,
        }}
      >
        {saving ? "جاري الحفظ..." : "حفظ (Save)"}
      </Button>

      <Button
        startDecorator={saving ? <CircularProgress size="sm" /> : <CheckCircleIcon />}
        onClick={onSaveAndClose}
        disabled={!canSave || saving}
        sx={{
          background: "linear-gradient(135deg, #2ed573 0%, #00b894 100%)",
          color: "white",
          fontWeight: 700,
        }}
      >
        {saving ? "جاري الحفظ..." : "حفظ وإغلاق (Save & Close)"}
      </Button>
    </Box>
  );
};

export default FeedbackActions;
