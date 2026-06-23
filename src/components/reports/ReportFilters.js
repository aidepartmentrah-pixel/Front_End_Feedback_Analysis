// src/components/reports/ReportFilters.js
import React, { useMemo, useEffect } from "react";
import { Box, Card, Typography, FormControl, FormLabel, Input, Select, Option, Grid, Radio, RadioGroup, Chip, Alert, Autocomplete } from "@mui/joy";
import WarningIcon from "@mui/icons-material/Warning";

const ReportFilters = ({ 
  filters, 
  setFilters, 
  reportType, 
  hierarchy, 
  loadingHierarchy, 
  reportScope, 
  setReportScope, 
  onValidationChange,
  // Comparison props
  comparisonType,
  setComparisonType,
  selectedSeasons,
  setSelectedSeasons,
  availableQuarters,
  getRequiredSeasonCount,
  getSelectedQuarterNames
}) => {
  // Generate dynamic year list (current year + last 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i);

  // Auto-fix invalid date mode combinations when reportType changes
  useEffect(() => {
    if (reportType === "monthly") {
      if (filters.dateMode === "trimester") {
        setFilters(f => ({ ...f, dateMode: "month", trimester: "" }));
      }
    } else if (reportType === "seasonal") {
      if (filters.dateMode !== "trimester") {
        const currentTrimester = filters.trimester || "Q1";
        setFilters(f => ({
          ...f,
          dateMode: "trimester",
          month: "",
          fromDate: "",
          toDate: "",
          trimester: currentTrimester,
          year: f.year || new Date().getFullYear().toString()
        }));
      }
    } else if (reportType === "workflow_activity") {
      if (filters.dateMode !== "range") {
        setFilters(f => ({ ...f, dateMode: "range", trimester: "", month: "" }));
      }
    }
  }, [reportType, filters.dateMode, filters.trimester, filters.year, setFilters]);

  // When entering comparison mode, sync the year filter to the most recent year
  // found in availableQuarters so the chip pool and year dropdown are in sync.
  useEffect(() => {
    if (
      reportType === "seasonal" &&
      comparisonType !== "single" &&
      availableQuarters &&
      availableQuarters.length > 0
    ) {
      const latestYear = availableQuarters
        .map(q => {
          const name = q.name || q.SeasonName || "";
          const m = name.match(/\d{4}/);
          return m ? parseInt(m[0]) : 0;
        })
        .reduce((a, b) => (b > a ? b : a), 0);

      if (latestYear > 0) {
        setFilters(f => ({ ...f, year: latestYear.toString() }));
      }
    }
  }, [comparisonType, reportType, availableQuarters, setFilters]);

  // Date range validation - check if fromDate > toDate
  const isDateRangeInvalid = useMemo(() => {
    const usesDateRange =
      (reportType === "monthly" && filters.dateMode === "range") ||
      reportType === "workflow_activity";
    if (usesDateRange && filters.fromDate && filters.toDate) {
      return new Date(filters.fromDate) > new Date(filters.toDate);
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
              <Autocomplete
                multiple
                options={getAdministrations()}
                value={getAdministrations().filter(a => reportScope.administrationIds.includes(a.id))}
                onChange={(e, newValue) => {
                  setReportScope({
                    ...reportScope,
                    administrationIds: newValue.map(v => v.id),
                    departmentIds: [],
                    sectionIds: []
                  });
                }}
                getOptionLabel={(option) => `${option.nameAr} (${option.nameEn})`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                placeholder="اكتب للبحث... (Type to search)"
                disabled={loadingHierarchy}
                renderTags={(tags, getTagProps) =>
                  tags.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      variant="soft"
                      color="primary"
                      size="sm"
                    >
                      {option.nameAr}
                    </Chip>
                  ))
                }
                slotProps={{
                  listbox: { sx: { maxHeight: 300 } }
                }}
              />
            </FormControl>

            {/* Department Selector - Shows for department and section levels */}
            {(reportScope.level === "department" || reportScope.level === "section") && (
              <FormControl sx={{ width: "100%" }}>
                <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
                  🏬 الدوائر (Departments)
                  {reportScope.departmentIds.length === 0 && " - الكل (All)"}
                </FormLabel>
                <Autocomplete
                  multiple
                  options={getDepartments()}
                  value={getDepartments().filter(d => reportScope.departmentIds.includes(d.id))}
                  onChange={(e, newValue) => {
                    setReportScope({
                      ...reportScope,
                      departmentIds: newValue.map(v => v.id),
                      sectionIds: []
                    });
                  }}
                  getOptionLabel={(option) => `${option.nameAr} (${option.nameEn})`}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  placeholder="اكتب للبحث... (Type to search)"
                  disabled={loadingHierarchy}
                  renderTags={(tags, getTagProps) =>
                    tags.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        variant="soft"
                        color="primary"
                        size="sm"
                      >
                        {option.nameAr}
                      </Chip>
                    ))
                  }
                  slotProps={{
                    listbox: { sx: { maxHeight: 300 } }
                  }}
                />
              </FormControl>
            )}

            {/* Section Selector - Shows only for section level */}
            {reportScope.level === "section" && (
              <FormControl sx={{ width: "100%" }}>
                <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
                  🧩 الأقسام (Sections)
                  {reportScope.sectionIds.length === 0 && " - الكل (All)"}
                </FormLabel>
                <Autocomplete
                  multiple
                  options={getSections()}
                  value={getSections().filter(s => reportScope.sectionIds.includes(s.id))}
                  onChange={(e, newValue) => {
                    setReportScope({
                      ...reportScope,
                      sectionIds: newValue.map(v => v.id)
                    });
                  }}
                  getOptionLabel={(option) => `${option.nameAr} (${option.nameEn})`}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  placeholder="اكتب للبحث... (Type to search)"
                  disabled={loadingHierarchy}
                  renderTags={(tags, getTagProps) =>
                    tags.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        variant="soft"
                        color="primary"
                        size="sm"
                      >
                        {option.nameAr}
                      </Chip>
                    ))
                  }
                  slotProps={{
                    listbox: { sx: { maxHeight: 300 } }
                  }}
                />
              </FormControl>
            )}

          </Box>
        )}
      </Box>

      {/* Date Mode Selection — hidden for workflow_activity (always date range) */}
      {reportType !== "workflow_activity" && (
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
      )}

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
            {/* Comparison Type - Show only for seasonal reports */}
            {reportType === "seasonal" && comparisonType !== undefined && (
              <Grid xs={12} sm={6} md={3}>
                <FormControl>
                  <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
                    نوع التقرير (Report Type)
                  </FormLabel>
                  <Select
                    value={comparisonType}
                    onChange={(e, value) => setComparisonType && setComparisonType(value)}
                  >
                    <Option value="single">تقرير فصلي (Single)</Option>
                    <Option value="compare-2">مقارنة فصلين (2 Quarters)</Option>
                    <Option value="compare-3">مقارنة 3 فصول (3 Quarters)</Option>
                    <Option value="compare-4">مقارنة 4 فصول (4 Quarters)</Option>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Trimester — only for single-season mode */}
            {!(reportType === "seasonal" && comparisonType !== "single") && (
              <Grid xs={12} sm={6} md={3}>
                <FormControl required={reportType === "seasonal" && comparisonType === "single"}>
                  <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
                    الفصل (Trimester) {reportType === "seasonal" && comparisonType === "single" && <span style={{ color: "red" }}>*</span>}
                  </FormLabel>
                  <Select
                    value={filters.trimester}
                    onChange={(e, value) => handleChange("trimester", value)}
                    disabled={reportType === "monthly"}
                    placeholder="يجب اختيار فصل (Required)"
                    color={reportType === "seasonal" && comparisonType === "single" && !filters.trimester ? "danger" : "neutral"}
                  >
                    <Option value="Q1">الفصل الأول - Q1 (Jan-Mar)</Option>
                    <Option value="Q2">الفصل الثاني - Q2 (Apr-Jun)</Option>
                    <Option value="Q3">الفصل الثالث - Q3 (Jul-Sep)</Option>
                    <Option value="Q4">الفصل الرابع - Q4 (Oct-Dec)</Option>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Year — single mode uses hardcoded year list; comparison mode derives years from actual DB quarters */}
            {reportType !== "seasonal" || comparisonType === "single" ? (
              <Grid xs={12} sm={6} md={3}>
                <FormControl required={reportType === "seasonal" && comparisonType === "single"}>
                  <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
                    السنة (Year) {reportType === "seasonal" && comparisonType === "single" && <span style={{ color: "red" }}>*</span>}
                  </FormLabel>
                  <Select
                    value={filters.year}
                    onChange={(e, value) => handleChange("year", value)}
                    placeholder="يجب اختيار سنة (Required)"
                    color={reportType === "seasonal" && comparisonType === "single" && !filters.year ? "danger" : "neutral"}
                  >
                    {years.map((year) => (
                      <Option key={year} value={year.toString()}>
                        {year}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ) : (
              /* Comparison mode: year list derived from actual available quarters in DB */
              <Grid xs={12} sm={6} md={3}>
                <FormControl>
                  <FormLabel sx={{ fontWeight: 600, mb: 1 }}>السنة (Year)</FormLabel>
                  <Select
                    value={filters.year}
                    onChange={(e, value) => {
                      handleChange("year", value);
                      // Clear chip selection when year context changes
                      if (setSelectedSeasons) setSelectedSeasons([]);
                    }}
                  >
                    {/* Extract unique years from available quarters, sorted most-recent-first */}
                    {availableQuarters && [...new Set(
                      availableQuarters
                        .map(q => {
                          const name = q.name || q.SeasonName || "";
                          const m = name.match(/\d{4}/);
                          return m ? m[0] : null;
                        })
                        .filter(Boolean)
                    )]
                      .sort((a, b) => b - a)
                      .map(yr => (
                        <Option key={yr} value={yr}>{yr}</Option>
                      ))
                    }
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Quarter Selection — improved slot-based UI for comparison modes */}
            {reportType === "seasonal" && comparisonType !== "single" && comparisonType !== undefined && availableQuarters && availableQuarters.length > 0 && (
              <Grid xs={12}>
                <Box
                  sx={{
                    p: 2.5,
                    background: "rgba(102, 126, 234, 0.04)",
                    borderRadius: "10px",
                    border: "1px solid rgba(102, 126, 234, 0.18)",
                  }}
                >
                  {/* Header row: label + progress badge */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography level="body-sm" sx={{ fontWeight: 700, color: "#444" }}>
                      اختر {getRequiredSeasonCount && getRequiredSeasonCount()} فصول (Select {getRequiredSeasonCount && getRequiredSeasonCount()} Quarters):
                    </Typography>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.3,
                        borderRadius: "99px",
                        background:
                          selectedSeasons && selectedSeasons.length === (getRequiredSeasonCount ? getRequiredSeasonCount() : 1)
                            ? "rgba(34, 197, 94, 0.12)"
                            : "rgba(102, 126, 234, 0.1)",
                        border:
                          selectedSeasons && selectedSeasons.length === (getRequiredSeasonCount ? getRequiredSeasonCount() : 1)
                            ? "1px solid rgba(34, 197, 94, 0.4)"
                            : "1px solid rgba(102, 126, 234, 0.25)",
                      }}
                    >
                      <Typography
                        level="body-xs"
                        sx={{
                          fontWeight: 700,
                          color:
                            selectedSeasons && selectedSeasons.length === (getRequiredSeasonCount ? getRequiredSeasonCount() : 1)
                              ? "#16a34a"
                              : "#667eea",
                        }}
                      >
                        {selectedSeasons ? selectedSeasons.length : 0} / {getRequiredSeasonCount ? getRequiredSeasonCount() : 1}
                        {selectedSeasons && selectedSeasons.length === (getRequiredSeasonCount ? getRequiredSeasonCount() : 1) ? " ✓" : ""}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Numbered slot boxes */}
                  <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                    {Array.from({ length: getRequiredSeasonCount ? getRequiredSeasonCount() : 1 }).map((_, slotIndex) => {
                      const selectedId = selectedSeasons ? selectedSeasons[slotIndex] : undefined;
                      const quarter = selectedId
                        ? availableQuarters.find(q => (q.season_id || q.SeasonID) === selectedId)
                        : null;
                      const quarterName = quarter ? (quarter.name || quarter.SeasonName) : null;

                      return (
                        <Box
                          key={slotIndex}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            px: 1.5,
                            py: 0.75,
                            borderRadius: "8px",
                            minWidth: 120,
                            border: quarterName
                              ? "2px solid #667eea"
                              : "2px dashed rgba(102, 126, 234, 0.3)",
                            background: quarterName
                              ? "rgba(102, 126, 234, 0.09)"
                              : "rgba(0, 0, 0, 0.02)",
                            transition: "all 0.18s ease",
                          }}
                        >
                          <Typography
                            level="body-xs"
                            sx={{
                              fontWeight: 800,
                              color: quarterName ? "#667eea" : "rgba(102,126,234,0.4)",
                              minWidth: 16,
                              textAlign: "center",
                            }}
                          >
                            {slotIndex + 1}
                          </Typography>
                          <Typography
                            level="body-sm"
                            sx={{
                              fontWeight: 600,
                              color: quarterName ? "#333" : "#ccc",
                              flex: 1,
                              textAlign: "center",
                            }}
                          >
                            {quarterName || "── ──"}
                          </Typography>
                          {quarterName && (
                            <Box
                              onClick={() =>
                                setSelectedSeasons &&
                                setSelectedSeasons(selectedSeasons.filter(id => id !== selectedId))
                              }
                              sx={{
                                cursor: "pointer",
                                color: "#bbb",
                                fontSize: "13px",
                                fontWeight: 700,
                                lineHeight: 1,
                                ml: 0.25,
                                "&:hover": { color: "#e53e3e" },
                              }}
                            >
                              ✕
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Divider with label */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <Box sx={{ flex: 1, height: "1px", background: "rgba(102, 126, 234, 0.15)" }} />
                    <Typography
                      level="body-xs"
                      sx={{
                        color: "#aaa",
                        fontWeight: 600,
                        fontSize: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.6px",
                      }}
                    >
                      الفصول المتاحة
                    </Typography>
                    <Box sx={{ flex: 1, height: "1px", background: "rgba(102, 126, 234, 0.15)" }} />
                  </Box>

                  {/* Available quarter chips — filtered by selected year (year ≤ context year, last 8), selected ones hidden */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {availableQuarters
                      .filter(q => {
                        if (!filters.year) return true;
                        const name = q.name || q.SeasonName || "";
                        const m = name.match(/\d{4}/);
                        if (!m) return true;
                        return parseInt(m[0]) <= parseInt(filters.year);
                      })
                      .slice(0, 8)
                      .map((quarter) => {
                        const quarterId = quarter.season_id || quarter.SeasonID;
                        const quarterName = quarter.name || quarter.SeasonName;
                        const isSelected = selectedSeasons && selectedSeasons.includes(quarterId);
                        const isFull =
                          selectedSeasons &&
                          selectedSeasons.length >= (getRequiredSeasonCount ? getRequiredSeasonCount() : 1);

                        if (isSelected) return null;

                        return (
                          <Chip
                            key={quarterId}
                            variant="outlined"
                            color="neutral"
                            onClick={() => {
                              if (!setSelectedSeasons || isFull) return;
                              setSelectedSeasons([...selectedSeasons, quarterId]);
                            }}
                            sx={{
                              cursor: isFull ? "default" : "pointer",
                              opacity: isFull ? 0.38 : 1,
                              fontSize: "13px",
                              fontWeight: 500,
                              borderRadius: "6px",
                              transition: "all 0.15s",
                              "&:hover": isFull
                                ? {}
                                : {
                                    background: "rgba(102, 126, 234, 0.1)",
                                    borderColor: "#667eea",
                                    color: "#667eea",
                                  },
                            }}
                          >
                            {quarterName}
                          </Chip>
                        );
                      })}
                  </Box>

                  {/* Completion confirmation */}
                  {selectedSeasons &&
                    selectedSeasons.length === (getRequiredSeasonCount ? getRequiredSeasonCount() : 1) && (
                      <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Typography level="body-xs" sx={{ color: "#16a34a", fontWeight: 700 }}>
                          ✓ محدد (Selected):
                        </Typography>
                        <Typography level="body-xs" sx={{ color: "#555" }}>
                          {getSelectedQuarterNames && getSelectedQuarterNames()}
                        </Typography>
                      </Box>
                    )}
                </Box>
              </Grid>
            )}

            {/* Validation Warning for Single Seasonal Reports */}
            {reportType === "seasonal" && comparisonType === "single" && (!filters.trimester || !filters.year) && (
              <Grid xs={12}>
                <Alert
                  color="warning"
                  variant="soft"
                  startDecorator={<WarningIcon />}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.95rem"
                  }}
                >
                  <Box>
                    <Typography level="title-sm" sx={{ color: "warning.700", fontWeight: 700 }}>
                      ⚠️ مطلوب: يجب اختيار الفصل والسنة (Required: Trimester and Year must be selected)
                    </Typography>
                    <Typography level="body-sm" sx={{ color: "warning.600" }}>
                      لا يمكن توليد التقرير الفصلي بدون تحديد الفصل والسنة • Cannot generate seasonal report without selecting trimester and year
                    </Typography>
                  </Box>
                </Alert>
              </Grid>
            )}
          </>
        )}

        {/* Report Mode - Only for Monthly Reports (not workflow_activity) */}
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
