// src/components/neverEvents/FilterPanel.js
//
// Filters configured for Never Events according to WHO/JCI standards
// Investigation Status: OPEN → UNDER_INVESTIGATION → RCA_IN_PROGRESS → PENDING_REVIEW → RESOLVED → CLOSED
// Categories: Surgical, Medication, Patient Protection, Device/Product, Care Management
//
import React from "react";
import { Box, Card, FormControl, FormLabel, Input, Select, Option, Button, Grid, Typography } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";

const FilterPanel = ({ filters, onFilterChange, onClearFilters, leaves = [], domains = [] }) => {
  return (
    <Card sx={{ mb: 3, p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <FilterListIcon />
        <Typography level="title-md" sx={{ fontWeight: 600 }}>
          Filters & Search
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Search */}
        <Grid xs={12} md={6}>
          <FormControl>
            <FormLabel>Search (Case ID or Event Type)</FormLabel>
            <Input
              placeholder="Search by case ID or event type..."
              value={filters.search || ""}
              onChange={(e) => onFilterChange("search", e.target.value)}
              startDecorator={<SearchIcon />}
            />
          </FormControl>
        </Grid>

        {/* Status */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl>
            <FormLabel>Case Status</FormLabel>
            <Select
              value={filters.status || "all"}
              onChange={(_, value) => onFilterChange("status", value)}
            >
              <Option value="all">All</Option>
              <Option value="Open">Open</Option>
              <Option value="In Progress">In Progress</Option>
              <Option value="Closed">Closed</Option>
              <Option value="Finished">Finished</Option>
            </Select>
          </FormControl>
        </Grid>

        {/* Domain (was Category) */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl>
            <FormLabel>Domain</FormLabel>
            <Select
              value={filters.category || ""}
              onChange={(_, value) => onFilterChange("category", value)}
              placeholder="Select domain"
              slotProps={{ listbox: { sx: { maxHeight: 250, overflowY: "auto", zIndex: 9999 } } }}
            >
              <Option value="">All</Option>
              {domains.map((domain) => (
                <Option key={domain.id} value={domain.name_en}>
                  {domain.name_en}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Department (from leaves) */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl>
            <FormLabel>Department</FormLabel>
            <Select
              value={filters.department || ""}
              onChange={(_, value) => onFilterChange("department", value)}
              placeholder="Select department"
              slotProps={{ listbox: { sx: { maxHeight: 250, overflowY: "auto", zIndex: 9999 } } }}
            >
              <Option value="">All</Option>
              {leaves.map((leaf) => (
                <Option key={leaf.id} value={leaf.name || leaf.name_ar}>
                  {leaf.name || leaf.name_ar}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* From Date */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl>
            <FormLabel>From Date</FormLabel>
            <Input
              type="date"
              value={filters.from_date || ""}
              onChange={(e) => onFilterChange("from_date", e.target.value)}
            />
          </FormControl>
        </Grid>

        {/* To Date */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl>
            <FormLabel>To Date</FormLabel>
            <Input
              type="date"
              value={filters.to_date || ""}
              onChange={(e) => onFilterChange("to_date", e.target.value)}
            />
          </FormControl>
        </Grid>

        {/* Clear Button */}
        <Grid xs={12} md={12}>
          <Button
            variant="outlined"
            color="neutral"
            startDecorator={<ClearIcon />}
            onClick={onClearFilters}
            fullWidth
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
};

export default FilterPanel;
