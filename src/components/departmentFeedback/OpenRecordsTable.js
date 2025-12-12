// src/components/departmentFeedback/OpenRecordsTable.js
import React from "react";
import { Box, Card, Typography, Sheet, Table, Chip, Button, CircularProgress } from "@mui/joy";
import EditNoteIcon from "@mui/icons-material/EditNote";

const OpenRecordsTable = ({ records, loading, onOpenDrawer, delayThreshold }) => {
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
      OPEN: { background: "#667eea", color: "white" },
      OVERDUE: { background: "#ff4757", color: "white" },
    };
    return styleMap[status] || { background: "#999", color: "white" };
  };

  const getDaysColor = (days, isOverdue) => {
    if (isOverdue) return "#ff4757";
    if (days > 5) return "#ffa502";
    return "#2ed573";
  };

  const getDelayStatusStyle = (isDelayed) => {
    if (isDelayed) {
      return { background: "#ff4757", color: "white", text: "متأخرة (Delayed)" };
    }
    return { background: "#2ed573", color: "white", text: "ضمن المهلة (On-Time)" };
  };

  if (loading) {
    return (
      <Card sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress size="lg" />
        <Typography level="body-sm" sx={{ mt: 2, color: "#666" }}>
          جاري تحميل السجلات...
        </Typography>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card sx={{ p: 5, textAlign: "center" }}>
        <Typography level="h6" sx={{ color: "#999" }}>
          لا توجد سجلات مفتوحة أو متأخرة
        </Typography>
        <Typography level="body-sm" sx={{ color: "#666", mt: 1 }}>
          جميع الشكاوى تم معالجتها بنجاح
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography level="h5" sx={{ mb: 3, fontWeight: 700, color: "#667eea" }}>
        📋 السجلات المفتوحة والمتأخرة (Open & Overdue Records)
      </Typography>

      <Sheet
        sx={{
          borderRadius: "8px",
          border: "1px solid rgba(102, 126, 234, 0.2)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ overflowX: "auto" }}>
          <Table
            sx={{
              "--TableCell-paddingY": "12px",
              "--TableCell-paddingX": "10px",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr>
                <th>رقم الشكوى<br />Complaint ID</th>
                <th>تاريخ الاستلام<br />Date Received</th>
                <th>المريض<br />Patient</th>
                <th>القسم المستهدف<br />Target Dept</th>
                <th>الأيام منذ الاستلام<br />Days Since</th>
                <th>حالة التأخير<br />Delay Status</th>
                <th>الشدة<br />Severity</th>
                <th>الحالة<br />Status</th>
                <th>الإجراء<br />Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr
                  key={record.id}
                  style={{
                    background: record.status === "OVERDUE" ? "rgba(255, 71, 87, 0.03)" : "white",
                  }}
                >
                  <td>
                    <Typography level="body-sm" sx={{ fontWeight: 700 }}>
                      {record.complaintID}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{record.dateReceived}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{record.patientName}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{record.targetDepartment}</Typography>
                  </td>
                  <td>
                    <Typography
                      level="body-sm"
                      sx={{
                        fontWeight: 700,
                        color: getDaysColor(record.daysSinceReceived, record.status === "OVERDUE"),
                      }}
                    >
                      {record.daysSinceReceived} يوم
                    </Typography>
                  </td>
                  <td>
                    <Chip
                      sx={{
                        ...getDelayStatusStyle(record.isDelayed),
                        fontWeight: 700,
                        fontSize: "11px",
                        minWidth: "100px",
                      }}
                    >
                      {getDelayStatusStyle(record.isDelayed).text}
                    </Chip>
                  </td>
                  <td>
                    <Chip
                      sx={{
                        ...getSeverityStyle(record.severity),
                        fontWeight: 700,
                        fontSize: "11px",
                        minWidth: "70px",
                      }}
                    >
                      {record.severity}
                    </Chip>
                  </td>
                  <td>
                    <Chip
                      sx={{
                        ...getStatusStyle(record.status),
                        fontWeight: 700,
                        fontSize: "11px",
                        minWidth: "80px",
                      }}
                    >
                      {record.status === "OVERDUE" ? "متأخر" : "مفتوح"}
                    </Chip>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      startDecorator={<EditNoteIcon />}
                      onClick={() => onOpenDrawer(record)}
                      sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "11px",
                      }}
                    >
                      ملء التوضيح
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>

        <Box
          sx={{
            p: 2,
            borderTop: "1px solid rgba(102, 126, 234, 0.1)",
            background: "#f9fafb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography level="body-sm" sx={{ color: "#666" }}>
            إجمالي السجلات: {records.length}
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Typography level="body-xs" sx={{ color: "#ff4757" }}>
              ● متأخرة: {records.filter(r => r.isDelayed).length}
            </Typography>
            <Typography level="body-xs" sx={{ color: "#2ed573" }}>
              ● ضمن المهلة: {records.filter(r => !r.isDelayed).length}
            </Typography>
          </Box>
        </Box>
      </Sheet>
    </Card>
  );
};

export default OpenRecordsTable;
