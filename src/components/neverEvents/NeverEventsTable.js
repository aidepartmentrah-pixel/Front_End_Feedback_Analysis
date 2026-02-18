// src/components/neverEvents/NeverEventsTable.js
import React from "react";
import { Box, Table, Chip, Typography } from "@mui/joy";
import WarningIcon from "@mui/icons-material/Warning";

const NeverEventsTable = ({ neverEvents, loading, onRowClick }) => {
  const getStatusColor = (status) => {
    const s = status?.toUpperCase?.() || status;
    if (s === "OPEN") return "primary";
    if (s === "UNDER_REVIEW" || s === "IN_PROGRESS" || status === "In Progress") return "warning";
    if (s === "FINISHED" || s === "CLOSED" || status === "Closed") return "success";
    return "neutral";
  };

  const getStatusLabel = (status) => {
    const s = status?.toUpperCase?.() || status;
    if (s === "OPEN") return "Open";
    if (s === "UNDER_REVIEW") return "Under Review";
    if (s === "IN_PROGRESS" || status === "In Progress") return "In Progress";
    if (s === "FINISHED") return "Finished";
    if (s === "CLOSED" || status === "Closed") return "Closed";
    return status;
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>جاري التحميل...</Typography>
      </Box>
    );
  }

  if (!neverEvents || neverEvents.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
        <Typography>لا توجد أحداث</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        overflow: "auto",
        border: "1px solid",
        borderColor: "#e5e7eb",
        borderRadius: "sm",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
      }}
    >
      <Table
        sx={{
          tableLayout: "fixed",
          width: "100%",
          "& thead th": {
            bgcolor: "#fafafa",
            fontWeight: 600,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#6b7280",
            position: "sticky",
            top: 0,
            zIndex: 2,
            textAlign: "center",
            borderBottom: "1px solid #e5e7eb",
            py: 1.5,
            px: 1,
          },
          "& tbody tr": {
            cursor: "pointer",
            transition: "background-color 0.15s ease",
            borderBottom: "1px solid #f3f4f6",
            "&:hover": {
              bgcolor: "#f9fafb",
            },
            "&:last-child": {
              borderBottom: "none",
            },
          },
          "& tbody td": {
            textAlign: "center",
            verticalAlign: "middle",
            py: 1.5,
            px: 1,
            fontSize: "0.8125rem",
          },
        }}
      >
        <thead>
          <tr>
            <th style={{ width: "8%" }}>رقم السجل</th>
            <th style={{ width: "9%" }}>التاريخ</th>
            <th style={{ width: "12%" }}>اسم المريض</th>
            <th style={{ width: "16%" }}>نوع الحدث</th>
            <th style={{ width: "12%" }}>الفئة</th>
            <th style={{ width: "14%" }}>القسم</th>
            <th style={{ width: "11%" }}>القسم الفرعي</th>
            <th style={{ width: "9%" }}>الحالة</th>
            <th style={{ width: "9%" }}>رقم الحادثة</th>
          </tr>
        </thead>
        <tbody>
          {neverEvents.map((event) => (
            <tr
              key={event.id}
              onClick={() => onRowClick(event.id)}
            >
              <td>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                  <WarningIcon sx={{ color: "#dc2626", fontSize: 16 }} />
                  <Box sx={{ fontWeight: 600, color: "#0f172a", fontSize: "0.75rem" }}>
                    {event.recordID || event.record_id || event.case_id}
                  </Box>
                </Box>
              </td>
              <td>
                <Box sx={{ color: "#6b7280", fontSize: "0.75rem", textAlign: "center" }}>
                  {event.date ? new Date(event.date).toLocaleDateString("ar-SA", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }) : "-"}
                </Box>
              </td>
              <td>
                <Box sx={{ color: "#4b5563", fontSize: "0.75rem", textAlign: "center", whiteSpace: "normal", wordBreak: "break-word" }}>
                  {event.patientName || event.patient_name || event.patient_full_name || "-"}
                </Box>
              </td>
              <td>
                <Box
                  sx={{
                    display: "inline-block",
                    px: 1,
                    py: 0.25,
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    bgcolor: "#fef2f2",
                    color: "#991b1b",
                    border: "1px solid #fecaca",
                    textAlign: "center",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  {event.neverEventTypeAr || event.neverEventType || event.category || "-"}
                </Box>
              </td>
              <td>
                <Box
                  sx={{
                    display: "inline-block",
                    px: 1,
                    py: 0.25,
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    bgcolor: "#eff6ff",
                    color: "#1e40af",
                    border: "1px solid #bfdbfe",
                    textAlign: "center",
                  }}
                >
                  {event.neverEventCategory || event.domain || "-"}
                </Box>
              </td>
              <td>
                <Box sx={{ color: "#4b5563", fontSize: "0.75rem", textAlign: "center", whiteSpace: "normal", wordBreak: "break-word" }}>
                  {event.department || "-"}
                </Box>
              </td>
              <td>
                <Box sx={{ color: "#6b7280", fontSize: "0.75rem", textAlign: "center", whiteSpace: "normal", wordBreak: "break-word" }}>
                  {event.qism || event.sub_category || "-"}
                </Box>
              </td>
              <td>
                <Chip
                  color={getStatusColor(event.status)}
                  size="sm"
                  variant="soft"
                  sx={{ fontWeight: 500, fontSize: "0.7rem" }}
                >
                  {getStatusLabel(event.status)}
                </Chip>
              </td>
              <td>
                <Box sx={{ color: "#6b7280", fontSize: "0.75rem", textAlign: "center" }}>
                  {event.incidentID || event.incident_id || "-"}
                </Box>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
};

export default NeverEventsTable;
