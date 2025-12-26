// src/components/TableView/FilterPanel.js
import React from "react";
import { Box, Card, Typography, Select, Option, Button, CircularProgress, Input } from "@mui/joy";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";

const FilterPanel = ({ filters, filterOptions, loading, onChange, onClear }) => {
  const handleFilterChange = (field, value) => {
    onChange({ ...filters, [field]: value || null });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== null && v !== undefined && v !== "");

  if (loading) {
    return (
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CircularProgress size="sm" />
          <Typography level="body-sm">Loading filters...</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        p: 3,
        mb: 3,
        background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
        border: "1px solid rgba(102, 126, 234, 0.1)",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterListIcon sx={{ color: "#667eea" }} />
          <Typography level="h4" sx={{ fontWeight: 700, color: "#667eea" }}>
            Filters
          </Typography>
        </Box>
        {hasActiveFilters && (
          <Button
            variant="outlined"
            color="neutral"
            size="sm"
            startDecorator={<ClearIcon />}
            onClick={onClear}
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Filter Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
        }}
      >
        {/* Issuing Org Unit */}
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>
            Issuing Department
          </Typography>
          <Select
            placeholder="All departments"
            value={filters.issuing_org_unit_id}
            onChange={(_, value) => handleFilterChange("issuing_org_unit_id", value)}
            size="sm"
          >
            <Option value={null}>All departments</Option>
            {filterOptions?.issuing_org_units?.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name} ({item.count})
              </Option>
            ))}
          </Select>
        </Box>

        {/* Domain */}
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>
            Domain
          </Typography>
          <Select
            placeholder="All domains"
            value={filters.domain_id}
            onChange={(_, value) => handleFilterChange("domain_id", value)}
            size="sm"
          >
            <Option value={null}>All domains</Option>
            {filterOptions?.domains?.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name} ({item.count})
              </Option>
            ))}
          </Select>
        </Box>

        {/* Category */}
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>
            Category
          </Typography>
          <Select
            placeholder="All categories"
            value={filters.category_id}
            onChange={(_, value) => handleFilterChange("category_id", value)}
            size="sm"
          >
            <Option value={null}>All categories</Option>
            {filterOptions?.categories?.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name} ({item.count})
              </Option>
            ))}
          </Select>
        </Box>

        {/* Severity */}
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>
            Severity
          </Typography>
          <Select
            placeholder="All severities"
            value={filters.severity_id}
            onChange={(_, value) => handleFilterChange("severity_id", value)}
            size="sm"
          >
            <Option value={null}>All severities</Option>
            {filterOptions?.severities?.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name} ({item.count})
              </Option>
            ))}
          </Select>
        </Box>

        {/* Stage */}
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>
            Stage
          </Typography>
          <Select
            placeholder="All stages"
            value={filters.stage_id}
            onChange={(_, value) => handleFilterChange("stage_id", value)}
            size="sm"
          >
            <Option value={null}>All stages</Option>
            {filterOptions?.stages?.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name} ({item.count})
              </Option>
            ))}
          </Select>
        </Box>

        {/* Harm Level */}
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>
            Harm Level
          </Typography>
          <Select
            placeholder="All harm levels"
            value={filters.harm_level_id}
            onChange={(_, value) => handleFilterChange("harm_level_id", value)}
            size="sm"
          >
            <Option value={null}>All harm levels</Option>
            {filterOptions?.harm_levels?.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name} ({item.count})
              </Option>
            ))}
          </Select>
        </Box>

        {/* Status */}
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>
            Status
          </Typography>
          <Select
            placeholder="All statuses"
            value={filters.case_status_id}
            onChange={(_, value) => handleFilterChange("case_status_id", value)}
            size="sm"
          >
            <Option value={null}>All statuses</Option>
            {filterOptions?.statuses?.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name} ({item.count})
              </Option>
            ))}
          </Select>
        </Box>

        {/* Year */}
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>
            Year
          </Typography>
          <Input
            type="number"
            placeholder="YYYY"
            value={filters.year || ""}
            onChange={(e) => handleFilterChange("year", e.target.value ? parseInt(e.target.value) : null)}
            size="sm"
            slotProps={{
              input: {
                min: 2000,
                max: 2100,
              },
            }}
          />
        </Box>

        {/* Month */}
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>
            Month
          </Typography>
          <Select
            placeholder="All months"
            value={filters.month}
            onChange={(_, value) => handleFilterChange("month", value)}
            size="sm"
          >
            <Option value={null}>All months</Option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <Option key={month} value={month}>
                {new Date(2000, month - 1).toLocaleDateString("en-US", { month: "long" })}
              </Option>
            ))}
          </Select>
        </Box>

        {/* Start Date */}
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>
            Start Date
          </Typography>
          <Input
            type="date"
            value={filters.start_date || ""}
            onChange={(e) => handleFilterChange("start_date", e.target.value)}
            size="sm"
          />
        </Box>

        {/* End Date */}
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>
            End Date
          </Typography>
          <Input
            type="date"
            value={filters.end_date || ""}
            onChange={(e) => handleFilterChange("end_date", e.target.value)}
            size="sm"
          />
        </Box>
      </Box>
    </Card>
  );
};

export default FilterPanel;
