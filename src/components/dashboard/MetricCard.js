import React from "react";
import { Card, Typography, Box } from "@mui/joy";

const MetricCard = ({ title, value }) => {
  return (
    <Card
      variant="soft"
      sx={{
        p: 2.5,
        minHeight: 140,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
        border: "1px solid rgba(102, 126, 234, 0.1)",
        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.08)",
        transition: "all 0.3s ease",
        cursor: "pointer",
        "&:hover": {
          boxShadow: "0 12px 24px rgba(102, 126, 234, 0.15)",
          transform: "translateY(-4px)",
          border: "1px solid rgba(102, 126, 234, 0.3)",
        },
      }}
    >
      <Typography
        level="body-sm"
        sx={{
          color: "#667eea",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          fontSize: "12px",
        }}
      >
        {title}
      </Typography>
      <Typography
        level="h2"
        sx={{
          mt: 1.5,
          color: "#1a1e3f",
          fontWeight: 800,
          fontSize: "32px",
        }}
      >
        {value}
      </Typography>
    </Card>
  );
};

export default MetricCard;
