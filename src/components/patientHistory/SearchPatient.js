// src/components/patientHistory/SearchPatient.js
import React, { useState } from "react";
import {
  Box,
  Card,
  Input,
  Button,
  Typography,
  List,
  ListItem,
  ListItemButton,
  Sheet,
  CircularProgress,
} from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import { searchPatients } from "../../api/patientHistory";

const SearchPatient = ({ onSelectPatient }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle search with API
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Call API with query
      const data = await searchPatients(searchQuery, { limit: 50 });
      
      // Handle response format
      const patients = data.patients || data || [];
      setSearchResults(Array.isArray(patients) ? patients : []);
      
      if (patients.length === 0) {
        setError("No patients found matching your search");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Failed to search patients");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle patient selection
  const handleSelect = (patient) => {
    setSelectedPatient(patient);
    onSelectPatient(patient);
    setSearchResults([]);
    setSearchQuery("");
    setError(null);
  };

  return (
    <Card
      sx={{
        p: 3,
        background: "linear-gradient(135deg, #f5f7ff 0%, #fff 100%)",
        border: "2px solid rgba(102, 126, 234, 0.2)",
      }}
    >
      <Typography level="h4" sx={{ mb: 2, color: "#667eea", fontWeight: 700 }}>
        🔍 Search Patient
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Input
          placeholder="Enter patient name, MRN, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          startDecorator={<SearchIcon />}
          sx={{ flex: 1 }}
          disabled={loading}
        />
        <Button
          onClick={handleSearch}
          loading={loading}
          disabled={loading || !searchQuery.trim()}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            fontWeight: 700,
          }}
        >
          Search
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Box
          sx={{
            p: 2,
            mb: 2,
            borderRadius: "8px",
            background: "#ffebee",
            border: "1px solid #ef5350",
            color: "#c62828",
            fontSize: "14px",
          }}
        >
          {error}
        </Box>
      )}

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress size="sm" />
        </Box>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && !loading && (
        <Sheet
          sx={{
            borderRadius: "8px",
            border: "1px solid rgba(102, 126, 234, 0.2)",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          <List>
            {searchResults.map((patient) => (
              <ListItem key={patient.patient_id || patient.id}>
                <ListItemButton onClick={() => handleSelect(patient)}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                    <PersonIcon sx={{ color: "#667eea" }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography level="body-md" sx={{ fontWeight: 600 }}>
                        {patient.full_name || patient.name}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: "#666" }}>
                        MRN: {patient.mrn || "N/A"} • Age: {patient.age} • {patient.gender}
                      </Typography>
                      {patient.phone && (
                        <Typography level="body-xs" sx={{ color: "#999" }}>
                          {patient.phone}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Sheet>
      )}

      {/* Selected Patient */}
      {selectedPatient && !loading && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: "8px",
            background: "rgba(76, 175, 80, 0.1)",
            border: "1px solid #4caf50",
          }}
        >
          <Typography level="body-sm" sx={{ color: "#2d5016", fontWeight: 600 }}>
            ✓ Selected: {selectedPatient.full_name || selectedPatient.name} 
            {selectedPatient.mrn && ` (MRN: ${selectedPatient.mrn})`}
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default SearchPatient;
