import React from 'react';
import { Box, Typography, Alert, FormControl, FormLabel, Textarea, Divider } from '@mui/joy';
import ComplaintDetailsSection from './ComplaintDetailsSection';
import InvestigationHistorySection from './InvestigationHistorySection';

/**
 * MainContentRegion — primary column: complaint details, investigation
 * history, and the active action's field inputs. RCA/Action Items render in
 * SupportRegion; confirm/cancel buttons render in the sticky footer.
 */
const MainContentRegion = ({
  incidentData, item, complaintOpen, onToggleComplaint,
  history, responseData,
  isPatientServicesReview,
  opinionText, onOpinionChange, opinionSaving, opinionError,
  giveMoreTimeAction,
  activeAction, explanationText, onExplanationChange,
  rejectionText, onRejectionChange,
  submitting,
}) => {
  const isGiveMoreTime =
    activeAction === 'GIVE_SECTION_MORE_TIME' ||
    activeAction === 'GIVE_DEPARTMENT_MORE_TIME' ||
    activeAction === 'GIVE_ADMINISTRATION_MORE_TIME';

  return (
    <Box>
      <ComplaintDetailsSection
        incidentData={incidentData}
        item={item}
        open={complaintOpen}
        onChange={onToggleComplaint}
      />

      <InvestigationHistorySection history={history} responseData={responseData} />

      {isPatientServicesReview ? (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography level="title-md" sx={{ mb: 0.5 }}>رأي خدمات المرضى</Typography>
          <Typography level="body-sm" sx={{ color: 'neutral.500', mb: 2 }}>
            Patient Services Opinion
          </Typography>
          <FormControl sx={{ mb: 2 }}>
            <Textarea
              minRows={7}
              placeholder="أدخل رأي خدمات المرضى هنا..."
              value={opinionText}
              onChange={onOpinionChange}
              disabled={opinionSaving}
              sx={{ minHeight: 180 }}
            />
          </FormControl>
          {opinionError && (
            <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
              <Typography level="body-sm">{opinionError}</Typography>
            </Alert>
          )}
        </Box>
      ) : (
        <>
          <Divider sx={{ mb: 2, mt: 2 }} />

          {giveMoreTimeAction && (
            <Alert color="warning" variant="soft" sx={{ mb: 2 }}>
              <Box>
                <Typography level="title-sm" sx={{ mb: 0.5 }}>هذه الحالة أُغلقت قسريًا</Typography>
                <Typography level="body-sm" sx={{ color: 'neutral.700' }}>
                  السبب: تجاوز المهلة المحددة دون تقديم رد.
                  يمكنك منح مهلة إضافية لإعادة تفعيل الحالة في الصف المسؤول، أو اتخاذ أي إجراء آخر متاح أدناه.
                </Typography>
              </Box>
            </Alert>
          )}

          {activeAction && (
            <Box
              sx={{
                p: 2, borderRadius: 'sm',
                border: '1px solid', borderColor: 'neutral.300',
                backgroundColor: 'background.surface',
              }}
            >
              {(activeAction === 'APPROVE' || activeAction === 'ACCEPT_COMPLAINT') && (
                <Alert color="success" variant="soft">
                  <Box>
                    <Typography level="body-md" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {activeAction === 'APPROVE' ? 'تأكيد القبول' : 'تأكيد قبول الشكوى'}
                    </Typography>
                    {activeAction === 'ACCEPT_COMPLAINT' && (
                      <Typography level="body-sm">
                        سيتم كتابة <strong>"قبول الشكوى"</strong> تلقائياً في حقل التوضيح. لا يلزم إدخال بنود إجراءات أو RCA.
                      </Typography>
                    )}
                  </Box>
                </Alert>
              )}

              {activeAction === 'SUBMIT_RESPONSE' && (
                <FormControl required>
                  <FormLabel>التوضيح / الشرح</FormLabel>
                  <Textarea
                    minRows={3}
                    placeholder="أدخل التوضيح..."
                    value={explanationText}
                    onChange={onExplanationChange}
                    disabled={submitting}
                  />
                </FormControl>
              )}

              {activeAction === 'OVERRIDE' && (
                <FormControl required>
                  <FormLabel>توضيح الدائرة / الإدارة</FormLabel>
                  <Textarea
                    minRows={3}
                    placeholder="أدخل التوضيح..."
                    value={explanationText}
                    onChange={onExplanationChange}
                    disabled={submitting}
                  />
                </FormControl>
              )}

              {activeAction === 'REJECT' && (
                <FormControl required>
                  <FormLabel>سبب الرفض</FormLabel>
                  <Textarea
                    minRows={3}
                    placeholder="أدخل سبب الرفض..."
                    value={rejectionText}
                    onChange={onRejectionChange}
                    disabled={submitting}
                  />
                </FormControl>
              )}

              {activeAction === 'REOPEN' && (
                <>
                  <Alert color="warning" variant="soft" sx={{ mb: 2 }}>
                    <Typography level="body-sm">ستعود الحالة إلى صندوق وارد القسم للمراجعة.</Typography>
                  </Alert>
                  <FormControl required>
                    <FormLabel>ملاحظة للقسم</FormLabel>
                    <Textarea
                      minRows={3}
                      placeholder="وضح سبب إعادة الإرسال..."
                      value={rejectionText}
                      onChange={onRejectionChange}
                      disabled={submitting}
                    />
                  </FormControl>
                </>
              )}

              {isGiveMoreTime && (
                <Alert color="warning" variant="soft">
                  <Box>
                    <Typography level="body-md" sx={{ fontWeight: 600, mb: 0.5 }}>
                      تأكيد منح المهلة الإضافية
                    </Typography>
                    <Typography level="body-sm">
                      ستتم إعادة تفعيل الحالة في صندوق وارد المستوى المسؤول لاستكمال الرد.
                    </Typography>
                  </Box>
                </Alert>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default MainContentRegion;
