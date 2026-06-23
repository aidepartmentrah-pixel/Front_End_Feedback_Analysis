// src/components/TableView/SearchBar.js
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";

const SearchBar = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);
  const isExternalUpdate = useRef(false);
  const timerRef = useRef(null);

  // Debounce: Only call onChange after 500ms of inactivity
  useEffect(() => {
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
      return;
    }

    timerRef.current = setTimeout(() => {
      onChange(localValue.trim());
    }, 500);

    return () => clearTimeout(timerRef.current);
  }, [localValue, onChange]);

  // Sync with external value changes (without triggering onChange)
  useEffect(() => {
    isExternalUpdate.current = true;
    setLocalValue(value);
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      clearTimeout(timerRef.current);
      onChange(localValue.trim());
    }
  };

  return (
    <Input
      placeholder="Search by case number, incident number, patient number..."
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onKeyDown={handleKeyDown}
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
