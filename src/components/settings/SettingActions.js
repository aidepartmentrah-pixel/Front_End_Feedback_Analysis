// src/components/settings/SettingActions.js
import React, { useState } from "react";
import { Box, Button, Dropdown, MenuButton, Menu, MenuItem } from "@mui/joy";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";

const SettingActions = ({ departments, onSave, onRefresh, onExport }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave();
    setIsSaving(false);
  };

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
      }}
    >
      {/* Save Button */}
      <Button
        startDecorator={<SaveIcon />}
        onClick={handleSave}
        loading={isSaving}
        sx={{
          background: "linear-gradient(135deg, #2ed573 0%, #28c463 100%)",
          color: "white",
          fontWeight: 700,
          "&:hover": {
            background: "linear-gradient(135deg, #28c463 0%, #1faa53 100%)",
          },
        }}
      >
        Save Configuration
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
        Refresh Data
      </Button>

      {/* Export Dropdown */}
      <Dropdown>
        <MenuButton
          startDecorator={<DownloadIcon />}
          variant="outlined"
          sx={{
            borderColor: "#ffa502",
            color: "#ffa502",
            fontWeight: 700,
            "&:hover": {
              background: "rgba(255, 165, 2, 0.1)",
            },
          }}
        >
          Export
        </MenuButton>
        <Menu>
          <MenuItem onClick={() => onExport("json")}>
            📄 Export as JSON
          </MenuItem>
          <MenuItem onClick={() => onExport("csv")}>
            📊 Export as CSV
          </MenuItem>
        </Menu>
      </Dropdown>

      {/* Summary */}
      <Box
        sx={{
          ml: "auto",
          display: "flex",
          gap: 3,
          alignItems: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Box
            sx={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#667eea",
            }}
          >
            {departments.length}
          </Box>
          <Box sx={{ fontSize: "11px", color: "#666" }}>Departments</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SettingActions;
