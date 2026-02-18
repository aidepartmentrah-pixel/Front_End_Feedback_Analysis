// src/components/doctorHistory/DoctorReportActions.js
import React from "react";
import { Box, Button } from "@mui/joy";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const DoctorReportActions = ({ doctorName = "Unknown Doctor" }) => {
  const handleGeneratePDF = () => {
    const safeDoctorName = doctorName || "Unknown Doctor";
    alert(
      `📄 Generating All-Time PDF Report\n\n` +
      `Doctor: ${safeDoctorName}\n` +
      `Report will include:\n` +
      `• Doctor profile and statistics\n` +
      `• All incident details (all time)\n` +
      `• Charts and visualizations\n` +
      `• Category breakdown\n` +
      `• Timeline analysis\n\n` +
      `File: doctor_report_${safeDoctorName.replace(/\s+/g, '_')}.pdf`
    );
  };

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: "8px",
        background: "rgba(102, 126, 234, 0.05)",
        border: "1px solid rgba(102, 126, 234, 0.2)",
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      <Button
        size="lg"
        startDecorator={<FileDownloadIcon />}
        onClick={handleGeneratePDF}
        sx={{
          px: 4,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontWeight: 700,
        }}
      >
        📄 Generate All-Time PDF Report
      </Button>
    </Box>
  );
};

export default DoctorReportActions;
