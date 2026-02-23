/**
 * PHASE K — K-UI-2 — Migration View Page (Display)
 * 
 * Purpose:
 * - Display legacy case detail (read-only)
 * - Show concatenated text preview
 * - Navigate to Migration Form
 * 
 * Route: /migration/view/:legacyId
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Card, 
  Chip,
  Divider,
  Sheet,
  Button,
  Alert
} from '@mui/joy';
import MainLayout from '../components/common/MainLayout';
import { fetchLegacyCaseDetail } from '../api/migrationApi';

const MigrationViewPage = () => {
  // ⚠️ SAFETY: This page is READ-ONLY
  // - No POST/PUT/DELETE operations
  // - No mutation API calls
  // - No AI/ML classification
  // - No form submissions
  // - Navigation only

  // ============================
  // ROUTE PARAMS & NAVIGATION
  // ============================
  const { legacyId } = useParams();
  const navigate = useNavigate();

  // ============================
  // STATE
  // ============================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [legacyCase, setLegacyCase] = useState(null);

  // ============================
  // LOAD DATA ON MOUNT
  // ============================
  useEffect(() => {
    loadLegacyCase();
  }, [legacyId]);

  const loadLegacyCase = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchLegacyCaseDetail(legacyId);
      setLegacyCase(data);
      console.log('Legacy case detail loaded:', data);
    } catch (err) {
      // Specific error handling
      const errorMsg = err.message || 'Failed to load legacy case details';
      setError(errorMsg);
      console.error('Error loading legacy case:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // NAVIGATION HANDLERS
  // ============================
  const handleBackToList = () => {
    navigate('/migration');
  };

  const handleOpenMigrationForm = () => {
    navigate(`/migration/migrate/${legacyId}`);
  };

  // ============================
  // RENDER HELPERS
  // ============================
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // Extract nested data with fallback field names
  const legacyData = legacyCase?.legacy_case || legacyCase || {};
  const preview = legacyCase?.preview || {};

  // ============================
  // RENDER
  // ============================
  return (
    <MainLayout pageTitle="Migration View">
      <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
        {/* Loading State */}
        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
            }}
          >
            <CircularProgress size="lg" />
          </Box>
        )}

        {/* Error State */}
        {!loading && error && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Alert 
              color="danger" 
              variant="soft" 
              sx={{ mb: 3, maxWidth: '600px', mx: 'auto' }}
            >
              <Box>
                <Typography level="h4" sx={{ mb: 1 }}>
                  {error.includes('404') || error.includes('not found') 
                    ? 'Legacy Case Not Found' 
                    : 'Error Loading Case'}
                </Typography>
                <Typography level="body-md">
                  {error}
                </Typography>
              </Box>
            </Alert>
            <Button 
              variant="outlined" 
              color="neutral"
              onClick={handleBackToList}
            >
              Back to Migration List
            </Button>
          </Box>
        )}

        {/* DISPLAY SECTIONS */}
        {!loading && !error && legacyCase && (
          <>
            {/* ========================================
                SECTION A — HEADER CARD
            ======================================== */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <Box sx={{ mb: 2 }}>
                <Typography level="h3" sx={{ mb: 1 }}>
                  Legacy Case #{legacyData.legacy_case_id || legacyId}
                </Typography>
                <Divider sx={{ my: 2 }} />
              </Box>

              {/* Metadata Grid */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                  gap: 2,
                }}
              >
                {/* Patient Name */}
                <Box>
                  <Typography level="body-sm" fontWeight={600} color="neutral" sx={{ mb: 0.5 }}>
                    Patient Name
                  </Typography>
                  <Typography level="body-md">
                    {legacyData.patient_name || 'N/A'}
                  </Typography>
                </Box>

                {/* Feedback Date */}
                <Box>
                  <Typography level="body-sm" fontWeight={600} color="neutral" sx={{ mb: 0.5 }}>
                    Feedback Date
                  </Typography>
                  <Typography level="body-md">
                    {formatDate(legacyData.feedback_received_date || legacyData.feedback_date)}
                  </Typography>
                </Box>

                {/* Issuing Org Unit */}
                <Box>
                  <Typography level="body-sm" fontWeight={600} color="neutral" sx={{ mb: 0.5 }}>
                    Issuing Organization
                  </Typography>
                  <Chip size="sm" variant="soft" color="primary">
                    {legacyData.issuing_org_unit_name || legacyData.issuing_org_name || legacyData.department_name || 'N/A'}
                  </Chip>
                </Box>

                {/* Doctor Names */}
                {legacyData.doctor_names && legacyData.doctor_names.length > 0 && (
                  <Box>
                    <Typography level="body-sm" fontWeight={600} color="neutral" sx={{ mb: 0.5 }}>
                      Doctor(s)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {legacyData.doctor_names.map((name, idx) => (
                        <Chip key={idx} size="sm" variant="outlined" color="neutral">
                          {name}
                        </Chip>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Card>

            {/* ========================================
                SECTION B — TEXT BLOCKS (READ-ONLY)
            ======================================== */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <Typography level="h4" sx={{ mb: 2 }}>
                Case Content Preview
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Complaint Content */}
              <Box sx={{ mb: 3 }}>
                <Typography level="body-sm" fontWeight={600} color="neutral" sx={{ mb: 1 }}>
                  Complaint Content
                </Typography>
                <Sheet
                  variant="soft"
                  sx={{
                    p: 2,
                    borderRadius: 'sm',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                  }}
                >
                  {preview.complaint_content || preview.complaint_text || 'N/A'}
                </Sheet>
              </Box>

              {/* Immediate Action */}
              <Box sx={{ mb: 3 }}>
                <Typography level="body-sm" fontWeight={600} color="neutral" sx={{ mb: 1 }}>
                  Immediate Action
                </Typography>
                <Sheet
                  variant="soft"
                  sx={{
                    p: 2,
                    borderRadius: 'sm',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                  }}
                >
                  {preview.immediate_action || 'N/A'}
                </Sheet>
              </Box>

              {/* Actions Taken */}
              <Box>
                <Typography level="body-sm" fontWeight={600} color="neutral" sx={{ mb: 1 }}>
                  Actions Taken
                </Typography>
                <Sheet
                  variant="soft"
                  sx={{
                    p: 2,
                    borderRadius: 'sm',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                  }}
                >
                  {preview.actions_taken || preview.taken_action || 'N/A'}
                </Sheet>
              </Box>
            </Card>

            {/* ========================================
                SECTION C — META FIELDS (READ-ONLY)
            ======================================== */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <Typography level="h4" sx={{ mb: 2 }}>
                Classification & Metadata
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                {/* Domain */}
                {legacyData.domain_name && (
                  <Box>
                    <Typography level="body-sm" fontWeight={600} color="neutral" sx={{ mb: 0.5 }}>
                      Domain
                    </Typography>
                    <Typography level="body-md">{legacyData.domain_name}</Typography>
                  </Box>
                )}

                {/* Category */}
                {legacyData.category_name && (
                  <Box>
                    <Typography level="body-sm" fontWeight={600} color="neutral" sx={{ mb: 0.5 }}>
                      Category
                    </Typography>
                    <Typography level="body-md">{legacyData.category_name}</Typography>
                  </Box>
                )}

                {/* Subcategory */}
                {legacyData.subcategory_name && (
                  <Box>
                    <Typography level="body-sm" fontWeight={600} color="neutral" sx={{ mb: 0.5 }}>
                      Subcategory
                    </Typography>
                    <Typography level="body-md">{legacyData.subcategory_name}</Typography>
                  </Box>
                )}

                {/* Severity */}
                {legacyData.severity_name && (
                  <Box>
                    <Typography level="body-sm" fontWeight={600} color="neutral" sx={{ mb: 0.5 }}>
                      Severity
                    </Typography>
                    <Chip size="sm" variant="soft" color="danger">
                      {legacyData.severity_name}
                    </Chip>
                  </Box>
                )}

                {/* Stage */}
                {legacyData.stage_name && (
                  <Box>
                    <Typography level="body-sm" fontWeight={600} color="neutral" sx={{ mb: 0.5 }}>
                      Stage
                    </Typography>
                    <Chip size="sm" variant="soft" color="neutral">
                      {legacyData.stage_name}
                    </Chip>
                  </Box>
                )}

                {/* Harm Level */}
                {legacyData.harm_name && (
                  <Box>
                    <Typography level="body-sm" fontWeight={600} color="neutral" sx={{ mb: 0.5 }}>
                      Harm Level
                    </Typography>
                    <Chip size="sm" variant="soft" color="warning">
                      {legacyData.harm_name}
                    </Chip>
                  </Box>
                )}

                {/* Source */}
                {legacyData.source_name && (
                  <Box>
                    <Typography level="body-sm" fontWeight={600} color="neutral" sx={{ mb: 0.5 }}>
                      Source
                    </Typography>
                    <Typography level="body-md">{legacyData.source_name}</Typography>
                  </Box>
                )}
              </Box>
            </Card>

            {/* ========================================
                SECTION D — LEGACY REFERENCE DATA (for copy during migration)
            ======================================== */}
            {legacyData.legacy_data && (
              <Card variant="outlined" sx={{ mb: 3, backgroundColor: 'warning.softBg' }}>
                <Typography level="h4" sx={{ mb: 1 }}>
                  📋 Legacy Reference Data
                </Typography>
                <Typography level="body-sm" color="neutral" sx={{ mb: 2 }}>
                  These fields are from the old system. Copy values manually to the migration form as needed.
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                    gap: 2,
                  }}
                >
                  {/* Source Department ID */}
                  <Box>
                    <Typography level="body-xs" fontWeight={600} color="neutral" sx={{ mb: 0.5 }}>
                      SourceDepartmentID
                    </Typography>
                    <Sheet variant="soft" sx={{ p: 1, borderRadius: 'sm', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {legacyData.legacy_data.source_department_id ?? 'N/A'}
                    </Sheet>
                  </Box>

                  {/* Source Department Name */}
                  <Box>
                    <Typography level="body-xs" fontWeight={600} color="neutral" sx={{ mb: 0.5 }}>
                      SourceDepartmentName
                    </Typography>
                    <Sheet variant="soft" sx={{ p: 1, borderRadius: 'sm', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {legacyData.legacy_data.source_department_name || 'N/A'}
                    </Sheet>
                  </Box>

                  {/* Source Building */}
                  <Box>
                    <Typography level="body-xs" fontWeight={600} color="neutral" sx={{ mb: 0.5 }}>
                      SourceBuilding
                    </Typography>
                    <Sheet variant="soft" sx={{ p: 1, borderRadius: 'sm', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {legacyData.legacy_data.source_building || 'N/A'}
                    </Sheet>
                  </Box>

                  {/* Case Building */}
                  <Box>
                    <Typography level="body-xs" fontWeight={600} color="neutral" sx={{ mb: 0.5 }}>
                      CaseBuilding
                    </Typography>
                    <Sheet variant="soft" sx={{ p: 1, borderRadius: 'sm', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {legacyData.legacy_data.case_building || 'N/A'}
                    </Sheet>
                  </Box>

                  {/* Doctor ID */}
                  <Box>
                    <Typography level="body-xs" fontWeight={600} color="neutral" sx={{ mb: 0.5 }}>
                      DoctorID
                    </Typography>
                    <Sheet variant="soft" sx={{ p: 1, borderRadius: 'sm', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {legacyData.legacy_data.doctor_id || 'N/A'}
                    </Sheet>
                  </Box>

                  {/* Employee ID */}
                  <Box>
                    <Typography level="body-xs" fontWeight={600} color="neutral" sx={{ mb: 0.5 }}>
                      EmployeeID
                    </Typography>
                    <Sheet variant="soft" sx={{ p: 1, borderRadius: 'sm', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {legacyData.legacy_data.employee_id ?? 'N/A'}
                    </Sheet>
                  </Box>

                  {/* Is InPatient */}
                  <Box>
                    <Typography level="body-xs" fontWeight={600} color="neutral" sx={{ mb: 0.5 }}>
                      IsInPatient
                    </Typography>
                    <Sheet variant="soft" sx={{ p: 1, borderRadius: 'sm', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {legacyData.legacy_data.is_inpatient === true ? 'Yes (1)' : legacyData.legacy_data.is_inpatient === false ? 'No (0)' : 'N/A'}
                    </Sheet>
                  </Box>
                </Box>

                {/* Problem Reason - Full Width */}
                {legacyData.legacy_data.problem_reason && (
                  <Box sx={{ mt: 2 }}>
                    <Typography level="body-xs" fontWeight={600} color="neutral" sx={{ mb: 0.5 }}>
                      ProblemReason (from Actions)
                    </Typography>
                    <Sheet
                      variant="soft"
                      sx={{
                        p: 2,
                        borderRadius: 'sm',
                        maxHeight: '150px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                      }}
                    >
                      {legacyData.legacy_data.problem_reason}
                    </Sheet>
                  </Box>
                )}
              </Card>
            )}

            {/* ========================================
                NAVIGATION BUTTONS
            ======================================== */}
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'space-between',
                mt: 3,
                pt: 3,
                borderTop: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Button
                variant="outlined"
                color="neutral"
                size="lg"
                onClick={handleBackToList}
              >
                ← Back to List
              </Button>
              <Button
                variant="solid"
                color="primary"
                size="lg"
                onClick={handleOpenMigrationForm}
              >
                Open Migration Form →
              </Button>
            </Box>
          </>
        )}
      </Box>
    </MainLayout>
  );
};

export default MigrationViewPage;
