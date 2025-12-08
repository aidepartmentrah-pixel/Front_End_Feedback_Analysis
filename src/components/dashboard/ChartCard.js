import React from "react";
import { Card, Typography, Box } from "@mui/joy";

const ChartCard = ({ title, children }) => {
  return (
    <Card
      sx={{
        p: 2,
        background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
        border: "1px solid rgba(102, 126, 234, 0.1)",
        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.08)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 12px 24px rgba(102, 126, 234, 0.15)",
        },
      }}
    >
      <Typography
        level="h4"
        sx={{
          mb: 2,
          color: "#1a1e3f",
          fontWeight: 700,
        }}
      >
        {title}
      </Typography>
      <Box sx={{ minHeight: 300 }}>
        {children}
      </Box>
    </Card>
  );
};

export default ChartCard;
