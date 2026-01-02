// src/components/TableView/CustomViewManager.js
import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Grid,
  Box,
  Select,
  Option,
  Card,
  Typography,
  IconButton,
  List,
  ListItem,
  Chip,
} from "@mui/joy";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import {
  fetchCustomViews,
  createCustomView,
  updateCustomView,
  deleteCustomView,
  DEFAULT_VIEW_COLUMNS,
} from "../../api/customViews";

const CustomViewManager = ({ onViewSelect }) => {
  const [views, setViews] = useState([]);
  const [selectedView, setSelectedView] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [editingViewId, setEditingViewId] = useState(null);
  const [viewName, setViewName] = useState("");
  const [selectedColumns, setSelectedColumns] = useState({});
  const [dialogError, setDialogError] = useState(null);

  // Load custom views on mount
  useEffect(() => {
    loadViews();
  }, []);

  // Log editingViewId changes for debugging
  useEffect(() => {
    console.log("Current editingViewId state:", editingViewId);
    console.log("showDialog state:", showDialog);
  }, [editingViewId, showDialog]);

  // Helper function to extract ID from view object
  const getViewId = (view) => {
    return view.id || view.ID || view.view_id || view.ViewId || view.ViewID;
  };

  const loadViews = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomViews(true); // activeOnly=true
      
      // Handle different response formats from backend
      let viewsArray = [];
      if (Array.isArray(data)) {
        viewsArray = data;
      } else if (data && Array.isArray(data.views)) {
        viewsArray = data.views;
      } else if (data && Array.isArray(data.data)) {
        viewsArray = data.data;
      } else if (data && typeof data === 'object') {
        // Log the response structure for debugging
        console.log("Custom views response structure:", data);
        viewsArray = [];
      }
      
      setViews(viewsArray);
      setError(null);
    } catch (err) {
      setError("Failed to load custom views");
      console.error("Error loading views:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    console.log("Creating new view - resetting editingViewId");
    setEditingViewId(null);
    setViewName("");
    setSelectedColumns(
      DEFAULT_VIEW_COLUMNS.reduce((acc, col) => {
        acc[col.key] = false;
        return acc;
      }, {})
    );
    setDialogError(null);
    setShowDialog(true);
    console.log("New view dialog opened");
  };

  const handleEditView = (view) => {
    const viewId = getViewId(view);
    console.log("Editing view:", view);
    console.log("View ID being set:", viewId);
    try {
      setEditingViewId(viewId);
      setViewName(view.ViewName);
      setSelectedColumns(
        DEFAULT_VIEW_COLUMNS.reduce((acc, col) => {
          acc[col.key] = view[col.key] || false;
          return acc;
        }, {})
      );
      setDialogError(null);
      setShowDialog(true);
      console.log("Edit dialog opened for view ID:", viewId);
    } catch (err) {
      console.error("Error opening edit dialog:", err);
      setDialogError("Failed to open edit dialog");
    }
  };

  const handleSaveView = async () => {
    // Validation
    if (!viewName.trim()) {
      setDialogError("View name is required");
      return;
    }

    const hasAtLeastOne = Object.values(selectedColumns).some((val) => val);
    if (!hasAtLeastOne) {
      setDialogError("At least one column must be selected");
      return;
    }

    try {
      const payload = {
        ViewName: viewName,
        ...selectedColumns,
      };

      console.log("Saving view - editingViewId:", editingViewId);
      console.log("Payload:", payload);

      if (editingViewId) {
        console.log("Updating view with ID:", editingViewId);
        await updateCustomView(editingViewId, payload);
        console.log("View updated successfully");
      } else {
        console.log("Creating new view");
        await createCustomView(payload);
        console.log("View created successfully");
      }

      await loadViews();
      setShowDialog(false);
      setEditingViewId(null);
      setViewName("");
      setSelectedColumns({});
    } catch (err) {
      console.error("Error saving view:", err);
      setDialogError(err.message);
    }
  };

  const handleDeleteView = async (viewId) => {
    console.log("handleDeleteView called with viewId:", viewId);
    console.log("Type of viewId:", typeof viewId);
    
    if (!viewId || viewId === undefined) {
      console.error("ERROR: viewId is undefined or null!");
      setError("Error: View ID is missing. Cannot delete.");
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this view?")) {
      return;
    }

    try {
      console.log("=== DELETE VIEW START ===");
      console.log("View ID to delete:", viewId);
      console.log("Type of viewId:", typeof viewId);
      
      setError(null); // Clear any previous errors
      
      console.log("Calling deleteCustomView API...");
      await deleteCustomView(viewId, false); // soft delete
      
      console.log("Delete API call successful");
      console.log("Reloading views...");
      await loadViews();
      
      console.log("Views reloaded");
      
      if (selectedView?.id === viewId) {
        console.log("Deselecting deleted view");
        setSelectedView(null);
      }
      
      console.log("=== DELETE VIEW SUCCESS ===");
    } catch (err) {
      console.error("=== DELETE VIEW ERROR ===");
      console.error("Full error object:", err);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      
      const errorMsg = `Failed to delete view: ${err.message}`;
      setError(errorMsg);
      console.error(errorMsg);
    }
  };

  const handleSelectView = (view) => {
    setSelectedView(view);
    onViewSelect(view);
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* View Selector */}
      <Card
        sx={{
          p: 2.5,
          mb: 2,
          background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
          border: "2px solid #2196f3",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography level="h4" sx={{ color: "#1976d2" }}>
            📊 Custom Table Views
          </Typography>
          <Button
            startDecorator={<AddIcon />}
            onClick={handleCreateNew}
            sx={{ ml: "auto" }}
          >
            New View
          </Button>
        </Box>

        {error && (
          <Box
            sx={{
              p: 1,
              mb: 2,
              bgcolor: "#ffebee",
              border: "1px solid #ef5350",
              borderRadius: "4px",
              color: "#c62828",
            }}
          >
            {error}
          </Box>
        )}

        {loading ? (
          <Typography>Loading views...</Typography>
        ) : views.length === 0 ? (
          <Typography level="body-sm" sx={{ color: "#555" }}>
            No custom views yet. Create one to get started!
          </Typography>
        ) : (
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            {views.map((view) => {
              const viewId = getViewId(view);
              console.log("=== RENDERING VIEW ===");
              console.log("View object:", view);
              console.log("Extracted viewId:", viewId);
              
              return (
              <Box
                key={viewId || Math.random()}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1.5,
                  pl: 2,
                  bgcolor: selectedView && getViewId(selectedView) === viewId ? "#1976d2" : "#fff",
                  color: selectedView && getViewId(selectedView) === viewId ? "#fff" : "#333",
                  border: `2px solid ${selectedView && getViewId(selectedView) === viewId ? "#1976d2" : "#2196f3"}`,
                  borderRadius: "20px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontSize: "1.05rem",
                  fontWeight: 500,
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={() => handleSelectView(view)}
              >
                <span>{view.ViewName}</span>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton
                    size="md"
                    variant="plain"
                    sx={{
                      color: "inherit",
                      "&:hover": {
                        bgcolor: selectedView && getViewId(selectedView) === viewId ? "rgba(255,255,255,0.2)" : "rgba(33,150,243,0.1)",
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Edit button clicked for view:", view);
                      handleEditView(view);
                    }}
                  >
                    <EditIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                  <IconButton
                    size="md"
                    variant="plain"
                    color="danger"
                    sx={{
                      "&:hover": {
                        bgcolor: "rgba(211, 47, 47, 0.1)",
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Delete button clicked");
                      console.log("viewId to delete:", viewId);
                      handleDeleteView(viewId);
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>
              </Box>
              );
            })}
          </Box>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal open={showDialog} onClose={() => setShowDialog(false)}>
        <ModalDialog>
          <DialogTitle>
            {(() => {
              const isEditing = editingViewId && editingViewId > 0;
              console.log("Rendering title - editingViewId:", editingViewId, "isEditing:", isEditing);
              return isEditing ? "Edit View" : "Create New View";
            })()}
          </DialogTitle>
          <DialogContent>
            {dialogError && (
              <Box
                sx={{
                  p: 1,
                  mb: 2,
                  bgcolor: "#ffebee",
                  border: "1px solid #ef5350",
                  borderRadius: "4px",
                  color: "#c62828",
                }}
              >
                {dialogError}
              </Box>
            )}

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>View Name *</FormLabel>
              <Input
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                placeholder="e.g., Detailed Case View"
              />
            </FormControl>

            <FormLabel sx={{ mb: 1, display: "block" }}>
              Select Columns to Show *
            </FormLabel>

            <Grid container spacing={1}>
              {DEFAULT_VIEW_COLUMNS.map((col) => (
                <Grid xs={12} sm={6} key={col.key}>
                  <FormControl>
                    <Checkbox
                      label={col.label}
                      checked={selectedColumns[col.key] || false}
                      onChange={(e) =>
                        setSelectedColumns((prev) => ({
                          ...prev,
                          [col.key]: e.target.checked,
                        }))
                      }
                    />
                  </FormControl>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button variant="plain" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button variant="solid" color="primary" onClick={handleSaveView}>
              {editingViewId ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default CustomViewManager;
