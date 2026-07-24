// src/components/workerHistory/SearchWorker.jsx
// Phase D — Worker search V2 component

import React, { useState } from "react";
import { Box, Typography, Autocomplete, AutocompleteOption, CircularProgress } from "@mui/joy";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import { searchWorkersV2 } from "../../api/personApiV2";
import theme from "../../theme";

const SearchWorker = ({ onWorkerSelect }) => {
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Handle async search on input change
  const handleInputChange = async (event, newInputValue) => {
    setInputValue(newInputValue);

    // Require at least 2 characters
    if (newInputValue.length < 2) {
      setOptions([]);
      return;
    }

    try {
      setLoading(true);
      const response = await searchWorkersV2(newInputValue, 20);
      
      // Map V2 response to options
      const workers = response.items || response.workers || [];
      setOptions(Array.isArray(workers) ? workers : []);
    } catch (error) {
      console.error("Worker search error:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        mb: 2.5,
        p: 2.5,
        borderRadius: theme.radius.lg,
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      <Typography level="h5" sx={{ mb: 2, fontWeight: 700, color: theme.colors.primary, display: "flex", alignItems: "center", gap: 1 }}>
        <SearchIcon fontSize="small" /> Search Worker
      </Typography>
      
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
        <Box sx={{ flex: 1 }}>
          <Typography level="body-sm" sx={{ mb: 1, fontWeight: 600 }}>
            Worker Name
          </Typography>
          <Autocomplete
            placeholder="Search worker by name..."
            options={options}
            value={selectedWorker}
            inputValue={inputValue}
            onChange={(e, newValue) => {
              setSelectedWorker(newValue);
              if (newValue) onWorkerSelect(newValue);
            }}
            onInputChange={handleInputChange}
            loading={loading}
            getOptionLabel={(option) => {
              const name = option.full_name || option.name || "Unknown";
              const id = option.employee_id || option.id || "";
              const jobTitle = option.job_title ? ` — ${option.job_title}` : "";
              return `${name}${jobTitle} (${id})`;
            }}
            renderOption={(props, option) => (
              <AutocompleteOption {...props}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
                  <PersonIcon sx={{ color: theme.colors.primary }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                      {option.full_name || option.name}
                      {option.job_title && (
                        <Typography component="span" level="body-xs" sx={{ ml: 1, color: "#999" }}>
                          — {option.job_title}
                        </Typography>
                      )}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "#999" }}>
                      Department ID: {option.department_id || "N/A"}
                      {option.section_id && ` • Section ID: ${option.section_id}`}
                    </Typography>
                  </Box>
                  <Typography level="body-xs" sx={{ color: theme.colors.primary, fontWeight: 600 }}>
                    {option.employee_id || option.id}
                  </Typography>
                </Box>
              </AutocompleteOption>
            )}
            endDecorator={loading ? <CircularProgress size="sm" /> : null}
            sx={{ width: "100%" }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default SearchWorker;
