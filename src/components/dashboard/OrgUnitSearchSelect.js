// src/components/dashboard/OrgUnitSearchSelect.js
// Generic searchable org-unit dropdown - lets a user jump straight to a
// department or section by typing, instead of drilling down the hierarchy.
// Generalizes the pattern already used by SectionSearchSelect.jsx.
import React, { useState } from "react";
import { Select, Option, Input } from "@mui/joy";

const OrgUnitSearchSelect = ({ items = [], value, onChange, placeholder, subLabelKey, disabled }) => {
  const [q, setQ] = useState("");

  const labelFor = (item) => `${item.nameAr}${subLabelKey && item[subLabelKey] ? ` — ${item[subLabelKey]}` : ""}`;

  const filtered = items.filter((item) => {
    if (!q) return true;
    const needle = q.toLowerCase();
    return (
      item.nameAr?.toLowerCase().includes(needle) ||
      item.nameEn?.toLowerCase().includes(needle) ||
      (subLabelKey && item[subLabelKey]?.toLowerCase().includes(needle))
    );
  });

  return (
    <Select
      placeholder={placeholder}
      value={value || ""}
      onChange={(_, v) => onChange(v)}
      disabled={disabled}
      size="lg"
      sx={{ minWidth: 0, width: "100%" }}
      slotProps={{
        listbox: { sx: { zIndex: 1300, maxHeight: 320 } },
        button: { sx: { minWidth: 0 } },
      }}
      renderValue={(selected) => {
        const item = items.find((i) => i.id === selected?.value);
        if (!item) return null;
        const label = labelFor(item);
        return (
          <span
            title={label}
            style={{ display: "block", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {label}
          </span>
        );
      }}
    >
      <Option value="" sx={{ position: "sticky", top: 0, bgcolor: "background.surface", zIndex: 2, p: 0, borderBottom: "1px solid", borderColor: "divider" }}>
        <Input
          autoFocus
          size="sm"
          placeholder="بحث..."
          value={q}
          onChange={(e) => { e.stopPropagation(); setQ(e.target.value); }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          sx={{ width: "100%", border: "none", borderRadius: 0, "--Input-focusedHighlight": "transparent" }}
        />
      </Option>
      {filtered.length === 0 && (
        <Option value="" disabled sx={{ color: "neutral.500" }}>No results</Option>
      )}
      {filtered.map((item) => (
        <Option key={item.id} value={item.id}>
          {labelFor(item)}
        </Option>
      ))}
    </Select>
  );
};

export default OrgUnitSearchSelect;
