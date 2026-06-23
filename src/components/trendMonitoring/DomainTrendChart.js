// src/components/trendMonitoring/DomainTrendChart.js
import React, { useRef } from "react";
import { Card, Typography, Box, Button, Chip } from "@mui/joy";
import DownloadIcon from "@mui/icons-material/Download";
import html2canvas from "html2canvas";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

// ─── constants ───────────────────────────────────────────────────────────────

const TARGET_KEY = {
  Clinical:   "clinical_domain_limit",
  Management: "management_domain_limit",
  Relational: "relational_domain_limit",
};

const MONTH_ABBR_TO_NUM = {
  Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6,
  Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12,
};

// Subtle alternating tints — visual lane separation, not the focal point
const SEASON_TINT = {
  odd:  "rgba(102, 126, 234, 0.04)",
  even: "rgba(76, 175, 80, 0.03)",
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function parseLabel(label) {
  const [abbr, yearStr] = label.split(" ");
  const month   = MONTH_ABBR_TO_NUM[abbr] ?? 1;
  const year    = parseInt(yearStr, 10);
  const quarter = Math.ceil(month / 3);
  return { month, year, quarter, seasonKey: `Q${quarter}-${year}` };
}

function getCurrentSeasonKey() {
  const now = new Date();
  return `Q${Math.ceil((now.getMonth() + 1) / 3)}-${now.getFullYear()}`;
}

/**
 * Compute seasonal targets and violation state.
 *
 * Per-season target = season_total × (target_pct / 100).
 * Only months in the selected range count toward each season's total.
 * Violation = domain total for the season exceeds its seasonal budget.
 */
function computeSeasonalData(chartLabels, chartDataSeries, targets) {
  const currentSeasonKey = getCurrentSeasonKey();
  const empty = { enhanced: {}, violationMap: new Map(), seasonBands: [], currentSeasonKey };
  if (!targets?.has_domain_targets || !chartLabels?.length) return empty;

  const labelMeta     = chartLabels.map(parseLabel);
  const seasonIndices = {};
  const seasonOrder   = [];

  labelMeta.forEach(({ seasonKey }, idx) => {
    if (!seasonIndices[seasonKey]) { seasonIndices[seasonKey] = []; seasonOrder.push(seasonKey); }
    seasonIndices[seasonKey].push(idx);
  });

  const seasonStats = {};
  seasonOrder.forEach((seasonKey) => {
    const indices = seasonIndices[seasonKey];
    let seasonTotal = 0;
    const domainTotals = {};

    chartDataSeries.forEach((s) => {
      const tot = indices.reduce((sum, i) => sum + (s.data[i] || 0), 0);
      domainTotals[s.name] = tot;
      seasonTotal += tot;
    });

    const targetCases = {};
    const violated    = {};
    chartDataSeries.forEach((s) => {
      const tPct = targets[TARGET_KEY[s.name]];
      if (tPct == null) { targetCases[s.name] = null; violated[s.name] = false; return; }
      const budget = seasonTotal > 0 ? (seasonTotal * tPct / 100) : 0;
      targetCases[s.name] = budget;
      violated[s.name]    = seasonTotal > 0 && domainTotals[s.name] > budget;
    });

    seasonStats[seasonKey] = { seasonTotal, targetCases, violated };
  });

  const violationMap = new Map();
  labelMeta.forEach(({ seasonKey }, idx) => {
    const stats   = seasonStats[seasonKey] || {};
    const domains = new Set(
      Object.entries(stats.violated || {}).filter(([, v]) => v).map(([d]) => d)
    );
    violationMap.set(chartLabels[idx], domains);
  });

  const enhanced = {};
  labelMeta.forEach(({ seasonKey }, idx) => {
    const stats = seasonStats[seasonKey] || {};
    enhanced[chartLabels[idx]] = {
      targetCases: stats.targetCases || {},
      seasonTotal: stats.seasonTotal || 0,
      seasonKey,
    };
  });

  // Season bands with centered quarter labels
  const seasonBands = seasonOrder.map((seasonKey) => {
    const indices = seasonIndices[seasonKey];
    const { quarter, year } = labelMeta[indices[0]];
    return {
      seasonKey,
      x1:      chartLabels[indices[0]],
      x2:      chartLabels[indices[indices.length - 1]],
      quarter,
      label:   `Q${quarter} ${year}`,
    };
  });

  return { enhanced, violationMap, seasonBands, currentSeasonKey };
}

// ─── summary cards ────────────────────────────────────────────────────────────

const DomainStatusRow = ({ chartDataSeries, targets }) => {
  if (!targets?.has_domain_targets) return null;

  const grandTotal = chartDataSeries.reduce(
    (sum, s) => sum + s.data.reduce((a, b) => a + (b || 0), 0), 0
  );

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
      {chartDataSeries.map((series) => {
        const tPct = targets[TARGET_KEY[series.name]];
        if (tPct == null) return null;

        const domainTotal = series.data.reduce((a, b) => a + (b || 0), 0);
        const actualPct   = grandTotal > 0 ? (domainTotal / grandTotal) * 100 : 0;
        const exceeded    = actualPct > tPct;
        const gap         = Math.abs(actualPct - tPct).toFixed(1);

        return (
          <Box key={series.name} sx={{
            px: 1.5, py: 1, borderRadius: "8px", border: "1px solid",
            borderColor: exceeded ? "danger.outlinedBorder" : "success.outlinedBorder",
            bgcolor:     exceeded ? "danger.softBg"         : "success.softBg",
            minWidth: 175,
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: series.color, flexShrink: 0 }} />
              <Typography level="body-xs" sx={{ fontWeight: 700 }}>{series.name}</Typography>
              <Chip color={exceeded ? "danger" : "success"} size="sm" variant="solid"
                sx={{ fontSize: "10px", py: 0, ml: "auto" }}>
                {exceeded ? "Exceeded" : "Within"}
              </Chip>
            </Box>
            <Typography level="body-sm" sx={{ fontWeight: 700, color: exceeded ? "danger.700" : "success.700" }}>
              {actualPct.toFixed(1)}% / {tPct}%
            </Typography>
            <Typography level="body-xs" sx={{ color: exceeded ? "danger.600" : "success.600", mt: 0.25 }}>
              {exceeded ? `Exceeded by +${gap} pp` : `${gap} pp below target`}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

// ─── tooltip ──────────────────────────────────────────────────────────────────

function buildTooltip() {
  return function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;

    const actual = payload.filter((e) => !String(e.dataKey).endsWith("_target"));
    if (!actual.length) return null;

    const row = actual[0].payload;

    return (
      <Box sx={{ background: "white", border: "2px solid #667eea", borderRadius: "8px", p: 1.5, maxWidth: 240 }}>
        <Typography level="body-sm" sx={{ fontWeight: 700, mb: 0.5 }}>
          {row.month}
          {row._isCurrentSeason && (
            <Typography component="span" level="body-xs" sx={{ color: "#f97316", ml: 1 }}>
              (in progress)
            </Typography>
          )}
        </Typography>
        {actual.map((entry, i) => {
          const budget   = row[`${entry.name}_target`];
          const cumValue = entry.value; // running season total up to this month
          const violated = budget != null && cumValue > budget;

          return (
            <Box key={i} sx={{ mb: 0.75 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: entry.color, flexShrink: 0 }} />
                <Typography level="body-xs">
                  {entry.name}: <strong>{cumValue}</strong> cumulative
                  {budget != null && ` / ${budget.toFixed(0)} limit`}
                </Typography>
              </Box>
              {budget != null && (
                <Typography level="body-xs" sx={{
                  pl: 2.5, color: violated ? "#dc2626" : "#16a34a", fontWeight: violated ? 600 : 400,
                }}>
                  {violated
                    ? `Exceeded — ${(cumValue - budget).toFixed(1)} cases over limit`
                    : `Within — ${(budget - cumValue).toFixed(1)} cases remaining`}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    );
  };
}

// ─── custom dot — red/orange on violated seasons ──────────────────────────────

function makeDot(seriesColor, violationMap, currentSeasonKey) {
  return function ViolationDot({ cx, cy, payload, dataKey }) {
    if (cx == null || cy == null) return null;
    const violated  = violationMap?.get(payload.month)?.has(dataKey);
    const isCurrent = payload._isCurrentSeason;
    if (violated) {
      return (
        <circle cx={cx} cy={cy} r={8}
          fill={isCurrent ? "#f97316" : "#dc2626"}
          stroke="white" strokeWidth={2} />
      );
    }
    return <circle cx={cx} cy={cy} r={5} fill={seriesColor} />;
  };
}

// ─── chart legend explanation ─────────────────────────────────────────────────

const ChartLegendNote = ({ hasDomainTargets }) => (
  <Box sx={{
    mt: 2, px: 2, py: 1.5, borderRadius: "8px",
    bgcolor: "neutral.softBg",
    display: "flex", gap: 3, flexWrap: "wrap",
  }}>
    {hasDomainTargets && (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 28, height: 0, borderTop: "2px dashed #999" }} />
        <Typography level="body-xs" sx={{ color: "#555" }}>Dashed = Target/Limit</Typography>
      </Box>
    )}
    {hasDomainTargets && (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 16, height: 12, bgcolor: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "2px" }} />
        <Typography level="body-xs" sx={{ color: "#555" }}>Red Background = Violation Month</Typography>
      </Box>
    )}
    {hasDomainTargets && (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#dc2626", border: "2px solid white", boxShadow: "0 0 0 1px #dc2626" }} />
        <Typography level="body-xs" sx={{ color: "#555" }}>Red Point = Exceeded Target</Typography>
      </Box>
    )}
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ width: 28, height: 0, borderTop: "1px solid #aaa" }} />
      <Typography level="body-xs" sx={{ color: "#555" }}>Thin Line = Quarter Boundary (resets to 0)</Typography>
    </Box>
  </Box>
);

// ─── main component ───────────────────────────────────────────────────────────

const DomainTrendChart = ({ data, targets }) => {
  const chartRef      = useRef(null);
  const CustomTooltip = buildTooltip();

  const handleExport = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#ffffff", scale: 2, useCORS: true,
        allowTaint: false, logging: false,
      });
      const link = document.createElement("a");
      link.download = `domain-trends-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    } catch (err) {
      console.error("Chart export failed:", err);
    }
  };

  if (!data?.chart_data || !data?.chart_labels) {
    return (
      <Card sx={{ p: 3, mb: 3, textAlign: "center" }}>
        <Typography level="body-md" sx={{ color: "#999" }}>No domain data available</Typography>
      </Card>
    );
  }

  const { enhanced, violationMap, seasonBands, currentSeasonKey } =
    computeSeasonalData(data.chart_labels, data.chart_data, targets);

  const hasDomainTargets = targets?.has_domain_targets;

  // Cumulative running totals per season per domain.
  // Each season resets to zero — the line only ever rises within a season,
  // making it impossible to "decrease" within a season. The backend sends
  // monthly counts; we accumulate them here with pure JS arithmetic.
  // No backend or DB change required.
  const seasonRunning = {}; // seasonKey → { domainName → runningSum }

  const chartData = data.chart_labels.map((label, index) => {
    const point = { month: label };
    const en    = enhanced[label];
    const sk    = en?.seasonKey;

    // Reset accumulator at the start of each new season
    if (sk && !seasonRunning[sk]) {
      seasonRunning[sk] = {};
      data.chart_data.forEach((s) => { seasonRunning[sk][s.name] = 0; });
    }

    data.chart_data.forEach((s) => {
      if (sk) {
        seasonRunning[sk][s.name] += s.data[index] || 0;
        point[s.name] = seasonRunning[sk][s.name]; // cumulative within season
      } else {
        point[s.name] = s.data[index] || 0;        // fallback: monthly count
      }
      point[`${s.name}_target`] = en?.targetCases[s.name] ?? null;
    });

    if (en) {
      point._seasonTotal     = en.seasonTotal;
      point._seasonKey       = sk;
      point._isCurrentSeason = sk === currentSeasonKey;
    }
    return point;
  });

  // Violation months — completed vs in-progress current season
  const violationMonths   = new Set();
  const currentViolMonths = new Set();
  data.chart_labels.forEach((label) => {
    const v = violationMap.get(label);
    if (v?.size) {
      if (enhanced[label]?.seasonKey === currentSeasonKey) currentViolMonths.add(label);
      else violationMonths.add(label);
    }
  });

  // Right-edge label Y-position = last visible season's target for each domain
  const lastLabel         = data.chart_labels[data.chart_labels.length - 1];
  const lastSeasonTargets = enhanced[lastLabel]?.targetCases || {};

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <Button variant="outlined" color="neutral" size="sm"
          startDecorator={<DownloadIcon />} onClick={handleExport}>
          Download
        </Button>
      </Box>

      <DomainStatusRow chartDataSeries={data.chart_data} targets={targets} />

      <Box ref={chartRef} sx={{ width: "100%", height: 420 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 110, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="month" stroke="#666"
              style={{ fontSize: "11px", fontWeight: 600 }}
              angle={-45} textAnchor="end" height={80}
            />
            <YAxis stroke="#666" style={{ fontSize: "12px", fontWeight: 600 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "12px", fontWeight: 600 }} />

            {/* ── Layer 1: alternating season background tints ── */}
            {seasonBands.map((band) => (
              <ReferenceArea
                key={`tint-${band.seasonKey}`}
                x1={band.x1} x2={band.x2}
                fill={band.quarter % 2 !== 0 ? SEASON_TINT.odd : SEASON_TINT.even}
                strokeOpacity={0}
                ifOverflow="visible"
                label={{
                  value: band.label,
                  position: "insideTop",
                  fontSize: 10,
                  fill: "#888",
                  fontWeight: 600,
                }}
              />
            ))}

            {/* ── Layer 2: full-height rectangular violation shading ── */}
            {/* Rectangular columns — full chart height, NOT curve-shaped.
                Mark the TIME PERIOD of violation, not the severity magnitude.
                Current season uses a lighter tint (provisional data);
                completed seasons use a stronger red. */}
            {Array.from(violationMonths).map((month) => (
              <ReferenceArea
                key={`v-${month}`}
                x1={month} x2={month}
                fill="rgba(220, 38, 38, 0.22)"
                strokeOpacity={0}
                ifOverflow="visible"
              />
            ))}
            {Array.from(currentViolMonths).map((month) => (
              <ReferenceArea
                key={`cv-${month}`}
                x1={month} x2={month}
                fill="rgba(220, 38, 38, 0.14)"
                strokeOpacity={0}
                ifOverflow="visible"
              />
            ))}

            {/* ── Layer 3: thin light quarter boundary separators ── */}
            {seasonBands.slice(1).map((band) => (
              <ReferenceLine
                key={`sep-${band.seasonKey}`}
                x={band.x1}
                stroke="#cccccc"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            ))}

            {/* ── Layer 4: step-function seasonal target lines (color-matched, dashed) ── */}
            {hasDomainTargets && data.chart_data.map((series) => {
              const tPct = targets[TARGET_KEY[series.name]];
              if (tPct == null) return null;
              return (
                <Line
                  key={`tgt-${series.name}`}
                  type="linear"
                  dataKey={`${series.name}_target`}
                  stroke={series.color}
                  strokeWidth={1.5}
                  strokeDasharray="6 3"
                  dot={false}
                  activeDot={false}
                  name={`${series.name} (${tPct}% limit)`}
                  legendType="plainline"
                />
              );
            })}

            {/* ── Layer 5: right-edge labels for target lines ──
                Transparent ReferenceLine at each domain's last-season
                target Y-value, used only to anchor the text label. */}
            {hasDomainTargets && data.chart_data.map((series) => {
              const tPct  = targets[TARGET_KEY[series.name]];
              const yPos  = lastSeasonTargets[series.name];
              if (tPct == null || yPos == null) return null;
              return (
                <ReferenceLine
                  key={`lbl-${series.name}`}
                  y={yPos}
                  stroke="transparent"
                  label={{
                    value: `${series.name} Target: ${tPct}%`,
                    position: "right",
                    fontSize: 10,
                    fill: series.color,
                    fontWeight: 600,
                  }}
                />
              );
            })}

            {/* ── Layer 6: actual domain trend lines with violation dots ── */}
            {data.chart_data.map((series) => (
              <Line
                key={series.name}
                type="monotone"
                dataKey={series.name}
                stroke={series.color}
                strokeWidth={3}
                dot={makeDot(series.color, violationMap, currentSeasonKey)}
                activeDot={{ r: 9 }}
                name={series.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <ChartLegendNote hasDomainTargets={hasDomainTargets} />
    </Card>
  );
};

export default DomainTrendChart;
