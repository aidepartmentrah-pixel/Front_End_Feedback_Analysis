// PHASE G — G-F3 — Drawer Notes Page
// src/pages/DrawerNotesPage.jsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Typography,
  Table,
  Chip,
  CircularProgress,
  Modal,
  ModalDialog,
  ModalClose,
  FormControl,
  FormLabel,
  Textarea,
  Alert,
  Select,  Option,
  IconButton,
} from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';

import MainLayout from '../components/common/MainLayout';
import { useAuth } from '../context/AuthContext';
import { canAccessDrawerNotes as canAccessDrawerNotesGuard } from '../utils/roleGuards';
import {
  listDrawerNotes,
  createDrawerNote,
  updateDrawerNoteText,
  updateDrawerNoteLabels,
  deleteDrawerNote,
  exportDrawerNotesWord,
} from '../api/drawerNotesApi';
import { listDrawerLabels } from '../api/drawerLabelsApi';
import { downloadBlob } from '../api/reports';
import LabelManagerDialog from '../components/drawer/LabelManagerDialog';

const DrawerNotesPage = () => {
  // ============================
  // ROLE GUARD
  // ============================
  const { user } = useAuth();
  const canAccessDrawerNotes = canAccessDrawerNotesGuard(user);

  // ============================
  // STATE
  // ============================
  const [notes, setNotes] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filter
  const [selectedLabelIds, setSelectedLabelIds] = useState([]);

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [labelManagerOpen, setLabelManagerOpen] = useState(false);

  // Form state
  const [noteText, setNoteText] = useState('');
  const [noteLabels, setNoteLabels] = useState([]);
  const [currentEditNote, setCurrentEditNote] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Loading states
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ============================
  // LOAD DATA
  // ============================
  useEffect(() => {
    if (canAccessDrawerNotes) {
      loadLabels();
      loadNotes();
    }
  }, [canAccessDrawerNotes, selectedLabelIds, offset]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listDrawerNotes({
        labelIds: selectedLabelIds,
        limit,
        offset,
      });
      setNotes(response.items || response || []);
      setTotalCount(response.total || (response.items || response).length);
    } catch (err) {
      setError(err.message || 'Failed to load notes');
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLabels = async () => {
    try {
      const labelsData = await listDrawerLabels();
      console.log('📋 Raw labels API response:', JSON.stringify(labelsData, null, 2));
      console.log('📋 Response type:', typeof labelsData, 'Is array?', Array.isArray(labelsData));
      console.log('📋 Response keys:', labelsData ? Object.keys(labelsData) : 'null');
      
      // Handle different response structures comprehensively
      let labelsArray = [];
      
      if (Array.isArray(labelsData)) {
        // Direct array response
        labelsArray = labelsData;
        console.log('📋 Case 1: Direct array');
      } else if (labelsData && typeof labelsData === 'object') {
        // Object response - try different keys
        if (Array.isArray(labelsData.labels)) {
          labelsArray = labelsData.labels;
          console.log('📋 Case 2: labelsData.labels');
        } else if (Array.isArray(labelsData.items)) {
          labelsArray = labelsData.items;
          console.log('📋 Case 3: labelsData.items');
        } else if (Array.isArray(labelsData.data)) {
          labelsArray = labelsData.data;
          console.log('📋 Case 4: labelsData.data');
        } else {
          // Might be a single-level object with array values
          const firstKey = Object.keys(labelsData)[0];
          if (firstKey && Array.isArray(labelsData[firstKey])) {
            labelsArray = labelsData[firstKey];
            console.log('📋 Case 5: First key array:', firstKey);
          }
        }
      }
      
      console.log('📋 Extracted labels array:', labelsArray, 'Length:', labelsArray?.length);
      
      // Ensure it's always an array AND filter out any undefined/null items
      const validLabels = Array.isArray(labelsArray) 
        ? labelsArray.filter(label => label != null && (label.id != null || label.label_id != null))
        : [];
      
      console.log('📋 Valid labels after filtering:', validLabels);
      console.log('📋 Setting labels state with', validLabels.length, 'items');
      setLabels(validLabels);
    } catch (err) {
      console.error('❌ Failed to load labels:', err);
      setLabels([]); // Ensure labels is always an array even on error
    }
  };

  // ============================
  // CREATE NOTE
  // ============================
  const handleOpenCreateDialog = () => {
    setNoteText('');
    setNoteLabels([]);
    setCreateDialogOpen(true);
  };

  const handleCreateNote = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validation
      if (!noteText || noteText.trim().length === 0) {
        setError('Note text is required');
        return;
      }
      if (noteLabels.length === 0) {
        setError('At least one label is required');
        return;
      }

      await createDrawerNote({
        note_text: noteText.trim(),
        label_ids: noteLabels,
      });

      setSuccess('Note created successfully');
      setCreateDialogOpen(false);
      setOffset(0); // Reset to first page
      loadNotes();
    } catch (err) {
      setError(err.message || 'Failed to create note');
      console.error('Failed to create note:', err);
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // EDIT NOTE
  // ============================
  const handleOpenEditDialog = (note) => {
    setCurrentEditNote(note);
    setNoteText(note.note_text || '');
    setNoteLabels(note.label_ids || note.labels?.map(l => l.id) || []);
    setEditDialogOpen(true);
  };

  const handleEditNote = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validation
      if (!noteText || noteText.trim().length === 0) {
        setError('Note text is required');
        return;
      }
      if (noteLabels.length === 0) {
        setError('At least one label is required');
        return;
      }

      // Update text
      await updateDrawerNoteText(currentEditNote.note_id, noteText.trim());
      
      // Update labels
      await updateDrawerNoteLabels(currentEditNote.note_id, noteLabels);

      setSuccess('Note updated successfully');
      setEditDialogOpen(false);
      loadNotes();
    } catch (err) {
      setError(err.message || 'Failed to update note');
      console.error('Failed to update note:', err);
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // DELETE NOTE
  // ============================
  const handleOpenDeleteConfirm = (note) => {
    setNoteToDelete(note);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteNote = async () => {
    try {
      setDeleting(true);
      setError(null);

      await deleteDrawerNote(noteToDelete.note_id);

      setSuccess('Note deleted successfully');
      setDeleteConfirmOpen(false);
      loadNotes();
    } catch (err) {
      setError(err.message || 'Failed to delete note');
      console.error('Failed to delete note:', err);
    } finally {
      setDeleting(false);
    }
  };

  // ============================
  // EXPORT
  // ============================
  const handleExport = async () => {
    try {
      setExporting(true);
      setError(null);

      const blob = await exportDrawerNotesWord();
      const filename = `drawer_notes_${new Date().toISOString().split('T')[0]}.docx`;
      downloadBlob(blob, filename);

      setSuccess('Notes exported successfully');
    } catch (err) {
      setError(err.message || 'Failed to export notes');
      console.error('Failed to export notes:', err);
    } finally {
      setExporting(false);
    }
  };

  // ============================
  // LABEL FILTER CHANGE
  // ============================
  const handleLabelFilterChange = (event, newValue) => {
    setSelectedLabelIds(newValue || []);
    setOffset(0); // Reset to first page when filter changes
  };

  // ============================
  // PAGINATION
  // ============================
  const handleNextPage = () => {
    if (offset + limit < totalCount) {
      setOffset(offset + limit);
    }
  };

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
    }
  };

  // ============================
  // RENDER - NOT AUTHORIZED
  // ============================
  if (!canAccessDrawerNotes) {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}>
          <Alert color="danger" sx={{ textAlign: 'center', p: 4 }}>
            <Typography level="h6" sx={{ mb: 1 }}>
              Access Denied
            </Typography>
            <Typography level="body-sm">
              You do not have permission to view this page. This page is restricted to Software Admins and Workers only.
            </Typography>
          </Alert>
        </Box>
      </MainLayout>
    );
  }

  // ============================
  // RENDER - MAIN PAGE
  // ============================
  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography level="h2" sx={{ fontWeight: 700, mb: 1 }}>
            📝 Drawer Notes
          </Typography>
          <Typography level="body-sm" sx={{ color: '#666' }}>
            Unclassified notes repository for internal use only
          </Typography>
        </Box>

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
        
        {/* No Labels Warning */}
        {!loading && labels.length === 0 && (
          <Alert color="warning" sx={{ mb: 2 }}>
            <Typography level="body-sm" sx={{ fontWeight: 600, mb: 1 }}>
              ⚠️ No labels available
            </Typography>
            <Typography level="body-sm">
              You need to create at least one label before you can create notes. Click the "Manage Labels" button below to get started.
            </Typography>
          </Alert>
        )}

        {/* Top Bar Controls */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              startDecorator={<AddIcon />}
              onClick={handleOpenCreateDialog}
              color="primary"
              variant="solid"
              disabled={labels.length === 0}
            >
              Add Note
            </Button>

            <Button
              startDecorator={<DescriptionIcon />}
              onClick={handleExport}
              loading={exporting}
              color="success"
              variant="outlined"
            >
              Export Word
            </Button>

            <Button
              startDecorator={<SettingsIcon />}
              onClick={() => setLabelManagerOpen(true)}
              color="neutral"
              variant="outlined"
            >
              Manage Labels
            </Button>

            <FormControl sx={{ flex: 1, minWidth: 250 }}>
              <FormLabel>Filter by Labels (AND)</FormLabel>
              <Select
                multiple
                value={selectedLabelIds}
                onChange={handleLabelFilterChange}
                placeholder="Select labels to filter"
                slotProps={{
                  listbox: {
                    sx: { maxHeight: 300 },
                  },
                }}
              >
                {Array.isArray(labels) && labels.filter(label => label && (label.id || label.label_id)).map((label) => {
                  const labelId = label.id || label.label_id;
                  const labelName = label.label_name || label.name || `Label ${labelId}`;
                  return (
                    <Option key={labelId} value={labelId}>
                      {labelName}
                    </Option>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        </Card>

        {/* Notes Table */}
        <Card>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : notes.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography level="body-md" sx={{ color: '#999' }}>
                No notes found. {selectedLabelIds.length > 0 && 'Try adjusting your filters or '}Click "Add Note" to create one.
              </Typography>
            </Box>
          ) : (
            <>
              <Table>
                <thead>
                  <tr>
                    <th style={{ width: '140px' }}>Created At</th>
                    <th style={{ width: '150px' }}>Author</th>
                    <th style={{ width: '200px' }}>Labels</th>
                    <th>Note Text</th>
                    <th style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((note) => (
                    <tr key={note.note_id}>
                      <td>
                        <Typography level="body-sm">
                          {note.created_at ? new Date(note.created_at).toLocaleDateString() : '--'}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm">
                          {note.author_name || note.author || user?.display_name || '--'}
                        </Typography>
                      </td>
                      <td>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {(note.labels || []).map((label) => (
                            <Chip key={label.id} size="sm" color="primary" variant="soft">
                              {label.label_name || label.name}
                            </Chip>
                          ))}
                        </Box>
                      </td>
                      <td>
                        <Typography
                          level="body-sm"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {note.note_text || '--'}
                        </Typography>
                      </td>
                      <td>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="sm"
                            color="primary"
                            onClick={() => handleOpenEditDialog(note)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="sm"
                            color="danger"
                            onClick={() => handleOpenDeleteConfirm(note)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Typography level="body-sm">
                  Showing {offset + 1}-{Math.min(offset + limit, totalCount)} of {totalCount}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="sm"
                    variant="outlined"
                    onClick={handlePrevPage}
                    disabled={offset === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outlined"
                    onClick={handleNextPage}
                    disabled={offset + limit >= totalCount}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Card>

        {/* Create Note Dialog */}
        <Modal open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
          <ModalDialog sx={{ minWidth: 600, maxWidth: 660 }}>
            <ModalClose />
            <Typography level="h4" sx={{ mb: 2 }}>
              Create New Note
            </Typography>

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Note Text *</FormLabel>
              <Textarea
                minRows={4}
                placeholder="Enter note text..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
            </FormControl>

            <FormControl sx={{ mb: 3 }}>
              <FormLabel>Labels * (Select at least one)</FormLabel>
              <Select
                multiple
                value={noteLabels}
                onChange={(e, newValue) => setNoteLabels(newValue || [])}
                placeholder={labels.length === 0 ? "No labels available - create one first" : "Select labels"}
                disabled={labels.length === 0}
                slotProps={{
                  listbox: {
                    sx: { maxHeight: 300 },
                  },
                }}
              >
                {Array.isArray(labels) && labels.filter(label => label && (label.id || label.label_id)).map((label) => {
                  const labelId = label.id || label.label_id;
                  const labelName = label.label_name || label.name || `Label ${labelId}`;
                  return (
                    <Option key={labelId} value={labelId}>
                      {labelName}
                    </Option>
                  );
                })}
              </Select>
              {labels.length === 0 && (
                <Typography level="body-sm" sx={{ mt: 1, color: 'warning.plainColor' }}>
                  ⚠️ No labels found. Click "Manage Labels" button to create labels first.
                </Typography>
              )}
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
              {labels.length === 0 && (
                <Button
                  variant="outlined"
                  color="warning"
                  size="sm"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setLabelManagerOpen(true);
                  }}
                >
                  Create Labels First
                </Button>
              )}
              <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
                <Button
                  variant="outlined"
                  color="neutral"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="solid"
                  color="primary"
                  onClick={handleCreateNote}
                  loading={saving}
                  disabled={saving || !noteText.trim() || noteLabels.length === 0}
                >
                  Create
                </Button>
              </Box>
            </Box>
          </ModalDialog>
        </Modal>

        {/* Edit Note Dialog */}
        <Modal open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <ModalDialog sx={{ minWidth: 600, maxWidth: 660 }}>
            <ModalClose />
            <Typography level="h4" sx={{ mb: 2 }}>
              Edit Note
            </Typography>

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Note Text *</FormLabel>
              <Textarea
                minRows={4}
                placeholder="Enter note text..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
            </FormControl>

            <FormControl sx={{ mb: 3 }}>
              <FormLabel>Labels * (Select at least one)</FormLabel>
              <Select
                multiple
                value={noteLabels}
                onChange={(e, newValue) => setNoteLabels(newValue || [])}
                placeholder={labels.length === 0 ? "No labels available - create one first" : "Select labels"}
                disabled={labels.length === 0}
                slotProps={{
                  listbox: {
                    sx: { maxHeight: 300 },
                  },
                }}
              >
                {Array.isArray(labels) && labels.filter(label => label && (label.id || label.label_id)).map((label) => {
                  const labelId = label.id || label.label_id;
                  const labelName = label.label_name || label.name || `Label ${labelId}`;
                  return (
                    <Option key={labelId} value={labelId}>
                      {labelName}
                    </Option>
                  );
                })}
              </Select>
              {labels.length === 0 && (
                <Typography level="body-sm" sx={{ mt: 1, color: 'warning.plainColor' }}>
                  ⚠️ No labels found. Close this dialog and click "Manage Labels" to create labels first.
                </Typography>
              )}
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                color="primary"
                onClick={handleEditNote}
                loading={saving}
                disabled={saving || !noteText.trim() || noteLabels.length === 0}
              >
                Save Changes
              </Button>
            </Box>
          </ModalDialog>
        </Modal>

        {/* Delete Confirmation Dialog */}
        <Modal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <ModalDialog variant="outlined" color="danger">
            <ModalClose />
            <Typography level="h4" sx={{ mb: 2 }}>
              Delete Note?
            </Typography>
            <Typography level="body-md" sx={{ mb: 3 }}>
              Are you sure you want to delete this note? This action cannot be undone.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                color="danger"
                onClick={handleDeleteNote}
                loading={deleting}
              >
                Delete
              </Button>
            </Box>
          </ModalDialog>
        </Modal>

        {/* Label Manager Dialog */}
        {labelManagerOpen && (
          <LabelManagerDialog
            open={labelManagerOpen}
            onClose={() => {
              setLabelManagerOpen(false);
              loadLabels(); // Refresh labels after management
            }}
          />
        )}
      </Box>
    </MainLayout>
  );
};

export default DrawerNotesPage;
