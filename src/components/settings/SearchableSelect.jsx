// src/components/settings/SearchableSelect.jsx
// Searchable dropdown for a plain list of strings (Classification, Severity,
// Building, etc. -- whatever GET /api/import/lookups returns). Same
// open-state + document-mousedown-to-close pattern as EntitySearchBox.jsx,
// and same portal + getBoundingClientRect anchoring for the dropdown itself
// -- see the comment at the top of that file for why a plain CSS
// `position: absolute` child doesn't reliably land under the field once
// it's nested inside the review grid's per-row layout.
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Box, Input, Card, IconButton } from "@mui/joy";
import ClearIcon from "@mui/icons-material/Clear";

const SearchableSelect = ({ options, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState(null);
  const wrapRef = useRef(null);
  const list = options || [];

  useEffect(() => {
    function close(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    function updatePosition() {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  const filtered = query ? list.filter((o) => o.toLowerCase().includes(query.toLowerCase())) : list;

  return (
    <Box ref={wrapRef}>
      <Input
        size="sm"
        placeholder={placeholder || "Select…"}
        value={open ? query : value || ""}
        onFocus={() => { setQuery(""); setOpen(true); }}
        onChange={(e) => setQuery(e.target.value)}
        endDecorator={
          value ? (
            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              onMouseDown={(e) => { e.stopPropagation(); onChange(null); setQuery(""); }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          ) : null
        }
      />
      {open && coords && createPortal(
        <Card
          variant="outlined"
          sx={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            width: coords.width,
            zIndex: 1400,
            maxHeight: 240,
            overflow: "auto",
            p: 0,
            bgcolor: "background.surface",
            boxShadow: "md",
            borderRadius: "sm",
          }}
        >
          {filtered.length === 0 && (
            <Box sx={{ px: 2, py: 1, color: "text.tertiary" }}>No matches</Box>
          )}
          {filtered.map((opt) => (
            <Box
              key={opt}
              sx={{ px: 2, py: 1, cursor: "pointer", "&:hover": { bgcolor: "primary.softBg" } }}
              onMouseDown={() => { onChange(opt); setQuery(""); setOpen(false); }}
            >
              {opt}
            </Box>
          ))}
        </Card>,
        document.body
      )}
    </Box>
  );
};

export default SearchableSelect;
