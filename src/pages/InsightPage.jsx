/**
 * STEP 4.14 — Insight Page (Phase 4 Workflow)
 * STEP 4.15 — Error handling with ErrorPanel
 * DATA WIRING — Connected to Insight API endpoints
 * 
 * Purpose:
 * - Workflow visibility and bottleneck tracking dashboard
 * - Shows live KPI metrics, distribution/trend data, stuck cases
 * 
 * Architecture:
 * - Uses insightApi wrapper for data loading
 * - No role logic (backend enforces access)
 * - Charts show JSON preview (chart library integration later)
 * - Error handling via ErrorPanel component
 * 
 * Data Sources:
 * - GET  /api/v2/insight/kpi-summary
 * - POST /api/v2/insight/distribution
 * - POST /api/v2/insight/trend
 * - GET  /api/v2/insight/stuck
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Select,
  Option,
  FormControl,
  FormLabel,
  CircularProgress,
  Button,
} from '@mui/joy';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import MainLayout from '../components/common/MainLayout';
import ErrorPanel from '../components/common/ErrorPanel';
import SectionCard from '../components/SectionCard';
import {
  getInsightKpis,
  getInsightDistribution,
  getInsightTrend,
  getGroupedInbox,
} from '../api/insightApi';
import { actOnSubcase } from '../api/workflowApi';

const InsightPage = () => {
  // ============================
  // STATE
  // ============================
  const [kpis, setKpis] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [trend, setTrend] = useState([]);
  const [groupedInbox, setGroupedInbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [dateRange, setDateRange] = useState('30'); // Default 30 days

  // ============================
  // LOAD DATA ON MOUNT AND FILTER CHANGE
  // ============================
  useEffect(() => {
    loadInsightData();
  }, [dateRange]); // Reload when filters change

  // Build filter parameters
  function buildFilterParams() {
    const params = {};
    
    // Add date range if selected
    if (dateRange && dateRange !== 'all') {
      const days = parseInt(dateRange);
      const dateTo = new Date();
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);
      
      params.date_from = dateFrom.toISOString().split('T')[0]; // YYYY-MM-DD
      params.date_to = dateTo.toISOString().split('T')[0];
    }
    
    return params;
  }

  async function loadInsightData() {
    try {
      setLoading(true);
      setError(null);

      const filterParams = buildFilterParams();

      // Load all insight data in parallel
      const [kpiData, distData, trendData, inboxData] = await Promise.all([
        getInsightKpis(),
        getInsightDistribution({
          entity: 'subcase',
          dimension: 'status',
          ...filterParams, // Apply filters to distribution
        }),
        getInsightTrend({
          entity: 'subcase',
          interval: 'month',
          ...filterParams, // Apply filters to trend
        }),
        getGroupedInbox(), // Load grouped inbox data
      ]);

      setKpis(kpiData || {});
      setDistribution(distData || []);
      setTrend(trendData || []);
      setGroupedInbox(inboxData || []);
    } catch (e) {
      console.error('Insight Page Error:', e);
      // Detect network errors
      if (!e.response && e.message === 'Network error') {
        setError('Network error — check your connection');
      } else {
        setError(e.message || 'Failed to load insight data. The backend API endpoints may not be implemented yet.');
      }
    } finally {
      setLoading(false);
    }
  }

  // ============================
  // RESET FILTERS
  // ============================
  function resetFilters() {
    setDateRange('30');
    // loadInsightData will be triggered by useEffect
  }

  // ============================
  // FORCE CLOSE HANDLER
  // ============================
  async function handleForceClose(subcaseId, reason) {
    try {
      // Call force close API using actOnSubcase with FORCE_CLOSE action
      await actOnSubcase(subcaseId, 'FORCE_CLOSE', { reason });
      
      // Optimistic UI update - remove subcase immediately
      setGroupedInbox((prevSections) =>
        prevSections
          .map((section) => ({
            ...section,
            subcases: section.subcases.filter((s) => s.subcase_id !== subcaseId),
            pending_count: section.pending_count - 1,
          }))
          .filter((section) => section.pending_count > 0) // Hide now-empty sections
      );
    } catch (err) {
      alert('Force close failed: ' + err.message);
      // Reload data on error to ensure consistency
      loadInsightData();
      throw err; // Re-throw so SubcaseCard knows it failed
    }
  }

  // ============================
  // KPI DATA (FROM API)
  // ============================
  const kpiData = [
    {
      title: 'Open Subcases',
      value: kpis?.open_subcases ?? '--',
      subtitle: 'Across all units',
      color: 'primary',
    },
    {
      title: 'Pending Approvals',
      value: kpis?.pending_approvals ?? '--',
      subtitle: 'Awaiting review',
      color: 'warning',
    },
    {
      title: 'Active Action Items',
      value: kpis?.active_action_items ?? '--',
      subtitle: 'In progress',
      color: 'success',
    },
    {
      title: 'Overdue Items',
      value: kpis?.overdue_items ?? '--',
      subtitle: 'Past due date',
      color: 'danger',
    },
  ];

  // ============================
  // DATA VERIFICATION - Compare KPI counts with actual grouped inbox subcases
  // ============================
  const actualSubcaseCount = groupedInbox.reduce((total, section) => {
    return total + (section.subcases?.length || 0);
  }, 0);

  const totalPendingCount = groupedInbox.reduce((total, section) => {
    return total + (section.pending_count || 0);
  }, 0);

  // Check if there's a mismatch between KPI and actual counts
  const hasCountMismatch = 
    kpis?.open_subcases !== actualSubcaseCount || 
    kpis?.open_subcases !== totalPendingCount;

  // ============================
  // RENDER LOADING STATE
  // ============================
  if (loading) {
    return (
      <MainLayout pageTitle="Workflow Insight">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: 2,
          }}
        >
          <CircularProgress size="lg" />
          <Typography level="body-lg">Loading insight data...</Typography>
        </Box>
      </MainLayout>
    );
  }

  // ============================
  // RENDER ERROR STATE
  // ============================
  if (error) {
    return (
      <MainLayout pageTitle="Workflow Insight">
        <Box sx={{ p: 3 }}>
          <ErrorPanel message={error} retryAction={loadInsightData} />
        </Box>
      </MainLayout>
    );
  }

  // ============================
  // RENDER INSIGHT PAGE
  // ============================
  return (
    <MainLayout pageTitle="Workflow Insight">
      <Box sx={{ p: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography level="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Workflow Insight
          </Typography>
          <Typography level="body-sm" sx={{ color: 'neutral.600' }}>
            Workflow visibility and bottleneck tracking
          </Typography>
        </Box>

        {/* Filter Bar */}
        <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>

            <FormControl size="sm" sx={{ minWidth: 150 }}>
              <FormLabel>Date Range</FormLabel>
              <Select
                placeholder="Last 30 days"
                value={dateRange}
                onChange={(e, newValue) => setDateRange(newValue)}
              >
                <Option value="7">Last 7 days</Option>
                <Option value="30">Last 30 days</Option>
                <Option value="60">Last 60 days</Option>
                <Option value="90">Last 90 days</Option>
                <Option value="all">All Time</Option>
              </Select>
            </FormControl>

            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={resetFilters}
              sx={{ alignSelf: 'flex-end' }}
            >
              Reset Filters
            </Button>
          </Box>
        </Card>

        {/* KPI Cards Row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 2,
            mb: 3,
          }}
        >
          {kpiData.map((kpi, index) => (
            <Card
              key={index}
              variant="soft"
              color={kpi.color}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                {kpi.title}
              </Typography>
              <Typography level="h2" sx={{ fontWeight: 800 }}>
                {kpi.value}
              </Typography>
              <Typography level="body-xs" sx={{ opacity: 0.8 }}>
                {kpi.subtitle}
              </Typography>
            </Card>
          ))}
        </Box>

        {/* Chart Area Placeholders */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          {/* Left Chart: Workflow Status Distribution */}
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography level="title-md" sx={{ mb: 2, fontWeight: 600 }}>
              Workflow Status Distribution
            </Typography>
            <Box
              sx={{
                minHeight: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ label, value }) => `${label}: ${value}`}
                    >
                      {distribution.map((entry, index) => {
                        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
                        return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                      })}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography level="body-sm" sx={{ color: 'neutral.500' }}>
                  No data available for chart
                </Typography>
              )}
            </Box>
          </Card>

          {/* Right Chart: Subcase Trend */}
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography level="title-md" sx={{ mb: 2, fontWeight: 600 }}>
              Subcase Trend (Monthly)
            </Typography>
            <Box
              sx={{
                minHeight: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#8884d8"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography level="body-sm" sx={{ color: 'neutral.500' }}>
                  No data available for chart
                </Typography>
              )}
            </Box>
          </Card>
        </Box>

        {/* Data Verification Alert */}
        {hasCountMismatch && (
          <Box sx={{ mt: 3, mb: 2 }}>
            <Card variant="soft" color="warning" sx={{ p: 2 }}>
              <Typography level="title-sm" sx={{ mb: 1, fontWeight: 700 }}>
                ⚠️ Data Inconsistency Detected
              </Typography>
              <Typography level="body-sm" sx={{ mb: 1 }}>
                KPI counts may not match the actual subcases displayed below:
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 1.5 }}>
                <Box>
                  <Typography level="body-xs" sx={{ fontWeight: 600 }}>
                    KPI: Open Subcases
                  </Typography>
                  <Typography level="h4">{kpis?.open_subcases ?? '--'}</Typography>
                </Box>
                <Box>
                  <Typography level="body-xs" sx={{ fontWeight: 600 }}>
                    Grouped Inbox: Actual Subcases
                  </Typography>
                  <Typography level="h4">{actualSubcaseCount}</Typography>
                </Box>
                <Box>
                  <Typography level="body-xs" sx={{ fontWeight: 600 }}>
                    Grouped Inbox: Pending Count
                  </Typography>
                  <Typography level="h4">{totalPendingCount}</Typography>
                </Box>
              </Box>
              <Typography level="body-xs" sx={{ mt: 2, fontStyle: 'italic' }}>
                💡 This may indicate different queries or filtering logic between the two endpoints.
                Backend verification needed (see troubleshooting guide).
              </Typography>
            </Card>
          </Box>
        )}

        {/* Workload Overview - Grouped by Section */}
        <Box sx={{ mt: 4 }}>
          <Typography level="h4" sx={{ fontWeight: 700, mb: 1 }}>
            📊 Workload Overview - Grouped by Section
          </Typography>
          <Typography level="body-sm" sx={{ color: 'neutral.600', mb: 3 }}>
            Sections with pending subcases, supervisor names, and case details
          </Typography>

          {groupedInbox.length === 0 ? (
            <Card variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <Typography level="h4" sx={{ color: 'neutral.500', mb: 1 }}>
                ✅ No pending subcases found
              </Typography>
              <Typography level="body-sm" sx={{ color: 'neutral.400' }}>
                All sections are up to date
              </Typography>
            </Card>
          ) : (
            <Box>
              {groupedInbox.map((section) => (
                <SectionCard
                  key={section.section_id}
                  section={section}
                  onForceClose={handleForceClose}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* REMOVED: Stuck/Escalated Cases section */}
        {/* REMOVED: User Workload Summary section */}

        {/* Info Note */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'primary.50', borderRadius: 'sm' }}>
          <Typography level="body-xs" sx={{ color: 'primary.700' }}>
            ℹ️ <strong>Note:</strong> Chart visualization integrated using Recharts.
            Use filters above to customize data by organizational unit, date range, or status.
          </Typography>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default InsightPage;
