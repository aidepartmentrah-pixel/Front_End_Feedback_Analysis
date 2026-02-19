// src/components/TableView/DataTable.js
import React from "react";
import { Box, Table, Chip, IconButton, Tooltip } from "@mui/joy";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock";

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

const DataTable = ({ complaints, sortBy, sortOrder, onSort, onRowClick, viewMode, customView, onEdit, onDelete, onForceClose, canForceClose, filterOptions }) => {
  
  // Log filterOptions once for debugging
  React.useEffect(() => {
    if (filterOptions?.subcategories) {
      console.log("🔍 Available subcategories:", filterOptions.subcategories);
      console.log("🔍 First subcategory structure:", filterOptions.subcategories[0]);
    }
  }, [filterOptions]);
  
  // Helper function to get subcategory name from ID
  const getSubcategoryName = (subcategoryId) => {
    if (!subcategoryId) return "—";
    if (!filterOptions?.subcategories || filterOptions.subcategories.length === 0) {
      console.error("❌ No subcategories available in filterOptions");
      return `Subcat ${subcategoryId}`;
    }
    
    // Find subcategory by ID with multiple field name variations
    const subcategory = filterOptions.subcategories.find(s => {
      const idMatch = s.id == subcategoryId || 
                      s.SubCategoryID == subcategoryId || 
                      s.subcategory_id == subcategoryId;
      return idMatch;
    });
    
    if (!subcategory) {
      console.error(`❌ Subcategory ID ${subcategoryId} not found. Available IDs:`, 
        filterOptions.subcategories.map(s => s.id || s.SubCategoryID || s.subcategory_id).slice(0, 10)
      );
      return `Subcat ${subcategoryId}`;
    }
    
    // Try all possible name fields
    const name = subcategory.name || 
                 subcategory.SubCategory_EN || 
                 subcategory.subcategory_name || 
                 subcategory.SubCategory_AR ||
                 subcategory.label ||
                 `Subcat ${subcategoryId}`;
    
    return name;
  };
  
  // Helper function to get classification name from ID
  const getClassificationName = (classificationId) => {
    if (!classificationId || !filterOptions?.classifications_en) return "—";
    const classification = filterOptions.classifications_en.find(c => c.id === classificationId || c.ClassificationID === classificationId);
    return classification?.Classification_EN || classification?.name || classification?.classification_name || `Class ${classificationId}`;
  };
  
  const renderSortIcon = (column) => {
    // Handle complaint_number column which maps to 'id' in backend
    const isActive = sortBy === column || (column === "complaint_number" && sortBy === "id");
    if (!isActive) return null;
    return sortOrder === "asc" ? (
      <ArrowUpwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
    ) : (
      <ArrowDownwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
    );
  };

  const SortableHeader = ({ column, children }) => {
    // Handle complaint_number column which maps to 'id' in backend
    const isActive = sortBy === column || (column === "complaint_number" && sortBy === "id");
    return (
      <th
        onClick={() => onSort(column)}
        style={{
          cursor: "pointer",
          userSelect: "none",
          whiteSpace: "nowrap",
          background: isActive ? "#f3f4f6" : "transparent",
          transition: "background-color 0.15s ease",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "#f9fafb";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
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
  };

  // Define all available columns with their mapping
  // widthFlex: relative width multiplier (default 1, complaint_text uses 3 for 3x width)
  const allColumnsDefinition = [
    { key: "complaint_number", label: "Complaint #", sortable: true, showKey: "ShowIncidentRequestCaseID", widthFlex: 1 },
    { key: "complaint_text", label: "Complaint Text", sortable: false, showKey: "ShowComplaintText", widthFlex: 3 },
    { key: "immediate_action", label: "Immediate Action", sortable: false, showKey: "ShowImmediateAction", widthFlex: 1 },
    { key: "taken_action", label: "Taken Action", sortable: false, showKey: "ShowTakenAction", widthFlex: 1 },
    { key: "received_date", label: "Received Date", sortable: true, showKey: "ShowFeedbackRecievedDate", widthFlex: 1 },
    { key: "patient_name", label: "Patient Name", sortable: false, showKey: "ShowPatientName", widthFlex: 1 },
    { key: "issuing_org_unit_name", label: "Issuing Dept", sortable: false, showKey: "ShowIssuingOrgUnitID", widthFlex: 1 },
    { key: "created_at", label: "Created At", sortable: false, showKey: "ShowCreatedAt", widthFlex: 1 },
    { key: "created_by_user_id", label: "Created By", sortable: false, showKey: "ShowCreatedByUserID", widthFlex: 1 },
    { key: "is_in_patient", label: "In Patient", sortable: false, showKey: "ShowIsInPatient", widthFlex: 1 },
    { key: "clinical_risk_type_name", label: "Clinical Risk", sortable: false, showKey: "ShowClinicalRiskTypeID", widthFlex: 1 },
    { key: "feedback_intent_type_name", label: "Feedback Intent", sortable: false, showKey: "ShowFeedbackIntentTypeID", widthFlex: 1 },
    { key: "building_name", label: "Building", sortable: false, showKey: "ShowBuildingID", widthFlex: 1 },
    { key: "domain_name", label: "Domain", sortable: false, showKey: "ShowDomainID", widthFlex: 1 },
    { key: "category_name", label: "Category", sortable: false, showKey: "ShowCategoryID", widthFlex: 1 },
    { key: "subcategory_name", label: "Subcategory", sortable: false, showKey: "ShowSubCategoryID", widthFlex: 1 },
    { key: "classification_name", label: "Classification", sortable: false, showKey: "ShowClassificationID", widthFlex: 1 },
    { key: "severity_name", label: "Severity", sortable: false, showKey: "ShowSeverityID", widthFlex: 1 },
    { key: "stage_name", label: "Stage", sortable: false, showKey: "ShowStageID", widthFlex: 1 },
    { key: "harm_level", label: "Harm Level", sortable: false, showKey: "ShowHarmLevelID", widthFlex: 1 },
    { key: "status_name", label: "Status", sortable: false, showKey: "ShowCaseStatusID", widthFlex: 1 },
    { key: "source_name", label: "Source", sortable: false, showKey: "ShowSourceID", widthFlex: 1 },
    { key: "explanation_status_name", label: "Explanation Status", sortable: false, showKey: "ShowExplanationStatusID", widthFlex: 1 },
  ];

  // Define columns based on view mode or custom view
  const completeViewColumns = [
    { key: "complaint_number", label: "Complaint #", sortable: true, widthFlex: 1 },
    { key: "received_date", label: "Received Date", sortable: true, widthFlex: 1 },
    { key: "patient_name", label: "Patient Name", sortable: false, widthFlex: 1 },
    { key: "issuing_org_unit_name", label: "Issuing Dept", sortable: false, widthFlex: 1 },
    { key: "domain_name", label: "Domain", sortable: false, widthFlex: 1 },
    { key: "category_name", label: "Category", sortable: false, widthFlex: 1 },
    { key: "subcategory_name", label: "Subcategory", sortable: false, widthFlex: 1 },
    { key: "classification_name", label: "Classification", sortable: false, widthFlex: 1 },
    { key: "severity_name", label: "Severity", sortable: false, widthFlex: 1 },
    { key: "stage_name", label: "Stage", sortable: false, widthFlex: 1 },
    { key: "harm_level", label: "Harm Level", sortable: false, widthFlex: 1 },
    { key: "status_name", label: "Status", sortable: false, widthFlex: 1 },
  ];

  const simplifiedViewColumns = [
    { key: "complaint_number", label: "Complaint #", sortable: true, widthFlex: 1 },
    { key: "received_date", label: "Received Date", sortable: true, widthFlex: 1 },
    { key: "severity_name", label: "Severity", sortable: false, widthFlex: 1 },
    { key: "status_name", label: "Status", sortable: false, widthFlex: 1 },
  ];

  // If custom view is selected, filter columns based on ShowX flags
  let columns;
  if (customView) {
    columns = allColumnsDefinition.filter(col => col.showKey === null || customView[col.showKey] === true);
  } else {
    columns = viewMode === "complete" ? completeViewColumns : simplifiedViewColumns;
  }
  
  // Add Actions column at the end
  columns = [...columns, { key: "actions", label: "Actions", sortable: false, widthFlex: 1 }];

  // Calculate total flex units for percentage-based widths
  const totalFlex = columns.reduce((sum, col) => sum + (col.widthFlex || 1), 0);

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
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
        }}
      >
        <colgroup>
          {columns.map((col) => (
            <col 
              key={col.key} 
              style={{ width: `${((col.widthFlex || 1) / totalFlex) * 100}%` }} 
            />
          ))}
        </colgroup>
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
            <tr key={complaint.id}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.key === "actions" ? (
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                      <Tooltip title="Edit complaint" size="sm">
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEdit) onEdit(complaint.id);
                          }}
                          sx={{ fontSize: 18 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {canForceClose && complaint.workflow_status?.open_subcase_count > 0 && (
                        <Tooltip title={`Force close case and ${complaint.workflow_status.open_subcase_count} subcase(s)`} size="sm">
                          <IconButton
                            size="sm"
                            variant="plain"
                            color="danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onForceClose) onForceClose(complaint);
                            }}
                            sx={{ fontSize: 18 }}
                          >
                            <LockIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  ) : col.key === "complaint_number" ? (
                    <Box 
                      sx={{ 
                        fontWeight: 600, 
                        color: "#0f172a", 
                        fontSize: "0.9375rem",
                      }}
                    >
                      {complaint[col.key]}
                    </Box>
                  ) : col.key === "complaint_text" ? (
                    <Box 
                      sx={{ 
                        fontSize: "0.8125rem", 
                        color: "#4b5563",
                        textAlign: "center",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        lineHeight: 1.5,
                        maxHeight: "4.5em",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                      }}
                      title={complaint[col.key] || ""}
                    >
                      {complaint[col.key] || "-"}
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
                  ) : col.key === "harm_level" ? (
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
                      {complaint.subcategory_name || "—"}
                    </Box>
                  ) : col.key === "classification_name" ? (
                    <Box
                      sx={{
                        fontSize: "0.8125rem",
                        color: "#6b7280",
                        fontWeight: 400,
                      }}
                    >
                      {complaint.classification_name || getClassificationName(complaint.classification_id)}
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
                  ) : col.key === "received_date" || col.key === "created_at" ? (
                    <Box sx={{ fontSize: "0.8125rem", color: "#6b7280" }}>
                      {new Date(complaint[col.key]).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
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
