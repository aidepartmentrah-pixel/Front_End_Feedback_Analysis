import React from 'react';
import {
  Box, Typography, Chip, Checkbox, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails, AccordionGroup,
} from '@mui/joy';

/**
 * RcaPairsPicker — displays DB-driven RCA cause/action pairs as selectable checkboxes.
 *
 * Uses getRcaPairsForSubcase shape: { categories: [{ category_id, category_name_ar,
 * category_name_en, pairs: [{ pair_id, cause_text_ar, action_text_ar, action_suggestion_id,
 * is_selected }] }] }
 *
 * State (categories, selectedIds) is owned by CaseReviewModal so it can include the
 * selected pair IDs in the saveRcaSelections call on submit.
 *
 * Props:
 *   categories  — category array from getRcaPairsForSubcase response
 *   selectedIds — Set<number>  (controlled by parent)
 *   onToggle    — (pairId: number) => void
 *   loading     — bool
 *   disabled    — bool
 */
const RcaPairsPicker = ({ categories, selectedIds, onToggle, loading, disabled }) => (
  <Box sx={{ mt: 1 }}>
    <Typography level="title-sm" sx={{ mb: 0.5, color: 'primary.600', fontFamily: 'Traditional Arabic, Calibri' }}>
      📋 تحليل السبب الجذري (RCA)
    </Typography>
    <Typography level="body-xs" sx={{ mb: 1.5, color: 'text.secondary' }}>
      اختياري — يمكن تقديم التوضيح بدون اختيار أسباب
    </Typography>

    {loading && <CircularProgress size="sm" />}

    {!loading && categories.length === 0 && (
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        لا توجد اقتراحات RCA متاحة.
      </Typography>
    )}

    {!loading && categories.length > 0 && (
      <AccordionGroup>
        {categories.map(cat => {
          if (!cat.pairs || cat.pairs.length === 0) return null;
          return (
            <Accordion key={cat.category_id}>
              <AccordionSummary>
                <Typography level="body-sm">
                  {cat.category_name_ar || cat.category_name_en}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {cat.pairs.map(p => (
                  <Box
                    key={p.pair_id}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      p: 1,
                      mb: 1,
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
                    }}
                    onClick={() => !disabled && onToggle(p.pair_id)}
                  >
                    <Checkbox
                      checked={selectedIds.has(p.pair_id)}
                      disabled={disabled}
                      sx={{ pointerEvents: 'none', mt: 0.5 }}
                    />
                    <Box sx={{ flex: 1, mr: 1, userSelect: 'none' }} dir="rtl">
                      <Box sx={{ mb: 0.75 }}>
                        <Chip size="sm" variant="soft" color="warning" sx={{ fontWeight: 'bold', mb: 0.25 }}>
                          السبب
                        </Chip>
                        <Typography level="body-sm" sx={{ fontFamily: 'Traditional Arabic, Calibri', textAlign: 'right' }}>
                          {p.cause_text_ar}
                        </Typography>
                      </Box>
                      <Box>
                        <Chip size="sm" variant="soft" color="primary" sx={{ fontWeight: 'bold', mb: 0.25 }}>
                          الإجراء التصحيحي
                        </Chip>
                        <Typography level="body-sm" sx={{ fontFamily: 'Traditional Arabic, Calibri', textAlign: 'right' }}>
                          {p.action_text_ar}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </AccordionGroup>
    )}
  </Box>
);

export default RcaPairsPicker;
