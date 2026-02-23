// src/components/common/UniversalIncidentsTable.js
// Universal incidents table component for Doctor, Patient, and Worker history pages
// Provides consistent columns across all profile views with optional context-specific columns

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Table,
  Chip,
  IconButton,
  Button,
  Sheet,
} from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import FlagIcon from "@mui/icons-material/Flag";
import WarningIcon from "@mui/icons-material/Warning";

/**
 * UniversalIncidentsTable - A shared table component for all history pages
 * 
 * Props:
 * @param {Array} incidents - Array of incident objects
 * @param {string} context - 'doctor' | 'patient' | 'worker' - determines which extra columns to show
 * @param {boolean} showSatisfaction - Whether to show satisfaction column (only for patient context)
 * @param {Function} onOpenSatisfaction - Handler for satisfaction modal (patient only)
 * @param {Function} onViewDetails - Handler for viewing incident details
 * @param {Function} onRefresh - Handler for refreshing data after updates
 * @param {string} title - Custom title for the table section
 * @param {string} emptyMessage - Message to show when no incidents
 */
const UniversalIncidentsTable = ({
  incidents = [],
  context = "doctor",
  showSatisfaction = false,
  onOpenSatisfaction,
  onViewDetails,
  onRefresh,
  title,
  emptyMessage = "No incidents found",
}) => {
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  // Sort incidents
  const sortedIncidents = useMemo(() => {
    let sorted = [...incidents];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle date sorting
        if (sortConfig.key === "date") {
          aValue = new Date(aValue || a.incident_date || a.created_at || 0);
          bValue = new Date(bValue || b.incident_date || b.created_at || 0);
        }
        
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [incidents, sortConfig]);

  // Paginate
  const paginatedIncidents = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedIncidents.slice(start, start + rowsPerPage);
  }, [sortedIncidents, page, rowsPerPage]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Sortable header component
  const SortableHeader = ({ label, sortKey }) => (
    <Box
      onClick={() => handleSort(sortKey)}
      sx={{
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        userSelect: "none",
        "&:hover": { color: "#667eea" },
      }}
    >
      {label}
      {sortConfig.key === sortKey && (
        <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
      )}
    </Box>
  );

  // Severity color helper
  const getSeverityColor = (severity) => {
    const s = (severity || "").toUpperCase();
    if (s === "HIGH" || s === "CRITICAL") return "danger";
    if (s === "MEDIUM") return "warning";
    if (s === "LOW") return "success";
    return "neutral";
  };

  // Status color helper
  const getStatusColor = (status) => {
    const s = (status || "").toUpperCase().replace(/_/g, " ");
    if (s === "CLOSED" || s === "FINISHED" || s === "ADMIN APPROVED") return "success";
    if (s === "OPEN" || s === "PENDING") return "warning";
    if (s === "UNDER REVIEW" || s === "IN PROGRESS") return "primary";
    return "neutral";
  };

  // Satisfaction display helper
  const getSatisfactionDisplay = (satisfaction) => {
    if (!satisfaction || !satisfaction.exists) {
      return { label: "Not Set", color: "neutral", variant: "outlined" };
    }
    switch (satisfaction.satisfaction_status_id) {
      case 1: return { label: "Not Present", color: "neutral", variant: "soft" };
      case 2: return { label: "Satisfied", color: "success", variant: "solid" };
      case 3: return { label: "Not Satisfied", color: "danger", variant: "solid" };
      default: return { label: "Unknown", color: "neutral", variant: "outlined" };
    }
  };

  // Get display date
  const getDisplayDate = (incident) => {
    const dateStr = incident.date || incident.incident_date || incident.created_at;
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get case ID
  const getCaseId = (incident) => {
    return incident.incident_id || incident.id || incident.case_id || "—";
  };

  // Determine default title based on context
  const defaultTitles = {
    doctor: "🩺 Incidents Involving This Doctor",
    patient: "📋 Patient Feedback History",
    worker: "👷 Incidents Involving This Worker",
  };

  const displayTitle = title || defaultTitles[context] || "Incident History";
  const totalPages = Math.ceil(sortedIncidents.length / rowsPerPage);

  if (incidents.length === 0) {
    return (
      <Sheet
        sx={{
          borderRadius: "8px",
          border: "1px solid rgba(102, 126, 234, 0.2)",
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography level="body-md" sx={{ color: "#999" }}>
          {emptyMessage}
        </Typography>
      </Sheet>
    );
  }

  return (
    <Sheet
      sx={{
        borderRadius: "8px",
        border: "1px solid rgba(102, 126, 234, 0.2)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Typography level="title-lg" sx={{ fontWeight: 700 }}>
          {displayTitle}
        </Typography>
        <Typography level="body-xs" sx={{ opacity: 0.9, mt: 0.5 }}>
          {sortedIncidents.length} total records • Click column headers to sort
        </Typography>
      </Box>

      {/* Table */}
      <Box sx={{ overflowX: "auto", maxHeight: "600px", overflowY: "auto" }}>
        <Table
          sx={{
            "--TableCell-paddingY": "10px",
            "--TableCell-paddingX": "12px",
            "& thead th": {
              background: "#f9fafb",
              fontWeight: 600,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              position: "sticky",
              top: 0,
              zIndex: 1,
              textAlign: "center",
            },
            "& tbody td": {
              textAlign: "center",
              verticalAlign: "middle",
              fontSize: "0.8125rem",
            },
            "& tbody tr:hover": {
              background: "#f9fafb",
            },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: "8%" }}>
                <SortableHeader label="Case ID" sortKey="incident_id" />
              </th>
              <th style={{ width: "9%" }}>
                <SortableHeader label="Date" sortKey="date" />
              </th>
              
              {/* Context-specific column: Patient (for doctor/worker) or Doctor (for patient) */}
              {context === "patient" ? (
                <th style={{ width: "11%" }}>
                  <SortableHeader label="Doctor" sortKey="doctor_name" />
                </th>
              ) : (
                <th style={{ width: "11%" }}>
                  <SortableHeader label="Patient" sortKey="patient_name" />
                </th>
              )}
              
              <th style={{ width: "12%" }}>
                <SortableHeader label="Category" sortKey="category" />
              </th>
              <th style={{ width: "8%" }}>
                <SortableHeader label="Severity" sortKey="severity" />
              </th>
              <th style={{ width: "9%" }}>
                <SortableHeader label="Status" sortKey="status" />
              </th>
              <th style={{ width: "6%" }}>🚩 Red Flag</th>
              <th style={{ width: "6%" }}>⚠️ Never Event</th>
              <th style={{ width: "15%" }}>Description</th>
              
              {/* Satisfaction column - only for patient context */}
              {showSatisfaction && context === "patient" && (
                <th style={{ width: "10%" }}>Satisfaction</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedIncidents.map((incident, index) => {
              const isRedFlag = incident.is_red_flag || incident.isRedFlag || incident.red_flag;
              const isNeverEvent = incident.is_never_event || incident.isNeverEvent || incident.never_event;
              
              return (
                <tr
                  key={incident.incident_id || incident.id || index}
                  style={{
                    background: isRedFlag ? "#fff5f5" : isNeverEvent ? "#fef3f2" : "white",
                    borderLeft: isRedFlag ? "4px solid #dc2626" : isNeverEvent ? "4px solid #7c3aed" : "none",
                  }}
                >
                  {/* Case ID */}
                  <td>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                      {isRedFlag && <FlagIcon sx={{ color: "#dc2626", fontSize: 14 }} />}
                      {isNeverEvent && <WarningIcon sx={{ color: "#7c3aed", fontSize: 14 }} />}
                      <Typography level="body-sm" sx={{ fontWeight: 600, color: "#667eea" }}>
                        {getCaseId(incident)}
                      </Typography>
                    </Box>
                  </td>
                  
                  {/* Date */}
                  <td>
                    <Typography level="body-sm">{getDisplayDate(incident)}</Typography>
                  </td>
                  
                  {/* Context-specific: Patient or Doctor */}
                  {context === "patient" ? (
                    <td>
                      <Typography level="body-sm">
                        {incident.doctor_name || incident.doctorName || incident.DoctorName || "—"}
                      </Typography>
                    </td>
                  ) : (
                    <td>
                      <Typography level="body-sm">
                        {incident.patient_name || incident.patientName || incident.patient || incident.patient_id || "—"}
                      </Typography>
                    </td>
                  )}
                  
                  {/* Category */}
                  <td>
                    <Typography level="body-sm">
                      {incident.category_en || incident.category || incident.category_name || "—"}
                    </Typography>
                    {incident.category_ar && (
                      <Typography level="body-xs" sx={{ color: "#999", dir: "rtl" }}>
                        {incident.category_ar}
                      </Typography>
                    )}
                  </td>
                  
                  {/* Severity */}
                  <td>
                    <Chip size="sm" color={getSeverityColor(incident.severity)} sx={{ fontWeight: 600 }}>
                      {incident.severity || "—"}
                    </Chip>
                  </td>
                  
                  {/* Status */}
                  <td>
                    <Chip size="sm" variant="soft" color={getStatusColor(incident.status)}>
                      {(incident.status || "—").replace(/_/g, " ")}
                    </Chip>
                  </td>
                  
                  {/* Red Flag */}
                  <td>
                    {isRedFlag ? (
                      <Chip size="sm" color="danger" sx={{ fontWeight: 700 }}>
                        🚩 YES
                      </Chip>
                    ) : (
                      <Typography level="body-sm" sx={{ color: "#ccc" }}>—</Typography>
                    )}
                  </td>
                  
                  {/* Never Event */}
                  <td>
                    {isNeverEvent ? (
                      <Chip size="sm" color="warning" sx={{ fontWeight: 700, bgcolor: "#7c3aed", color: "white" }}>
                        ⚠️ YES
                      </Chip>
                    ) : (
                      <Typography level="body-sm" sx={{ color: "#ccc" }}>—</Typography>
                    )}
                  </td>
                  
                  {/* Description */}
                  <td>
                    <Typography
                      level="body-xs"
                      sx={{
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                        margin: "0 auto",
                      }}
                    >
                      {incident.description || incident.complaint_text || incident.summary || "—"}
                    </Typography>
                  </td>
                  
                  {/* Satisfaction - only for patient context */}
                  {showSatisfaction && context === "patient" && (
                    <td>
                      {incident.satisfaction?.exists ? (
                        <Chip
                          size="sm"
                          color={getSatisfactionDisplay(incident.satisfaction).color}
                          variant={getSatisfactionDisplay(incident.satisfaction).variant}
                        >
                          {getSatisfactionDisplay(incident.satisfaction).label}
                        </Chip>
                      ) : (
                        <Button
                          size="sm"
                          variant="outlined"
                          color="primary"
                          startDecorator={<AddIcon sx={{ fontSize: "14px" }} />}
                          onClick={() => onOpenSatisfaction && onOpenSatisfaction(incident)}
                          sx={{ fontSize: "0.7rem" }}
                        >
                          Add
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Box>

      {/* Pagination */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid rgba(102, 126, 234, 0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#f9fafb",
        }}
      >
        <Typography level="body-sm" sx={{ color: "#666" }}>
          Showing {page * rowsPerPage + 1}-
          {Math.min((page + 1) * rowsPerPage, sortedIncidents.length)} of{" "}
          {sortedIncidents.length} records
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <IconButton
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            ←
          </IconButton>
          <Typography level="body-sm" sx={{ px: 2 }}>
            Page {page + 1} of {totalPages || 1}
          </Typography>
          <IconButton
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            →
          </IconButton>
        </Box>
      </Box>
    </Sheet>
  );
};

export default UniversalIncidentsTable;
