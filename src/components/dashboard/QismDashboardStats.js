// src/components/dashboard/QismDashboardStats.js
import React, { useState } from "react";
import { Grid, Box, Typography, Card, Alert, Modal, ModalDialog, Sheet } from "@mui/joy";
import MetricCard from "./MetricCard";
import DashboardSection from "./DashboardSection";
import ChartCard from "./ChartCard";
import Top5ClassificationChart from "./Top5ClassificationChart";
import UniversalChart from "./UniversalChart";
import InfoIcon from "@mui/icons-material/Info";
import BarChartIcon from "@mui/icons-material/BarChart";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";

const QismDashboardStats = ({ qism, stats, loading, operationalSummary = null }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", data: [] });

  // Use real API data if available, otherwise use default empty data
  const metrics = stats?.metrics || {
    totalIncidents: 0,
    uniquePatients: 0,
    openClosed: { open: 0, closed: 0, forciblyClosed: 0 },
    severityBreakdown: { high: 0, medium: 0, low: 0 },
    domainBreakdown: { clinical: 0, management: 0, relational: 0 },
    redFlags: 0
  };

  const trends = stats?.trends || {
    incidentsPatients: { value: 0, direction: "neutral" },
    openClosed: { value: 0, direction: "neutral" },
    severity: { value: 0, direction: "neutral" },
    domain: { value: 0, direction: "neutral" },
    redFlags: { value: 0, direction: "neutral" }
  };

  const charts = stats?.charts || {
    top5Classification: []
  };

  // Distribution histograms (Session 5) - read directly off the backend response
  const distributionCharts = {
    severity: stats?.charts?.severity?.data || [],
    harm: stats?.charts?.harm?.data || [],
    category: stats?.charts?.category?.data || [],
    subcategory: stats?.charts?.subcategory?.data || [],
  };

  // Skip the old mock data object
const _oldMockData = {
  er_triage: {
    metrics: {
      totalIncidents: 12,
      uniquePatients: 11,
      openClosed: { open: 3, closed: 9, forciblyClosed: 1 },
      severityBreakdown: { high: 2, medium: 5, low: 5 },
      domainBreakdown: { clinical: 8, management: 3, relational: 1 },
      redFlags: 1
    },
    trends: {
      incidentsPatients: { value: 14, direction: "up" },
      openClosed: { value: 25, direction: "down" },
      severity: { value: 6, direction: "up" },
      domain: { value: 3, direction: "up" },
      redFlags: { value: 0, direction: "down" }
    },
    charts: {
      top5Classification: [
        { classification: "Triage Delay", count: 5 },
        { classification: "Patient Assessment Gap", count: 3 },
        { classification: "Documentation Issue", count: 2 },
        { classification: "Communication Gap", count: 1 },
        { classification: "Equipment Issue", count: 1 }
      ]
    },
    recentActivity: [
      {
        timestamp: new Date(Date.now() - 15 * 60000),
        description: "Triage delay - High acuity patient waiting 45 mins",
        severity: "High",
        status: "Open"
      },
      {
        timestamp: new Date(Date.now() - 120 * 60000),
        description: "Patient assessment completed - Documentation updated",
        severity: "Low",
        status: "Closed"
      }
    ]
  },
  maternity: {
    metrics: {
      totalIncidents: 8,
      uniquePatients: 7,
      openClosed: { open: 2, closed: 6, forciblyClosed: 1 },
      severityBreakdown: { high: 1, medium: 3, low: 4 },
      domainBreakdown: { clinical: 5, management: 2, relational: 1 },
      redFlags: 0
    },
    trends: {
      incidentsPatients: { value: 11, direction: "down" },
      openClosed: { value: 33, direction: "down" },
      severity: { value: 4, direction: "down" },
      domain: { value: 1, direction: "down" },
      redFlags: { value: 0, direction: "down" }
    },
    charts: {
      top5Classification: [
        { classification: "Pain Management", count: 3 },
        { classification: "Patient Fall", count: 2 },
        { classification: "Medication Delay", count: 1 },
        { classification: "Hygiene Issue", count: 1 },
        { classification: "Call Response", count: 1 }
      ]
    },
    recentActivity: [
      {
        timestamp: new Date(Date.now() - 40 * 60000),
        description: "Pain management request - Epidural timing issue",
        severity: "Medium",
        status: "Pending"
      },
      {
        timestamp: new Date(Date.now() - 160 * 60000),
        description: "Room hygiene improved after staff feedback",
        severity: "Low",
        status: "Closed"
      }
    ]
  },
  icu_adult: {
    metrics: {
      totalIncidents: 11,
      uniquePatients: 9,
      openClosed: { open: 3, closed: 8, forciblyClosed: 1 },
      severityBreakdown: { high: 2, medium: 5, low: 4 },
      domainBreakdown: { clinical: 8, management: 2, relational: 1 },
      redFlags: 1
    },
    trends: {
      incidentsPatients: { value: 8, direction: "up" },
      openClosed: { value: 20, direction: "down" },
      severity: { value: 5, direction: "up" },
      domain: { value: 2, direction: "up" },
      redFlags: { value: 50, direction: "up" }
    },
    charts: {
      top5Classification: [
        { classification: "Ventilator Issue", count: 4 },
        { classification: "Medication Error", count: 3 },
        { classification: "Equipment Failure", count: 2 },
        { classification: "Documentation Gap", count: 1 },
        { classification: "Communication Issue", count: 1 }
      ]
    },
    recentActivity: [
      {
        timestamp: new Date(Date.now() - 22 * 60000),
        description: "Ventilator alarm - Bed 3 - Immediate attention needed",
        severity: "High",
        status: "Open"
      },
      {
        timestamp: new Date(Date.now() - 135 * 60000),
        description: "Equipment failure resolved - Backup monitor deployed",
        severity: "Medium",
        status: "Closed"
      }
    ]
  }
};

  const handleChartClick = (item) => {
    const title = `Incidents: ${item.classification}`;
    const data = [
      { label: "Total Count", value: item.count },
      { label: "This Week", value: Math.floor(item.count * 0.4) },
      { label: "Avg. Resolution", value: "1.8 days" },
      { label: "Action Items", value: Math.floor(item.count * 0.3) }
    ];

    setModalContent({ title, data });
    setModalOpen(true);
  };

  return (
    <Box>
      {loading && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography>Loading statistics...</Typography>
        </Box>
      )}

      {!loading && (
        <>
          {/* Info Alert */}
          <Alert
            color="primary"
            variant="soft"
            startDecorator={<InfoIcon />}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                عرض على مستوى القسم (Section-Level View)
              </Typography>
              <Typography level="body-xs" sx={{ mt: 0.5 }}>
                البيانات المعروضة خاصة بهذا القسم فقط. للحصول على نظرة أشمل، اختر مستوى أعلى.
              </Typography>
            </Box>
          </Alert>

          {/* ── Section 1: Operational Overview ── */}
          <DashboardSection title="Operational Overview" icon={<BarChartIcon />} accentColor="#667eea">
            <Grid container spacing={2}>
              <Grid xs={12} sm={4}>
                <MetricCard title="Total Incidents / Patients" value={`${metrics.totalIncidents} / ${metrics.uniquePatients}`} color="#667eea" trend={trends.incidentsPatients} subtitle="All cases" />
              </Grid>
              <Grid xs={12} sm={4}>
                <MetricCard title="Open Cases" value={operationalSummary?.open_cases ?? 0} color="#2ed573" subtitle="Active cases" />
              </Grid>
              <Grid xs={12} sm={4}>
                <MetricCard title="Closed Cases" value={operationalSummary?.closed_cases ?? 0} color="#667eea" subtitle="Resolved cases" />
              </Grid>
            </Grid>
          </DashboardSection>

          {/* ── Section 2: Quality Indicators ── */}
          <DashboardSection title="Quality Indicators" icon={<HealthAndSafetyIcon />} accentColor="#a29bfe">
            <Grid container spacing={2}>
              <Grid xs={12} sm={4}>
                <MetricCard title="Severity" color="#ffa502" rows={[
                  { label: "High",   value: metrics.severityBreakdown?.high   ?? 0, color: "#ff4757" },
                  { label: "Medium", value: metrics.severityBreakdown?.medium ?? 0, color: "#ffa502" },
                  { label: "Low",    value: metrics.severityBreakdown?.low    ?? 0, color: "#2ed573" },
                ]} />
              </Grid>
              <Grid xs={12} sm={4}>
                <MetricCard title="Domain" color="#2ed573" rows={[
                  { label: "Clinical",   value: metrics.domainBreakdown?.clinical   ?? 0, color: "#667eea" },
                  { label: "Management", value: metrics.domainBreakdown?.management ?? 0, color: "#a29bfe" },
                  { label: "Relational", value: metrics.domainBreakdown?.relational ?? 0, color: "#00cec9" },
                ]} />
              </Grid>
              <Grid xs={12} sm={4}>
                <MetricCard title="Ordinary / Red Flag / Never Event" color="#ff4757" rows={[
                  { label: "Ordinary",    value: metrics.ordinary    ?? 0, color: "#2ed573" },
                  { label: "Red Flag",    value: metrics.redFlags    ?? 0, color: "#ff4757" },
                  { label: "Never Event", value: metrics.neverEvents ?? 0, color: "#ff4757" },
                ]} />
              </Grid>
            </Grid>
          </DashboardSection>

          {/* ── Section 3: Workflow Health ── */}
          {(() => {
            const forceClosed  = operationalSummary?.force_closed_cases ?? 0;
            const overdueCount = operationalSummary?.currently_overdue  ?? 0;
            const forcePct     = metrics.totalIncidents > 0 ? Math.round((forceClosed / metrics.totalIncidents) * 100) : 0;
            return (
              <DashboardSection title="Workflow Health" icon={<MonitorHeartIcon />} accentColor="#fd79a8">
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {[
                    <MetricCard key="late"    title="Late Replies"       value={operationalSummary?.late_replies ?? 0} color="#ffa502" subtitle="Cases awaiting response" />,
                    <MetricCard key="force"   title="Force Closed"       value={forceClosed}  color="#ff4757" subtitle={`${forcePct}% of total cases`} badge={forceClosed > 0 ? "Requires review" : null} />,
                    <MetricCard key="overdue" title="Currently Overdue"  value={overdueCount} color={overdueCount > 0 ? "#ff4757" : "#2ed573"} subtitle={overdueCount > 0 ? "Past due cases" : "On track"} />,
                    <MetricCard key="extra"   title="Extra Time Granted" value={operationalSummary?.extra_time_granted ?? 0} color="#2ed573" subtitle="Cases with extended time" />,
                    <MetricCard key="notices" title="Notices"            value={metrics?.noticeCount ?? 0} color="#00cec9" subtitle="System notices" />,
                  ].map((card, i) => (
                    <Box key={i} sx={{ flex: "1 1 160px", minWidth: 0 }}>{card}</Box>
                  ))}
                </Box>
              </DashboardSection>
            );
          })()}

      {/* Chart */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={12}>
          <ChartCard title="Top 5 Classifications">
            <Top5ClassificationChart
              data={charts.top5Classification}
              onBarClick={handleChartClick}
            />
          </ChartCard>
        </Grid>
        <Grid xs={12} md={6}>
          <ChartCard title="Stage Histogram">
            <UniversalChart data={stats?.charts?.stage?.data || []} type="line" height={350} />
          </ChartCard>
        </Grid>
        <Grid xs={12} md={6}>
          <ChartCard title="Severity Distribution">
            <UniversalChart data={distributionCharts.severity} type="donut" height={350} />
          </ChartCard>
        </Grid>
        <Grid xs={12} md={6}>
          <ChartCard title="Harm Distribution">
            <UniversalChart data={distributionCharts.harm} type="donut" height={350} />
          </ChartCard>
        </Grid>
        <Grid xs={12} md={6}>
          <ChartCard title="Category Distribution">
            <UniversalChart data={distributionCharts.category} type="line" height={350} />
          </ChartCard>
        </Grid>
        <Grid xs={12} md={6}>
          <ChartCard title="Subcategory Distribution">
            <UniversalChart data={distributionCharts.subcategory} type="bar" height={350} layout="horizontal" />
          </ChartCard>
        </Grid>
      </Grid>

      {/* Section-Specific Insights */}
      <Card sx={{ p: 3, background: "linear-gradient(135deg, #f5f7ff 0%, #fff 100%)" }}>
        <Typography level="body-sm" sx={{ fontWeight: 700, color: "#667eea", mb: 1 }}>
          💡 ملاحظات على مستوى القسم (Section-Level Insights)
        </Typography>
        <Typography level="body-xs" sx={{ color: "#666" }}>
          • البيانات المعروضة تمثل {metrics.totalIncidents} حادثة من إجمالي حوادث المستشفى<br />
          • يوجد {metrics.openClosed.open} حالة مفتوحة تحتاج إلى متابعة من القسم<br />
          • عدد العلامات الحمراء: {metrics.redFlags} (تتطلب اهتمام فوري)
        </Typography>
      </Card>
        </>
      )}

      {/* Modal for Chart Details */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalDialog
          sx={{
            maxWidth: 500,
            borderRadius: "md",
            p: 3,
            boxShadow: "lg",
          }}
        >
          <Typography level="h4" sx={{ mb: 2, color: "#667eea", fontWeight: 700 }}>
            {modalContent.title}
          </Typography>
          <Sheet
            variant="outlined"
            sx={{
              borderRadius: "sm",
              p: 2,
            }}
          >
            {modalContent.data.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 1.5,
                  borderBottom: index < modalContent.data.length - 1 ? "1px solid #eee" : "none",
                }}
              >
                <Typography level="body-sm" sx={{ fontWeight: 600, color: "#555" }}>
                  {item.label}:
                </Typography>
                <Typography level="body-sm" sx={{ fontWeight: 700, color: "#667eea" }}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Sheet>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default QismDashboardStats;
