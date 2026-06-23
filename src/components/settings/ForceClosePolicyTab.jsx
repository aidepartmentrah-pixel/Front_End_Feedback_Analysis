// src/components/settings/ForceClosePolicyTab.jsx
// HCAT Automatic Force Close Policy — Session 6 (User Interface Integration)
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  Typography,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Switch,
  Divider,
  Button,
  CircularProgress,
  Alert,
} from "@mui/joy";
import Snackbar from "@mui/joy/Snackbar";
import SaveIcon from "@mui/icons-material/Save";
import { fetchForceClosePolicy, saveForceClosePolicy } from "../../api/forceClosePolicyApi";
import theme from "../../theme";

const DEFAULT_POLICY = {
  automatic_force_close_enabled: false,
  section_deadline_days: 10,
  department_deadline_days: 7,
  administration_deadline_days: 7,
};

const DEADLINE_FIELDS = [
  { key: "section_deadline_days", label: "Section deadline days", labelAr: "أيام مهلة القسم" },
  { key: "department_deadline_days", label: "Department deadline days", labelAr: "أيام مهلة الإدارة" },
  { key: "administration_deadline_days", label: "Administration deadline days", labelAr: "أيام مهلة الإدارة العليا" },
];

const ForceClosePolicyTab = () => {
  const [policy, setPolicy] = useState(DEFAULT_POLICY);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", color: "success" });

  const load = useCallback(async () => {
    try {
      setLoadingPage(true);
      setLoadError(null);
      const data = await fetchForceClosePolicy();
      setPolicy({
        automatic_force_close_enabled: !!data.automatic_force_close_enabled,
        section_deadline_days: data.section_deadline_days,
        department_deadline_days: data.department_deadline_days,
        administration_deadline_days: data.administration_deadline_days,
      });
      setFieldErrors({});
    } catch (err) {
      console.error("Failed to load Automatic Force Close Policy:", err);
      setLoadError("Failed to load Automatic Force Close Policy settings. Please refresh the page.");
    } finally {
      setLoadingPage(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateDeadline = (field, rawValue) => {
    const value = rawValue === "" ? "" : parseInt(rawValue, 10);
    setPolicy((prev) => ({ ...prev, [field]: Number.isNaN(value) ? "" : value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleEnabled = (checked) => {
    setPolicy((prev) => ({ ...prev, automatic_force_close_enabled: checked }));
  };

  const validate = () => {
    const errors = {};
    DEADLINE_FIELDS.forEach(({ key }) => {
      const value = policy[key];
      if (value === "" || value === null || value === undefined || !Number.isInteger(value) || value < 1) {
        errors[key] = "Must be a positive integer (minimum 1 day)";
      }
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      await saveForceClosePolicy({
        automatic_force_close_enabled: policy.automatic_force_close_enabled,
        section_deadline_days: policy.section_deadline_days,
        department_deadline_days: policy.department_deadline_days,
        administration_deadline_days: policy.administration_deadline_days,
      });
      setSnackbar({ open: true, message: "Automatic Force Close Policy saved successfully.", color: "success" });
    } catch (err) {
      console.error("Failed to save Automatic Force Close Policy:", err);
      const detail = err?.response?.data?.detail;
      setSnackbar({
        open: true,
        message: detail?.message || "Failed to save Automatic Force Close Policy. Please try again.",
        color: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
        <CircularProgress size="lg" />
        <Typography level="body-md" sx={{ ml: 2 }}>Loading Automatic Force Close Policy…</Typography>
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography level="body-md" color="danger">{loadError}</Typography>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={load}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, fontFamily: theme.settings.fontFamily }}>
      <Box>
        <Typography level="h3" sx={{ mb: 0.5, fontWeight: 700, fontFamily: theme.settings.fontFamily, color: theme.settings.headerColor }}>
          Force Close Policy
        </Typography>
        <Typography level="body-sm" sx={{ ...theme.typography.arabicSmall, color: theme.settings.subtitleColor }}>
          سياسة الإغلاق القسري التلقائي
        </Typography>
      </Box>

      <Card sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Switch
            checked={policy.automatic_force_close_enabled}
            onChange={(e) => toggleEnabled(e.target.checked)}
          />
          <Box>
            <Typography level="title-sm" sx={{ fontWeight: 600 }}>
              Enable automatic force close policy
            </Typography>
            <Typography level="body-xs" sx={{ ...theme.typography.arabicSmall, color: theme.settings.subtitleColor }}>
              تفعيل سياسة الإغلاق القسري التلقائي
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        <Typography level="title-sm" sx={{ mb: 1.5, color: theme.colors.textSecondary }}>Deadline days</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
          {DEADLINE_FIELDS.map(({ key, label, labelAr }) => (
            <FormControl key={key} error={!!fieldErrors[key]}>
              <FormLabel sx={{ fontWeight: 600 }}>{label}</FormLabel>
              <Typography level="body-xs" sx={{ ...theme.typography.arabicSmall, color: theme.settings.subtitleColor, mb: 0.5 }}>
                {labelAr}
              </Typography>
              <Input
                type="number"
                value={policy[key]}
                onChange={(e) => updateDeadline(key, e.target.value)}
                slotProps={{ input: { min: 1 } }}
                sx={{ maxWidth: 160 }}
              />
              {fieldErrors[key] && <FormHelperText>{fieldErrors[key]}</FormHelperText>}
            </FormControl>
          ))}
        </Box>

        {!policy.automatic_force_close_enabled && (
          <Alert color="neutral" variant="soft" sx={{ mt: 2.5 }}>
            The automatic force close policy is currently disabled. Cases will not be force-closed
            automatically until it is enabled.
          </Alert>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2.5 }}>
          <Button
            variant="solid"
            color="primary"
            size="sm"
            startDecorator={saving ? <CircularProgress size="sm" /> : <SaveIcon />}
            onClick={handleSave}
            loading={saving}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </Box>
      </Card>

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

export default ForceClosePolicyTab;
