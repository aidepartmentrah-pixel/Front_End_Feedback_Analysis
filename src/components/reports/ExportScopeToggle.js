// src/components/reports/ExportScopeToggle.js
import React from "react";
import { Box, Typography, Button } from "@mui/joy";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";

const ExportScopeToggle = ({ scope, setScope }) => {
  return (
    <Box 
      sx={{ 
        mb: 3, 
        p: 2, 
        borderRadius: "8px",
        background: "rgba(102, 126, 234, 0.05)",
        border: "1px solid rgba(102, 126, 234, 0.2)",
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Typography level="body-md" sx={{ fontWeight: 600, color: "#667eea" }}>
        Export Scope:
      </Typography>
      
      <Box sx={{ display: "flex", gap: 1, background: "white", borderRadius: "6px", padding: "4px", border: "1px solid #e0e0e0" }}>
        <Button
          variant={scope === "single" ? "solid" : "plain"}
          size="sm"
          startDecorator={<PersonIcon />}
          onClick={() => setScope("single")}
          sx={{
            px: 2,
            py: 0.75,
            fontWeight: 600,
            fontSize: "13px",
            background: scope === "single" 
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
              : "transparent",
            color: scope === "single" ? "white" : "#666",
            "&:hover": {
              background: scope === "single" 
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                : "rgba(102, 126, 234, 0.1)",
            },
          }}
        >
          Single Report
        </Button>
        
        <Button
          variant={scope === "bulk" ? "solid" : "plain"}
          size="sm"
          startDecorator={<GroupsIcon />}
          onClick={() => setScope("bulk")}
          sx={{
            px: 2,
            py: 0.75,
            fontWeight: 600,
            fontSize: "13px",
            background: scope === "bulk" 
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
              : "transparent",
            color: scope === "bulk" ? "white" : "#666",
            "&:hover": {
              background: scope === "bulk" 
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                : "rgba(102, 126, 234, 0.1)",
            },
          }}
        >
          Bulk Reports
        </Button>
      </Box>
    </Box>
  );
};

export default ExportScopeToggle;
