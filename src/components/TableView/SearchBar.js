// src/components/TableView/SearchBar.js
import React, { useState, useEffect } from "react";
import { Input } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";

const SearchBar = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);

  // Debounce: Only call onChange after 500ms of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  // Sync with external value changes
  useEffect(() => {
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
