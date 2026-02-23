// src/components/edit/EditActionButtons.js
import React from "react";
import { Box, Button, Typography } from "@mui/joy";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const EditActionButtons = ({ onUpdate, onCancel, onReset, loading, hasChanges, isFormValid = true }) => {
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
        color="success"
        startDecorator={<SaveIcon />}
        onClick={onUpdate}
        disabled={!hasChanges || loading || !isFormValid}
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
        {loading ? "Saving..." : "💾 Update"}
      </Button>

      <Button
        size="lg"
        variant="solid"
        startDecorator={<RestartAltIcon />}
        onClick={onReset}
        disabled={!hasChanges || loading}
        sx={{
          flex: 1,
          minWidth: "150px",
          fontWeight: 700,
          backgroundColor: "#78909c",
          color: "white",
          "&:hover": {
            backgroundColor: "#546e7a",
          },
          "&:disabled": {
            opacity: 0.6,
          },
        }}
      >
        🔄 Reset
      </Button>

      <Button
        size="lg"
        variant="solid"
        startDecorator={<CancelIcon />}
        onClick={onCancel}
        disabled={loading}
        sx={{
          flex: 1,
          minWidth: "150px",
          fontWeight: 700,
          backgroundColor: "#546e7a",
          color: "white",
          "&:hover": {
            backgroundColor: "#455a64",
          },
          "&:disabled": {
            opacity: 0.6,
          },
        }}
      >
        ✕ Cancel
      </Button>

      <Box sx={{ width: "100%", mt: 1 }}>
        <Typography level="body-xs" sx={{ color: "rgba(255, 255, 255, 0.9)", textAlign: "center" }}>
          {!isFormValid ? (
            <>
              ⚠️ <strong>Form is incomplete</strong> | Please fill all required fields marked with * before saving
            </>
          ) : hasChanges ? (
            <>
              ⚠️ <strong>You have unsaved changes</strong> | Click <strong>Update</strong> to save or <strong>Reset</strong> to discard
            </>
          ) : (
            <>
              ℹ️ No unsaved changes. Edit fields above to make changes.
            </>
          )}
        </Typography>
      </Box>
    </Box>
  );
};
export default EditActionButtons;
