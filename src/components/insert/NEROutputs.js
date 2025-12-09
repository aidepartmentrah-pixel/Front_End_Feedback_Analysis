// src/components/insert/NEROutputs.js
import React from "react";
import { Box, Card, Typography, FormControl, FormLabel, Input, Grid } from "@mui/joy";

const NEROutputs = ({ formData, onInputChange }) => {
  return (
    <Card
      sx={{
        mb: 3,
        p: 3,
        background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
        border: "2px solid #4caf50",
        boxShadow: "0 4px 12px rgba(76, 175, 80, 0.1)",
      }}
    >
      <Typography level="h3" sx={{ color: "#2d5016", fontWeight: 700, mb: 2 }}>
        Step 3: Extracted Named Entities (NER Results)
      </Typography>

      <Typography level="body-sm" sx={{ color: "#558b2f", mb: 2 }}>
        These fields were extracted from your complaint text. You can edit them if needed.
      </Typography>

      <Grid container spacing={2}>
        {/* Patient Name */}
        <Grid xs={12} sm={6}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              👤 Patient Name
            </FormLabel>
            <Input
              type="text"
              placeholder="Extracted patient name..."
              value={formData.patientName}
              onChange={(e) => onInputChange("patientName", e.target.value)}
              slotProps={{
                input: { style: { borderRadius: "8px" } },
              }}
            />
          </FormControl>
        </Grid>

        {/* Doctor Name */}
        <Grid xs={12} sm={6}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              👨‍⚕️ Doctor Name
            </FormLabel>
            <Input
              type="text"
              placeholder="Extracted doctor name..."
              value={formData.doctorName}
              onChange={(e) => onInputChange("doctorName", e.target.value)}
              slotProps={{
                input: { style: { borderRadius: "8px" } },
              }}
            />
          </FormControl>
        </Grid>

        {/* Other Entities */}
        <Grid xs={12}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              📋 Other Extracted Entities
            </FormLabel>
            <Input
              type="text"
              placeholder="Other extracted information..."
              value={formData.otherEntities}
              onChange={(e) => onInputChange("otherEntities", e.target.value)}
              slotProps={{
                input: { style: { borderRadius: "8px" } },
              }}
            />
          </FormControl>
        </Grid>
      </Grid>

      <Typography
        level="body-xs"
        sx={{
          mt: 2,
          color: "#558b2f",
          fontStyle: "italic",
        }}
      >
        ✏️ These fields are fully editable. The AI extracted these values, but you can correct them if needed.
      </Typography>
    </Card>
  );
};

export default NEROutputs;
