import React from "react";
import Sidebar from "./Sidebar";
import TopBar from "./Topbar";
import { Box, Sheet } from "@mui/joy";

const MainLayout = ({ children }) => (
  <Box display="flex" height="100vh">
    <Sidebar />
    <Box flexGrow={1} display="flex" flexDirection="column">
      <TopBar />
      <Sheet
        sx={{
          flexGrow: 1,
          p: 3,
          overflow: "auto",
          backgroundColor: "#f5f7fa",
        }}
      >
        {children}
      </Sheet>
    </Box>
  </Box>
);

export default MainLayout;
