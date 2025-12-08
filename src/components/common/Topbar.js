import React from "react";
import { Box, Typography, Divider } from "@mui/material";

const TopBar = () => (
  <Box bgcolor="#1976d2" color="white" p={2} display="flex" flexDirection="column">
    <Typography variant="h6">Admin Username</Typography>
    <Divider sx={{ my: 1, bgcolor: "white" }} />
  </Box>
);

export default TopBar;
