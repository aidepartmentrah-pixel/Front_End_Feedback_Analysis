// src/components/redflags/RedFlagTable.js
import React from "react";
import { Box, Card, Typography, Sheet, Table, Chip, Button, CircularProgress } from "@mui/joy";
import VisibilityIcon from "@mui/icons-material/Visibility";

const RedFlagTable = ({ redflags, loading, onViewDetails }) => {
  const getSeverityStyle = (severity) => {
    const styleMap = {
      HIGH: { background: "#ff4757", color: "white" },
      MEDIUM: { background: "#ffa502", color: "white" },
      LOW: { background: "#2ed573", color: "white" },
    };
    return styleMap[severity] || { background: "#999", color: "white" };
  };

  const getStatusStyle = (status) => {
    const styleMap = {
      OPEN: { background: "#ffa502", color: "white" },
      CLOSED: { background: "#999", color: "white" },
    };
    return styleMap[status] || { background: "#999", color: "white" };
  };

  if (loading) {
    return (
      <Card sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress size="lg" />
        <Typography level="body-sm" sx={{ mt: 2, color: "#666" }}>
          جاري تحميل العلامات الحمراء...
        </Typography>
      </Card>
    );
  }

  if (redflags.length === 0) {
    return (
      <Card sx={{ p: 5, textAlign: "center" }}>
        <Typography level="h6" sx={{ color: "#999" }}>
          لا توجد علامات حمراء
        </Typography>
        <Typography level="body-sm" sx={{ color: "#666", mt: 1 }}>
          لا توجد حوادث تتطابق مع معايير البحث
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography level="h5" sx={{ mb: 3, fontWeight: 700, color: "#ff4757" }}>
        🚩 العلامات الحمراء (Red Flags) - {redflags.length} حادثة
      </Typography>

      <Sheet
        sx={{
          borderRadius: "8px",
          border: "2px solid rgba(255, 71, 87, 0.2)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ overflowX: "auto" }}>
          <Table
            sx={{
              "--TableCell-paddingY": "14px",
              "--TableCell-paddingX": "12px",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr style={{ background: "rgba(255, 71, 87, 0.1)" }}>
                <th>رقم السجل<br />Record ID</th>
                <th>التاريخ<br />Date</th>
                <th>المريض<br />Patient</th>
                <th>القسم المرسل<br />Sending Dept</th>
                <th>القسم المستهدف<br />Target Dept</th>
                <th>المجال<br />Domain</th>
                <th>الشدة<br />Severity</th>
                <th>الحالة<br />Status</th>
                <th>الإجراء<br />Action</th>
              </tr>
            </thead>
            <tbody>
              {redflags.map((flag) => (
                <tr
                  key={flag.id}
                  style={{
                    borderLeft: flag.severity === "HIGH" ? "5px solid #ff4757" : "none",
                    background: flag.status === "OPEN" ? "rgba(255, 165, 2, 0.08)" : "white",
                  }}
                >
                  <td>
                    <Typography level="body-sm" sx={{ fontWeight: 700, color: "#ff4757" }}>
                      {flag.recordID}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{flag.date}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                      {flag.patientName}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{flag.sendingDepartment}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{flag.targetDepartment}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm" sx={{ fontWeight: 700, color: "#667eea" }}>
                      {flag.domain}
                    </Typography>
                  </td>
                  <td>
                    <Chip
                      sx={{
                        ...getSeverityStyle(flag.severity),
                        fontWeight: 700,
                        fontSize: "12px",
                        minWidth: "65px",
                      }}
                    >
                      {flag.severity}
                    </Chip>
                  </td>
                  <td>
                    <Chip
                      sx={{
                        ...getStatusStyle(flag.status),
                        fontWeight: 700,
                        fontSize: "12px",
                        minWidth: "70px",
                      }}
                    >
                      {flag.status === "OPEN" ? "مفتوح" : "مغلق"}
                    </Chip>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      startDecorator={<VisibilityIcon />}
                      onClick={() => onViewDetails(flag)}
                      sx={{
                        background: "linear-gradient(135deg, #ff4757 0%, #e84118 100%)",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      عرض
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>
      </Sheet>
    </Card>
  );
};

export default RedFlagTable;
