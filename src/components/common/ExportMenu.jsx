// src/components/common/ExportMenu.jsx
// Compact export control -- a single dropdown button, not a standalone
// feature card. Exporting is a secondary utility on these history pages;
// it shouldn't compete visually with the person's actual data, so it lives
// as a small toolbar action next to the incident table title instead of
// its own section.
import React from "react";
import { Dropdown, MenuButton, Menu, MenuItem } from "@mui/joy";
import DownloadIcon from "@mui/icons-material/Download";
import theme from "../../theme";

const FORMATS = [
  { value: "word", label: "Word (.docx)" },
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
];

const ExportMenu = ({ onExport, loading = false }) => {
  return (
    <Dropdown>
      <MenuButton
        size="sm"
        variant="outlined"
        startDecorator={<DownloadIcon fontSize="small" />}
        loading={loading}
        disabled={loading}
        sx={{
          borderColor: theme.colors.border,
          color: theme.colors.primary,
          fontWeight: 600,
          background: theme.colors.surface,
          "&:hover": { background: theme.colors.primaryLighter, borderColor: theme.colors.primary },
        }}
      >
        Export
      </MenuButton>
      <Menu size="sm" placement="bottom-end">
        {FORMATS.map((f) => (
          <MenuItem key={f.value} onClick={() => onExport(f.value)}>
            {f.label}
          </MenuItem>
        ))}
      </Menu>
    </Dropdown>
  );
};

export default ExportMenu;
