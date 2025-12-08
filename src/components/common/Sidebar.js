// src/components/common/Sidebar.js
import React from "react";
import { Box, Typography, Divider, List, ListItemButton, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const pages = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Insert", path: "/insert" },
    { name: "Edit", path: "/edit" },
    { name: "Table View", path: "/table-view" },
    { name: "Reporting", path: "/reporting" }
  ];

  return (
    <Box width="250px" bgcolor="#1976d2" color="white" p={2} display="flex" flexDirection="column">
      {/* Admin Username */}
      <Typography variant="h6">Admin Username</Typography>

      {/* Horizontal line */}
      <Divider sx={{ my: 2, bgcolor: "white" }} />

      {/* Page Links */}
      <List>
        {pages.map((page) => (
          <ListItemButton
            key={page.name}
            component={Link}
            to={page.path}
            sx={{ color: "white" }}
          >
            <ListItemText primary={page.name} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
