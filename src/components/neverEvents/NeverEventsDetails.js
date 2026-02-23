// src/components/neverEvents/NeverEventsDetails.js
import React from "react";
import { Box, Typography, Card, Chip, Divider, List, ListItem, ListItemDecorator } from "@mui/joy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

const NeverEventsDetails = ({ event }) => {
  if (!event) return null;

  const getStatusStyle = (status) => {
    const styleMap = {
      OPEN: { background: "#ff4757", color: "white" },
      CLOSED: { background: "#ffa502", color: "white" },
      FINISHED: { background: "#2ed573", color: "white" },
    };
    return styleMap[status] || { background: "#999", color: "white" };
  };

  const getInvestigationStatusStyle = (invStatus) => {
    const styleMap = {
      INITIAL: { background: "#ffa502", color: "white" },
      IN_PROGRESS: { background: "#667eea", color: "white" },
      COMPLETED: { background: "#2ed573", color: "white" },
    };
    return styleMap[invStatus] || { background: "#999", color: "white" };
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography level="h4" sx={{ fontWeight: 800, color: "#ff4757", mb: 1 }}>
          {event.neverEventTypeAr}
        </Typography>
        <Typography level="body-sm" sx={{ color: "#666" }}>
          {event.neverEventTypeEn}
        </Typography>
      </Box>

      {/* Status Chips */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        <Chip sx={{ ...getStatusStyle(event.status), fontWeight: 700 }}>
          {event.status === "OPEN" ? "Open" : event.status === "CLOSED" ? "Closed" : "Finished"}
        </Chip>
        <Chip sx={{ ...getInvestigationStatusStyle(event.investigationStatus), fontWeight: 700 }}>
          Investigation: {event.investigationStatus === "INITIAL" ? "Initial" : event.investigationStatus === "IN_PROGRESS" ? "In Progress" : "Completed"}
        </Chip>
        <Chip sx={{ background: event.regulatoryReported ? "#2ed573" : "#999", color: "white", fontWeight: 700 }}>
          {event.regulatoryReported ? "Regulatory Reported ✓" : "Not Reported"}
        </Chip>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Patient & Department Info */}
      <Card sx={{ p: 2, mb: 2, background: "rgba(102, 126, 234, 0.05)" }}>
        <Typography level="body-sm" sx={{ fontWeight: 700, mb: 1 }}>
          📋 Incident Information
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Box>
            <Typography level="body-xs" sx={{ color: "#999" }}>Record ID</Typography>
            <Typography level="body-sm" sx={{ fontWeight: 600 }}>{event.recordID}</Typography>
          </Box>
          <Box>
            <Typography level="body-xs" sx={{ color: "#999" }}>Date</Typography>
            <Typography level="body-sm" sx={{ fontWeight: 600 }}>{event.date}</Typography>
          </Box>
          <Box>
            <Typography level="body-xs" sx={{ color: "#999" }}>Patient</Typography>
            <Typography level="body-sm" sx={{ fontWeight: 600 }}>{event.patientName}</Typography>
          </Box>
          <Box>
            <Typography level="body-xs" sx={{ color: "#999" }}>Department</Typography>
            <Typography level="body-sm" sx={{ fontWeight: 600 }}>{event.sendingDepartment}</Typography>
          </Box>
          <Box>
            <Typography level="body-xs" sx={{ color: "#999" }}>Harm</Typography>
            <Typography level="body-sm" sx={{ fontWeight: 700, color: "#ff4757" }}>{event.harm}</Typography>
          </Box>
          {event.regulatoryReportDate && (
            <Box>
              <Typography level="body-xs" sx={{ color: "#999" }}>Regulatory Report Date</Typography>
              <Typography level="body-sm" sx={{ fontWeight: 600 }}>{event.regulatoryReportDate}</Typography>
            </Box>
          )}
        </Box>
      </Card>

      <Divider sx={{ my: 2 }} />

      {/* Raw Content */}
      <Box sx={{ mb: 3 }}>
        <Typography level="body-sm" sx={{ fontWeight: 700, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <ReportProblemIcon sx={{ fontSize: "18px", color: "#ff4757" }} />
          Incident Description
        </Typography>
        <Card sx={{ p: 2, background: "rgba(255, 71, 87, 0.05)", border: "1px solid rgba(255, 71, 87, 0.2)" }}>
          <Typography level="body-sm" sx={{ lineHeight: 1.8 }}>
            {event.rawContent}
          </Typography>
        </Card>
      </Box>

      {/* Immediate Action */}
      <Box sx={{ mb: 3 }}>
        <Typography level="body-sm" sx={{ fontWeight: 700, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          ⚡ Immediate Action
        </Typography>
        <Card sx={{ p: 2, background: "rgba(255, 165, 2, 0.05)", border: "1px solid rgba(255, 165, 2, 0.2)" }}>
          <Typography level="body-sm" sx={{ lineHeight: 1.8 }}>
            {event.immediateAction}
          </Typography>
        </Card>
      </Box>

      {/* Root Cause Analysis */}
      <Box sx={{ mb: 3 }}>
        <Typography level="body-sm" sx={{ fontWeight: 700, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <AssignmentIcon sx={{ fontSize: "18px", color: "#667eea" }} />
          Root Cause Analysis
          {event.rootCauseCompleted && (
            <Chip size="sm" sx={{ background: "#2ed573", color: "white", ml: 1 }}>Completed</Chip>
          )}
        </Typography>
        <Card sx={{ p: 2, background: "rgba(102, 126, 234, 0.05)", border: "1px solid rgba(102, 126, 234, 0.2)" }}>
          <Typography level="body-sm" sx={{ lineHeight: 1.8 }}>
            {event.rootCauseAnalysis}
          </Typography>
        </Card>
      </Box>

      {/* Corrective Actions */}
      {event.correctiveActions && event.correctiveActions.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography level="body-sm" sx={{ fontWeight: 700, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon sx={{ fontSize: "18px", color: "#2ed573" }} />
            Corrective Actions
          </Typography>
          <Card sx={{ p: 2, background: "rgba(46, 213, 115, 0.05)", border: "1px solid rgba(46, 213, 115, 0.2)" }}>
            <List>
              {event.correctiveActions.map((action, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemDecorator>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#2ed573",
                      }}
                    />
                  </ListItemDecorator>
                  <Typography level="body-sm">{action}</Typography>
                </ListItem>
              ))}
            </List>
          </Card>
        </Box>
      )}

      {/* Investigation Team */}
      {event.investigationTeam && event.investigationTeam.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography level="body-sm" sx={{ fontWeight: 700, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
            <GroupIcon sx={{ fontSize: "18px", color: "#5f27cd" }} />
            Investigation Team
          </Typography>
          <Card sx={{ p: 2, background: "rgba(95, 39, 205, 0.05)", border: "1px solid rgba(95, 39, 205, 0.2)" }}>
            <List>
              {event.investigationTeam.map((member, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemDecorator>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#5f27cd",
                      }}
                    />
                  </ListItemDecorator>
                  <Typography level="body-sm">{member}</Typography>
                </ListItem>
              ))}
            </List>
          </Card>
        </Box>
      )}

      {/* Timeline */}
      <Box sx={{ mb: 2 }}>
        <Typography level="body-sm" sx={{ fontWeight: 700, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <PendingIcon sx={{ fontSize: "18px", color: "#667eea" }} />
          Timeline
        </Typography>
        <Card sx={{ p: 2, background: "rgba(102, 126, 234, 0.05)" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Typography level="body-xs" sx={{ color: "#999" }}>Expected Completion Date</Typography>
              <Typography level="body-sm" sx={{ fontWeight: 600 }}>{event.expectedCompletionDate}</Typography>
            </Box>
            {event.actualCompletionDate && (
              <Box>
                <Typography level="body-xs" sx={{ color: "#999" }}>Actual Completion Date</Typography>
                <Typography level="body-sm" sx={{ fontWeight: 600, color: "#2ed573" }}>{event.actualCompletionDate}</Typography>
              </Box>
            )}
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default NeverEventsDetails;
