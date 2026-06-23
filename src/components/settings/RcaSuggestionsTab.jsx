import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Sheet,
  Chip, CircularProgress, Alert,
  Modal, ModalDialog, ModalClose, FormLabel,
  Textarea,
  Accordion, AccordionSummary, AccordionDetails, AccordionGroup,
} from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import theme from '../../theme';
import {
  getRcaCategories,
  getRcaPairs,
  createRcaPair,
  updateRcaPair,
  toggleRcaPairActive,
} from '../../api/rcaApi';

const FONT_STACK = "'Cairo', 'Segoe UI', Tahoma, sans-serif";

const EMPTY_FORM = {
  category_id: '',
  cause_text_ar: '',
  cause_text_en: '',
  action_text_ar: '',
  action_text_en: '',
};

export default function RcaSuggestionsTab() {
  const [categories, setCategories] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add mode
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, prs] = await Promise.all([
        getRcaCategories(false),
        getRcaPairs(null, false),
      ]);
      setCategories(cats);
      setPairs(prs);
    } catch (e) {
      setError('Failed to load RCA data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const visibleCategories = [...categories]
    .sort((a, b) => (a.SortOrder ?? 0) - (b.SortOrder ?? 0) || a.CategoryID - b.CategoryID);

  const openAdd = (categoryId) => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, category_id: String(categoryId) });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditTarget(p);
    setForm({
      category_id: String(p.CategoryID),
      cause_text_ar: p.CauseTextAr || '',
      cause_text_en: p.CauseTextEn || '',
      action_text_ar: p.ActionTextAr || '',
      action_text_en: p.ActionTextEn || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.cause_text_ar.trim() || !form.action_text_ar.trim()) return;
    if (!form.category_id) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        cause_text_ar: form.cause_text_ar.trim(),
        cause_text_en: form.cause_text_en.trim() || null,
        action_text_ar: form.action_text_ar.trim(),
        action_text_en: form.action_text_en.trim() || null,
      };
      if (editTarget) {
        await updateRcaPair(editTarget.PairID, payload);
      } else {
        await createRcaPair({ category_id: Number(form.category_id), ...payload });
      }
      setSuccess(editTarget ? 'Item updated.' : 'Item added.');
      setModalOpen(false);
      load();
    } catch (e) {
      setError('Failed to save item.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (p) => {
    try {
      await toggleRcaPairActive(p.PairID, !p.IsActive);
      setSuccess(p.IsActive ? 'Item deactivated.' : 'Item activated.');
      load();
    } catch (e) {
      setError('Failed to update status.');
    }
  };

  const modalCategory = editTarget
    ? categories.find(c => c.CategoryID === editTarget.CategoryID)
    : categories.find(c => String(c.CategoryID) === form.category_id);

  const primaryButtonSx = {
    background: theme.button.primary.background,
    color: theme.button.primary.color,
    fontWeight: 600,
    '&:hover': { background: theme.button.primary.backgroundHover },
  };

  return (
    <Box sx={{ p: 3, fontFamily: FONT_STACK, bgcolor: theme.colors.background, minHeight: '100%' }}>
      {/* Title */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: 24, fontWeight: 700, fontFamily: FONT_STACK, color: theme.colors.textPrimary }}>
          RCA Suggestions
        </Typography>

        <Typography sx={{ fontSize: 13, fontFamily: FONT_STACK, color: theme.colors.textSecondary, direction: 'rtl', textAlign: 'right', mt: 0.25 }}>
          العوامل المسبّبة والإجراءات التصحيحية
        </Typography>
      </Box>

      {error && <Alert color="danger" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert color="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      {/* Category groups */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <AccordionGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {visibleCategories.length === 0 && (
            <Sheet variant="outlined" sx={{ borderRadius: 'md', p: 3, textAlign: 'center', color: theme.colors.textTertiary, bgcolor: theme.colors.surface, borderColor: theme.colors.border }}>
              No categories found.
            </Sheet>
          )}
          {visibleCategories.map(cat => {
            const catPairs = pairs.filter(p => p.CategoryID === cat.CategoryID);

            return (
              <Accordion
                key={cat.CategoryID}
                defaultExpanded
                sx={{
                  bgcolor: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: 'md',
                  overflow: 'hidden',
                  boxShadow: theme.card.shadow,
                }}
              >
                <AccordionSummary sx={{ px: 3, py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Box>
                      <Typography dir="rtl" sx={{ fontSize: 18, fontWeight: 600, color: theme.colors.textPrimary, fontFamily: FONT_STACK, textAlign: 'right' }}>
                        {cat.CategoryNameAr}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: theme.colors.textSecondary, mt: 0.25 }}>
                        {cat.CategoryNameEn}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {!cat.IsActive && (
                        <Chip size="sm" variant="soft" sx={{ bgcolor: theme.colors.background, color: theme.colors.textTertiary, fontWeight: 600 }}>
                          Inactive
                        </Chip>
                      )}
                      <Chip size="sm" variant="soft" sx={{ bgcolor: theme.badge.primary.background, color: theme.badge.primary.text, fontWeight: 600 }}>
                        {catPairs.length} Pairs
                      </Chip>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                  {catPairs.length === 0 ? (
                    <Typography sx={{ color: theme.colors.textTertiary, textAlign: 'center', py: 3, fontSize: 14 }}>
                      No items in this category yet.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2, mb: 2.5 }}>
                      {catPairs.map(p => (
                        <Sheet
                          key={p.PairID}
                          variant="outlined"
                          sx={{
                            borderRadius: 'md',
                            borderColor: theme.colors.border,
                            bgcolor: theme.colors.surface,
                            p: 2.5,
                            opacity: p.IsActive ? 1 : 0.6,
                          }}
                        >
                          {/* Status + Actions */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Chip
                              size="sm"
                              variant="soft"
                              sx={{
                                bgcolor: p.IsActive ? theme.colors.successLight : theme.colors.background,
                                color: p.IsActive ? theme.colors.success : theme.colors.textTertiary,
                                fontWeight: 600,
                              }}
                            >
                              {p.IsActive ? 'Active' : 'Inactive'}
                            </Chip>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="sm"
                                variant="outlined"
                                startDecorator={<EditIcon fontSize="small" />}
                                onClick={() => openEdit(p)}
                                sx={{ borderColor: theme.colors.borderLight, color: theme.colors.textSecondary }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outlined"
                                onClick={() => handleToggleActive(p)}
                                sx={{
                                  borderColor: p.IsActive ? theme.colors.error : theme.colors.success,
                                  color: p.IsActive ? theme.colors.error : theme.colors.success,
                                }}
                              >
                                {p.IsActive ? 'Deactivate' : 'Activate'}
                              </Button>
                            </Box>
                          </Box>

                          {/* Cause */}
                          <Box sx={{ mb: 2.5 }}>
                            <Chip size="sm" variant="soft" sx={{ bgcolor: theme.badge.primary.background, color: theme.badge.primary.text, fontWeight: 600, mb: 1 }}>
                              Cause
                            </Chip>
                            <Typography dir="rtl" sx={{ fontSize: 14.5, color: theme.colors.textPrimary, textAlign: 'right', fontFamily: FONT_STACK, lineHeight: 1.7 }}>
                              {p.CauseTextAr}
                            </Typography>
                            {p.CauseTextEn && (
                              <Typography sx={{ fontSize: 12, color: theme.colors.textTertiary, mt: 0.5 }}>
                                {p.CauseTextEn}
                              </Typography>
                            )}
                          </Box>

                          {/* Corrective Action */}
                          <Box>
                            <Chip size="sm" variant="soft" sx={{ bgcolor: theme.badge.success.background, color: theme.badge.success.text, fontWeight: 600, mb: 1 }}>
                              Corrective Action
                            </Chip>
                            <Typography dir="rtl" sx={{ fontSize: 14.5, color: theme.colors.textPrimary, textAlign: 'right', fontFamily: FONT_STACK, lineHeight: 1.7 }}>
                              {p.ActionTextAr}
                            </Typography>
                            {p.ActionTextEn && (
                              <Typography sx={{ fontSize: 12, color: theme.colors.textTertiary, mt: 0.5 }}>
                                {p.ActionTextEn}
                              </Typography>
                            )}
                          </Box>
                        </Sheet>
                      ))}
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      size="sm"
                      startDecorator={<AddIcon fontSize="small" />}
                      onClick={() => openAdd(cat.CategoryID)}
                      sx={primaryButtonSx}
                    >
                      Add New
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </AccordionGroup>
      )}

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalDialog sx={{ fontFamily: FONT_STACK, position: 'relative', width: '90vw', maxWidth: '820px' }}>
          <ModalClose sx={{ position: 'absolute', top: '0.75rem', left: '0.75rem', right: 'auto' }} />

          <Box sx={{ mb: '16px' }}>
            <Typography dir="rtl" sx={{ fontSize: 19, fontWeight: 700, color: theme.colors.textPrimary, fontFamily: FONT_STACK, textAlign: 'right' }}>
              {editTarget ? 'تعديل السبب والإجراء التصحيحي' : 'إضافة سبب وإجراء تصحيحي جديد'}
            </Typography>
            {modalCategory && (
              <Typography dir="rtl" sx={{ fontSize: 13, color: theme.colors.textSecondary, textAlign: 'right', mt: '4px' }}>
                {modalCategory.CategoryNameAr}
              </Typography>
            )}
          </Box>

          {/* Cause section */}
          <Box sx={{ border: `1px solid ${theme.colors.border}`, borderRadius: 'md', p: '14px', mb: '14px' }}>
            <Typography dir="rtl" sx={{
              fontSize: 14, fontWeight: 700, color: theme.colors.primary, textAlign: 'right',
              pb: '8px', mb: '10px', borderBottom: `1px solid ${theme.colors.border}`,
            }}>
              السبب
            </Typography>
            <Textarea
              minRows={2}
              value={form.cause_text_ar}
              onChange={e => setForm(f => ({ ...f, cause_text_ar: e.target.value }))}
              placeholder="السبب"
              sx={{ minHeight: '90px' }}
              slotProps={{ textarea: { dir: 'rtl', style: { fontFamily: FONT_STACK, textAlign: 'right', padding: '10px 12px', lineHeight: 1.7 } } }}
            />
            <Box sx={{ mt: '10px' }}>
              <FormLabel sx={{ fontSize: 11, color: theme.colors.textTertiary, mb: '4px' }}>English (optional)</FormLabel>
              <Textarea
                variant="soft"
                minRows={1}
                value={form.cause_text_en}
                onChange={e => setForm(f => ({ ...f, cause_text_en: e.target.value }))}
                placeholder="Cause text in English"
                sx={{ minHeight: '52px', bgcolor: theme.colors.background }}
                slotProps={{ textarea: { dir: 'ltr', style: { textAlign: 'left', padding: '8px 10px', fontSize: 13, lineHeight: 1.5 } } }}
              />
            </Box>
          </Box>

          {/* Corrective Action section */}
          <Box sx={{ border: `1px solid ${theme.colors.border}`, borderRadius: 'md', p: '14px', mb: '16px' }}>
            <Typography dir="rtl" sx={{
              fontSize: 14, fontWeight: 700, color: theme.colors.secondaryHover, textAlign: 'right',
              pb: '8px', mb: '10px', borderBottom: `1px solid ${theme.colors.border}`,
            }}>
              الإجراء التصحيحي
            </Typography>
            <Textarea
              minRows={2}
              value={form.action_text_ar}
              onChange={e => setForm(f => ({ ...f, action_text_ar: e.target.value }))}
              placeholder="الإجراء التصحيحي"
              sx={{ minHeight: '90px' }}
              slotProps={{ textarea: { dir: 'rtl', style: { fontFamily: FONT_STACK, textAlign: 'right', padding: '10px 12px', lineHeight: 1.7 } } }}
            />
            <Box sx={{ mt: '10px' }}>
              <FormLabel sx={{ fontSize: 11, color: theme.colors.textTertiary, mb: '4px' }}>English (optional)</FormLabel>
              <Textarea
                variant="soft"
                minRows={1}
                value={form.action_text_en}
                onChange={e => setForm(f => ({ ...f, action_text_en: e.target.value }))}
                placeholder="Corrective action text in English"
                sx={{ minHeight: '52px', bgcolor: theme.colors.background }}
                slotProps={{ textarea: { dir: 'ltr', style: { textAlign: 'left', padding: '8px 10px', fontSize: 13, lineHeight: 1.5 } } }}
              />
            </Box>
          </Box>

          {/* Footer */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', pt: '14px', borderTop: `1px solid ${theme.colors.border}` }}>
            <Button variant="outlined" color="neutral" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={saving}
              disabled={!form.cause_text_ar.trim() || !form.action_text_ar.trim() || !form.category_id}
              onClick={handleSave}
              sx={primaryButtonSx}
            >
              {editTarget ? 'Save' : 'Add'}
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
}
