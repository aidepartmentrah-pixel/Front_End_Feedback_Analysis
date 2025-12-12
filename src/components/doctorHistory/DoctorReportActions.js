// src/components/doctorHistory/DoctorReportActions.js
import React from "react";
import { Box, Button } from "@mui/joy";
import DownloadIcon from "@mui/icons-material/Download";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

const DoctorReportActions = ({ doctorName }) => {
  const handleGeneratePDF = () => {
    alert(
      `📄 Generating PDF Report\n\n` +
      `Doctor: ${doctorName}\n` +
      `Report will include:\n` +
      `• Doctor profile and statistics\n` +
      `• All incident details\n` +
      `• Charts and visualizations\n` +
      `• Category breakdown\n` +
      `• Timeline analysis\n\n` +
      `File: doctor_report_${doctorName.replace(/\s+/g, '_')}.pdf`
    );
  };

  const handleExportData = () => {
    alert(
      `📊 Exporting Data\n\n` +
      `Doctor: ${doctorName}\n` +
      `Format: CSV/Excel\n` +
      `Data includes all incident records`
    );
  };

  const handleSetAlert = () => {
    alert(
      `🔔 Set Alert\n\n` +
      `Doctor: ${doctorName}\n` +
      `You will be notified when:\n` +
      `• New incident is assigned to this doctor\n` +
      `• Red flag threshold is reached\n` +
      `• Pattern changes detected`
    );
  };

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: "8px",
        background: "#f9fafb",
        border: "1px solid #e0e0e0",
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
        📄 Generate PDF Report
      </Button>

      <Button
        size="lg"
        variant="outlined"
        startDecorator={<DownloadIcon />}
        onClick={handleExportData}
        sx={{
          px: 4,
          borderColor: "#2ed573",
          color: "#2ed573",
          fontWeight: 700,
          "&:hover": {
            background: "rgba(46, 213, 115, 0.1)",
          },
        }}
      >
        📊 Export Data
      </Button>

      <Button
        size="lg"
        variant="outlined"
        startDecorator={<NotificationsActiveIcon />}
        onClick={handleSetAlert}
        sx={{
          px: 4,
          borderColor: "#ffa502",
          color: "#ffa502",
          fontWeight: 700,
          "&:hover": {
            background: "rgba(255, 165, 2, 0.1)",
          },
        }}
      >
        🔔 Set Alert
      </Button>
    </Box>
  );
};

export default DoctorReportActions;
