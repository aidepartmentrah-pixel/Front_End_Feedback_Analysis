import React from 'react';
import { Box, Typography, Card } from '@mui/joy';

/**
 * ExistingResponseSection — read-only display of the current subcase response.
 *
 * Returns null when there is no explanation text to show (no render, no wrapper).
 *
 * Props:
 *   responseData — object from getSubcaseResponse, or null
 *     { explanationText, actionItems: [{title, dueDate}], submittedBy, submittedAt }
 */
const ExistingResponseSection = ({ responseData }) => {
  if (!responseData || !responseData.explanationText) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography level="title-sm" sx={{ mb: 1 }}>📝 الرد الحالي</Typography>
      <Card variant="outlined" sx={{ p: 2 }}>
        <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
          {responseData.explanationText}
        </Typography>

        {responseData.actionItems && responseData.actionItems.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography level="body-xs" fontWeight="bold" sx={{ mb: 0.5 }}>
              بنود الإجراءات ({responseData.actionItems.length}):
            </Typography>
            {responseData.actionItems.map((ai, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.25, alignItems: 'flex-start' }}>
                <Typography level="body-xs" sx={{ color: 'neutral.500', flexShrink: 0 }}>•</Typography>
                <Typography level="body-xs">
                  {ai.title}
                  {ai.dueDate && (
                    <span style={{ color: '#888', marginRight: 4 }}> ({ai.dueDate})</span>
                  )}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <Typography level="body-xs" sx={{ color: 'neutral.400', mt: 1 }}>
          بواسطة {responseData.submittedBy}
          {responseData.submittedAt
            ? ` — ${responseData.submittedAt.toLocaleDateString('ar')}`
            : ''}
        </Typography>
      </Card>
    </Box>
  );
};

export default ExistingResponseSection;
