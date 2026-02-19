// src/components/patientHistory/PatientFeedbackTable.js
// Phase R-P — Normalized doctor field: doctor_name (from DoctorName join fix)
// Phase Satisfaction — Added satisfaction column and modal
import React, { useState, useMemo } from "react";
import {
  Table,
  Sheet,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Chip,
} from "@mui/joy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import SatisfactionModal from "./SatisfactionModal";

const PatientFeedbackTable = ({ feedbacks, onRefresh }) => {
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  
  // Satisfaction modal state
  const [satisfactionModalOpen, setSatisfactionModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  // Sort feedbacks
  const sortedFeedbacks = useMemo(() => {
    let sorted = [...feedbacks];
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
  }, [feedbacks, sortConfig]);

  // Paginate
  const paginatedFeedbacks = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedFeedbacks.slice(start, start + rowsPerPage);
  }, [sortedFeedbacks, page, rowsPerPage]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Sortable header
  const SortableHeader = ({ label, sortKey }) => (
    <Box
      onClick={() => handleSort(sortKey)}
      sx={{
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        "&:hover": { color: "#667eea" },
      }}
    >
      {label}
      {sortConfig.key === sortKey && (
        <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
      )}
    </Box>
  );

  // Get severity style
  const getSeverityStyle = (severity) => {
    const styleMap = {
      high: { background: "#ff4757", color: "white" },
      medium: { background: "#ffa502", color: "white" },
      low: { background: "#2ed573", color: "white" },
    };
    return styleMap[severity?.toLowerCase()] || { background: "#999", color: "white" };
  };

  // Get status style
  const getStatusStyle = (status) => {
    const styleMap = {
      closed: { background: "#2ed573", color: "white" },
      "in progress": { background: "#ffa502", color: "white" },
      pending: { background: "#667eea", color: "white" },
    };
    return styleMap[status?.toLowerCase()] || { background: "#999", color: "white" };
  };

  // Get satisfaction status style and label
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

  // Handle opening satisfaction modal
  const handleOpenSatisfaction = (feedback) => {
    setSelectedCase({
      id: feedback.id || feedback.incident_case_id,
      name: `Case #${feedback.id || feedback.incident_case_id}`,
    });
    setSatisfactionModalOpen(true);
  };

  // Handle satisfaction success
  const handleSatisfactionSuccess = () => {
    setSatisfactionModalOpen(false);
    setSelectedCase(null);
    if (onRefresh) onRefresh();
  };

  const totalPages = Math.ceil(sortedFeedbacks.length / rowsPerPage);

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
          borderBottom: "1px solid rgba(102, 126, 234, 0.1)",
          background: "#f9fafb",
        }}
      >
        <Typography level="h4" sx={{ color: "#667eea", fontWeight: 700 }}>
          📋 Patient Feedback History
        </Typography>
      </Box>

      {/* Table */}
      <Box sx={{ overflowX: "auto" }}>
        <Table
          sx={{
            "--TableCell-paddingY": "12px",
            "--TableCell-paddingX": "16px",
          }}
        >
          <thead>
            <tr>
              <th>
                <SortableHeader label="Date" sortKey="date" />
              </th>
              <th>
                <SortableHeader label="Department" sortKey="department" />
              </th>
              <th>
                <SortableHeader label="Category" sortKey="category" />
              </th>
              <th>
                <SortableHeader label="Severity" sortKey="severity" />
              </th>
              <th>
                <SortableHeader label="Doctor" sortKey="doctor_name" />
              </th>
              <th>Status</th>
              <th>Description</th>
              <th style={{ width: "80px", textAlign: "center" }}>Action</th>
              <th style={{ width: "120px", textAlign: "center" }}>Satisfaction</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFeedbacks.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "40px" }}>
                  <Typography level="body-md" sx={{ color: "#999" }}>
                    No feedback records found
                  </Typography>
                </td>
              </tr>
            ) : (
              paginatedFeedbacks.map((fb) => (
                <tr key={fb.id}>
                  <td>
                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                      {fb.date}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{fb.department}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{fb.category}</Typography>
                  </td>
                  <td>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        ...getSeverityStyle(fb.severity),
                        padding: "6px 8px",
                        borderRadius: "4px",
                        fontWeight: 700,
                        fontSize: "12px",
                        width: "90px",
                        height: "28px",
                      }}
                    >
                      {fb.severity}
                    </Box>
                  </td>
                  <td>
                    <Typography level="body-sm">{fb.doctor_name || fb.doctorName || "N/A"}</Typography>
                  </td>
                  <td>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        ...getStatusStyle(fb.status),
                        padding: "6px 8px",
                        borderRadius: "4px",
                        fontWeight: 700,
                        fontSize: "12px",
                        width: "90px",
                        height: "28px",
                      }}
                    >
                      {fb.status}
                    </Box>
                  </td>
                  <td>
                    <Typography
                      level="body-xs"
                      sx={{
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fb.description}
                    </Typography>
                  </td>
                  <td>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <Tooltip title="View Details">
                        <IconButton size="sm" color="primary">
                          <VisibilityIcon sx={{ fontSize: "18px" }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </td>
                  <td>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      {fb.satisfaction?.exists ? (
                        <Chip
                          size="sm"
                          color={getSatisfactionDisplay(fb.satisfaction).color}
                          variant={getSatisfactionDisplay(fb.satisfaction).variant}
                        >
                          {getSatisfactionDisplay(fb.satisfaction).label}
                        </Chip>
                      ) : (
                        <Button
                          size="sm"
                          variant="outlined"
                          color="primary"
                          startDecorator={<AddIcon sx={{ fontSize: "16px" }} />}
                          onClick={() => handleOpenSatisfaction(fb)}
                        >
                          Add
                        </Button>
                      )}
                    </Box>
                  </td>
                </tr>
              ))
            )}
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
          {Math.min((page + 1) * rowsPerPage, sortedFeedbacks.length)} of{" "}
          {sortedFeedbacks.length} records
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            ←
          </IconButton>
          <Typography level="body-sm" sx={{ px: 2, py: 1 }}>
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

      {/* Satisfaction Modal */}
      <SatisfactionModal
        open={satisfactionModalOpen}
        onClose={() => {
          setSatisfactionModalOpen(false);
          setSelectedCase(null);
        }}
        caseData={selectedCase}
        onSuccess={handleSatisfactionSuccess}
      />
    </Sheet>
  );
};

export default PatientFeedbackTable;
