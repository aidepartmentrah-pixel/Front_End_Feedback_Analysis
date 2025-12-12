// src/components/reports/ReportFilters.js
import React from "react";
import { Box, Card, Typography, FormControl, FormLabel, Input, Select, Option, Grid, Radio, RadioGroup } from "@mui/joy";

const ReportFilters = ({ filters, setFilters, reportType }) => {
  const handleChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
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
      </Box>

      <Grid container spacing={2}>
        {/* Date Range - Show only if dateMode is 'range' */}
        {filters.dateMode === "range" && (
          <>
            <Grid xs={12} sm={6} md={3}>
              <FormControl>
                <FormLabel sx={{ fontWeight: 600, mb: 1 }}>من تاريخ (From Date)</FormLabel>
                <Input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => handleChange("fromDate", e.target.value)}
                />
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <FormControl>
                <FormLabel sx={{ fontWeight: 600, mb: 1 }}>إلى تاريخ (To Date)</FormLabel>
                <Input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => handleChange("toDate", e.target.value)}
                />
              </FormControl>
            </Grid>
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
                  <Option value="2025">2025</Option>
                  <Option value="2024">2024</Option>
                  <Option value="2023">2023</Option>
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
                  <Option value="2025">2025</Option>
                  <Option value="2024">2024</Option>
                  <Option value="2023">2023</Option>
                </Select>
              </FormControl>
            </Grid>
          </>
        )}

        {/* Building */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl>
            <FormLabel sx={{ fontWeight: 600, mb: 1 }}>المبنى (Building)</FormLabel>
            <Select
              value={filters.building}
              onChange={(e, value) => handleChange("building", value)}
            >
              <Option value="">الكل (All)</Option>
              <Option value="Building A">Building A</Option>
              <Option value="Building B">Building B</Option>
            </Select>
          </FormControl>
        </Grid>

        {/* إدارة */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl>
            <FormLabel sx={{ fontWeight: 600, mb: 1 }}>إدارة (Administration)</FormLabel>
            <Select
              value={filters.idara}
              onChange={(e, value) => handleChange("idara", value)}
            >
              <Option value="">الكل (All)</Option>
              <Option value="Nursing Administration">Nursing Administration</Option>
              <Option value="Medical Administration">Medical Administration</Option>
              <Option value="Support Services">Support Services</Option>
            </Select>
          </FormControl>
        </Grid>

        {/* دائرة */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl>
            <FormLabel sx={{ fontWeight: 600, mb: 1 }}>دائرة (Department)</FormLabel>
            <Select
              value={filters.dayra}
              onChange={(e, value) => handleChange("dayra", value)}
            >
              <Option value="">الكل (All)</Option>
              <Option value="Emergency Nursing Dept">Emergency Nursing Dept</Option>
              <Option value="Inpatient Nursing Dept">Inpatient Nursing Dept</Option>
              <Option value="Diagnostic Services">Diagnostic Services</Option>
              <Option value="Surgical Services">Surgical Services</Option>
              <Option value="Pharmacy Services">Pharmacy Services</Option>
              <Option value="Pediatric Services">Pediatric Services</Option>
            </Select>
          </FormControl>
        </Grid>

        {/* قسم */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl>
            <FormLabel sx={{ fontWeight: 600, mb: 1 }}>قسم (Section)</FormLabel>
            <Select
              value={filters.qism}
              onChange={(e, value) => handleChange("qism", value)}
            >
              <Option value="">الكل (All)</Option>
              <Option value="Emergency Department">Emergency Department</Option>
              <Option value="ICU">ICU</Option>
              <Option value="Cardiology">Cardiology</Option>
              <Option value="Radiology">Radiology</Option>
              <Option value="General Surgery">General Surgery</Option>
              <Option value="Pediatrics">Pediatrics</Option>
              <Option value="Outpatient Pharmacy">Outpatient Pharmacy</Option>
            </Select>
          </FormControl>
        </Grid>

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
