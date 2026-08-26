// src/components/TableView/DataTable.js
import React from "react";
import { Box, Table, Chip, IconButton, Tooltip } from "@mui/joy";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RateReviewIcon from "@mui/icons-material/RateReview";
import MoodIcon from "@mui/icons-material/Mood";
import HistoryIcon from "@mui/icons-material/History";
import FlagIcon from "@mui/icons-material/Flag";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CampaignIcon from "@mui/icons-material/Campaign";
import BarChartIcon from "@mui/icons-material/BarChart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getRowTheme } from "../../utils/inboxTheme";
import { getBackendSortField } from "../../utils/tableViewSortFields";
import ColumnHeaderFilter from "./ColumnHeaderFilter";

// Columns that support header-based filtering (in addition to sorting).
// filterKey must match the key used in TableView.js's `filters` state / backend query param.
const HEADER_FILTER_COLUMNS = {
  domain_name: { filterKey: "domain_id", label: "Domain" },
  category_name: { filterKey: "category_id", label: "Category" },
  subcategory_name: { filterKey: "subcategory_id", label: "Subcategory" },
  classification_name: { filterKey: "classification_id", label: "Classification" },
  severity_name: { filterKey: "severity_id", label: "Severity" },
  stage_name: { filterKey: "stage_id", label: "Stage" },
  harm_level: { filterKey: "harm_level_id", label: "Harm Level" },
  clinical_risk_type_name: { filterKey: "clinical_risk_type_id", label: "Clinical Risk" },
  feedback_intent_type_name: { filterKey: "feedback_intent_type_id", label: "Feedback Intent" },
  source_name: { filterKey: "source_id", label: "Source" },
  status_name: { filterKey: "case_status_id", label: "Status" },
};

const normalizeSelectedIds = (value) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === "") return [];
  return [value];
};

const buildFilterOptions = (list, idKey, labelKeys) => {
  if (!Array.isArray(list)) return [];
  return list.map((item) => {
    const id = item[idKey] ?? item.id;
    let label;
    for (const k of labelKeys) {
      if (item[k]) {
        label = item[k];
        break;
      }
    }
    return { id, label: label || `#${id}` };
  });
};

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

// ─── Universal Case Theme helpers ────────────────────────────────────────────

const TYPE_ICON_MAP = {
  Campaign:    <CampaignIcon    sx={{ fontSize: 13, verticalAlign: "middle", mr: 0.5 }} />,
  BarChart:    <BarChartIcon    sx={{ fontSize: 13, verticalAlign: "middle", mr: 0.5 }} />,
  CheckCircle: <CheckCircleIcon sx={{ fontSize: 13, verticalAlign: "middle", mr: 0.5 }} />,
};

const BADGE_ICON_MAP = {
  Lock:         <LockIcon         sx={{ fontSize: 11 }} />,
  History:      <HistoryIcon      sx={{ fontSize: 11 }} />,
  Flag:         <FlagIcon         sx={{ fontSize: 11 }} />,
  WarningAmber: <WarningAmberIcon sx={{ fontSize: 11 }} />,
  Favorite:     <FavoriteIcon     sx={{ fontSize: 11 }} />,
};

// Subcase status → ownership level mapping (matches inbox logic)
const STATUS_TO_LEVEL = {
  SUBMITTED_TO_SECTION:             "section",
  RETURNED_TO_SECTION_FOR_REVISION: "section",
  SECTION_ACCEPTED_PENDING_DEPT:    "department",
  RETURNED_TO_DEPT_FOR_REVISION:    "department",
  DEPT_ACCEPTED_PENDING_ADMIN:      "administration",
};

function normalizeComplaintForTheme(complaint) {
  const wf = complaint.workflow_status || {};

  // Layer 1 — message type
  let messageType = "COMPLAINT";
  if (complaint.record_type_id === 2 || complaint.feedback_intent_type_id === 2) {
    messageType = "NOTICE";
  }

  // Layer 2 — clinical indicators (clinical_risk_type_id: 2=Red Flag, 3=Never Event)
  const riskId = complaint.clinical_risk_type_id;
  const isRedFlag    = riskId === 2;
  const isNeverEvent = riskId === 3;
  const isMorbidity  = Boolean(complaint.is_morbidity);

  // Layer 3 — workflow indicators
  const isForceClosed = Boolean(wf.force_closed);
  const isLate        = Boolean(complaint.is_late);

  // Layer 4 — ownership from most-recent open subcase
  let currentLevel = null;
  if (Array.isArray(wf.subcases) && wf.subcases.length > 0) {
    const openSubcase = [...wf.subcases].reverse().find(sc => STATUS_TO_LEVEL[sc.status]);
    if (openSubcase) currentLevel = STATUS_TO_LEVEL[openSubcase.status];
  }

  const clinicalIndicators = [];
  if (isNeverEvent) clinicalIndicators.push("NEVER_EVENT");
  if (isRedFlag)    clinicalIndicators.push("RED_FLAG");
  if (isMorbidity)  clinicalIndicators.push("MORBIDITY");

  const workflowIndicators = [];
  if (isForceClosed) workflowIndicators.push("FORCE_CLOSED");
  if (isLate)        workflowIndicators.push("LATE");

  return { messageType, isForceClosed, isLate, isRedFlag, isNeverEvent, isMorbidity,
           clinicalIndicators, workflowIndicators, currentLevel };
}

const getStatusColor = (status) => {
  const lower = status?.toLowerCase() || "";
  if (lower.includes("open") || lower.includes("pending") || lower.includes("مفتوح")) return "warning";
  if (lower.includes("progress") || lower.includes("reviewing") || lower.includes("جاري")) return "primary";
  if (lower.includes("closed") || lower.includes("resolved") || lower.includes("مغلق")) return "success";
  return "neutral";
};

const DataTable = ({ complaints, sortBy, sortOrder, onSort, onRowClick, viewMode, customView, onEdit, onDelete, onForceClose, canForceClose, filterOptions, filters, onHeaderFilterChange, onPublish, onMarkReady, onInspect, onAddSatisfaction, isReadOnly }) => {
  
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
  
  // Options for a header filter popover, narrowed by the hierarchy of
  // Domain -> Category -> Subcategory -> Classification selections already applied.
  const getHeaderFilterOptions = (colKey) => {
    const selectedDomainIds = normalizeSelectedIds(filters?.domain_id);
    const selectedCategoryIds = normalizeSelectedIds(filters?.category_id);
    const selectedSubcategoryIds = normalizeSelectedIds(filters?.subcategory_id);

    switch (colKey) {
      case "domain_name":
        return buildFilterOptions(filterOptions?.domains, "id", ["name_en", "name_ar", "name"]);
      case "category_name": {
        let list = filterOptions?.categories || [];
        if (selectedDomainIds.length) list = list.filter((c) => selectedDomainIds.includes(c.domain_id));
        return buildFilterOptions(list, "id", ["name_en", "name_ar", "name"]);
      }
      case "subcategory_name": {
        let list = filterOptions?.subcategories || [];
        if (selectedCategoryIds.length) list = list.filter((s) => selectedCategoryIds.includes(s.category_id));
        return buildFilterOptions(list, "id", ["name_en", "name_ar", "name"]);
      }
      case "classification_name": {
        let list = filterOptions?.classifications_en || [];
        if (selectedSubcategoryIds.length) {
          list = list.filter((cl) => selectedSubcategoryIds.includes(cl.SubCategoryID ?? cl.subcategory_id));
        }
        return list.map((item) => {
          const id = item.ClassificationID ?? item.id;
          return {
            id,
            label: item.Classification_EN || item.Classification_AR || item.name || `#${id}`,
          };
        });
      }
      case "severity_name":
        return buildFilterOptions(filterOptions?.severities, "id", ["name_en", "name_ar", "name"]);
      case "harm_level":
        return buildFilterOptions(filterOptions?.harm_levels, "id", ["name_en", "name_ar", "name"]);
      case "stage_name":
        return buildFilterOptions(filterOptions?.stages, "id", ["name_en", "name_ar", "name"]);
      case "clinical_risk_type_name":
        return buildFilterOptions(filterOptions?.clinical_risk_types, "id", ["name_en", "name_ar", "name"]);
      case "feedback_intent_type_name":
        return buildFilterOptions(filterOptions?.feedback_intent_types, "id", ["name_en", "name_ar", "name"]);
      case "source_name":
        return buildFilterOptions(filterOptions?.sources, "id", ["name_en", "name_ar", "name"]);
      case "status_name":
        return buildFilterOptions(filterOptions?.statuses, "id", ["name_en", "name_ar", "name"]);
      default:
        return [];
    }
  };

  const handleHeaderFilterApply = (filterKey, ids) => {
    if (!onHeaderFilterChange) return;
    onHeaderFilterChange({ ...filters, [filterKey]: ids.length ? ids : null });
  };

  const renderSortIcon = (column) => {
    const isActive = sortBy === getBackendSortField(column);
    if (!isActive) return null;
    return sortOrder === "asc" ? (
      <ArrowUpwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
    ) : (
      <ArrowDownwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
    );
  };

  const SortableHeader = ({ column, children }) => {
    const isActive = sortBy === getBackendSortField(column);
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
    { key: "record_type", label: "Type", sortable: false, showKey: "ShowRecordType", widthFlex: 1 },
    { key: "incident_number", label: "Incident #", sortable: true, showKey: "ShowIncidentNumber", widthFlex: 1 },
    { key: "complaint_number", label: "Case #", sortable: true, showKey: "ShowIncidentRequestCaseID", widthFlex: 1 },
    { key: "complaint_text", label: "Complaint Text", sortable: false, showKey: "ShowComplaintText", widthFlex: 3 },
    { key: "complaint_summary", label: "Complaint Summary", sortable: true, showKey: "ShowComplaintSummary", widthFlex: 2 },
    { key: "immediate_action", label: "Immediate Action", sortable: false, showKey: "ShowImmediateAction", widthFlex: 2.1 },
    { key: "taken_action", label: "Taken Action", sortable: false, showKey: "ShowTakenAction", widthFlex: 2.1 },
    { key: "received_date", label: "Received Date", sortable: true, showKey: "ShowFeedbackRecievedDate", widthFlex: 1 },
    { key: "incident_date", label: "Incident Date", sortable: true, showKey: "ShowIncidentDate", widthFlex: 1 },
    { key: "patient_name", label: "Patient Name", sortable: true, showKey: "ShowPatientName", widthFlex: 1 },
    { key: "issuing_org_unit_name", label: "Issuing Dept", sortable: false, showKey: "ShowIssuingOrgUnitID", widthFlex: 1 },
    { key: "created_at", label: "Created At", sortable: true, showKey: "ShowCreatedAt", widthFlex: 1 },
    { key: "publication_date", label: "Publication Date", sortable: true, showKey: "ShowPublicationDate", widthFlex: 1 },
    { key: "created_by_user_id", label: "Created By", sortable: false, showKey: "ShowCreatedByUserID", widthFlex: 1 },
    { key: "is_in_patient", label: "In Patient", sortable: false, showKey: "ShowIsInPatient", widthFlex: 1 },
    { key: "clinical_risk_type_name", label: "Clinical Risk", sortable: true, showKey: "ShowClinicalRiskTypeID", widthFlex: 1 },
    { key: "feedback_intent_type_name", label: "Feedback Intent", sortable: true, showKey: "ShowFeedbackIntentTypeID", widthFlex: 1 },
    { key: "building_name", label: "Building", sortable: false, showKey: "ShowBuildingID", widthFlex: 1 },
    { key: "domain_name", label: "Domain", sortable: true, showKey: "ShowDomainID", widthFlex: 1 },
    { key: "category_name", label: "Category", sortable: true, showKey: "ShowCategoryID", widthFlex: 1 },
    { key: "subcategory_name", label: "Subcategory", sortable: true, showKey: "ShowSubCategoryID", widthFlex: 1 },
    { key: "classification_name", label: "Classification", sortable: true, showKey: "ShowClassificationID", widthFlex: 1 },
    { key: "severity_name", label: "Severity", sortable: true, showKey: "ShowSeverityID", widthFlex: 1 },
    { key: "stage_name", label: "Stage", sortable: true, showKey: "ShowStageID", widthFlex: 1 },
    { key: "harm_level", label: "Harm Level", sortable: true, showKey: "ShowHarmLevelID", widthFlex: 1 },
    { key: "status_name", label: "Status", sortable: true, showKey: "ShowCaseStatusID", widthFlex: 1 },
    { key: "source_name", label: "Source", sortable: true, showKey: "ShowSourceID", widthFlex: 1 },
    { key: "explanation_status_name", label: "Explanation Status", sortable: false, showKey: "ShowExplanationStatusID", widthFlex: 1 },
    { key: "section_answer", label: "Section Reply", sortable: false, showKey: "ShowSectionAnswer", widthFlex: 2 },
    { key: "department_answer", label: "Dept Reply", sortable: false, showKey: "ShowDepartmentAnswer", widthFlex: 2 },
    { key: "administration_answer", label: "Admin Reply", sortable: false, showKey: "ShowAdministrationAnswer", widthFlex: 2 },
    { key: "section_entry", label: "Section Entry", sortable: true, showKey: "ShowSectionEntry", widthFlex: 1 },
    { key: "section_deadline", label: "Section Deadline", sortable: true, showKey: "ShowSectionDeadline", widthFlex: 1 },
    { key: "department_entry", label: "Dept Entry", sortable: true, showKey: "ShowDepartmentEntry", widthFlex: 1 },
    { key: "department_deadline", label: "Dept Deadline", sortable: true, showKey: "ShowDepartmentDeadline", widthFlex: 1 },
    { key: "administration_entry", label: "Admin Entry", sortable: true, showKey: "ShowAdministrationEntry", widthFlex: 1 },
    { key: "administration_deadline", label: "Admin Deadline", sortable: true, showKey: "ShowAdministrationDeadline", widthFlex: 1 },
    { key: "rca_replies", label: "RCA Replies", sortable: true, showKey: "ShowRcaReplies", widthFlex: 2 },
    { key: "customer_service_decision", label: "Customer Service Decision", sortable: true, showKey: "ShowCustomerServiceDecision", widthFlex: 2 },
    { key: "customer_service_decision_date", label: "Decision Date", sortable: true, showKey: "ShowCustomerServiceDecisionDate", widthFlex: 1 },
    { key: "last_edited", label: "Last Edited", sortable: true, showKey: "ShowLastEdited", widthFlex: 1 },
    { key: "target_department_name", label: "Target Department", sortable: true, showKey: "ShowTargetDepartment", widthFlex: 1 },
    { key: "satisfaction_status_name", label: "Satisfaction", sortable: false, showKey: "ShowSatisfactionStatus", widthFlex: 1 },
    { key: "satisfaction_date", label: "Follow-up Date", sortable: false, showKey: "ShowSatisfactionDate", widthFlex: 1 },
    { key: "red_flag_indicator", label: "Red Flag", sortable: false, showKey: "ShowRedFlagIndicator", widthFlex: 1 },
    { key: "never_event_indicator", label: "Never Event", sortable: false, showKey: "ShowNeverEventIndicator", widthFlex: 1 },
    { key: "morbidity_indicator", label: "Morbidity", sortable: false, showKey: "ShowMorbidityIndicator", widthFlex: 1 },
    { key: "late_indicator", label: "Late", sortable: false, showKey: "ShowLateIndicator", widthFlex: 1 },
    { key: "force_closed_indicator", label: "Force Closed", sortable: false, showKey: "ShowForceClosedIndicator", widthFlex: 1 },
  ];

  // Define columns based on view mode or custom view
  const completeViewColumns = [
    { key: "record_type", label: "Type", sortable: false, widthFlex: 1 },
    { key: "incident_number", label: "Incident #", sortable: true, widthFlex: 1 },
    { key: "complaint_number", label: "Case #", sortable: true, widthFlex: 1 },
    { key: "received_date", label: "Received Date", sortable: true, widthFlex: 1 },
    { key: "incident_date", label: "Incident Date", sortable: true, widthFlex: 1 },
    { key: "patient_name", label: "Patient Name", sortable: true, widthFlex: 1 },
    { key: "issuing_org_unit_name", label: "Issuing Dept", sortable: false, widthFlex: 1 },
    { key: "domain_name", label: "Domain", sortable: true, widthFlex: 1 },
    { key: "category_name", label: "Category", sortable: true, widthFlex: 1 },
    { key: "subcategory_name", label: "Subcategory", sortable: true, widthFlex: 1 },
    { key: "classification_name", label: "Classification", sortable: true, widthFlex: 1 },
    { key: "severity_name", label: "Severity", sortable: true, widthFlex: 1 },
    { key: "stage_name", label: "Stage", sortable: true, widthFlex: 1 },
    { key: "harm_level", label: "Harm Level", sortable: true, widthFlex: 1 },
    { key: "status_name", label: "Status", sortable: true, widthFlex: 1 },
    { key: "publication_date", label: "Publication Date", sortable: true, widthFlex: 1 },
    { key: "last_edited", label: "Last Edited", sortable: true, widthFlex: 1 },
  ];

  const simplifiedViewColumns = [
    { key: "complaint_number", label: "Complaint #", sortable: true, widthFlex: 1 },
    { key: "received_date", label: "Received Date", sortable: true, widthFlex: 1 },
    { key: "severity_name", label: "Severity", sortable: true, widthFlex: 1 },
    { key: "status_name", label: "Status", sortable: true, widthFlex: 1 },
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
            {columns.map((col) => {
              const headerFilterConfig = HEADER_FILTER_COLUMNS[col.key];
              if (col.sortable && headerFilterConfig) {
                const options = getHeaderFilterOptions(col.key);
                const selected = normalizeSelectedIds(filters?.[headerFilterConfig.filterKey]);
                return (
                  <SortableHeader key={col.key} column={col.key}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <span>{col.label}</span>
                      <ColumnHeaderFilter
                        label={headerFilterConfig.label}
                        options={options}
                        selected={selected}
                        onApply={(ids) => handleHeaderFilterApply(headerFilterConfig.filterKey, ids)}
                      />
                    </Box>
                  </SortableHeader>
                );
              }
              return col.sortable ? (
                <SortableHeader key={col.key} column={col.key}>
                  {col.label}
                </SortableHeader>
              ) : (
                <th key={col.key}>{col.label}</th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => {
            const themeData = normalizeComplaintForTheme(complaint);
            const rowTheme = getRowTheme(themeData);
            return (
            <tr key={complaint.id} style={rowTheme.rowStyle}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.key === "actions" ? (
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                      {!isReadOnly && (
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
                      )}
                      {complaint.case_status_name === "Draft" && onMarkReady && (
                        <Tooltip title="Mark as Ready to Send" size="sm">
                          <IconButton
                            size="sm"
                            variant="plain"
                            color="warning"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkReady(complaint.id);
                            }}
                            sx={{ fontSize: 18 }}
                          >
                            <CheckCircleOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {complaint.case_status_name === "Ready to Send" && onPublish && (
                        <Tooltip title="Publish into workflow" size="sm">
                          <IconButton
                            size="sm"
                            variant="plain"
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPublish(complaint.id);
                            }}
                            sx={{ fontSize: 18 }}
                          >
                            <SendIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onInspect && complaint.case_status_name !== "Draft" && complaint.case_status_name !== "Ready to Send" && (
                        <Tooltip title="Inspect" size="sm">
                          <IconButton
                            size="sm"
                            variant="plain"
                            color="neutral"
                            onClick={(e) => {
                              e.stopPropagation();
                              onInspect(complaint.incident_id, complaint.id);
                            }}
                            sx={{ fontSize: 18 }}
                          >
                            <RateReviewIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onAddSatisfaction && (
                        <Tooltip title={complaint.satisfaction_status_name ? "Edit Satisfaction" : "Add Satisfaction"} size="sm">
                          <IconButton
                            size="sm"
                            variant="plain"
                            color={complaint.satisfaction_status_name ? "success" : "neutral"}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddSatisfaction(complaint);
                            }}
                            sx={{ fontSize: 18 }}
                          >
                            <MoodIcon />
                          </IconButton>
                        </Tooltip>
                      )}
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
                  ) : col.key === "record_type" ? (
                    <Chip
                      size="sm"
                      variant="soft"
                      color={rowTheme.typeChipColor}
                      startDecorator={rowTheme.typeIconKey ? TYPE_ICON_MAP[rowTheme.typeIconKey] : null}
                      sx={{ fontSize: "0.75rem", fontWeight: 600 }}
                    >
                      {rowTheme.typeLabel}
                    </Chip>
                  ) : col.key === "incident_number" ? (
                    <Box sx={{ fontWeight: 700, color: "#4f46e5", fontSize: "0.875rem", whiteSpace: "nowrap" }}>
                      {complaint.incident_number || "—"}
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
                    complaint[col.key] ? (
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
                    ) : <Box sx={{ display: "inline-block", px: 1.5, py: 0.5, borderRadius: "4px", fontSize: "0.8125rem", fontWeight: 400, bgcolor: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0" }}>—</Box>
                  ) : col.key === "category_name" ? (
                    complaint[col.key] ? (
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
                    ) : <Box sx={{ display: "inline-block", px: 1.5, py: 0.5, borderRadius: "4px", fontSize: "0.8125rem", fontWeight: 400, bgcolor: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0" }}>—</Box>
                  ) : col.key === "stage_name" ? (
                    complaint[col.key] ? (
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
                    ) : <Box sx={{ display: "inline-block", px: 1.5, py: 0.5, borderRadius: "4px", fontSize: "0.8125rem", fontWeight: 400, bgcolor: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0" }}>—</Box>
                  ) : col.key === "severity_name" ? (
                    complaint[col.key] ? (
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
                    ) : <Box sx={{ display: "inline-block", px: 1.5, py: 0.5, borderRadius: "4px", fontSize: "0.8125rem", fontWeight: 400, bgcolor: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0" }}>—</Box>
                  ) : col.key === "harm_level" ? (
                    complaint[col.key] ? (
                      <Chip
                        color={getHarmLevelColor(complaint[col.key])}
                        size="sm"
                        sx={{ fontWeight: 700, fontSize: "0.8125rem" }}
                      >
                        {complaint[col.key]}
                      </Chip>
                    ) : <Box sx={{ display: "inline-block", px: 1.5, py: 0.5, borderRadius: "4px", fontSize: "0.8125rem", fontWeight: 400, bgcolor: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0" }}>—</Box>
                  ) : col.key === "subcategory_name" ? (
                    complaint.subcategory_name ? (
                      <Box sx={{ fontSize: "0.8125rem", color: "#9ca3af", fontWeight: 400 }}>
                        {complaint.subcategory_name}
                      </Box>
                    ) : <Box sx={{ display: "inline-block", px: 1.5, py: 0.5, borderRadius: "4px", fontSize: "0.8125rem", fontWeight: 400, bgcolor: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0" }}>—</Box>
                  ) : col.key === "classification_name" ? (
                    (complaint.classification_name || getClassificationName(complaint.classification_id)) !== "—" && (complaint.classification_name || getClassificationName(complaint.classification_id)) ? (
                      <Box sx={{ fontSize: "0.8125rem", color: "#6b7280", fontWeight: 400 }}>
                        {complaint.classification_name || getClassificationName(complaint.classification_id)}
                      </Box>
                    ) : <Box sx={{ display: "inline-block", px: 1.5, py: 0.5, borderRadius: "4px", fontSize: "0.8125rem", fontWeight: 400, bgcolor: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0" }}>—</Box>
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
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                      <Chip
                        color={getStatusColor(complaint[col.key])}
                        size="sm"
                        variant="soft"
                        sx={{ fontWeight: 500, fontSize: "0.75rem" }}
                      >
                        {complaint[col.key]}
                      </Chip>
                      {/* Theme badges: workflow + clinical indicators */}
                      {rowTheme.allBadges.length > 0 && (
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", justifyContent: "center" }}>
                          {rowTheme.visibleBadges.map(badge => (
                            <Tooltip key={badge.key} title={badge.label} size="sm">
                              <Chip
                                size="sm"
                                variant="soft"
                                color={badge.color}
                                startDecorator={BADGE_ICON_MAP[badge.iconKey]}
                                sx={{ fontSize: "0.7rem", fontWeight: 600, px: 0.75 }}
                              >
                                {badge.label}
                              </Chip>
                            </Tooltip>
                          ))}
                          {rowTheme.overflowCount > 0 && (
                            <Tooltip title={rowTheme.overflowTooltip} size="sm">
                              <Chip
                                size="sm"
                                variant="outlined"
                                color="neutral"
                                sx={{ fontSize: "0.7rem", px: 0.75 }}
                              >
                                +{rowTheme.overflowCount}
                              </Chip>
                            </Tooltip>
                          )}
                        </Box>
                      )}
                      {/* Ownership chip */}
                      {rowTheme.ownershipChip && (
                        <Chip
                          size="sm"
                          variant="soft"
                          color={rowTheme.ownershipChip.color}
                          sx={{ fontSize: "0.7rem", ...(rowTheme.ownershipChip.sx || {}) }}
                        >
                          {rowTheme.ownershipChip.label}
                        </Chip>
                      )}
                    </Box>
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
                  ) : col.key === "is_in_patient" ? (
                    <Box sx={{ fontSize: "0.8125rem", color: "#6b7280" }}>
                      {complaint.is_inpatient === true || complaint.is_in_patient === true ? "Inpatient" :
                       complaint.is_inpatient === false || complaint.is_in_patient === false ? "Outpatient" : "—"}
                    </Box>
                  ) : col.key === "immediate_action" || col.key === "taken_action" ? (
                    complaint[col.key] ? (
                      <Box
                        sx={{
                          fontSize: "0.8125rem",
                          color: "#374151",
                          textAlign: "start",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          lineHeight: 1.6,
                          maxHeight: "4.8em",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          direction: "auto",
                        }}
                        title={complaint[col.key]}
                      >
                        {complaint[col.key]}
                      </Box>
                    ) : <Box sx={{ display: "inline-block", px: 1.5, py: 0.5, borderRadius: "4px", fontSize: "0.8125rem", fontWeight: 400, bgcolor: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0" }}>—</Box>
                  ) : col.key === "section_answer" || col.key === "department_answer" || col.key === "administration_answer" || col.key === "rca_replies" || col.key === "customer_service_decision" || col.key === "complaint_summary" ? (
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
                      {complaint[col.key] || "—"}
                    </Box>
                  ) : col.key === "received_date" || col.key === "created_at" || col.key === "incident_date" ? (
                    <Box sx={{ fontSize: "0.8125rem", color: "#6b7280" }}>
                      {complaint[col.key] ? new Date(complaint[col.key]).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }) : "—"}
                    </Box>
                  ) : col.key === "last_edited" || col.key === "satisfaction_date" || col.key === "publication_date" || col.key === "customer_service_decision_date" || col.key === "section_entry" || col.key === "section_deadline" || col.key === "department_entry" || col.key === "department_deadline" || col.key === "administration_entry" || col.key === "administration_deadline" ? (
                    <Box sx={{ fontSize: "0.8125rem", color: complaint[col.key] ? "#374151" : "#94a3b8", fontStyle: complaint[col.key] ? "normal" : "italic" }}>
                      {complaint[col.key] ? new Date(complaint[col.key]).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }) : "—"}
                    </Box>
                  ) : col.key === "target_department_name" || col.key === "satisfaction_status_name" ? (
                    <Box sx={{ fontSize: "0.8125rem", color: complaint[col.key] ? "#4b5563" : "#94a3b8", fontStyle: complaint[col.key] ? "normal" : "italic" }}>
                      {complaint[col.key] || "—"}
                    </Box>
                  ) : col.key === "red_flag_indicator" ? (
                    themeData.isRedFlag ? (
                      <Chip size="sm" variant="soft" color="danger" startDecorator={<FlagIcon sx={{ fontSize: 12 }} />}>Yes</Chip>
                    ) : <Box sx={{ fontSize: "0.8125rem", color: "#94a3b8" }}>—</Box>
                  ) : col.key === "never_event_indicator" ? (
                    themeData.isNeverEvent ? (
                      <Chip size="sm" variant="soft" color="danger" startDecorator={<WarningAmberIcon sx={{ fontSize: 12 }} />}>Yes</Chip>
                    ) : <Box sx={{ fontSize: "0.8125rem", color: "#94a3b8" }}>—</Box>
                  ) : col.key === "morbidity_indicator" ? (
                    themeData.isMorbidity ? (
                      <Chip size="sm" variant="soft" color="warning" startDecorator={<FavoriteIcon sx={{ fontSize: 12 }} />}>Yes</Chip>
                    ) : <Box sx={{ fontSize: "0.8125rem", color: "#94a3b8" }}>—</Box>
                  ) : col.key === "late_indicator" ? (
                    themeData.isLate ? (
                      <Chip size="sm" variant="soft" color="warning" startDecorator={<HistoryIcon sx={{ fontSize: 12 }} />}>Yes</Chip>
                    ) : <Box sx={{ fontSize: "0.8125rem", color: "#94a3b8" }}>—</Box>
                  ) : col.key === "force_closed_indicator" ? (
                    themeData.isForceClosed ? (
                      <Chip size="sm" variant="soft" color="danger" startDecorator={<LockIcon sx={{ fontSize: 12 }} />}>Yes</Chip>
                    ) : <Box sx={{ fontSize: "0.8125rem", color: "#94a3b8" }}>—</Box>
                  ) : (
                    <Box sx={{ fontSize: "0.8125rem", color: "#6b7280" }}>
                      {complaint[col.key] != null ? String(complaint[col.key]) : "—"}
                    </Box>
                  )}
                </td>
              ))}
            </tr>
            );
          })}
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
