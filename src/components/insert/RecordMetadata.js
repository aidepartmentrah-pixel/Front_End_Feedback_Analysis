// src/components/insert/RecordMetadata.js
import React from "react";
import { Box, Card, Typography, FormControl, FormLabel, Input, Select, Option, Grid } from "@mui/joy";

const RecordMetadata = ({ formData, onInputChange }) => {
  const issuingDepts = ["ER", "ICU", "Ward 1", "Ward 2", "Cardiac 1", "Cardiac 2", "CCU", "CSU"];
  const targetDepts = ["ER", "ICU", "Ward 1", "Ward 2", "Cardiac 1", "Cardiac 2", "CCU", "CSU", "Radiology"];
  const sources = ["Phone", "Walk-in", "Email", "Online Form", "SMS", "Letter"];
  const statuses = ["In Progress", "Closed", "Pending"];

  return (
    <Card
      sx={{
        mb: 3,
        p: 3,
        background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
        border: "1px solid rgba(102, 126, 234, 0.1)",
        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.08)",
      }}
    >
      <Typography level="h3" sx={{ color: "#1a1e3f", fontWeight: 700, mb: 2 }}>
        Step 2: Record Metadata
      </Typography>

      <Grid container spacing={2}>
        {/* Feedback Received Date */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              📅 Feedback Received Date
            </FormLabel>
            <Input
              type="date"
              value={formData.feedbackReceivedDate}
              onChange={(e) => onInputChange("feedbackReceivedDate", e.target.value)}
              slotProps={{
                input: { style: { borderRadius: "8px" } },
              }}
            />
          </FormControl>
        </Grid>

        {/* Issuing Department */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🏥 Issuing Department
            </FormLabel>
            <Select
              value={formData.issuingDepartment}
              onChange={(e, value) => onInputChange("issuingDepartment", value)}
            >
              {issuingDepts.map((d) => (
                <Option key={d} value={d}>
                  {d}
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
              value={formData.targetDepartment}
              onChange={(e, value) => onInputChange("targetDepartment", value)}
            >
              {targetDepts.map((d) => (
                <Option key={d} value={d}>
                  {d}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Source */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              📱 Source
            </FormLabel>
            <Select
              value={formData.source}
              onChange={(e, value) => onInputChange("source", value)}
            >
              {sources.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Status */}
        <Grid xs={12} sm={6}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              ✅ Status
            </FormLabel>
            <Select
              value={formData.status}
              onChange={(e, value) => onInputChange("status", value)}
            >
              {statuses.map((s) => (
                <Option key={s} value={s}>
                  {s}
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
          color: "#999",
          fontStyle: "italic",
        }}
      >
        ℹ️ These fields contain the metadata for your record. All fields are required.
      </Typography>
    </Card>
  );
};

export default RecordMetadata;
