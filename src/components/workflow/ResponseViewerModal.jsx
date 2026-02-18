/**
 * ResponseViewerModal — Read-Only Viewer for Subcase Response Data
 *
 * Purpose:
 * - Displays the explanation text + action items submitted for a subcase
 * - Lets department heads / admins review BEFORE they accept or reject
 * - Purely read-only — no mutations, no business logic
 *
 * Architecture:
 * - Fetches data on open via workflowApi.getSubcaseResponse()
 * - Backend guards authorization (same role-scope rules as inbox)
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
} from '@mui/joy';
import { getSubcaseResponse } from '../../api/workflowApi';

const ResponseViewerModal = ({ open, onClose, subcaseId }) => {
  // ============================
  // STATE
  // ============================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responseData, setResponseData] = useState(null);

  // ============================
  // FETCH ON OPEN
  // ============================
  useEffect(() => {
    if (open && subcaseId) {
      fetchResponse();
    }
    if (!open) {
      // Reset on close
      setResponseData(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, subcaseId]);

  const fetchResponse = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubcaseResponse(subcaseId);
      setResponseData(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No response has been submitted for this subcase yet.');
      } else if (err.response?.status === 403) {
        setError('You are not authorized to view this response.');
      } else {
        setError(err.message || 'Failed to load response data.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // ACTION ITEM STATUS CHIP
  // ============================
  const getActionItemStatusChip = (status) => {
    const map = {
      DRAFT: { label: 'Draft', color: 'neutral' },
      PENDING: { label: 'Pending', color: 'warning' },
      IN_PROGRESS: { label: 'In Progress', color: 'primary' },
      COMPLETED: { label: 'Completed', color: 'success' },
      CANCELLED: { label: 'Cancelled', color: 'danger' },
    };
    const entry = map[status] || { label: status || '—', color: 'neutral' };
    return (
      <Chip size="sm" variant="soft" color={entry.color}>
        {entry.label}
      </Chip>
    );
  };

  // ============================
  // RENDER
  // ============================
  return (
    <Modal open={open} onClose={onClose} sx={{ zIndex: 9999 }}>
      <ModalDialog
        variant="outlined"
        sx={{
          maxWidth: 650,
          width: '92%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <ModalClose />

        <Typography level="h4" sx={{ mb: 1 }}>
          Submitted Response
        </Typography>
        <Typography level="body-sm" sx={{ mb: 2, color: 'neutral.600' }}>
          Subcase #{subcaseId}
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
            <Typography level="body-md">Loading response…</Typography>
          </Box>
        )}

        {/* Error */}
        {error && !loading && (
          <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
            <Typography level="body-sm">{error}</Typography>
          </Alert>
        )}

        {/* Content */}
        {responseData && !loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Submitter Info */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Typography level="body-sm" sx={{ color: 'neutral.600' }}>
                <strong>Submitted by:</strong> {responseData.submittedBy}
              </Typography>
              {responseData.submittedAt && (
                <Typography level="body-sm" sx={{ color: 'neutral.600' }}>
                  <strong>Date:</strong> {responseData.submittedAt.toLocaleDateString()}
                </Typography>
              )}
            </Box>

            {/* Explanation or Rejection */}
            <Card variant="soft" color={responseData.isRejection ? 'danger' : 'primary'} sx={{ p: 2 }}>
              <Typography level="title-sm" sx={{ mb: 1 }}>
                {responseData.isRejection ? 'Section Rejection Reason' : 'Explanation'}
              </Typography>
              <Typography level="body-md" sx={{ whiteSpace: 'pre-wrap' }}>
                {responseData.explanationText || '(No explanation provided)'}
              </Typography>
            </Card>

            {/* Action Items */}
            <Box>
              <Typography level="title-md" sx={{ mb: 1 }}>
                Action Items ({responseData.actionItems.length})
              </Typography>

              {responseData.actionItems.length === 0 && (
                <Typography level="body-sm" sx={{ color: 'neutral.500', fontStyle: 'italic' }}>
                  No action items were submitted.
                </Typography>
              )}

              {responseData.actionItems.map((item, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 1.5, p: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography level="title-sm">
                      {index + 1}. {item.title}
                    </Typography>
                    {item.status && getActionItemStatusChip(item.status)}
                  </Box>

                  {item.description && (
                    <Typography level="body-sm" sx={{ mb: 0.5, whiteSpace: 'pre-wrap' }}>
                      {item.description}
                    </Typography>
                  )}

                  {item.dueDate && (
                    <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
                      Due: {item.dueDate}
                    </Typography>
                  )}
                </Card>
              ))}
            </Box>
          </Box>
        )}
      </ModalDialog>
    </Modal>
  );
};

export default ResponseViewerModal;
