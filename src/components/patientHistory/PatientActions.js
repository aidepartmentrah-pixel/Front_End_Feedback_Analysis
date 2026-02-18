// src/components/patientHistory/PatientActions.js
// Phase R-P — Normalized field names: full_name, patient_id
import React from "react";
import { Box, Button, Typography } from "@mui/joy";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const PatientActions = ({ patient, onRefresh }) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        p: 2,
        borderRadius: "8px",
        background: "linear-gradient(135deg, #f5f7ff 0%, #fff 100%)",
        border: "2px solid rgba(102, 126, 234, 0.2)",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {/* Back Button */}
      <Button
        startDecorator={<ArrowBackIcon />}
        variant="outlined"
        onClick={() => navigate("/table-view")}
        sx={{
          borderColor: "#667eea",
          color: "#667eea",
          fontWeight: 700,
          "&:hover": {
            background: "rgba(102, 126, 234, 0.1)",
          },
        }}
      >
        Back to Table
      </Button>

      {/* Refresh Button */}
      <Button
        startDecorator={<RefreshIcon />}
        variant="outlined"
        onClick={onRefresh}
        sx={{
          borderColor: "#667eea",
          color: "#667eea",
          fontWeight: 700,
          "&:hover": {
            background: "rgba(102, 126, 234, 0.1)",
          },
        }}
      >
        Refresh
      </Button>

      {/* Patient Info Summary */}
      <Box
        sx={{
          ml: "auto",
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 2,
          py: 1,
          borderRadius: "6px",
          background: "rgba(102, 126, 234, 0.1)",
        }}
      >
        <Box>
          <Typography level="body-xs" sx={{ color: "#666" }}>
            Viewing history for:
          </Typography>
          <Typography level="body-sm" sx={{ fontWeight: 700, color: "#667eea" }}>
            {patient.full_name} ({patient.patient_id})
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PatientActions;
