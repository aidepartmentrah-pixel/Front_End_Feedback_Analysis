import React from "react";
import Sidebar from "./Sidebar";
import TopBar from "./Topbar";
import { Box } from "@mui/material";

const MainLayout = ({ children }) => (
  <Box display="flex" height="100vh">
    <Sidebar />
    <Box flexGrow={1} display="flex" flexDirection="column">
      <TopBar />
      <Box flexGrow={1} p={3} bgcolor="#f5f5f5" overflow="auto">
        {children}
      </Box>
    </Box>
  </Box>
);

export default MainLayout;
