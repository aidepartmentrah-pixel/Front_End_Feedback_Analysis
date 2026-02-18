// src/components/settings/PolicyConfiguration.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  FormControl,
  FormLabel,
  Select,
  Option,
  Input,
  Checkbox,
  Divider,
  Button,
  Sheet,
  CircularProgress,
} from "@mui/joy";
import Snackbar from "@mui/joy/Snackbar";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { fetchDepartments } from "../../api/orgUnits";
import { fetchPolicy, savePolicy } from "../../api/settingsPolicyApi";

// Default policy configuration
const DEFAULT_POLICY = {
  severityLimits: {
    low: 5,
    medium: 3,
    high: 10,
  },
  highSeverityPercentageLimits: {
    clinical: 15,
    management: 10,
    relational: 12,
  },
  ruleActivation: {
    lowSeverityEnabled: true,
    mediumSeverityEnabled: true,
    highSeverityEnabled: true,
    highSeverityPercentageEnabled: true,
  },
};

const PolicyConfiguration = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [policyConfig, setPolicyConfig] = useState(DEFAULT_POLICY);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", color: "success" });

  // Load departments on mount
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDepartments();
      // Ensure we always have an array
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading departments:", err);
      setError("Failed to load departments. Please try again.");
      // Set empty array on error
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle department selection — load existing policy from backend
  const handleDepartmentChange = async (event, newValue) => {
    setSelectedDepartment(newValue);
    setHasChanges(false);
    if (!newValue) return;
    try {
      setLoading(true);
      const data = await fetchPolicy(newValue);
      // Backend returns { success, policy: {...}, is_default }
      const policy = data?.policy;
      if (policy) {
        // Merge with defaults so missing fields still have values
        setPolicyConfig({
          severityLimits: { ...DEFAULT_POLICY.severityLimits, ...policy.severityLimits },
          highSeverityPercentageLimits: { ...DEFAULT_POLICY.highSeverityPercentageLimits, ...policy.highSeverityPercentageLimits },
          ruleActivation: { ...DEFAULT_POLICY.ruleActivation, ...policy.ruleActivation },
        });
      } else {
        // No saved policy, use defaults
        setPolicyConfig(DEFAULT_POLICY);
      }
    } catch (err) {
      console.warn("No saved policy found, using defaults:", err);
      setPolicyConfig(DEFAULT_POLICY);
    } finally {
      setLoading(false);
    }
  };

  // Handle severity limit change
  const handleSeverityLimitChange = (severity, value) => {
    setPolicyConfig({
      ...policyConfig,
      severityLimits: {
        ...policyConfig.severityLimits,
        [severity]: parseInt(value) || 0,
      },
    });
    setHasChanges(true);
  };

  // Handle percentage limit change
  const handlePercentageLimitChange = (domain, value) => {
    setPolicyConfig({
      ...policyConfig,
      highSeverityPercentageLimits: {
        ...policyConfig.highSeverityPercentageLimits,
        [domain]: parseInt(value) || 0,
      },
    });
    setHasChanges(true);
  };

  // Handle rule activation toggle
  const handleRuleToggle = (rule) => {
    setPolicyConfig({
      ...policyConfig,
      ruleActivation: {
        ...policyConfig.ruleActivation,
        [rule]: !policyConfig.ruleActivation[rule],
      },
    });
    setHasChanges(true);
  };

  // Save configuration to backend
  const handleSave = async () => {
    if (!selectedDepartment) return;
    try {
      setSaving(true);
      await savePolicy(selectedDepartment, policyConfig);
      setHasChanges(false);
      setSnackbar({ open: true, message: "Policy saved successfully!", color: "success" });
    } catch (err) {
      console.error("Error saving policy:", err);
      setSnackbar({ open: true, message: "Failed to save policy. Please try again.", color: "danger" });
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset to default values?")) {
      setPolicyConfig(DEFAULT_POLICY);
      setHasChanges(true);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header Section */}
      <Box>
        <Typography level="h3" sx={{ mb: 1, fontWeight: 700 }}>
          📋 Policy Configuration
        </Typography>
        <Typography level="body-md" sx={{ color: "#666" }}>
          Configure department-level evaluation rules and severity limits
        </Typography>
      </Box>

      {/* Department Selector */}
      <Card variant="soft" sx={{ p: 3, position: "relative", zIndex: 10 }}>
        <FormControl>
          <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
            Select Department
          </FormLabel>
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 300, p: 2 }}>
              <CircularProgress size="sm" />
              <Typography level="body-sm">Loading departments...</Typography>
            </Box>
          ) : error ? (
            <Typography level="body-sm" color="danger">
              {error}
            </Typography>
          ) : (
            <Select
              placeholder="Choose a department to configure..."
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              size="lg"
              sx={{ minWidth: 300 }}
              slotProps={{
                listbox: {
                  sx: {
                    zIndex: 9999,
                    maxHeight: 400,
                  },
                },
              }}
            >
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          )}
        </FormControl>
      </Card>

      {/* Policy Editor - Only show when department is selected */}
      {selectedDepartment && (
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Section 1: Severity Repetition Limits */}
            <Box>
              <Typography level="h4" sx={{ mb: 2, fontWeight: 700 }}>
                📊 Severity Repetition Limits
              </Typography>
              <Typography level="body-sm" sx={{ mb: 3, color: "#666" }}>
                Set maximum allowed occurrences per season. Exceeding these limits will trigger a follow-up action.
              </Typography>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3 }}>
                {/* Low Severity */}
                <Sheet variant="outlined" sx={{ p: 3, borderRadius: "md" }}>
                  <FormControl>
                    <FormLabel>
                      🟡 Low Severity Limit
                    </FormLabel>
                    <Input
                      type="number"
                      value={policyConfig.severityLimits.low}
                      onChange={(e) => handleSeverityLimitChange("low", e.target.value)}
                      endDecorator={<Typography level="body-sm">times/season</Typography>}
                      slotProps={{
                        input: {
                          min: 0,
                          max: 100,
                        },
                      }}
                      disabled={!policyConfig.ruleActivation.lowSeverityEnabled}
                    />
                  </FormControl>
                </Sheet>

                {/* Medium Severity */}
                <Sheet variant="outlined" sx={{ p: 3, borderRadius: "md" }}>
                  <FormControl>
                    <FormLabel>
                      🟠 Medium Severity Limit
                    </FormLabel>
                    <Input
                      type="number"
                      value={policyConfig.severityLimits.medium}
                      onChange={(e) => handleSeverityLimitChange("medium", e.target.value)}
                      endDecorator={<Typography level="body-sm">times/season</Typography>}
                      slotProps={{
                        input: {
                          min: 0,
                          max: 100,
                        },
                      }}
                      disabled={!policyConfig.ruleActivation.mediumSeverityEnabled}
                    />
                  </FormControl>
                </Sheet>

                {/* High Severity */}
                <Sheet variant="outlined" sx={{ p: 3, borderRadius: "md" }}>
                  <FormControl>
                    <FormLabel>
                      🔴 High Severity Limit
                    </FormLabel>
                    <Input
                      type="number"
                      value={policyConfig.severityLimits.high}
                      onChange={(e) => handleSeverityLimitChange("high", e.target.value)}
                      endDecorator={<Typography level="body-sm">%</Typography>}
                      slotProps={{
                        input: {
                          min: 0,
                          max: 100,
                        },
                      }}
                      disabled={!policyConfig.ruleActivation.highSeverityEnabled}
                    />
                  </FormControl>
                </Sheet>
              </Box>
            </Box>

            <Divider />

            {/* Section 2: High Severity Percentage Limits */}
            <Box>
              <Typography level="h4" sx={{ mb: 2, fontWeight: 700 }}>
                📈 High Severity Percentage Limits (by Domain)
              </Typography>
              <Typography level="body-sm" sx={{ mb: 3, color: "#666" }}>
                Set maximum percentage of high severity incidents per domain. Calculated as: (High severity incidents ÷ Total incidents for department) × 100
              </Typography>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3 }}>
                {/* Clinical Domain */}
                <Sheet variant="outlined" sx={{ p: 3, borderRadius: "md", bgcolor: "#f0f9ff" }}>
                  <FormControl>
                    <FormLabel>
                      🏥 Clinical Domain
                    </FormLabel>
                    <Input
                      type="number"
                      value={policyConfig.highSeverityPercentageLimits.clinical}
                      onChange={(e) => handlePercentageLimitChange("clinical", e.target.value)}
                      endDecorator={<Typography level="body-sm">%</Typography>}
                      slotProps={{
                        input: {
                          min: 0,
                          max: 100,
                        },
                      }}
                      disabled={!policyConfig.ruleActivation.highSeverityPercentageEnabled}
                    />
                  </FormControl>
                </Sheet>

                {/* Management Domain */}
                <Sheet variant="outlined" sx={{ p: 3, borderRadius: "md", bgcolor: "#fef3c7" }}>
                  <FormControl>
                    <FormLabel>
                      📊 Management Domain
                    </FormLabel>
                    <Input
                      type="number"
                      value={policyConfig.highSeverityPercentageLimits.management}
                      onChange={(e) => handlePercentageLimitChange("management", e.target.value)}
                      endDecorator={<Typography level="body-sm">%</Typography>}
                      slotProps={{
                        input: {
                          min: 0,
                          max: 100,
                        },
                      }}
                      disabled={!policyConfig.ruleActivation.highSeverityPercentageEnabled}
                    />
                  </FormControl>
                </Sheet>

                {/* Relational Domain */}
                <Sheet variant="outlined" sx={{ p: 3, borderRadius: "md", bgcolor: "#f0fdf4" }}>
                  <FormControl>
                    <FormLabel>
                      🤝 Relational Domain
                    </FormLabel>
                    <Input
                      type="number"
                      value={policyConfig.highSeverityPercentageLimits.relational}
                      onChange={(e) => handlePercentageLimitChange("relational", e.target.value)}
                      endDecorator={<Typography level="body-sm">%</Typography>}
                      slotProps={{
                        input: {
                          min: 0,
                          max: 100,
                        },
                      }}
                      disabled={!policyConfig.ruleActivation.highSeverityPercentageEnabled}
                    />
                  </FormControl>
                </Sheet>
              </Box>
            </Box>

            <Divider />

            {/* Section 3: Rule Activation */}
            <Box>
              <Typography level="h4" sx={{ mb: 2, fontWeight: 700 }}>
                ✅ Rule Activation
              </Typography>
              <Typography level="body-sm" sx={{ mb: 3, color: "#666" }}>
                Enable or disable specific evaluation rules for this department
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Checkbox
                  label="Enable Low Severity Repetition Rule"
                  checked={policyConfig.ruleActivation.lowSeverityEnabled}
                  onChange={() => handleRuleToggle("lowSeverityEnabled")}
                  size="lg"
                />
                <Checkbox
                  label="Enable Medium Severity Repetition Rule"
                  checked={policyConfig.ruleActivation.mediumSeverityEnabled}
                  onChange={() => handleRuleToggle("mediumSeverityEnabled")}
                  size="lg"
                />
                <Checkbox
                  label="Enable High Severity Percentage Rule"
                  checked={policyConfig.ruleActivation.highSeverityEnabled}
                  onChange={() => handleRuleToggle("highSeverityEnabled")}
                  size="lg"
                />
                <Checkbox
                  label="Enable High Severity Percentage by Domain Rule"
                  checked={policyConfig.ruleActivation.highSeverityPercentageEnabled}
                  onChange={() => handleRuleToggle("highSeverityPercentageEnabled")}
                  size="lg"
                />
              </Box>
            </Box>

            <Divider />

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                color="neutral"
                startDecorator={<RestartAltIcon />}
                onClick={handleReset}
              >
                Reset to Defaults
              </Button>
              <Button
                variant="solid"
                color="primary"
                startDecorator={saving ? <CircularProgress size="sm" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={!hasChanges || saving}
                loading={saving}
              >
                {saving ? "Saving..." : "Save Configuration"}
              </Button>
            </Box>
          </Box>
        </Card>
      )}

      {/* Empty State - No Administration Selected */}
      {!selectedDepartment && (
        <Card variant="soft" sx={{ p: 6, textAlign: "center" }}>
          <Typography level="h4" sx={{ mb: 1, color: "#999" }}>
            👆 Select an administration to begin
          </Typography>
          <Typography level="body-md" sx={{ color: "#666" }}>
            Choose an administration from the dropdown above to configure its evaluation policies
          </Typography>
        </Card>
      )}

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        color={snackbar.color}
        variant="soft"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snackbar.message}
      </Snackbar>
    </Box>
  );
};

export default PolicyConfiguration;
