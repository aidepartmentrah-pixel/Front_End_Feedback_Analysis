// src/components/personReporting/SeasonSelector.jsx
// Phase D — Reusable season selector for person reports

import React from "react";
import { Box, FormControl, FormLabel, Select, Option } from "@mui/joy";

/**
 * SeasonSelector - Reusable quarter/year selector with date range computation
 * 
 * Emits season_start and season_end dates based on selected quarter and year.
 * 
 * @param {Object} props
 * @param {Object} props.value - Current selection: { year, quarter }
 * @param {Function} props.onChange - Callback with { year, quarter, season_start, season_end }
 */
const SeasonSelector = ({ value = null, onChange }) => {
  // Generate year options (current year + last 11 years = 12 years total)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, i) => currentYear - i);

  // Quarter options with Arabic labels
  const quarters = [
    { value: "Q1", label: "الفصل الأول - Q1 (Jan-Mar)", start: "01-01", end: "03-31" },
    { value: "Q2", label: "الفصل الثاني - Q2 (Apr-Jun)", start: "04-01", end: "06-30" },
    { value: "Q3", label: "الفصل الثالث - Q3 (Jul-Sep)", start: "07-01", end: "09-30" },
    { value: "Q4", label: "الفصل الرابع - Q4 (Oct-Dec)", start: "10-01", end: "12-31" }
  ];

  // Compute season_start and season_end dates
  const computeDateRange = (year, quarter) => {
    if (!year || !quarter) {
      return { season_start: null, season_end: null };
    }

    const quarterData = quarters.find(q => q.value === quarter);
    if (!quarterData) {
      return { season_start: null, season_end: null };
    }

    const season_start = `${year}-${quarterData.start}`;
    const season_end = `${year}-${quarterData.end}`;

    return { season_start, season_end };
  };

  // Handle year change
  const handleYearChange = (event, newYear) => {
    const quarter = value?.quarter || null;
    const { season_start, season_end } = computeDateRange(newYear, quarter);
    
    if (onChange) {
      onChange({
        year: newYear,
        quarter,
        season_start,
        season_end
      });
    }
  };

  // Handle quarter change
  const handleQuarterChange = (event, newQuarter) => {
    const year = value?.year || null;
    const { season_start, season_end } = computeDateRange(year, newQuarter);
    
    if (onChange) {
      onChange({
        year,
        quarter: newQuarter,
        season_start,
        season_end
      });
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      {/* Year Selector */}
      <FormControl sx={{ flex: "1 1 150px", minWidth: "150px" }}>
        <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
          السنة (Year)
        </FormLabel>
        <Select
          value={value?.year || ""}
          onChange={handleYearChange}
          placeholder="اختر سنة (Select Year)"
        >
          <Option value="">-- Select Year --</Option>
          {years.map((year) => (
            <Option key={year} value={year}>
              {year}
            </Option>
          ))}
        </Select>
      </FormControl>

      {/* Quarter Selector */}
      <FormControl sx={{ flex: "1 1 200px", minWidth: "200px" }}>
        <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
          الفصل (Quarter)
        </FormLabel>
        <Select
          value={value?.quarter || ""}
          onChange={handleQuarterChange}
          placeholder="اختر فصل (Select Quarter)"
        >
          <Option value="">-- Select Quarter --</Option>
          {quarters.map((quarter) => (
            <Option key={quarter.value} value={quarter.value}>
              {quarter.label}
            </Option>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default SeasonSelector;
