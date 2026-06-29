/**
 * STEP 4.14 — Insight Page (Phase 4 Workflow)
 * FC-S4 — Force Close Overhaul: new tabs + action buttons
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tooltip,
  Legend,
} from 'recharts';
import MainLayout from '../components/common/MainLayout';
import ErrorPanel from '../components/common/ErrorPanel';
import SectionCard from '../components/SectionCard';
import SubcaseCard from '../components/SubcaseCard';
import {
  getInsightStatusCounts,
  getGroupedInbox,
  getForceClosedPipelineCases,
  exportInsightWord,
  getPatientServicesPendingCases,
} from '../api/insightApi';
import { fetchDashboardHierarchy } from '../api/dashboard';
import CaseReviewModal from '../components/workflow/CaseReviewModal';
import WorkflowPerformanceReportPanel from '../components/workflow/WorkflowPerformanceReportPanel';
import { useAuth } from '../context/AuthContext';

// Organizational color system — shared across workload sections and workflow charts
// so a given level (Section/Department/Administration) always reads the same color.
const ORG_COLORS = {
  SECTION: '#00b894',
  DEPARTMENT: '#6c5ce7',
  ADMINISTRATION: '#e17055',
  PATIENT_SERVICES: '#0984e3',
};

// Same gradient used for the Patient Services card on the Manual Fill page —
// Patient Services gets its own identity, distinct from the org-level colors.
const PS_GRADIENT = 'linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)';

const InsightPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const roles = user?.roles || [];
  const canIntervene = roles.includes('COMPLAINT_SUPERVISOR') || roles.includes('WORKER');
  const isOrgViewer = roles.includes('SECTION_ADMIN') || roles.includes('DEPARTMENT_ADMIN') || roles.includes('ADMINISTRATION_ADMIN');

  // ============================
  // DATA STATE
  // ============================
  const [statusCounts, setStatusCounts] = useState([]);
  const [groupedInbox, setGroupedInbox] = useState([]);
  const [fcPipelineCases, setFcPipelineCases] = useState([]);
  const [patientServicesPending, setPatientServicesPending] = useState([]);

  // CaseReviewModal for give-more-time from Insight panel
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewModalItem, setReviewModalItem] = useState(null);

  // ============================
  // LOADING / ERROR STATE
  // ============================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inboxLoadError, setInboxLoadError] = useState(null);
  const [fcPipelineError, setFcPipelineError] = useState(null);

  // Filter state
  const [dateRange, setDateRange] = useState('30');
  const [searchTerm, setSearchTerm] = useState('');

  // Export state
  const [exportingWord, setExportingWord] = useState(false);

  // Expansion state
  const [expandedGroups, setExpandedGroups] = useState({
    SECTION: false,
    DEPARTMENT: false,
    ADMINISTRATION: false,
    PATIENT_SERVICES: false,
    FC_ADMIN: false,
  });
  const [expandedSections, setExpandedSections] = useState({});

  // Org hierarchy — used by the Workflow Performance Report panel's Target Unit filter
  const [hierarchy, setHierarchy] = useState(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);

  // ============================
  // LOAD MAIN DATA ON MOUNT / DATE CHANGE
  // ============================
  useEffect(() => {
    loadInsightData();
  }, [dateRange]);

  useEffect(() => {
    fetchDashboardHierarchy()
      .then(setHierarchy)
      .catch((err) => console.error('Failed to load hierarchy:', err))
      .finally(() => setLoadingHierarchy(false));
  }, []);

  // ============================
  // HELPERS
  // ============================
  function buildFilterParams() {
    const params = {};
    if (dateRange && dateRange !== 'all') {
      const days = parseInt(dateRange);
      const dateTo = new Date();
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);
      params.date_from = dateFrom.toISOString().split('T')[0];
      params.date_to = dateTo.toISOString().split('T')[0];
    }
    return params;
  }

  function sortByOrgType(inboxData) {
    const order = { SECTION: 1, DEPARTMENT: 2, ADMINISTRATION: 3 };
    return [...inboxData].sort((a, b) => {
      return (order[a.org_type?.toUpperCase()] || 99) - (order[b.org_type?.toUpperCase()] || 99);
    });
  }

  function groupByOrgType(inboxData) {
    const groups = {
      SECTION: { key: 'SECTION', title: '📌 Sections', items: [], color: ORG_COLORS.SECTION, gradient: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)' },
      DEPARTMENT: { key: 'DEPARTMENT', title: '🏢 Departments', items: [], color: ORG_COLORS.DEPARTMENT, gradient: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)' },
      ADMINISTRATION: { key: 'ADMINISTRATION', title: '🏛️ Administrations', items: [], color: ORG_COLORS.ADMINISTRATION, gradient: 'linear-gradient(135deg, #e17055 0%, #fab1a0 100%)' },
    };
    inboxData.forEach(item => {
      const type = (item.org_type || 'SECTION').toUpperCase();
      if (groups[type]) groups[type].items.push(item);
      else groups.SECTION.items.push(item);
    });
    return ['SECTION', 'DEPARTMENT', 'ADMINISTRATION']
      .map(key => groups[key])
      .filter(group => group.items.length > 0);
  }

  function toggleOrgGroup(orgType) {
    setExpandedGroups(prev => ({ ...prev, [orgType]: !prev[orgType] }));
  }

  function toggleSectionExpand(sectionId) {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }

  function filterBySearch(sections, term) {
    if (!term.trim()) return sections;
    const lowerTerm = term.toLowerCase().trim();

    // Strip "case #" or "case#" prefix so "Case #144" matches case number 144
    const caseNumTerm = lowerTerm.startsWith('case #')
      ? lowerTerm.slice(6).trim()
      : lowerTerm.startsWith('case#')
      ? lowerTerm.slice(5).trim()
      : null;

    return sections
      .map(section => ({
        ...section,
        subcases: section.subcases.filter(subcase => {
          const incNum = (subcase.incident_number || '').toLowerCase();
          // incident_request_case_id is the case number field returned by the DB layer
          const caseId = String(subcase.incident_request_case_id || subcase.seasonal_report_id || '');
          return (
            incNum.includes(lowerTerm) ||
            caseId.includes(lowerTerm) ||
            (caseNumTerm !== null && caseId.includes(caseNumTerm)) ||
            (subcase.patient_name || '').toLowerCase().includes(lowerTerm) ||
            (subcase.case_description || '').toLowerCase().includes(lowerTerm) ||
            (subcase.category || '').toLowerCase().includes(lowerTerm)
          );
        }),
      }))
      .map(section => ({ ...section, pending_count: section.subcases.length }))
      .filter(section => section.subcases.length > 0);
  }

  const filteredInbox = filterBySearch(groupedInbox, searchTerm);
  const orgTypeGroups = groupByOrgType(filteredInbox);

  // ============================
  // WORKFLOW CHARTS — map raw statuses into business categories
  // ============================
  const statusCountMap = statusCounts.reduce((map, item) => {
    map[item.status] = item.count;
    return map;
  }, {});

  // "Current Workflow Ownership" — who currently holds the complaint.
  // Completed states (CLOSED, ADMIN_APPROVED, PATIENT_SERVICES_DECISION_COMPLETED)
  // are intentionally excluded — they're finished work, not operational backlog.
  const ownershipData = [
    { label: 'Section', value: statusCountMap['SUBMITTED_TO_SECTION'] || 0, color: ORG_COLORS.SECTION },
    {
      label: 'Department',
      value: (statusCountMap['SECTION_ACCEPTED_PENDING_DEPT'] || 0) + (statusCountMap['FORCE_CLOSED_AT_SECTION'] || 0),
      color: ORG_COLORS.DEPARTMENT,
    },
    {
      label: 'Administration',
      value: (statusCountMap['DEPT_ACCEPTED_PENDING_ADMIN'] || 0) + (statusCountMap['FORCE_CLOSED_AT_DEPARTMENT'] || 0),
      color: ORG_COLORS.ADMINISTRATION,
    },
    { label: 'Patient Services', value: statusCountMap['WAITING_PATIENT_SERVICES_DECISION'] || 0, color: ORG_COLORS.PATIENT_SERVICES },
  ].filter(item => item.value > 0);

  // "Force Close Distribution" — which organizational level force-closes the most.
  const forceCloseData = [
    { label: 'Section', value: statusCountMap['FORCE_CLOSED_AT_SECTION'] || 0, color: ORG_COLORS.SECTION },
    { label: 'Department', value: statusCountMap['FORCE_CLOSED_AT_DEPARTMENT'] || 0, color: ORG_COLORS.DEPARTMENT },
    { label: 'Administration', value: statusCountMap['FORCE_CLOSED_AT_ADMINISTRATION'] || 0, color: ORG_COLORS.ADMINISTRATION },
  ].filter(item => item.value > 0);

  const ownershipTotal = ownershipData.reduce((t, d) => t + d.value, 0);
  const forceCloseTotal = forceCloseData.reduce((t, d) => t + d.value, 0);

  // ============================
  // DATA LOADERS
  // ============================
  async function loadInsightData() {
    try {
      setLoading(true);
      setError(null);

      const filterParams = buildFilterParams();

      const [statusResult, inboxResult, psResult, pipelineResult] = await Promise.allSettled([
        getInsightStatusCounts({ entity: 'subcase', dimension: 'status', ...filterParams }),
        getGroupedInbox(),
        getPatientServicesPendingCases(),
        roles.includes('COMPLAINT_SUPERVISOR') ? getForceClosedPipelineCases() : Promise.resolve([]),
      ]);

      setStatusCounts(statusResult.status === 'fulfilled' ? (statusResult.value || []) : []);

      if (inboxResult.status === 'fulfilled') {
        setGroupedInbox(sortByOrgType(inboxResult.value || []));
        setInboxLoadError(null);
      } else {
        setGroupedInbox([]);
        setInboxLoadError(inboxResult.reason?.message || 'Failed to load grouped inbox data');
      }

      setPatientServicesPending(psResult.status === 'fulfilled' ? (psResult.value || []) : []);

      if (pipelineResult.status === 'fulfilled') {
        setFcPipelineCases(pipelineResult.value || []);
        setFcPipelineError(null);
      } else {
        setFcPipelineCases([]);
        setFcPipelineError(pipelineResult.reason?.message || 'Failed to load force-closed pipeline cases');
      }

      if (statusResult.status === 'rejected') console.warn('Status counts load failed:', statusResult.reason);
      if (inboxResult.status === 'rejected') console.warn('Inbox load failed:', inboxResult.reason);
      if (psResult.status === 'rejected') console.warn('Patient services pending load failed:', psResult.reason);
    } catch (e) {
      setError(e.message || 'Failed to load insight data.');
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    setDateRange('30');
    setSearchTerm('');
  }

  // ============================
  // ACTION HANDLERS
  // ============================
  function handleFillData(subcaseId) {
    navigate(`/manual-fill/${subcaseId}`);
  }

  const FC_STATUS_TO_ACTION = {
    FORCE_CLOSED_AT_SECTION:        'give_section_more_time',
    FORCE_CLOSED_AT_DEPARTMENT:     'give_department_more_time',
    FORCE_CLOSED_AT_ADMINISTRATION: 'give_administration_more_time',
  };

  function handleGiveMoreTime(subcase) {
    const action = FC_STATUS_TO_ACTION[subcase.status];
    if (!action) return;
    setReviewModalItem({
      subcaseId:         subcase.subcase_id,
      incidentId:        subcase.incident_request_case_id || subcase.incident_id,
      status:            subcase.status,
      allowedActions:    [action],
      targetOrgUnitName: subcase.org_unit_name,
    });
    setReviewModalOpen(true);
  }

  async function handleExportWord() {
    setExportingWord(true);
    try {
      await exportInsightWord({ searchTerm });
    } catch (err) {
      console.error('[InsightPage] Word export failed:', err);
      alert('فشل تصدير التقرير. يرجى المحاولة مرة أخرى.');
    } finally {
      setExportingWord(false);
    }
  }

  // ============================
  // RENDER LOADING / ERROR
  // ============================
  if (loading) {
    return (
      <MainLayout pageTitle="Workflow Page">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
          <CircularProgress size="lg" />
          <Typography level="body-lg">Loading insight data...</Typography>
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout pageTitle="Workflow Page">
        <Box sx={{ p: 3 }}>
          <ErrorPanel message={error} retryAction={loadInsightData} />
        </Box>
      </MainLayout>
    );
  }

  // ============================
  // RENDER PATIENT SERVICES WORKFLOW SECTION
  // Same container/header/badge/collapse structure as the Section/Department/
  // Administration groups, but with its own color identity. canEdit separates
  // visibility (anyone scoped to see it) from editability (supervisors only).
  // ============================
  function renderPatientServicesCard(canEdit) {
    if (patientServicesPending.length === 0) return null;
    return (
      <Box sx={{ mt: 4 }}>
        <Card variant="outlined" sx={{ overflow: 'hidden', borderLeft: `4px solid ${ORG_COLORS.PATIENT_SERVICES}` }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, background: PS_GRADIENT, cursor: 'pointer' }}
            onClick={() => toggleOrgGroup('PATIENT_SERVICES')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box>
                <Typography level="title-lg" sx={{ fontWeight: 700, color: 'white' }}>
                  Patient Services Scientific Decision
                </Typography>
                <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                  بانتظار قرار خدمات المرضى بحسب المراجع العلميّة
                </Typography>
              </Box>
              <Box sx={{ backgroundColor: 'rgba(255,255,255,0.3)', px: 1.5, py: 0.5, borderRadius: '12px' }}>
                <Typography level="body-sm" sx={{ fontWeight: 700, color: 'white' }}>
                  {patientServicesPending.length} case{patientServicesPending.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>
            <Typography level="body-md" sx={{ color: 'white', fontWeight: 600 }}>
              {expandedGroups.PATIENT_SERVICES ? '▲' : '▼'}
            </Typography>
          </Box>
          {expandedGroups.PATIENT_SERVICES && (
            <Box sx={{ p: 2, backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', gap: 1 }}>
              {patientServicesPending.map(row => (
                <SubcaseCard
                  key={row.subcase_id}
                  subcase={row}
                  onEnterDecision={canEdit ? (subcaseId) => navigate(`/manual-fill/${subcaseId}`) : undefined}
                />
              ))}
            </Box>
          )}
        </Card>
      </Box>
    );
  }

  // ============================
  // PIE CHART TOOLTIP — category name, count, and % of chart total on hover.
  // Category labels are intentionally never drawn on the slices themselves
  // (long status names caused overlap in the old chart); hover + legend only.
  // ============================
  function renderPieTooltip(total) {
    return ({ active, payload }) => {
      if (!active || !payload || !payload.length) return null;
      const { name, value } = payload[0];
      const pct = total > 0 ? Math.round((value / total) * 100) : 0;
      return (
        <Box sx={{ bgcolor: 'background.surface', p: 1.5, border: '1px solid', borderColor: 'neutral.300', borderRadius: 'sm', boxShadow: 'sm' }}>
          <Typography level="body-sm" sx={{ fontWeight: 700 }}>{name}</Typography>
          <Typography level="body-xs">{value} complaints</Typography>
          <Typography level="body-xs">{pct}%</Typography>
        </Box>
      );
    };
  }

  // ============================
  // MAIN RENDER
  // ============================
  return (
    <MainLayout pageTitle="Workflow Page">
      <Box sx={{ p: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography level="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Workflow Page
            </Typography>
            <Typography level="body-sm" sx={{ color: 'neutral.600' }}>
              Workflow visibility and bottleneck tracking
            </Typography>
          </Box>
          {!isOrgViewer && (
            <Button
              variant="outlined"
              color="neutral"
              size="sm"
              loading={exportingWord}
              onClick={handleExportWord}
              startDecorator={
                <span style={{ fontSize: '1rem' }}>📄</span>
              }
              sx={{ alignSelf: 'flex-start', whiteSpace: 'nowrap' }}
            >
              تصدير تقرير Word
            </Button>
          )}
        </Box>

        {/* Workflow Performance Report launcher — filters + DOCX export only, no on-screen report */}
        <WorkflowPerformanceReportPanel hierarchy={hierarchy} loadingHierarchy={loadingHierarchy} />

        {/* Scope Banner — shown only to scoped administrative users */}
        {(roles.includes('SECTION_ADMIN') || roles.includes('DEPARTMENT_ADMIN') || roles.includes('ADMINISTRATION_ADMIN')) && (
          <Box sx={{ mb: 2 }}>
            <Card variant="soft" color="neutral" sx={{ p: 1.5 }}>
              <Typography level="body-sm">
                <strong>
                  {roles.includes('SECTION_ADMIN') ? 'Section Administrator' :
                   roles.includes('DEPARTMENT_ADMIN') ? 'Department Administrator' :
                   'Administration Administrator'}
                </strong>
                {user?.department_display_name ? ` — ${user.department_display_name}` : ''}
                {' '}— You are viewing data scoped to your assigned unit only.
              </Typography>
            </Card>
          </Box>
        )}

        {/* Charts */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography level="title-md" sx={{ mb: 2, fontWeight: 600 }}>Current Workflow Ownership</Typography>
            <Box sx={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {ownershipData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={ownershipData} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80}>
                      {ownershipData.map((entry, index) => (
                        <Cell key={`ownership-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={renderPieTooltip(ownershipTotal)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography level="body-sm" sx={{ color: 'neutral.500' }}>No data available for chart</Typography>
              )}
            </Box>
          </Card>

          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography level="title-md" sx={{ mb: 2, fontWeight: 600 }}>Force Close Distribution</Typography>
            <Box sx={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {forceCloseData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={forceCloseData} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80}>
                      {forceCloseData.map((entry, index) => (
                        <Cell key={`force-close-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={renderPieTooltip(forceCloseTotal)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography level="body-sm" sx={{ color: 'neutral.500' }}>No data available for chart</Typography>
              )}
            </Box>
          </Card>
        </Box>

        {/* ============================
            WORKLOAD TABS
            ============================ */}
        <Box sx={{ mt: 4 }}>
          <Typography level="h4" sx={{ fontWeight: 700, mb: 1 }}>
            📊 Workload Overview
          </Typography>
          <Typography level="body-sm" sx={{ color: 'neutral.600', mb: 3 }}>
            Cases grouped by the Incident they belong to, organized under the target unit
          </Typography>

          {/* Workload — flat view, all roles */}
                {/* Filter Bar */}
                <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <FormControl size="sm" sx={{ minWidth: 150 }}>
                      <FormLabel>Date Range</FormLabel>
                      <Select value={dateRange} onChange={(e, v) => setDateRange(v)}>
                        <Option value="7">Last 7 days</Option>
                        <Option value="30">Last 30 days</Option>
                        <Option value="60">Last 60 days</Option>
                        <Option value="90">Last 90 days</Option>
                        <Option value="all">All Time</Option>
                      </Select>
                    </FormControl>
                    <Button size="sm" variant="outlined" color="neutral" onClick={resetFilters} sx={{ alignSelf: 'flex-end' }}>
                      Reset Filters
                    </Button>
                    <FormControl size="sm" sx={{ minWidth: 280, ml: 'auto' }}>
                      <FormLabel>Search</FormLabel>
                      <Input
                        placeholder="INC-000001, case #, patient name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        startDecorator="🔍"
                      />
                    </FormControl>
                  </Box>
                </Card>

                {inboxLoadError ? (
                  <Card variant="soft" color="danger" sx={{ p: 3 }}>
                    <Typography level="title-md" sx={{ mb: 1, fontWeight: 700 }}>⚠️ Failed to Load Workload Data</Typography>
                    <Typography level="body-sm" sx={{ mb: 2 }}>{inboxLoadError}</Typography>
                    <Button size="sm" color="danger" onClick={loadInsightData}>Retry</Button>
                  </Card>
                ) : filteredInbox.length === 0 && searchTerm ? (
                  <Card variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                    <Typography level="h4" sx={{ color: 'neutral.500', mb: 1 }}>🔍 No results found</Typography>
                    <Typography level="body-sm" sx={{ color: 'neutral.400' }}>No cases match "{searchTerm}"</Typography>
                  </Card>
                ) : groupedInbox.length === 0 ? (
                  <Card variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                    <Typography level="h4" sx={{ color: 'neutral.500', mb: 1 }}>✅ No pending cases found</Typography>
                    <Typography level="body-sm" sx={{ color: 'neutral.400' }}>All units are up to date</Typography>
                  </Card>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {orgTypeGroups.map(group => (
                      <Card key={group.key} variant="outlined" sx={{ overflow: 'hidden', borderLeft: `4px solid ${group.color}` }}>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, background: group.gradient, cursor: 'pointer' }}
                          onClick={() => toggleOrgGroup(group.key)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography level="title-lg" sx={{ fontWeight: 700, color: 'white' }}>{group.title}</Typography>
                            <Box sx={{ backgroundColor: 'rgba(255,255,255,0.3)', px: 1.5, py: 0.5, borderRadius: '12px' }}>
                              <Typography level="body-sm" sx={{ fontWeight: 700, color: 'white' }}>
                                {group.items.length} unit{group.items.length !== 1 ? 's' : ''}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography level="body-md" sx={{ color: 'white', fontWeight: 600 }}>
                            {expandedGroups[group.key] ? '▲' : '▼'}
                          </Typography>
                        </Box>
                        {expandedGroups[group.key] && (
                          <Box sx={{ p: 2, backgroundColor: '#fafafa' }}>
                            {group.items.map(section => (
                              <SectionCard
                                key={section.section_id}
                                section={section}
                                isExpanded={expandedSections[section.section_id] || false}
                                onToggleExpand={() => toggleSectionExpand(section.section_id)}
                                onFillData={canIntervene ? handleFillData : undefined}
                                onGiveMoreTime={canIntervene ? handleGiveMoreTime : undefined}
                              />
                            ))}
                          </Box>
                        )}
                      </Card>
                    ))}
                  </Box>
                )}
                {/* ── Patient Services workflow section ── */}
                {renderPatientServicesCard(canIntervene)}

                {/* ── Force-Closed-At-Administration — separate Complaint Supervisor concern.
                     AT_SECTION/AT_DEPARTMENT escalations are merged into the Department/Administration
                     groups above; AT_ADMINISTRATION has nowhere further to escalate and stays here. ── */}
                {roles.includes('COMPLAINT_SUPERVISOR') && (fcPipelineCases.length > 0 || fcPipelineError) && (
                  <Box sx={{ mt: 4 }}>
                    <Card variant="outlined" sx={{ overflow: 'hidden', borderLeft: '4px solid #e17055' }}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: 2, background: 'linear-gradient(135deg, #e17055 0%, #d63031 100%)', cursor: 'pointer' }}
                        onClick={() => toggleOrgGroup('FC_ADMIN')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography level="title-lg" sx={{ fontWeight: 700, color: 'white' }}>
                            Force Closed at Administration — Awaiting Intervention
                          </Typography>
                          <Box sx={{ backgroundColor: 'rgba(255,255,255,0.3)', px: 1.5, py: 0.5, borderRadius: '12px' }}>
                            <Typography level="body-sm" sx={{ fontWeight: 700, color: 'white' }}>
                              {fcPipelineCases.length}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography level="body-md" sx={{ color: 'white', fontWeight: 600 }}>
                          {expandedGroups.FC_ADMIN ? '▲' : '▼'}
                        </Typography>
                      </Box>
                      {expandedGroups.FC_ADMIN && (
                        <Box sx={{ p: 2, backgroundColor: '#fff5f5' }}>
                          {fcPipelineError ? (
                            <Typography level="body-sm" color="danger">{fcPipelineError}</Typography>
                          ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {fcPipelineCases.map(subcase => (
                                <SubcaseCard
                                  key={subcase.subcase_id}
                                  subcase={subcase}
                                  onFillData={handleFillData}
                                  onGiveMoreTime={handleGiveMoreTime}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      )}
                    </Card>
                  </Box>
                )}
        </Box>
      </Box>

      {/* Case Review Modal — Give More Time from Insight pipeline panel */}
      <CaseReviewModal
        open={reviewModalOpen}
        item={reviewModalItem}
        onClose={() => { setReviewModalOpen(false); setReviewModalItem(null); }}
        onSuccess={() => { setReviewModalOpen(false); setReviewModalItem(null); loadInsightData(); }}
      />
    </MainLayout>
  );
};

export default InsightPage;
