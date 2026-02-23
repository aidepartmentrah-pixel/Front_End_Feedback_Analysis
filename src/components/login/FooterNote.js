// src/components/login/FooterNote.js
import React from "react";
import { Box, Typography } from "@mui/joy";
import APP_CONFIG from "../../config/appConfig";

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
      <Typography level="body-xs" sx={{ color: "#ccc", mt: 2 }}>
        © {APP_CONFIG.copyrightYear} {APP_CONFIG.copyrightHolder}. All rights reserved.
      </Typography>
    </Box>
  );
};

export default FooterNote;
