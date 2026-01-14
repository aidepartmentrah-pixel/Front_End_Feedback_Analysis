// src/components/reports/ReportFilters.js
import React, { useMemo, useEffect } from "react";
import { Box, Card, Typography, FormControl, FormLabel, Input, Select, Option, Grid, Radio, RadioGroup, Chip, Alert } from "@mui/joy";
import WarningIcon from "@mui/icons-material/Warning";

const ReportFilters = ({ filters, setFilters, reportType, hierarchy, loadingHierarchy, reportScope, setReportScope, onValidationChange }) => {
  // Generate dynamic year list (current year + last 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i);

  // Auto-fix invalid date mode combinations when reportType changes
  useEffect(() => {
    if (reportType === "monthly") {
      // Force month or range mode for monthly reports
      if (filters.dateMode === "trimester") {
        setFilters(f => ({ ...f, dateMode: "month", trimester: "" }));
      }
    } else if (reportType === "seasonal") {
      // Force trimester mode for seasonal reports
      if (filters.dateMode !== "trimester") {
        setFilters(f => ({ ...f, dateMode: "trimester", month: "", fromDate: "", toDate: "" }));
      }
    }
  }, [reportType, filters.dateMode, setFilters]);

  // Date range validation - check if fromDate > toDate
  const isDateRangeInvalid = useMemo(() => {
    if (reportType === "monthly" && filters.dateMode === "range" && filters.fromDate && filters.toDate) {
      const fromDate = new Date(filters.fromDate);
      const toDate = new Date(filters.toDate);
      return fromDate > toDate;
    }
    return false;
  }, [reportType, filters.dateMode, filters.fromDate, filters.toDate]);

  // Notify parent component about validation state changes
  React.useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isDateRangeInvalid);
    }
  }, [isDateRangeInvalid, onValidationChange]);

  // Auto-clear invalid date range and alert user
  useEffect(() => {
    if (filters.dateMode === "range" && filters.fromDate && filters.toDate) {
      const fromDate = new Date(filters.fromDate);
      const toDate = new Date(filters.toDate);
      
      if (fromDate > toDate) {
        alert(
          "⚠️ خطأ في نطاق التاريخ (Invalid Date Range)\n\n" +
          "تاريخ البداية يجب أن يكون قبل تاريخ النهاية\n" +
          "From date must be before To date\n\n" +
          "سيتم مسح تاريخ النهاية تلقائياً\n" +
          "To date will be cleared automatically"
        );
        
        setFilters(f => ({
          ...f,
          toDate: ""
        }));
      }
    }
  }, [filters.fromDate, filters.toDate, filters.dateMode, setFilters]);

  const handleChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  // Handle scope level change - clears all IDs
  const handleScopeLevelChange = (newLevel) => {
    setReportScope({
      level: newLevel,
      administrationIds: [],
      departmentIds: [],
      sectionIds: []
    });
  };

  // Handle administration selection - clears downstream
  const handleAdministrationChange = (e, newValue) => {
    // Extract IDs if newValue contains objects (MUI Joy Select with multiple can return objects)
    const ids = Array.isArray(newValue) 
      ? newValue.map(val => typeof val === 'object' ? val.value : val)
      : [];
    setReportScope({
      ...reportScope,
      administrationIds: ids,
      departmentIds: [],  // Clear downstream
      sectionIds: []      // Clear downstream
    });
  };

  // Handle department selection - clears downstream
  const handleDepartmentChange = (e, newValue) => {
    // Extract IDs if newValue contains objects
    const ids = Array.isArray(newValue)
      ? newValue.map(val => typeof val === 'object' ? val.value : val)
      : [];
    setReportScope({
      ...reportScope,
      departmentIds: ids,
      sectionIds: []  // Clear downstream
    });
  };

  // Handle section selection
  const handleSectionChange = (e, newValue) => {
    // Extract IDs if newValue contains objects
    const ids = Array.isArray(newValue)
      ? newValue.map(val => typeof val === 'object' ? val.value : val)
      : [];
    setReportScope({
      ...reportScope,
      sectionIds: ids
    });
  };

  // Get available administrations
  const getAdministrations = () => {
    if (!hierarchy) return [];
    return hierarchy.Administration || [];
  };

  // Get available departments based on selected administrations
  const getDepartments = () => {
    if (!hierarchy || !hierarchy.Department) return [];
    
    // If no administrations selected, return all departments
    if (reportScope.administrationIds.length === 0) {
      const allDepts = [];
      Object.values(hierarchy.Department).forEach(depts => {
        allDepts.push(...depts);
      });
      return allDepts;
    }
    
    // Return departments filtered by selected administrations
    const filtered = [];
    reportScope.administrationIds.forEach(adminId => {
      const depts = hierarchy.Department[adminId] || [];
      filtered.push(...depts);
    });
    return filtered;
  };

  // Get available sections based on selected departments
  const getSections = () => {
    if (!hierarchy || !hierarchy.Section) return [];
    
    // If no departments selected, return all sections
    if (reportScope.departmentIds.length === 0) {
      const allSections = [];
      Object.values(hierarchy.Section).forEach(sections => {
        allSections.push(...sections);
      });
      return allSections;
    }
    
    // Return sections filtered by selected departments
    const filtered = [];
    reportScope.departmentIds.forEach(deptId => {
      const sections = hierarchy.Section[deptId] || [];
      filtered.push(...sections);
    });
    return filtered;
  };

  // Handle date mode toggle
  const handleDateModeChange = (mode) => {
    if (mode === "range") {
      setFilters({ ...filters, dateMode: "range", month: "", trimester: "" });
    } else if (mode === "month") {
      setFilters({ ...filters, dateMode: "month", fromDate: "", toDate: "" });
    } else if (mode === "trimester") {
      setFilters({ ...filters, dateMode: "trimester", fromDate: "", toDate: "", month: "" });
    }
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
        فلاتر التقرير (Report Filters)
      </Typography>

      {/* Report Scope Level Selector */}
      <Box sx={{ mb: 3, p: 2, background: "rgba(102, 126, 234, 0.05)", borderRadius: "8px" }}>
        <Typography level="body-sm" sx={{ mb: 2, fontWeight: 700 }}>
          📊 مستوى نطاق التقرير (Report Scope Level):
        </Typography>
        <RadioGroup
          value={reportScope.level}
          onChange={(e) => handleScopeLevelChange(e.target.value)}
          orientation="horizontal"
          sx={{ gap: 3, flexWrap: "wrap" }}
        >
          <Radio value="hospital" label="🏥 المستشفى (Hospital)" />
          <Radio value="administration" label="🏢 إدارة (Administration)" />
          <Radio value="department" label="🏬 دائرة (Department)" />
          <Radio value="section" label="🧩 قسم (Section)" />
        </RadioGroup>

        {/* Cascaded Hierarchy Navigation */}
        {reportScope.level !== "hospital" && (
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            
            {/* Administration Selector - Shows for all levels except hospital */}
            <FormControl sx={{ width: "100%" }}>
              <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
                🏢 الإدارات (Administrations)
                {reportScope.administrationIds.length === 0 && " - الكل (All)"}
              </FormLabel>
              <Select
                multiple
                value={reportScope.administrationIds}
                onChange={handleAdministrationChange}
                disabled={loadingHierarchy}
                placeholder="اختر الإدارات أو اتركه فارغاً للكل"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {selected.length === 0 ? (
                      <Typography level="body-sm" sx={{ color: "#667eea", fontWeight: 600 }}>
                        الكل (All)
                      </Typography>
                    ) : (
                      selected.map((selectedItem) => {
                        // Handle both object and primitive values
                        const selectedId = typeof selectedItem === 'object' ? selectedItem.value : selectedItem;
                        const item = getAdministrations().find(i => i.id === selectedId);
                        return (
                          <Chip key={selectedId} variant="soft" color="primary">
                            {item?.nameAr || item?.nameEn || selectedId}
                          </Chip>
                        );
                      })
                    )}
                  </Box>
                )}
                slotProps={{
                  listbox: {
                    sx: { maxHeight: 300, overflowY: "auto" }
                  }
                }}
              >
                {getAdministrations().map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.nameAr} ({item.nameEn})
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Department Selector - Shows for department and section levels */}
            {(reportScope.level === "department" || reportScope.level === "section") && (
              <FormControl sx={{ width: "100%" }}>
                <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
                  🏬 الدوائر (Departments)
                  {reportScope.departmentIds.length === 0 && " - الكل (All)"}
                </FormLabel>
                <Select
                  multiple
                  value={reportScope.departmentIds}
                  onChange={handleDepartmentChange}
                  disabled={loadingHierarchy}
                  placeholder="اختر الدوائر أو اتركه فارغاً للكل"
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {selected.length === 0 ? (
                        <Typography level="body-sm" sx={{ color: "#667eea", fontWeight: 600 }}>
                          الكل (All)
                        </Typography>
                      ) : (
                        selected.map((selectedItem) => {
                          // Handle both object and primitive values
                          const selectedId = typeof selectedItem === 'object' ? selectedItem.value : selectedItem;
                          const item = getDepartments().find(i => i.id === selectedId);
                          return (
                            <Chip key={selectedId} variant="soft" color="primary">
                              {item?.nameAr || item?.nameEn || selectedId}
                            </Chip>
                          );
                        })
                      )}
                    </Box>
                  )}
                  slotProps={{
                    listbox: {
                      sx: { maxHeight: 300, overflowY: "auto" }
                    }
                  }}
                >
                  {getDepartments().map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.nameAr} ({item.nameEn})
                    </Option>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Section Selector - Shows only for section level */}
            {reportScope.level === "section" && (
              <FormControl sx={{ width: "100%" }}>
                <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
                  🧩 الأقسام (Sections)
                  {reportScope.sectionIds.length === 0 && " - الكل (All)"}
                </FormLabel>
                <Select
                  multiple
                  value={reportScope.sectionIds}
                  onChange={handleSectionChange}
                  disabled={loadingHierarchy}
                  placeholder="اختر الأقسام أو اتركه فارغاً للكل"
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {selected.length === 0 ? (
                        <Typography level="body-sm" sx={{ color: "#667eea", fontWeight: 600 }}>
                          الكل (All)
                        </Typography>
                      ) : (
                        selected.map((selectedItem) => {
                          // Handle both object and primitive values
                          const selectedId = typeof selectedItem === 'object' ? selectedItem.value : selectedItem;
                          const item = getSections().find(i => i.id === selectedId);
                          return (
                            <Chip key={selectedId} variant="soft" color="primary">
                              {item?.nameAr || item?.nameEn || selectedId}
                            </Chip>
                          );
                        })
                      )}
                    </Box>
                  )}
                  slotProps={{
                    listbox: {
                      sx: { maxHeight: 300, overflowY: "auto" }
                    }
                  }}
                >
                  {getSections().map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.nameAr} ({item.nameEn})
                    </Option>
                  ))}
                </Select>
              </FormControl>
            )}

          </Box>
        )}
      </Box>

      {/* Date Mode Selection */}
      <Box sx={{ mb: 3, p: 2, background: "rgba(102, 126, 234, 0.05)", borderRadius: "8px" }}>
        <Typography level="body-sm" sx={{ mb: 2, fontWeight: 700 }}>
          اختر طريقة التصفية الزمنية (Select Time Filter Mode):
        </Typography>
        <RadioGroup
          value={filters.dateMode}
          onChange={(e) => handleDateModeChange(e.target.value)}
          orientation="horizontal"
          sx={{ gap: 3 }}
        >
          {reportType === "monthly" && (
            <>
              <Radio value="range" label="نطاق التاريخ (Date Range)" />
              <Radio value="month" label="شهر/سنة (Month/Year)" />
            </>
          )}
          {reportType === "seasonal" && (
            <Radio value="trimester" label="فصل/سنة (Trimester/Year)" />
          )}
        </RadioGroup>
        
        {/* Auto-sync info message */}
        <Typography 
          level="body-xs" 
          sx={{ 
            mt: 1.5, 
            color: "#667eea", 
            fontStyle: "italic",
            display: "flex",
            alignItems: "center",
            gap: 0.5
          }}
        >
          ℹ️ {reportType === "seasonal" 
            ? "يتم تحديد الفصل تلقائياً للتقارير الفصلية • Trimester mode is auto-selected for seasonal reports"
            : "الخيارات المتاحة للتقارير الشهرية فقط • Options available for monthly reports only"
          }
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Date Range - Show only if dateMode is 'range' */}
        {filters.dateMode === "range" && (
          <>
            <Grid xs={12} sm={6} md={3}>
              <FormControl error={isDateRangeInvalid}>
                <FormLabel sx={{ fontWeight: 600, mb: 1 }}>من تاريخ (From Date)</FormLabel>
                <Input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => handleChange("fromDate", e.target.value)}
                  color={isDateRangeInvalid ? "danger" : "neutral"}
                />
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <FormControl error={isDateRangeInvalid}>
                <FormLabel sx={{ fontWeight: 600, mb: 1 }}>إلى تاريخ (To Date)</FormLabel>
                <Input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => handleChange("toDate", e.target.value)}
                  color={isDateRangeInvalid ? "danger" : "neutral"}
                />
              </FormControl>
            </Grid>

            {/* Date Range Validation Error Message */}
            {isDateRangeInvalid && (
              <Grid xs={12}>
                <Alert
                  color="danger"
                  variant="soft"
                  startDecorator={<WarningIcon />}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.95rem"
                  }}
                >
                  <Box>
                    <Typography level="title-sm" sx={{ color: "danger.700", fontWeight: 700 }}>
                      ⚠️ خطأ في نطاق التاريخ (Invalid Date Range)
                    </Typography>
                    <Typography level="body-sm" sx={{ color: "danger.600" }}>
                      تاريخ البداية يجب أن يكون قبل تاريخ النهاية • From Date must be before To Date
                    </Typography>
                  </Box>
                </Alert>
              </Grid>
            )}
          </>
        )}

        {/* Month/Year - Show only if dateMode is 'month' */}
        {filters.dateMode === "month" && (
          <>
            <Grid xs={12} sm={6} md={3}>
              <FormControl>
                <FormLabel sx={{ fontWeight: 600, mb: 1 }}>الشهر (Month)</FormLabel>
                <Select
                  value={filters.month}
                  onChange={(e, value) => handleChange("month", value)}
                  disabled={reportType === "seasonal"}
                >
                  <Option value="">-- اختر شهر --</Option>
                  <Option value="1">يناير (January)</Option>
                  <Option value="2">فبراير (February)</Option>
                  <Option value="3">مارس (March)</Option>
                  <Option value="4">أبريل (April)</Option>
                  <Option value="5">مايو (May)</Option>
                  <Option value="6">يونيو (June)</Option>
                  <Option value="7">يوليو (July)</Option>
                  <Option value="8">أغسطس (August)</Option>
                  <Option value="9">سبتمبر (September)</Option>
                  <Option value="10">أكتوبر (October)</Option>
                  <Option value="11">نوفمبر (November)</Option>
                  <Option value="12">ديسمبر (December)</Option>
                </Select>
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <FormControl>
                <FormLabel sx={{ fontWeight: 600, mb: 1 }}>السنة (Year)</FormLabel>
                <Select
                  value={filters.year}
                  onChange={(e, value) => handleChange("year", value)}
                >
                  <Option value="">-- اختر سنة --</Option>
                  {years.map((year) => (
                    <Option key={year} value={year.toString()}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </>
        )}

        {/* Trimester/Year - Show only if dateMode is 'trimester' */}
        {filters.dateMode === "trimester" && (
          <>
            <Grid xs={12} sm={6} md={3}>
              <FormControl>
                <FormLabel sx={{ fontWeight: 600, mb: 1 }}>الفصل (Trimester)</FormLabel>
                <Select
                  value={filters.trimester}
                  onChange={(e, value) => handleChange("trimester", value)}
                  disabled={reportType === "monthly"}
                >
                  <Option value="">-- اختر فصل --</Option>
                  <Option value="Trim1">الفصل 1 (Jan-Mar)</Option>
                  <Option value="Trim2">الفصل 2 (Apr-Jun)</Option>
                  <Option value="Trim3">الفصل 3 (Jul-Sep)</Option>
                  <Option value="Trim4">الفصل 4 (Oct-Dec)</Option>
                </Select>
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <FormControl>
                <FormLabel sx={{ fontWeight: 600, mb: 1 }}>السنة (Year)</FormLabel>
                <Select
                  value={filters.year}
                  onChange={(e, value) => handleChange("year", value)}
                >
                  <Option value="">-- اختر سنة --</Option>
                  {years.map((year) => (
                    <Option key={year} value={year.toString()}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </>
        )}

        {/* Report Mode - Only for Monthly Reports */}
        {reportType === "monthly" && (
          <Grid xs={12} sm={6} md={3}>
            <FormControl>
              <FormLabel sx={{ fontWeight: 600, mb: 1 }}>نوع التقرير (Mode)</FormLabel>
              <Select
                value={filters.mode}
                onChange={(e, value) => handleChange("mode", value)}
              >
                <Option value="detailed">تفصيلي (Detailed)</Option>
                <Option value="numeric">رقمي (Numeric)</Option>
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>
    </Card>
  );
};

export default ReportFilters;
