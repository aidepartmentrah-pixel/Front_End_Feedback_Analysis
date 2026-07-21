// src/components/settings/PolicyConfiguration.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Divider,
  Button,
  Sheet,
  CircularProgress,
} from "@mui/joy";
import Snackbar from "@mui/joy/Snackbar";
import SaveIcon from "@mui/icons-material/Save";
import {
  fetchOrgLevelPolicy,
  saveHospitalPolicy,
  saveSectionsPolicy,
  saveDepartmentsPolicy,
  saveAdministrationsPolicy,
} from "../../api/settingsPolicyApi";
import theme from "../../theme";

// ─────────────────────────────────────────────────────────────────────────────
// Safe defaults (shown until the API responds)
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_HOSPITAL = {
  low_severity_limit: 10,
  medium_severity_limit: 5,
  high_severity_limit: 3,
  clinical_domain_limit: 10,
  management_domain_limit: 10,
  relational_domain_limit: 10,
};
const DEFAULT_SECTIONS = { all_limit: 10, medium_limit: 5, high_limit: 3 };
const DEFAULT_DOMAIN = {
  clinical_domain_limit: 10,
  management_domain_limit: 10,
  relational_domain_limit: 10,
};

// ─────────────────────────────────────────────────────────────────────────────
// Small reusable helpers
// ─────────────────────────────────────────────────────────────────────────────
const numVal = (v) => (v === "" ? "" : parseInt(v, 10) || 0);

function PolicyField({ label, value, onChange, hint }) {
  return (
    <Sheet variant="outlined" sx={{ p: 2.5, borderRadius: "md" }}>
      <FormControl>
        <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>{label}</FormLabel>
        {hint && (
          <Typography level="body-xs" sx={{ color: theme.colors.textTertiary, mb: 1 }}>
            {hint}
          </Typography>
        )}
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(numVal(e.target.value))}
          slotProps={{ input: { min: 0 } }}
          sx={{ maxWidth: 160 }}
        />
      </FormControl>
    </Sheet>
  );
}

function CardSaveRow({ saving, dirty, onSave }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1 }}>
      <Button
        variant="solid"
        color="primary"
        size="sm"
        startDecorator={saving ? <CircularProgress size="sm" /> : <SaveIcon />}
        onClick={onSave}
        disabled={!dirty || saving}
        loading={saving}
      >
        {saving ? "Saving…" : "Save"}
      </Button>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
const PolicyConfiguration = () => {
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Per-card state
  const [hospital, setHospital] = useState(DEFAULT_HOSPITAL);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [departments, setDepartments] = useState(DEFAULT_DOMAIN);
  const [administrations, setAdministrations] = useState(DEFAULT_DOMAIN);

  // Per-card dirty / saving flags
  const [dirty, setDirty] = useState({ hospital: false, sections: false, departments: false, administrations: false });
  const [saving, setSaving] = useState({ hospital: false, sections: false, departments: false, administrations: false });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", color: "success" });

  // ── Load all 4 cards on mount ──
  const loadAll = useCallback(async () => {
    try {
      setLoadingPage(true);
      setLoadError(null);
      const data = await fetchOrgLevelPolicy();
      setHospital({ ...DEFAULT_HOSPITAL, ...data.hospital });
      setSections({ ...DEFAULT_SECTIONS, ...data.sections });
      setDepartments({ ...DEFAULT_DOMAIN, ...data.departments });
      setAdministrations({ ...DEFAULT_DOMAIN, ...data.administrations });
      setDirty({ hospital: false, sections: false, departments: false, administrations: false });
    } catch (err) {
      console.error("Failed to load policy levels:", err);
      setLoadError("Failed to load policy configuration. Please refresh the page.");
    } finally {
      setLoadingPage(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Generic field updater (marks card dirty) ──
  const updateField = (setter, card) => (field, value) => {
    setter((prev) => ({ ...prev, [field]: value }));
    setDirty((prev) => ({ ...prev, [card]: true }));
  };

  const updateHospital     = updateField(setHospital, "hospital");
  const updateSections     = updateField(setSections, "sections");
  const updateDepartments  = updateField(setDepartments, "departments");
  const updateAdmins       = updateField(setAdministrations, "administrations");

  // ── Per-card save handlers ──
  const makeSave = (card, apiFn, getPayload) => async () => {
    try {
      setSaving((prev) => ({ ...prev, [card]: true }));
      await apiFn(getPayload());
      setDirty((prev) => ({ ...prev, [card]: false }));
      setSnackbar({ open: true, message: `${card.charAt(0).toUpperCase() + card.slice(1)} policy saved.`, color: "success" });
    } catch (err) {
      console.error(`Failed to save ${card} policy:`, err);
      setSnackbar({ open: true, message: `Failed to save ${card} policy. Please try again.`, color: "danger" });
    } finally {
      setSaving((prev) => ({ ...prev, [card]: false }));
    }
  };

  const handleSaveHospital       = makeSave("hospital",       saveHospitalPolicy,       () => hospital);
  const handleSaveSections       = makeSave("sections",       saveSectionsPolicy,       () => sections);
  const handleSaveDepartments    = makeSave("departments",    saveDepartmentsPolicy,    () => departments);
  const handleSaveAdmins         = makeSave("administrations", saveAdministrationsPolicy, () => administrations);

  // ─────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────
  if (loadingPage) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
        <CircularProgress size="lg" />
        <Typography level="body-md" sx={{ ml: 2 }}>Loading policy configuration…</Typography>
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography level="body-md" color="danger">{loadError}</Typography>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={loadAll}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Page header */}
      <Box>
        <Typography level="h3" sx={{ mb: 0.5, fontWeight: 700, fontFamily: theme.settings.fontFamily, color: theme.settings.headerColor }}>
          Policy Configuration
        </Typography>
        <Typography level="body-md" sx={{ color: theme.colors.textSecondary }}>
          Standardized thresholds for quality monitoring. Each level applies identically to all units at that level.
        </Typography>
      </Box>

      {/* ── Card 1: Hospital ── */}
      <Card sx={{ p: 3 }}>
        <Typography level="h4" sx={{ mb: 0.5, fontWeight: 700, fontFamily: theme.settings.fontFamily }}>Hospital</Typography>
        <Typography level="body-sm" sx={{ color: theme.colors.textSecondary, mb: 2 }}>
          Global hospital-level thresholds.
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Typography level="title-sm" sx={{ mb: 1.5, color: theme.colors.textSecondary }}>Severity limits</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 2.5 }}>
          <PolicyField label="Low severity limit" value={hospital.low_severity_limit}
            onChange={(v) => updateHospital("low_severity_limit", v)} />
          <PolicyField label="Medium severity limit" value={hospital.medium_severity_limit}
            onChange={(v) => updateHospital("medium_severity_limit", v)} />
          <PolicyField label="High severity limit" value={hospital.high_severity_limit}
            onChange={(v) => updateHospital("high_severity_limit", v)} />
        </Box>

        <Typography level="title-sm" sx={{ mb: 1.5, color: theme.colors.textSecondary }}>Domain limits</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 2 }}>
          <PolicyField label="Clinical domain limit" value={hospital.clinical_domain_limit}
            onChange={(v) => updateHospital("clinical_domain_limit", v)} />
          <PolicyField label="Management domain limit" value={hospital.management_domain_limit}
            onChange={(v) => updateHospital("management_domain_limit", v)} />
          <PolicyField label="Relational domain limit" value={hospital.relational_domain_limit}
            onChange={(v) => updateHospital("relational_domain_limit", v)} />
        </Box>

        <CardSaveRow saving={saving.hospital} dirty={dirty.hospital} onSave={handleSaveHospital} />
      </Card>

      {/* ── Card 2: Sections ── */}
      <Card sx={{ p: 3 }}>
        <Typography level="h4" sx={{ mb: 0.5, fontWeight: 700, fontFamily: theme.settings.fontFamily }}>Sections</Typography>
        <Typography level="body-sm" sx={{ color: theme.colors.textSecondary, mb: 2 }}>
          Applied identically to all sections. Each HCAT classification inside a section is evaluated independently against these thresholds.
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 2 }}>
          <PolicyField
            label="Low severity incidents per classification"
            hint="Low-severity case count per HCAT classification"
            value={sections.all_limit}
            onChange={(v) => updateSections("all_limit", v)}
          />
          <PolicyField
            label="Medium incidents per classification"
            hint="Medium-severity cases per classification"
            value={sections.medium_limit}
            onChange={(v) => updateSections("medium_limit", v)}
          />
          <PolicyField
            label="High incidents per classification"
            hint="High-severity cases per classification"
            value={sections.high_limit}
            onChange={(v) => updateSections("high_limit", v)}
          />
        </Box>

        <CardSaveRow saving={saving.sections} dirty={dirty.sections} onSave={handleSaveSections} />
      </Card>

      {/* ── Card 3: Departments ── */}
      <Card sx={{ p: 3 }}>
        <Typography level="h4" sx={{ mb: 0.5, fontWeight: 700, fontFamily: theme.settings.fontFamily }}>Departments</Typography>
        <Typography level="body-sm" sx={{ color: theme.colors.textSecondary, mb: 2 }}>
          Applied identically to all departments. Domain limits are evaluated per department.
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 2 }}>
          <PolicyField label="Clinical domain limit" value={departments.clinical_domain_limit}
            onChange={(v) => updateDepartments("clinical_domain_limit", v)} />
          <PolicyField label="Management domain limit" value={departments.management_domain_limit}
            onChange={(v) => updateDepartments("management_domain_limit", v)} />
          <PolicyField label="Relational domain limit" value={departments.relational_domain_limit}
            onChange={(v) => updateDepartments("relational_domain_limit", v)} />
        </Box>

        <CardSaveRow saving={saving.departments} dirty={dirty.departments} onSave={handleSaveDepartments} />
      </Card>

      {/* ── Card 4: Administrations ── */}
      <Card sx={{ p: 3 }}>
        <Typography level="h4" sx={{ mb: 0.5, fontWeight: 700, fontFamily: theme.settings.fontFamily }}>Administrations</Typography>
        <Typography level="body-sm" sx={{ color: theme.colors.textSecondary, mb: 2 }}>
          Applied identically to all administrations. Domain limits are evaluated per administration.
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 2 }}>
          <PolicyField label="Clinical domain limit" value={administrations.clinical_domain_limit}
            onChange={(v) => updateAdmins("clinical_domain_limit", v)} />
          <PolicyField label="Management domain limit" value={administrations.management_domain_limit}
            onChange={(v) => updateAdmins("management_domain_limit", v)} />
          <PolicyField label="Relational domain limit" value={administrations.relational_domain_limit}
            onChange={(v) => updateAdmins("relational_domain_limit", v)} />
        </Box>

        <CardSaveRow saving={saving.administrations} dirty={dirty.administrations} onSave={handleSaveAdmins} />
      </Card>

      {/* Feedback snackbar */}
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
