// src/components/doctorHistory/SearchDoctor.js
// Phase D — Doctor search switched from mock to V2 API
import React, { useState } from "react";
import { Box, Typography, Autocomplete, AutocompleteOption, Button, CircularProgress } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import { searchDoctorsV2 } from "../../api/personApiV2";

const SearchDoctor = ({ onDoctorSelect }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Handle async search on input change
  const handleInputChange = async (event, newInputValue) => {
    setInputValue(newInputValue);

    if (newInputValue.length < 2) {
      setOptions([]);
      return;
    }

    try {
      setLoading(true);
      const response = await searchDoctorsV2(newInputValue, 20);
      const doctors = response.items || response.doctors || [];
      setOptions(Array.isArray(doctors) ? doctors : []);
    } catch (error) {
      console.error("Doctor search error:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (selectedDoctor) {
      onDoctorSelect(selectedDoctor);
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
        🔍 Search Doctor
      </Typography>
      
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
        <Box sx={{ flex: 1 }}>
          <Typography level="body-sm" sx={{ mb: 1, fontWeight: 600 }}>
            Doctor Name
          </Typography>
          <Autocomplete
            placeholder="Search by name (English/Arabic)..."
            options={options}
            value={selectedDoctor}
            inputValue={inputValue}
            onChange={(e, newValue) => setSelectedDoctor(newValue)}
            onInputChange={handleInputChange}
            loading={loading}
            getOptionLabel={(option) => {
              const name = option.full_name || option.nameEn || option.name || "Unknown";
              const id = option.doctor_id || option.employeeId || option.id || "";
              return `${name} (${id})`;
            }}
            renderOption={(props, option) => (
              <AutocompleteOption {...props}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
                  <PersonIcon sx={{ color: "#667eea" }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                      {option.full_name || option.nameEn || option.name}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "#999" }}>
                      {option.specialty} • {option.department}
                    </Typography>
                  </Box>
                  <Typography level="body-xs" sx={{ color: "#667eea", fontWeight: 600 }}>
                    {option.doctor_id || option.employeeId || option.id}
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
          disabled={!selectedDoctor}
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

export default SearchDoctor;
