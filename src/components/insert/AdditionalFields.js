// src/components/insert/AdditionalFields.js
import React from "react";
import { Card, Typography, FormControl, FormLabel, Select, Option, Grid } from "@mui/joy";
import {
  SEVERITY_OPTIONS,
  STAGE_OPTIONS,
  HARM_OPTIONS
} from "../../utils/fieldMappings";

const AdditionalFields = ({ formData, onInputChange }) => {
  const improvementTypes = [
    { id: 1, label: "Yes" },
    { id: 0, label: "No" }
  ];

  return (
    <Card
      sx={{
        mb: 3,
        p: 3,
        background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
        border: "2px solid #9c27b0",
        boxShadow: "0 4px 12px rgba(156, 39, 176, 0.1)",
      }}
    >
      <Typography level="h3" sx={{ color: "#6a1b9a", fontWeight: 700, mb: 2 }}>
        Step 5: Severity, Stage, Harm & Improvement
      </Typography>

      <Typography level="body-sm" sx={{ color: "#6a1b9a", mb: 2 }}>
        Define the severity, stage, harm level, and improvement opportunity for this incident.
      </Typography>

      <Grid container spacing={2}>
        {/* Severity */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              ⚠️ Severity *
            </FormLabel>
            <Select
              value={formData.severity_id || ""}
              onChange={(e, value) => onInputChange("severity_id", value)}
              placeholder="Select Severity"
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <Option key={opt.id} value={opt.id}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Stage */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              📍 Stage *
            </FormLabel>
            <Select
              value={formData.stage_id || ""}
              onChange={(e, value) => onInputChange("stage_id", value)}
              placeholder="Select Stage"
            >
              {STAGE_OPTIONS.map((opt) => (
                <Option key={opt.id} value={opt.id}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Harm Level */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🩹 Harm Level *
            </FormLabel>
            <Select
              value={formData.harm_id || ""}
              onChange={(e, value) => onInputChange("harm_id", value)}
              placeholder="Select Harm Level"
            >
              {HARM_OPTIONS.map((opt) => (
                <Option key={opt.id} value={opt.id}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Improvement Type */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              💡 Improvement Opportunity
            </FormLabel>
            <Select
              value={formData.improvement_type || 0}
              onChange={(e, value) => onInputChange("improvement_type", value)}
            >
              {improvementTypes.map((opt) => (
                <Option key={opt.id} value={opt.id}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Typography
        level="body-xs"
        sx={{
          mt: 2,
          color: "#6a1b9a",
          fontStyle: "italic",
        }}
      >
        ℹ️ These attributes help categorize the incident impact and identify improvement opportunities.
      </Typography>
    </Card>
  );
};

export default AdditionalFields;
