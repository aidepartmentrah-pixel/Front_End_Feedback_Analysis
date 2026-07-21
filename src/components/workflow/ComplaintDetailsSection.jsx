import React from 'react';
import {
  Box, Typography, Card, Chip,
  Accordion, AccordionSummary, AccordionDetails,
} from '@mui/joy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getDeadlineCountdown, isCountdownEligible } from '../../utils/deadlineCountdown';
import theme from '../../theme';

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <>
      <Typography level="body-sm" sx={{ fontWeight: 600, color: theme.colors.textSecondary }}>{label}:</Typography>
      <Typography level="body-sm">{value}</Typography>
    </>
  );
}

const fmtDate = (d) => {
  if (!d) return null;
  if (typeof d === 'string') return d;
  return d.toLocaleDateString();
};

/**
 * ComplaintDetailsSection — collapsible read-only complaint details accordion.
 *
 * Props:
 *   incidentData — object from getWorkflowIncidentDetail, or null while loading
 *   item         — normalized inbox/archive item (for target unit, deadlines, force-close dates)
 *   open         — bool  (controlled by parent)
 *   onChange     — () => void  (parent toggles open)
 */
const ComplaintDetailsSection = ({ incidentData, item, open, onChange }) => {
  // HCAT Automatic Force Close Policy — due date / countdown only apply to
  // complaints actively pending at Section/Department/Administration. Notices,
  // seasonal reports, denied/reopened cases, and the Patient Services decision
  // form never had a live deadline (or it's already stale), so neither the
  // date nor the countdown should be shown for them.
  const eligible = item ? isCountdownEligible(item) : false;

  const dueDate = eligible
    ? (item.sectionDeadlineAt || item.departmentDeadlineAt || item.administrationDeadlineAt)
    : null;

  const forceCloseDate = item
    ? (item.sectionForceClosedAt || item.departmentForceClosedAt || item.administrationForceClosedAt)
    : null;

  const countdown = eligible ? getDeadlineCountdown(dueDate) : null;

  const doctorNames = incidentData?.doctors?.length
    ? incidentData.doctors.map(d => d.name).filter(Boolean).join('، ')
    : null;

  const workerNames = incidentData?.employees?.length
    ? incidentData.employees.map(e => e.full_name).filter(Boolean).join('، ')
    : null;

  return (
    <Accordion
      expanded={open}
      onChange={onChange}
      sx={{
        border: `1px solid ${theme.colors.border}`,
        borderRight: `3px solid ${theme.colors.primary}`,
        borderRadius: theme.radius.lg,
        mb: 2,
      }}
    >
      <AccordionSummary indicator={<ExpandMoreIcon />}>
        <Typography sx={theme.typography.cardTitle}>📋 تفاصيل الشكوى</Typography>
        {!open && (
          <Typography level="body-xs" sx={{ color: 'neutral.500', mr: 1 }}>
            (انقر للتوسيع)
          </Typography>
        )}
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, py: 1.5 }}>
        {incidentData ? (
          <Box>
            {incidentData.complaint_text && (
              <Card variant="soft" color="neutral" sx={{ p: 1.5, mb: 1.5 }}>
                <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap' }}>
                  {incidentData.complaint_text}
                </Typography>
              </Card>
            )}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                rowGap: 0.75,
                columnGap: 1.5,
              }}
            >
              <InfoRow label="المريض"               value={incidentData.patient_name} />
              <InfoRow label="الأطباء"              value={doctorNames} />
              <InfoRow label="العاملون"             value={workerNames} />
              <InfoRow label="Domain"               value={incidentData.domain_name} />
              <InfoRow label="Category"             value={incidentData.category_name} />
              <InfoRow label="Subcategory"          value={incidentData.subcategory_name} />
              <InfoRow label="Classification"       value={incidentData.classification_name} />
              <InfoRow label="Severity"             value={incidentData.severity_name} />
              <InfoRow label="Harm Level"              value={incidentData.harm_level} />
              <InfoRow label="Stage"                 value={incidentData.stage_name} />
              <InfoRow label="القسم المُبلِّغ"      value={incidentData.issuing_department_name} />
              <InfoRow label="الجهة المستهدفة"      value={item?.targetOrgUnitName} />
              <InfoRow label="الإجراء الفوري"       value={incidentData.immediate_action} />
              <InfoRow label="تاريخ الحادثة"        value={incidentData.incident_date} />
              <InfoRow label="تاريخ وصول الحادثة إلى مكتب الشكاوى" value={incidentData.feedback_received_date} />
              <InfoRow label="تاريخ الاستحقاق"      value={fmtDate(dueDate)} />
              {countdown && (
                <>
                  <Typography level="body-sm" sx={{ fontWeight: 600, color: theme.colors.textSecondary }}>الوقت المتبقي:</Typography>
                  <Box><Chip size="sm" variant="soft" color={countdown.color}>{countdown.label}</Chip></Box>
                </>
              )}
              {forceCloseDate && (
                <InfoRow label="تاريخ الإغلاق القسري" value={fmtDate(forceCloseDate)} />
              )}
            </Box>
          </Box>
        ) : (
          <Typography level="body-sm" sx={{ color: 'neutral.400', fontStyle: 'italic' }}>
            لم يتم تحميل تفاصيل الشكوى
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default ComplaintDetailsSection;
