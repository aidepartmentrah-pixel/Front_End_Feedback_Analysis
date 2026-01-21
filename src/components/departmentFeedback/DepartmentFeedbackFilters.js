// src/components/departmentFeedback/DepartmentFeedbackFilters.js
import React, { useState, useEffect } from "react";
import { Box, Card, Typography, FormControl, FormLabel, Input, Select, Option, Grid, CircularProgress } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import { fetchReferenceData } from "../../api/insertRecord";

const DepartmentFeedbackFilters = ({ filters, setFilters }) => {
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const refData = await fetchReferenceData();
        setDepartments(refData.departments || []);
      } catch (error) {
        console.error('Failed to load departments:', error);
      } finally {
        setLoadingDepts(false);
      }
    };
    loadDepartments();
  }, []);

  const handleChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  return (
    <Card
      sx={{
        p: 3,
        mb: 3,
        background: "linear-gradient(135deg, #f5f7ff 0%, #fff 100%)",
        border: "2px solid rgba(102, 126, 234, 0.2)",
      }}
    >
      <Typography level="h5" sx={{ mb: 3, fontWeight: 700, color: "#667eea" }}>
        🔍 فلاتر السجلات (Filters)
      </Typography>

      <Grid container spacing={2}>
        {/* Search */}
        <Grid xs={12} sm={6} md={4}>
          <FormControl>
            <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
              بحث (Search)
            </FormLabel>
            <Input
              placeholder="رقم الشكوى، اسم المريض..."
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
              startDecorator={<SearchIcon />}
            />
          </FormControl>
        </Grid>

        {/* Department */}
        <Grid xs={12} sm={6} md={4}>
          <FormControl>
            <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
              القسم المستهدف (Target Department)
            </FormLabel>
            <Select
              value={filters.department}
              onChange={(e, value) => handleChange("department", value)}
              disabled={loadingDepts}
              endDecorator={loadingDepts && <CircularProgress size="sm" />}
            >
              <Option value="">الكل (All)</Option>
              {departments
                .filter((dept) => dept && dept.org_unit_id != null)
                .map((dept) => (
                  <Option key={dept.org_unit_id} value={dept.org_unit_id.toString()}>
                    {dept.org_unit_name_en || dept.org_unit_name_ar || `Department ${dept.org_unit_id}`}
                    {dept.org_unit_name_ar && ` (${dept.org_unit_name_ar})`}
                  </Option>
                ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Severity */}
        <Grid xs={12} sm={6} md={4}>
          <FormControl>
            <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
              الشدة (Severity)
            </FormLabel>
            <Select
              value={filters.severity}
              onChange={(e, value) => handleChange("severity", value)}
            >
              <Option value="">الكل (All)</Option>
              <Option value="HIGH">عالية (High)</Option>
              <Option value="MEDIUM">متوسطة (Medium)</Option>
              <Option value="LOW">منخفضة (Low)</Option>
            </Select>
          </FormControl>
        </Grid>

        {/* Status */}
        <Grid xs={12} sm={6} md={4}>
          <FormControl>
            <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
              الحالة (Status)
            </FormLabel>
            <Select
              value={filters.status}
              onChange={(e, value) => handleChange("status", value)}
            >
              <Option value="">الكل (All)</Option>
              <Option value="OPEN">مفتوح (Open)</Option>
              <Option value="OVERDUE">متأخر (Overdue)</Option>
            </Select>
          </FormControl>
        </Grid>

        {/* Date From */}
        <Grid xs={12} sm={6} md={4}>
          <FormControl>
            <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
              من تاريخ (From Date)
            </FormLabel>
            <Input
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleChange("fromDate", e.target.value)}
            />
          </FormControl>
        </Grid>

        {/* Date To */}
        <Grid xs={12} sm={6} md={4}>
          <FormControl>
            <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
              إلى تاريخ (To Date)
            </FormLabel>
            <Input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleChange("toDate", e.target.value)}
            />
          </FormControl>
        </Grid>
      </Grid>
    </Card>
  );
};

export default DepartmentFeedbackFilters;
