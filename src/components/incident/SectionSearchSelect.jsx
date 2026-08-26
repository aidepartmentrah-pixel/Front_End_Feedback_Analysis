// src/components/incident/SectionSearchSelect.jsx
// Searchable section dropdown (Issuing Unit only).
import React, { useState } from "react";
import { Select, Option, Input } from "@mui/joy";

const SectionSearchSelect = ({ sections, value, onChange, placeholder, error }) => {
  const [q, setQ] = useState("");
  const filtered = sections.filter(s =>
    !q || s.section_name?.toLowerCase().includes(q.toLowerCase()) ||
    s.department_name?.toLowerCase().includes(q.toLowerCase())
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
          placeholder="Search section…"
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
      {filtered.map(s => (
        <Option key={s.section_id} value={s.section_id} sx={{ color: "#000" }}>
          {s.section_name}{s.department_name ? ` — ${s.department_name}` : ""}
        </Option>
      ))}
    </Select>
  );
};

export default SectionSearchSelect;
