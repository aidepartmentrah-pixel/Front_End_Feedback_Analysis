// src/components/insert/NEROutputs.js
import React from "react";
import { Card, Typography, FormControl, FormLabel, Input, Grid, Button } from "@mui/joy";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const NEROutputs = ({ formData, onInputChange, onRunNER, loading }) => {
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
        Step 3: Named Entity Recognition (NER)
      </Typography>

      <Typography level="body-sm" sx={{ color: "#558b2f", mb: 2 }}>
        Extract patient and doctor names from the complaint text. Click "Run NER Extraction" or edit manually.
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
              placeholder="Enter or extract patient name..."
              value={formData.patient_name || ""}
              onChange={(e) => onInputChange("patient_name", e.target.value)}
              slotProps={{
                input: { 
                  style: { borderRadius: "8px" },
                  dir: "rtl"
                },
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
              placeholder="Enter or extract doctor name..."
              value={formData.doctor_name || ""}
              onChange={(e) => onInputChange("doctor_name", e.target.value)}
              slotProps={{
                input: { 
                  style: { borderRadius: "8px" },
                  dir: "rtl"
                },
              }}
            />
          </FormControl>
        </Grid>

        {/* Run NER Button */}
        <Grid xs={12}>
          <Button
            variant="solid"
            color="success"
            size="lg"
            startDecorator={<PlayArrowIcon />}
            onClick={onRunNER}
            loading={loading}
            disabled={!formData.complaint_text || formData.complaint_text.trim().length === 0}
            sx={{
              fontWeight: 600,
              fontSize: "14px",
              px: 3,
              py: 1.5,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
              },
            }}
          >
            {loading ? "Extracting Entities..." : "🤖 Run NER Extraction"}
          </Button>
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
        ✏️ These fields are editable. The AI extraction may be incorrect - feel free to override manually.
      </Typography>
    </Card>
  );
};

export default NEROutputs;
