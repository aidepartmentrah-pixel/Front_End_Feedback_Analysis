/**
 * PHASE K — K-UI-1 — Migration Main Page
 * 
 * Purpose:
 * - List legacy cases not yet migrated
 * - Display migration progress
 * - Allow viewing/migrating individual cases
 * 
 * Architecture:
 * - Uses migrationApi for all data
 * - Navigation only (no migration logic here)
 * - Paginated table view
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Card, 
  Typography, 
  Table, 
  Button, 
  CircularProgress, 
  LinearProgress,
  Chip,
  Alert
} from '@mui/joy';
import MainLayout from '../components/common/MainLayout';
import { fetchLegacyCases, fetchMigrationProgress } from '../api/migrationApi';

const MigrationMainPage = () => {
  // ============================
  // STATE
  // ============================
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20); // Fixed page size
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Progress state
  const [progress, setProgress] = useState({
    total: 0,
    migrated: 0,
    percent: 0,
  });
  const [progressLoading, setProgressLoading] = useState(true);

  // ============================
  // LOAD DATA ON MOUNT / PAGE CHANGE
  // ============================
  useEffect(() => {
    loadLegacyCases();
  }, [page]);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadLegacyCases = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchLegacyCases(page, pageSize);
      setCases(data.cases);
      setTotal(data.total);
    } catch (err) {
      setError(err.message || 'Failed to load legacy cases');
      console.error('Error loading legacy cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    setProgressLoading(true);
    
    try {
      const data = await fetchMigrationProgress();
      setProgress(data);
    } catch (err) {
      console.error('Error loading migration progress:', err);
      // Don't show error for progress - it's not critical
    } finally {
      setProgressLoading(false);
    }
  };

  // ============================
  // PAGINATION HANDLERS
  // ============================
  const totalPages = Math.ceil(total / pageSize);
  const startRecord = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, total);

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  // ============================
  // NAVIGATION HANDLERS
  // ============================
  const handleViewCase = (legacyId) => {
    navigate(`/migration/view/${legacyId}`);
  };

  const handleMigrateCase = (legacyId) => {
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

  const truncateText = (text, maxLength = 120) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // ============================
  // RENDER
  // ============================
  return (
    <MainLayout pageTitle="Data Migration">
      <Box sx={{ p: 3 }}>
        {/* Progress Card */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography level="h4" sx={{ mb: 1 }}>
              Migration Progress
            </Typography>
            {progressLoading ? (
              <CircularProgress size="sm" />
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography level="body-sm">
                    {progress.migrated} of {progress.total} cases migrated
                  </Typography>
                  <Typography level="body-sm" fontWeight="bold">
                    {progress.percent.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  determinate 
                  value={progress.percent} 
                  sx={{ height: 8 }}
                  color={progress.percent === 100 ? 'success' : 'primary'}
                />
              </>
            )}
          </Box>
        </Card>

        {/* Legacy Cases Table Card */}
        <Card variant="outlined">
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography level="h4">
              Legacy Cases ({total})
            </Typography>
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={() => {
                loadLegacyCases();
                loadProgress();
              }}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>

          {/* Error State */}
          {error && (
            <Alert color="danger" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Empty State */}
          {!loading && !error && cases.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography level="body-lg" color="neutral">
                No legacy cases found
              </Typography>
            </Box>
          )}

          {/* Table */}
          {!loading && !error && cases.length > 0 && (
            <>
              <Table
                variant="outlined"
                sx={{
                  '& thead th': {
                    fontWeight: 600,
                    backgroundColor: 'neutral.50',
                  },
                }}
              >
                <thead>
                  <tr>
                    <th style={{ width: '8%' }}>Legacy ID</th>
                    <th style={{ width: '15%' }}>Patient Name</th>
                    <th style={{ width: '12%' }}>Feedback Date</th>
                    <th style={{ width: '35%' }}>Preview</th>
                    <th style={{ width: '12%' }}>Issuing Org</th>
                    <th style={{ width: '18%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((legacyCase) => (
                    <tr key={legacyCase.legacy_case_id || legacyCase.id}>
                      <td>
                        <Typography level="body-sm" fontWeight="bold">
                          #{legacyCase.legacy_case_id || legacyCase.id}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm">
                          {legacyCase.patient_name || 'N/A'}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm">
                          {formatDate(legacyCase.feedback_date || legacyCase.feedback_received_date)}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm" sx={{ fontSize: '0.85rem' }}>
                          {truncateText(
                            legacyCase.short_preview_text || 
                            legacyCase.complaint_content || 
                            legacyCase.preview
                          )}
                        </Typography>
                      </td>
                      <td>
                        <Chip size="sm" variant="soft" color="neutral">
                          {legacyCase.issuing_org_name || legacyCase.department_name || 'N/A'}
                        </Chip>
                      </td>
                      <td>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="sm"
                            variant="outlined"
                            color="neutral"
                            onClick={() => handleViewCase(legacyCase.legacy_case_id || legacyCase.id)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="solid"
                            color="primary"
                            onClick={() => handleMigrateCase(legacyCase.legacy_case_id || legacyCase.id)}
                          >
                            Migrate
                          </Button>
                        </Box>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                p: 2, 
                borderTop: '1px solid #e0e0e0' 
              }}>
                <Typography level="body-sm">
                  Showing {startRecord}-{endRecord} of {total}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button
                    size="sm"
                    variant="outlined"
                    onClick={handlePrevPage}
                    disabled={page === 1 || loading}
                  >
                    Previous
                  </Button>
                  <Typography level="body-sm" sx={{ mx: 2 }}>
                    Page {page} of {totalPages}
                  </Typography>
                  <Button
                    size="sm"
                    variant="outlined"
                    onClick={handleNextPage}
                    disabled={page >= totalPages || loading}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Card>
      </Box>
    </MainLayout>
  );
};

export default MigrationMainPage;
