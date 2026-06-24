import React, { useState } from 'react';
import {
  Box, Typography, Card, Accordion, AccordionSummary, AccordionDetails, Chip,
} from '@mui/joy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import theme from '../../theme';

/**
 * Single read-only history entry for one investigation level.
 */
function HistoryEntry({ label, color, data }) {
  const [open, setOpen] = useState(false);
  if (!data?.hasContent) return null;

  return (
    <Accordion
      expanded={open}
      onChange={() => setOpen(p => !p)}
      sx={{ border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.lg, mb: 1 }}
    >
      <AccordionSummary indicator={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip size="sm" color={color} variant="soft">{label}</Chip>
          {data.enteredBy && (
            <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
              {data.enteredBy}
            </Typography>
          )}
          {data.enteredAt && (
            <Typography level="body-xs" sx={{ color: 'neutral.400' }}>
              — {data.enteredAt.toLocaleDateString()}
            </Typography>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Card variant="soft" color="neutral" sx={{ p: 1.5 }}>
          <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap' }}>
            {data.text}
          </Typography>
        </Card>
      </AccordionDetails>
    </Accordion>
  );
}

/**
 * InvestigationHistorySection — replaces ExistingResponseSection.
 *
 * Shows all investigation levels that have content as collapsible accordions
 * (Section, Department, Administration, Patient Services), then the action
 * items list below them.
 *
 * All content is read-only. Collapsed by default.
 *
 * Props:
 *   history      — normalized object from getSubcaseHistory, or null
 *   responseData — legacy responseData from getSubcaseResponse (fallback
 *                  for action items when history is not yet loaded)
 */
const InvestigationHistorySection = ({ history, responseData }) => {
  const hasHistory = history && (
    history.section?.hasContent ||
    history.department?.hasContent ||
    history.administration?.hasContent ||
    history.patientServices?.hasContent
  );

  // Action items: prefer history (has status), fall back to responseData
  const actionItems = history?.actionItems?.length
    ? history.actionItems
    : responseData?.actionItems || [];

  if (!hasHistory && actionItems.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      {hasHistory && (
        <>
          <Typography sx={{ ...theme.typography.cardTitle, mb: 1 }}>سجل التحقيق</Typography>
          <HistoryEntry label="رد القسم"    color="primary" data={history.section} />
          <HistoryEntry label="رد الدائرة"  color="success" data={history.department} />
          <HistoryEntry label="رد الإدارة"  color="warning" data={history.administration} />
          <HistoryEntry label="قرار خدمات المرضى" color="neutral" data={history.patientServices} />
        </>
      )}

      {actionItems.length > 0 && (
        <Box sx={{ mt: hasHistory ? 1.5 : 0 }}>
          <Typography sx={{ ...theme.typography.cardTitle, mb: 0.75 }}>
            بنود الإجراءات ({actionItems.length})
          </Typography>
          {actionItems.map((ai, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex', gap: 1, mb: 0.5, alignItems: 'flex-start',
                p: 1, borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border}`,
              }}
            >
              <Typography level="body-xs" sx={{ color: 'neutral.500', flexShrink: 0, mt: 0.1 }}>•</Typography>
              <Box sx={{ flex: 1 }}>
                <Typography level="body-xs" fontWeight="bold">{ai.title}</Typography>
                {ai.description && (
                  <Typography level="body-xs" sx={{ color: 'neutral.600' }}>{ai.description}</Typography>
                )}
                {ai.dueDate && (
                  <Typography level="body-xs" sx={{ color: 'neutral.400' }}>
                    الاستحقاق: {ai.dueDate}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default InvestigationHistorySection;
