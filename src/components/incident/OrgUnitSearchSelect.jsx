// src/components/incident/OrgUnitSearchSelect.jsx
// Searchable org-unit dropdown (Target Unit — Section, Department, Administration).
import React, { useState } from "react";
import { Select, Option, Input, Chip } from "@mui/joy";

const ORG_TYPE_CHIP_COLOR = { 323: "warning", 325: "primary", 324: "success" };

const OrgUnitSearchSelect = ({ units, value, onChange, placeholder, error }) => {
  const [q, setQ] = useState("");
  const filtered = units.filter(u =>
    !q ||
    u.name?.toLowerCase().includes(q.toLowerCase()) ||
    u.type_label?.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <Select
      placeholder={placeholder}
      value={value ?? null}
      onChange={(_, v) => onChange(v)}
      color={error ? "danger" : "neutral"}
      slotProps={{ listbox: { sx: { zIndex: 1300, bgcolor: "#fff" } } }}
    >
      <Option value={null} sx={{ position: "sticky", top: 0, bgcolor: "#fff", zIndex: 2, p: 0, borderBottom: "1px solid #eee" }}>
        <Input
          autoFocus
          size="sm"
          placeholder="Search units…"
          value={q}
          onChange={e => { e.stopPropagation(); setQ(e.target.value); }}
          onClick={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
          sx={{ width: "100%", border: "none", borderRadius: 0, "--Input-focusedHighlight": "transparent" }}
        />
      </Option>
      {filtered.length === 0 && (
        <Option value={null} disabled sx={{ color: "#999" }}>No results</Option>
      )}
      {filtered.map(u => (
        <Option key={u.id} value={u.id} sx={{ color: "#000", display: "flex", alignItems: "center", gap: 0.75 }}>
          <Chip
            size="sm"
            variant="soft"
            color={ORG_TYPE_CHIP_COLOR[u.type] || "neutral"}
            sx={{ fontSize: "0.65rem", flexShrink: 0 }}
          >
            {u.type_label}
          </Chip>
          {u.name}
        </Option>
      ))}
    </Select>
  );
};

export default OrgUnitSearchSelect;
