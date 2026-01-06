// src/components/TableView/YearPicker.js
import React, { useState, useMemo } from "react";
import { Box, Button, Card, Typography, Dropdown, MenuButton, Menu, MenuItem } from "@mui/joy";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const YearPicker = ({ value, onChange, availableYears = [] }) => {
  const [startYear, setStartYear] = useState(() => {
    const currentYear = new Date().getFullYear();
    return currentYear - 2; // Start with 2 years before current
  });

  // Generate grid of 12 years (3x4)
  const yearGrid = useMemo(() => {
    const years = [];
    for (let i = 0; i < 12; i++) {
      years.push(startYear - i);
    }
    return years;
  }, [startYear]);

  const handleYearSelect = (year) => {
    onChange(year);
  };

  const handleClear = () => {
    onChange(null);
  };

  const handlePrevious = () => {
    setStartYear(startYear - 12);
  };

  const handleNext = () => {
    setStartYear(startYear + 12);
  };

  return (
    <Dropdown>
      <MenuButton
        variant={value ? "solid" : "outlined"}
        color={value ? "primary" : "neutral"}
        size="sm"
        sx={{ width: "100%", justifyContent: "flex-start" }}
      >
        {value ? `${value}` : "All years"}
      </MenuButton>

      <Menu
        placement="bottom-start"
        sx={{
          p: 2,
          background: "#fff",
          border: "1px solid rgba(102, 126, 234, 0.2)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          zIndex: 1400,
          minWidth: "280px",
          "--ListItemDecorator-size": "0px",
        }}
      >
        {/* Navigation Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
            px: 1,
          }}
        >
          <Button
            size="sm"
            variant="plain"
            onClick={handlePrevious}
            sx={{ minWidth: "auto", p: 0.5 }}
          >
            <ChevronLeftIcon />
          </Button>
          <Typography level="body-sm" sx={{ fontWeight: 600, color: "#667eea" }}>
            {startYear - 11} - {startYear}
          </Typography>
          <Button
            size="sm"
            variant="plain"
            onClick={handleNext}
            sx={{ minWidth: "auto", p: 0.5 }}
          >
            <ChevronRightIcon />
          </Button>
        </Box>

        {/* Year Grid (3 columns × 4 rows) */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            mb: 1.5,
            px: 1,
          }}
        >
          {yearGrid.map((year) => (
            <Button
              key={year}
              variant={value === year ? "solid" : "outlined"}
              color={value === year ? "primary" : "neutral"}
              size="sm"
              onClick={() => handleYearSelect(year)}
              sx={{
                fontSize: "0.875rem",
                padding: "8px 4px",
                minWidth: "auto",
              }}
            >
              {year}
            </Button>
          ))}
        </Box>

        {/* Clear Button */}
        <Box sx={{ px: 1 }}>
          <Button
            variant="plain"
            color="neutral"
            size="sm"
            onClick={handleClear}
            sx={{ width: "100%" }}
          >
            Clear Selection
          </Button>
        </Box>
      </Menu>
    </Dropdown>
  );
};

export default YearPicker;
