// src/components/SearchFilters.js
import React, { useState } from "react";
import {
  Box,
  Input,
  FormControl,
  FormLabel,
  Select,
  Option,
  Button,
  Grid,
  Card,
  Typography,
} from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";

const issuingDepartments = [
  "All",
  "cardiac 1",
  "cardiac 2",
  "cardiac 3",
  "CCU",
  "CSU",
  "ICN",
  "ICU",
  "ER",
  "Ward 1",
  "Ward 2",
  "Radiology",
];

const targetDepartments = [
  "All",
  "Call Center",
  "cardiac 1",
  "cardiac 2",
  "cardiac 3",
  "CCU",
  "CSU",
  "ICN",
  "ICU",
  "ER",
  "Ward 1",
  "Ward 2",
  "Radiology",
];

const sources = [
  "All",
  "Phone",
  "Walk-in",
  "Email",
  "Online Form",
  "SMS",
  "Letter",
];

const severities = ["All", "High", "Medium", "Low"];
const stages = ["All", "Admission", "Care", "Discharge"];
const harmLevels = ["All", "High", "Medium", "Low", "No Harm"];
const statuses = ["All", "In Progress", "Closed", "Pending"];

const SearchFilters = ({ filters, setFilters }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleSelectChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value || "All",
    });
  };

  const clearFilters = () => {
    setFilters({
      searchText: "",
      issuingDept: "All",
      targetDept: "All",
      source: "All",
      severity: "All",
      stage: "All",
      harm: "All",
      status: "All",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Main Filters */}
      <Card
        sx={{
          p: 2,
          mb: 2,
          background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
          border: "1px solid rgba(102, 126, 234, 0.1)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
          }}
        >
          <SearchIcon sx={{ color: "#667eea" }} />
          <Typography level="h4" sx={{ color: "#1a1e3f", fontWeight: 700 }}>
            Search & Filter Records
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Search Box */}
          <Grid xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
                🔍 Search
              </FormLabel>
              <Input
                type="text"
                name="searchText"
                value={filters.searchText}
                onChange={handleChange}
                placeholder="Record ID or Patient Name..."
                slotProps={{
                  input: {
                    style: {
                      borderRadius: "8px",
                    },
                  },
                }}
                startDecorator={<SearchIcon sx={{ fontSize: "18px" }} />}
              />
            </FormControl>
          </Grid>

          {/* Issuing Department */}
          <Grid xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
                🏥 Issuing Department
              </FormLabel>
              <Select
                value={filters.issuingDept}
                onChange={(e, value) => handleSelectChange("issuingDept", value)}
              >
                {issuingDepartments.map((d) => (
                  <Option key={d} value={d}>
                    {d}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Target Department */}
          <Grid xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
                🎯 Target Department
              </FormLabel>
              <Select
                value={filters.targetDept}
                onChange={(e, value) => handleSelectChange("targetDept", value)}
              >
                {targetDepartments.map((d) => (
                  <Option key={d} value={d}>
                    {d}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Source */}
          <Grid xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
                📱 Source
              </FormLabel>
              <Select
                value={filters.source}
                onChange={(e, value) => handleSelectChange("source", value)}
              >
                {sources.map((s) => (
                  <Option key={s} value={s}>
                    {s}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Button
            startDecorator={<FilterListIcon />}
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant={showAdvanced ? "solid" : "outlined"}
            sx={{
              background: showAdvanced
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : undefined,
            }}
          >
            {showAdvanced ? "Hide Advanced" : "Show Advanced"}
          </Button>
          <Button
            startDecorator={<ClearIcon />}
            onClick={clearFilters}
            variant="plain"
            color="neutral"
          >
            Clear All
          </Button>
        </Box>
      </Card>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card
          sx={{
            p: 2,
            background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
            border: "2px solid rgba(102, 126, 234, 0.2)",
            borderTop: "4px solid #667eea",
          }}
        >
          <Typography level="h4" sx={{ color: "#1a1e3f", fontWeight: 700, mb: 2 }}>
            ⚙️ Advanced Filters
          </Typography>

          <Grid container spacing={2}>
            {/* Severity */}
            <Grid xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
                  ⚠️ Severity
                </FormLabel>
                <Select
                  value={filters.severity || "All"}
                  onChange={(e, value) => handleSelectChange("severity", value)}
                >
                  {severities.map((s) => (
                    <Option key={s} value={s}>
                      {s}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Stage */}
            <Grid xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
                  📍 Stage
                </FormLabel>
                <Select
                  value={filters.stage || "All"}
                  onChange={(e, value) => handleSelectChange("stage", value)}
                >
                  {stages.map((s) => (
                    <Option key={s} value={s}>
                      {s}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Harm Level */}
            <Grid xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
                  🩹 Harm Level
                </FormLabel>
                <Select
                  value={filters.harm || "All"}
                  onChange={(e, value) => handleSelectChange("harm", value)}
                >
                  {harmLevels.map((h) => (
                    <Option key={h} value={h}>
                      {h}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status */}
            <Grid xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
                  ✅ Status
                </FormLabel>
                <Select
                  value={filters.status || "All"}
                  onChange={(e, value) => handleSelectChange("status", value)}
                >
                  {statuses.map((s) => (
                    <Option key={s} value={s}>
                      {s}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Start Date */}
            <Grid xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
                  📅 Start Date
                </FormLabel>
                <Input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleChange}
                  slotProps={{
                    input: { style: { borderRadius: "8px" } },
                  }}
                />
              </FormControl>
            </Grid>

            {/* End Date */}
            <Grid xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
                  📅 End Date
                </FormLabel>
                <Input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleChange}
                  slotProps={{
                    input: { style: { borderRadius: "8px" } },
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
        </Card>
      )}
    </Box>
  );
};

export default SearchFilters;

