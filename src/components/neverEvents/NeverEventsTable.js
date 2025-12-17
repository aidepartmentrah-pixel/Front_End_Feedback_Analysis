// src/components/neverEvents/NeverEventsTable.js
import React from "react";
import { Box, Card, Typography, Table, Sheet, Chip, Button } from "@mui/joy";
import VisibilityIcon from "@mui/icons-material/Visibility";

const NeverEventsTable = ({ title, events, loading, onViewDetails, showStatus = true, isFinished = false }) => {
  const getSeverityStyle = (severity) => {
    const styleMap = {
      CRITICAL: { background: "#ff4757", color: "white" },
      HIGH: { background: "#ffa502", color: "white" },
      MEDIUM: { background: "#ffc107", color: "white" },
    };
    return styleMap[severity] || { background: "#999", color: "white" };
  };

  const getStatusStyle = (status) => {
    const styleMap = {
      OPEN: { background: "#ff4757", color: "white" },
      CLOSED: { background: "#ffa502", color: "white" },
      FINISHED: { background: "#2ed573", color: "white" },
    };
    return styleMap[status] || { background: "#999", color: "white" };
  };

  const getInvestigationStatusStyle = (invStatus) => {
    const styleMap = {
      INITIAL: { background: "#ffa502", color: "white" },
      IN_PROGRESS: { background: "#667eea", color: "white" },
      COMPLETED: { background: "#2ed573", color: "white" },
    };
    return styleMap[invStatus] || { background: "#999", color: "white" };
  };

  const getInvestigationStatusLabel = (invStatus) => {
    const labelMap = {
      INITIAL: "أولي",
      IN_PROGRESS: "جاري",
      COMPLETED: "مكتمل",
    };
    return labelMap[invStatus] || invStatus;
  };

  if (loading) {
    return (
      <Card sx={{ p: 3, textAlign: "center" }}>
        <Typography>جاري التحميل...</Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography level="h5" sx={{ mb: 3, fontWeight: 700, color: isFinished ? "#2ed573" : "#ff4757" }}>
        {title || `⚠️ Never Events - ${events.length} حدث`}
      </Typography>

      <Sheet
        sx={{
          borderRadius: "8px",
          border: isFinished ? "2px solid rgba(46, 213, 115, 0.2)" : "2px solid rgba(255, 71, 87, 0.2)",
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
              <tr style={{ background: isFinished ? "rgba(46, 213, 115, 0.1)" : "rgba(255, 71, 87, 0.1)" }}>
                <th>رقم السجل<br />Record ID</th>
                <th>التاريخ<br />Date</th>
                <th>المريض<br />Patient</th>
                <th>نوع Never Event<br />Event Type</th>
                <th>القسم<br />Department</th>
                <th>الضرر<br />Harm</th>
                {showStatus && <th>الحالة<br />Status</th>}
                <th>الإجراء<br />Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  style={{
                    borderLeft: "5px solid #ff4757",
                    background: event.status === "OPEN" ? "rgba(255, 71, 87, 0.05)" : "white",
                  }}
                >
                  <td>
                    <Typography level="body-sm" sx={{ fontWeight: 700, color: "#ff4757" }}>
                      {event.recordID}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "#999" }}>
                      {event.id}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{event.date}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                      {event.patientName}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-sm" sx={{ fontWeight: 700, color: "#ff4757" }}>
                      {event.neverEventTypeAr}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "#666" }}>
                      {event.neverEventTypeEn}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{event.sendingDepartment}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm" sx={{ fontWeight: 600, color: "#ff4757" }}>
                      {event.harm}
                    </Typography>
                  </td>
                  {showStatus && (
                    <td>
                      <Chip
                        sx={{
                        ...getStatusStyle(event.status),
                        fontWeight: 700,
                        fontSize: "12px",
                        minWidth: "70px",
                      }}
                    >
                      {event.status === "OPEN" ? "مفتوح" : event.status === "CLOSED" ? "مغلق" : "منتهي"}
                    </Chip>
                    </td>
                  )}
                  <td>
                    <Button
                      size="sm"
                      startDecorator={<VisibilityIcon />}
                      onClick={() => onViewDetails(event)}
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

      {events.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography level="body-md" sx={{ color: "#999" }}>
            لا توجد أحداث Never Events في هذه الفئة
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default NeverEventsTable;
