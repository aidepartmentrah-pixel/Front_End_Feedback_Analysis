// src/components/reports/ReportActions.js
import React from "react";
import { Box, Button, CircularProgress } from "@mui/joy";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import DescriptionIcon from "@mui/icons-material/Description";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const ReportActions = ({ 
  onGenerate, 
  onExportPDF, 
  onExportCSV, 
  onExportWord, 
  disableGenerate = false,
  disableExport = false,
  loading = false 
}) => {
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
      {/* Generate Report Button */}
      {onGenerate && (
        <Button
          startDecorator={loading ? <CircularProgress size="sm" /> : <PlayArrowIcon />}
          onClick={onGenerate}
          disabled={disableGenerate || loading}
          sx={{
            background: (disableGenerate || loading)
              ? "#cccccc"
              : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white",
            fontWeight: 700,
            opacity: (disableGenerate || loading) ? 0.6 : 1,
            cursor: (disableGenerate || loading) ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "جارِ التوليد..." : "توليد التقرير (Generate)"}
        </Button>
      )}

      <Button
        startDecorator={<TableChartIcon />}
        onClick={onExportCSV}
        disabled={disableExport}
        sx={{
          background: disableExport 
            ? "#cccccc" 
            : "linear-gradient(135deg, #2ed573 0%, #00b894 100%)",
          color: "white",
          fontWeight: 700,
          opacity: disableExport ? 0.6 : 1,
          cursor: disableExport ? "not-allowed" : "pointer",
        }}
      >
        تصدير Excel
      </Button>

      <Button
        startDecorator={<PictureAsPdfIcon />}
        onClick={onExportPDF}
        disabled={disableExport}
        sx={{
          background: disableExport 
            ? "#cccccc" 
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontWeight: 700,
          opacity: disableExport ? 0.6 : 1,
          cursor: disableExport ? "not-allowed" : "pointer",
        }}
      >
        تصدير PDF
      </Button>

      <Button
        startDecorator={<DescriptionIcon />}
        onClick={onExportWord}
        disabled={disableExport}
        sx={{
          background: disableExport 
            ? "#cccccc" 
            : "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
          color: "white",
          fontWeight: 700,
          opacity: disableExport ? 0.6 : 1,
          cursor: disableExport ? "not-allowed" : "pointer",
        }}
      >
        تصدير Word
      </Button>
    </Box>
  );
};

export default ReportActions;
