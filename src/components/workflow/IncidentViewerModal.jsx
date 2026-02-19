/**
 * IncidentViewerModal — Read-Only Viewer for Incident Case Data
 *
 * Purpose:
 * - Displays the incident case details when "View" is clicked
 * - Shows: complaint text, classification, dates, departments, actions
 * - Purely read-only — no mutations, suitable for section admins
 *
 * Architecture:
 * - Fetches data on open via complaints.getRecordById()
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
} from '@mui/joy';
import { getWorkflowIncidentDetail } from '../../api/workflowApi';

const IncidentViewerModal = ({ open, onClose, incidentId }) => {
  // ============================
  // STATE
  // ============================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recordData, setRecordData] = useState(null);

  // ============================
  // FETCH ON OPEN
  // ============================
  useEffect(() => {
    if (open && incidentId) {
      fetchRecord();
    }
    if (!open) {
      setRecordData(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, incidentId]);

  const fetchRecord = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWorkflowIncidentDetail(incidentId);
      setRecordData(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Incident record not found.');
      } else if (err.response?.status === 403) {
        setError('You are not authorized to view this record.');
      } else {
        setError(err.message || 'Failed to load incident record.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // RENDER HELPER
  // ============================
  const InfoRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
      <Typography level="body-sm" fontWeight="bold" sx={{ minWidth: 140 }}>
        {label}:
      </Typography>
      <Typography level="body-sm">{value || '—'}</Typography>
    </Box>
  );

  // ============================
  // RENDER
  // ============================
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
          Case Details
        </Typography>
        <Typography level="body-sm" sx={{ mb: 2, color: 'neutral.600' }}>
          Case #{incidentId}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert color="danger" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Record Data */}
        {recordData && !loading && !error && (
          <>
            {/* Complaint Text */}
            <Card variant="soft" sx={{ mb: 2, p: 2 }}>
              <Typography level="title-sm" sx={{ mb: 1 }}>
                Complaint Text
              </Typography>
              <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap' }}>
                {recordData.complaint_text || '—'}
              </Typography>
            </Card>

            {/* Classification Info */}
            <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Typography level="title-sm" sx={{ mb: 1 }}>
                Classification
              </Typography>
              <InfoRow label="Domain" value={recordData.domain_name} />
              <InfoRow label="Category" value={recordData.category_name} />
              <InfoRow label="Subcategory" value={recordData.subcategory_name} />
              <InfoRow label="Classification" value={recordData.classification_name} />
              <InfoRow label="Severity" value={recordData.severity_name} />
            </Card>

            {/* Department Info */}
            <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Typography level="title-sm" sx={{ mb: 1 }}>
                Department Information
              </Typography>
              <InfoRow label="Issuing Department" value={recordData.issuing_department_name} />
              <InfoRow label="Target Departments" value={recordData.target_departments?.map(d => d.name).join(', ')} />
              <InfoRow label="Building" value={recordData.building} />
              <InfoRow label="In/Out" value={recordData.in_out} />
            </Card>

            {/* Dates */}
            <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Typography level="title-sm" sx={{ mb: 1 }}>
                Timeline
              </Typography>
              <InfoRow label="Feedback Date" value={recordData.feedback_received_date} />
              <InfoRow label="Created At" value={recordData.created_at} />
            </Card>

            {/* Actions Taken */}
            {(recordData.immediate_action || recordData.taken_action) && (
              <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  Actions
                </Typography>
                {recordData.immediate_action && (
                  <>
                    <Typography level="body-xs" fontWeight="bold">Immediate Action:</Typography>
                    <Typography level="body-sm" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                      {recordData.immediate_action}
                    </Typography>
                  </>
                )}
                {recordData.taken_action && (
                  <>
                    <Typography level="body-xs" fontWeight="bold">Action Taken:</Typography>
                    <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap' }}>
                      {recordData.taken_action}
                    </Typography>
                  </>
                )}
              </Card>
            )}

            {/* Patient Info (if present) */}
            {recordData.patient_name && (
              <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  Patient Information
                </Typography>
                <InfoRow label="Patient Name" value={recordData.patient_name} />
              </Card>
            )}

            {/* People Involved */}
            {(recordData.doctors?.length > 0 || recordData.employees?.length > 0) && (
              <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  People Involved
                </Typography>
                {recordData.doctors?.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography level="body-xs" fontWeight="bold">Doctors:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {recordData.doctors.map((doc, idx) => (
                        <Chip key={idx} size="sm" variant="soft" color="primary">
                          {doc.name || doc.full_name || `Doctor #${doc.doctor_id}`}
                        </Chip>
                      ))}
                    </Box>
                  </Box>
                )}
                {recordData.employees?.length > 0 && (
                  <Box>
                    <Typography level="body-xs" fontWeight="bold">Employees:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {recordData.employees.map((emp, idx) => (
                        <Chip key={idx} size="sm" variant="soft" color="neutral">
                          {emp.full_name || emp.employee_name || emp.name || `Employee #${emp.employee_id}`}
                        </Chip>
                      ))}
                    </Box>
                  </Box>
                )}
              </Card>
            )}
          </>
        )}
      </ModalDialog>
    </Modal>
  );
};

export default IncidentViewerModal;
