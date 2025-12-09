import React from "react";
import Sidebar from "./Sidebar";
import TopBar from "./Topbar";
import { Box, Sheet } from "@mui/joy";

const MainLayout = ({ children }) => (
  <Box sx={{ display: "flex", height: "100vh", width: "100%" }}>
    <Sidebar />
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", marginLeft: "280px" }}>
      <TopBar />
      <Sheet
        sx={{
          flex: 1,
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
