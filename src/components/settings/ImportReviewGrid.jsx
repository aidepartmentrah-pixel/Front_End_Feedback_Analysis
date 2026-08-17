// src/components/settings/ImportReviewGrid.jsx
// The editable review grid for Step 3 of the import flow. Every row of
// every incident group is visible; click "Review"/"Fix Issue" to expand a
// row into an editable form, organized into the same logical sections a
// reviewer thinks in (Incident Details / Classification & Risk / Complaint
// Content / Assignment) rather than one long undifferentiated field matrix.
// Each row is edited and saved on its own -- no multi-row bulk-edit
// affordance.
import React, { useState, useEffect } from "react";
import {
  Box, Card, Typography, Chip, Button, Input, Textarea,
  Divider, Tooltip,
} from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import FlagIcon from "@mui/icons-material/Flag";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SearchIcon from "@mui/icons-material/Search";
import EntitySearchBox from "../incident/EntitySearchBox";
import SearchableSelect from "./SearchableSelect";
import { useEntitySearch } from "../../hooks/useEntitySearch";
import { searchDoctors, searchEmployees } from "../../api/insertRecord";

const BASE = "";

const DATE_FIELDS = ["Incident Date", "Received Date"];
const RECORD_TYPE_FIELD = "Record Type";
const INPATIENT_FIELD = "Is Inpatient";
const DOCTOR_FIELDS = ["Doctor 1", "Doctor 2", "Doctor 3"];
const WORKER_FIELDS = ["Worker 1 (Full Name)", "Worker 2 (Full Name)", "Worker 3 (Full Name)"];
// This is the old system's Incident number, repurposed as the real grouping
// key (rows sharing it merge into one Incident) -- no longer a separate
// hand-typed "Group Key" field, see backend TEMPLATE_COLUMNS.
const GROUP_KEY_FIELD = "Incident Number (Old System) (الرقم)";
// Free-text narrative fields -- a single-line Input truncates these to a
// few visible words, which is useless for actually reading/editing them.
const LONG_TEXT_FIELDS = ["Complaint Text", "Immediate Action", "Taken Action (الإجراءات المتخذة)"];
const LOOKUP_FIELD_TO_CATEGORY = {
  "Source (المصدر)": "sources",
  "Issuing Dept (قسم الصادر)": "org_units",
  "Classification (Arabic)": "classifications",
  "Severity": "severities",
  "Stage": "stages",
  "Harm Level": "harm_levels",
  "Feedback Risk Type": "risk_types",
  "Building": "buildings",
  "Target Dept": "org_units",
};
// Content fields that can carry Arabic text -- dir="auto" lets each one
// align itself off its own content instead of forcing a single global
// direction across a form that mixes English labels with Arabic values.
const RTL_CAPABLE_FIELDS = [
  "Patient Name", "Source (المصدر)", "Issuing Dept (قسم الصادر)", "Classification (Arabic)",
  "Target Dept", "Complaint Text", "Immediate Action", "Taken Action (الإجراءات المتخذة)",
];

// The expanded editor groups fields the way a reviewer actually thinks
// about an incident, instead of one long undifferentiated matrix. Domain/
// Category/Subcategory are deliberately absent here -- see BREADCRUMB below.
const FIELD_SECTIONS = [
  {
    title: "Incident Details",
    fields: [GROUP_KEY_FIELD, "Patient Name", "Incident Date", "Received Date", "Record Type", "Source (المصدر)", "Issuing Dept (قسم الصادر)"],
  },
  {
    title: "Classification & Risk",
    // The DB's classifications lookup is Arabic-only, so Arabic is the
    // real, mandatory field feeding it; English is an optional second
    // signal (see backend _match_classification) shown as plain text, not
    // a lookup dropdown, since it isn't matched against a DB list directly.
    fields: ["Classification (Arabic)", "Classification (English)", "__breadcrumb__", "Severity", "Stage", "Harm Level", "Feedback Risk Type", "Building", "Is Inpatient"],
  },
  {
    title: "Complaint Content",
    fields: ["Complaint Text", "Immediate Action", "Taken Action (الإجراءات المتخذة)"],
  },
  {
    title: "Assignment",
    fields: ["Target Dept", "Doctor 1", "Worker 1 (Full Name)"],
  },
];

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "ready", label: "Ready" },
  { key: "need_attention", label: "Need Attention" },
  { key: "rejected", label: "Rejected" },
];

export default function ImportReviewGrid({ batchId, groups, statusMeta, onRefresh, onError }) {
  const [lookups, setLookups] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [filterBucket, setFilterBucket] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const doctorSearch = useEntitySearch(searchDoctors);
  const workerSearch = useEntitySearch(searchEmployees);

  useEffect(() => {
    fetch(`${BASE}/api/import/lookups`, { credentials: "include" })
      .then((r) => r.json())
      .then(setLookups)
      .catch(() => setLookups({}));
  }, []);

  const startEdit = (row) => {
    setExpandedRow(row.row_number);
    // Seed Record Type from the backend's resolved value when the raw Excel
    // text doesn't literally read "Complaint"/"Notice" -- e.g. a recognized
    // alias like "فرصة تحسين" resolves correctly server-side, but the
    // toggle below can only highlight a button by comparing against those
    // two exact strings, so without this it shows as unselected even though
    // it's already resolved. Saving still writes back a clean "Complaint"/
    // "Notice" string, same as before.
    const seeded = { ...row.fields };
    const resolvedRecordType = row.resolved_display?.record_type;
    if (resolvedRecordType && seeded[RECORD_TYPE_FIELD] !== "Complaint" && seeded[RECORD_TYPE_FIELD] !== "Notice") {
      seeded[RECORD_TYPE_FIELD] = resolvedRecordType;
    }
    setEditValues(seeded);
  };

  const cancelEdit = () => {
    setExpandedRow(null);
    setEditValues({});
  };

  const saveEdit = async (rowNumber) => {
    setSaving(true);
    try {
      const resp = await fetch(`${BASE}/api/import/${batchId}/rows/${rowNumber}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: editValues }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onError(data?.detail || "Failed to save row.");
        return;
      }
      onRefresh(data);
      setExpandedRow(null);
    } catch (e) {
      onError("Network error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // Plain 2-option Selects (Record Type, Is Inpatient) as a toggle-button
  // pair instead -- no dropdown/portal machinery for a binary choice, and
  // clicking the already-selected option clears it back to unset (both
  // fields stay optional; the backend defaults blank to Complaint/No).
  const renderToggle = (choices, value, onChange) => (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      {choices.map((c) => (
        <Button
          key={c}
          size="sm"
          variant={value === c ? "solid" : "outlined"}
          color={value === c ? "primary" : "neutral"}
          onClick={() => onChange(value === c ? null : c)}
          sx={{ flex: 1 }}
        >
          {c}
        </Button>
      ))}
    </Box>
  );

  const renderFieldInput = (header, value, onChange) => {
    const rtl = RTL_CAPABLE_FIELDS.includes(header) ? { dir: "auto" } : {};

    if (header === GROUP_KEY_FIELD) {
      return <Typography level="body-sm" sx={{ color: "text.tertiary", fontStyle: "italic" }}>{value ?? "—"} (fix in Excel, re-upload)</Typography>;
    }
    if (DATE_FIELDS.includes(header)) {
      return <Input type="date" size="sm" value={value || ""} onChange={(e) => onChange(e.target.value)} slotProps={{ input: { lang: "en-GB" } }} />;
    }
    if (header === RECORD_TYPE_FIELD) {
      return renderToggle(["Complaint", "Notice"], value, onChange);
    }
    if (header === INPATIENT_FIELD) {
      return renderToggle(["Yes", "No"], value, onChange);
    }
    if (DOCTOR_FIELDS.includes(header)) {
      return (
        <EntitySearchBox
          label=""
          placeholder="Search doctor…"
          query={doctorSearch.query}
          results={doctorSearch.results}
          loading={doctorSearch.loading}
          onQueryChange={(q) => doctorSearch.search(q)}
          onSelect={(d) => { onChange(d.name || d.doctor_name || ""); doctorSearch.search(""); }}
          renderOption={(d) => <Typography level="body-sm">{d.name || d.doctor_name}</Typography>}
          selectedItems={value ? [{ label: value }] : []}
          onRemove={() => onChange(null)}
        />
      );
    }
    if (WORKER_FIELDS.includes(header)) {
      return (
        <EntitySearchBox
          label=""
          placeholder="Search worker…"
          query={workerSearch.query}
          results={workerSearch.results}
          loading={workerSearch.loading}
          onQueryChange={(q) => workerSearch.search(q)}
          onSelect={(w) => { onChange(w.full_name || w.name || ""); workerSearch.search(""); }}
          renderOption={(w) => <Typography level="body-sm">{w.full_name || w.name}</Typography>}
          selectedItems={value ? [{ label: value }] : []}
          onRemove={() => onChange(null)}
        />
      );
    }
    const lookupCategory = LOOKUP_FIELD_TO_CATEGORY[header];
    if (lookupCategory && lookups) {
      return (
        <SearchableSelect
          options={lookups[lookupCategory] || []}
          value={value}
          onChange={onChange}
          placeholder="Not set"
        />
      );
    }
    if (LONG_TEXT_FIELDS.includes(header)) {
      return <Textarea minRows={3} value={value || ""} onChange={(e) => onChange(e.target.value)} {...rtl} />;
    }
    return <Input size="sm" value={value || ""} onChange={(e) => onChange(e.target.value)} {...rtl} />;
  };

  // Doctor 1/2/3 and Worker 1/2/3 are three separate template columns
  // (Excel has no multi-select cell), but there's no reason the grid has
  // to mirror that -- EntitySearchBox already supports multiple selected
  // items natively. One search box per row, backed by up to 3 underlying
  // fields: picking a name fills the first empty slot, removing a chip
  // shifts the rest down. Still writes back to "Doctor 1"/"Doctor 2"/
  // "Doctor 3" under the hood, so no backend change is needed.
  const renderMultiEntitySearch = (fieldKeys, search, placeholder, extractName) => {
    const currentValues = fieldKeys.map((k) => editValues[k]).filter(Boolean);
    const writeValues = (nextValues) => {
      setEditValues((prev) => {
        const next = { ...prev };
        fieldKeys.forEach((k, i) => { next[k] = nextValues[i] || null; });
        return next;
      });
    };
    return (
      <EntitySearchBox
        label=""
        placeholder={currentValues.length >= fieldKeys.length ? `Max ${fieldKeys.length} reached` : placeholder}
        query={search.query}
        results={search.results}
        loading={search.loading}
        onQueryChange={(q) => search.search(q)}
        onSelect={(item) => {
          const val = extractName(item);
          if (!val || currentValues.includes(val) || currentValues.length >= fieldKeys.length) return;
          writeValues([...currentValues, val]);
          search.search("");
        }}
        renderOption={(item) => <Typography level="body-sm">{extractName(item)}</Typography>}
        selectedItems={currentValues.map((v) => ({ label: v }))}
        onRemove={(idx) => writeValues(currentValues.filter((_, i) => i !== idx))}
      />
    );
  };

  // Domain/Category/Subcategory are template columns, but the backend
  // never reads them -- domain_id/category_id/subcategory_id are always
  // derived from Classification's chain lookup instead. Shown as a single
  // read-only breadcrumb line rather than three separate fields that look
  // broken/empty when nothing's been typed into them directly.
  const renderBreadcrumb = (derived) => {
    const parts = [derived?.domain, derived?.category, derived?.subcategory].filter(Boolean);
    return (
      <Box>
        <Typography level="body-xs" sx={{ mb: 0.5, color: "text.tertiary" }}>Classification Hierarchy</Typography>
        <Typography level="body-sm" sx={{ color: parts.length ? "text.primary" : "text.tertiary", fontStyle: parts.length ? "normal" : "italic" }}>
          {parts.length ? parts.join(" › ") : "Not resolved yet — set Classification above"}
        </Typography>
      </Box>
    );
  };

  // One uniform slot per field: label, control, and (if this field has a
  // validation error) an outline plus the exact reason underneath -- so a
  // reviewer sees *why* a field is wrong without hunting for the row-level
  // chip's tooltip.
  const renderFieldSlot = (header, label, control, errorMessage) => (
    <Box key={header}>
      <Typography level="body-xs" sx={{ mb: 0.5, color: "text.tertiary" }}>{label ?? header}</Typography>
      <Box sx={errorMessage ? { borderRadius: "sm", outline: "2px solid", outlineColor: "danger.400", outlineOffset: "1px" } : undefined}>
        {control}
      </Box>
      {errorMessage && (
        <Typography level="body-xs" sx={{ color: "danger.500", mt: 0.5 }}>{errorMessage}</Typography>
      )}
    </Box>
  );

  const bucketOf = (status) => statusMeta[status]?.bucket || "unknown";
  const bucketCounts = { all: groups.length, ready: 0, need_attention: 0, rejected: 0 };
  groups.forEach((g) => {
    const b = bucketOf(g.status);
    bucketCounts[b] = (bucketCounts[b] || 0) + 1;
  });

  const visibleGroups = groups.filter((g) => {
    if (filterBucket !== "all" && bucketOf(g.status) !== filterBucket) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchesGroup = String(g.group_key).toLowerCase().includes(q);
      const matchesPatient = (g.rows || []).some((r) => (r.fields["Patient Name"] || "").toLowerCase().includes(q));
      if (!matchesGroup && !matchesPatient) return false;
    }
    return true;
  });

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {FILTER_TABS.map((t) => (
            <Button
              key={t.key}
              size="sm"
              variant={filterBucket === t.key ? "solid" : "outlined"}
              color={filterBucket === t.key ? "primary" : "neutral"}
              onClick={() => setFilterBucket(t.key)}
            >
              {t.label} ({bucketCounts[t.key] || 0})
            </Button>
          ))}
        </Box>
        <Input
          size="sm"
          placeholder="Search by group key or patient name…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startDecorator={<SearchIcon fontSize="small" />}
          sx={{ minWidth: 260 }}
        />
      </Box>

      {visibleGroups.length === 0 && (
        <Typography level="body-sm" sx={{ color: "text.tertiary", py: 3, textAlign: "center" }}>
          No incidents match this filter.
        </Typography>
      )}

      {visibleGroups.map((g) => {
        const meta = statusMeta[g.status] || { label: g.status, color: "neutral" };
        const groupLabel = g.group_key === "(No Group Key)" ? "No Group Key" : `Group ${g.group_key}`;
        const canFix = bucketOf(g.status) !== "rejected";
        return (
          <Card
            key={g.group_key}
            variant="outlined"
            sx={{ mb: 1.5, p: 0, overflow: "hidden", borderLeft: "4px solid", borderLeftColor: `${meta.color}.400` }}
          >
            <Box sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", bgcolor: "background.level1" }}>
              <Typography level="title-sm" fontWeight={700}>{groupLabel}</Typography>
              <Chip size="sm" color={meta.color}>{meta.label}</Chip>
              {g.has_flagged_risk && (
                <Chip size="sm" variant="soft" color="danger" startDecorator={<FlagIcon sx={{ fontSize: 14 }} />}>
                  Red flag
                </Chip>
              )}
              {g.is_new_patient && (
                <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                  Disclaimer: this will create a new patient record for "{g.patient_name}" — not an error, just confirming this patient isn't in the system yet.
                </Typography>
              )}
              {!canFix && g.reason && (
                <Typography level="body-xs" sx={{ color: "danger.500" }}>{g.reason}</Typography>
              )}
            </Box>
            {(g.rows || []).map((row) => {
              const isExpanded = expandedRow === row.row_number;
              const patientName = row.fields["Patient Name"] || "Unnamed patient";
              const errorsByField = Object.fromEntries((row.errors || []).map((e) => [e.field, e.message]));
              return (
                <Box key={row.row_number}>
                  <Divider />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, flexWrap: "wrap" }}>
                    <Typography level="body-xs" sx={{ minWidth: 55, color: "text.tertiary" }}>Row {row.row_number}</Typography>
                    <Typography level="body-sm" fontWeight={600} sx={{ minWidth: 140 }} dir="auto" noWrap>
                      {patientName}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", flex: 1 }}>
                      {row.errors.map((e, i) => (
                        <Tooltip key={i} title={e.message} arrow>
                          <Chip size="sm" color="warning" variant="soft">{e.field}</Chip>
                        </Tooltip>
                      ))}
                    </Box>
                    {canFix ? (
                      <Button
                        size="sm"
                        variant="outlined"
                        color="neutral"
                        onClick={() => (isExpanded ? cancelEdit() : startEdit(row))}
                        startDecorator={isExpanded ? <CloseIcon /> : <EditIcon />}
                        endDecorator={!isExpanded ? <ChevronRightIcon /> : undefined}
                      >
                        {isExpanded ? "Hide" : (row.errors.length > 0 ? "Fix Issue" : "Review")}
                      </Button>
                    ) : (
                      <Tooltip title="Already imported in a previous batch — nothing here to fix. Re-upload with a corrected Incident Number (الرقم) if this wasn't intentional." arrow>
                        <Button size="sm" variant="outlined" color="neutral" disabled>
                          No action
                        </Button>
                      </Tooltip>
                    )}
                  </Box>
                  {isExpanded && (
                    <Box sx={{ p: 2, bgcolor: `${meta.color}.50` }}>
                      <Typography level="body-sm" sx={{ mb: 2, color: "text.secondary" }}>
                        Editing <strong>{patientName}</strong> — {groupLabel} — Row {row.row_number}
                      </Typography>
                      {FIELD_SECTIONS.map((section) => (
                        <Box key={section.title} sx={{ mb: 2.5 }}>
                          <Typography level="body-xs" fontWeight={700} sx={{ mb: 1, textTransform: "uppercase", letterSpacing: "0.04em", color: "text.tertiary" }}>
                            {section.title}
                          </Typography>
                          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 1.5 }}>
                            {section.fields.map((header) => {
                              if (header === "__breadcrumb__") {
                                return <Box key={header}>{renderBreadcrumb(row.derived_hierarchy)}</Box>;
                              }
                              if (header === "Doctor 1") {
                                return renderFieldSlot(header, "Doctors", renderMultiEntitySearch(DOCTOR_FIELDS, doctorSearch, "Search doctor…", (d) => d.name || d.doctor_name || ""), errorsByField["Doctor 1"]);
                              }
                              if (header === "Worker 1 (Full Name)") {
                                return renderFieldSlot(header, "Workers", renderMultiEntitySearch(WORKER_FIELDS, workerSearch, "Search worker…", (w) => w.full_name || w.name || ""), errorsByField["Worker 1"]);
                              }
                              return renderFieldSlot(
                                header,
                                header,
                                renderFieldInput(header, editValues[header], (v) => setEditValues((prev) => ({ ...prev, [header]: v }))),
                                errorsByField[header]
                              );
                            })}
                          </Box>
                        </Box>
                      ))}
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Button
                          size="sm"
                          variant="solid"
                          color="success"
                          loading={saving}
                          onClick={() => saveEdit(row.row_number)}
                          startDecorator={<SaveIcon />}
                        >
                          Save Row
                        </Button>
                        <Button size="sm" variant="plain" color="neutral" onClick={cancelEdit}>Cancel</Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Card>
        );
      })}
    </Box>
  );
}
