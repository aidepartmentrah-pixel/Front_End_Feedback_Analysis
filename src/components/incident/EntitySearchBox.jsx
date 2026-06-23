// src/components/incident/EntitySearchBox.jsx
// Generic autocomplete search box with selected-item chips and an optional
// "add new" row. Reused for patient / doctor / employee search.
import React, { useState, useEffect, useRef } from "react";
import { Box, FormControl, FormLabel, Input, Card, CircularProgress, Chip, Typography } from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";

const EntitySearchBox = ({ label, placeholder, query, results, loading, onQueryChange, onSelect, renderOption, selectedItems, onRemove, onAddNew }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function close(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const showAddNew = Boolean(onAddNew) && !loading && query.trim().length >= 2 && results.length === 0;

  return (
    <FormControl sx={{ flex: 1 }}>
      <FormLabel>{label}</FormLabel>
      <Box ref={wrapRef} sx={{ position: "relative" }}>
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
        {open && results.length > 0 && (
          <Card
            variant="outlined"
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 999,
              maxHeight: 220,
              overflow: "auto",
              mt: 0.5,
              p: 0,
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
          </Card>
        )}
        {open && showAddNew && (
          <Card
            variant="outlined"
            sx={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 999, mt: 0.5, p: 0 }}
          >
            <Box
              sx={{ px: 2, py: 1, cursor: "pointer", display: "flex", alignItems: "center", gap: 1, "&:hover": { bgcolor: "success.softBg" } }}
              onMouseDown={() => { onAddNew(query.trim()); setOpen(false); }}
            >
              <AddIcon fontSize="small" sx={{ color: "success.600" }} />
              <Typography level="body-sm" sx={{ color: "success.700" }}>
                Add "<strong>{query.trim()}</strong>" as new patient
              </Typography>
            </Box>
          </Card>
        )}
      </Box>
      {selectedItems && selectedItems.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
          {selectedItems.map((item, i) => (
            <Chip key={i} size="sm" variant="soft" color="primary" endDecorator={
              <Box component="span" sx={{ cursor: "pointer", ml: 0.5, lineHeight: 1 }} onClick={() => onRemove(i)}>×</Box>
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
