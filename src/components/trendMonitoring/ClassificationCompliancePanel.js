// src/components/trendMonitoring/ClassificationCompliancePanel.js
import React from "react";
import { Card, Typography } from "@mui/joy";
import SectionComplianceTable from "./SectionComplianceTable";
import SectionComplianceBubble from "./SectionComplianceBubble";

/**
 * Section Compliance Analysis module (HCAT Iteration 4, Session 3).
 *
 * Hospital scope (complaint administrator, supervisory view across all
 * sections) → Full Compliance Table — the authoritative detail view,
 *   not the bubble visualization.
 *
 * Section scope (the section's own admin, narrow scope, few classifications)
 *   → Bubble visualization only, scoped to that section's own data.
 *
 * Department / Administration scope never render this panel at all — they
 * gate on Domain Target Analysis only (handled by the parent page).
 */
const ClassificationCompliancePanel = ({ data, scope }) => {
  if (!data) return null;

  if (data.has_policy === false) {
    return (
      <Card sx={{ p: 3, mb: 3, textAlign: "center" }}>
        <Typography level="body-md" sx={{ color: "#999" }}>
          No section policy targets are configured.
        </Typography>
      </Card>
    );
  }

  if (scope === "section") {
    return <SectionComplianceBubble data={data} />;
  }

  // Hospital scope — Full Compliance Table
  if (!data.rows?.length) {
    return (
      <Card sx={{ p: 3, mb: 3, textAlign: "center" }}>
        <Typography level="body-md" sx={{ color: "#999" }}>
          No classification activity found for the selected period.
        </Typography>
      </Card>
    );
  }

  return <SectionComplianceTable data={data} scope={scope} defaultExpanded={true} />;
};

export default ClassificationCompliancePanel;
