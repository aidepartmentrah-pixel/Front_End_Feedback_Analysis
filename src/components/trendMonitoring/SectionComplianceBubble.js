// src/components/trendMonitoring/SectionComplianceBubble.js
// Concentric ring bubble design:
//   Outer ring  = Total cases vs total target
//   Middle ring = Medium severity vs medium target
//   Inner ring  = High severity vs high target
// Each ring independently colored by how close it is to its limit.
import React from "react";
import { Card, Typography, Box, Chip } from "@mui/joy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

// ── status logic ──────────────────────────────────────────────────────────────

function ringStatus(actual, target) {
  if (target === null || target === undefined) return "no-target";
  if (target === 0) return actual > 0 ? "exceeded" : "no-target";
  const ratio = actual / target;
  if (ratio >= 1.0) return "exceeded";
  if (ratio >= 0.8) return "approaching";
  return "within";
}

function ringLabel(actual, target) {
  if (target === null || target === undefined) return String(actual);
  if (target === 0) return `${actual}/0 (∞)`;
  const pct = Math.round((actual / target) * 100);
  return `${actual}/${target} (${pct}%)`;
}

const RING_STYLE = {
  exceeded:   { stroke: "#dc2626", fill: "rgba(220,38,38,0.07)"  },
  approaching:{ stroke: "#f97316", fill: "rgba(249,115,22,0.07)" },
  within:     { stroke: "#16a34a", fill: "rgba(22,163,74,0.06)"  },
  "no-target":{ stroke: "#bbbbbb", fill: "rgba(0,0,0,0.03)"      },
};

// Overall bubble status = worst ring (used for sorting)
const STATUS_RANK = { exceeded: 0, approaching: 1, within: 2, "no-target": 3 };
function worstStatus(...statuses) {
  return statuses.reduce((worst, s) =>
    STATUS_RANK[s] < STATUS_RANK[worst] ? s : worst
  );
}

// Final business decision: Target Met only when NONE of the three
// conditions are exceeded. "Approaching" (80-99%) still counts as Met —
// the badge communicates the final outcome, the rings show the detail.
function isTargetMet(outerSt, middleSt, innerSt) {
  return outerSt !== "exceeded" && middleSt !== "exceeded" && innerSt !== "exceeded";
}

function buildBadgeReason(outerSt, middleSt, innerSt) {
  const reasons = [];
  if (outerSt === "exceeded")  reasons.push("Total cases target exceeded");
  if (middleSt === "exceeded") reasons.push("Medium severity target exceeded");
  if (innerSt === "exceeded")  reasons.push("High severity target exceeded");
  return reasons.length ? reasons.join("; ") : "All targets within limits";
}

// Bubble outer diameter based on total cases (sqrt scaling)
function bubbleSize(totalActual) {
  return Math.min(260, Math.max(140, Math.sqrt(Math.max(1, totalActual)) * 28));
}

// ── single concentric-ring bubble (SVG) ───────────────────────────────────────

const ConcentricBubble = ({ row }) => {
  const size  = bubbleSize(row.total_actual);
  const cx    = size / 2;
  const cy    = size / 2;
  const outerR  = size / 2 - 4;
  const middleR = outerR * 0.63;
  const innerR  = outerR * 0.37;

  const outerSt  = ringStatus(row.total_actual,  row.total_target);
  const middleSt = ringStatus(row.medium_actual, row.medium_target);
  const innerSt  = ringStatus(row.high_actual,   row.high_target);

  const outerS  = RING_STYLE[outerSt];
  const middleS = RING_STYLE[middleSt];
  const innerS  = RING_STYLE[innerSt];

  const targetMet   = isTargetMet(outerSt, middleSt, innerSt);
  const badgeReason = buildBadgeReason(outerSt, middleSt, innerSt);

  const fs = Math.max(7, Math.round(size / 22)); // font size relative to bubble

  const name      = row.classification_name_en || row.classification_name || `Cls ${row.classification_id}`;
  const shortName = name.length > 26 ? name.slice(0, 24) + "…" : name;

  // Text y-positions — centred within each ring band
  const outerTextY  = cy - outerR  * 0.76;
  const middleTextY = cy - (middleR + innerR) / 2;
  const innerTextY  = cy;

  return (
    <Box
      title={name}
      sx={{
        display: "flex", flexDirection: "column", alignItems: "center",
        m: 1.5, cursor: "default",
        transition: "transform 0.15s",
        "&:hover": { transform: "scale(1.05)", zIndex: 1 },
      }}
    >
      {/* Classification name */}
      <Typography
        level="body-xs"
        sx={{ fontWeight: 700, textAlign: "center", mb: 0.25, maxWidth: size, fontSize: "11px" }}
      >
        {shortName}
      </Typography>
      <Typography level="body-xs" sx={{ color: "#888", mb: 0.5, fontSize: "10px" }}>
        Total: {row.total_actual}
      </Typography>

      <svg width={size} height={size} style={{ display: "block", overflow: "visible" }}>
        {/* Outer ring — Total */}
        <circle cx={cx} cy={cy} r={outerR}  fill={outerS.fill}  stroke={outerS.stroke}  strokeWidth={3}   />
        {/* Middle ring — Medium severity */}
        <circle cx={cx} cy={cy} r={middleR} fill={middleS.fill} stroke={middleS.stroke} strokeWidth={2.5} />
        {/* Inner ring — High severity */}
        <circle cx={cx} cy={cy} r={innerR}  fill={innerS.fill}  stroke={innerS.stroke}  strokeWidth={2}   />

        {/* Text in outer band */}
        <text
          x={cx} y={outerTextY + fs * 0.35}
          textAnchor="middle" fontSize={fs}
          fill={outerS.stroke} fontWeight="700"
        >
          {ringLabel(row.total_actual, row.total_target)}
        </text>

        {/* Text in middle band */}
        <text
          x={cx} y={middleTextY + fs * 0.35}
          textAnchor="middle" fontSize={fs}
          fill={middleS.stroke} fontWeight="700"
        >
          {ringLabel(row.medium_actual, row.medium_target)}
        </text>

        {/* Text in inner circle */}
        <text
          x={cx} y={innerTextY + fs * 0.35}
          textAnchor="middle" fontSize={fs}
          fill={innerS.stroke} fontWeight="700"
        >
          {ringLabel(row.high_actual, row.high_target)}
        </text>
      </svg>

      {/* Final business-outcome badge — no ring interpretation required */}
      <Chip
        color={targetMet ? "success" : "danger"}
        variant="soft"
        size="md"
        startDecorator={targetMet ? <CheckCircleIcon /> : <CancelIcon />}
        sx={{ mt: 1, fontWeight: 700 }}
      >
        {targetMet ? "Target Met" : "Target Not Met"}
      </Chip>
      <Typography level="body-xs" sx={{ color: "#888", mt: 0.5, textAlign: "center", maxWidth: size + 20 }}>
        {badgeReason}
      </Typography>
    </Box>
  );
};

// ── legend ────────────────────────────────────────────────────────────────────

const Legend = () => (
  <Box
    sx={{
      border: "1px solid #e0e0e0", borderRadius: "8px", p: 1.5,
      minWidth: 180, maxWidth: 200, flexShrink: 0, bgcolor: "#fafafa",
    }}
  >
    <Typography level="body-xs" sx={{ fontWeight: 700, mb: 1 }}>How to read</Typography>
    {[
      { color: "#16a34a", label: "Within Target (0–79%)"  },
      { color: "#f97316", label: "Approaching (80–99%)"   },
      { color: "#dc2626", label: "Exceeded (≥100%)"       },
    ].map(({ color, label }) => (
      <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
        <Typography level="body-xs" sx={{ color: "#555" }}>{label}</Typography>
      </Box>
    ))}

    <Box sx={{ mt: 1.5, borderTop: "1px solid #e0e0e0", pt: 1 }}>
      {[
        { label: "Outer Ring", desc: "Total (All Cases)"   },
        { label: "Middle Ring", desc: "Medium Severity"    },
        { label: "Inner Ring",  desc: "High Severity"      },
      ].map(({ label, desc }) => (
        <Box key={label} sx={{ display: "flex", gap: 0.5, mb: 0.25 }}>
          <Typography level="body-xs" sx={{ fontWeight: 600, color: "#555", whiteSpace: "nowrap" }}>{label}:</Typography>
          <Typography level="body-xs" sx={{ color: "#888" }}>{desc}</Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

// ── main component ────────────────────────────────────────────────────────────

const SectionComplianceBubble = ({ data }) => {
  const active = (data?.rows || []).filter((r) => r.total_actual > 0);

  if (active.length === 0) {
    return (
      <Card sx={{ p: 3, mb: 3, textAlign: "center" }}>
        <Typography level="body-md" sx={{ color: "#999" }}>
          No classification activity found for the selected period.
        </Typography>
      </Card>
    );
  }

  // Sort: most severe first, then by total desc
  const sorted = [...active].sort((a, b) => {
    const rankA = STATUS_RANK[worstStatus(
      ringStatus(a.total_actual, a.total_target),
      ringStatus(a.medium_actual, a.medium_target),
      ringStatus(a.high_actual, a.high_target),
    )];
    const rankB = STATUS_RANK[worstStatus(
      ringStatus(b.total_actual, b.total_target),
      ringStatus(b.medium_actual, b.medium_target),
      ringStatus(b.high_actual, b.high_target),
    )];
    return rankA !== rankB ? rankA - rankB : b.total_actual - a.total_actual;
  });

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography level="title-md" sx={{ fontWeight: 700, color: "#667eea", mb: 2 }}>
        Classification Compliance
      </Typography>

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexWrap: "wrap" }}>
        <Legend />
        <Box
          sx={{
            display: "flex", flexWrap: "wrap",
            alignItems: "flex-start", justifyContent: "flex-start",
            flex: 1, minWidth: 0,
          }}
        >
          {sorted.map((row, i) => (
            <ConcentricBubble key={row.classification_id ?? i} row={row} />
          ))}
        </Box>
      </Box>

      <Typography level="body-xs" sx={{ color: "#aaa", mt: 2, textAlign: "center" }}>
        Bubble size = Total actual cases (All). Larger bubble means more total cases.
      </Typography>
    </Card>
  );
};

export default SectionComplianceBubble;
