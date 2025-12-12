import React from "react";
import { Card, Typography, Box, Chip } from "@mui/joy";
import { TrendingUp, TrendingDown } from "@mui/icons-material";

const MetricCard = ({ title, value, color = "#667eea", trend = null }) => {
  // trend: { value: 15, direction: "up" } or { value: -8, direction: "down" }
  
  const getTrendColor = () => {
    if (!trend) return null;
    return trend.direction === "up" ? "#2ed573" : "#ff4757";
  };

  const TrendIcon = trend?.direction === "up" ? TrendingUp : TrendingDown;

  return (
    <Card
      variant="soft"
      sx={{
        p: 2.5,
        height: 140,
        minHeight: 140,
        maxHeight: 140,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
        border: `1px solid ${color}20`,
        boxShadow: `0 4px 12px ${color}15`,
        transition: "all 0.3s ease",
        cursor: "pointer",
        position: "relative",
        "&:hover": {
          boxShadow: `0 12px 24px ${color}25`,
          transform: "translateY(-4px)",
          border: `1px solid ${color}50`,
        },
      }}
    >
      {trend && (
        <Chip
          size="sm"
          variant="soft"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: "10px",
            fontWeight: 700,
            bgcolor: `${getTrendColor()}15`,
            color: getTrendColor(),
            border: `1px solid ${getTrendColor()}30`,
            py: 0.3,
            px: 0.8,
          }}
          startDecorator={<TrendIcon sx={{ fontSize: 12 }} />}
        >
          {Math.abs(trend.value)}%
        </Chip>
      )}
      
      <Typography
        level="body-sm"
        sx={{
          color: color,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          fontSize: "12px",
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {title}
      </Typography>
      <Typography
        level="h2"
        sx={{
          mt: 1.5,
          color: color,
          fontWeight: 800,
          fontSize: "24px",
          lineHeight: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
        }}
      >
        {value}
      </Typography>
    </Card>
  );
};

export default MetricCard;
