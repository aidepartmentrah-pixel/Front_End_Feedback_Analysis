// src/components/redflags/FilterPanel.js
import React from "react";
import { Box, Card, FormControl, FormLabel, Input, Select, Option, Button, Grid, Typography } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";

const FilterPanel = ({ filters, onFilterChange, onClearFilters }) => {
  return (
    <Card sx={{ mb: 3, p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <FilterListIcon />
        <Typography level="title-md" sx={{ fontWeight: 600 }}>
          التصفية والبحث
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Search */}
        <Grid xs={12} md={6}>
          <FormControl>
            <FormLabel>بحث (رقم السجل أو اسم المريض)</FormLabel>
            <Input
              placeholder="ابحث..."
              value={filters.search || ""}
              onChange={(e) => onFilterChange("search", e.target.value)}
              startDecorator={<SearchIcon />}
            />
          </FormControl>
        </Grid>

        {/* Status */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl>
            <FormLabel>الحالة</FormLabel>
            <Select
              value={filters.status || "all"}
              onChange={(_, value) => onFilterChange("status", value)}
            >
              <Option value="all">الكل</Option>
              <Option value="OPEN">مفتوح</Option>
              <Option value="UNDER_REVIEW">قيد المراجعة</Option>
              <Option value="FINISHED">منتهي</Option>
            </Select>
          </FormControl>
        </Grid>

        {/* Severity */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl>
            <FormLabel>الخطورة</FormLabel>
            <Select
              value={filters.severity || ""}
              onChange={(_, value) => onFilterChange("severity", value)}
            >
              <Option value="">الكل</Option>
              <Option value="CRITICAL">حرج</Option>
              <Option value="HIGH">عالي</Option>
            </Select>
          </FormControl>
        </Grid>

        {/* Department */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl>
            <FormLabel>القسم</FormLabel>
            <Input
              placeholder="اسم القسم"
              value={filters.department || ""}
              onChange={(e) => onFilterChange("department", e.target.value)}
            />
          </FormControl>
        </Grid>

        {/* Category */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl>
            <FormLabel>التصنيف</FormLabel>
            <Input
              placeholder="التصنيف"
              value={filters.category || ""}
              onChange={(e) => onFilterChange("category", e.target.value)}
            />
          </FormControl>
        </Grid>

        {/* From Date */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl>
            <FormLabel>من تاريخ</FormLabel>
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
            <FormLabel>إلى تاريخ</FormLabel>
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
            مسح الفلاتر
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
};

export default FilterPanel;
