// src/components/incident/EntitySearchBox.jsx
// Generic autocomplete search box with selected-item chips and an optional
// "add new" row. Reused for patient / doctor / employee search.
//
// The results dropdown is rendered through a portal into document.body and
// positioned with a fixed-position rect computed from the input's own
// getBoundingClientRect(), instead of a plain CSS `position: absolute`
// child. A CSS-relative dropdown's containing block is whatever ancestor
// first sets position/transform/overflow -- inside a deeply nested layout
// (e.g. the import review grid's per-row CSS Grid, itself inside a
// scrollable Card) that ancestor isn't always the input's own wrapper, so
// the dropdown can render clipped or nowhere near the field it belongs to.
// Anchoring via JS sidesteps that entirely.
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Box, FormControl, FormLabel, Input, Card, CircularProgress, Chip, ChipDelete, Typography } from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";

const EntitySearchBox = ({ label, placeholder, query, results, loading, onQueryChange, onSelect, renderOption, selectedItems, onRemove, onAddNew }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    function close(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const showAddNew = Boolean(onAddNew) && !loading && query.trim().length >= 2 && results.length === 0;
  const showDropdown = open && (results.length > 0 || showAddNew);

  useLayoutEffect(() => {
    if (!showDropdown) return;
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
  }, [showDropdown]);

  return (
    <FormControl sx={{ flex: 1 }}>
      <FormLabel>{label}</FormLabel>
      <Box ref={wrapRef}>
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          endDecorator={loading ? <CircularProgress size="sm" /> : null}
        />
      </Box>
      {showDropdown && coords && createPortal(
        <Card
          variant="outlined"
          sx={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            width: coords.width,
            zIndex: 1400,
            maxHeight: 220,
            overflow: "auto",
            p: 0,
            bgcolor: "background.surface",
            boxShadow: "md",
            borderRadius: "sm",
          }}
        >
          {results.map((r, i) => (
            <Box
              key={i}
              sx={{ px: 2, py: 1, cursor: "pointer", "&:hover": { bgcolor: "primary.softBg" } }}
              onMouseDown={() => {
                onSelect(r);
                setOpen(false);
              }}
            >
              {renderOption(r)}
            </Box>
          ))}
          {showAddNew && (
            <Box
              sx={{ px: 2, py: 1, cursor: "pointer", display: "flex", alignItems: "center", gap: 1, "&:hover": { bgcolor: "success.softBg" } }}
              onMouseDown={() => { onAddNew(query.trim()); setOpen(false); }}
            >
              <AddIcon fontSize="small" sx={{ color: "success.600" }} />
              <Typography level="body-sm" sx={{ color: "success.700" }}>
                Add "<strong>{query.trim()}</strong>" as new patient
              </Typography>
            </Box>
          )}
        </Card>,
        document.body
      )}
      {selectedItems && selectedItems.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
          {selectedItems.map((item, i) => (
            <Chip key={i} size="sm" variant="soft" color="primary" endDecorator={
              <ChipDelete onDelete={() => onRemove(i)} />
            }>
              {item.label}
            </Chip>
          ))}
        </Box>
      )}
    </FormControl>
  );
};

export default EntitySearchBox;
