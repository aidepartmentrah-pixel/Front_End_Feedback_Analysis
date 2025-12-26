// src/components/neverEvents/DetailsModal.js
import React from "react";
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Box,
  Chip,
  Divider,
  Grid,
  Card,
} from "@mui/joy";
import WarningIcon from "@mui/icons-material/Warning";

const DetailsModal = ({ open, onClose, neverEvent, loading }) => {
  if (!neverEvent && !loading) return null;

  const getStatusColor = (status) => {
    if (status === "OPEN") return "primary";
    if (status === "UNDER_REVIEW") return "warning";
    if (status === "FINISHED") return "success";
    return "neutral";
  };

  const getStatusLabel = (status) => {
    if (status === "OPEN") return "مفتوح";
    if (status === "UNDER_REVIEW") return "قيد المراجعة";
    if (status === "FINISHED") return "منتهي";
    return status;
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          maxWidth: 900,
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <ModalClose />
        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography>جاري التحميل...</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <WarningIcon sx={{ color: "#dc2626", fontSize: 28 }} />
              <Typography level="h4">
                تفاصيل الحدث الذي لا يجب أن يحدث
              </Typography>
            </Box>

            {/* Basic Info */}
            <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    رقم السجل
                  </Typography>
                  <Typography level="title-md" sx={{ fontWeight: 600 }}>
                    {neverEvent.never_event?.recordID}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    التاريخ
                  </Typography>
                  <Typography level="title-md">
                    {new Date(neverEvent.never_event?.date).toLocaleDateString("ar-SA")}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    اسم المريض
                  </Typography>
                  <Typography level="title-md">{neverEvent.never_event?.patientName}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    رقم المريض
                  </Typography>
                  <Typography level="title-md">{neverEvent.never_event?.patientID || "-"}</Typography>
                </Grid>
                <Grid xs={12}>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    نوع الحدث
                  </Typography>
                  <Box
                    sx={{
                      mt: 0.5,
                      display: "inline-block",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "4px",
                      bgcolor: "#fef2f2",
                      color: "#991b1b",
                      border: "1px solid #fecaca",
                    }}
                  >
                    <Typography level="title-md">
                      {neverEvent.never_event?.neverEventTypeAr || neverEvent.never_event?.neverEventType}
                    </Typography>
                  </Box>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    الفئة
                  </Typography>
                  <Typography level="title-md">{neverEvent.never_event?.neverEventCategory}</Typography>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    القسم
                  </Typography>
                  <Typography level="title-md">{neverEvent.never_event?.department}</Typography>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    القسم الفرعي
                  </Typography>
                  <Typography level="title-md">{neverEvent.never_event?.qism || "-"}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    الخطورة
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip color="danger" size="sm">
                      {neverEvent.never_event?.severity || "HIGH"}
                    </Chip>
                  </Box>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    الحالة
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip color={getStatusColor(neverEvent.never_event?.status)} size="sm">
                      {getStatusLabel(neverEvent.never_event?.status)}
                    </Chip>
                  </Box>
                </Grid>
                {neverEvent.never_event?.incidentID && (
                  <Grid xs={12}>
                    <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                      رقم الحادثة المرتبطة
                    </Typography>
                    <Typography level="title-md" sx={{ color: "#3b82f6" }}>
                      {neverEvent.never_event.incidentID}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Card>

            {/* Incident Details */}
            {neverEvent.incident_details && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography level="title-lg" sx={{ mb: 2 }}>
                  تفاصيل الحادثة
                </Typography>
                <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                  {neverEvent.incident_details.complaint_text && (
                    <Box sx={{ mb: 2 }}>
                      <Typography level="body-sm" sx={{ color: "text.secondary", mb: 1 }}>
                        وصف الحادثة
                      </Typography>
                      <Typography>{neverEvent.incident_details.complaint_text}</Typography>
                    </Box>
                  )}
                  {neverEvent.incident_details.immediate_action && (
                    <Box sx={{ mb: 2 }}>
                      <Typography level="body-sm" sx={{ color: "text.secondary", mb: 1 }}>
                        الإجراء الفوري
                      </Typography>
                      <Typography>{neverEvent.incident_details.immediate_action}</Typography>
                    </Box>
                  )}
                  {neverEvent.incident_details.actions_taken && (
                    <Box sx={{ mb: 2 }}>
                      <Typography level="body-sm" sx={{ color: "text.secondary", mb: 1 }}>
                        الإجراءات المتخذة
                      </Typography>
                      <Typography>{neverEvent.incident_details.actions_taken}</Typography>
                    </Box>
                  )}
                  {neverEvent.incident_details.root_cause && (
                    <Box sx={{ mb: 2 }}>
                      <Typography level="body-sm" sx={{ color: "text.secondary", mb: 1 }}>
                        السبب الجذري
                      </Typography>
                      <Typography>{neverEvent.incident_details.root_cause}</Typography>
                    </Box>
                  )}
                </Card>
              </>
            )}

            {/* Timeline */}
            {neverEvent.timeline && neverEvent.timeline.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography level="title-lg" sx={{ mb: 2 }}>
                  الخط الزمني
                </Typography>
                <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                  {neverEvent.timeline.map((item, index) => (
                    <Box key={index} sx={{ mb: index < neverEvent.timeline.length - 1 ? 2 : 0 }}>
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 0.5 }}>
                        <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                          {new Date(item.date).toLocaleDateString("ar-SA")}
                        </Typography>
                        <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                          • {item.event}
                        </Typography>
                      </Box>
                      {item.details && (
                        <Typography level="body-sm" sx={{ color: "text.secondary", pl: 2 }}>
                          {item.details}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Card>
              </>
            )}

            {/* Related Actions */}
            {neverEvent.related_actions && neverEvent.related_actions.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography level="title-lg" sx={{ mb: 2 }}>
                  الإجراءات ذات الصلة
                </Typography>
                <Card variant="outlined" sx={{ p: 2 }}>
                  {neverEvent.related_actions.map((action, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: index < neverEvent.related_actions.length - 1 ? 2 : 0,
                        pb: index < neverEvent.related_actions.length - 1 ? 2 : 0,
                        borderBottom:
                          index < neverEvent.related_actions.length - 1
                            ? "1px solid #e5e7eb"
                            : "none",
                      }}
                    >
                      <Typography level="title-sm" sx={{ mb: 1 }}>
                        {action.action}
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid xs={12} sm={4}>
                          <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                            المسؤول: {action.responsible}
                          </Typography>
                        </Grid>
                        <Grid xs={12} sm={4}>
                          <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                            الموعد النهائي:{" "}
                            {new Date(action.deadline).toLocaleDateString("ar-SA")}
                          </Typography>
                        </Grid>
                        <Grid xs={12} sm={4}>
                          <Chip size="sm" variant="soft">
                            {action.status}
                          </Chip>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Card>
              </>
            )}
          </>
        )}
      </ModalDialog>
    </Modal>
  );
};

export default DetailsModal;
