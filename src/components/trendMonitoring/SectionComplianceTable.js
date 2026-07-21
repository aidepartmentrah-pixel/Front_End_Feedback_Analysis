// src/components/trendMonitoring/SectionComplianceTable.js
import React, { useState } from "react";
import { Card, Typography, Box, Table, Sheet, Button, Chip } from "@mui/joy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  Violation: { color: "danger",  label: "Violation" },
  Compliant: { color: "success", label: "Compliant" },
};

// Status priority for default sort order
const STATUS_ORDER = { Violation: 0, Compliant: 1 };

// ── ActualVsTarget cell ───────────────────────────────────────────────────────

const AVT = ({ actual, target, violated }) => (
  <Box sx={{ textAlign: "center" }}>
    <Typography
      level="body-sm"
      sx={{ fontWeight: 700, color: violated ? "danger.600" : "inherit" }}
    >
      {actual}
    </Typography>
    {target !== null && target !== undefined && (
      <Typography level="body-xs" sx={{ color: "#999" }}>
        / {target}
      </Typography>
    )}
  </Box>
);

// ── Main component ────────────────────────────────────────────────────────────

const SectionComplianceTable = ({ data, scope, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!data?.rows?.length) {
    return (
      <Card sx={{ p: 3, mb: 3, textAlign: "center" }}>
        <Typography level="body-md" sx={{ color: "#999" }}>
          {data?.has_policy === false
            ? "No policy targets configured for this scope."
            : "No classification data found for the selected period."}
        </Typography>
      </Card>
    );
  }

  // Sort: violations first, then by total actual descending
  const sorted = [...data.rows].sort((a, b) => {
    const sp = (STATUS_ORDER[a.compliance_status] ?? 4) - (STATUS_ORDER[b.compliance_status] ?? 4);
    return sp !== 0 ? sp : b.total_actual - a.total_actual;
  });

  const violatingCount = sorted.filter(
    (r) => r.compliance_status !== "Compliant"
  ).length;

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography level="title-sm" sx={{ fontWeight: 700, color: "#888" }}>
            Full Compliance Table <Typography level="body-xs" sx={{ color: "#aaa" }}>(authoritative detail view)</Typography>
          </Typography>
          {violatingCount > 0 && (
            <Typography level="body-xs" sx={{ color: "danger.600", mt: 0.25 }}>
              {violatingCount} classification{violatingCount > 1 ? "s" : ""} exceeding targets
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          color="neutral"
          size="sm"
          endDecorator={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Hide" : "Show"}
        </Button>
      </Box>

      {isExpanded && (
        <Sheet sx={{ borderRadius: "8px", border: "2px solid rgba(102,126,234,0.2)", overflow: "hidden" }}>
          <Box sx={{ overflowX: "auto" }}>
            <Table
              sx={{
                "--TableCell-paddingY": "10px",
                "--TableCell-paddingX": "12px",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr style={{ background: "rgba(102,126,234,0.08)" }}>
                  <th style={{ fontWeight: 700, minWidth: 180 }}>Classification</th>
                  <th style={{ textAlign: "center", fontWeight: 700, width: 90 }}>
                    Low<br />
                    <span style={{ fontSize: "10px", fontWeight: 400, color: "#888" }}>actual / target</span>
                  </th>
                  <th style={{ textAlign: "center", fontWeight: 700, width: 90 }}>
                    Medium<br />
                    <span style={{ fontSize: "10px", fontWeight: 400, color: "#888" }}>actual / target</span>
                  </th>
                  <th style={{ textAlign: "center", fontWeight: 700, width: 90 }}>
                    High<br />
                    <span style={{ fontSize: "10px", fontWeight: 400, color: "#888" }}>actual / target</span>
                  </th>
                  <th style={{ textAlign: "center", fontWeight: 700, width: 110 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, idx) => {
                  const cfg = STATUS_CONFIG[row.compliance_status] || STATUS_CONFIG.Compliant;
                  const lowViolated    = row.low_target    != null && row.low_actual    > row.low_target;
                  const mediumViolated = row.medium_target != null && row.medium_actual > row.medium_target;
                  const highViolated   = row.high_target   != null && row.high_actual   > row.high_target;

                  return (
                    <tr key={idx} style={{
                      borderBottom: "1px solid #e0e0e0",
                      background: row.compliance_status === "Violation"
                        ? "rgba(220,38,38,0.04)"
                        : "transparent",
                    }}>
                      <td>
                        <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                          {row.classification_name_en || row.classification_name || `Classification ${row.classification_id}`}
                        </Typography>
                        {row.classification_name && row.classification_name_en && row.classification_name !== row.classification_name_en && (
                          <Typography level="body-xs" sx={{ color: "#999", direction: "rtl" }}>
                            {row.classification_name}
                          </Typography>
                        )}
                      </td>
                      <td>
                        <AVT actual={row.low_actual}  target={row.low_target}  violated={lowViolated}  />
                      </td>
                      <td>
                        <AVT actual={row.medium_actual} target={row.medium_target} violated={mediumViolated} />
                      </td>
                      <td>
                        <AVT actual={row.high_actual}   target={row.high_target}   violated={highViolated}   />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <Chip color={cfg.color} size="sm" variant="solid">
                          {cfg.label}
                        </Chip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Box>
        </Sheet>
      )}
    </Card>
  );
};

export default SectionComplianceTable;
