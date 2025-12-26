// src/components/redflags/DetailsModal.js
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const DetailsModal = ({ open, onClose, redFlag, loading }) => {
  if (!redFlag && !loading) return null;

  const getSeverityColor = (severity) => {
    if (severity === "CRITICAL") return "danger";
    if (severity === "HIGH") return "warning";
    return "neutral";
  };

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

  const getSeverityLabel = (severity) => {
    if (severity === "CRITICAL") return "حرج";
    if (severity === "HIGH") return "عالي";
    return severity;
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
            <Typography level="h4" sx={{ mb: 2 }}>
              تفاصيل العلم الأحمر
            </Typography>

            {/* Basic Info */}
            <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    رقم السجل
                  </Typography>
                  <Typography level="title-md" sx={{ fontWeight: 600 }}>
                    {redFlag.recordID}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    اسم المريض
                  </Typography>
                  <Typography level="title-md">{redFlag.patient_name}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    تاريخ الاستلام
                  </Typography>
                  <Typography level="title-md">
                    {new Date(redFlag.date_received).toLocaleDateString("ar-SA")}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    القسم
                  </Typography>
                  <Typography level="title-md">{redFlag.department}</Typography>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    التصنيف
                  </Typography>
                  <Typography level="title-md">{redFlag.category}</Typography>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    التصنيف الفرعي
                  </Typography>
                  <Typography level="title-md">
                    {redFlag.subcategory || "-"}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    الخطورة
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip color={getSeverityColor(redFlag.severity)} size="sm">
                      {getSeverityLabel(redFlag.severity)}
                    </Chip>
                  </Box>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    الحالة
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip color={getStatusColor(redFlag.status)} size="sm">
                      {getStatusLabel(redFlag.status)}
                    </Chip>
                  </Box>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    حدث لا يجب أن يحدث
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {redFlag.isNeverEvent ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircleIcon sx={{ color: "#dc2626", fontSize: 20 }} />
                        <Typography sx={{ color: "#dc2626", fontWeight: 600 }}>
                          نعم
                        </Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ color: "#6b7280" }}>لا</Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Card>

            {/* Incident Details */}
            {redFlag.incident_details && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography level="title-lg" sx={{ mb: 2 }}>
                  تفاصيل الحادثة
                </Typography>
                <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                  {redFlag.incident_details.complaint_text && (
                    <Box sx={{ mb: 2 }}>
                      <Typography level="body-sm" sx={{ color: "text.secondary", mb: 1 }}>
                        نص الشكوى
                      </Typography>
                      <Typography>{redFlag.incident_details.complaint_text}</Typography>
                    </Box>
                  )}
                  {redFlag.incident_details.immediate_action && (
                    <Box sx={{ mb: 2 }}>
                      <Typography level="body-sm" sx={{ color: "text.secondary", mb: 1 }}>
                        الإجراء الفوري
                      </Typography>
                      <Typography>{redFlag.incident_details.immediate_action}</Typography>
                    </Box>
                  )}
                  {redFlag.incident_details.actions_taken && (
                    <Box sx={{ mb: 2 }}>
                      <Typography level="body-sm" sx={{ color: "text.secondary", mb: 1 }}>
                        الإجراءات المتخذة
                      </Typography>
                      <Typography>{redFlag.incident_details.actions_taken}</Typography>
                    </Box>
                  )}
                  {redFlag.incident_details.root_cause && (
                    <Box sx={{ mb: 2 }}>
                      <Typography level="body-sm" sx={{ color: "text.secondary", mb: 1 }}>
                        السبب الجذري
                      </Typography>
                      <Typography>{redFlag.incident_details.root_cause}</Typography>
                    </Box>
                  )}
                  <Grid container spacing={2}>
                    {redFlag.incident_details.harm_level && (
                      <Grid xs={12} sm={6}>
                        <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                          مستوى الضرر
                        </Typography>
                        <Typography level="title-sm">
                          {redFlag.incident_details.harm_level}
                        </Typography>
                      </Grid>
                    )}
                    {redFlag.incident_details.stage && (
                      <Grid xs={12} sm={6}>
                        <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                          المرحلة
                        </Typography>
                        <Typography level="title-sm">
                          {redFlag.incident_details.stage}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Card>
              </>
            )}

            {/* Timeline */}
            {redFlag.timeline && redFlag.timeline.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography level="title-lg" sx={{ mb: 2 }}>
                  الخط الزمني
                </Typography>
                <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                  {redFlag.timeline.map((item, index) => (
                    <Box key={index} sx={{ mb: index < redFlag.timeline.length - 1 ? 2 : 0 }}>
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
            {redFlag.related_actions && redFlag.related_actions.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography level="title-lg" sx={{ mb: 2 }}>
                  الإجراءات ذات الصلة
                </Typography>
                <Card variant="outlined" sx={{ p: 2 }}>
                  {redFlag.related_actions.map((action, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: index < redFlag.related_actions.length - 1 ? 2 : 0,
                        pb: index < redFlag.related_actions.length - 1 ? 2 : 0,
                        borderBottom:
                          index < redFlag.related_actions.length - 1
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
