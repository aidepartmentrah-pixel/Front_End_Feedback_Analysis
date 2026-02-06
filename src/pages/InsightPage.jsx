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
  Table,
  Chip,
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
import {
  getInsightKpis,
  getInsightDistribution,
  getInsightTrend,
  getStuckCases,
} from '../api/insightApi';

const InsightPage = () => {
  // ============================
  // STATE
  // ============================
  const [kpis, setKpis] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [trend, setTrend] = useState([]);
  const [stuckCases, setStuckCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [selectedOrgUnit, setSelectedOrgUnit] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [dateRange, setDateRange] = useState('30'); // Default 30 days

  // ============================
  // LOAD DATA ON MOUNT AND FILTER CHANGE
  // ============================
  useEffect(() => {
    loadInsightData();
  }, [selectedOrgUnit, selectedStatus, dateRange]); // Reload when filters change

  // Build filter parameters
  function buildFilterParams() {
    const params = {};
    
    // Add org unit if selected
    if (selectedOrgUnit && selectedOrgUnit !== 'all') {
      params.org_unit_id = selectedOrgUnit;
    }
    
    // Add status if selected
    if (selectedStatus && selectedStatus !== 'all') {
      params.status = selectedStatus;
    }
    
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
      const [kpiData, distData, trendData, stuckData] = await Promise.all([
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
        getStuckCases(),
      ]);

      setKpis(kpiData || {});
      setDistribution(distData || []);
      setTrend(trendData || []);
      setStuckCases(stuckData || []);
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
    setSelectedOrgUnit(null);
    setSelectedStatus(null);
    setDateRange('30');
    // loadInsightData will be triggered by useEffect
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
            <FormControl size="sm" sx={{ minWidth: 200 }}>
              <FormLabel>Organizational Unit</FormLabel>
              <Select
                placeholder="All Units"
                value={selectedOrgUnit}
                onChange={(e, newValue) => setSelectedOrgUnit(newValue)}
              >
                <Option value="all">All Units</Option>
                <Option value="unit_1">Unit 1</Option>
                <Option value="unit_2">Unit 2</Option>
                <Option value="unit_3">Unit 3</Option>
              </Select>
            </FormControl>

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

            <FormControl size="sm" sx={{ minWidth: 150 }}>
              <FormLabel>Status Filter</FormLabel>
              <Select
                placeholder="All Statuses"
                value={selectedStatus}
                onChange={(e, newValue) => setSelectedStatus(newValue)}
              >
                <Option value="all">All Statuses</Option>
                <Option value="submitted">Submitted</Option>
                <Option value="pending_review">Pending Review</Option>
                <Option value="approved">Approved</Option>
                <Option value="rejected">Rejected</Option>
                <Option value="closed">Closed</Option>
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

        {/* Table: Stuck/Escalated Cases */}
        <Card variant="outlined">
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography level="title-md" sx={{ fontWeight: 600 }}>
              Stuck / Escalated Cases ({stuckCases.length})
            </Typography>
            <Typography level="body-xs" sx={{ color: 'neutral.600', mt: 0.5 }}>
              Cases requiring attention or exceeding stage duration thresholds
            </Typography>
          </Box>

          {stuckCases.length > 0 ? (
            <Table variant="plain">
              <thead>
                <tr>
                  <th style={{ width: '12%' }}>Subcase ID</th>
                  <th style={{ width: '18%' }}>Org Unit</th>
                  <th style={{ width: '25%' }}>Current Stage</th>
                  <th style={{ width: '15%' }}>Days in Stage</th>
                  <th style={{ width: '15%' }}>Assigned Level</th>
                  <th style={{ width: '15%' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stuckCases.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      <Typography level="body-sm" fontWeight="bold">
                        #{row.subcase_id || '--'}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-sm">
                        {row.target_org_unit_id || '--'}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-sm">{row.stage || '--'}</Typography>
                    </td>
                    <td>
                      <Typography level="body-sm" color={row.days_in_stage > 7 ? 'danger' : 'neutral'}>
                        {row.days_in_stage ?? '--'}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-sm">{row.assigned_level || '--'}</Typography>
                    </td>
                    <td>
                      <Chip
                        size="sm"
                        variant="soft"
                        color={
                          row.status === 'pending_review'
                            ? 'warning'
                            : row.status === 'submitted'
                            ? 'primary'
                            : 'neutral'
                        }
                      >
                        {row.status || '--'}
                      </Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Box
              sx={{
                p: 4,
                textAlign: 'center',
              }}
            >
              <Typography level="h4" sx={{ color: 'neutral.500', mb: 1 }}>
                ✅ No stuck cases
              </Typography>
              <Typography level="body-sm" sx={{ color: 'neutral.400' }}>
                All workflow cases are progressing normally
              </Typography>
            </Box>
          )}
        </Card>

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
