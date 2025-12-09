// src/components/edit/SearchRecord.js
import React, { useState, useMemo } from "react";
import { Box, Card, Typography, Input, FormControl, FormLabel, Chip, Grid } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";

const SearchRecord = ({ records, onSelectRecord, selectedRecordId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Filter records based on search query
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return records.filter(
      (record) =>
        record.record_id.toLowerCase().includes(query) ||
        record.patient_full_name.toLowerCase().includes(query) ||
        record.issuing_department.toLowerCase().includes(query)
    );
  }, [searchQuery, records]);

  const handleSelectRecord = (record) => {
    onSelectRecord(record);
    setSearchQuery("");
    setShowResults(false);
  };

  return (
    <Card
      sx={{
        mb: 3,
        p: 3,
        background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
        border: "1px solid rgba(102, 126, 234, 0.1)",
        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.08)",
      }}
    >
      <Typography level="h3" sx={{ color: "#1a1e3f", fontWeight: 700, mb: 2 }}>
        🔍 Search & Select Record
      </Typography>

      <FormControl fullWidth>
        <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
          Search by Record ID, Patient Name, or Department
        </FormLabel>
        <Input
          placeholder="Type to search..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          startDecorator={<SearchIcon sx={{ fontSize: "20px" }} />}
          slotProps={{
            input: {
              style: {
                borderRadius: "8px",
                fontSize: "14px",
              },
            },
          }}
        />
      </FormControl>

      {/* Search Results Dropdown */}
      {showResults && searchQuery.trim() && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: "8px",
            background: "white",
            border: "1px solid rgba(102, 126, 234, 0.2)",
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          {filteredRecords.length > 0 ? (
            <Box>
              <Typography level="body-xs" sx={{ color: "#667eea", fontWeight: 600, mb: 1 }}>
                Found {filteredRecords.length} result(s)
              </Typography>
              {filteredRecords.map((record) => (
                <Box
                  key={record.record_id}
                  onClick={() => handleSelectRecord(record)}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    borderRadius: "6px",
                    background: "rgba(102, 126, 234, 0.05)",
                    border: "1px solid rgba(102, 126, 234, 0.1)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "rgba(102, 126, 234, 0.15)",
                      border: "1px solid rgba(102, 126, 234, 0.3)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography level="body-sm" sx={{ fontWeight: 600, color: "#1a1e3f" }}>
                        {record.record_id}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: "#667eea" }}>
                        {record.patient_full_name} • {record.issuing_department}
                      </Typography>
                    </Box>
                    <Chip
                      size="sm"
                      variant="soft"
                      label={record.status}
                      sx={{
                        background:
                          record.status?.toLowerCase() === "closed"
                            ? "rgba(46, 213, 115, 0.1)"
                            : "rgba(255, 165, 2, 0.1)",
                        color:
                          record.status?.toLowerCase() === "closed"
                            ? "#2ed573"
                            : "#ffa502",
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography level="body-sm" sx={{ color: "#999", textAlign: "center" }}>
              No records found. Try a different search.
            </Typography>
          )}
        </Box>
      )}

      {/* Selected Record Display */}
      {selectedRecordId && (
        <Box sx={{ mt: 2, p: 2, borderRadius: "8px", background: "rgba(46, 213, 115, 0.1)", border: "1px solid #2ed573" }}>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6} md={3}>
              <Box>
                <Typography level="body-xs" sx={{ color: "#2d5016", fontWeight: 600 }}>
                  Record ID
                </Typography>
                <Typography level="body-sm" sx={{ color: "#1a1e3f", fontWeight: 700 }}>
                  {selectedRecordId}
                </Typography>
              </Box>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <Box>
                <Typography level="body-xs" sx={{ color: "#2d5016", fontWeight: 600 }}>
                  Status
                </Typography>
                <Typography level="body-sm" sx={{ color: "#1a1e3f", fontWeight: 700 }}>
                  {records.find((r) => r.record_id === selectedRecordId)?.status || "N/A"}
                </Typography>
              </Box>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <Box>
                <Typography level="body-xs" sx={{ color: "#2d5016", fontWeight: 600 }}>
                  Severity
                </Typography>
                <Typography level="body-sm" sx={{ color: "#1a1e3f", fontWeight: 700 }}>
                  {records.find((r) => r.record_id === selectedRecordId)?.severity_level || "N/A"}
                </Typography>
              </Box>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <Box>
                <Typography level="body-xs" sx={{ color: "#2d5016", fontWeight: 600 }}>
                  Last Modified
                </Typography>
                <Typography level="body-sm" sx={{ color: "#1a1e3f", fontWeight: 700 }}>
                  Today
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </Card>
  );
};

export default SearchRecord;
