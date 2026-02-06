import React from "react";
import Sidebar from "./Sidebar";
import TopBar from "./Topbar";
import { Box, Sheet } from "@mui/joy";
import brandTheme from "../../theme/brandTheme";

const MainLayout = ({ children }) => (
  <Box sx={{ display: "flex", height: "100vh", width: "100%", background: brandTheme.colors.bg_app }}>
    <Sidebar />
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", marginLeft: "280px" }}>
      <TopBar />
      <Sheet
        sx={{
          flex: 1,
          p: 3,
          overflow: "auto",
          backgroundColor: brandTheme.colors.bg_panel,
        }}
      >
        {children}
      </Sheet>
    </Box>
  </Box>
);

export default MainLayout;
