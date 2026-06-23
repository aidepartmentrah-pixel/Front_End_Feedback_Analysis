import React from "react";
import { Card, Typography, Box, Chip } from "@mui/joy";
import { TrendingUp, TrendingDown } from "@mui/icons-material";

/**
 * MetricCard — three render modes:
 *   1. rows prop  → breakdown list (Severity, Domain, Risk)
 *   2. value prop → big centered number, optional subtitle + badge
 *   3. (default)  → same as current behaviour
 */
const MetricCard = ({
  title,
  value,
  color = "#667eea",
  trend = null,
  rows = null,
  subtitle = null,
  badge = null,
}) => {
  const getTrendColor = () =>
    trend?.direction === "up" ? "#2ed573" : "#ff4757";
  const TrendIcon = trend?.direction === "up" ? TrendingUp : TrendingDown;

  // ── Breakdown rows card ──────────────────────────────────────────────────
  if (rows) {
    return (
      <Card
        variant="soft"
        sx={{
          p: 1.25,
          height: "100%",
          background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
          border: `1px solid ${color}20`,
          boxShadow: `0 4px 12px ${color}10`,
          borderRadius: "10px",
        }}
      >
        <Typography
          level="body-xs"
          sx={{
            color,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontSize: "10px",
            mb: 0.5,
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {rows.map((row, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 0.25,
              borderBottom: i < rows.length - 1 ? "1px solid #f0f2f5" : "none",
            }}
          >
            <Typography level="body-xs" sx={{ color: "#555", fontWeight: 500, lineHeight: 1.3 }}>
              {row.label}
            </Typography>
            <Typography
              level="body-xs"
              sx={{ color: row.color || color, fontWeight: 700, minWidth: 24, textAlign: "right", lineHeight: 1.3 }}
            >
              {row.value}
            </Typography>
          </Box>
        ))}
      </Card>
    );
  }

  // ── Standard value card (+ optional subtitle / badge) ───────────────────
  return (
    <Card
      variant="soft"
      sx={{
        p: 2.5,
        height: subtitle ? "auto" : 140,
        minHeight: 140,
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
        borderRadius: "10px",
        "&:hover": {
          boxShadow: `0 12px 24px ${color}25`,
          transform: "translateY(-3px)",
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

      {badge && (
        <Chip
          size="sm"
          variant="soft"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            fontSize: "9px",
            fontWeight: 700,
            bgcolor: "#ff475715",
            color: "#ff4757",
            border: "1px solid #ff475730",
            px: 0.8,
          }}
        >
          {badge}
        </Chip>
      )}

      <Typography
        level="body-sm"
        sx={{
          color,
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
          color,
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

      {subtitle && (
        <Typography
          level="body-xs"
          sx={{ mt: 0.8, color: "#888", fontSize: "11px", textAlign: "center" }}
        >
          {subtitle}
        </Typography>
      )}
    </Card>
  );
};

export default MetricCard;
