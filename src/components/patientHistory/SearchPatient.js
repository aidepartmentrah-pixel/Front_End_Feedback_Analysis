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
} from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";

// Mock patient database
const mockPatients = [
  {
    id: "P12345",
    name: "Ahmed Mohammed Ali",
    age: 45,
    gender: "Male",
    phone: "+966 50 123 4567",
    totalIncidents: 8,
  },
  {
    id: "P12346",
    name: "Fatima Hassan",
    age: 32,
    gender: "Female",
    phone: "+966 50 234 5678",
    totalIncidents: 3,
  },
  {
    id: "P12347",
    name: "Mohammed Abdullah",
    age: 58,
    gender: "Male",
    phone: "+966 50 345 6789",
    totalIncidents: 12,
  },
  {
    id: "P12348",
    name: "Sarah Ali",
    age: 27,
    gender: "Female",
    phone: "+966 50 456 7890",
    totalIncidents: 5,
  },
];

const SearchPatient = ({ onSelectPatient }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    // Simulate API search
    // const results = await api.searchPatients(searchQuery);

    const results = mockPatients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(results);
  };

  // Handle patient selection
  const handleSelect = (patient) => {
    setSelectedPatient(patient);
    onSelectPatient(patient);
    setSearchResults([]);
    setSearchQuery("");
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
          placeholder="Enter patient name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          startDecorator={<SearchIcon />}
          sx={{ flex: 1 }}
        />
        <Button
          onClick={handleSearch}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            fontWeight: 700,
          }}
        >
          Search
        </Button>
      </Box>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Sheet
          sx={{
            borderRadius: "8px",
            border: "1px solid rgba(102, 126, 234, 0.2)",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          <List>
            {searchResults.map((patient) => (
              <ListItem key={patient.id}>
                <ListItemButton onClick={() => handleSelect(patient)}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                    <PersonIcon sx={{ color: "#667eea" }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography level="body-md" sx={{ fontWeight: 600 }}>
                        {patient.name}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: "#666" }}>
                        ID: {patient.id} • {patient.age} years • {patient.gender}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: "4px",
                        background: "#667eea",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      {patient.totalIncidents} incidents
                    </Box>
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Sheet>
      )}

      {/* Selected Patient */}
      {selectedPatient && (
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
            ✓ Selected: {selectedPatient.name} (ID: {selectedPatient.id})
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default SearchPatient;
