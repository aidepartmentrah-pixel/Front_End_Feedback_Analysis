// src/pages/TrendMonitoringPage.js
import React, { useState, useEffect } from "react";
import { Box, Typography, Divider, Button, Card, CircularProgress, Select, Option } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MainLayout from "../components/common/MainLayout";
import DomainTrendChart from "../components/trendMonitoring/DomainTrendChart";
import DomainTrendTable from "../components/trendMonitoring/DomainTrendTable";
import CategoryTrendChart from "../components/trendMonitoring/CategoryTrendChart";
import CategoryTrendTable from "../components/trendMonitoring/CategoryTrendTable";
import ClassificationTrendChart from "../components/trendMonitoring/ClassificationTrendChart";
import ClassificationTrendTable from "../components/trendMonitoring/ClassificationTrendTable";
import { fetchTrendsByScope } from "../api/trends";

const TrendMonitoringPage = () => {
  const navigate = useNavigate();
  
  // Scope selection
  const [scope, setScope] = useState("hospital");
  
  // Trends data
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================
  // FETCH TRENDS BY SCOPE
  // ============================
  useEffect(() => {
    console.log("🔄 Fetching trends for scope:", scope);
    setLoading(true);
    setError(null);

    fetchTrendsByScope({ scope })
      .then((data) => {
        console.log("✅ Trends loaded successfully:", data);
        setTrendsData(data);
      })
      .catch((err) => {
        console.error("❌ Failed to load trends:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [scope]);

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

        {/* Scope Selector */}
        <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: "8px", display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <Typography level="body-sm" sx={{ fontWeight: 600 }}>Scope:</Typography>
          <Select 
            size="sm" 
            value={scope} 
            onChange={(e, value) => setScope(value)}
            sx={{ minWidth: 150 }}
          >
            <Option value="hospital">🏥 Hospital</Option>
            <Option value="administration">📋 Administration</Option>
            <Option value="department">🏢 Department</Option>
            <Option value="section">📌 Section</Option>
          </Select>
        </Box>

        {/* Display time range if data is loaded */}
        {trendsData?.time_range && (
          <Typography level="body-sm" sx={{ color: "#999", mb: 3 }}>
            📅 {trendsData.time_range.start} to {trendsData.time_range.end}
          </Typography>
        )}

        {/* Loading State */}
        {loading && (
          <Card sx={{ p: 4, textAlign: "center", mb: 3 }}>
            <CircularProgress size="lg" />
            <Typography level="body-md" sx={{ mt: 2 }}>
              Loading trend data...
            </Typography>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card sx={{ p: 3, mb: 3, bgcolor: "danger.softBg" }}>
            <Typography color="danger">
              ❌ Error loading trends: {error}
            </Typography>
          </Card>
        )}

        {/* Domain Trends Section */}
        {!loading && !error && trendsData?.domain && (
          <Box sx={{ mb: 5 }}>
            <Typography level="h4" sx={{ mb: 2, color: "#667eea", fontWeight: 700 }}>
              🔬 Domain Trends (Clinical, Management, Relational)
            </Typography>
            <DomainTrendChart data={trendsData.domain} />
            <DomainTrendTable data={trendsData.domain} />
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        {/* Category Trends Section */}
        {!loading && !error && trendsData?.category && (
          <Box sx={{ mb: 5 }}>
            <Typography level="h4" sx={{ mb: 2, color: "#667eea", fontWeight: 700 }}>
              📑 Category Trends
            </Typography>
            <CategoryTrendChart data={trendsData.category} />
            <CategoryTrendTable data={trendsData.category} />
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        {/* Classification Trends Section */}
        {!loading && !error && trendsData?.classification && (
          <Box sx={{ mb: 5 }}>
            <Typography level="h4" sx={{ mb: 2, color: "#667eea", fontWeight: 700 }}>
              🏷️ Classification Trends
            </Typography>
            <ClassificationTrendChart data={trendsData.classification} />
            <ClassificationTrendTable data={trendsData.classification} />
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default TrendMonitoringPage;
