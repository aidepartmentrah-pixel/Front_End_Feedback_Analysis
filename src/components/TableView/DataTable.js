// src/components/TableView/DataTable.js
import React from "react";
import { Box, Table, Chip, IconButton } from "@mui/joy";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// Domain colors - Subtle backgrounds, functional not decorative
const getDomainColor = (domain) => {
  const lower = domain?.toLowerCase() || "";
  if (lower.includes("clinical") || lower.includes("سريري")) 
    return { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" }; // Soft blue
  if (lower.includes("management") || lower.includes("إداري")) 
    return { bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe" }; // Soft purple
  if (lower.includes("relational") || lower.includes("علائقي")) 
    return { bg: "#ecfeff", text: "#0e7490", border: "#cffafe" }; // Soft cyan
  if (lower.includes("environment") || lower.includes("بيئي")) 
    return { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" }; // Soft green
  return { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" }; // Soft gray
};

// Category colors - Very subtle, contextual
const getCategoryColor = (category) => {
  const lower = category?.toLowerCase() || "";
  if (lower.includes("safety") || lower.includes("سلامة")) 
    return { bg: "#fef2f2", text: "#991b1b", border: "#fecaca" }; // Soft red
  if (lower.includes("quality") || lower.includes("جودة")) 
    return { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" }; // Soft blue
  if (lower.includes("service") || lower.includes("خدمة")) 
    return { bg: "#f0fdfa", text: "#115e59", border: "#99f6e4" }; // Soft teal
  if (lower.includes("communication") || lower.includes("تواصل")) 
    return { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" }; // Soft purple
  return { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0" }; // Soft slate
};

// Stage colors - Minimal, just context
const getStageColor = (stage) => {
  return { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0" }; // Uniform subtle
};

// Severity colors - STRONG, safety-critical (keep bold colors)
const getSeverityColor = (severity) => {
  const lower = severity?.toLowerCase() || "";
  if (lower.includes("high") || lower.includes("critical") || lower.includes("عالي") || lower.includes("severe")) 
    return "danger"; // RED - Keep strong
  if (lower.includes("medium") || lower.includes("moderate") || lower.includes("متوسط")) 
    return "warning"; // YELLOW - Keep strong
  if (lower.includes("low") || lower.includes("minor") || lower.includes("منخفض") || lower.includes("minimal")) 
    return "success"; // GREEN - Keep strong
  return "neutral";
};

// Harm Level colors - STRONG, safety-critical (keep bold colors)
const getHarmLevelColor = (harmLevel) => {
  const lower = harmLevel?.toLowerCase() || "";
  if (lower.includes("severe") || lower.includes("major") || lower.includes("شديد") || lower.includes("high")) 
    return "danger"; // RED - Keep strong
  if (lower.includes("moderate") || lower.includes("medium") || lower.includes("متوسط")) 
    return "warning"; // YELLOW - Keep strong
  if (lower.includes("minor") || lower.includes("low") || lower.includes("minimal") || lower.includes("none") || lower.includes("no harm") || lower.includes("منخفض")) 
    return "success"; // GREEN - Keep strong
  return "neutral";
};

const getStatusColor = (status) => {
  const lower = status?.toLowerCase() || "";
  if (lower.includes("open") || lower.includes("pending") || lower.includes("مفتوح")) return "warning";
  if (lower.includes("progress") || lower.includes("reviewing") || lower.includes("جاري")) return "primary";
  if (lower.includes("closed") || lower.includes("resolved") || lower.includes("مغلق")) return "success";
  return "neutral";
};

const DataTable = ({ complaints, sortBy, sortOrder, onSort, onRowClick, viewMode }) => {
  const renderSortIcon = (column) => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? (
      <ArrowUpwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
    ) : (
      <ArrowDownwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
    );
  };

  const SortableHeader = ({ column, children }) => (
    <th
      onClick={() => onSort(column)}
      style={{
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
        background: sortBy === column ? "#f3f4f6" : "transparent",
        transition: "background-color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (sortBy !== column) {
          e.currentTarget.style.background = "#f9fafb";
        }
      }}
      onMouseLeave={(e) => {
        if (sortBy !== column) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
        {children}
        {renderSortIcon(column)}
      </Box>
    </th>
  );

  // Define columns based on view mode - Ordered as per user specification
  const completeViewColumns = [
    { key: "complaint_number", label: "Complaint #", sortable: true },
    { key: "received_date", label: "Received Date", sortable: true },
    { key: "patient_name", label: "Patient Name", sortable: false },
    { key: "issuing_org_unit_name", label: "Issuing Dept", sortable: false },
    { key: "domain_name", label: "Domain", sortable: false },
    { key: "category_name", label: "Category", sortable: false },
    { key: "subcategory_name", label: "Subcategory", sortable: false },
    { key: "classification_en_label", label: "Classification (EN)", sortable: false },
    { key: "severity_name", label: "Severity", sortable: false },
    { key: "stage_name", label: "Stage", sortable: false },
    { key: "harm_level_name", label: "Harm Level", sortable: false },
    { key: "status_name", label: "Status", sortable: false },
    { key: "case_status_name", label: "Case Status", sortable: false },
  ];

  const simplifiedViewColumns = [
    { key: "complaint_number", label: "Complaint #", sortable: true },
    { key: "received_date", label: "Received Date", sortable: true },
    { key: "severity_name", label: "Severity", sortable: false },
    { key: "status_name", label: "Status", sortable: false },
  ];

  const columns = viewMode === "complete" ? completeViewColumns : simplifiedViewColumns;

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
            {columns.map((col) =>
              col.sortable ? (
                <SortableHeader key={col.key} column={col.key}>
                  {col.label}
                </SortableHeader>
              ) : (
                <th key={col.key}>{col.label}</th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => (
            <tr key={complaint.id} onClick={() => onRowClick(complaint.id)}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.key === "complaint_number" ? (
                    <Box sx={{ fontWeight: 600, color: "#0f172a", fontSize: "0.9375rem" }}>
                      {complaint[col.key]}
                    </Box>
                  ) : col.key === "domain_name" ? (
                    <Box
                      sx={{
                        display: "inline-block",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "4px",
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                        bgcolor: getDomainColor(complaint[col.key]).bg,
                        color: getDomainColor(complaint[col.key]).text,
                        border: `1px solid ${getDomainColor(complaint[col.key]).border}`,
                      }}
                    >
                      {complaint[col.key]}
                    </Box>
                  ) : col.key === "category_name" ? (
                    <Box
                      sx={{
                        display: "inline-block",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "4px",
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                        bgcolor: getCategoryColor(complaint[col.key]).bg,
                        color: getCategoryColor(complaint[col.key]).text,
                        border: `1px solid ${getCategoryColor(complaint[col.key]).border}`,
                      }}
                    >
                      {complaint[col.key]}
                    </Box>
                  ) : col.key === "stage_name" ? (
                    <Box
                      sx={{
                        display: "inline-block",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 400,
                        bgcolor: getStageColor(complaint[col.key]).bg,
                        color: getStageColor(complaint[col.key]).text,
                        border: `1px solid ${getStageColor(complaint[col.key]).border}`,
                      }}
                    >
                      {complaint[col.key]}
                    </Box>
                  ) : col.key === "severity_name" ? (
                    <Chip
                      color={getSeverityColor(complaint[col.key])}
                      size="sm"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.8125rem",
                      }}
                    >
                      {complaint[col.key]}
                    </Chip>
                  ) : col.key === "harm_level_name" ? (
                    <Chip
                      color={getHarmLevelColor(complaint[col.key])}
                      size="sm"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.8125rem",
                      }}
                    >
                      {complaint[col.key] || "-"}
                    </Chip>
                  ) : col.key === "subcategory_name" ? (
                    <Box
                      sx={{
                        fontSize: "0.8125rem",
                        color: "#9ca3af",
                        fontWeight: 400,
                      }}
                    >
                      {complaint[col.key] || "-"}
                    </Box>
                  ) : col.key === "classification_en_label" ? (
                    <Box
                      sx={{
                        fontSize: "0.8125rem",
                        color: "#6b7280",
                        fontWeight: 400,
                      }}
                    >
                      {complaint[col.key] || "-"}
                    </Box>
                  ) : col.key === "patient_name" || col.key === "issuing_org_unit_name" ? (
                    <Box
                      sx={{
                        fontSize: "0.8125rem",
                        color: "#4b5563",
                        fontWeight: 500,
                      }}
                    >
                      {complaint[col.key] || "-"}
                    </Box>
                  ) : col.key === "status_name" ? (
                    <Chip
                      color={getStatusColor(complaint[col.key])}
                      size="sm"
                      variant="soft"
                      sx={{
                        fontWeight: 500,
                        fontSize: "0.75rem",
                      }}
                    >
                      {complaint[col.key]}
                    </Chip>
                  ) : col.key === "case_status_name" ? (
                    <Chip
                      color={getStatusColor(complaint[col.key])}
                      size="sm"
                      variant="outlined"
                      sx={{
                        fontWeight: 500,
                        fontSize: "0.75rem",
                      }}
                    >
                      {complaint[col.key] || "-"}
                    </Chip>
                  ) : col.key === "received_date" ? (
                    <Box sx={{ fontSize: "0.8125rem", color: "#6b7280" }}>
                      {new Date(complaint[col.key]).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Box>
                  ) : (
                    <Box sx={{ fontSize: "0.8125rem", color: "#6b7280" }}>
                      {complaint[col.key] || "-"}
                    </Box>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>

      {complaints.length === 0 && (
        <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
          No data available
        </Box>
      )}
    </Box>
  );
};

export default DataTable;
