// src/components/TableView/FilterPanel.js
import React, { useState } from "react";
import { Box, Card, Typography, Select, Option, Button, CircularProgress, Input } from "@mui/joy";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import YearPicker from "./YearPicker";
import theme from '../../theme';

// Searchable dropdown — renders a text input on top of the option list to filter items
function SearchableSelect({ value, onChange, options, placeholder, size = "sm", getOptionKey, getOptionLabel }) {
  const [search, setSearch] = useState("");
  const filtered = options.filter(o =>
    !search || getOptionLabel(o).toLowerCase().includes(search.toLowerCase())
  );
  return (
    <Select
      placeholder={placeholder}
      value={value}
      onChange={(_, v) => { setSearch(""); onChange(v); }}
      size={size}
      slotProps={{
        listbox: {
          sx: { zIndex: 1300, bgcolor: "#fff" },
          // Reset search when closed
          onMouseLeave: () => {},
        }
      }}
    >
      <Option value={null} sx={{ position: "sticky", top: 0, bgcolor: "#fff", zIndex: 2, borderBottom: "1px solid #eee", p: 0 }}>
        <Input
          size="sm"
          placeholder="Search…"
          value={search}
          onChange={e => { e.stopPropagation(); setSearch(e.target.value); }}
          onClick={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
          sx={{ width: "100%", border: "none", borderRadius: 0, "--Input-focusedHighlight": "transparent" }}
        />
      </Option>
      <Option value={null} sx={{ color: "#000" }}>{placeholder}</Option>
      {filtered.map(o => (
        <Option key={getOptionKey(o)} value={getOptionKey(o)} sx={{ color: "#000" }}>
          {getOptionLabel(o)}
        </Option>
      ))}
    </Select>
  );
}

const FilterPanel = ({ filters, filterOptions, loading, onChange, onClear }) => {
  const handleFilterChange = (field, value) => {
    onChange({ ...filters, [field]: value || null });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== null && v !== undefined && v !== "");

  // Debug logging
  React.useEffect(() => {
    console.log("🔍 FilterPanel received filterOptions:", filterOptions);
  }, [filterOptions]);

  if (loading || !filterOptions) {
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
        border: `1px solid ${theme.colors.primary}1A`,
        position: "relative",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterListIcon sx={{ color: theme.colors.primary }} />
          <Typography level="h4" sx={{ fontWeight: 700, color: theme.colors.primary }}>
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

      {/* Quick Time Filters */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Typography level="body-xs" sx={{ alignSelf: "center", color: "#666", fontWeight: 600 }}>Quick:</Typography>
        {/* Today quick filter */}
        {(() => {
          const todayStr = new Date().toISOString().split("T")[0];
          const isActive = filters.start_date === todayStr && filters.end_date === todayStr;
          return (
            <Button
              key="today"
              size="sm"
              variant={isActive ? "solid" : "soft"}
              color={isActive ? "primary" : "neutral"}
              onClick={() => {
                if (isActive) {
                  onChange({ ...filters, start_date: null, end_date: null });
                } else {
                  onChange({ ...filters, start_date: todayStr, end_date: todayStr, year: null, month: null });
                }
              }}
            >
              Today
            </Button>
          );
        })()}
        {[7, 30, 60].map(days => {
          const end = new Date();
          const start = new Date();
          start.setDate(start.getDate() - days);
          const startStr = start.toISOString().split("T")[0];
          const endStr = end.toISOString().split("T")[0];
          const isActive = filters.start_date === startStr && filters.end_date === endStr;
          return (
            <Button
              key={days}
              size="sm"
              variant={isActive ? "solid" : "soft"}
              color={isActive ? "primary" : "neutral"}
              onClick={() => {
                if (isActive) {
                  // Toggle off — clear date range
                  onChange({ ...filters, start_date: null, end_date: null });
                } else {
                  onChange({ ...filters, start_date: startStr, end_date: endStr, year: null, month: null });
                }
              }}
            >
              Last {days} days
            </Button>
          );
        })}
      </Box>

      {/* Filter Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
        }}
      >
        {/* Issuing Org Unit (searchable) */}
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>Issuing Department</Typography>
          <SearchableSelect
            value={filters.issuing_org_unit_id}
            onChange={(v) => handleFilterChange("issuing_org_unit_id", v)}
            options={filterOptions?.issuing_org_units || []}
            placeholder="All departments"
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) => (item.name || item.name_en || item.name_ar || `Dept ${item.id}`) + (item.count ? ` (${item.count})` : "")}
          />
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
            slotProps={{
              listbox: {                onMouseLeave: (e) => e.currentTarget.closest('[role="listbox"]')?.parentElement?.parentElement?.click(),                onMouseLeave: (e) => e.currentTarget.closest('[role="listbox"]')?.parentElement?.parentElement?.click(),
                sx: { 
                  zIndex: 1300,
                  backgroundColor: "#fff",
                  color: "#000",
                }
              }
            }}
          >
            <Option value={null} sx={{ color: "#000" }}>All domains</Option>
            {filterOptions?.domains && Array.isArray(filterOptions.domains) && filterOptions.domains.map((item) => (
              <Option key={item.id} value={item.id} sx={{ color: "#000" }}>
                {item.name || item.name_en || item.name_ar || `Domain ${item.id}`}{item.count ? ` (${item.count})` : ""}
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
            slotProps={{
              listbox: {
                onMouseLeave: (e) => {
                  const popup = e.currentTarget.closest('[role="presentation"]');
                  if (popup) {
                    popup.style.display = 'none';
                    setTimeout(() => popup.remove(), 0);
                  }
                },
                sx: {
                  zIndex: 1300,
                  backgroundColor: "#fff",
                  color: "#000",
                }
              }
            }}
          >
            <Option value={null} sx={{ color: "#000" }}>All categories</Option>
            {filterOptions?.categories && Array.isArray(filterOptions.categories) && filterOptions.categories.map((item) => (
              <Option key={item.id} value={item.id} sx={{ color: "#000" }}>
                {item.name || item.name_en || item.name_ar || `Category ${item.id}`}{item.count ? ` (${item.count})` : ""}
              </Option>
            ))}
          </Select>
        </Box>

        {/* Classification English */}
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>
            Classification (English)
          </Typography>
          <Select
            placeholder="All classifications"
            value={filters.classification_en_id}
            onChange={(_, value) => handleFilterChange("classification_en_id", value)}
            size="sm"
            slotProps={{
              listbox: {
                onMouseLeave: (e) => {
                  const popup = e.currentTarget.closest('[role="presentation"]');
                  if (popup) {
                    popup.style.display = 'none';
                    setTimeout(() => popup.remove(), 0);
                  }
                },
                sx: { 
                  zIndex: 1300,
                  backgroundColor: "#fff",
                  color: "#000"
                }
              }
            }}
          >
            <Option value={null} sx={{ color: "#000" }}>All classifications</Option>
            {filterOptions?.classifications_en && Array.isArray(filterOptions.classifications_en) && filterOptions.classifications_en.map((item) => (
              <Option key={item.ClassificationID || item.id} value={item.ClassificationID || item.id} sx={{ color: "#000" }}>
                {item.Classification_EN || item.name || item.name_en || `Classification ${item.ClassificationID || item.id}`}{item.count ? ` (${item.count})` : ""}
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
            slotProps={{
              listbox: {
                onMouseLeave: (e) => {
                  const popup = e.currentTarget.closest('[role="presentation"]');
                  if (popup) {
                    popup.style.display = 'none';
                    setTimeout(() => popup.remove(), 0);
                  }
                },
                sx: { 
                  zIndex: 1300,
                  backgroundColor: "#fff",
                  color: "#000",
                }
              }
            }}
          >
            <Option value={null} sx={{ color: "#000" }}>All severities</Option>
            {filterOptions?.severities && Array.isArray(filterOptions.severities) && filterOptions.severities.map((item) => (
              <Option key={item.id} value={item.id} sx={{ color: "#000" }}>
                {item.name || item.name_en || item.name_ar || `Severity ${item.id}`}{item.count ? ` (${item.count})` : ""}
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
            slotProps={{
              listbox: {
                sx: { zIndex: 1300 }
              }
            }}
          >
            <Option value={null} sx={{ color: "#000" }}>All stages</Option>
            {filterOptions?.stages && Array.isArray(filterOptions.stages) && filterOptions.stages.map((item) => (
              <Option key={item.id} value={item.id} sx={{ color: "#000" }}>
                {item.name || item.name_en || item.name_ar || `Stage ${item.id}`}{item.count ? ` (${item.count})` : ""}
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
            slotProps={{
              listbox: {
                onMouseLeave: (e) => e.currentTarget.closest('[role="listbox"]')?.parentElement?.parentElement?.click(),
                sx: { 
                  zIndex: 1300,
                  backgroundColor: "#fff",
                  color: "#000",
                }
              }
            }}
          >
            <Option value={null} sx={{ color: "#000" }}>All harm levels</Option>
            {filterOptions?.harm_levels && Array.isArray(filterOptions.harm_levels) && filterOptions.harm_levels.map((item) => (
              <Option key={item.id} value={item.id} sx={{ color: "#000" }}>
                {item.name || item.name_en || item.name_ar || `Harm ${item.id}`}{item.count ? ` (${item.count})` : ""}
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
            slotProps={{
              listbox: {
                onMouseLeave: (e) => {
                  const popup = e.currentTarget.closest('[role="presentation"]');
                  if (popup) {
                    popup.style.display = 'none';
                    setTimeout(() => popup.remove(), 0);
                  }
                },
                sx: { 
                  zIndex: 1300,
                  backgroundColor: "#fff",
                  color: "#000"
                }
              }
            }}
          >
            <Option value={null} sx={{ color: "#000" }}>All statuses</Option>
            {filterOptions?.statuses && Array.isArray(filterOptions.statuses) && filterOptions.statuses.map((item) => (
              <Option key={item.id || item.status_id || item.StatusID} value={item.id || item.status_id || item.StatusID} sx={{ color: "#000" }}>
                {item.name || item.status_name || item.Status_EN || item.name_en || item.name_ar || `Status ${item.id || item.status_id || item.StatusID}`}{item.count ? ` (${item.count})` : ""}
              </Option>
            ))}
          </Select>
        </Box>

        {/* Target Section (searchable) */}
        {filterOptions?.sections && filterOptions.sections.length > 0 && (
          <Box>
            <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>Target Section</Typography>
            <SearchableSelect
              value={filters.target_department_id}
              onChange={(v) => handleFilterChange("target_department_id", v)}
              options={filterOptions.sections}
              placeholder="All sections"
              getOptionKey={(s) => s.section_id}
              getOptionLabel={(s) => s.section_name + (s.department_name ? ` — ${s.department_name}` : "")}
            />
          </Box>
        )}

        {/* Target Department (searchable) */}
        {filterOptions?.target_departments && filterOptions.target_departments.length > 0 && (
          <Box>
            <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>Target Department</Typography>
            <SearchableSelect
              value={filters.target_dept_parent_id}
              onChange={(v) => handleFilterChange("target_dept_parent_id", v)}
              options={filterOptions.target_departments}
              placeholder="All departments"
              getOptionKey={(d) => d.id}
              getOptionLabel={(d) => d.name + (d.administration_name ? ` (${d.administration_name})` : "")}
            />
          </Box>
        )}

        {/* Target Administration (searchable) */}
        {filterOptions?.target_administrations && filterOptions.target_administrations.length > 0 && (
          <Box>
            <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>Target Administration</Typography>
            <SearchableSelect
              value={filters.target_admin_id}
              onChange={(v) => handleFilterChange("target_admin_id", v)}
              options={filterOptions.target_administrations}
              placeholder="All administrations"
              getOptionKey={(a) => a.id}
              getOptionLabel={(a) => a.name}
            />
          </Box>
        )}

        {/* Year */}
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 600 }}>
            Year
          </Typography>
          <YearPicker
            value={filters.year}
            onChange={(year) => handleFilterChange("year", year)}
            availableYears={filterOptions?.years || []}
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
            slotProps={{
              listbox: {
                onMouseLeave: (e) => {
                  const popup = e.currentTarget.closest('[role="presentation"]');
                  if (popup) {
                    popup.style.display = 'none';
                    setTimeout(() => popup.remove(), 0);
                  }
                },
                sx: { 
                  zIndex: 1300,
                  backgroundColor: "#fff",
                  color: "#000"
                }
              }
            }}
          >
            <Option value={null} sx={{ color: "#000" }}>All months</Option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
              <Option key={month} value={month} sx={{ color: "#000" }}>
                {new Date(2024, month - 1).toLocaleString('en-US', { month: 'long' })}
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
