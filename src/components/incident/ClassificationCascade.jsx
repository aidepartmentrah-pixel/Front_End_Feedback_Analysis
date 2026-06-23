// src/components/incident/ClassificationCascade.jsx
// Domain → Category → Subcategory → Classification cascading selects, within a Case tab.
import React from "react";
import { Box, FormControl, FormLabel, Select, Option } from "@mui/joy";
import { fetchCategories, fetchSubcategories, fetchClassifications } from "../../api/insertRecord";

const ClassificationCascade = ({ caseData, onChange, refData, validationErrors = {}, disabled = false }) => {
  const { _categories, _subcategories, _classifications } = caseData;

  async function handleDomainChange(val) {
    onChange({ domain_id: val, category_id: null, subcategory_id: null, classification_id: null, _categories: [], _subcategories: [], _classifications: [] });
    if (!val) return;
    try {
      const cats = await fetchCategories(val);
      onChange({ domain_id: val, category_id: null, subcategory_id: null, classification_id: null, _categories: Array.isArray(cats) ? cats : [], _subcategories: [], _classifications: [] });
    } catch { /* ignore */ }
  }

  async function handleCategoryChange(val) {
    onChange({ category_id: val, subcategory_id: null, classification_id: null, _subcategories: [], _classifications: [] });
    if (!val) return;
    try {
      const subs = await fetchSubcategories(val);
      onChange({ category_id: val, subcategory_id: null, classification_id: null, _subcategories: Array.isArray(subs) ? subs : [], _classifications: [] });
    } catch { /* ignore */ }
  }

  async function handleSubcatChange(val) {
    onChange({ subcategory_id: val, classification_id: null, _classifications: [] });
    if (!val) return;
    try {
      const cls = await fetchClassifications(val);
      onChange({ subcategory_id: val, classification_id: null, _classifications: Array.isArray(cls) ? cls : [] });
    } catch { /* ignore */ }
  }

  // Helper: resolve display name from objects that may use name / name_en / label
  const label_of = (i) => i.name || i.name_en || i.name_ar || i.label || String(i.id);

  const sel = (items, value, label, key, errKey) => (
    <FormControl required sx={{ flex: 1, minWidth: 160 }}>
      <FormLabel sx={{ color: validationErrors[errKey] ? "danger.500" : undefined }}>{label}</FormLabel>
      <Select
        placeholder={`Select ${label}`}
        value={value ?? null}
        onChange={(_, v) => key(v)}
        color={validationErrors[errKey] ? "danger" : "neutral"}
        disabled={disabled}
        slotProps={{ listbox: { sx: { zIndex: 1300, bgcolor: "#fff" } } }}
      >
        {(items || []).map((i) => (
          <Option key={i.id} value={i.id} sx={{ color: "#000" }}>{label_of(i)}</Option>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
      {sel(refData.domains, caseData.domain_id, "Domain", handleDomainChange, "domain_id")}
      {sel(_categories, caseData.category_id, "Category", handleCategoryChange, "category_id")}
      {sel(_subcategories, caseData.subcategory_id, "Subcategory", handleSubcatChange, "subcategory_id")}
      {sel(_classifications, caseData.classification_id, "Classification", (v) => onChange({ classification_id: v }), "classification_id")}
    </Box>
  );
};

export default ClassificationCascade;
