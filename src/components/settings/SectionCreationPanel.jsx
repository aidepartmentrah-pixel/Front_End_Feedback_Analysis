// PHASE C — Production Section Creation Tool
// src/components/settings/SectionCreationPanel.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Select,
  Option,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Alert,
  IconButton,
  Snackbar,
} from "@mui/joy";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  createSection,
} from "../../api/adminUsers";
import {
  fetchSectionParents,
} from "../../api/orgUnits";

/**
 * Section Creation Panel - Production Settings Component
 * Allows SOFTWARE_ADMIN to create sections under departments/administrations
 * Always creates section_admin user automatically
 */
const SectionCreationPanel = () => {
  // Org units state - unified list of valid parents (ADMINISTRATION + DEPARTMENT only)
  const [sectionParents, setSectionParents] = useState([]);

  // Form state
  const [selectedParent, setSelectedParent] = useState("");
  const [sectionName, setSectionName] = useState("");

  // Result state
  const [creationResult, setCreationResult] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", color: "success" });

  // PHASE C — F-C5 — Validation state
  const [validationErrors, setValidationErrors] = useState({
    section_name: null,
    parent: null,
  });

  // Load org units on mount
  useEffect(() => {
    loadOrgUnits();
  }, []);

  const loadOrgUnits = async () => {
    try {
      setError(null);
      
      // Fetch all valid section parents (ADMINISTRATION + DEPARTMENT only)
      // Backend filters out SECTION units which cannot be parents
      const parents = await fetchSectionParents();
      setSectionParents(Array.isArray(parents) ? parents : []);
    } catch (err) {
      setError("Failed to load organizational units");
      console.error(err);
    }
  };

  // PHASE C — F-C5 — Validation function
  const validate = () => {
    const errors = {
      section_name: null,
      parent: null,
    };

    // Validate section name
    const trimmedName = sectionName.trim();
    if (!trimmedName) {
      errors.section_name = "Section name is required";
    } else if (trimmedName.length < 2) {
      errors.section_name = "Section name must be at least 2 characters";
    } else if (trimmedName.length > 100) {
      errors.section_name = "Section name must not exceed 100 characters";
    }

    // Validate parent selection
    if (!selectedParent) {
      errors.parent = "Please select a parent unit";
    }

    setValidationErrors(errors);

    // Return true if no errors
    return !errors.section_name && !errors.parent;
  };

  // Real-time validation on blur
  const handleSectionNameBlur = () => {
    const trimmedName = sectionName.trim();
    let error = null;

    if (!trimmedName) {
      error = "Section name is required";
    } else if (trimmedName.length < 2) {
      error = "Section name must be at least 2 characters";
    } else if (trimmedName.length > 100) {
      error = "Section name must not exceed 100 characters";
    }

    setValidationErrors((prev) => ({ ...prev, section_name: error }));
  };

  const handleCreateSection = async () => {
    // PHASE C — F-C5 — Run validation before submit
    if (!validate()) {
      setError("Please fix validation errors before submitting");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setValidationErrors({ section_name: null, parent: null });
      
      // PHASE C — F-C2 — Use new API wrapper with generic field names
      // PHASE C — F-C5 — Trim section name before sending
      const result = await createSection({
        section_name: sectionName.trim(),
        parent_unit_id: parseInt(selectedParent),
      });

      setCreationResult({
        section_id: result.section_id,
        username: result.username,
        password: result.password,
      });

      // Reset form
      setSectionName("");
      setSelectedParent("");

      // Refresh org hierarchy
      await loadOrgUnits();

      setSnackbar({
        open: true,
        message: "Section and admin user created successfully!",
        color: "success",
      });
    } catch (err) {
      // PHASE C — F-C7 — Use error mapping helper
      setError(extractApiErrorMessage(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: `${label} copied to clipboard`,
      color: "success",
    });
  };

  // PHASE C — F-C7 — Error contract mapping helper
  const extractApiErrorMessage = (error) => {
    // Check if error.response.data.detail exists
    if (error?.response?.data?.detail) {
      const detail = error.response.data.detail;
      
      // If detail is string, return it
      if (typeof detail === 'string') {
        return detail;
      }
      
      // If detail is array, join messages (pydantic validation errors come as {type, loc, msg, input})
      if (Array.isArray(detail)) {
        return detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
      }
      
      // If detail is a single object
      if (typeof detail === 'object') {
        return detail.msg || detail.message || JSON.stringify(detail);
      }
    }
    
    // Fallback message
    return "Section creation failed";
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }} data-testid="section-creation-panel">
      {/* Error Alert */}
      {error && (
        <Alert color="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Section Creation Card */}
      <Card variant="outlined">
        <Typography level="h4" sx={{ mb: 2 }}>
          🏗️ Create Section
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Section Name Input */}
          <FormControl error={!!validationErrors.section_name}>
            <FormLabel>Section Name</FormLabel>
            <Input
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              onBlur={handleSectionNameBlur}
              placeholder="Enter section name"
              error={!!validationErrors.section_name}
            />
            {validationErrors.section_name && (
              <FormHelperText>{validationErrors.section_name}</FormHelperText>
            )}
          </FormControl>

          {/* Parent Unit Dropdown - Shows only valid parents (ADMINISTRATION or DEPARTMENT) */}
          <FormControl error={!!validationErrors.parent}>
            <FormLabel>Select Parent Unit</FormLabel>
            <Select
              value={selectedParent}
              onChange={(e, newValue) => {
                setSelectedParent(newValue);
                // Clear parent error when selection is made
                if (newValue) {
                  setValidationErrors((prev) => ({ ...prev, parent: null }));
                }
              }}
              placeholder="Select Administration or Department"
            >
              {sectionParents
                .filter(Boolean)
                .map((unit) => (
                <Option key={unit.id || unit.ID} value={unit.id || unit.ID}>
                  {unit.name || unit.Name} ({unit.type_name || unit.typeName})
                </Option>
              ))}
            </Select>
            <FormHelperText>
              {validationErrors.parent || "Only Administrations and Departments can be parents. Sections are excluded."}
            </FormHelperText>
          </FormControl>

          <Button
            onClick={handleCreateSection}
            loading={loading}
            disabled={
              loading || 
              !sectionName.trim() || 
              !selectedParent || 
              !!validationErrors.section_name || 
              !!validationErrors.parent
            }
            color="primary"
          >
            Create Section + Admin User
          </Button>
        </Box>

        {/* Creation Result - Show Once with Warning */}
        {creationResult && (
          <Box sx={{ mt: 3, p: 2, bgcolor: "success.softBg", borderRadius: "sm" }}>
            <Typography level="title-md" sx={{ mb: 1, color: "success.plainColor" }}>
              ✅ Section Created Successfully
            </Typography>

            <Alert color="warning" variant="soft" sx={{ mb: 2 }}>
              <Typography level="body-sm">
                ⚠️ <strong>Credentials are shown once. Store them securely.</strong>
              </Typography>
            </Alert>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography level="body-sm" sx={{ fontWeight: "bold", minWidth: 100 }}>
                  Section ID:
                </Typography>
                <Input value={creationResult.section_id} readOnly size="sm" sx={{ flex: 1 }} />
                <IconButton
                  size="sm"
                  onClick={() => copyToClipboard(creationResult.section_id, "Section ID")}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography level="body-sm" sx={{ fontWeight: "bold", minWidth: 100 }}>
                  Username:
                </Typography>
                <Input value={creationResult.username} readOnly size="sm" sx={{ flex: 1 }} />
                <IconButton
                  size="sm"
                  onClick={() => copyToClipboard(creationResult.username, "Username")}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography level="body-sm" sx={{ fontWeight: "bold", minWidth: 100 }}>
                  Password:
                </Typography>
                <Input value={creationResult.password} readOnly size="sm" sx={{ flex: 1 }} />
                <IconButton
                  size="sm"
                  onClick={() => copyToClipboard(creationResult.password, "Password")}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Box>
            </Box>

            <Button
              size="sm"
              variant="plain"
              sx={{ mt: 2 }}
              onClick={() => setCreationResult(null)}
            >
              Create Another Section
            </Button>
          </Box>
        )}
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        color={snackbar.color}
      >
        {snackbar.message}
      </Snackbar>
    </Box>
  );
};

export default SectionCreationPanel;
