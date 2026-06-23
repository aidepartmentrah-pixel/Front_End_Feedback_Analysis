import React from 'react';
import { Box, Typography, Button, Input, Textarea, Card, IconButton, Chip } from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * ActionItemsEditor — editable list of action items (بنود الإجراءات).
 *
 * State is owned by the parent (CaseReviewModal). This component is purely
 * presentational — it calls the parent's callbacks on every change.
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
const ActionItemsEditor = ({ actionItems, onAdd, onRemove, onUpdate, disabled }) => (
  <Box sx={{ mt: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Typography level="title-sm">بنود الإجراءات</Typography>
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

    {actionItems.map((ai, idx) => (
      <Card key={ai.action_item_id ?? `new-${idx}`} variant="outlined" sx={{ mb: 1, p: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography level="body-xs" fontWeight="bold">بند {idx + 1}</Typography>
            {ai.action_item_id
              ? <Chip size="sm" color="primary" variant="soft">موجود</Chip>
              : <Chip size="sm" color="success" variant="soft">جديد</Chip>
            }
          </Box>
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
        <Input
          size="sm"
          placeholder="عنوان البند"
          value={ai.title}
          onChange={e => onUpdate(idx, 'title', e.target.value)}
          disabled={disabled}
          sx={{ mb: 0.5 }}
        />
        <Textarea
          size="sm"
          placeholder="الوصف (اختياري)"
          minRows={2}
          value={ai.description}
          onChange={e => onUpdate(idx, 'description', e.target.value)}
          disabled={disabled}
          sx={{ mb: 0.5 }}
        />
        <Input
          size="sm"
          type="date"
          value={ai.due_date}
          onChange={e => onUpdate(idx, 'due_date', e.target.value)}
          disabled={disabled}
          slotProps={{ input: { min: new Date(Date.now() + 86400000).toISOString().split('T')[0] } }}
        />
      </Card>
    ))}
  </Box>
);

export default ActionItemsEditor;
