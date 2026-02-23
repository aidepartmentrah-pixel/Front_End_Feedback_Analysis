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
  Input,
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
  const [inboxLoadError, setInboxLoadError] = useState(null); // Track inbox-specific errors

  // Filter state
  const [dateRange, setDateRange] = useState('30'); // Default 30 days
  const [caseTypeFilter, setCaseTypeFilter] = useState('all'); // all, incident, seasonal
  const [searchTerm, setSearchTerm] = useState(''); // Search for case/subcase

  // Expansion state for org type groups and individual sections
  const [expandedGroups, setExpandedGroups] = useState({
    SECTION: true,
    DEPARTMENT: true,
    ADMINISTRATION: true,
  });
  const [expandedSections, setExpandedSections] = useState({});

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

  // Sort grouped inbox by org_type: SECTION → DEPARTMENT → ADMINISTRATION
  function sortByOrgType(inboxData) {
    const orgTypeOrder = { SECTION: 1, DEPARTMENT: 2, ADMINISTRATION: 3 };
    return [...inboxData].sort((a, b) => {
      const orderA = orgTypeOrder[a.org_type?.toUpperCase()] || 99;
      const orderB = orgTypeOrder[b.org_type?.toUpperCase()] || 99;
      return orderA - orderB;
    });
  }

  // Group inbox data by org_type for rendering with headers
  function groupByOrgType(inboxData) {
    const groups = {
      SECTION: { key: 'SECTION', title: '📌 Sections', items: [], color: '#00b894', gradient: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)' },
      DEPARTMENT: { key: 'DEPARTMENT', title: '🏢 Departments', items: [], color: '#6c5ce7', gradient: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)' },
      ADMINISTRATION: { key: 'ADMINISTRATION', title: '🏛️ Administrations', items: [], color: '#e17055', gradient: 'linear-gradient(135deg, #e17055 0%, #fab1a0 100%)' },
    };

    inboxData.forEach(item => {
      const type = (item.org_type || 'SECTION').toUpperCase();
      if (groups[type]) {
        groups[type].items.push(item);
      } else {
        groups.SECTION.items.push(item); // Fallback
      }
    });

    // Return only non-empty groups in order
    return ['SECTION', 'DEPARTMENT', 'ADMINISTRATION']
      .map(key => groups[key])
      .filter(group => group.items.length > 0);
  }

  // Toggle an org type group expansion
  function toggleOrgGroup(orgType) {
    setExpandedGroups(prev => ({
      ...prev,
      [orgType]: !prev[orgType],
    }));
  }

  // Toggle individual section expansion
  function toggleSectionExpand(sectionId) {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }

  // Filter grouped inbox by search term
  function filterBySearch(sections, term) {
    if (!term.trim()) return sections;
    const lowerTerm = term.toLowerCase().trim();
    
    return sections
      .map(section => ({
        ...section,
        subcases: section.subcases.filter(subcase => {
          const caseNum = String(subcase.incident_id || subcase.seasonal_report_id || '');
          const subcaseNum = String(subcase.subcase_id || '');
          const patientName = (subcase.patient_name || '').toLowerCase();
          const description = (subcase.case_description || '').toLowerCase();
          const category = (subcase.category || '').toLowerCase();
          
          return caseNum.includes(lowerTerm) ||
                 subcaseNum.includes(lowerTerm) ||
                 patientName.includes(lowerTerm) ||
                 description.includes(lowerTerm) ||
                 category.includes(lowerTerm);
        }),
      }))
      .map(section => ({
        ...section,
        pending_count: section.subcases.length,
      }))
      .filter(section => section.subcases.length > 0);
  }

  // Computed grouped data (with search filter applied)
  const filteredInbox = filterBySearch(groupedInbox, searchTerm);
  const orgTypeGroups = groupByOrgType(filteredInbox);

  // Filter sections by case type (incident vs seasonal)
  function filterByCaseType(sections, filterType) {
    if (filterType === 'all') return sections;
    
    return sections
      .map(section => ({
        ...section,
        subcases: section.subcases.filter(subcase => {
          const isIncident = subcase.case_type === 'incident' || subcase.incident_id;
          const isSeasonal = subcase.case_type === 'seasonal' || subcase.seasonal_report_id;
          
          if (filterType === 'incident') return isIncident;
          if (filterType === 'seasonal') return isSeasonal;
          return true;
        }),
        pending_count: undefined, // Will be recalculated
      }))
      .map(section => ({
        ...section,
        pending_count: section.subcases.length,
      }))
      .filter(section => section.subcases.length > 0); // Remove empty sections
  }

  async function loadInsightData() {
    try {
      setLoading(true);
      setError(null);

      const filterParams = buildFilterParams();

      // Load all insight data in parallel - with individual error handling
      // so one failing endpoint doesn't break the entire page
      const [kpiResult, distResult, trendResult, inboxResult] = await Promise.allSettled([
        getInsightKpis(),
        getInsightDistribution({
          entity: 'subcase',
          dimension: 'status',
          ...filterParams,
        }),
        getInsightTrend({
          entity: 'subcase',
          interval: 'month',
          ...filterParams,
        }),
        getGroupedInbox(),
      ]);

      // Set data from successful calls, default empty for failed ones
      setKpis(kpiResult.status === 'fulfilled' ? (kpiResult.value || {}) : {});
      setDistribution(distResult.status === 'fulfilled' ? (distResult.value || []) : []);
      setTrend(trendResult.status === 'fulfilled' ? (trendResult.value || []) : []);
      
      // Handle grouped inbox separately to track errors
      if (inboxResult.status === 'fulfilled') {
        setGroupedInbox(sortByOrgType(inboxResult.value || []));
        setInboxLoadError(null);
      } else {
        setGroupedInbox([]);
        setInboxLoadError(inboxResult.reason?.message || 'Failed to load grouped inbox data');
      }

      // Log any failures for debugging but don't block the page
      if (kpiResult.status === 'rejected') console.warn('KPI load failed:', kpiResult.reason);
      if (distResult.status === 'rejected') console.warn('Distribution load failed:', distResult.reason);
      if (trendResult.status === 'rejected') console.warn('Trend load failed:', trendResult.reason);
      if (inboxResult.status === 'rejected') console.warn('Inbox load failed:', inboxResult.reason);

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
    setSearchTerm('');
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

            {/* Search Field */}
            <FormControl size="sm" sx={{ minWidth: 250, ml: 'auto' }}>
              <FormLabel>Search Case / Subcase</FormLabel>
              <Input
                placeholder="Case #, patient name, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startDecorator="🔍"
                sx={{ backgroundColor: 'white' }}
              />
            </FormControl>
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

        {/* Workload Overview - Grouped by Org Type */}
        <Box sx={{ mt: 4 }}>
          <Typography level="h4" sx={{ fontWeight: 700, mb: 1 }}>
            📊 Workload Overview - Grouped by Organization Type
          </Typography>
          <Typography level="body-sm" sx={{ color: 'neutral.600', mb: 3 }}>
            Sections, Departments, and Administrations with pending subcases
          </Typography>

          {inboxLoadError ? (
            <Card variant="soft" color="danger" sx={{ p: 3 }}>
              <Typography level="title-md" sx={{ mb: 1, fontWeight: 700 }}>
                ⚠️ Failed to Load Workload Data
              </Typography>
              <Typography level="body-sm" sx={{ mb: 2 }}>
                {inboxLoadError}
              </Typography>
              <Button
                size="sm"
                variant="solid"
                color="danger"
                onClick={loadInsightData}
              >
                Retry
              </Button>
            </Card>
          ) : filteredInbox.length === 0 && searchTerm ? (
            <Card variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <Typography level="h4" sx={{ color: 'neutral.500', mb: 1 }}>
                🔍 No results found
              </Typography>
              <Typography level="body-sm" sx={{ color: 'neutral.400' }}>
                No cases or subcases match "{searchTerm}"
              </Typography>
            </Card>
          ) : groupedInbox.length === 0 ? (
            <Card variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <Typography level="h4" sx={{ color: 'neutral.500', mb: 1 }}>
                ✅ No pending subcases found
              </Typography>
              <Typography level="body-sm" sx={{ color: 'neutral.400' }}>
                All units are up to date
              </Typography>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {orgTypeGroups.map((group) => (
                <Card
                  key={group.key}
                  variant="outlined"
                  sx={{
                    overflow: 'hidden',
                    borderLeft: `4px solid ${group.color}`,
                  }}
                >
                  {/* Group Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      background: group.gradient,
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleOrgGroup(group.key)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography
                        level="title-lg"
                        sx={{ fontWeight: 700, color: 'white' }}
                      >
                        {group.title}
                      </Typography>
                      <Box
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.3)',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '12px',
                        }}
                      >
                        <Typography level="body-sm" sx={{ fontWeight: 700, color: 'white' }}>
                          {group.items.length} unit{group.items.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      level="body-md"
                      sx={{
                        color: 'white',
                        fontWeight: 600,
                      }}
                    >
                      {expandedGroups[group.key] ? '▲' : '▼'}
                    </Typography>
                  </Box>

                  {/* Group Content */}
                  {expandedGroups[group.key] && (
                    <Box sx={{ p: 2, backgroundColor: '#fafafa' }}>
                      {group.items.map((section) => (
                        <SectionCard
                          key={section.section_id}
                          section={section}
                          isExpanded={expandedSections[section.section_id] || false}
                          onToggleExpand={() => toggleSectionExpand(section.section_id)}
                          onForceClose={handleForceClose}
                        />
                      ))}
                    </Box>
                  )}
                </Card>
              ))}
            </Box>
          )}
        </Box>

        {/* REMOVED: Stuck/Escalated Cases section */}
        {/* REMOVED: User Workload Summary section */}


      </Box>
    </MainLayout>
  );
};

export default InsightPage;
