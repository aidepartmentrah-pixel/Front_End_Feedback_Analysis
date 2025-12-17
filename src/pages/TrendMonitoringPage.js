// src/pages/TrendMonitoringPage.js
import React from "react";
import { Box, Typography, Divider, Button } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MainLayout from "../components/common/MainLayout";
import DomainTrendTable from "../components/trendMonitoring/DomainTrendTable";
import CombinedDomainChart from "../components/trendMonitoring/CombinedDomainChart";
import CategoryTrendTable from "../components/trendMonitoring/CategoryTrendTable";
import CombinedCategoryChart from "../components/trendMonitoring/CombinedCategoryChart";

const TrendMonitoringPage = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Back Button */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            color="neutral"
            startDecorator={<ArrowBackIcon />}
            onClick={() => navigate("/")}
            sx={{ fontWeight: 600 }}
          >
            عودة إلى لوحة القيادة (Back to Dashboard)
          </Button>
        </Box>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            level="h2"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            📊 مراقبة الاتجاهات (Trend Monitoring)
          </Typography>
          <Typography level="body-md" sx={{ color: "#666" }}>
            تتبع الاتجاهات الشهرية للحوادث لاكتشاف التدهور والتحسين المبكر
          </Typography>
        </Box>

        {/* Domain Analysis Section */}
        <Box sx={{ mb: 5 }}>
          {/* Domain Chart - Above Table */}
          <CombinedDomainChart />

          {/* Domain Table - Collapsible */}
          <DomainTrendTable />
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Category Analysis Section */}
        <Box sx={{ mb: 3 }}>
          {/* Category Chart - Above Table */}
          <CombinedCategoryChart />

          {/* Category Table - Collapsible */}
          <CategoryTrendTable />
        </Box>
      </Box>
    </MainLayout>
  );
};

export default TrendMonitoringPage;
