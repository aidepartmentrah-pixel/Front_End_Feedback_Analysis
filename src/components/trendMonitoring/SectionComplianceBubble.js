// src/components/trendMonitoring/SectionComplianceBubble.js
// Annotated concentric-ring compliance chart ("the Egg"), one card per
// HCAT classification:
//   Outer ring  = Low severity vs low-severity target
//   Middle ring = Medium severity vs medium target
//   Inner ring  = High severity vs high target
//
// Reading order top-to-bottom: title → overall status → summary sentence →
// chart (supporting detail, not the headline). Each ring gets an external
// callout (severity name, actual, target, status badge) connected by a
// leader line. The viewBox reserves dedicated margin lanes left/right of the
// ring itself so callouts never sit on top of the ring's circumference.
// Chart/title sizing is fixed regardless of how many cards are in the row —
// only the grid's own column count changes.
import React from "react";
import { Card, Typography, Box, Chip } from "@mui/joy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";

// ── status logic ──────────────────────────────────────────────────────────────

function ringStatus(actual, target) {
  if (target === null || target === undefined) return "no-target";
  if (target === 0) return actual > 0 ? "exceeded" : "no-target";
  const ratio = actual / target;
  if (ratio >= 1.0) return "exceeded";
  if (ratio >= 0.8) return "approaching";
  return "within";
}

// Status palette (fixed, never themed) — icon + Arabic label always
// accompanies color, so no meaning is carried by hue alone.
const STATUS_STYLE = {
  within:      { stroke: "#0ca30c", fill: "rgba(12,163,12,0.07)",  chipColor: "success", Icon: CheckCircleIcon,    label: "ضمن الهدف" },
  approaching: { stroke: "#c98500", fill: "rgba(250,178,25,0.12)", chipColor: "warning", Icon: WarningRoundedIcon, label: "يقترب من الهدف" },
  exceeded:    { stroke: "#d03b3b", fill: "rgba(208,59,59,0.07)",  chipColor: "danger",  Icon: CancelIcon,         label: "تم تجاوز الهدف" },
  "no-target": { stroke: "#898781", fill: "rgba(0,0,0,0.03)",      chipColor: "neutral", Icon: null,               label: "لا يوجد هدف محدد" },
};

// Card-level overall status uses fuller phrasing than the per-ring badges.
const OVERALL_LABEL = {
  within:      "ضمن الحد المستهدف",
  approaching: "قريب من الحد المستهدف",
  exceeded:    "تم تجاوز الحد المستهدف",
  "no-target": "لا يوجد هدف محدد",
};

// Short word shown inside the innermost ring — the chart's only text.
const CENTER_LABEL = { within: "ضمن الحد", approaching: "تنبيه", exceeded: "تجاوز", "no-target": "—" };

const SEVERITY_NAME = { low: "منخفضة الخطورة", medium: "متوسطة الخطورة", high: "عالية الخطورة" };

const STATUS_RANK = { exceeded: 0, approaching: 1, within: 2, "no-target": 3 };
function worstStatus(...statuses) {
  return statuses.reduce((worst, s) => (STATUS_RANK[s] < STATUS_RANK[worst] ? s : worst));
}

// One generated sentence carrying both the numeric summary and the
// conclusion — stating both separately repeated the same facts twice.
function buildSummarySentence(total, statuses, values) {
  const exceededParts = ["low", "medium", "high"]
    .filter((key) => statuses[key] === "exceeded")
    .map((key) => {
      const { actual, target } = values[key];
      const diff = target != null ? actual - target : null;
      return diff != null ? `${SEVERITY_NAME[key]} (+${diff})` : SEVERITY_NAME[key];
    });

  if (exceededParts.length === 0) {
    return `جميع مستويات الخطورة ضمن الحدود المستهدفة (الإجمالي: ${total} حالة).`;
  }
  return `تم تجاوز الحد المستهدف في: ${exceededParts.join("، ")} (الإجمالي: ${total} حالة).`;
}

// ── geometry ───────────────────────────────────────────────────────────────
// The viewBox is deliberately wider than the ring itself, reserving margin
// lanes on both sides so callout boxes never overlap the ring's circumference
// (ring right edge sits at ~68% of the width, left edge at ~32% — callouts
// start clear of both).

const VB_W = 820;
const VB_H = 380;
const CX = 410;
const CY = 190;
const OUTER_R = 148;
const MIDDLE_R = 98;
const INNER_R = 56;

// Ring anchor points and leader-line targets, split left/right for balance:
// Low → top-right, Medium → left, High → bottom-right.
const RINGS = [
  { key: "low",    r: OUTER_R,  name: SEVERITY_NAME.low,    anchor: { x: CX + OUTER_R * 0.82, y: CY - OUTER_R * 0.57 }, lineTo: { x: 592, y: 55 },  box: { left: 71, top: 6,  width: 24 } },
  { key: "medium", r: MIDDLE_R, name: SEVERITY_NAME.medium, anchor: { x: CX - MIDDLE_R,        y: CY },                  lineTo: { x: 250, y: 190 }, box: { left: 5,  top: 39, width: 24 } },
  { key: "high",   r: INNER_R,  name: SEVERITY_NAME.high,   anchor: { x: CX + INNER_R * 0.82, y: CY + INNER_R * 0.57 }, lineTo: { x: 592, y: 300 }, box: { left: 71, top: 71, width: 24 } },
];

const CHART_MAX_WIDTH = 640;
const CARD_MAX_WIDTH = 820;

// ── callout box ──────────────────────────────────────────────────────────────

const Callout = ({ ringDef, actual, target, status }) => {
  const st = STATUS_STYLE[status];
  const Icon = st.Icon;

  return (
    <Box
      sx={{
        position: "absolute",
        left: `${ringDef.box.left}%`,
        top: `${ringDef.box.top}%`,
        width: `${ringDef.box.width}%`,
        minWidth: 150,
        border: `1px solid ${st.stroke}55`,
        borderRadius: "10px",
        bgcolor: "#fcfcfb",
        p: 1.1,
        boxShadow: "0 1px 3px rgba(11,11,11,0.08)",
        direction: "rtl",
      }}
    >
      <Typography level="body-xs" sx={{ fontWeight: 700, color: "#0b0b0b", textAlign: "right" }}>
        {ringDef.name}
      </Typography>
      <Box sx={{ mt: 0.5, display: "flex", flexDirection: "column", gap: 0.2 }}>
        <Typography level="body-xs" sx={{ textAlign: "right" }}>
          الفعلي:{" "}
          <Box component="bdi" sx={{ fontWeight: 700, color: st.stroke }}>{actual}</Box>
        </Typography>
        <Typography level="body-xs" sx={{ textAlign: "right", color: "#52514e" }}>
          المستهدف:{" "}
          <Box component="bdi" sx={{ fontWeight: 600 }}>{target ?? "—"}</Box>
        </Typography>
      </Box>
      <Chip
        color={st.chipColor}
        variant="soft"
        size="sm"
        startDecorator={Icon ? <Icon sx={{ fontSize: 16 }} /> : undefined}
        sx={{ mt: 0.75, fontWeight: 600, fontSize: "11px" }}
      >
        {st.label}
      </Chip>
    </Box>
  );
};

// ── one full annotated ring chart ───────────────────────────────────────────

const AnnotatedRingChart = ({ row }) => {
  const values = {
    low:    { actual: row.low_actual,    target: row.low_target },
    medium: { actual: row.medium_actual, target: row.medium_target },
    high:   { actual: row.high_actual,   target: row.high_target },
  };
  const statuses = {
    low:    ringStatus(values.low.actual,    values.low.target),
    medium: ringStatus(values.medium.actual, values.medium.target),
    high:   ringStatus(values.high.actual,   values.high.target),
  };

  const overall  = worstStatus(statuses.low, statuses.medium, statuses.high);
  const accent   = STATUS_STYLE[overall];
  const summary  = buildSummarySentence(row.total_actual, statuses, values);
  const name     = row.classification_name || row.classification_name_en || `تصنيف ${row.classification_id}`;

  return (
    <Card
      sx={{
        p: 2.5,
        width: "100%",
        maxWidth: CARD_MAX_WIDTH,
        mx: "auto",
        borderTop: `4px solid ${accent.stroke}`,
      }}
    >
      {/* Header: title → overall status → summary sentence (before the chart), all centered */}
      <Box
        sx={{
          direction: "rtl",
          textAlign: "center",
          bgcolor: `${accent.stroke}0a`,
          borderRadius: "10px",
          p: 1.5,
          mb: 1.75,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            color: "#0b0b0b",
            fontSize: "22px",
            lineHeight: 1.45,
            minHeight: "62px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {name}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Chip
            color={accent.chipColor}
            variant="solid"
            size="md"
            startDecorator={accent.Icon ? <accent.Icon /> : undefined}
            sx={{ fontWeight: 700 }}
          >
            {OVERALL_LABEL[overall]}
          </Chip>
        </Box>

        <Typography level="body-sm" sx={{ color: "#52514e", mt: 1 }}>
          {summary}
        </Typography>
      </Box>

      {/* Chart: supporting detail, fixed size regardless of card count */}
      <Box sx={{ position: "relative", width: "100%", maxWidth: CHART_MAX_WIDTH, mx: "auto", aspectRatio: `${VB_W} / ${VB_H}` }}>
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
          {RINGS.map((ringDef) => {
            const st = STATUS_STYLE[statuses[ringDef.key]];
            return (
              <line
                key={`line-${ringDef.key}`}
                x1={ringDef.anchor.x} y1={ringDef.anchor.y}
                x2={ringDef.lineTo.x} y2={ringDef.lineTo.y}
                stroke={st.stroke} strokeWidth={1.5} strokeDasharray="3,3"
              />
            );
          })}

          <circle cx={CX} cy={CY} r={OUTER_R}  fill={STATUS_STYLE[statuses.low].fill}    stroke={STATUS_STYLE[statuses.low].stroke}    strokeWidth={3.5} />
          <circle cx={CX} cy={CY} r={MIDDLE_R} fill={STATUS_STYLE[statuses.medium].fill} stroke={STATUS_STYLE[statuses.medium].stroke} strokeWidth={3}   />
          <circle cx={CX} cy={CY} r={INNER_R}  fill={STATUS_STYLE[statuses.high].fill}   stroke={STATUS_STYLE[statuses.high].stroke}   strokeWidth={2.5} />

          {RINGS.map((ringDef) => (
            <circle
              key={`dot-${ringDef.key}`}
              cx={ringDef.anchor.x} cy={ringDef.anchor.y} r={4}
              fill={STATUS_STYLE[statuses[ringDef.key]].stroke}
            />
          ))}

          <text x={CX} y={CY + 5} textAnchor="middle" fontSize={16} fontWeight={700} fill={accent.stroke}>
            {CENTER_LABEL[overall]}
          </text>
        </svg>

        {RINGS.map((ringDef) => (
          <Callout
            key={ringDef.key}
            ringDef={ringDef}
            actual={values[ringDef.key].actual}
            target={values[ringDef.key].target}
            status={statuses[ringDef.key]}
          />
        ))}
      </Box>
    </Card>
  );
};

// ── main component ────────────────────────────────────────────────────────────

const SectionComplianceBubble = ({ data }) => {
  const active = (data?.rows || []).filter((r) => r.total_actual > 0);

  if (active.length === 0) {
    return (
      <Card sx={{ p: 3, mb: 3, textAlign: "center" }}>
        <Typography level="body-md" sx={{ color: "#999" }}>
          لا يوجد نشاط تصنيفي خلال الفترة المحددة.
        </Typography>
      </Card>
    );
  }

  const sorted = [...active].sort((a, b) => {
    const rankA = STATUS_RANK[worstStatus(
      ringStatus(a.low_actual, a.low_target),
      ringStatus(a.medium_actual, a.medium_target),
      ringStatus(a.high_actual, a.high_target),
    )];
    const rankB = STATUS_RANK[worstStatus(
      ringStatus(b.low_actual, b.low_target),
      ringStatus(b.medium_actual, b.medium_target),
      ringStatus(b.high_actual, b.high_target),
    )];
    return rankA !== rankB ? rankA - rankB : b.total_actual - a.total_actual;
  });

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography level="title-md" sx={{ fontWeight: 700, color: "#667eea", mb: 2, direction: "rtl", textAlign: "center" }}>
        توافق التصنيفات مع الأهداف
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
          gap: 5,
        }}
      >
        {sorted.map((row) => (
          <AnnotatedRingChart key={row.classification_id} row={row} />
        ))}
      </Box>
    </Card>
  );
};

export default SectionComplianceBubble;
