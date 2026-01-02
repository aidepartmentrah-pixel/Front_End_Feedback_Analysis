// src/components/insert/RecordMetadata.js

import React from "react";
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
} from "@mui/joy";
import CloseIcon from "@mui/icons-material/Close";

const RecordMetadata = ({ formData, onInputChange, referenceData, errorField }) => {
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
        {/* Feedback Date */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
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
                  errorField === "feedback_received_date"
                    ? "#ff4757"
                    : undefined,
              }}
            />
          </FormControl>
        </Grid>

        {/* Source */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              📱 Source
            </FormLabel>

            <Select
              value={formData.source_id || ""}
              onChange={(e, value) => onInputChange("source_id", value)}
              placeholder="Select Source"
              slotProps={{
                listbox: { sx: { maxHeight: 250, overflowY: "auto" } },
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
          </FormControl>
        </Grid>

        {/* IN / OUT */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🚪 In / Out
            </FormLabel>

            <RadioGroup
              value={formData.in_out || ""}
              onChange={(e) => onInputChange("in_out", e.target.value)}
              orientation="horizontal"
              sx={{ gap: 2, mt: 0.5 }}
            >
              <Radio value="IN" label="IN" size="sm" />
              <Radio value="OUT" label="OUT" size="sm" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Building */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🏢 Building
            </FormLabel>

            <Select
              value={formData.building || ""}
              onChange={(e, value) => onInputChange("building", value)}
              placeholder="Select Building"
              slotProps={{
                listbox: { sx: { maxHeight: 250, overflowY: "auto" } },
              }}
            >
              <Option value="RAH">RAH</Option>
              <Option value="BIC">BIC</Option>
            </Select>
          </FormControl>
        </Grid>

        {/* Issuing Department (Single Select) */}
        <Grid xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🏢 Issuing Department
            </FormLabel>

            <Select
              value={formData.issuing_department_id || ""}
              placeholder="Select issuing department"
              onChange={(e, value) =>
                onInputChange("issuing_department_id", value)
              }
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: "auto" },
                },
              }}
            >
              {(referenceData?.departments || []).map((dept) => {
                const displayName =
                  dept.name ||
                  dept.label ||
                  dept.department_name ||
                  dept.name_en ||
                  dept.name_ar;

                return (
                  <Option key={dept.id} value={dept.id}>
                    {displayName}
                  </Option>
                );
              })}
            </Select>
          </FormControl>
        </Grid>




        {/* Target Departments (Multi-Select, Issuing Style) */}
        <Grid xs={12} sm={6} md={8}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🏥 Target Departments (Multiple)
            </FormLabel>
            <Select
              multiple
              value={formData.target_department_ids || []}
              placeholder="Select target departments"
              onChange={(e, value) => {
                const normalized = Array.isArray(value)
                  ? value
                      .map((v) => (typeof v === "object" ? (v?.value ?? v?.id) : v))
                      .map((v) => {
                        const num = Number(v);
                        return Number.isNaN(num) ? v : num;
                      })
                      .filter((v) => v !== null && v !== undefined)
                  : [];
                // Remove duplicates while preserving order
                const unique = [];
                for (const id of normalized) {
                  if (!unique.includes(id)) unique.push(id);
                }
                onInputChange("target_department_ids", unique);
              }}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {(formData.target_department_ids || []).map((deptId) => {
                    const dept = (referenceData?.departments || []).find((d) => Number(d.id) === Number(deptId));
                    const displayName =
                      dept?.name ||
                      dept?.label ||
                      dept?.department_name ||
                      dept?.name_en ||
                      dept?.name_ar ||
                      `Department ${deptId}`;
                    return (
                      <Chip
                        key={deptId}
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
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              const newIds = (formData.target_department_ids || []).filter(id => Number(id) !== Number(deptId));
                              onInputChange("target_department_ids", newIds);
                            }}
                          />
                        }
                        sx={{ 
                          fontWeight: 600,
                          pointerEvents: "none",
                          "& .MuiChip-endDecorator": {
                            pointerEvents: "auto"
                          }
                        }}
                      >
                        {displayName}
                      </Chip>
                    );
                  })}
                </Box>
              )}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: "auto" },
                },
              }}
            >
              {(referenceData?.departments || []).map((dept) => {
                const displayName =
                  dept.name ||
                  dept.label ||
                  dept.department_name ||
                  dept.name_en ||
                  dept.name_ar;
                return (
                  <Option key={dept.id} value={Number(dept.id)}>
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
        sx={{ mt: 2, color: "#1565c0", fontStyle: "italic" }}
      >
        ℹ️ You can select multiple target departments. NER extraction will suggest
        departments from the complaint text.
      </Typography>
    </Card>
  );
};

export default RecordMetadata;
