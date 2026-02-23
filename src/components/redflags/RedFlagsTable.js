// src/components/redflags/RedFlagsTable.js
import React from "react";
import { Box, Table, Chip, Typography } from "@mui/joy";

const RedFlagsTable = ({ redFlags, loading, onRowClick }) => {
  console.log("🔍 RedFlagsTable - Received redFlags:", redFlags?.length, "records");
  console.log("🔍 RedFlagsTable - First record structure:", redFlags?.[0]);
  console.log("🔍 RedFlagsTable - First record keys:", redFlags?.[0] ? Object.keys(redFlags[0]) : []);

  const getSeverityColor = (severity) => {
    const text = severity?.toLowerCase() || "";
    if (text === "high") return "danger";
    if (text === "medium") return "warning";
    if (text === "low") return "neutral";
    return "neutral";
  };

  const getStatusColor = (status) => {
    const text = status?.toLowerCase() || "";
    if (text === "open" || text === "pending") return "primary";
    if (text === "in progress") return "warning";
    if (text === "resolved" || text === "closed" || text === "finished") return "success";
    return "neutral";
  };

  const getStatusLabel = (status) => {
    const text = status?.toLowerCase() || "";
    if (text === "open") return "Open";
    if (text === "pending") return "Pending";
    if (text === "in progress") return "In Progress";
    if (text === "resolved" || text === "finished") return "Finished";
    if (text === "closed") return "Closed";
    return status;
  };

  const getSeverityLabel = (severity) => {
    const text = severity?.toLowerCase() || "";
    if (text === "high") return "High";
    if (text === "medium") return "Medium";
    if (text === "low") return "Low";
    if (text === "critical") return "Critical";
    return severity;
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!redFlags || redFlags.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
        <Typography>No Red Flags found</Typography>
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
          {redFlags.map((redFlag) => (
            <tr
              key={redFlag.id}
              onClick={() => onRowClick(redFlag.id)}
            >
              <td>
                <Box sx={{ fontWeight: 600, color: "#0f172a", fontSize: "0.85rem", textAlign: "center" }}>
                  {redFlag.id}
                </Box>
              </td>
              <td>
                <Box sx={{ color: "#6b7280", fontSize: "0.75rem", textAlign: "center" }}>
                  {redFlag.date ? new Date(redFlag.date).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }) : "-"}
                </Box>
              </td>
              <td>
                <Box sx={{ color: "#4b5563", fontSize: "0.75rem", textAlign: "center", whiteSpace: "normal", wordBreak: "break-word" }}>
                  {redFlag.patient_name || redFlag.patient_full_name || "-"}
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
                  {redFlag.complaint_text || redFlag.description || "-"}
                </Box>
              </td>
              <td>
                <Box sx={{ color: "#4b5563", fontSize: "0.75rem", textAlign: "center", whiteSpace: "normal", wordBreak: "break-word" }}>{redFlag.department}</Box>
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
                  {redFlag.category}
                </Box>
              </td>
              <td>
                <Chip
                  color={getSeverityColor(redFlag.severity)}
                  size="sm"
                  sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                >
                  {getSeverityLabel(redFlag.severity)}
                </Chip>
              </td>
              <td>
                <Chip
                  color={getStatusColor(redFlag.status)}
                  size="sm"
                  variant="soft"
                  sx={{ fontWeight: 500, fontSize: "0.7rem" }}
                >
                  {getStatusLabel(redFlag.status)}
                </Chip>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
};

export default RedFlagsTable;
