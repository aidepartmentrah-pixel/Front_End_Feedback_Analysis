// src/components/insert/RecordMetadata.js

import React, { useState, useMemo } from "react";
import {
  Card,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  Grid,
  Chip,
  Box,
  RadioGroup,
  Radio,
  ListItem,
  ListItemButton,
  Autocomplete,
  AutocompleteOption,
} from "@mui/joy";
import CloseIcon from "@mui/icons-material/Close";

const RecordMetadata = ({ formData, onInputChange, referenceData, errorField, validationErrors = {} }) => {
  // Memoize department options for Autocomplete
  const departmentOptions = useMemo(() => {
    return (referenceData?.departments || []).map((dept) => ({
      id: dept.id,
      label: dept.name || dept.label || dept.department_name || dept.name_en || dept.name_ar || `Department ${dept.id}`,
    }));
  }, [referenceData?.departments]);

  // Find selected issuing department option
  const selectedIssuingDept = useMemo(() => {
    if (!formData.issuing_department_id) return null;
    return departmentOptions.find(opt => Number(opt.id) === Number(formData.issuing_department_id)) || null;
  }, [formData.issuing_department_id, departmentOptions]);

  // Find selected target department options
  const selectedTargetDepts = useMemo(() => {
    if (!formData.target_department_ids || formData.target_department_ids.length === 0) return [];
    return departmentOptions.filter(opt => 
      formData.target_department_ids.some(id => Number(id) === Number(opt.id))
    );
  }, [formData.target_department_ids, departmentOptions]);

  // Add department
  const handleAddTargetDepartment = (deptId) => {
    if (!formData.target_department_ids.includes(deptId)) {
      onInputChange("target_department_ids", [
        ...formData.target_department_ids,
        deptId,
      ]);
    }
  };

  // Remove department
  const handleRemoveTargetDepartment = (deptId) => {
    onInputChange(
      "target_department_ids",
      formData.target_department_ids.filter((id) => id !== deptId)
    );
  };

  return (
    <Card
      sx={{
        mb: 3,
        p: 3,
        background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
        border: "2px solid #2196f3",
        boxShadow: "0 4px 12px rgba(33, 150, 243, 0.1)",
      }}
    >
      <Typography level="h3" sx={{ color: "#0d47a1", fontWeight: 700, mb: 2 }}>
        Step 2: Metadata (Date, Source, Departments)
      </Typography>

      <Typography level="body-sm" sx={{ color: "#1565c0", mb: 2 }}>
        Provide administrative details about the feedback record.
      </Typography>

      <Grid container spacing={2}>
        {/* ROW 1: Date, Source, Patient Type, Building (4 fields × 3 cols = 12) */}
        
        {/* Feedback Date */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth error={!!validationErrors.feedback_received_date}>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              📅 Feedback Received Date *
            </FormLabel>
            <Input
              type="date"
              value={formData.feedback_received_date || ""}
              onChange={(e) =>
                onInputChange("feedback_received_date", e.target.value)
              }
              sx={{
                borderColor:
                  validationErrors.feedback_received_date || errorField === "feedback_received_date"
                    ? "#ff4757"
                    : undefined,
              }}
            />
            {validationErrors.feedback_received_date && (
              <Typography level="body-xs" sx={{ color: "#ff4757", mt: 0.5 }}>
                {validationErrors.feedback_received_date}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Source */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth error={!!validationErrors.source_id}>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              📱 Source *
            </FormLabel>
            <Select
              value={formData.source_id || ""}
              onChange={(e, value) => onInputChange("source_id", value)}
              placeholder="Select Source"
              slotProps={{
                listbox: { sx: { maxHeight: 250, overflowY: "auto" } },
              }}
              sx={{
                borderColor:
                  validationErrors.source_id || errorField === "source_id"
                    ? "#ff4757"
                    : undefined,
              }}
            >
              {(referenceData?.sources || []).map((opt) => {
                const displayName =
                  opt.name ||
                  opt.label ||
                  opt.source_name ||
                  opt.name_en ||
                  opt.name_ar ||
                  opt.source_name_en ||
                  opt.source_name_ar;

                return (
                  <Option key={opt.id} value={opt.id}>
                    {displayName || `Source ${opt.id}`}
                  </Option>
                );
              })}
            </Select>
            {validationErrors.source_id && (
              <Typography level="body-xs" sx={{ color: "#ff4757", mt: 0.5 }}>
                {validationErrors.source_id}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Inpatient / Outpatient */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth error={!!validationErrors.is_inpatient}>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🚪 Patient Type *
            </FormLabel>
            <RadioGroup
              value={formData.is_inpatient === true ? "inpatient" : formData.is_inpatient === false ? "outpatient" : ""}
              onChange={(e) => onInputChange("is_inpatient", e.target.value === "inpatient" ? true : false)}
              orientation="horizontal"
              sx={{ gap: 2, mt: 0.5 }}
            >
              <Radio value="inpatient" label="Inpatient" size="sm" />
              <Radio value="outpatient" label="Outpatient" size="sm" />
            </RadioGroup>
            {validationErrors.is_inpatient && (
              <Typography level="body-xs" sx={{ color: "#ff4757", mt: 0.5 }}>
                {validationErrors.is_inpatient}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Building */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth error={!!validationErrors.building}>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🏢 Building *
            </FormLabel>
            <Select
              value={formData.building || ""}
              onChange={(e, value) => onInputChange("building", value)}
              placeholder="Select Building"
              slotProps={{
                listbox: { sx: { maxHeight: 250, overflowY: "auto" } },
              }}
              sx={{
                borderColor:
                  validationErrors.building || errorField === "building"
                    ? "#ff4757"
                    : undefined,
              }}
            >
              <Option value="RAH">RAH</Option>
              <Option value="BIC">BIC</Option>
            </Select>
            {validationErrors.building && (
              <Typography level="body-xs" sx={{ color: "#ff4757", mt: 0.5 }}>
                {validationErrors.building}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* ROW 2: Issuing Department, Requires Explanation (6 + 6 = 12) */}
        
        {/* Issuing Department (Single Select with Search) */}
        <Grid xs={12} sm={6} md={6}>
          <FormControl fullWidth error={!!validationErrors.issuing_org_unit_id}>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🏢 Issuing Department *
            </FormLabel>
            <Autocomplete
              value={selectedIssuingDept}
              options={departmentOptions}
              getOptionLabel={(option) => option?.label || ""}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              placeholder="Search or select issuing department..."
              onChange={(e, newValue) => {
                onInputChange("issuing_department_id", newValue ? newValue.id : null);
              }}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 300, overflowY: "auto" },
                },
              }}
              sx={{
                borderColor:
                  validationErrors.issuing_org_unit_id || errorField === "issuing_department_id"
                    ? "#ff4757"
                    : undefined,
              }}
              renderOption={(props, option) => (
                <AutocompleteOption {...props} key={option.id}>
                  {option.label}
                </AutocompleteOption>
              )}
            />
            {validationErrors.issuing_org_unit_id && (
              <Typography level="body-xs" sx={{ color: "#ff4757", mt: 0.5 }}>
                {validationErrors.issuing_org_unit_id}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Requires Explanation */}
        <Grid xs={12} sm={6} md={6}>
          <FormControl fullWidth error={!!validationErrors.requires_explanation}>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              📝 Requires Explanation? *
            </FormLabel>
            <RadioGroup
              value={formData.requires_explanation === true ? "yes" : formData.requires_explanation === false ? "no" : ""}
              onChange={(e) => {
                const boolValue = e.target.value === "yes";
                console.log("🔘 Requires Explanation changed to:", e.target.value, "→ boolean:", boolValue);
                onInputChange("requires_explanation", boolValue);
              }}
              orientation="horizontal"
              sx={{ gap: 2, mt: 0.5 }}
            >
              <Radio value="yes" label="Yes" size="sm" />
              <Radio value="no" label="No" size="sm" />
            </RadioGroup>
            {validationErrors.requires_explanation && (
              <Typography level="body-xs" sx={{ color: "#ff4757", mt: 0.5 }}>
                {validationErrors.requires_explanation}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* ROW 3: Target Departments (Full Width) */}
        
        {/* Target Departments (Multi-Select with Search) */}
        <Grid xs={12}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🏥 Target Departments (Multiple)
            </FormLabel>
            <Autocomplete
              multiple
              value={selectedTargetDepts}
              options={departmentOptions}
              getOptionLabel={(option) => option?.label || ""}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              placeholder="Search or select target departments..."
              onChange={(e, newValue) => {
                const ids = newValue.map(opt => opt.id);
                onInputChange("target_department_ids", ids);
              }}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 300, overflowY: "auto" },
                },
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.id}
                    variant="soft"
                    color="info"
                    endDecorator={
                      <CloseIcon
                        sx={{ 
                          fontSize: 16, 
                          cursor: "pointer", 
                          ml: 0.5, 
                          '&:hover': { color: "error.main" }
                        }}
                        onClick={() => {
                          const newIds = (formData.target_department_ids || []).filter(id => Number(id) !== Number(option.id));
                          onInputChange("target_department_ids", newIds);
                        }}
                      />
                    }
                    sx={{ fontWeight: 600 }}
                  >
                    {option.label}
                  </Chip>
                ))
              }
              renderOption={(props, option) => (
                <AutocompleteOption {...props} key={option.id}>
                  {option.label}
                </AutocompleteOption>
              )}
            />
          </FormControl>
        </Grid>
      </Grid>

      <Typography
        level="body-xs"
        sx={{ mt: 2, color: "#1565c0", fontStyle: "italic" }}
      >
        ℹ️ You can search and select multiple target departments. Type to filter.
      </Typography>
    </Card>
  );
};

export default RecordMetadata;
