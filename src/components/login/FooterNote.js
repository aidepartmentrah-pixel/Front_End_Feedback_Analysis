// src/components/login/FooterNote.js
import React from "react";
import { Box, Typography } from "@mui/joy";
import SecurityIcon from "@mui/icons-material/Security";

const FooterNote = () => {
  return (
    <Box
      sx={{
        mt: 4,
        pt: 3,
        borderTop: "1px solid #e0e0e0",
        textAlign: "center",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
        <SecurityIcon sx={{ fontSize: 18, color: "#999" }} />
        <Typography level="body-sm" sx={{ color: "#666", fontWeight: 600 }}>
          Authorized Personnel Only
        </Typography>
      </Box>
      <Typography level="body-xs" sx={{ color: "#999" }}>
        All actions are monitored and logged for security purposes
      </Typography>
      <Typography level="body-xs" sx={{ color: "#999", mt: 0.5 }}>
        للموظفين المصرح لهم فقط - جميع الإجراءات مراقبة
      </Typography>
      <Typography level="body-xs" sx={{ color: "#ccc", mt: 2 }}>
        © 2025 Hospital Feedback AI System. All rights reserved.
      </Typography>
    </Box>
  );
};

export default FooterNote;
