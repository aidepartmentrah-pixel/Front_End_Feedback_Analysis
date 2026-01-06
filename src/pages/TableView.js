// src/pages/TableView.js
import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Card, CircularProgress, Button, Chip } from "@mui/joy";
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
import { fetchComplaints, fetchFilterOptions, exportComplaints, deleteComplaint } from "../api/complaints";

const TableView = () => {
  const navigate = useNavigate();

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

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    issuing_org_unit_id: null,
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

  // ========================================
  // FETCH FILTER OPTIONS
  // ========================================
  useEffect(() => {
    console.log("🔄 Loading filter options...");
    fetchFilterOptions()
      .then((data) => {
        setFilterOptions(data);
      })
      .catch((err) => {
        console.error("❌ Failed to load filter options:", err);
      })
      .finally(() => setLoadingFilters(false));
  }, []);

  // ========================================
  // FETCH COMPLAINTS DATA
  // ========================================
  const loadComplaints = useCallback(() => {
    console.log("🔄 Loading complaints...");
    setLoading(true);
    setError(null);

    const params = {
      page: pagination.page,
      page_size: pagination.page_size,
      search: searchQuery || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      view: viewMode,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined && value !== "")
      ),
    };

    fetchComplaints(params)
      .then((data) => {
        setComplaints(data.complaints || []);
        setPagination(data.pagination);
        console.log("✅ Complaints loaded:", data.complaints.length, "records");
      })
      .catch((err) => {
        console.error("❌ Error loading complaints:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [pagination.page, pagination.page_size, searchQuery, filters, sortBy, sortOrder, viewMode]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  // ========================================
  // HANDLERS
  // ========================================
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1
  };

  const handleClearFilters = () => {
    setFilters({
      issuing_org_unit_id: null,
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
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle order
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // New column
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRowClick = (complaintId) => {
    navigate(`/complaints/${complaintId}`);
  };

  const handleEditRow = (complaintId) => {
    console.log("✏️ Editing complaint:", complaintId);
    navigate(`/edit-record/${complaintId}`);
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
      
      // Reload complaints
      console.log("🔄 Reloading complaints after deletion...");
      await loadComplaints();
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

  const handleExport = async () => {
    setExporting(true);
    try {
      const exportParams = {
        format: "xlsx",
        filters: Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined && value !== "")
        ),
      };

      const blob = await exportComplaints(exportParams);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `complaints-export-${new Date().toISOString().split("T")[0]}.xlsx`;
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
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              📋 جدول البلاغات (Complaints Table)
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
              onClick={handleExport}
              loading={exporting}
              disabled={loading || complaints.length === 0}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* Custom View Manager */}
        <Box sx={{ mb: 3 }}>
          <CustomViewManager onViewSelect={setSelectedCustomView} />
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
          <Box sx={{ flex: 1 }}>
            <SearchBar value={searchQuery} onChange={handleSearchChange} />
          </Box>
        </Box>

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
            <CircularProgress size="lg" sx={{ "--CircularProgress-color": "#667eea" }} />
            <Typography level="body-md" sx={{ mt: 2, color: "#667eea", fontWeight: 600 }}>
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
            <DataTable
              complaints={complaints}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onRowClick={handleRowClick}
              onEdit={handleEditRow}
              onDelete={handleDeleteRow}
              viewMode={viewMode}
              customView={selectedCustomView}
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
                <Typography level="h4" sx={{ mb: 1, color: "#667eea" }}>
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
      </Box>
    </MainLayout>
  );
};

export default TableView;


