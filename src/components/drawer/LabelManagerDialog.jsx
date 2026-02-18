// PHASE G — G-F4 — Label Manager Dialog
// src/components/drawer/LabelManagerDialog.jsx

import React, {useState, useEffect } from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Box,
  Button,
  Card,
  FormControl,
  FormLabel,
  Input,
  Table,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import {
  listDrawerLabels,
  createDrawerLabel,
  disableDrawerLabel,
} from '../../api/drawerLabelsApi';

const LabelManagerDialog = ({ open, onClose }) => {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [newLabelName, setNewLabelName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    if (open) {
      loadLabels();
    }
  }, [open]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadLabels = async () => {
    try {
      setLoading(true);
      setError(null);
      const labelsData = await listDrawerLabels();
      
      // Handle different response formats from backend
      // Backend might return: array, { labels: array }, { data: array }, or null
      let labelsArray = [];
      if (Array.isArray(labelsData)) {
        labelsArray = labelsData;
      } else if (labelsData && Array.isArray(labelsData.labels)) {
        labelsArray = labelsData.labels;
      } else if (labelsData && Array.isArray(labelsData.data)) {
        labelsArray = labelsData.data;
      }
      
      setLabels(labelsArray);
    } catch (err) {
      setError(err.message || 'Failed to load labels');
      console.error('Failed to load labels:', err);
      setLabels([]); // Ensure labels is always an array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLabel = async () => {
    try {
      setCreating(true);
      setError(null);

      const trimmedName = newLabelName.trim();

      // Validation
      if (trimmedName.length < 2) {
        setError('Label name must be at least 2 characters');
        return;
      }

      await createDrawerLabel(trimmedName);

      setSuccess('Label created successfully');
      setNewLabelName('');
      loadLabels();
    } catch (err) {
      setError(err.message || 'Failed to create label');
      console.error('Failed to create label:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDisableLabel = async (labelId) => {
    try {
      setDeletingId(labelId);
      setError(null);

      await disableDrawerLabel(labelId);

      setSuccess('Label disabled successfully');
      setDeleteConfirmId(null);
      loadLabels();
    } catch (err) {
      setError(err.message || 'Failed to disable label');
      console.error('Failed to disable label:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ minWidth: 600, maxWidth: '90vw' }}>
        <ModalClose />
        <Typography level="h4" sx={{ mb: 2 }}>
          Manage Labels
        </Typography>

        {/* Error/Success Messages */}
        {error && (
          <Alert color="danger" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert color="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Create New Label */}
        <Card sx={{ mb: 3, p: 2, background: '#f9f9f9' }}>
          <Typography level="body-md" sx={{ mb: 2, fontWeight: 600 }}>
            Create New Label
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ flex: 1 }}>
              <Input
                placeholder="Enter label name (min 2 characters)"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newLabelName.trim().length >= 2) {
                    handleCreateLabel();
                  }
                }}
              />
            </FormControl>
            <Button
              startDecorator={<AddIcon />}
              onClick={handleCreateLabel}
              loading={creating}
              disabled={creating || newLabelName.trim().length < 2}
              color="primary"
            >
              Create
            </Button>
          </Box>
        </Card>

        {/* Labels List */}
        <Typography level="body-md" sx={{ mb: 1, fontWeight: 600 }}>
          Existing Labels
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : !Array.isArray(labels) || labels.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', background: '#f9f9f9', borderRadius: '8px' }}>
            <Typography level="body-sm" sx={{ color: '#999' }}>
              No labels found. Create one above to get started.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <Table>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th>Label Name</th>
                  <th style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(labels) && labels.map((label) => (
                  <React.Fragment key={label.id}>
                    <tr>
                      <td>
                        <Typography level="body-sm">{label.id}</Typography>
                      </td>
                      <td>
                        <Typography level="body-sm">
                          {label.label_name || label.name}
                        </Typography>
                      </td>
                      <td>
                        {deleteConfirmId === label.id ? (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Button
                              size="sm"
                              color="danger"
                              variant="solid"
                              onClick={() => handleDisableLabel(label.id)}
                              loading={deletingId === label.id}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              color="neutral"
                              variant="outlined"
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              Cancel
                            </Button>
                          </Box>
                        ) : (
                          <IconButton
                            size="sm"
                            color="danger"
                            onClick={() => setDeleteConfirmId(label.id)}
                            disabled={deletingId !== null}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default LabelManagerDialog;
