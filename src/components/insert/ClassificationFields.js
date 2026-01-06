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

const ClassificationFields = ({
  formData,
  onInputChange,
  referenceData,
  categories,
  subcategories,
  classifications,
  errorField,
}) => {
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
              sx={{
                borderColor: errorField === "domain_id" ? "#ff4757" : undefined,
              }}
            >
              {referenceData?.domains && Array.isArray(referenceData.domains) && referenceData.domains.map((opt) => {
                console.log("Domain option FULL:", JSON.stringify(opt, null, 2));
                const displayName = opt.name || opt.label || opt.domain_name || opt.name_en || opt.name_ar || opt.domain_name_en || opt.domain_name_ar;
                console.log("Domain display name:", displayName, "for ID:", opt.id);
                return (
                  <Option key={opt.id} value={opt.id}>
                    {displayName || `Domain ${opt.id}`}
                  </Option>
                );
              })}
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
              disabled={!formData.domain_id || !Array.isArray(categories) || categories.length === 0}
              onClose={() => {}}
              onBlur={() => {}}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: 'auto' }
                }
              }}
              sx={{
                borderColor: errorField === "category_id" ? "#ff4757" : undefined,
              }}
            >
              {Array.isArray(categories) && categories.map((opt) => {
                console.log("Category option FULL:", JSON.stringify(opt, null, 2));
                const displayName = opt.name || opt.label || opt.category_name || opt.name_en || opt.name_ar || opt.category_name_en || opt.category_name_ar;
                console.log("Category display name:", displayName, "for ID:", opt.id);
                return (
                  <Option key={opt.id} value={opt.id}>
                    {displayName || `Category ${opt.id}`}
                  </Option>
                );
              })}
            </Select>
          </FormControl>
        </Grid>

        {/* Subcategory */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              📑 Sub-Category
            </FormLabel>
            <Select
              value={formData.subcategory_id || ""}
              onChange={(e, value) => onInputChange("subcategory_id", value)}
              placeholder="Select Sub-Category"
              disabled={!formData.category_id || !Array.isArray(subcategories) || subcategories.length === 0}
              onClose={() => {}}
              onBlur={() => {}}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: 'auto' }
                }
              }}
            >
              {Array.isArray(subcategories) && subcategories.map((opt) => {
                console.log("Subcategory option FULL:", JSON.stringify(opt, null, 2));
                const displayName = opt.name || opt.label || opt.subcategory_name || opt.name_en || opt.name_ar || opt.subcategory_name_en || opt.subcategory_name_ar;
                console.log("Subcategory display name:", displayName, "for ID:", opt.id);
                return (
                  <Option key={opt.id} value={opt.id}>
                    {displayName || `Subcategory ${opt.id}`}
                  </Option>
                );
              })}
            </Select>
          </FormControl>
        </Grid>

        {/* Classification */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🏷️ Classification
            </FormLabel>
            <Select
              value={formData.classification_id || ""}
              onChange={(e, value) => onInputChange("classification_id", value)}
              placeholder="Select Classification"
              disabled={!formData.subcategory_id || !Array.isArray(classifications) || classifications.length === 0}
              onClose={() => {}}
              onBlur={() => {}}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: 'auto' }
                }
              }}
            >
              {Array.isArray(classifications) && classifications.map((opt) => {
                console.log("Classification option FULL:", JSON.stringify(opt, null, 2));
                const displayName = opt.name || opt.label || opt.classification_name || opt.name_en || opt.name_ar || opt.classification_name_en || opt.classification_name_ar;
                console.log("Classification display name:", displayName, "for ID:", opt.id);
                return (
                  <Option key={opt.id} value={opt.id}>
                    {displayName || `Classification ${opt.id}`}
                  </Option>
                );
              })}
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
              sx={{
                borderColor: errorField === "severity_id" ? "#ff4757" : undefined,
              }}
            >
              {referenceData?.severity && Array.isArray(referenceData.severity) && referenceData.severity.map((opt) => {
                const displayName = opt.name || opt.label || opt.severity_name || opt.level_name || opt.name_en || opt.name_ar || `Severity ${opt.id}`;
                return (
                  <Option key={opt.id} value={opt.id}>
                    {displayName}
                  </Option>
                );
              })}
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
              {referenceData?.stages && Array.isArray(referenceData.stages) && referenceData.stages.map((opt) => {
                const displayName = opt.name || opt.label || opt.stage_name || opt.name_en || opt.name_ar || `Stage ${opt.id}`;
                return (
                  <Option key={opt.id} value={opt.id}>
                    {displayName}
                  </Option>
                );
              })}
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
              {referenceData?.harm && Array.isArray(referenceData.harm) && referenceData.harm.map((opt) => {
                const displayName = opt.name || opt.label || opt.harm_name || opt.level_name || opt.name_en || opt.name_ar || `Harm ${opt.id}`;
                return (
                  <Option key={opt.id} value={opt.id}>
                    {displayName}
                  </Option>
                );
              })}
            </Select>
          </FormControl>
        </Grid>

        {/* Feedback Intent Type */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              💬 Feedback Intent Type *
            </FormLabel>
            <Select
              value={formData.feedback_intent_type_id || ""}
              onChange={(e, value) => onInputChange("feedback_intent_type_id", value)}
              placeholder="Select Intent Type"
              onClose={() => {}}
              onBlur={() => {}}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: 'auto' }
                }
              }}
              sx={{
                borderColor: errorField === "feedback_intent_type_id" ? "#ff4757" : undefined,
              }}
            >
              {Array.isArray(referenceData?.feedback_intent_types) && referenceData.feedback_intent_types.map((type) => {
                const displayName = type.name || type.name_en || type.name_ar || `Type ${type.id}`;
                return (
                  <Option key={type.id} value={type.id}>
                    {displayName}
                  </Option>
                );
              })}
            </Select>
          </FormControl>
        </Grid>

        {/* Clinical Risk Type */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              ⚕️ Clinical Risk Type *
            </FormLabel>
            <Select
              value={formData.clinical_risk_type_id || ""}
              onChange={(e, value) => onInputChange("clinical_risk_type_id", value)}
              placeholder="Select Risk Type"
              onClose={() => {}}
              onBlur={() => {}}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: 'auto' }
                }
              }}
              sx={{
                borderColor: errorField === "clinical_risk_type_id" ? "#ff4757" : undefined,
              }}
            >
              {Array.isArray(referenceData?.clinical_risk_types) && referenceData.clinical_risk_types.map((type) => {
                const displayName = type.name || type.name_ar || `Type ${type.id}`;
                return (
                  <Option key={type.id} value={type.id}>
                    {displayName}
                  </Option>
                );
              })}
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
