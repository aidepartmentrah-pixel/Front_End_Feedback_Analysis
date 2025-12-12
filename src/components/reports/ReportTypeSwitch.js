// src/components/reports/ReportTypeSwitch.js
import React from "react";
import { Box, Typography, Card } from "@mui/joy";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";

const ReportTypeSwitch = ({ reportType, setReportType }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography level="h5" sx={{ mb: 2, fontWeight: 700, color: "#667eea" }}>
        نوع التقرير
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Card
          onClick={() => setReportType("monthly")}
          sx={{
            flex: 1,
            p: 3,
            cursor: "pointer",
            border: reportType === "monthly" ? "3px solid #667eea" : "2px solid #e0e0e0",
            background: reportType === "monthly"
              ? "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)"
              : "white",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 16px rgba(102, 126, 234, 0.2)",
            },
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <CalendarMonthIcon
              sx={{ fontSize: 48, color: reportType === "monthly" ? "#667eea" : "#999" }}
            />
            <Typography level="h6" sx={{ fontWeight: 700, color: reportType === "monthly" ? "#667eea" : "#666" }}>
              تقرير شهري (Monthly)
            </Typography>
            <Typography level="body-sm" sx={{ textAlign: "center", color: "#999" }}>
              تقارير تفصيلية أو رقمية شهرية
            </Typography>
          </Box>
        </Card>

        <Card
          onClick={() => setReportType("seasonal")}
          sx={{
            flex: 1,
            p: 3,
            cursor: "pointer",
            border: reportType === "seasonal" ? "3px solid #667eea" : "2px solid #e0e0e0",
            background: reportType === "seasonal"
              ? "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)"
              : "white",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 16px rgba(102, 126, 234, 0.2)",
            },
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <DateRangeIcon
              sx={{ fontSize: 48, color: reportType === "seasonal" ? "#667eea" : "#999" }}
            />
            <Typography level="h6" sx={{ fontWeight: 700, color: reportType === "seasonal" ? "#667eea" : "#666" }}>
              تقرير فصلي (Seasonal)
            </Typography>
            <Typography level="body-sm" sx={{ textAlign: "center", color: "#999" }}>
              تحليل HCAT وفق العتبات المحددة
            </Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default ReportTypeSwitch;
