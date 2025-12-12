// src/components/insert/ClassificationFields.js
import React from "react";
import {
  Card,
  Typography,
  FormControl,
  FormLabel,
  Select,
  Option,
  Grid,
} from "@mui/joy";

import {
  DOMAIN_OPTIONS,
  CATEGORY_OPTIONS,
  SUBCATEGORY_OPTIONS,
  CLASSIFICATION_OPTIONS,
  SEVERITY_OPTIONS,
  STAGE_OPTIONS,
  HARM_OPTIONS,
} from "../../utils/fieldMappings";

const ClassificationFields = ({ formData, onInputChange }) => {
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
        Step 4: AI Classification & Severity Fields
      </Typography>

      <Typography level="body-sm" sx={{ color: "#e65100", mb: 2 }}>
        Classify your record starting from Domain → Category → Subcategory → Classification, then set Severity, Stage, Harm & Improvement.
      </Typography>

      <Grid container spacing={2}>

        {/* Domain */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🌐 Domain *
            </FormLabel>
            <Select
              value={formData.domain_id || ""}
              onChange={(e, value) => onInputChange("domain_id", value)}
              placeholder="Select Domain"
              onClose={() => {}}
              onBlur={() => {}}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: 'auto' }
                }
              }}
            >
              {DOMAIN_OPTIONS.map((opt) => (
                <Option key={opt.id} value={opt.id}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Category */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              📂 Category *
            </FormLabel>
            <Select
              value={formData.category_id || ""}
              onChange={(e, value) => onInputChange("category_id", value)}
              placeholder="Select Category"
              onClose={() => {}}
              onBlur={() => {}}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: 'auto' }
                }
              }}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <Option key={opt.id} value={opt.id}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Subcategory */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              📑 Sub-Category *
            </FormLabel>
            <Select
              value={formData.subcategory_id || ""}
              onChange={(e, value) => onInputChange("subcategory_id", value)}
              placeholder="Select Sub-Category"
              onClose={() => {}}
              onBlur={() => {}}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: 'auto' }
                }
              }}
            >
              {SUBCATEGORY_OPTIONS.map((opt) => (
                <Option key={opt.id} value={opt.id}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Classification */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🏷️ Classification *
            </FormLabel>
            <Select
              value={formData.classification_id || ""}
              onChange={(e, value) => onInputChange("classification_id", value)}
              placeholder="Select Classification"
              onClose={() => {}}
              onBlur={() => {}}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: 'auto' }
                }
              }}
            >
              {CLASSIFICATION_OPTIONS.map((opt) => (
                <Option key={opt.id} value={opt.id}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

      </Grid>

      {/* Severity, Stage, Harm, Improvement (formerly Step 5) */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
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
              onClose={() => {}}
              onBlur={() => {}}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: 'auto' }
                }
              }}
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
              onClose={() => {}}
              onBlur={() => {}}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: 'auto' }
                }
              }}
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
              onClose={() => {}}
              onBlur={() => {}}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: 'auto' }
                }
              }}
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
              onClose={() => {}}
              onBlur={() => {}}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: 'auto' }
                }
              }}
            >
              <Option value={1}>Yes</Option>
              <Option value={0}>No</Option>
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
        ℹ️ Complete all classification and severity fields. These help categorize incident impact and improvement opportunities.
      </Typography>
    </Card>
  );
};

export default ClassificationFields;
