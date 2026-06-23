/**
 * AccountabilityBox — Force-Close Accountability Section
 *
 * Shown to SECTION_ADMIN and DEPARTMENT_ADMIN ONLY.
 * Completely separate from the main inbox table — this is NOT work to do.
 * It is a historical accountability record of cases that missed their deadline.
 *
 * RED rows   — case is currently escalated (force-closed, waiting for level above).
 *              View-only. No dismiss. Disappears once more time is granted.
 * GRAY rows  — case was force-closed then restored and progressed forward.
 *              The admin can dismiss these to clear the visual noise.
 *              Dismissed state is stored in localStorage per user.
 *
 * Props:
 *   userId   — current user ID (used to namespace localStorage key)
 *   onViewCase(subcaseId) — open CaseReviewModal in view-only mode
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, Typography, Chip, Button, CircularProgress, Divider,
} from '@mui/joy';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { getInboxAccountability } from '../../api/workflowApi';

const LS_KEY = (userId) => `hcat_accountability_dismissed_${userId}`;

const getDismissed = (userId) => {
  try {
    return new Set(JSON.parse(localStorage.getItem(LS_KEY(userId)) || '[]'));
  } catch {
    return new Set();
  }
};

const saveDismissed = (userId, set) => {
  try {
    localStorage.setItem(LS_KEY(userId), JSON.stringify([...set]));
  } catch {}
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ar-SA');
};

const AccountabilityBox = ({ userId, onViewCase }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ red: [], gray: [] });
  const [dismissed, setDismissed] = useState(() => getDismissed(userId));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getInboxAccountability();
      setData(result);
    } catch {
      // silently swallow — accountability is secondary to the main inbox
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const dismiss = (subcaseId) => {
    const next = new Set(dismissed);
    next.add(subcaseId);
    setDismissed(next);
    saveDismissed(userId, next);
  };

  const visibleRed  = data.red.filter((item) => !dismissed.has(item.subcaseId));
  const visibleGray = data.gray.filter((item) => !dismissed.has(item.subcaseId));
  const total = visibleRed.length + visibleGray.length;

  // Hide the entire box if nothing to show
  if (!loading && total === 0) return null;

  return (
    <Box sx={{ mt: 0 }}>
      {loading && (
        <Card variant="outlined" sx={{ borderRadius: 'lg', overflow: 'hidden', borderColor: 'neutral.200', p: 0 }}>
          <Box sx={{ px: 2.5, py: 2, backgroundColor: 'neutral.50', borderBottom: '1px solid', borderColor: 'neutral.100', display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size="sm" />
            <Typography level="body-sm" sx={{ color: 'neutral.400' }}>Loading Accountability Log…</Typography>
          </Box>
        </Card>
      )}

      {!loading && total > 0 && (
        <Card
          variant="outlined"
          sx={{
            borderRadius: 'lg',
            overflow: 'hidden',
            borderColor: 'neutral.200',
            p: 0,
          }}
        >
          {/* ── Card Header — matches Zone 1/2 structure ── */}
          <Box
            sx={{
              px: 2.5, py: 2,
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              backgroundColor: 'neutral.50',
              borderBottom: '1px solid', borderColor: 'neutral.200',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Box sx={{ p: 0.75, borderRadius: 'sm', backgroundColor: 'neutral.100', display: 'flex' }}>
                <LockIcon sx={{ color: 'neutral.500', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography level="h4" sx={{ color: 'neutral.700' }}>Accountability Log</Typography>
                <Typography level="body-sm" sx={{ color: 'neutral.400', mt: 0.25 }}>
                  Force-close history — not active work
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Chip size="sm" variant="soft" color="neutral">{total}</Chip>
              <Typography level="body-xs" sx={{ color: 'neutral.400' }}>
                {total === 1 ? 'Item' : 'Items'}
              </Typography>
            </Box>
          </Box>
          {/* ── RED section: still escalated ── */}
          {visibleRed.length > 0 && (
            <Box>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  backgroundColor: 'rgba(194,53,53,0.06)',
                  borderBottom: '1px solid rgba(194,53,53,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#c0392b', flexShrink: 0 }} />
                <Typography level="body-xs" sx={{ fontWeight: 700, color: '#c0392b' }}>
                  مغلقة قسريًا — بانتظار منح مهلة إضافية من المستوى الأعلى
                </Typography>
                <Chip size="sm" variant="soft" color="danger" sx={{ ml: 'auto' }}>
                  {visibleRed.length}
                </Chip>
              </Box>
              {visibleRed.map((item, idx) => (
                <React.Fragment key={item.subcaseId}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      px: 2,
                      py: 1.25,
                      borderLeft: '3px solid #c0392b',
                      '&:hover': { backgroundColor: 'rgba(194,53,53,0.03)' },
                    }}
                  >
                    {/* ID */}
                    <Box sx={{ minWidth: 90 }}>
                      {item.incidentNumber && (
                        <Typography level="body-xs" sx={{ color: 'neutral.400', fontFamily: 'monospace' }}>
                          {item.incidentNumber}
                        </Typography>
                      )}
                      <Typography level="body-xs" fontWeight="bold">
                        Case #{item.incidentId || item.subcaseId}
                      </Typography>
                    </Box>

                    {/* Unit */}
                    <Typography level="body-xs" sx={{ color: 'neutral.600', flex: 1 }}>
                      {item.targetOrgUnitName || `Unit ${item.targetOrgUnitId}`}
                    </Typography>

                    {/* When it was force-closed */}
                    <Box sx={{ minWidth: 90, textAlign: 'center' }}>
                      <Typography level="body-xs" sx={{ color: 'neutral.400' }}>تاريخ الإغلاق</Typography>
                      <Typography level="body-xs" fontWeight="bold" sx={{ color: '#c0392b' }}>
                        {fmtDate(item.sectionForceClosedAt || item.departmentForceClosedAt)}
                      </Typography>
                    </Box>

                    {/* View only */}
                    <Button
                      size="sm"
                      variant="plain"
                      color="neutral"
                      onClick={() => onViewCase && onViewCase(item)}
                      sx={{ fontSize: '0.72rem' }}
                    >
                      عرض
                    </Button>
                  </Box>
                  {idx < visibleRed.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Box>
          )}

          {/* Divider between sections if both present */}
          {visibleRed.length > 0 && visibleGray.length > 0 && (
            <Divider sx={{ borderColor: 'neutral.200' }} />
          )}

          {/* ── GRAY section: restored and moved on, dismissible ── */}
          {visibleGray.length > 0 && (
            <Box>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  backgroundColor: 'neutral.100',
                  borderBottom: '1px solid',
                  borderColor: 'neutral.200',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#888', flexShrink: 0 }} />
                <Typography level="body-xs" sx={{ fontWeight: 700, color: 'neutral.600' }}>
                  أُعيد تفعيلها — منحت مهلة إضافية وانتقلت للأمام
                </Typography>
                <Chip size="sm" variant="soft" color="neutral" sx={{ ml: 'auto' }}>
                  {visibleGray.length}
                </Chip>
              </Box>
              {visibleGray.map((item, idx) => (
                <React.Fragment key={item.subcaseId}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      px: 2,
                      py: 1.25,
                      borderLeft: '3px solid #aaa',
                      opacity: 0.75,
                      '&:hover': { opacity: 1, backgroundColor: 'neutral.100' },
                    }}
                  >
                    {/* ID */}
                    <Box sx={{ minWidth: 90 }}>
                      {item.incidentNumber && (
                        <Typography level="body-xs" sx={{ color: 'neutral.400', fontFamily: 'monospace' }}>
                          {item.incidentNumber}
                        </Typography>
                      )}
                      <Typography level="body-xs" fontWeight="bold">
                        Case #{item.incidentId || item.subcaseId}
                      </Typography>
                    </Box>

                    {/* Unit */}
                    <Typography level="body-xs" sx={{ color: 'neutral.500', flex: 1 }}>
                      {item.targetOrgUnitName || `Unit ${item.targetOrgUnitId}`}
                    </Typography>

                    {/* Force-closed → restored timeline */}
                    <Box sx={{ minWidth: 160, textAlign: 'center' }}>
                      <Typography level="body-xs" sx={{ color: 'neutral.400' }}>
                        أُغلق {fmtDate(item.sectionForceClosedAt || item.departmentForceClosedAt)}
                        {' → '}
                        مُفعَّل {fmtDate(item.sectionExtraTimeGrantedAt || item.departmentExtraTimeGrantedAt)}
                      </Typography>
                    </Box>

                    {/* View */}
                    <Button
                      size="sm"
                      variant="plain"
                      color="neutral"
                      onClick={() => onViewCase && onViewCase(item)}
                      sx={{ fontSize: '0.72rem' }}
                    >
                      عرض
                    </Button>

                    {/* Dismiss */}
                    <Button
                      size="sm"
                      variant="plain"
                      color="neutral"
                      startDecorator={<VisibilityOffIcon sx={{ fontSize: 14 }} />}
                      onClick={() => dismiss(item.subcaseId)}
                      sx={{ fontSize: '0.72rem', color: 'neutral.400' }}
                    >
                      إخفاء
                    </Button>
                  </Box>
                  {idx < visibleGray.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
};

export default AccountabilityBox;
