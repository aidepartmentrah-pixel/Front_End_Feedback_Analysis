// src/components/TableView/ViewSelector.js
import React, { useState, useEffect } from "react";
import { Box, Select, Option, FormControl, FormLabel, Typography, Card, Button, Modal, ModalDialog, Input, Checkbox, IconButton, Chip } from "@mui/joy";
import ViewListIcon from "@mui/icons-material/ViewList";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

// Predefined view configurations
export const VIEW_CONFIGURATIONS = {
  complete: {
    name: "Complete View (الكاملة)",
    description: "All columns visible",
    isCustom: false,
    columns: [
      "record_id",
      "created_at",
      "feedback_received_date",
      "patient_full_name",
      "issuing_department",
      "target_department",
      "source_1",
      "feedback_type",
      "domain",
      "category",
      "sub_category",
      "classification_en_label",
      "severity_level",
      "stage",
      "harm_level",
      "status",
      "improvement_opportunity_type",
      "actions"
    ]
  },
  summary: {
    name: "Summary View (ملخص)",
    description: "Essential information only",
    isCustom: false,
    columns: [
      "record_id",
      "feedback_received_date",
      "patient_full_name",
      "issuing_department",
      "domain",
      "category",
      "severity_level",
      "status",
      "actions"
    ]
  },
  clinical: {
    name: "Clinical Focus (سريري)",
    description: "Clinical and safety fields",
    isCustom: false,
    columns: [
      "record_id",
      "patient_full_name",
      "issuing_department",
      "domain",
      "category",
      "sub_category",
      "severity_level",
      "harm_level",
      "stage",
      "status",
      "actions"
    ]
  },
  administrative: {
    name: "Administrative (إداري)",
    description: "Department and workflow tracking",
    isCustom: false,
    columns: [
      "record_id",
      "created_at",
      "feedback_received_date",
      "issuing_department",
      "target_department",
      "source_1",
      "feedback_type",
      "status",
      "improvement_opportunity_type",
      "actions"
    ]
  },
  quality: {
    name: "Quality Review (جودة)",
    description: "For quality department review",
    isCustom: false,
    columns: [
      "record_id",
      "feedback_received_date",
      "domain",
      "category",
      "classification_en_label",
      "severity_level",
      "harm_level",
      "improvement_opportunity_type",
      "status",
      "actions"
    ]
  },
  export: {
    name: "Export Ready (تصدير)",
    description: "Optimized for export",
    isCustom: false,
    columns: [
      "record_id",
      "created_at",
      "feedback_received_date",
      "patient_full_name",
      "issuing_department",
      "target_department",
      "domain",
      "category",
      "sub_category",
      "severity_level",
      "status"
    ]
  }
};

// All available columns
export const AVAILABLE_COLUMNS = [
  { key: "record_id", label: "Record ID" },
  { key: "created_at", label: "Date Added" },
  { key: "feedback_received_date", label: "Feedback Date" },
  { key: "patient_full_name", label: "Patient Name" },
  { key: "issuing_department", label: "Issuing Department" },
  { key: "target_department", label: "Target Department" },
  { key: "source_1", label: "Source" },
  { key: "feedback_type", label: "Type" },
  { key: "domain", label: "Domain" },
  { key: "category", label: "Category" },
  { key: "sub_category", label: "Subcategory" },
  { key: "classification_en_label", label: "Classification" },
  { key: "severity_level", label: "Severity" },
  { key: "stage", label: "Stage" },
  { key: "harm_level", label: "Harm Level" },
  { key: "status", label: "Status" },
  { key: "improvement_opportunity_type", label: "Improvement Opportunity" },
  { key: "complaint_text", label: "📝 Complaint Text" },
  { key: "immediate_action", label: "⚡ Immediate Action" },
  { key: "taken_action", label: "🏥 Actions Taken" },
  { key: "actions", label: "Actions" }
];

const ViewSelector = ({ selectedView, onViewChange }) => {
  const [customViews, setCustomViews] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingView, setEditingView] = useState(null);
  const [newViewName, setNewViewName] = useState("");
  const [newViewDescription, setNewViewDescription] = useState("");
  const [selectedColumns, setSelectedColumns] = useState([]);

  // Load custom views from localStorage on mount
  useEffect(() => {
    const savedViews = localStorage.getItem("customTableViews");
    if (savedViews) {
      setCustomViews(JSON.parse(savedViews));
    }
  }, []);

  // Save custom views to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(customViews).length > 0) {
      localStorage.setItem("customTableViews", JSON.stringify(customViews));
    }
  }, [customViews]);

  // Combine predefined and custom views
  const allViews = { ...VIEW_CONFIGURATIONS, ...customViews };

  // Handle opening modal for new view
  const handleCreateNew = () => {
    setEditingView(null);
    setNewViewName("");
    setNewViewDescription("");
    setSelectedColumns(["record_id", "actions"]); // Default minimum columns
    setModalOpen(true);
  };

  // Handle editing existing custom view
  const handleEditView = (viewKey) => {
    const view = customViews[viewKey];
    if (view) {
      setEditingView(viewKey);
      setNewViewName(view.name);
      setNewViewDescription(view.description);
      setSelectedColumns([...view.columns]);
      setModalOpen(true);
    }
  };

  // Handle deleting custom view
  const handleDeleteView = (viewKey) => {
    if (window.confirm(`Are you sure you want to delete "${customViews[viewKey].name}"?`)) {
      const updatedViews = { ...customViews };
      delete updatedViews[viewKey];
      setCustomViews(updatedViews);
      localStorage.setItem("customTableViews", JSON.stringify(updatedViews));
      
      // If deleted view was selected, switch to complete view
      if (selectedView === viewKey) {
        onViewChange("complete");
      }
    }
  };

  // Handle saving new/edited view
  const handleSaveView = () => {
    if (!newViewName.trim()) {
      alert("Please enter a view name");
      return;
    }
    if (selectedColumns.length === 0) {
      alert("Please select at least one column");
      return;
    }

    const viewKey = editingView || `custom_${Date.now()}`;
    const newView = {
      name: newViewName,
      description: newViewDescription || "Custom view",
      isCustom: true,
      columns: selectedColumns
    };

    const updatedViews = {
      ...customViews,
      [viewKey]: newView
    };

    setCustomViews(updatedViews);
    setModalOpen(false);
    onViewChange(viewKey); // Switch to the newly created/edited view
  };

  // Handle column toggle
  const handleColumnToggle = (columnKey) => {
    setSelectedColumns(prev => {
      if (prev.includes(columnKey)) {
        return prev.filter(col => col !== columnKey);
      } else {
        return [...prev, columnKey];
      }
    });
  };
  return (
    <>
      <Card
        sx={{
          mb: 2,
          p: 2.5,
          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
          border: "2px solid rgba(102, 126, 234, 0.2)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <ViewListIcon sx={{ fontSize: 28, color: "#667eea" }} />
          <Box sx={{ flex: 1 }}>
            <Typography level="h5" sx={{ fontWeight: 700, color: "#667eea", mb: 0.5 }}>
              Table View Configuration
            </Typography>
            <Typography level="body-sm" sx={{ color: "#666" }}>
              Choose or create custom views with specific columns
            </Typography>
          </Box>
          <Button
            startDecorator={<AddIcon />}
            variant="solid"
            color="primary"
            onClick={handleCreateNew}
            sx={{ fontWeight: 600 }}
          >
            Create New View
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          <FormControl sx={{ flex: 1 }}>
            <FormLabel sx={{ fontSize: "13px", fontWeight: 600, mb: 1, color: "#555" }}>
              📊 Select View Type
            </FormLabel>
            <Select
              value={selectedView}
              onChange={(e, value) => onViewChange(value)}
              size="lg"
              sx={{
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              <Option disabled sx={{ fontWeight: 700, color: "#667eea" }}>
                Predefined Views
              </Option>
              {Object.entries(VIEW_CONFIGURATIONS).map(([key, config]) => (
                <Option key={key} value={key}>
                  <Box>
                    <Typography level="body-md" sx={{ fontWeight: 700 }}>
                      {config.name}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "#999" }}>
                      {config.description} • {config.columns.length} columns
                    </Typography>
                  </Box>
                </Option>
              ))}
              
              {Object.keys(customViews).length > 0 && (
                <>
                  <Option disabled sx={{ fontWeight: 700, color: "#5f27cd", mt: 1 }}>
                    My Custom Views
                  </Option>
                  {Object.entries(customViews).map(([key, config]) => (
                    <Option key={key} value={key}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <Box>
                          <Typography level="body-md" sx={{ fontWeight: 700 }}>
                            {config.name}
                          </Typography>
                          <Typography level="body-xs" sx={{ color: "#999" }}>
                            {config.description} • {config.columns.length} columns
                          </Typography>
                        </Box>
                      </Box>
                    </Option>
                  ))}
                </>
              )}
            </Select>
          </FormControl>

          {/* Show edit/delete buttons for custom views */}
          {allViews[selectedView]?.isCustom && (
            <Box sx={{ display: "flex", gap: 1, pt: 3.5 }}>
              <IconButton
                variant="soft"
                color="warning"
                onClick={() => handleEditView(selectedView)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                variant="soft"
                color="danger"
                onClick={() => handleDeleteView(selectedView)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 2, p: 1.5, background: "white", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
          <Typography level="body-xs" sx={{ color: "#666", fontWeight: 600, mb: 1 }}>
            📋 Currently showing:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {allViews[selectedView]?.columns
              .filter(col => col !== "actions")
              .map((col) => (
                <Box
                  key={col}
                  sx={{
                    px: 1,
                    py: 0.5,
                    background: allViews[selectedView]?.isCustom ? "#5f27cd" : "#667eea",
                    color: "white",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontWeight: 600,
                  }}
                >
                  {col.replace(/_/g, " ")}
                </Box>
              ))}
          </Box>
        </Box>
      </Card>

      {/* Create/Edit View Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalDialog sx={{ maxWidth: 700, width: "90%", maxHeight: "90vh", overflow: "auto" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography level="h4" sx={{ fontWeight: 700, color: "#667eea" }}>
              {editingView ? "✏️ Edit View" : "➕ Create New View"}
            </Typography>
            <IconButton onClick={() => setModalOpen(false)} size="sm">
              <CloseIcon />
            </IconButton>
          </Box>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ fontWeight: 600 }}>View Name *</FormLabel>
            <Input
              placeholder="e.g., My Custom View"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              size="lg"
            />
          </FormControl>

          <FormControl sx={{ mb: 3 }}>
            <FormLabel sx={{ fontWeight: 600 }}>Description (Optional)</FormLabel>
            <Input
              placeholder="e.g., For monthly reports"
              value={newViewDescription}
              onChange={(e) => setNewViewDescription(e.target.value)}
              size="lg"
            />
          </FormControl>

          <Typography level="body-md" sx={{ fontWeight: 700, mb: 1.5, color: "#555" }}>
            Select Columns to Display ({selectedColumns.length} selected):
          </Typography>

          <Box sx={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(2, 1fr)", 
            gap: 1.5,
            p: 2,
            background: "#f5f5f5",
            borderRadius: "8px",
            mb: 3
          }}>
            {AVAILABLE_COLUMNS.map((column) => (
              <Box key={column.key}>
                <Checkbox
                  label={column.label}
                  checked={selectedColumns.includes(column.key)}
                  onChange={() => handleColumnToggle(column.key)}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            ))}
          </Box>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button variant="outlined" color="neutral" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="solid"
              color="primary"
              startDecorator={<SaveIcon />}
              onClick={handleSaveView}
            >
              {editingView ? "Update View" : "Create View"}
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default ViewSelector;
