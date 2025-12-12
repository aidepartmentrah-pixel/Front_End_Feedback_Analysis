// src/components/dashboard/QismDashboardStats.js
import React, { useState } from "react";
import { Grid, Box, Typography, Card, Alert, Modal, ModalDialog, Sheet } from "@mui/joy";
import MetricCard from "./MetricCard";
import ChartCard from "./ChartCard";
import Top5ClassificationChart from "./Top5ClassificationChart";
import RecentActivityFeed from "./RecentActivityFeed";
import InfoIcon from "@mui/icons-material/Info";

// Mock data for section-level view
const mockQismData = {
  er_triage: {
    metrics: {
      totalIncidents: 12,
      openClosed: { open: 3, closed: 9 },
      severityBreakdown: { high: 2, medium: 5, low: 5 },
      domainBreakdown: { clinical: 8, management: 3, relational: 1 },
      redFlags: 1
    },
    trends: {
      totalIncidents: { value: 14, direction: "up" },
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
      openClosed: { open: 2, closed: 6 },
      severityBreakdown: { high: 1, medium: 3, low: 4 },
      domainBreakdown: { clinical: 5, management: 2, relational: 1 },
      redFlags: 0
    },
    trends: {
      totalIncidents: { value: 11, direction: "down" },
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
      openClosed: { open: 3, closed: 8 },
      severityBreakdown: { high: 2, medium: 5, low: 4 },
      domainBreakdown: { clinical: 8, management: 2, relational: 1 },
      redFlags: 1
    },
    trends: {
      totalIncidents: { value: 8, direction: "up" },
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

const QismDashboardStats = ({ qism }) => {
  const data = mockQismData[qism] || mockQismData.er_triage;
  const { metrics, trends, charts, recentActivity } = data;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", data: [] });

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

      {/* Metrics Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={2.4}>
          <MetricCard 
            title="Total Incidents" 
            value={metrics.totalIncidents} 
            color="#667eea"
            trend={trends.totalIncidents}
          />
        </Grid>
        <Grid xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Open / Closed"
            value={`${metrics.openClosed.open} / ${metrics.openClosed.closed}`}
            color="#ff4757"
            trend={trends.openClosed}
          />
        </Grid>
        <Grid xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Severity"
            value={`H:${metrics.severityBreakdown.high} M:${metrics.severityBreakdown.medium} L:${metrics.severityBreakdown.low}`}
            color="#ffa502"
            trend={trends.severity}
          />
        </Grid>
        <Grid xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Domain"
            value={`C:${metrics.domainBreakdown.clinical} M:${metrics.domainBreakdown.management} R:${metrics.domainBreakdown.relational}`}
            color="#2ed573"
            trend={trends.domain}
          />
        </Grid>
        <Grid xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Red Flags"
            value={metrics.redFlags}
            color="#ff4757"
            trend={trends.redFlags}
          />
        </Grid>
      </Grid>

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
      </Grid>

      {/* Recent Activity Feed */}
      <Box sx={{ mb: 3 }}>
        <RecentActivityFeed incidents={recentActivity} />
      </Box>

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
