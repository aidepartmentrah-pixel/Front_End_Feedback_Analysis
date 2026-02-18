/**
 * SeasonalReportViewerModal — Read-Only Viewer for Seasonal Report Data
 *
 * Purpose:
 * - Displays the seasonal report summary when "View" is clicked on a
 *   SEASONAL_REPORT inbox item
 * - Shows: compliance status, severity/domain counts, classification breakdown
 * - Purely read-only — no mutations, no business logic
 *
 * Architecture:
 * - Fetches data on open via workflowApi.getSeasonalReportDetail()
 * - Backend guards authorization (scope check on org unit)
 * - No role checks or permission logic in this component
 */

import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Box,
  Card,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Table,
} from '@mui/joy';
import { getSeasonalReportDetail } from '../../api/workflowApi';

const SeasonalReportViewerModal = ({ open, onClose, seasonalReportId }) => {
  // ============================
  // STATE
  // ============================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  // ============================
  // FETCH ON OPEN
  // ============================
  useEffect(() => {
    if (open && seasonalReportId) {
      fetchReport();
    }
    if (!open) {
      setReportData(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, seasonalReportId]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSeasonalReportDetail(seasonalReportId);
      setReportData(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Seasonal report not found.');
      } else if (err.response?.status === 403) {
        setError('You are not authorized to view this report.');
      } else {
        setError(err.message || 'Failed to load seasonal report.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // RENDER
  // ============================
  const header = reportData?.header;
  const stats = reportData?.classification_stats || [];
  const policy = reportData?.policy_snapshot;

  return (
    <Modal open={open} onClose={onClose} sx={{ zIndex: 9999 }}>
      <ModalDialog
        variant="outlined"
        sx={{
          maxWidth: 750,
          width: '95%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <ModalClose />

        <Typography level="h4" sx={{ mb: 1 }}>
          Seasonal Report
        </Typography>
        <Typography level="body-sm" sx={{ mb: 2, color: 'neutral.600' }}>
          Report #{seasonalReportId}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Loading */}
        {loading && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 6,
              gap: 2,
            }}
          >
            <CircularProgress size="lg" />
            <Typography level="body-md">Loading report…</Typography>
          </Box>
        )}

        {/* Error */}
        {error && !loading && (
          <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
            <Typography level="body-sm">{error}</Typography>
          </Alert>
        )}

        {/* Content */}
        {header && !loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* ---- Report Info ---- */}
            <Card variant="soft" color="neutral" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between' }}>
                <Box>
                  <Typography level="body-xs" sx={{ color: 'neutral.500' }}>Period</Typography>
                  <Typography level="title-md">{header.period || '—'}</Typography>
                </Box>
                <Box>
                  <Typography level="body-xs" sx={{ color: 'neutral.500' }}>Org Unit</Typography>
                  <Typography level="title-md">{header.orgunit_name || `Unit ${header.orgunit_id}`}</Typography>
                </Box>
                <Box>
                  <Typography level="body-xs" sx={{ color: 'neutral.500' }}>Total Cases</Typography>
                  <Typography level="title-md">{header.total_cases ?? '—'}</Typography>
                </Box>
                <Box>
                  <Typography level="body-xs" sx={{ color: 'neutral.500' }}>Compliance</Typography>
                  <Chip
                    size="sm"
                    variant="solid"
                    color={header.is_compliant ? 'success' : 'danger'}
                  >
                    {header.is_compliant ? 'Compliant' : 'Non-Compliant'}
                  </Chip>
                </Box>
              </Box>
            </Card>

            {/* ---- Violated Rules ---- */}
            {header.violated_rules && (
              <Alert color="warning" variant="soft">
                <Typography level="body-sm">
                  <strong>Violated Rules:</strong> {header.violated_rules}
                </Typography>
              </Alert>
            )}

            {/* ---- Severity Breakdown ---- */}
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography level="title-sm" sx={{ mb: 1 }}>Severity Breakdown</Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography level="h3" sx={{ color: 'success.500' }}>
                    {header.low_severity_count ?? 0}
                  </Typography>
                  <Typography level="body-xs">Low</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography level="h3" sx={{ color: 'warning.500' }}>
                    {header.medium_severity_count ?? 0}
                  </Typography>
                  <Typography level="body-xs">Medium</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography level="h3" sx={{ color: 'danger.500' }}>
                    {header.high_severity_count ?? 0}
                  </Typography>
                  <Typography level="body-xs">High</Typography>
                </Box>
              </Box>
            </Card>

            {/* ---- Domain Breakdown ---- */}
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography level="title-sm" sx={{ mb: 1 }}>Domain Breakdown</Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography level="h3" sx={{ color: 'primary.500' }}>
                    {header.clinical_domain_count ?? 0}
                  </Typography>
                  <Typography level="body-xs">Clinical</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography level="h3" sx={{ color: 'warning.500' }}>
                    {header.management_domain_count ?? 0}
                  </Typography>
                  <Typography level="body-xs">Management</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography level="h3" sx={{ color: 'neutral.500' }}>
                    {header.relational_domain_count ?? 0}
                  </Typography>
                  <Typography level="body-xs">Relational</Typography>
                </Box>
              </Box>
            </Card>

            {/* ---- Policy Thresholds ---- */}
            {policy && (
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography level="title-sm" sx={{ mb: 1 }}>Policy Thresholds</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Typography level="body-sm">
                    Low limit: <strong>{policy.low_severity_limit}</strong>
                  </Typography>
                  <Typography level="body-sm">
                    Medium limit: <strong>{policy.medium_severity_limit}</strong>
                  </Typography>
                  <Typography level="body-sm">
                    High limit: <strong>{policy.high_severity_limit}</strong>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                  <Typography level="body-sm">
                    Clinical limit: <strong>{policy.clinical_domain_limit}</strong>
                  </Typography>
                  <Typography level="body-sm">
                    Management limit: <strong>{policy.management_domain_limit}</strong>
                  </Typography>
                  <Typography level="body-sm">
                    Relational limit: <strong>{policy.relational_domain_limit}</strong>
                  </Typography>
                </Box>
              </Card>
            )}

            {/* ---- Classification Stats Table ---- */}
            {stats.length > 0 && (
              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  Classification Breakdown ({stats.length})
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table
                    variant="outlined"
                    size="sm"
                    sx={{
                      '& thead th': {
                        fontWeight: 600,
                        backgroundColor: 'neutral.50',
                        fontSize: '0.75rem',
                      },
                      '& tbody td': {
                        fontSize: '0.75rem',
                      },
                    }}
                  >
                    <thead>
                      <tr>
                        <th>Domain</th>
                        <th>Category</th>
                        <th>Classification</th>
                        <th style={{ textAlign: 'center' }}>Total</th>
                        <th style={{ textAlign: 'center' }}>Low</th>
                        <th style={{ textAlign: 'center' }}>Med</th>
                        <th style={{ textAlign: 'center' }}>High</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.map((s, i) => (
                        <tr key={i}>
                          <td>{s.domain_name || '—'}</td>
                          <td>{s.category_name || '—'}</td>
                          <td>{s.classification_name || s.classification_name_en || '—'}</td>
                          <td style={{ textAlign: 'center' }}>{s.total_count}</td>
                          <td style={{ textAlign: 'center' }}>{s.low_count}</td>
                          <td style={{ textAlign: 'center' }}>{s.medium_count}</td>
                          <td style={{ textAlign: 'center' }}>{s.high_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Box>
              </Box>
            )}

            {stats.length === 0 && (
              <Typography level="body-sm" sx={{ color: 'neutral.500', fontStyle: 'italic' }}>
                No classification breakdown available for this report.
              </Typography>
            )}
          </Box>
        )}
      </ModalDialog>
    </Modal>
  );
};

export default SeasonalReportViewerModal;
