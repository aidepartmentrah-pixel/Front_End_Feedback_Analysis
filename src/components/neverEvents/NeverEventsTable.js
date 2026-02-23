// src/components/neverEvents/NeverEventsTable.js
import React from "react";
import { Box, Table, Chip, Typography } from "@mui/joy";

const NeverEventsTable = ({ neverEvents, loading, onRowClick }) => {
  const getSeverityColor = (severity) => {
    const text = severity?.toLowerCase() || "";
    if (text === "high" || text === "critical") return "danger";
    if (text === "medium") return "warning";
    if (text === "low") return "neutral";
    return "danger"; // Default to danger for never events
  };

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
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!neverEvents || neverEvents.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
        <Typography>No Never Events found</Typography>
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
            <th style={{ width: "10%" }}>Case ID</th>
            <th style={{ width: "10%" }}>Date</th>
            <th style={{ width: "14%" }}>Patient Name</th>
            <th style={{ width: "26%" }}>Complaint</th>
            <th style={{ width: "15%" }}>Department</th>
            <th style={{ width: "10%" }}>Category</th>
            <th style={{ width: "8%" }}>Severity</th>
            <th style={{ width: "7%" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {neverEvents.map((event) => (
            <tr
              key={event.id}
              onClick={() => onRowClick(event.id)}
            >
              <td>
                <Box sx={{ fontWeight: 600, color: "#0f172a", fontSize: "0.85rem", textAlign: "center" }}>
                  {event.id}
                </Box>
              </td>
              <td>
                <Box sx={{ color: "#6b7280", fontSize: "0.75rem", textAlign: "center" }}>
                  {event.date ? new Date(event.date).toLocaleDateString("en-GB", {
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
                    color: "#4b5563",
                    fontSize: "0.8125rem",
                    textAlign: "center",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    lineHeight: 1.5,
                  }}
                >
                  {event.description || event.neverEventTypeAr || event.neverEventType || "-"}
                </Box>
              </td>
              <td>
                <Box sx={{ color: "#4b5563", fontSize: "0.75rem", textAlign: "center", whiteSpace: "normal", wordBreak: "break-word" }}>
                  {event.department || "-"}
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
                  {event.neverEventCategory || event.category || "-"}
                </Box>
              </td>
              <td>
                <Chip
                  color={getSeverityColor(event.severity)}
                  size="sm"
                  sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                >
                  {event.severity || "HIGH"}
                </Chip>
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
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
};

export default NeverEventsTable;
