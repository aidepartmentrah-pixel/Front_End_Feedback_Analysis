// src/pages/DashboardPage.js
import React, { useEffect, useState } from "react";
import { Container, Grid, Typography } from "@mui/material";
import axios from "axios";

// Components
import MainLayout from "../components/common/MainLayout";
import MetricCard from "../components/dashboard/MetricCard";
import ChartCard from "../components/dashboard/ChartCard";
import DashboardActions from "../components/dashboard/DashboardActions";
import Top5ClassificationChart from "../components/dashboard/Top5ClassificationChart";
import StageHistogram from "../components/dashboard/StageHistogram";
import IssuingDeptBarGraph from "../components/dashboard/IssuingDeptBarGraph";


// Mock Metrics
const mockMetrics = {
  totalIncidents: 124,
  openClosed: { open: 32, closed: 92 },
  severityBreakdown: { high: 15, medium: 50, low: 59 },
  recentIncidents: 12
};

// Mock Charts Data
const mockChartsData = {
  top5Classification: [
    { classification: "Neglect - General", count: 30 },
    { classification: "Absent Communication", count: 25 },
    { classification: "Accomodation", count: 20 },
    { classification: "Bureaucracy", count: 15 },
    { classification: "Clinical Delay", count: 10 }
  ],
  stageHistogram: [
    { stage: "Admission", count: 40 },
    { stage: "Care", count: 60 },
    { stage: "Discharge", count: 24 }
  ],
  issuingDept: [
    { department: "ER", count: 50 },
    { department: "ICU", count: 30 },
    { department: "Ward 1", count: 20 },
    { department: "Ward 2", count: 24 }
  ]
};



const DashboardPage = () => {
  // State for metrics
  const [metrics, setMetrics] = useState({
    totalIncidents: 0,
    openClosed: { open: 0, closed: 0 },
    severityBreakdown: { high: 0, medium: 0, low: 0 },
    recentIncidents: 0
  });
  
  // State for charts
  const [chartsData, setChartsData] = useState({
    top5Classification: [],
    stageHistogram: [],
    issuingDept: []
  });

   // MOCK DATA (for testing without backend)
  useEffect(() => {
    setMetrics(mockMetrics);
    setChartsData(mockChartsData);
  }, []);


  // useEffect(() => {
  //   // Fetch metrics
  //   const fetchMetrics = async () => {
  //     try {
  //       const totalRes = await axios.get("/metrics/total-incidents");
  //       const openClosedRes = await axios.get("/metrics/open-closed-count");
  //       const severityRes = await axios.get("/metrics/severity-breakdown");
  //       const recentRes = await axios.get("/metrics/recent-incidents?days=30");

  //       setMetrics({
  //         totalIncidents: totalRes.data,
  //         openClosed: openClosedRes.data,
  //         severityBreakdown: severityRes.data,
  //         recentIncidents: recentRes.data
  //       });
  //     } catch (err) {
  //       console.error("Error fetching metrics:", err);
  //     }
  //   };


  //   // Fetch chart data
  //   const fetchCharts = async () => {
  //     try {
  //       const top5Res = await axios.get("/charts/top5-classification");
  //       const stageRes = await axios.get("/charts/stage-histogram");
  //       const deptRes = await axios.get("/charts/issuing-dept");

  //       setChartsData({
  //         top5Classification: top5Res.data,
  //         stageHistogram: stageRes.data,
  //         issuingDept: deptRes.data
  //       });
  //     } catch (err) {
  //       console.error("Error fetching charts:", err);
  //     }
  //   };

  //   fetchMetrics();
  //   fetchCharts();
  // }, []);

  return (
    <MainLayout>
      <Container maxWidth="xl" style={{ marginTop: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        {/* Top Row: Metrics */}
        <Grid container spacing={2} style={{ marginBottom: "20px" }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard title="Total Incidents" value={metrics.totalIncidents} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Open / Closed"
              value={`${metrics.openClosed.open} / ${metrics.openClosed.closed}`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Severity Breakdown"
              value={`H:${metrics.severityBreakdown.high} M:${metrics.severityBreakdown.medium} L:${metrics.severityBreakdown.low}`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Recent Incidents (30d)"
              value={metrics.recentIncidents}
            />
          </Grid>
        </Grid>

        {/* Middle Row: Charts */}
        <Grid container spacing={2} style={{ marginBottom: "20px" }}>
          <Grid item xs={12} md={4}>
            <ChartCard title="Top 5 Classifications">
              <Top5ClassificationChart data={chartsData.top5Classification} />
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <ChartCard title="Stage Histogram">
              <StageHistogram data={chartsData.stageHistogram} />
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <ChartCard title="Issuing Department">
              <IssuingDeptBarGraph data={chartsData.issuingDept} />
            </ChartCard>
          </Grid>
        </Grid>

        {/* Bottom Row: Actions */}
        <DashboardActions />
      </Container>
    </MainLayout>
  );
  
};

export default DashboardPage;
