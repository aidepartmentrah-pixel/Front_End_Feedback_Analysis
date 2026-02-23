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
  Card,
} from "@mui/joy";
import WarningIcon from "@mui/icons-material/Warning";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BusinessIcon from "@mui/icons-material/Business";
import CategoryIcon from "@mui/icons-material/Category";

const DetailsModal = ({ open, onClose, neverEvent, loading }) => {
  if (!neverEvent && !loading) return null;

  const getSeverityColor = (severity) => {
    const s = (severity || "").toUpperCase();
    if (s === "CRITICAL" || s === "HIGH") return "danger";
    if (s === "MEDIUM") return "warning";
    return "neutral";
  };

  const getStatusColor = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "OPEN") return "primary";
    if (s === "UNDER_REVIEW" || s === "IN_PROGRESS") return "warning";
    if (s === "FINISHED" || s === "CLOSED") return "success";
    return "neutral";
  };

  // Handle both nested (never_event.xxx) and direct (xxx) data structures
  const data = neverEvent?.never_event || neverEvent || {};
  
  // Extract fields with fallbacks
  const caseId = data.id || data.recordID || neverEvent?.id;
  const patientName = data.patientName || data.patient_name || data.patient_full_name || "-";
  const date = data.date;
  const department = data.department || "-";
  const category = data.neverEventCategory || data.category || "-";
  const eventType = data.neverEventTypeAr || data.neverEventType || data.description || "-";
  const severity = data.severity || "HIGH";
  const status = data.status || "-";
  const description = data.description || data.neverEventTypeAr || data.neverEventType || 
                      neverEvent?.incident_details?.complaint_text || "-";

  return (
    <Modal open={open} onClose={onClose} sx={{ zIndex: 9999 }}>
      <ModalDialog
        sx={{
          maxWidth: 600,
          width: "95%",
          maxHeight: "85vh",
          overflow: "auto",
          borderRadius: "16px",
          p: 0,
          zIndex: 10000,
        }}
      >
        <ModalClose sx={{ top: 16, right: 16, zIndex: 10, color: "white" }} />
        
        {loading ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography level="body-lg">Loading...</Typography>
          </Box>
        ) : (
          <>
            {/* Header */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
                color: "white",
                p: 3,
                borderRadius: "16px 16px 0 0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <WarningIcon sx={{ fontSize: 28 }} />
                <Typography level="h4" sx={{ color: "white", fontWeight: 700 }}>
                  Never Event
                </Typography>
              </Box>
              <Typography level="h2" sx={{ color: "white", fontWeight: 700 }}>
                Case #{caseId}
              </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
              {/* Key Info Cards */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
                <Card variant="soft" color="neutral" sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <PersonIcon sx={{ fontSize: 18, color: "#6b7280" }} />
                    <Typography level="body-xs" sx={{ color: "#6b7280" }}>Patient</Typography>
                  </Box>
                  <Typography level="title-md" sx={{ fontWeight: 600 }}>
                    {patientName}
                  </Typography>
                </Card>

                <Card variant="soft" color="neutral" sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <CalendarTodayIcon sx={{ fontSize: 18, color: "#6b7280" }} />
                    <Typography level="body-xs" sx={{ color: "#6b7280" }}>Date</Typography>
                  </Box>
                  <Typography level="title-md" sx={{ fontWeight: 600 }}>
                    {date ? new Date(date).toLocaleDateString("en-GB") : "-"}
                  </Typography>
                </Card>

                <Card variant="soft" color="neutral" sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <BusinessIcon sx={{ fontSize: 18, color: "#6b7280" }} />
                    <Typography level="body-xs" sx={{ color: "#6b7280" }}>Department</Typography>
                  </Box>
                  <Typography level="title-md" sx={{ fontWeight: 600 }}>
                    {department}
                  </Typography>
                </Card>

                <Card variant="soft" color="neutral" sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <CategoryIcon sx={{ fontSize: 18, color: "#6b7280" }} />
                    <Typography level="body-xs" sx={{ color: "#6b7280" }}>Category</Typography>
                  </Box>
                  <Typography level="title-md" sx={{ fontWeight: 600 }}>
                    {category}
                  </Typography>
                </Card>
              </Box>

              {/* Status Row */}
              <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography level="body-xs" sx={{ color: "#6b7280", mb: 0.5 }}>Severity</Typography>
                  <Chip color={getSeverityColor(severity)} size="lg" sx={{ fontWeight: 700 }}>
                    {severity}
                  </Chip>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography level="body-xs" sx={{ color: "#6b7280", mb: 0.5 }}>Status</Typography>
                  <Chip color={getStatusColor(status)} variant="soft" size="lg" sx={{ fontWeight: 600 }}>
                    {status}
                  </Chip>
                </Box>
              </Box>

              {/* Event Type */}
              <Divider sx={{ my: 2 }} />
              <Typography level="title-sm" sx={{ color: "#374151", mb: 1, fontWeight: 600 }}>
                ⚠️ Event Type
              </Typography>
              <Card variant="outlined" sx={{ p: 2, bgcolor: "#fef2f2", borderColor: "#fecaca" }}>
                <Typography level="body-md" sx={{ lineHeight: 1.8, color: "#991b1b" }}>
                  {eventType}
                </Typography>
              </Card>

              {/* Description / Complaint Text */}
              {description && description !== "-" && description !== eventType && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography level="title-sm" sx={{ color: "#374151", mb: 1, fontWeight: 600 }}>
                    📝 Complaint
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: "#fafafa" }}>
                    <Typography level="body-md" sx={{ lineHeight: 1.8 }}>
                      {description}
                    </Typography>
                  </Card>
                </>
              )}

              {/* Immediate Action - check both direct and nested */}
              {(data?.immediate_action || neverEvent?.incident_details?.immediate_action) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography level="title-sm" sx={{ color: "#374151", mb: 1, fontWeight: 600 }}>
                    ⚡ Immediate Action
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: "#fafafa" }}>
                    <Typography level="body-md" sx={{ lineHeight: 1.8 }}>
                      {data?.immediate_action || neverEvent?.incident_details?.immediate_action}
                    </Typography>
                  </Card>
                </>
              )}

              {/* Root Cause - check both direct and nested */}
              {(data?.root_cause || neverEvent?.incident_details?.root_cause) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography level="title-sm" sx={{ color: "#374151", mb: 1, fontWeight: 600 }}>
                    🔍 Root Cause
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: "#fafafa" }}>
                    <Typography level="body-md" sx={{ lineHeight: 1.8 }}>
                      {data?.root_cause || neverEvent?.incident_details?.root_cause}
                    </Typography>
                  </Card>
                </>
              )}

              {/* Actions Taken - check both direct and nested */}
              {(data?.actions_taken || neverEvent?.incident_details?.actions_taken) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography level="title-sm" sx={{ color: "#374151", mb: 1, fontWeight: 600 }}>
                    🏥 Actions Taken
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: "#fafafa" }}>
                    <Typography level="body-md" sx={{ lineHeight: 1.8 }}>
                      {data?.actions_taken || neverEvent?.incident_details?.actions_taken}
                    </Typography>
                  </Card>
                </>
              )}
            </Box>
          </>
        )}
      </ModalDialog>
    </Modal>
  );
};

export default DetailsModal;
