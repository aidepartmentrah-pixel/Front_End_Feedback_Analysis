// src/components/TableView/FilterPanel.js
import React, { useState, useMemo } from "react";
import { Box, Card, Typography, Select, Option, Button, CircularProgress, Input, Chip } from "@mui/joy";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import LockIcon from "@mui/icons-material/Lock";
import theme from '../../theme';

// A value coming from a shared filter key may be a scalar (this panel's own
// single-selects) or an array (the Table View header's multi-select popovers,
// which write to the same `filters` keys). Joy's non-multiple <Select> only
// understands a scalar `value`, so this picks the first selected id to display.
const scalarValue = (v) => (Array.isArray(v) ? (v.length ? v[0] : null) : v);

const selectSx = {
  borderRadius: "8px",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  "&:hover": { borderColor: theme.colors.primary },
};

const listboxSx = { zIndex: 1300, bgcolor: "#fff", color: "#000", borderRadius: "8px" };

// Searchable dropdown — renders a text input on top of the option list to filter items.
// Relies entirely on Joy UI's built-in outside-click/blur dismissal — no manual
// DOM manipulation to force-close it (a previous version did this and made the
// dropdown close unreliably).
function SearchableSelect({ value, onChange, options, placeholder, size = "sm", getOptionKey, getOptionLabel, disabled = false }) {
  const [search, setSearch] = useState("");
  const filtered = options.filter(o =>
    !search || getOptionLabel(o).toLowerCase().includes(search.toLowerCase())
  );
  return (
    <Select
      placeholder={placeholder}
      value={value}
      onChange={(_, v) => { setSearch(""); onChange(v); }}
      size={size}
      disabled={disabled}
      sx={selectSx}
      slotProps={{
        listbox: { sx: listboxSx },
      }}
    >
      <Option value={null} sx={{ position: "sticky", top: 0, bgcolor: "#fff", zIndex: 2, borderBottom: "1px solid #eee", p: 0 }}>
        <Input
          size="sm"
          placeholder="Search…"
          value={search}
          onChange={e => { e.stopPropagation(); setSearch(e.target.value); }}
          onClick={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
          sx={{ width: "100%", border: "none", borderRadius: 0, "--Input-focusedHighlight": "transparent" }}
        />
      </Option>
      <Option value={null} sx={{ color: "#000" }}>{placeholder}</Option>
      {filtered.map(o => (
        <Option key={getOptionKey(o)} value={getOptionKey(o)} sx={{ color: "#000" }}>
          {getOptionLabel(o)}
        </Option>
      ))}
    </Select>
  );
}

// Combine Sections + Departments + Administrations into one flat, type-tagged
// list so "Target Unit" can be a single searchable field instead of 3.
// AdminsrationUnit IDs are globally unique across all types, so no prefixing
// is needed — just carry the type + parent chain alongside each id.
const buildTargetUnits = (filterOptions) => {
  const administrations = (filterOptions?.target_administrations || []).map(a => ({
    id: a.id,
    label: a.name,
    unitType: "administration",
    administrationId: a.id,
    departmentId: null,
  }));
  const adminIds = new Set(administrations.map(a => a.id));
  // target_departments includes some Type=323 (administration) rows that
  // directly parent sections with no intermediate department — those are
  // already represented above, so exclude them here to avoid duplicates.
  const departments = (filterOptions?.target_departments || [])
    .filter(d => !adminIds.has(d.id))
    .map(d => ({
      id: d.id,
      label: d.name + (d.administration_name ? ` (${d.administration_name})` : ""),
      unitType: "department",
      administrationId: d.administration_id,
      departmentId: d.id,
    }));
  const sections = (filterOptions?.sections || []).map(s => ({
    id: s.section_id,
    label: s.section_name + (s.department_name ? ` — ${s.department_name}` : ""),
    unitType: "section",
    administrationId: s.administration_id,
    departmentId: s.department_id,
  }));
  return [...administrations, ...departments, ...sections];
};

// Scope + optionally lock the Target Unit list based on the current user's role.
// Section admins are pinned to their own section; department/administration
// admins can pick anything in their own subtree. Everyone else is unrestricted
// here — the backend independently enforces real access via allowed_unit_ids
// regardless of what this control shows, so this is a UX narrowing, not the
// security boundary.
const scopeTargetUnits = (allUnits, user) => {
  const roles = user?.roles || [];
  const broadAccessRoles = ["SOFTWARE_ADMIN", "COMPLAINT_SUPERVISOR", "WORKER"];
  if (roles.some(r => broadAccessRoles.includes(r))) {
    return { units: allUnits, locked: false, forcedId: null };
  }
  if (roles.includes("SECTION_ADMIN") && user?.primary_unit_id) {
    const own = allUnits.find(u => u.unitType === "section" && u.id === user.primary_unit_id);
    return { units: own ? [own] : [], locked: true, forcedId: user.primary_unit_id };
  }
  if (roles.includes("DEPARTMENT_ADMIN") && user?.primary_unit_id) {
    const scoped = allUnits.filter(u => u.id === user.primary_unit_id || u.departmentId === user.primary_unit_id);
    return { units: scoped, locked: false, forcedId: null };
  }
  if (roles.includes("ADMINISTRATION_ADMIN") && user?.primary_unit_id) {
    const scoped = allUnits.filter(u => u.id === user.primary_unit_id || u.administrationId === user.primary_unit_id);
    return { units: scoped, locked: false, forcedId: null };
  }
  return { units: allUnits, locked: false, forcedId: null };
};

const FilterPanel = ({ filters, filterOptions, loading, onChange, onClear, user }) => {
  const handleFilterChange = (field, value) => {
    onChange({ ...filters, [field]: value || null });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0));

  const allTargetUnits = useMemo(() => buildTargetUnits(filterOptions), [filterOptions]);
  const { units: scopedTargetUnits, locked: targetUnitLocked, forcedId: forcedTargetUnitId } = useMemo(
    () => scopeTargetUnits(allTargetUnits, user),
    [allTargetUnits, user]
  );
  const targetUnitById = useMemo(() => new Map(allTargetUnits.map(u => [u.id, u])), [allTargetUnits]);

  const selectedTargetUnitId =
    filters.target_department_id || filters.target_dept_parent_id || filters.target_admin_id || null;

  // Section admins are pinned to their own unit — persist that into the real
  // filter state once it's known, so the query itself reflects it too.
  React.useEffect(() => {
    if (targetUnitLocked && forcedTargetUnitId && filters.target_department_id !== forcedTargetUnitId) {
      onChange({
        ...filters,
        target_department_id: forcedTargetUnitId,
        target_dept_parent_id: null,
        target_admin_id: null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUnitLocked, forcedTargetUnitId]);

  const handleTargetUnitChange = (newId) => {
    if (newId === null) {
      onChange({ ...filters, target_department_id: null, target_dept_parent_id: null, target_admin_id: null });
      return;
    }
    const unit = targetUnitById.get(newId);
    if (!unit) return;
    const next = { ...filters, target_department_id: null, target_dept_parent_id: null, target_admin_id: null };
    if (unit.unitType === "section") next.target_department_id = newId;
    else if (unit.unitType === "department") next.target_dept_parent_id = newId;
    else if (unit.unitType === "administration") next.target_admin_id = newId;
    onChange(next);
  };

  if (loading || !filterOptions) {
    return (
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CircularProgress size="sm" />
          <Typography level="body-sm">Loading filters...</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        p: 3,
        mb: 3,
        background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
        border: `1px solid ${theme.colors.primary}1A`,
        position: "relative",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterListIcon sx={{ color: theme.colors.primary }} />
          <Typography level="h4" sx={{ fontWeight: 700, color: theme.colors.primary }}>
            Filters
          </Typography>
        </Box>
        <Button
          variant={hasActiveFilters ? "solid" : "outlined"}
          color={hasActiveFilters ? "danger" : "neutral"}
          size="sm"
          startDecorator={<ClearIcon />}
          onClick={onClear}
          disabled={!hasActiveFilters}
          sx={{
            borderRadius: "20px",
            fontWeight: 600,
            opacity: hasActiveFilters ? 1 : 0.5,
            boxShadow: hasActiveFilters ? "0 2px 8px rgba(220,38,38,0.25)" : "none",
            transition: "all 0.15s ease",
          }}
        >
          Reset Filters
        </Button>
      </Box>

      {/* Quick Time Filters */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Typography level="body-xs" sx={{ alignSelf: "center", color: "#666", fontWeight: 600 }}>Quick:</Typography>
        {/* Today quick filter */}
        {(() => {
          const todayStr = new Date().toISOString().split("T")[0];
          const isActive = filters.start_date === todayStr && filters.end_date === todayStr;
          return (
            <Button
              key="today"
              size="sm"
              variant={isActive ? "solid" : "soft"}
              color={isActive ? "primary" : "neutral"}
              sx={{ borderRadius: "16px", fontWeight: 600, transition: "all 0.15s ease" }}
              onClick={() => {
                if (isActive) {
                  onChange({ ...filters, start_date: null, end_date: null });
                } else {
                  onChange({ ...filters, start_date: todayStr, end_date: todayStr });
                }
              }}
            >
              Today
            </Button>
          );
        })()}
        {[7, 30, 60].map(days => {
          const end = new Date();
          const start = new Date();
          start.setDate(start.getDate() - days);
          const startStr = start.toISOString().split("T")[0];
          const endStr = end.toISOString().split("T")[0];
          const isActive = filters.start_date === startStr && filters.end_date === endStr;
          return (
            <Button
              key={days}
              size="sm"
              variant={isActive ? "solid" : "soft"}
              color={isActive ? "primary" : "neutral"}
              sx={{ borderRadius: "16px", fontWeight: 600, transition: "all 0.15s ease" }}
              onClick={() => {
                if (isActive) {
                  // Toggle off — clear date range
                  onChange({ ...filters, start_date: null, end_date: null });
                } else {
                  onChange({ ...filters, start_date: startStr, end_date: endStr });
                }
              }}
            >
              Last {days} days
            </Button>
          );
        })}
      </Box>

      {/* Filter Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
        }}
      >
        {/* Issuing Org Unit (searchable) */}
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>Issuing Unit</Typography>
          <SearchableSelect
            value={scalarValue(filters.issuing_org_unit_id)}
            onChange={(v) => handleFilterChange("issuing_org_unit_id", v)}
            options={filterOptions?.issuing_org_units || []}
            placeholder="All units"
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) => (item.name || item.name_en || item.name_ar || `Unit ${item.id}`) + (item.count ? ` (${item.count})` : "")}
          />
        </Box>

        {/* Target Unit (merged Section/Department/Administration, searchable) */}
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5 }}>
            Target Unit
            {targetUnitLocked && (
              <Chip size="sm" variant="soft" color="neutral" startDecorator={<LockIcon sx={{ fontSize: 12 }} />} sx={{ fontSize: "0.65rem" }}>
                Your unit
              </Chip>
            )}
          </Typography>
          <SearchableSelect
            value={selectedTargetUnitId}
            onChange={handleTargetUnitChange}
            options={scopedTargetUnits}
            placeholder={targetUnitLocked ? "Your section" : "All units"}
            getOptionKey={(u) => u.id}
            getOptionLabel={(u) => u.label}
            disabled={targetUnitLocked}
          />
        </Box>

        {/* Start Date */}
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>
            Start Date
          </Typography>
          <Input
            type="date"
            value={filters.start_date || ""}
            onChange={(e) => handleFilterChange("start_date", e.target.value)}
            size="sm"
            sx={selectSx}
          />
        </Box>

        {/* End Date */}
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>
            End Date
          </Typography>
          <Input
            type="date"
            value={filters.end_date || ""}
            onChange={(e) => handleFilterChange("end_date", e.target.value)}
            size="sm"
            sx={selectSx}
          />
        </Box>
      </Box>
    </Card>
  );
};

export default FilterPanel;
