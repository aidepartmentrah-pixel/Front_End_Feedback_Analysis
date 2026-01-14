// src/components/TableView/SearchBar.js
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";

const SearchBar = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);
  const isExternalUpdate = useRef(false);

  // Debounce: Only call onChange after 500ms of inactivity
  useEffect(() => {
    // Don't trigger onChange if this update came from external prop sync
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
      return;
    }

    const timer = setTimeout(() => {
      onChange(localValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  // Sync with external value changes (without triggering onChange)
  useEffect(() => {
    isExternalUpdate.current = true;
    setLocalValue(value);
  }, [value]);

  return (
    <Input
      placeholder="Search by complaint number, patient name, text..."
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      startDecorator={<SearchIcon />}
      size="lg"
      sx={{
        "--Input-focusedThickness": "2px",
        "--Input-focusedHighlight": "rgba(102, 126, 234, 0.25)",
      }}
    />
  );
};

export default SearchBar;
