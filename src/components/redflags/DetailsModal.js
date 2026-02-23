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
  Card,
} from "@mui/joy";
import FlagIcon from "@mui/icons-material/Flag";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BusinessIcon from "@mui/icons-material/Business";
import CategoryIcon from "@mui/icons-material/Category";

const DetailsModal = ({ open, onClose, redFlag, loading }) => {
  if (!redFlag && !loading) return null;

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

  // Use the actual database ID (IncidentRequestCaseID), not the formatted case_id
  const caseId = redFlag?.id || redFlag?.incident_id || redFlag?.IncidentRequestCaseID;

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
        <ModalClose sx={{ top: 16, right: 16, zIndex: 10 }} />
        
        {loading ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography level="body-lg">Loading...</Typography>
          </Box>
        ) : (
          <>
            {/* Header */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                color: "white",
                p: 3,
                borderRadius: "16px 16px 0 0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <FlagIcon sx={{ fontSize: 28 }} />
                <Typography level="h4" sx={{ color: "white", fontWeight: 700 }}>
                  Red Flag
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
                    {redFlag?.patient_name || redFlag?.patient_full_name || "-"}
                  </Typography>
                </Card>

                <Card variant="soft" color="neutral" sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <CalendarTodayIcon sx={{ fontSize: 18, color: "#6b7280" }} />
                    <Typography level="body-xs" sx={{ color: "#6b7280" }}>Date</Typography>
                  </Box>
                  <Typography level="title-md" sx={{ fontWeight: 600 }}>
                    {redFlag?.date ? new Date(redFlag.date).toLocaleDateString("en-GB") : "-"}
                  </Typography>
                </Card>

                <Card variant="soft" color="neutral" sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <BusinessIcon sx={{ fontSize: 18, color: "#6b7280" }} />
                    <Typography level="body-xs" sx={{ color: "#6b7280" }}>Department</Typography>
                  </Box>
                  <Typography level="title-md" sx={{ fontWeight: 600 }}>
                    {redFlag?.department || "-"}
                  </Typography>
                </Card>

                <Card variant="soft" color="neutral" sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <CategoryIcon sx={{ fontSize: 18, color: "#6b7280" }} />
                    <Typography level="body-xs" sx={{ color: "#6b7280" }}>Category</Typography>
                  </Box>
                  <Typography level="title-md" sx={{ fontWeight: 600 }}>
                    {redFlag?.category || "-"}
                  </Typography>
                </Card>
              </Box>

              {/* Status Row */}
              <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography level="body-xs" sx={{ color: "#6b7280", mb: 0.5 }}>Severity</Typography>
                  <Chip color={getSeverityColor(redFlag?.severity)} size="lg" sx={{ fontWeight: 700 }}>
                    {redFlag?.severity || "-"}
                  </Chip>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography level="body-xs" sx={{ color: "#6b7280", mb: 0.5 }}>Status</Typography>
                  <Chip color={getStatusColor(redFlag?.status)} variant="soft" size="lg" sx={{ fontWeight: 600 }}>
                    {redFlag?.status || "-"}
                  </Chip>
                </Box>
              </Box>

              {/* Complaint Text */}
              {(redFlag?.complaint_text || redFlag?.description) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography level="title-sm" sx={{ color: "#374151", mb: 1, fontWeight: 600 }}>
                    📝 Complaint
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: "#fafafa" }}>
                    <Typography level="body-md" sx={{ lineHeight: 1.8 }}>
                      {redFlag?.complaint_text || redFlag?.description}
                    </Typography>
                  </Card>
                </>
              )}

              {/* Immediate Action */}
              {redFlag?.immediate_action && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography level="title-sm" sx={{ color: "#374151", mb: 1, fontWeight: 600 }}>
                    ⚡ Immediate Action
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: "#fafafa" }}>
                    <Typography level="body-md" sx={{ lineHeight: 1.8 }}>
                      {redFlag.immediate_action}
                    </Typography>
                  </Card>
                </>
              )}

              {/* Actions Taken */}
              {redFlag?.actions_taken && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography level="title-sm" sx={{ color: "#374151", mb: 1, fontWeight: 600 }}>
                    🏥 Actions Taken
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: "#fafafa" }}>
                    <Typography level="body-md" sx={{ lineHeight: 1.8 }}>
                      {redFlag.actions_taken}
                    </Typography>
                  </Card>
                </>
              )}

              {/* Root Cause */}
              {redFlag?.root_cause && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography level="title-sm" sx={{ color: "#374151", mb: 1, fontWeight: 600 }}>
                    🔍 Root Cause
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: "#fafafa" }}>
                    <Typography level="body-md" sx={{ lineHeight: 1.8 }}>
                      {redFlag.root_cause}
                    </Typography>
                  </Card>
                </>
              )}

              {/* Corrective Action */}
              {redFlag?.corrective_action && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography level="title-sm" sx={{ color: "#374151", mb: 1, fontWeight: 600 }}>
                    🛠️ Corrective Action
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: "#fafafa" }}>
                    <Typography level="body-md" sx={{ lineHeight: 1.8 }}>
                      {redFlag.corrective_action}
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
