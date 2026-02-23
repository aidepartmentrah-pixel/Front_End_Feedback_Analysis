// src/components/redflags/RedFlagDetails.js
import React from "react";
import { Box, Typography, Chip, Button, Divider, Grid } from "@mui/joy";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const RedFlagDetails = ({ redflag, onExportPDF }) => {
  const getSeverityStyle = (severity) => {
    const styleMap = {
      HIGH: { background: "#ff4757", color: "white" },
      MEDIUM: { background: "#ffa502", color: "white" },
      LOW: { background: "#2ed573", color: "white" },
    };
    return styleMap[severity] || { background: "#999", color: "white" };
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          p: 3,
          background: "linear-gradient(135deg, rgba(255, 71, 87, 0.1) 0%, rgba(255, 71, 87, 0.05) 100%)",
          borderRadius: "8px",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <WarningAmberIcon sx={{ fontSize: "28px", color: "#ff4757" }} />
          <Typography level="h5" sx={{ fontWeight: 700, color: "#ff4757" }}>
            Red Flag
          </Typography>
        </Box>
        <Typography level="h6" sx={{ fontWeight: 700 }}>
          {redflag.recordID} - {redflag.patientName}
        </Typography>
        <Typography level="body-sm" sx={{ color: "#666", mt: 0.5 }}>
          {redflag.date}
        </Typography>
      </Box>

      {/* Key Information */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={6}>
          <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 0.5 }}>
            Sending Department:
          </Typography>
          <Typography level="body-sm">{redflag.sendingDepartment}</Typography>
        </Grid>
        <Grid xs={6}>
          <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 0.5 }}>
            Target Department:
          </Typography>
          <Typography level="body-sm">{redflag.targetDepartment}</Typography>
        </Grid>
        <Grid xs={6}>
          <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 0.5 }}>
            Domain:
          </Typography>
          <Typography level="body-sm" sx={{ fontWeight: 700, color: "#667eea" }}>
            {redflag.domain}
          </Typography>
        </Grid>
        <Grid xs={6}>
          <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 0.5 }}>
            Severity:
          </Typography>
          <Chip sx={{ ...getSeverityStyle(redflag.severity), fontWeight: 700, fontSize: "11px" }}>
            {redflag.severity}
          </Chip>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Department Hierarchy */}
      <Box sx={{ mb: 3 }}>
        <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 1 }}>
          Department Hierarchy:
        </Typography>
        <Box sx={{ p: 2, background: "#f9fafb", borderRadius: "4px" }}>
          <Typography level="body-sm">
            {redflag.building} → {redflag.idara} → {redflag.dayra} → {redflag.qism}
          </Typography>
        </Box>
      </Box>

      {/* Classification */}
      <Box sx={{ mb: 3 }}>
        <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 1 }}>
          Classification:
        </Typography>
        <Box sx={{ p: 2, background: "#f9fafb", borderRadius: "4px" }}>
          <Typography level="body-sm" sx={{ mb: 1, fontWeight: 700 }}>
            AR: {redflag.classificationAr}
          </Typography>
          <Typography level="body-sm">
            EN: {redflag.classificationEn}
          </Typography>
        </Box>
      </Box>

      {/* Raw Content */}
      <Box sx={{ mb: 3 }}>
        <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 1 }}>
          Complaint Content:
        </Typography>
        <Box sx={{ p: 2, background: "#fff", border: "1px solid #e0e0e0", borderRadius: "4px" }}>
          <Typography level="body-sm">{redflag.rawContent}</Typography>
        </Box>
      </Box>

      {/* Harm */}
      <Box sx={{ mb: 3 }}>
        <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 1 }}>
          Harm:
        </Typography>
        <Box
          sx={{
            p: 2,
            background: "rgba(255, 71, 87, 0.1)",
            border: "1px solid rgba(255, 71, 87, 0.3)",
            borderRadius: "4px",
          }}
        >
          <Typography level="body-sm" sx={{ fontWeight: 700, color: "#ff4757" }}>
            {redflag.harm}
          </Typography>
        </Box>
      </Box>

      {/* Red Flag Reason */}
      <Box sx={{ mb: 3 }}>
        <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 1 }}>
          Red Flag Reason:
        </Typography>
        <Box
          sx={{
            p: 2,
            background: "rgba(255, 71, 87, 0.05)",
            border: "1px solid rgba(255, 71, 87, 0.2)",
            borderRadius: "4px",
          }}
        >
          <Typography level="body-sm" sx={{ fontWeight: 700 }}>
            {redflag.redFlagReason}
          </Typography>
        </Box>
      </Box>

      {/* Immediate Action */}
      <Box sx={{ mb: 3 }}>
        <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 1 }}>
          Immediate Action:
        </Typography>
        <Box sx={{ p: 2, background: "#f9fafb", borderRadius: "4px" }}>
          <Typography level="body-sm">{redflag.immediateAction}</Typography>
        </Box>
      </Box>

      {/* Department Notes */}
      <Box sx={{ mb: 3 }}>
        <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 1 }}>
          Department Notes:
        </Typography>
        <Box sx={{ p: 2, background: "#f9fafb", borderRadius: "4px" }}>
          <Typography level="body-sm">{redflag.departmentNotes}</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Export Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          startDecorator={<PictureAsPdfIcon />}
          onClick={() => onExportPDF(redflag)}
          sx={{
            background: "linear-gradient(135deg, #ff4757 0%, #e84118 100%)",
            color: "white",
            fontWeight: 700,
          }}
        >
          Export PDF
        </Button>
      </Box>
    </Box>
  );
};

export default RedFlagDetails;
