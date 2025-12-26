// src/components/redflags/RedFlagsTable.js
import React from "react";
import { Box, Table, Chip, Typography } from "@mui/joy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const RedFlagsTable = ({ redFlags, loading, onRowClick }) => {
  const getSeverityColor = (severity) => {
    if (severity === "CRITICAL") return "danger";
    if (severity === "HIGH") return "warning";
    return "neutral";
  };

  const getStatusColor = (status) => {
    if (status === "OPEN") return "primary";
    if (status === "UNDER_REVIEW") return "warning";
    if (status === "FINISHED") return "success";
    return "neutral";
  };

  const getStatusLabel = (status) => {
    if (status === "OPEN") return "مفتوح";
    if (status === "UNDER_REVIEW") return "قيد المراجعة";
    if (status === "FINISHED") return "منتهي";
    return status;
  };

  const getSeverityLabel = (severity) => {
    if (severity === "CRITICAL") return "حرج";
    if (severity === "HIGH") return "عالي";
    return severity;
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>جاري التحميل...</Typography>
      </Box>
    );
  }

  if (!redFlags || redFlags.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
        <Typography>لا توجد أعلام حمراء</Typography>
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
          "& thead th": {
            bgcolor: "#fafafa",
            fontWeight: 600,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#6b7280",
            position: "sticky",
            top: 0,
            zIndex: 1,
            textAlign: "center",
            borderBottom: "1px solid #e5e7eb",
            py: 1.5,
            px: 2,
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
            py: 2,
            px: 2,
            fontSize: "0.875rem",
          },
        }}
      >
        <thead>
          <tr>
            <th>رقم السجل</th>
            <th>اسم المريض</th>
            <th>تاريخ الاستلام</th>
            <th>القسم</th>
            <th>التصنيف</th>
            <th>الخطورة</th>
            <th>الحالة</th>
            <th>حدث لا يجب أن يحدث</th>
            <th>الملخص</th>
          </tr>
        </thead>
        <tbody>
          {redFlags.map((redFlag) => (
            <tr
              key={redFlag.red_flag_id}
              onClick={() => onRowClick(redFlag.red_flag_id)}
            >
              <td>
                <Box sx={{ fontWeight: 600, color: "#0f172a" }}>
                  {redFlag.recordID}
                </Box>
              </td>
              <td>
                <Box sx={{ color: "#4b5563" }}>{redFlag.patient_name}</Box>
              </td>
              <td>
                <Box sx={{ color: "#6b7280", fontSize: "0.8125rem" }}>
                  {new Date(redFlag.date_received).toLocaleDateString("ar-SA", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Box>
              </td>
              <td>
                <Box sx={{ color: "#4b5563" }}>{redFlag.department}</Box>
              </td>
              <td>
                <Box
                  sx={{
                    display: "inline-block",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "4px",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    bgcolor: "#eff6ff",
                    color: "#1e40af",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  {redFlag.category}
                </Box>
              </td>
              <td>
                <Chip
                  color={getSeverityColor(redFlag.severity)}
                  size="sm"
                  sx={{ fontWeight: 700, fontSize: "0.8125rem" }}
                >
                  {getSeverityLabel(redFlag.severity)}
                </Chip>
              </td>
              <td>
                <Chip
                  color={getStatusColor(redFlag.status)}
                  size="sm"
                  variant="soft"
                  sx={{ fontWeight: 500, fontSize: "0.75rem" }}
                >
                  {getStatusLabel(redFlag.status)}
                </Chip>
              </td>
              <td>
                {redFlag.isNeverEvent ? (
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <CheckCircleIcon sx={{ color: "#dc2626", fontSize: 20 }} />
                  </Box>
                ) : (
                  <Box sx={{ color: "#9ca3af" }}>-</Box>
                )}
              </td>
              <td>
                <Box
                  sx={{
                    color: "#6b7280",
                    fontSize: "0.8125rem",
                    maxWidth: 300,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {redFlag.complaint_summary}
                </Box>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
};

export default RedFlagsTable;
