// src/components/redflags/RedFlagFilters.js
import React from "react";
import { Box, Card, Input } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";

const RedFlagFilters = ({ searchQuery, setSearchQuery }) => {
  return (
    <Card
      sx={{
        p: 2,
        mb: 3,
        background: "linear-gradient(135deg, rgba(255, 71, 87, 0.05) 0%, rgba(255, 71, 87, 0.02) 100%)",
        border: "2px solid rgba(255, 71, 87, 0.2)",
      }}
    >
      <Input
        placeholder="Search by Record ID or Patient Name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        startDecorator={<SearchIcon />}
        sx={{
          fontSize: "15px",
          fontWeight: 500,
        }}
      />
    </Card>
  );
};

export default RedFlagFilters;
