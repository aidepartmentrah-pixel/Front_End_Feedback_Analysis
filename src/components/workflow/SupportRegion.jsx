import React from 'react';
import { Box, Divider } from '@mui/joy';
import ActionItemsEditor from './ActionItemsEditor';
import RcaPairsPicker from './RcaPairsPicker';
import SuggestedActionPanel from './SuggestedActionPanel';

/**
 * SupportRegion — RCA / Action Items column. Render this only when the
 * caller has determined real content exists; otherwise pass null as
 * ModalLayoutShell's supportContent so the layout collapses to one column.
 *
 * Order follows the cause -> suggestion -> action item reading flow:
 * pick causes, see what they suggest, land in the existing action item table.
 */
const SupportRegion = ({
  showActionItems, actionItems, onAddItem, onRemoveItem, onUpdateItem,
  suggestedActions, onAcceptSuggestedAction,
  showRca, rcaCategories, selectedIds, onToggleRca, rcaLoading, rcaDisabled,
  submitting,
}) => (
  <Box>
    {showRca && (
      <RcaPairsPicker
        categories={rcaCategories}
        selectedIds={selectedIds}
        onToggle={onToggleRca}
        loading={rcaLoading}
        disabled={rcaDisabled}
      />
    )}
    <SuggestedActionPanel suggestions={suggestedActions} onAccept={onAcceptSuggestedAction} />
    {(showRca || (suggestedActions && suggestedActions.length > 0)) && showActionItems && <Divider sx={{ my: 2 }} />}
    {showActionItems && (
      <ActionItemsEditor
        actionItems={actionItems}
        onAdd={onAddItem}
        onRemove={onRemoveItem}
        onUpdate={onUpdateItem}
        disabled={submitting}
      />
    )}
  </Box>
);

export default SupportRegion;
