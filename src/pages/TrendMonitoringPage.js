// src/pages/TrendMonitoringPage.js
import React, { useState, useEffect } from "react";
import { Box, Typography, Divider, Button, Card, CircularProgress } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MainLayout from "../components/common/MainLayout";
import DomainTrendTable from "../components/trendMonitoring/DomainTrendTable";
import CombinedDomainChart from "../components/trendMonitoring/CombinedDomainChart";
import CategoryTrendTable from "../components/trendMonitoring/CategoryTrendTable";
import CombinedCategoryChart from "../components/trendMonitoring/CombinedCategoryChart";
import { fetchDomainTrends } from "../api/trends";

const TrendMonitoringPage = () => {
  const navigate = useNavigate();
  
  // State for domain trends data
  const [domainData, setDomainData] = useState(null);
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [domainError, setDomainError] = useState(null);
  
  // Date range filters (optional - can be added later)
  const [dateRange, setDateRange] = useState({
    start_date: null, // Will default to 12 months ago on backend
    end_date: null,   // Will default to current month on backend
  });

  // ============================
  // FETCH DOMAIN TRENDS
  // ============================
  useEffect(() => {
    console.log("🔄 Fetching domain trends...");
    setLoadingDomains(true);
    setDomainError(null);

    fetchDomainTrends({
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
      include_zero_months: true,
      include_inactive_domains: false,
      calculate_trends: true,
    })
      .then((data) => {
        console.log("✅ Domain trends loaded successfully:", data);
        setDomainData(data);
      })
      .catch((error) => {
        console.error("❌ Failed to load domain trends:", error);
        setDomainError(error.message);
      })
      .finally(() => setLoadingDomains(false));
  }, [dateRange]);

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
          
          {/* Display time range if data is loaded */}
          {domainData?.time_range && (
            <Typography level="body-sm" sx={{ color: "#999", mt: 1 }}>
              📅 {domainData.time_range.start_label} - {domainData.time_range.end_label} 
              ({domainData.time_range.total_months} months)
            </Typography>
          )}
        </Box>

        {/* Loading State */}
        {loadingDomains && (
          <Card sx={{ p: 4, textAlign: "center", mb: 3 }}>
            <CircularProgress size="lg" />
            <Typography level="body-md" sx={{ mt: 2 }}>
              Loading trend data...
            </Typography>
          </Card>
        )}

        {/* Error State */}
        {domainError && (
          <Card sx={{ p: 3, mb: 3, bgcolor: "danger.softBg" }}>
            <Typography color="danger">
              ❌ Error loading trends: {domainError}
            </Typography>
          </Card>
        )}

        {/* Domain Analysis Section */}
        {!loadingDomains && !domainError && domainData && (
          <Box sx={{ mb: 5 }}>
            {/* Domain Chart - Above Table */}
            <CombinedDomainChart data={domainData} />

            {/* Domain Table - Collapsible */}
            <DomainTrendTable data={domainData} />
          </Box>
        )}

        <Divider sx={{ my: 5 }} />

        {/* Category Analysis Section */}
        <Box sx={{ mb: 3 }}>
          <Typography level="h4" sx={{ mb: 2, color: "#667eea", fontWeight: 700 }}>
            Category Trends (Coming Soon)
          </Typography>
          {/* Category Chart - Above Table */}
          {/* <CombinedCategoryChart /> */}

          {/* Category Table - Collapsible */}
          {/* <CategoryTrendTable /> */}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default TrendMonitoringPage;
