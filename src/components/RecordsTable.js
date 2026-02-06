// src/components/RecordsTable.js
import React, { useState } from "react";
import {
  Table,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Sheet,
  Typography,
  Modal,
  ModalDialog,
  ModalClose,
} from "@mui/joy";
import { Link } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DescriptionIcon from "@mui/icons-material/Description";
import { VIEW_CONFIGURATIONS } from "./TableView/ViewSelector";

const RecordsTable = ({ records, filters, selectedView = "complete" }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [textModalOpen, setTextModalOpen] = useState(false);
  const [selectedTextData, setSelectedTextData] = useState(null);

  // Get all views (predefined + custom from localStorage)
  const getAllViews = () => {
    try {
      const customViewsData = localStorage.getItem("customTableViews");
      const customViews = customViewsData ? JSON.parse(customViewsData) : [];
      const allViews = { ...VIEW_CONFIGURATIONS };
      
      // Add custom views to the configurations (ensure it's an array)
      if (Array.isArray(customViews)) {
        customViews.forEach(view => {
          allViews[view.name] = view;
        });
      }
      
      return allViews;
    } catch (error) {
      console.error("Error loading custom views:", error);
      return VIEW_CONFIGURATIONS;
    }
  };

  // Get visible columns from selected view
  const allViews = getAllViews();
  const visibleColumns = allViews[selectedView]?.columns || VIEW_CONFIGURATIONS.complete.columns;

  // Helper to check if column should be shown
  const shouldShowColumn = (columnKey) => {
    return visibleColumns.includes(columnKey);
  };

  // Handle viewing text details
  const handleViewText = (record) => {
    setSelectedTextData(record);
    setTextModalOpen(true);
  };

  // Column configuration with labels
  const columnConfig = {
    record_id: { label: "Record ID", sortKey: "record_id" },
    created_at: { label: "Date Added", sortKey: "created_at" },
    feedback_received_date: { label: "Feedback Date", sortKey: "feedback_received_date" },
    patient_full_name: { label: "Patient Name", sortKey: "patient_full_name" },
    issuing_department: { label: "Issuing Dept", sortKey: "issuing_department" },
    target_department: { label: "Target Dept", sortKey: "target_department" },
    source_1: { label: "Source", sortKey: "source_1" },
    feedback_type: { label: "Type", sortKey: "feedback_type" },
    domain: { label: "Domain", sortKey: "domain" },
    category: { label: "Category", sortKey: "category_label" },
    sub_category: { label: "Subcategory", sortKey: "subcategory_label" },
    classification_en_label: { label: "Classification", sortKey: "classification_en_label" },
    severity_level: { label: "Severity", sortKey: "severity_level" },
    stage: { label: "Stage", sortKey: "stage" },
    harm_level: { label: "Harm Level", sortKey: "harm_level" },
    status: { label: "Status", sortKey: "status" },
    improvement_opportunity_type: { label: "Improvement", sortKey: "improvement_opportunity_type" },
    complaint_text: { label: "📝 Complaint", sortKey: null },
    immediate_action: { label: "⚡ Immediate Action", sortKey: null },
    taken_action: { label: "🏥 Actions Taken", sortKey: null },
    actions: { label: "Actions", sortKey: null }
  };

  // FILTER LOGIC
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.record_id.toLowerCase().includes(filters.searchText.toLowerCase()) ||
      record.patient_full_name.toLowerCase().includes(filters.searchText.toLowerCase());
    const matchesIssuing =
      filters.issuingDept === "All" || record.issuing_department === filters.issuingDept;
    const matchesTarget =
      filters.targetDept === "All" || record.target_department === filters.targetDept;
    const matchesSource =
      filters.source === "All" || record.source_1 === filters.source;
    return matchesSearch && matchesIssuing && matchesTarget && matchesSource;
  });

  // SORTING LOGIC
  const sortedRecords = React.useMemo(() => {
    let sorted = [...filteredRecords];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredRecords, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Check if record is a red flag
  const isRedFlag = (record) => {
    return record.status_id === 4 || record.is_red_flag === true || record.status?.toLowerCase() === "red flag";
  };

  // Get severity color with solid background
  const getSeverityStyle = (severity) => {
    const text = severity?.toLowerCase() || "";
    const styleMap = {
      high: { background: "#ff4757", color: "white", label: "High" },
      medium: { background: "#ffa502", color: "white", label: "Medium" },
      low: { background: "#2ed573", color: "white", label: "Low" },
    };
    return styleMap[text] || { background: "#999", color: "white", label: severity };
  };

  // Get status color with solid background
  const getStatusStyle = (status) => {
    const text = status?.toLowerCase() || "";
    const styleMap = {
      closed: { background: "#2ed573", color: "white", label: "Closed" },
      "in progress": { background: "#ffa502", color: "white", label: "In Progress" },
      pending: { background: "#667eea", color: "white", label: "Pending" },
    };
    return styleMap[text] || { background: "#999", color: "white", label: status };
  };

  // Get harm level color with solid background
  const getHarmStyle = (harm) => {
    const text = harm?.toLowerCase() || "";
    const styleMap = {
      high: { background: "#ff4757", color: "white", label: "High" },
      medium: { background: "#ffa502", color: "white", label: "Moderate" },
      low: { background: "#2ed573", color: "white", label: "Low" },
      "moderate harm": { background: "#ffa502", color: "white", label: "Moderate" },
    };
    return styleMap[text] || { background: "#999", color: "white", label: harm };
  };

  // Badge component with proper styling
  const StyledBadge = ({ style, text }) => (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: style.background,
        color: style.color,
        padding: "6px 8px",
        borderRadius: "4px",
        fontWeight: 700,
        fontSize: "12px",
        textAlign: "center",
        width: "90px",
        height: "28px",
        whiteSpace: "nowrap",
        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
      }}
    >
      {text}
    </Box>
  );

  const SortableHeader = ({ label, sortKey }) => (
    <Tooltip title={`Click to sort by ${label}`}>
      <Box
        onClick={() => handleSort(sortKey)}
        sx={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          "&:hover": {
            color: "#667eea",
          },
        }}
      >
        {label}
        {sortConfig.key === sortKey && (
          <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
        )}
      </Box>
    </Tooltip>
  );

  return (
    <Box sx={{ width: "100%" }}>
      {/* Summary Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        <Sheet
          sx={{
            p: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "8px",
            color: "white",
          }}
        >
          <Typography level="body-sm" sx={{ opacity: 0.9 }}>
            Total Records
          </Typography>
          <Typography level="h3" sx={{ fontWeight: 700 }}>
            {filteredRecords.length}
          </Typography>
        </Sheet>

        <Sheet
          sx={{
            p: 2,
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            borderRadius: "8px",
            color: "white",
          }}
        >
          <Typography level="body-sm" sx={{ opacity: 0.9 }}>
            High Severity
          </Typography>
          <Typography level="h3" sx={{ fontWeight: 700 }}>
            {filteredRecords.filter((r) => r.severity_level?.toLowerCase() === "high").length}
          </Typography>
        </Sheet>

        <Sheet
          sx={{
            p: 2,
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            borderRadius: "8px",
            color: "white",
          }}
        >
          <Typography level="body-sm" sx={{ opacity: 0.9 }}>
            In Progress
          </Typography>
          <Typography level="h3" sx={{ fontWeight: 700 }}>
            {filteredRecords.filter((r) => r.status?.toLowerCase() === "in progress").length}
          </Typography>
        </Sheet>

        <Sheet
          sx={{
            p: 2,
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            borderRadius: "8px",
            color: "white",
          }}
        >
          <Typography level="body-sm" sx={{ opacity: 0.9 }}>
            Closed
          </Typography>
          <Typography level="h3" sx={{ fontWeight: 700 }}>
            {filteredRecords.filter((r) => r.status?.toLowerCase() === "closed").length}
          </Typography>
        </Sheet>
      </Box>

      {/* Empty State */}
      {sortedRecords.length === 0 ? (
        <Sheet
          sx={{
            p: 4,
            textAlign: "center",
            background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
            borderRadius: "8px",
            border: "2px dashed rgba(102, 126, 234, 0.3)",
          }}
        >
          <Typography level="h3" sx={{ color: "#667eea", mb: 1 }}>
            📭 No records found
          </Typography>
          <Typography level="body-sm" sx={{ color: "#999" }}>
            Try adjusting your filters to find what you're looking for
          </Typography>
        </Sheet>
      ) : (
        <Sheet
          sx={{
            overflowX: "auto",
            borderRadius: "8px",
            border: "1px solid rgba(102, 126, 234, 0.1)",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.08)",
          }}
        >
          <Table
            sx={{
              "--Table-firstBorderRadius": "8px 0 0 0",
              "--Table-lastBorderRadius": "0 8px 0 0",
              "--TableCell-paddingY": "12px",
              "--TableCell-paddingX": "16px",
              "& thead th": {
                textAlign: "center",
              },
              "& tbody td": {
                textAlign: "center",
              },
            }}
          >
            <thead>
              <tr>
                {visibleColumns.map((columnKey) => {
                  const config = columnConfig[columnKey];
                  if (!config) return null;
                  
                  return (
                    <th key={columnKey}>
                      {config.sortKey ? (
                        <SortableHeader label={config.label} sortKey={config.sortKey} />
                      ) : (
                        config.label
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map((record) => (
                <tr 
                  key={record.record_id}
                  style={{
                    background: isRedFlag(record) ? "#ffebee" : "transparent",
                    borderLeft: isRedFlag(record) ? "4px solid #d32f2f" : "none",
                  }}
                >
                  {shouldShowColumn("record_id") && (
                    <td>
                      <Typography level="body-sm" sx={{ fontWeight: 700, color: isRedFlag(record) ? "#b71c1c" : "#667eea" }}>
                        {record.record_id}
                        {isRedFlag(record) && (
                          <Chip size="sm" color="danger" sx={{ ml: 1, fontSize: "9px", height: "18px" }}>
                            RED FLAG
                          </Chip>
                        )}
                      </Typography>
                    </td>
                  )}
                  
                  {shouldShowColumn("created_at") && (
                    <td>
                      <Typography level="body-sm" sx={{ color: isRedFlag(record) ? "#b71c1c" : "inherit" }}>
                        {record.created_at || record.date_added}
                      </Typography>
                    </td>
                  )}

                  {shouldShowColumn("feedback_received_date") && (
                    <td>
                      <Typography level="body-sm">
                        {record.feedback_received_date}
                      </Typography>
                    </td>
                  )}

                  {shouldShowColumn("patient_full_name") && (
                    <td>
                      <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                        {record.patient_full_name}
                      </Typography>
                    </td>
                  )}

                  {shouldShowColumn("issuing_department") && (
                    <td>
                      <Typography level="body-sm">{record.issuing_department}</Typography>
                    </td>
                  )}

                  {shouldShowColumn("target_department") && (
                    <td>
                      <Typography level="body-sm">{record.target_department}</Typography>
                    </td>
                  )}

                  {shouldShowColumn("source_1") && (
                    <td>
                      <Typography level="body-sm">{record.source_1}</Typography>
                    </td>
                  )}

                  {shouldShowColumn("feedback_type") && (
                    <td>
                      <Typography level="body-sm">{record.feedback_type}</Typography>
                    </td>
                  )}

                  {shouldShowColumn("domain") && (
                    <td>
                      <Chip size="sm" variant="soft" color="primary">
                        {record.domain}
                      </Chip>
                    </td>
                  )}

                  {shouldShowColumn("category") && (
                    <td>
                      <Typography level="body-sm">{record.category_label || record.category}</Typography>
                    </td>
                  )}

                  {shouldShowColumn("sub_category") && (
                    <td>
                      <Typography level="body-sm">{record.subcategory_label || record.sub_category}</Typography>
                    </td>
                  )}

                  {shouldShowColumn("classification_en_label") && (
                    <td>
                      <Typography level="body-sm">{record.classification_en_label}</Typography>
                    </td>
                  )}

                  {shouldShowColumn("severity_level") && (
                    <td>
                      <StyledBadge 
                        style={getSeverityStyle(record.severity_level)} 
                        text={getSeverityStyle(record.severity_level).label} 
                      />
                    </td>
                  )}

                  {shouldShowColumn("stage") && (
                    <td>
                      <Typography level="body-sm">{record.stage}</Typography>
                    </td>
                  )}

                  {shouldShowColumn("harm_level") && (
                    <td>
                      <StyledBadge 
                        style={getHarmStyle(record.harm_level)} 
                        text={getHarmStyle(record.harm_level).label} 
                      />
                    </td>
                  )}

                  {shouldShowColumn("status") && (
                    <td>
                      <StyledBadge 
                        style={getStatusStyle(record.status)} 
                        text={getStatusStyle(record.status).label} 
                      />
                    </td>
                  )}

                  {shouldShowColumn("improvement_opportunity_type") && (
                    <td>
                      <Chip size="sm" variant="soft" color={record.improvement_opportunity_type === "Yes" ? "success" : "neutral"}>
                        {record.improvement_opportunity_type}
                      </Chip>
                    </td>
                  )}

                  {shouldShowColumn("complaint_text") && (
                    <td>
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: "center" }}>
                        <Typography level="body-sm">-</Typography>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="sm" 
                            variant="soft" 
                            color="neutral"
                            onClick={() => handleViewText(record)}
                          >
                            <DescriptionIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </td>
                  )}

                  {shouldShowColumn("immediate_action") && (
                    <td>
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: "center" }}>
                        <Typography level="body-sm">-</Typography>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="sm" 
                            variant="soft" 
                            color="neutral"
                            onClick={() => handleViewText(record)}
                          >
                            <DescriptionIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </td>
                  )}

                  {shouldShowColumn("taken_action") && (
                    <td>
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: "center" }}>
                        <Typography level="body-sm">-</Typography>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="sm" 
                            variant="soft" 
                            color="neutral"
                            onClick={() => handleViewText(record)}
                          >
                            <DescriptionIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </td>
                  )}

                  {shouldShowColumn("actions") && (
                    <td>
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                        <Tooltip title="View Details">
                          <IconButton size="sm" variant="soft" color="primary">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Record">
                          <IconButton
                            size="sm"
                            variant="soft"
                            color="warning"
                            component={Link}
                            to={`/edit/${record.record_id}`}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>
      )}

      {/* Text Details Modal */}
      <Modal open={textModalOpen} onClose={() => setTextModalOpen(false)}>
        <ModalDialog
          sx={{
            maxWidth: 800,
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto"
          }}
        >
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>
            Record Details - ID: {selectedTextData?.record_id}
          </Typography>
          
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Complaint Text */}
            <Box>
              <Typography level="title-md" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                📝 Complaint Text
              </Typography>
              <Sheet
                variant="soft"
                sx={{
                  p: 2,
                  borderRadius: "sm",
                  maxHeight: 150,
                  overflow: "auto",
                  direction: "rtl",
                  textAlign: "right"
                }}
              >
                <Typography level="body-sm">
                  {selectedTextData?.complaint_text || "No complaint text available"}
                </Typography>
              </Sheet>
            </Box>

            {/* Immediate Action */}
            <Box>
              <Typography level="title-md" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                ⚡ Immediate Action
              </Typography>
              <Sheet
                variant="soft"
                color="warning"
                sx={{
                  p: 2,
                  borderRadius: "sm",
                  maxHeight: 150,
                  overflow: "auto",
                  direction: "rtl",
                  textAlign: "right"
                }}
              >
                <Typography level="body-sm">
                  {selectedTextData?.immediate_action || "No immediate action recorded"}
                </Typography>
              </Sheet>
            </Box>

            {/* Actions Taken */}
            <Box>
              <Typography level="title-md" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                🏥 Actions Taken
              </Typography>
              <Sheet
                variant="soft"
                color="success"
                sx={{
                  p: 2,
                  borderRadius: "sm",
                  maxHeight: 150,
                  overflow: "auto",
                  direction: "rtl",
                  textAlign: "right"
                }}
              >
                <Typography level="body-sm">
                  {selectedTextData?.taken_action || "No actions taken yet"}
                </Typography>
              </Sheet>
            </Box>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default RecordsTable;
