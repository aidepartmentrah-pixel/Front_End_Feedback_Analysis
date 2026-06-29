import React, { useState } from 'react';
import { Box, Typography, Button, Input, Textarea, Card, IconButton, Chip } from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import theme from '../../theme';

/**
 * ActionItemsEditor — editable list of action items (بنود الإجراءات).
 *
 * State is owned by the parent (CaseReviewModal). This component is purely
 * presentational — it calls the parent's callbacks on every change. The
 * description-expanded toggle is local display-only state, not lifted up,
 * since it doesn't affect saved data.
 *
 * Data shape per item:
 *   { action_item_id: number|null, title: string, description: string, due_date: string }
 *
 * Items with action_item_id are "existing" records (update on save).
 * Items without are new (create on save).
 *
 * Props:
 *   actionItems — { action_item_id, title, description, due_date }[]
 *   onAdd       — () => void
 *   onRemove    — (index: number) => void
 *   onUpdate    — (index: number, field: string, value: string) => void
 *   disabled    — bool
 */
const ActionItemsEditor = ({ actionItems, onAdd, onRemove, onUpdate, disabled }) => {
  const [expandedKeys, setExpandedKeys] = useState(new Set());

  const itemKey = (ai, idx) => ai.action_item_id ?? `new-${idx}`;
  const toggleExpanded = (key) => setExpandedKeys(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography sx={theme.typography.cardTitle}>✅ بنود الإجراءات</Typography>
        <Button
          size="sm"
          variant="outlined"
          startDecorator={<AddIcon />}
          onClick={onAdd}
          disabled={disabled}
        >
          إضافة بند
        </Button>
      </Box>

      {actionItems.map((ai, idx) => {
        const key = itemKey(ai, idx);
        const descriptionOpen = expandedKeys.has(key) || !!ai.description?.trim();

        return (
          <Card
            key={key}
            variant="outlined"
            sx={{ mb: 1, p: 1.25, borderRadius: theme.radius.lg, borderColor: theme.colors.border }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              {ai.action_item_id
                ? <Chip size="sm" color="primary" variant="soft">موجود</Chip>
                : <Chip size="sm" color="success" variant="soft">جديد</Chip>
              }
              <Input
                size="sm"
                placeholder="عنوان البند"
                value={ai.title}
                onChange={e => onUpdate(idx, 'title', e.target.value)}
                disabled={disabled}
                sx={{ flex: 1 }}
              />
              {actionItems.length > 1 && (
                <IconButton
                  size="sm"
                  variant="plain"
                  color="danger"
                  onClick={() => onRemove(idx)}
                  disabled={disabled}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Input
                size="sm"
                type="date"
                value={ai.due_date}
                onChange={e => onUpdate(idx, 'due_date', e.target.value)}
                disabled={disabled}
                slotProps={{ input: { min: new Date(Date.now() + 86400000).toISOString().split('T')[0] } }}
                sx={{ flex: 1 }}
              />
              <Button
                size="sm"
                variant="plain"
                color="neutral"
                onClick={() => toggleExpanded(key)}
                disabled={disabled}
                endDecorator={
                  <ExpandMoreIcon
                    fontSize="small"
                    sx={{ transform: descriptionOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                  />
                }
              >
                وصف
              </Button>
            </Box>

            {descriptionOpen && (
              <Textarea
                size="sm"
                placeholder="الوصف (اختياري)"
                minRows={2}
                value={ai.description}
                onChange={e => onUpdate(idx, 'description', e.target.value)}
                disabled={disabled}
                sx={{ mt: 0.5 }}
              />
            )}
          </Card>
        );
      })}
    </Box>
  );
};

export default ActionItemsEditor;
