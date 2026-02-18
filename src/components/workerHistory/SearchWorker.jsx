// src/components/workerHistory/SearchWorker.jsx
// Phase D — Worker search V2 component

import React, { useState } from "react";
import { Box, Typography, Autocomplete, AutocompleteOption, Button, CircularProgress } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import { searchWorkersV2 } from "../../api/personApiV2";

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

  const handleSearch = () => {
    if (selectedWorker) {
      onWorkerSelect(selectedWorker);
    }
  };

  return (
    <Box
      sx={{
        mb: 3,
        p: 3,
        borderRadius: "8px",
        background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
        border: "1px solid rgba(102, 126, 234, 0.3)",
      }}
    >
      <Typography level="h5" sx={{ mb: 2, fontWeight: 700, color: "#667eea" }}>
        🔍 Search Worker
      </Typography>
      
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
        <Box sx={{ flex: 1 }}>
          <Typography level="body-sm" sx={{ mb: 1, fontWeight: 600 }}>
            Worker Name or Employee ID
          </Typography>
          <Autocomplete
            placeholder="Search worker by name..."
            options={options}
            value={selectedWorker}
            inputValue={inputValue}
            onChange={(e, newValue) => setSelectedWorker(newValue)}
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
                  <PersonIcon sx={{ color: "#667eea" }} />
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
                  <Typography level="body-xs" sx={{ color: "#667eea", fontWeight: 600 }}>
                    {option.employee_id || option.id}
                  </Typography>
                </Box>
              </AutocompleteOption>
            )}
            endDecorator={loading ? <CircularProgress size="sm" /> : null}
            sx={{ width: "100%" }}
          />
        </Box>
        
        <Button
          startDecorator={<SearchIcon />}
          onClick={handleSearch}
          disabled={!selectedWorker}
          sx={{
            px: 3,
            py: 1.25,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            fontWeight: 700,
            "&:disabled": {
              background: "#ccc",
            },
          }}
        >
          Search
        </Button>
      </Box>
    </Box>
  );
};

export default SearchWorker;
