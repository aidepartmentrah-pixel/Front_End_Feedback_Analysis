// src/components/patientHistory/PatientActions.js
import React from "react";
import { Box, Button, Typography, Dropdown, MenuButton, Menu, MenuItem } from "@mui/joy";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const PatientActions = ({ patient, onRefresh, onExport }) => {
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

      {/* Export Dropdown */}
      <Dropdown>
        <MenuButton
          startDecorator={<DownloadIcon />}
          sx={{
            background: "linear-gradient(135deg, #2ed573 0%, #28c463 100%)",
            color: "white",
            fontWeight: 700,
            "&:hover": {
              background: "linear-gradient(135deg, #28c463 0%, #1faa53 100%)",
            },
          }}
        >
          Export History
        </MenuButton>
        <Menu>
          <MenuItem onClick={() => onExport("csv")}>📄 Export as CSV</MenuItem>
          <MenuItem onClick={() => onExport("json")}>
            📊 Export as JSON
          </MenuItem>
        </Menu>
      </Dropdown>

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
            {patient.name} ({patient.id})
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PatientActions;
