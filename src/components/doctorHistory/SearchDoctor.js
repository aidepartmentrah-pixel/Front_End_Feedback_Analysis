// src/components/doctorHistory/SearchDoctor.js
import React, { useState } from "react";
import { Box, Typography, Autocomplete, AutocompleteOption, Button } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";

const SearchDoctor = ({ onDoctorSelect, doctors }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

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
            Doctor Name or Employee ID
          </Typography>
          <Autocomplete
            placeholder="Search by name (English/Arabic) or ID..."
            options={doctors}
            value={selectedDoctor}
            onChange={(e, newValue) => setSelectedDoctor(newValue)}
            getOptionLabel={(option) => `${option.nameEn} | ${option.nameAr} (${option.employeeId})`}
            renderOption={(props, option) => (
              <AutocompleteOption {...props}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
                  <PersonIcon sx={{ color: "#667eea" }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                      {option.nameEn}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "#999", dir: "rtl" }}>
                      {option.nameAr}
                    </Typography>
                  </Box>
                  <Typography level="body-xs" sx={{ color: "#667eea", fontWeight: 600 }}>
                    {option.employeeId}
                  </Typography>
                </Box>
              </AutocompleteOption>
            )}
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
