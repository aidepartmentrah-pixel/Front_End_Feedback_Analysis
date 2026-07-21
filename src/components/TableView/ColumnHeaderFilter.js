// src/components/TableView/ColumnHeaderFilter.js
// Small header-anchored filter popover: checkbox list + search + Apply/Clear.
// Lives inside a sortable <th>, so every interaction here must stopPropagation
// to avoid also triggering the column's sort click.
//
// The popover is rendered through a portal into document.body and positioned
// with `position: fixed` from the trigger button's real screen coordinates —
// the table wrapper scrolls with `overflow: auto`, which clips any regular
// `position: absolute` dropdown nested inside it, so a portal is required.
import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Box, IconButton, Input, Checkbox, Button } from "@mui/joy";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

const ColumnHeaderFilter = ({ label, options, selected = [], onApply }) => {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(selected);
  const [search, setSearch] = useState("");
  const [coords, setCoords] = useState(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const updateCoords = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setCoords({ top: rect.bottom + 6, left: rect.left });
  }, []);

  useEffect(() => {
    if (open) {
      setPending(selected);
      setSearch("");
      updateCoords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (e) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const handleReposition = () => updateCoords();

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open, updateCoords]);

  const isActive = selected.length > 0;
  const filteredOptions = options.filter(
    (o) => !search || o.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => {
    setPending((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{ display: "inline-flex", alignItems: "center", textTransform: "none" }}
    >
      <IconButton
        ref={buttonRef}
        size="sm"
        variant={isActive ? "solid" : "plain"}
        color={isActive ? "primary" : "neutral"}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        sx={{ minHeight: 0, minWidth: 0, p: 0.4 }}
      >
        <FilterAltIcon sx={{ fontSize: 15 }} />
      </IconButton>
      {isActive && selected.length > 1 && (
        <Box component="span" sx={{ fontSize: "0.65rem", ml: 0.25, fontWeight: 700, color: "primary.plainColor" }}>
          ({selected.length})
        </Box>
      )}
      {open && coords &&
        createPortal(
          <Box
            ref={panelRef}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            sx={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              zIndex: 3000,
              width: 230,
              bgcolor: "background.surface",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
              p: 1.25,
              fontWeight: 400,
              textTransform: "none",
            }}
          >
            <Input
              size="sm"
              placeholder={`Search ${label}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              sx={{ mb: 1 }}
            />
            <Box
              sx={{
                maxHeight: 220,
                overflowY: "auto",
                overflowX: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                pr: 0.5,
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e1 transparent",
                "&::-webkit-scrollbar": { width: "6px", height: 0 },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": { backgroundColor: "#cbd5e1", borderRadius: "999px" },
              }}
            >
              {filteredOptions.length === 0 ? (
                <Box sx={{ fontSize: "0.75rem", color: "#9ca3af", py: 1, textAlign: "center" }}>No options</Box>
              ) : (
                filteredOptions.map((o) => (
                  <Checkbox
                    key={o.id}
                    size="sm"
                    label={o.label}
                    checked={pending.includes(o.id)}
                    onChange={() => toggle(o.id)}
                    sx={{ "& .MuiCheckbox-label, & span": { fontWeight: 400 } }}
                  />
                ))
              )}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1.25, gap: 1 }}>
              <Button
                size="sm"
                variant="plain"
                color="neutral"
                onClick={() => {
                  setPending([]);
                  onApply([]);
                  setOpen(false);
                }}
              >
                Clear
              </Button>
              <Button
                size="sm"
                variant="solid"
                color="primary"
                onClick={() => {
                  onApply(pending);
                  setOpen(false);
                }}
              >
                Apply
              </Button>
            </Box>
          </Box>,
          document.body
        )}
    </Box>
  );
};

export default ColumnHeaderFilter;
