// src/components/patientHistory/SearchPatient.js
// Phase D — Patient search switched to V2 API wrapper with Autocomplete
// Phase R-P — Normalized to full_name, patient_id, mrn (removed fallback chaos)
import React, { useState } from "react";
import { Box, Typography, Autocomplete, AutocompleteOption, Button, CircularProgress } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import { searchPatientsV2 } from "../../api/personApiV2";

const SearchPatient = ({ onSelectPatient }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
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
      const response = await searchPatientsV2(newInputValue, 20);
      
      // V2 API returns normalized { patients: [...] }
      const patients = response.patients || [];
      setOptions(Array.isArray(patients) ? patients : []);
    } catch (error) {
      console.error("Patient search error:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (selectedPatient) {
      onSelectPatient(selectedPatient);
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
        🔍 Search Patient
      </Typography>
      
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
        <Box sx={{ flex: 1 }}>
          <Typography level="body-sm" sx={{ mb: 1, fontWeight: 600 }}>
            Patient Name
          </Typography>
          <Autocomplete
            placeholder="Search by name (English/Arabic)..."
            options={options}
            value={selectedPatient}
            inputValue={inputValue}
            onChange={(e, newValue) => setSelectedPatient(newValue)}
            onInputChange={handleInputChange}
            loading={loading}
            getOptionLabel={(option) => {
              // Backend now normalizes to full_name and mrn
              const name = option.full_name || "Unknown";
              const mrn = option.mrn || "N/A";
              return `${name} (${mrn})`;
            }}
            renderOption={(props, option) => (
              <AutocompleteOption {...props}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
                  <PersonIcon sx={{ color: "#667eea" }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                      {option.full_name}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "#999" }}>
                      MRN: {option.mrn || "N/A"} • Age: {option.age} • {option.gender}
                      {option.phone && ` • ${option.phone}`}
                    </Typography>
                  </Box>
                  <Typography level="body-xs" sx={{ color: "#667eea", fontWeight: 600 }}>
                    {option.patient_id}
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
          disabled={!selectedPatient}
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

export default SearchPatient;
