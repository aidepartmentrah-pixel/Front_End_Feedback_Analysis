import React from 'react';
import { Box, Divider } from '@mui/joy';
import ActionItemsEditor from './ActionItemsEditor';
import RcaPairsPicker from './RcaPairsPicker';

/**
 * SupportRegion — RCA / Action Items column. Render this only when the
 * caller has determined real content exists; otherwise pass null as
 * ModalLayoutShell's supportContent so the layout collapses to one column.
 */
const SupportRegion = ({
  showActionItems, actionItems, onAddItem, onRemoveItem, onUpdateItem,
  showRca, rcaCategories, selectedIds, onToggleRca, rcaLoading, rcaDisabled,
  submitting,
}) => (
  <Box>
    {showActionItems && (
      <ActionItemsEditor
        actionItems={actionItems}
        onAdd={onAddItem}
        onRemove={onRemoveItem}
        onUpdate={onUpdateItem}
        disabled={submitting}
      />
    )}
    {showActionItems && showRca && <Divider sx={{ my: 2 }} />}
    {showRca && (
      <RcaPairsPicker
        categories={rcaCategories}
        selectedIds={selectedIds}
        onToggle={onToggleRca}
        loading={rcaLoading}
        disabled={rcaDisabled}
      />
    )}
  </Box>
);

export default SupportRegion;
