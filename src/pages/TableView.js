// src/pages/TableView.js
import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Card, CircularProgress, Button, Chip, Modal, ModalDialog, ModalClose, DialogTitle, DialogContent, DialogActions, Divider, Tabs, TabList, Tab, TabPanel } from "@mui/joy";
import theme from '../theme';
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import MainLayout from "../components/common/MainLayout";
import SearchBar from "../components/TableView/SearchBar";
import FilterPanel from "../components/TableView/FilterPanel";
import DataTable from "../components/TableView/DataTable";
import Pagination from "../components/TableView/Pagination";
import CustomViewManager from "../components/TableView/CustomViewManager";
import DeleteConfirmationDialog from "../components/TableView/DeleteConfirmationDialog";
import SatisfactionModal from "../components/patientHistory/SatisfactionModal";
import { getBackendSortField } from "../utils/tableViewSortFields";
import { fetchComplaints, fetchFilterOptions, exportComplaints, deleteComplaint, publishComplaint, bulkPublishComplaints, markAsReady } from "../api/complaints";
import { getIncidentResponses } from "../api/workflowApi";
import { useAuth } from "../context/AuthContext";
import SendIcon from "@mui/icons-material/Send";

const WORKFLOW_STATUS_LABELS = {
  SUBMITTED_TO_SECTION: 'Pending Section',
  RETURNED_TO_SECTION_FOR_REVISION: 'Returned to Section',
  SECTION_ACCEPTED_PENDING_DEPT: 'Pending Department',
  RETURNED_TO_DEPT_FOR_REVISION: 'Returned to Department',
  DEPT_ACCEPTED_PENDING_ADMIN: 'Pending Administration',
  ADMIN_APPROVED: 'Approved',
  SECTION_DENIED: 'Denied',
  FORCE_CLOSED_DRAFT: 'Force Closed (Draft)',
  FORCE_CLOSED_COMPLETE: 'Force Closed (Complete)',
};

const TableView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEditResponses = (user?.roles || []).some(r => ['COMPLAINT_SUPERVISOR', 'WORKER', 'SOFTWARE_ADMIN'].includes(r));
  const isReadOnly = (user?.roles || []).some(r => ['SECTION_ADMIN', 'DEPARTMENT_ADMIN', 'ADMINISTRATION_ADMIN'].includes(r));
  // View governance: only SOFTWARE_ADMIN / COMPLAINT_SUPERVISOR may create/edit/delete Custom Views
  const isViewAdmin = (user?.roles || []).some(r => ['SOFTWARE_ADMIN', 'COMPLAINT_SUPERVISOR'].includes(r));
  // Only roles allowed to write satisfaction data (matches /api/v2/cases/{id}/satisfaction backend guard)
  const canAddSatisfaction = (user?.roles || []).some(r => ['COMPLAINT_SUPERVISOR', 'WORKER', 'SOFTWARE_ADMIN'].includes(r));
  // Data state
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 50,
    total_records: 0,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter options
  const [filterOptions, setFilterOptions] = useState(null);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [filterError, setFilterError] = useState(null);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    issuing_org_unit_id: null,
    target_department_id: null,
    target_dept_parent_id: null,
    target_admin_id: null,
    domain_id: null,
    category_id: null,
    severity_id: null,
    stage_id: null,
    harm_level_id: null,
    case_status_id: null,
    year: null,
    month: null,
    start_date: null,
    end_date: null,
  });

  // Sorting
  const [sortBy, setSortBy] = useState("FeedbackRecievedDate");
  const [sortOrder, setSortOrder] = useState("desc");

  // View mode
  const [viewMode, setViewMode] = useState("complete");

  // Custom view
  const [selectedCustomView, setSelectedCustomView] = useState(null);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Publish state
  const [publishLoading, setPublishLoading] = useState(false);
  const [bulkPublishConfirmOpen, setBulkPublishConfirmOpen] = useState(false);
  const [markReadyLoading, setMarkReadyLoading] = useState(false);

  // Response viewer modal state
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseModalLoading, setResponseModalLoading] = useState(false);
  const [responseModalData, setResponseModalData] = useState(null); // { incidentId, subcases }
  const [responseModalError, setResponseModalError] = useState(null);

  // Satisfaction modal state (reuses Patient History's SatisfactionModal as-is)
  const [satisfactionModalOpen, setSatisfactionModalOpen] = useState(false);
  const [satisfactionCase, setSatisfactionCase] = useState(null); // { id, name }

  // Tab state: 'workflow' (sent) | 'preparation' (not sent)
  const [activeTab, setActiveTab] = useState('workflow');

  const handleTabChange = (_, newTab) => {
    setActiveTab(newTab);
    setPagination(prev => ({ ...prev, page: 1 }));
    handleClearFilters();
  };



  // ========================================
  // FETCH FILTER OPTIONS
  // ========================================
  useEffect(() => {
    console.log("🔄 Loading filter options...");
    setFilterError(null);
    fetchFilterOptions()
      .then(async (data) => {
        console.log("✅ Filter options loaded:", data);
        // Also fetch sections for the target section filter
        let sections = [];
        try {
          const sResp = await fetch("/api/settings/sections", { credentials: "include" });
          if (sResp.ok) {
            const sData = await sResp.json();
            sections = sData.sections || [];
          }
        } catch { /* non-critical */ }

        const transformedData = {
          issuing_org_units: data.departments || [],
          domains: data.domains || [],
          categories: data.categories || [],
          severities: data.severity_levels || data.severity || [],
          stages: data.stages || [],
          harm_levels: data.harm_levels || data.harm || [],
          classifications_en: data.classifications_en || [],
          statuses: data.statuses || data.case_statuses || data.status || [],
          years: data.years || [],
          sections,
          target_departments: data.target_departments || [],
          target_administrations: data.target_administrations || [],
        };
        setFilterOptions(transformedData);
      })
      .catch((err) => {
        console.error("❌ Failed to load filter options:", err);
        setFilterError(err.message || "Failed to load filter options");
      })
      .finally(() => setLoadingFilters(false));
  }, []);

  // ========================================
  // FETCH COMPLAINTS DATA
  // ========================================
  const loadComplaints = useCallback((page, pageSize) => {
    console.log("🔄 Loading complaints...", { page, pageSize });
    setLoading(true);
    setError(null);

    const params = {
      page,
      page_size: pageSize,
      search: searchQuery || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      view: viewMode,
      tab: activeTab,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined && value !== "")
      ),
    };

    fetchComplaints(params)
      .then((data) => {
        setComplaints(data.complaints || []);
        setPagination((prev) => ({
          ...prev,
          total_records: data.pagination.total_records,
          total_pages: data.pagination.total_pages,
        }));
        console.log("✅ Complaints loaded:", data.complaints.length, "records");
      })
      .catch((err) => {
        console.error("❌ Error loading complaints:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [searchQuery, filters, sortBy, sortOrder, viewMode, activeTab]);

  useEffect(() => {
    loadComplaints(pagination.page, pagination.page_size);
  }, [loadComplaints, pagination.page, pagination.page_size]);

  // ========================================
  // HANDLERS
  // ========================================
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      issuing_org_unit_id: null,
      target_department_id: null,
      target_dept_parent_id: null,
      target_admin_id: null,
      domain_id: null,
      category_id: null,
      severity_id: null,
      stage_id: null,
      harm_level_id: null,
      case_status_id: null,
      year: null,
      month: null,
      start_date: null,
      end_date: null,
    });
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleSort = (column) => {
    // Map frontend column keys to backend field names
    const backendSortField = getBackendSortField(column);

    if (sortBy === backendSortField) {
      // Toggle order
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // New column
      setSortBy(backendSortField);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRowClick = (complaintId) => {
    const complaint = complaints.find(c => c.id === complaintId);
    if (complaint?.case_status_name === "Draft" || complaint?.case_status_name === "Ready to Send") {
      navigate(`/insert-record?draftId=${complaintId}`);
    } else {
      navigate(`/complaints/${complaintId}`);
    }
  };

  const handleEditRow = (complaintId) => {
    console.log("✏️ Editing complaint:", complaintId);
    navigate(`/edit-record/${complaintId}`);
  };

  const handleMarkReady = async (complaintId) => {
    setMarkReadyLoading(true);
    try {
      await markAsReady(complaintId);
      await loadComplaints(pagination.page, pagination.page_size);
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Failed to mark as Ready to Send");
    } finally {
      setMarkReadyLoading(false);
    }
  };

  const handleViewResponses = async (incidentId) => {
    setResponseModalOpen(true);
    setResponseModalLoading(true);
    setResponseModalError(null);
    setResponseModalData(null);
    try {
      const data = await getIncidentResponses(incidentId);
      setResponseModalData(data);
    } catch (e) {
      setResponseModalError(e?.message || 'Failed to load responses');
    } finally {
      setResponseModalLoading(false);
    }
  };

  const handleOpenSatisfaction = (complaint) => {
    setSatisfactionCase({
      id: complaint.id,
      name: `Case #${complaint.id}${complaint.patient_name ? ` — ${complaint.patient_name}` : ""}`,
    });
    setSatisfactionModalOpen(true);
  };

  const handleSatisfactionClose = () => {
    setSatisfactionModalOpen(false);
    setSatisfactionCase(null);
  };

  const handleSatisfactionSuccess = async () => {
    setSatisfactionModalOpen(false);
    setSatisfactionCase(null);
    await loadComplaints(pagination.page, pagination.page_size);
  };

  const handlePublishRow = async (complaintId) => {
    if (!window.confirm("Publish this complaint into the workflow?")) return;
    setPublishLoading(true);
    try {
      await publishComplaint(complaintId);
      await loadComplaints(pagination.page, pagination.page_size);
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Publish failed");
    } finally {
      setPublishLoading(false);
    }
  };

  const handleBulkPublish = async () => {
    setBulkPublishConfirmOpen(false);
    setPublishLoading(true);
    try {
      const result = await bulkPublishComplaints(null);
      alert(`Published ${result.published} complaint(s). ${result.failed ? `${result.failed} failed.` : ""}`);
      await loadComplaints(pagination.page, pagination.page_size);
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Bulk publish failed");
    } finally {
      setPublishLoading(false);
    }
  };

  const handleDeleteRow = (complaintId, complaint) => {
    console.log("🗑️ Opening delete dialog for complaint:", complaintId);
    setComplaintToDelete(complaint);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!complaintToDelete || !complaintToDelete.id) {
      console.error("❌ No complaint selected for deletion");
      return;
    }

    setDeleteLoading(true);
    try {
      console.log("🗑️ Deleting complaint:", complaintToDelete.id);
      const result = await deleteComplaint(complaintToDelete.id);
      console.log("✅ Complaint deleted successfully:", result);
      
      // Close dialog and refresh data
      setDeleteDialogOpen(false);
      setComplaintToDelete(null);
      
      console.log("🔄 Reloading complaints after deletion...");
      await loadComplaints(pagination.page, pagination.page_size);
      console.log("✅ Complaints reloaded");
      
      // Show success message
      alert("Record deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting complaint:", error);
      console.error("❌ Error stack:", error.stack);
      alert("Failed to delete complaint: " + error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportClick = () => {
    // Open confirmation dialog before exporting
    setExportDialogOpen(true);
  };

  const handleExportConfirm = async () => {
    setExportDialogOpen(false);
    setExporting(true);
    
    try {
      // Collect ALL current filter parameters (same as loadComplaints)
      const exportParams = {
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        view: viewMode,
        tab: activeTab,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined && value !== "")
        ),
      };

      console.log("📤 Exporting with params:", exportParams);

      const blob = await exportComplaints(exportParams);
      
      // Create download link with improved filename
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Better filename: incident_export_2026-01-07_filtered.xlsx
      const today = new Date().toISOString().split("T")[0];
      const hasFilters = Object.values(filters).some(v => v !== null && v !== undefined && v !== "") || searchQuery;
      const filterSuffix = hasFilters ? "_filtered" : "_all";
      link.download = `incident_export_${today}${filterSuffix}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("✅ Export complete");
    } catch (err) {
      console.error("❌ Export failed:", err);
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportCancel = () => {
    setExportDialogOpen(false);
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography
              level="h2"
              sx={{
                fontWeight: 800,
                background: theme.gradients.primary,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              📋 Table View
            </Typography>
            <Typography level="body-md" sx={{ color: "#666" }}>
              View and filter all submitted complaints
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              color="neutral"
              startDecorator={<ArrowBackIcon />}
              onClick={() => navigate("/")}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="solid"
              color="primary"
              startDecorator={<DownloadIcon />}
              onClick={handleExportClick}
              loading={exporting}
              disabled={loading || pagination.total_records === 0}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* ── Tab switcher: Sent / Not Sent ── */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ mb: 3, borderRadius: "md", background: "transparent" }}
        >
          <TabList
            sx={{
              borderBottom: "2px solid",
              borderColor: "divider",
              gap: 0,
            }}
          >
            <Tab
              value="workflow"
              sx={{
                fontWeight: 600,
                px: 3,
                "&.Mui-selected": { color: "primary.600", borderBottom: "2px solid", borderColor: "primary.500" },
              }}
            >
              Sent to Workflow
            </Tab>
            <Tab
              value="preparation"
              sx={{
                fontWeight: 600,
                px: 3,
                "&.Mui-selected": { color: "warning.700", borderBottom: "2px solid", borderColor: "warning.400" },
              }}
            >
              Not Sent
              <Chip size="sm" variant="soft" color="warning" sx={{ ml: 1 }}>
                Draft / Ready
              </Chip>
            </Tab>
          </TabList>
        </Tabs>

        {/* Custom View Manager */}
        <Box sx={{ mb: 3 }}>
          <CustomViewManager onViewSelect={setSelectedCustomView} isAdmin={isViewAdmin} />
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
          <Box sx={{ flex: 1 }}>
            <SearchBar value={searchQuery} onChange={handleSearchChange} />
          </Box>
        </Box>

        {/* Filter Error Message */}
        {filterError && (
          <Card sx={{ mb: 3, p: 2, bgcolor: "danger.softBg" }}>
            <Typography color="danger">
              ❌ Error loading filters: {filterError}
            </Typography>
          </Card>
        )}

        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          filterOptions={filterOptions}
          loading={loadingFilters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />

        {/* Results Summary */}
        {!loading && (
          <Box sx={{ mb: 2 }}>
            <Typography level="body-sm" sx={{ color: "#666", fontWeight: 600 }}>
              📊 Showing {complaints.length} of {pagination.total_records} complaints
              {(searchQuery || Object.values(filters).some(v => v)) && (
                <Chip size="sm" variant="soft" color="primary" sx={{ ml: 1 }}>
                  Filtered
                </Chip>
              )}
            </Typography>
          </Box>
        )}

        {/* Loading State */}
        {loading && (
          <Card sx={{ 
            p: 4, 
            textAlign: "center",
            background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
            border: "1px solid rgba(102, 126, 234, 0.1)",
          }}>
            <CircularProgress size="lg" sx={{ "--CircularProgress-color": theme.colors.primary }} />
            <Typography level="body-md" sx={{ mt: 2, color: theme.colors.primary, fontWeight: 600 }}>
              Loading complaints...
            </Typography>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card sx={{ p: 3, bgcolor: "danger.softBg" }}>
            <Typography color="danger">
              ❌ Error loading complaints: {error}
            </Typography>
          </Card>
        )}

        {/* Data Table */}
        {!loading && !error && (
          <>
            {/* Bulk Publish bar — shown on preparation tab */}
            {activeTab === 'preparation' && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mb: 1, gap: 2 }}>
                <Typography level="body-sm" sx={{ color: "neutral.500" }}>
                  {complaints.filter(c => c.case_status_name === "Ready to Send").length} ready to send
                </Typography>
                <Button
                  size="sm"
                  variant="solid"
                  color="success"
                  startDecorator={<SendIcon />}
                  loading={publishLoading}
                  disabled={!complaints.some(c => c.case_status_name === "Ready to Send")}
                  onClick={() => setBulkPublishConfirmOpen(true)}
                >
                  Publish All Ready to Send
                </Button>
              </Box>
            )}

            <DataTable
              complaints={complaints}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onRowClick={handleRowClick}
              onEdit={isReadOnly ? undefined : handleEditRow}
              onDelete={isReadOnly ? undefined : handleDeleteRow}
              onPublish={isReadOnly ? undefined : handlePublishRow}
              onMarkReady={isReadOnly ? undefined : handleMarkReady}
              onViewResponses={handleViewResponses}
              onAddSatisfaction={canAddSatisfaction ? handleOpenSatisfaction : undefined}
              viewMode={viewMode}
              customView={selectedCustomView}
              filterOptions={filterOptions}
              isReadOnly={isReadOnly}
            />

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <Box sx={{ mt: 3 }}>
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.total_pages}
                  onPageChange={handlePageChange}
                />
              </Box>
            )}

            {/* Empty State */}
            {complaints.length === 0 && (
              <Card sx={{ 
                p: 4, 
                textAlign: "center", 
                mt: 3,
                background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
                border: "1px solid rgba(102, 126, 234, 0.1)",
              }}>
                <Typography level="h4" sx={{ mb: 1, color: theme.colors.primary }}>
                  📭 No complaints found
                </Typography>
                <Typography level="body-sm" sx={{ color: "#666" }}>
                  {searchQuery || Object.values(filters).some(v => v)
                    ? "Try adjusting your filters or search query"
                    : "No complaints have been submitted yet"}
                </Typography>
              </Card>
            )}
          </>
        )}

        {/* Export Confirmation Dialog */}
        <Modal
          open={exportDialogOpen}
          onClose={handleExportCancel}
          sx={{
            zIndex: 10000,
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}
        >
          <ModalDialog
            variant="outlined"
            role="alertdialog"
            sx={{
              minWidth: 440,
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <ModalClose />
            <DialogTitle>
              <DownloadIcon sx={{ mr: 1 }} />
              Export Records
            </DialogTitle>
            <Divider />
            <DialogContent>
              <Typography level="body-md">
                You are about to export <strong>{pagination.total_records.toLocaleString()}</strong> records using the current filters.
              </Typography>
              <Typography level="body-sm" sx={{ mt: 1, color: "text.secondary" }}>
                Do you want to continue?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button variant="solid" color="primary" onClick={handleExportConfirm} loading={exporting}>
                Export
              </Button>
              <Button variant="plain" color="neutral" onClick={handleExportCancel} disabled={exporting}>
                Cancel
              </Button>
            </DialogActions>
          </ModalDialog>
        </Modal>

        {/* Satisfaction Modal (reused from Patient History — no duplicate form/logic) */}
        <SatisfactionModal
          open={satisfactionModalOpen}
          onClose={handleSatisfactionClose}
          caseData={satisfactionCase}
          onSuccess={handleSatisfactionSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setComplaintToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          isLoading={deleteLoading}
          complaint={complaintToDelete}
        />

        {/* Bulk Publish Confirmation Modal */}
        <Modal open={bulkPublishConfirmOpen} onClose={() => setBulkPublishConfirmOpen(false)} sx={{ zIndex: 2000 }}>
          <ModalDialog>
            <ModalClose />
            <DialogTitle>Publish All Ready to Send</DialogTitle>
            <Divider />
            <DialogContent>
              <Typography>
                This will publish all <b>Ready to Send</b> complaints into the workflow lifecycle.
                They will become visible in the relevant inboxes and begin the approval process.
              </Typography>
              <Typography level="body-sm" sx={{ mt: 1, color: "neutral.500" }}>
                Draft complaints are not affected.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button variant="solid" color="success" startDecorator={<SendIcon />} onClick={handleBulkPublish} loading={publishLoading}>
                Confirm & Publish All
              </Button>
              <Button variant="plain" color="neutral" onClick={() => setBulkPublishConfirmOpen(false)}>
                Cancel
              </Button>
            </DialogActions>
          </ModalDialog>
        </Modal>

        {/* Response Viewer Modal */}
        <Modal open={responseModalOpen} onClose={() => setResponseModalOpen(false)} sx={{ zIndex: 2000 }}>
          <ModalDialog sx={{ minWidth: { xs: '90vw', md: 640 }, maxWidth: 800, maxHeight: '85vh', overflowY: 'auto' }}>
            <ModalClose />
            <DialogTitle>
              Case Responses
              {responseModalData && ` — Incident #${responseModalData.incidentId}`}
            </DialogTitle>
            <Divider />
            <DialogContent>
              {responseModalLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              )}
              {responseModalError && (
                <Typography color="danger">{responseModalError}</Typography>
              )}
              {responseModalData && !responseModalLoading && (
                responseModalData.subcases.length === 0 ? (
                  <Typography level="body-sm" sx={{ color: 'neutral.500', py: 2 }}>
                    No responses have been submitted for this case yet.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {responseModalData.subcases.map(sc => (
                      <Card key={sc.subcaseId} variant="outlined" sx={{ p: 0, overflow: 'hidden' }}>
                        <Box sx={{ p: 1.5, bgcolor: 'neutral.100', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Typography level="title-sm" sx={{ fontWeight: 700 }}>
                            {sc.targetOrgUnitName}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip size="sm" variant="soft" color="neutral">
                              {WORKFLOW_STATUS_LABELS[sc.status] || sc.status}
                            </Chip>
                            {canEditResponses && (
                              <Button
                                size="sm"
                                variant="outlined"
                                color="primary"
                                onClick={() => { setResponseModalOpen(false); navigate(`/manual-fill/${sc.subcaseId}`); }}
                              >
                                Edit
                              </Button>
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ p: 1.5 }}>
                          {[
                            { label: 'Section Response', value: sc.sectionExplanation },
                            { label: 'Department Response', value: sc.departmentExplanation },
                            { label: 'Administration Response', value: sc.administrationExplanation },
                          ].map(({ label, value }) => value ? (
                            <Box key={label} sx={{ mb: 1 }}>
                              <Typography level="body-xs" sx={{ fontWeight: 600, color: 'neutral.600', mb: 0.25 }}>{label}</Typography>
                              <Typography level="body-sm">{value}</Typography>
                            </Box>
                          ) : null)}
                          {sc.actionItems.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography level="body-xs" sx={{ fontWeight: 600, color: 'neutral.600', mb: 0.5 }}>Action Items ({sc.actionItems.length})</Typography>
                              {sc.actionItems.map((item, i) => (
                                <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 0.5 }}>
                                  <Chip size="sm" variant="soft" color="neutral" sx={{ minWidth: 'unset' }}>{item.status}</Chip>
                                  <Box>
                                    <Typography level="body-xs" sx={{ fontWeight: 600 }}>{item.title}</Typography>
                                    {item.dueDate && <Typography level="body-xs" sx={{ color: 'neutral.500' }}>Due: {item.dueDate}</Typography>}
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          )}
                          {!sc.sectionExplanation && !sc.departmentExplanation && !sc.administrationExplanation && (
                            <Typography level="body-sm" sx={{ color: 'neutral.400', fontStyle: 'italic' }}>No response submitted yet.</Typography>
                          )}
                        </Box>
                      </Card>
                    ))}
                  </Box>
                )
              )}
            </DialogContent>
            <DialogActions>
              <Button variant="plain" color="neutral" onClick={() => setResponseModalOpen(false)}>Close</Button>
            </DialogActions>
          </ModalDialog>
        </Modal>

      </Box>
    </MainLayout>
  );
};

export default TableView;


