// src/components/departmentFeedback/ComplaintSummary.js
import React from "react";
import { Box, Typography, Chip } from "@mui/joy";

const ComplaintSummary = ({ complaint }) => {
  const getSeverityStyle = (severity) => {
    const styleMap = {
      HIGH: { background: "#ff4757", color: "white" },
      MEDIUM: { background: "#ffa502", color: "white" },
      LOW: { background: "#2ed573", color: "white" },
    };
    return styleMap[severity] || { background: "#999", color: "white" };
  };

  return (
    <Box
      sx={{
        mb: 3,
        p: 3,
        background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
        borderRadius: "8px",
        border: "1px solid rgba(102, 126, 234, 0.2)",
      }}
    >
      <Typography level="h6" sx={{ mb: 2, fontWeight: 700, color: "#667eea" }}>
        ملخص الشكوى (Complaint Summary)
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <Box>
          <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 0.5 }}>
            رقم الشكوى:
          </Typography>
          <Typography level="body-sm" sx={{ fontWeight: 700 }}>
            {complaint.complaintID}
          </Typography>
        </Box>

        <Box>
          <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 0.5 }}>
            تاريخ الاستلام:
          </Typography>
          <Typography level="body-sm">{complaint.dateReceived}</Typography>
        </Box>

        <Box>
          <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 0.5 }}>
            اسم المريض:
          </Typography>
          <Typography level="body-sm">{complaint.patientFullName}</Typography>
        </Box>

        <Box>
          <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 0.5 }}>
            القسم المستهدف:
          </Typography>
          <Typography level="body-sm">{complaint.qism}</Typography>
        </Box>

        <Box>
          <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 0.5 }}>
            المجال:
          </Typography>
          <Typography level="body-sm" sx={{ fontWeight: 700 }}>
            {complaint.problemDomain}
          </Typography>
        </Box>

        <Box>
          <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 0.5 }}>
            الفئة:
          </Typography>
          <Typography level="body-sm">{complaint.problemCategory}</Typography>
        </Box>

        <Box>
          <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 0.5 }}>
            الفئة الفرعية:
          </Typography>
          <Typography level="body-sm">{complaint.subCategory}</Typography>
        </Box>

        <Box>
          <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 0.5 }}>
            الشدة:
          </Typography>
          <Chip
            sx={{
              ...getSeverityStyle(complaint.severity),
              fontWeight: 700,
              fontSize: "11px",
            }}
          >
            {complaint.severity}
          </Chip>
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 1 }}>
          التصنيف (عربي):
        </Typography>
        <Typography level="body-sm" sx={{ p: 2, background: "white", borderRadius: "4px" }}>
          {complaint.classificationAr}
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 1 }}>
          محتوى الشكوى:
        </Typography>
        <Typography level="body-sm" sx={{ p: 2, background: "white", borderRadius: "4px" }}>
          {complaint.rawContent}
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography level="body-xs" sx={{ fontWeight: 700, color: "#666", mb: 1 }}>
          الإجراء الفوري:
        </Typography>
        <Typography level="body-sm" sx={{ p: 2, background: "white", borderRadius: "4px" }}>
          {complaint.immediateAction}
        </Typography>
      </Box>
    </Box>
  );
};

export default ComplaintSummary;
