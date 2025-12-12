// src/components/reports/ReportActions.js
import React from "react";
import { Box, Button } from "@mui/joy";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import GetAppIcon from "@mui/icons-material/GetApp";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const ReportActions = ({ onRefresh, onResetFilters, onExportPDF, onExportCSV }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        justifyContent: "flex-end",
        p: 3,
        background: "#f9fafb",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
      }}
    >
      <Button
        startDecorator={<RestartAltIcon />}
        onClick={onResetFilters}
        variant="outlined"
        sx={{
          borderColor: "#667eea",
          color: "#667eea",
          fontWeight: 600,
        }}
      >
        إعادة تعيين (Reset)
      </Button>

      <Button
        startDecorator={<RefreshIcon />}
        onClick={onRefresh}
        variant="outlined"
        sx={{
          borderColor: "#2ed573",
          color: "#2ed573",
          fontWeight: 600,
        }}
      >
        تحديث (Refresh)
      </Button>

      <Button
        startDecorator={<FileDownloadIcon />}
        onClick={onExportPDF}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontWeight: 700,
        }}
      >
        تصدير PDF
      </Button>

      <Button
        startDecorator={<GetAppIcon />}
        onClick={onExportCSV}
        sx={{
          background: "linear-gradient(135deg, #2ed573 0%, #00b894 100%)",
          color: "white",
          fontWeight: 700,
        }}
      >
        تصدير CSV
      </Button>
    </Box>
  );
};

export default ReportActions;
