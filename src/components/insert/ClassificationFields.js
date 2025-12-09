// src/components/insert/ClassificationFields.js
import React from "react";
import { Box, Card, Typography, FormControl, FormLabel, Input, Select, Option, Grid } from "@mui/joy";

const ClassificationFields = ({ formData, onInputChange }) => {
  const categories = ["Safety", "Quality", "Clinical", "Management", "Administrative"];
  const subCategories = ["Neglect - General", "Documentation", "Communication", "Billing", "Other"];
  const severities = ["Low", "Medium", "High"];
  const stages = ["Admission", "Care on the Ward", "Examination & Diagnosis", "Discharge"];
  const harmLevels = ["No Harm", "Minor Harm", "Moderate Harm", "High Harm"];
  const improvementTypes = ["Yes", "No"];

  return (
    <Card
      sx={{
        mb: 3,
        p: 3,
        background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
        border: "2px solid #ff9800",
        boxShadow: "0 4px 12px rgba(255, 152, 0, 0.1)",
      }}
    >
      <Typography level="h3" sx={{ color: "#e65100", fontWeight: 700, mb: 2 }}>
        Step 4: Classification & Categorization
      </Typography>

      <Typography level="body-sm" sx={{ color: "#e65100", mb: 2 }}>
        Classify your record by category, severity, stage, and other attributes. These fields can be auto-populated by the Extract button.
      </Typography>

      <Grid container spacing={2}>
        {/* Category */}
        <Grid xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              📂 Category
            </FormLabel>
            <Select
              value={formData.category}
              onChange={(e, value) => onInputChange("category", value)}
            >
              {categories.map((c) => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Sub-Category */}
        <Grid xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              📑 Sub-Category
            </FormLabel>
            <Select
              value={formData.subCategory}
              onChange={(e, value) => onInputChange("subCategory", value)}
            >
              {subCategories.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* New Classification */}
        <Grid xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🏷️ New Classification
            </FormLabel>
            <Input
              type="text"
              placeholder="e.g., Adverse Event, Near Miss..."
              value={formData.newClassification}
              onChange={(e) => onInputChange("newClassification", e.target.value)}
              slotProps={{
                input: { style: { borderRadius: "8px" } },
              }}
            />
          </FormControl>
        </Grid>

        {/* Severity */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              ⚠️ Severity
            </FormLabel>
            <Select
              value={formData.severity}
              onChange={(e, value) => onInputChange("severity", value)}
            >
              {severities.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Stage */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              📍 Stage
            </FormLabel>
            <Select
              value={formData.stage}
              onChange={(e, value) => onInputChange("stage", value)}
            >
              {stages.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Harm Level */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🩹 Harm Level
            </FormLabel>
            <Select
              value={formData.harm}
              onChange={(e, value) => onInputChange("harm", value)}
            >
              {harmLevels.map((h) => (
                <Option key={h} value={h}>
                  {h}
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
              value={formData.improvementType}
              onChange={(e, value) => onInputChange("improvementType", value)}
            >
              {improvementTypes.map((t) => (
                <Option key={t} value={t}>
                  {t}
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
          color: "#e65100",
          fontStyle: "italic",
        }}
      >
        🤖 Click "Extract" at the bottom to auto-populate these fields using AI analysis of your complaint text.
      </Typography>
    </Card>
  );
};

export default ClassificationFields;
