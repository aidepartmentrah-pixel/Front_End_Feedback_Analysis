// src/components/reports/ReportTypeSwitch.js
import React from "react";
import { Box, Typography, Card } from "@mui/joy";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";

const isMonthlyContext = (reportType) =>
  reportType === "monthly";

const ReportTypeSwitch = ({ reportType, setReportType }) => {
  const monthlyActive = isMonthlyContext(reportType);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography level="h5" sx={{ mb: 2, fontWeight: 700, color: "#2BBCC4" }}>
        نوع التقرير
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Card
          onClick={() => setReportType("monthly")}
          sx={{
            flex: 1,
            p: 3,
            cursor: "pointer",
            border: monthlyActive ? "3px solid #2BBCC4" : "2px solid #e0e0e0",
            background: monthlyActive
              ? "linear-gradient(135deg, rgba(43, 188, 196, 0.1) 0%, rgba(100, 167, 11, 0.1) 100%)"
              : "white",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 16px rgba(43, 188, 196, 0.2)",
            },
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <CalendarMonthIcon
              sx={{ fontSize: 48, color: monthlyActive ? "#2BBCC4" : "#999" }}
            />
            <Typography level="h6" sx={{ fontWeight: 700, color: monthlyActive ? "#2BBCC4" : "#666" }}>
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
            border: reportType === "seasonal" ? "3px solid #2BBCC4" : "2px solid #e0e0e0",
            background: reportType === "seasonal"
              ? "linear-gradient(135deg, rgba(43, 188, 196, 0.1) 0%, rgba(100, 167, 11, 0.1) 100%)"
              : "white",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 16px rgba(43, 188, 196, 0.2)",
            },
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <DateRangeIcon
              sx={{ fontSize: 48, color: reportType === "seasonal" ? "#2BBCC4" : "#999" }}
            />
            <Typography level="h6" sx={{ fontWeight: 700, color: reportType === "seasonal" ? "#2BBCC4" : "#666" }}>
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
