// src/components/trendMonitoring/HospitalSafetyMetricsWidget.js
// Hospital-wide safety widget — two constant thresholds layered on top of
// the existing database-driven domain % targets. These are NOT stored in
// APP_OrgUnitPolicy and are NOT configurable via the Settings tab; they are
// fixed business-policy constants (see hospital_safety_metrics_service.py).
//
// Visual language matches the concentric-ring bubbles used in Section
// Compliance — a gauge ring fills toward the threshold instead of a flat
// rectangle, for consistency across the page.
import React from "react";
import { Card, Typography, Box, Chip } from "@mui/joy";

const GaugeRing = ({ pct, targetPct, exceeded, size = 140 }) => {
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Fill proportionally toward the target; once exceeded, ring is full red.
  const ratio  = targetPct > 0 ? Math.min(pct / targetPct, 1) : (pct > 0 ? 1 : 0);
  const filled = ratio * circumference;
  const color  = exceeded ? "#dc2626" : "#16a34a";

  return (
    <svg width={size} height={size}>
      {/* Background track */}
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
      {/* Progress arc */}
      <circle
        cx={cx} cy={cy} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${filled} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="24" fontWeight="800" fill={color}>
        {pct}%
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="11" fill="#888">
        limit {targetPct}%
      </text>
    </svg>
  );
};

const MetricBadge = ({ title, metric, description }) => {
  const exceeded = metric.exceeded;

  return (
    <Box sx={{
      flex: 1, minWidth: 180, display: "flex", flexDirection: "column",
      alignItems: "center", textAlign: "center", p: 2,
    }}>
      <GaugeRing pct={metric.actual_pct} targetPct={metric.target_pct} exceeded={exceeded} />
      <Typography level="title-sm" sx={{ fontWeight: 700, mt: 1 }}>{title}</Typography>
      <Chip color={exceeded ? "danger" : "success"} size="sm" variant="solid" sx={{ mt: 0.5 }}>
        {exceeded ? "Exceeded" : "Met"}
      </Chip>
      <Typography level="body-xs" sx={{ color: "#666", mt: 0.5 }}>
        {metric.actual_count} cases
      </Typography>
      <Typography level="body-xs" sx={{ color: "#999", mt: 0.25, maxWidth: 180 }}>
        {description}
      </Typography>
    </Box>
  );
};

const HospitalSafetyMetricsWidget = ({ data }) => {
  if (!data) return null;

  return (
    <Card sx={{ p: 3, mb: 4 }}>
      <Typography level="title-md" sx={{ fontWeight: 700, color: "#667eea", mb: 0.5 }}>
        🛡️ Hospital Safety Metrics
      </Typography>
      <Typography level="body-xs" sx={{ color: "#999", mb: 2 }}>
        Fixed hospital-wide safety thresholds ({data.total_count} total cases in period) — independent of the configurable domain/section policy targets below.
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
        <MetricBadge
          title="High Severity Rate"
          metric={data.high_severity}
          description="High severity cases as a share of all hospital cases."
        />
        <MetricBadge
          title="High Severity + Clinical Rate"
          metric={data.high_severity_clinical}
          description="Cases that are both High severity and Clinical domain."
        />
      </Box>
    </Card>
  );
};

export default HospitalSafetyMetricsWidget;
