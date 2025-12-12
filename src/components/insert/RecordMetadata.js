// src/components/insert/RecordMetadata.js
import React from "react";
import { Card, Typography, FormControl, FormLabel, Input, Select, Option, Grid } from "@mui/joy";
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

        {/* Issuing Department */}
        <Grid xs={12} sm={6} md={3}>
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

        {/* Target Department */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🎯 Target Department
            </FormLabel>
            <Select
              value={formData.target_department_id || ""}
              onChange={(e, value) => onInputChange("target_department_id", value)}
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
      </Grid>

      <Typography
        level="body-xs"
        sx={{
          mt: 2,
          color: "#1565c0",
          fontStyle: "italic",
        }}
      >
        ℹ️ Source field uses Arabic labels (جولات, حضور, خط ساخن, etc.). Departments can be fetched from API.
      </Typography>
    </Card>
  );
};

export default RecordMetadata;

