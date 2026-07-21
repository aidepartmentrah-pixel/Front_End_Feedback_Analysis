// src/components/TableView/CustomViewManager.js
import React, { useState, useEffect, useRef } from "react";
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

// View selected automatically on first load, so the table never lands on the
// bare/unstyled fallback the user gets when no view is chosen yet.
const DEFAULT_VIEW_NAME = "Classifications";

const CustomViewManager = ({ onViewSelect, isAdmin = false }) => {
  const [views, setViews] = useState([]);
  const [selectedView, setSelectedView] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasAutoSelected = useRef(false);

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

      // Auto-select the default view once, the first time views load — never
      // clobbers a selection the user made afterward (e.g. via create/edit/delete refresh).
      if (!hasAutoSelected.current && viewsArray.length > 0) {
        hasAutoSelected.current = true;
        const defaultView = viewsArray.find((v) => v.ViewName === DEFAULT_VIEW_NAME);
        if (defaultView) {
          setSelectedView(defaultView);
          onViewSelect(defaultView);
        }
      }
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
          {isAdmin && (
            <Button
              startDecorator={<AddIcon />}
              onClick={handleCreateNew}
              sx={{ ml: "auto" }}
            >
              New View
            </Button>
          )}
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
                {isAdmin && (
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
                )}
              </Box>
              );
            })}
          </Box>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        open={showDialog}
        onClose={() => setShowDialog(false)}
        sx={{
          zIndex: 2000,
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(0,0,0,0.55)",
        }}
      >
        <ModalDialog
          sx={{
            width: { xs: "95vw", sm: "80vw", md: "820px" },
            maxWidth: "900px",
            maxHeight: "88vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            p: 0,
            boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          }}
        >
          {/* Header */}
          <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid", borderColor: "divider", flexShrink: 0 }}>
            <Typography level="h4" sx={{ fontWeight: 700 }}>
              {editingViewId && editingViewId > 0 ? "Edit Custom View" : "Create New Custom View"}
            </Typography>
            <Typography level="body-sm" sx={{ color: "#888", mt: 0.5 }}>
              Choose a name and select which columns to display in this view.
            </Typography>
          </Box>

          {/* Scrollable content */}
          <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2.5 }}>
            {dialogError && (
              <Box
                sx={{
                  p: 1.5,
                  mb: 2.5,
                  bgcolor: "#ffebee",
                  border: "1px solid #ef5350",
                  borderRadius: "6px",
                  color: "#c62828",
                  fontSize: "13px",
                }}
              >
                {dialogError}
              </Box>
            )}

            <FormControl sx={{ mb: 3 }}>
              <FormLabel sx={{ fontWeight: 600 }}>View Name *</FormLabel>
              <Input
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                placeholder="e.g., Detailed Case View"
                sx={{ maxWidth: 360 }}
              />
            </FormControl>

            <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography level="title-sm" sx={{ fontWeight: 700 }}>
                Select Columns to Display *
              </Typography>
              <Button
                size="sm"
                variant="plain"
                color="primary"
                onClick={() => {
                  const allSelected = Object.values(selectedColumns).every(Boolean);
                  const next = {};
                  DEFAULT_VIEW_COLUMNS.forEach(c => { next[c.key] = !allSelected; });
                  setSelectedColumns(next);
                }}
              >
                {Object.values(selectedColumns).every(Boolean) ? "Deselect All" : "Select All"}
              </Button>
            </Box>

            {/* Column groups */}
            {[
              {
                label: "Case Identity",
                keys: ["ShowRecordType", "ShowIncidentNumber", "ShowIncidentRequestCaseID", "ShowIncidentDate", "ShowFeedbackRecievedDate", "ShowCreatedAt", "ShowPublicationDate", "ShowCreatedByUserID"],
              },
              {
                label: "Patient & Location",
                keys: ["ShowPatientName", "ShowIssuingOrgUnitID", "ShowBuildingID", "ShowIsInPatient"],
              },
              {
                label: "Classification",
                keys: ["ShowDomainID", "ShowCategoryID", "ShowSubCategoryID", "ShowClassificationID", "ShowFeedbackIntentTypeID", "ShowClinicalRiskTypeID", "ShowSourceID"],
              },
              {
                label: "Status & Severity",
                keys: ["ShowSeverityID", "ShowStageID", "ShowHarmLevelID", "ShowCaseStatusID", "ShowExplanationStatusID"],
              },
              {
                label: "Text & Responses",
                keys: ["ShowComplaintText", "ShowComplaintSummary", "ShowImmediateAction", "ShowTakenAction", "ShowSectionAnswer", "ShowDepartmentAnswer", "ShowAdministrationAnswer", "ShowRcaReplies", "ShowCustomerServiceDecision", "ShowCustomerServiceDecisionDate"],
              },
              {
                label: "Workflow Timing (per level)",
                keys: ["ShowSectionEntry", "ShowSectionDeadline", "ShowDepartmentEntry", "ShowDepartmentDeadline", "ShowAdministrationEntry", "ShowAdministrationDeadline"],
              },
              {
                label: "Operational Indicators",
                keys: ["ShowTargetDepartment", "ShowSatisfactionStatus", "ShowSatisfactionDate", "ShowRedFlagIndicator", "ShowNeverEventIndicator", "ShowMorbidityIndicator", "ShowLateIndicator", "ShowForceClosedIndicator", "ShowLastEdited"],
              },
            ].map(group => {
              const groupCols = DEFAULT_VIEW_COLUMNS.filter(c => group.keys.includes(c.key));
              if (groupCols.length === 0) return null;
              return (
                <Box key={group.label} sx={{ mb: 2.5 }}>
                  <Typography level="body-xs" sx={{ fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
                    {group.label}
                  </Typography>
                  <Grid container spacing={1}>
                    {groupCols.map((col) => (
                      <Grid xs={12} sm={6} md={4} key={col.key}>
                        <Checkbox
                          label={col.label}
                          checked={selectedColumns[col.key] || false}
                          onChange={(e) =>
                            setSelectedColumns((prev) => ({
                              ...prev,
                              [col.key]: e.target.checked,
                            }))
                          }
                          size="sm"
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              );
            })}
          </Box>

          {/* Footer */}
          <Box sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider", display: "flex", justifyContent: "flex-end", gap: 1.5, flexShrink: 0 }}>
            <Button variant="plain" color="neutral" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button variant="solid" color="primary" onClick={handleSaveView}>
              {editingViewId ? "Update View" : "Create View"}
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default CustomViewManager;
