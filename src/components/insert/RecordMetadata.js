// src/components/insert/RecordMetadata.js
import React from "react";
import { Card, Typography, FormControl, FormLabel, Input, Select, Option, Grid, Chip, Box, RadioGroup, Radio } from "@mui/joy";
import CloseIcon from "@mui/icons-material/Close";
import { SOURCE_OPTIONS } from "../../utils/fieldMappings";

const RecordMetadata = ({ formData, onInputChange }) => {
  // Mock department data - replace with actual department fetching in production
  const departments = [
    { id: 1, name: "ER" },
    { id: 2, name: "ICU" },
    { id: 3, name: "Ward 1" },
    { id: 4, name: "Ward 2" },
    { id: 5, name: "Cardiac 1" },
    { id: 6, name: "Cardiac 2" },
    { id: 7, name: "CCU" },
    { id: 8, name: "CSU" },
    { id: 9, name: "Radiology" },
  ];

  // Worker types
  const workerTypes = [
    { id: 1, name: "Doctor", nameAr: "طبيب" },
    { id: 2, name: "Nurse", nameAr: "ممرض/ممرضة" },
    { id: 3, name: "Clerk", nameAr: "موظف إداري" },
    { id: 4, name: "Technician", nameAr: "فني" },
    { id: 5, name: "Pharmacist", nameAr: "صيدلي" },
    { id: 6, name: "Other", nameAr: "أخرى" },
  ];

  // Handle adding a target department
  const handleAddTargetDepartment = (deptId) => {
    if (!formData.target_department_ids.includes(deptId)) {
      onInputChange("target_department_ids", [...formData.target_department_ids, deptId]);
    }
  };

  // Handle removing a target department
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
        {/* Feedback Received Date */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              📅 Feedback Received Date *
            </FormLabel>
            <Input
              type="date"
              value={formData.feedback_received_date || ""}
              onChange={(e) => onInputChange("feedback_received_date", e.target.value)}
              slotProps={{
                input: { style: { borderRadius: "8px" } },
              }}
            />
          </FormControl>
        </Grid>

        {/* Source */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              📱 Source *
            </FormLabel>
            <Select
              value={formData.source_id || ""}
              onChange={(e, value) => onInputChange("source_id", value)}
              placeholder="Select Source"
              onClose={() => {}}
              onBlur={() => {}}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: 'auto' }
                }
              }}
            >
              {SOURCE_OPTIONS.map((opt) => (
                <Option key={opt.id} value={opt.id}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* In/Out */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🚪 In/Out *
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

        {/* Worker Type */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              👔 Worker Type
            </FormLabel>
            <Select
              value={formData.worker_type || ""}
              onChange={(e, value) => onInputChange("worker_type", value)}
              placeholder="Select Type"
              onClose={() => {}}
              onBlur={() => {}}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: 'auto' }
                }
              }}
            >
              {workerTypes.map((type) => (
                <Option key={type.id} value={type.id}>
                  {type.name} ({type.nameAr})
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Issuing Department */}
        <Grid xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🏥 Issuing Department
            </FormLabel>
            <Select
              value={formData.issuing_department_id || ""}
              onChange={(e, value) => onInputChange("issuing_department_id", value)}
              placeholder="Select Department"
              onClose={() => {}}
              onBlur={() => {}}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: 'auto' }
                }
              }}
            >
              {departments.map((d) => (
                <Option key={d.id} value={d.id}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Target Departments (Multiple) */}
        <Grid xs={12} sm={6} md={8}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🎯 Target Departments (Multiple)
            </FormLabel>
            <Select
              value=""
              onChange={(e, value) => {
                if (value) handleAddTargetDepartment(value);
              }}
              placeholder="Click to add departments..."
              onClose={() => {}}
              onBlur={() => {}}
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: 'auto' }
                }
              }}
            >
              {departments
                .filter((d) => !formData.target_department_ids.includes(d.id))
                .map((d) => (
                  <Option key={d.id} value={d.id}>
                    {d.name}
                  </Option>
                ))}
            </Select>
            
            {/* Display selected departments as chips */}
            {formData.target_department_ids && formData.target_department_ids.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                {formData.target_department_ids.map((deptId) => {
                  const dept = departments.find((d) => d.id === deptId);
                  return (
                    <Chip
                      key={deptId}
                      variant="soft"
                      color="primary"
                      endDecorator={
                        <CloseIcon
                          sx={{ fontSize: 16, cursor: "pointer" }}
                          onClick={() => handleRemoveTargetDepartment(deptId)}
                        />
                      }
                      sx={{ fontWeight: 600 }}
                    >
                      {dept?.name || deptId}
                    </Chip>
                  );
                })}
              </Box>
            )}
          </FormControl>
        </Grid>
      </Grid>

      <Typography
        level="body-xs"
        sx={{
          mt: 2,
          color: "#1565c0",
          fontStyle: "italic",
        }}
      >
        ℹ️ You can select multiple target departments. NER extraction will suggest departments from the complaint text.
      </Typography>
    </Card>
  );
};

export default RecordMetadata;

