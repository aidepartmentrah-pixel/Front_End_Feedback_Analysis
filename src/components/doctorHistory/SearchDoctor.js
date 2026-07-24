// src/components/doctorHistory/SearchDoctor.js
// Phase D — Doctor search switched from mock to V2 API
import React, { useState } from "react";
import { Box, Typography, Autocomplete, AutocompleteOption, CircularProgress } from "@mui/joy";
import PersonIcon from "@mui/icons-material/Person";
import { searchDoctorsV2 } from "../../api/personApiV2";
import theme from "../../theme";

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

  return (
    <Box
      sx={{
        mb: 3,
        p: 3,
        borderRadius: theme.radius.lg,
        background: theme.gradients.primarySubtle,
        border: `1px solid ${theme.colors.primaryLight}`,
      }}
    >
      <Typography level="h5" sx={{ mb: 2, fontWeight: 700, color: theme.colors.primary }}>
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
            onChange={(e, newValue) => {
              setSelectedDoctor(newValue);
              if (newValue) onDoctorSelect(newValue);
            }}
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
                  <PersonIcon sx={{ color: theme.colors.primary }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                      {option.full_name || option.nameEn || option.name}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "#999" }}>
                      {option.specialty} • {option.department}
                    </Typography>
                  </Box>
                  <Typography level="body-xs" sx={{ color: theme.colors.primary, fontWeight: 600 }}>
                    {option.doctor_id || option.employeeId || option.id}
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

export default SearchDoctor;
