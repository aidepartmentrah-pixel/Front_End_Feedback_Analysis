// src/components/followUp/ActionTimeline.js
import React from "react";
import { Box, Typography, Card, Chip, Button, IconButton } from "@mui/joy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EditIcon from "@mui/icons-material/Edit";

const ActionTimeline = ({ actions, onMarkComplete, onRequestDelay, onActionClick }) => {
  const getPriorityStyle = (priority) => {
    switch(priority) {
      case "high":
        return { color: "#ff4757", bg: "rgba(255, 71, 87, 0.1)", border: "#ff4757" };
      case "medium":
        return { color: "#ffa502", bg: "rgba(255, 165, 2, 0.1)", border: "#ffa502" };
      case "low":
        return { color: "#1e90ff", bg: "rgba(30, 144, 255, 0.1)", border: "#1e90ff" };
      default:
        return { color: "#999", bg: "#f5f5f5", border: "#999" };
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case "completed":
        return { color: "#2ed573", label: "مكتمل", labelEn: "Completed" };
      case "delayed":
        return { color: "#ff4757", label: "متأخر", labelEn: "Delayed" };
      case "pending":
        return { color: "#ffa502", label: "معلق", labelEn: "Pending" };
      default:
        return { color: "#999", label: "غير محدد", labelEn: "Unknown" };
    }
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Sort actions by due date
  const sortedActions = [...actions].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {sortedActions.map((action, index) => {
        const priorityStyle = getPriorityStyle(action.priority);
        const statusStyle = getStatusStyle(action.status);
        const daysRemaining = getDaysRemaining(action.dueDate);
        const isOverdue = daysRemaining < 0;

        return (
          <Card
            key={action.id}
            sx={{
              p: 2.5,
              borderLeft: `4px solid ${priorityStyle.border}`,
              background: action.status === "completed" ? "rgba(46, 213, 115, 0.03)" : "white",
              opacity: action.status === "completed" ? 0.7 : 1,
              position: "relative",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }
            }}
          >
            {/* Timeline connector */}
            {index < sortedActions.length - 1 && (
              <Box
                sx={{
                  position: "absolute",
                  left: "-2px",
                  bottom: "-16px",
                  width: "4px",
                  height: "16px",
                  background: "#e0e0e0"
                }}
              />
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Chip 
                    size="sm" 
                    variant="soft"
                    sx={{ 
                      background: priorityStyle.bg,
                      color: priorityStyle.color,
                      fontWeight: 700,
                      fontSize: "0.7rem"
                    }}
                  >
                    {action.priority === "high" ? "عاجل" : action.priority === "medium" ? "متوسط" : "عادي"}
                  </Chip>
                  <Chip 
                    size="sm"
                    sx={{ 
                      background: statusStyle.color + "20",
                      color: statusStyle.color,
                      fontWeight: 600,
                      fontSize: "0.7rem"
                    }}
                  >
                    {statusStyle.label}
                  </Chip>
                  {isOverdue && action.status !== "completed" && (
                    <Chip color="danger" size="sm" variant="solid">
                      متأخر {Math.abs(daysRemaining)} يوم
                    </Chip>
                  )}
                  {!isOverdue && daysRemaining >= 0 && action.status !== "completed" && (
                    <Chip 
                      color={daysRemaining <= 3 ? "warning" : "success"} 
                      size="sm" 
                      variant="soft"
                    >
                      {daysRemaining === 0 ? "اليوم" : `${daysRemaining} يوم متبقي`}
                    </Chip>
                  )}
                </Box>

                <Typography level="h6" sx={{ fontWeight: 700, mb: 0.5, color: "#333" }}>
                  {action.actionTitle}
                </Typography>
                <Typography level="body-sm" sx={{ color: "#666", mb: 1.5 }}>
                  {action.description}
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <BusinessIcon sx={{ fontSize: "16px", color: "#667eea" }} />
                    <Typography level="body-xs" sx={{ fontSize: "0.75rem" }}>
                      {action.department}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <PersonIcon sx={{ fontSize: "16px", color: "#667eea" }} />
                    <Typography level="body-xs" sx={{ fontSize: "0.75rem" }}>
                      {action.assignedTo}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CalendarMonthIcon sx={{ fontSize: "16px", color: "#667eea" }} />
                    <Typography level="body-xs" sx={{ fontSize: "0.75rem" }}>
                      {formatDate(action.dueDate)}
                    </Typography>
                  </Box>
                </Box>

                {action.notes && (
                  <Box sx={{ mt: 1, p: 1, background: "#fff9e6", borderRadius: "4px" }}>
                    <Typography level="body-xs" sx={{ color: "#856404", fontSize: "0.75rem" }}>
                      ملاحظة: {action.notes}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, ml: 2 }}>
                {action.status !== "completed" && (
                  <>
                    <Button
                      size="sm"
                      color="success"
                      variant="soft"
                      startDecorator={<CheckCircleIcon />}
                      onClick={() => onMarkComplete(action.id)}
                      sx={{ fontSize: "0.75rem" }}
                    >
                      إتمام
                    </Button>
                    <Button
                      size="sm"
                      color="warning"
                      variant="soft"
                      startDecorator={<AccessTimeIcon />}
                      onClick={() => onRequestDelay(action.id)}
                      sx={{ fontSize: "0.75rem" }}
                    >
                      تأجيل
                    </Button>
                  </>
                )}
                <IconButton
                  size="sm"
                  variant="outlined"
                  onClick={() => onActionClick(action)}
                >
                  <EditIcon />
                </IconButton>
              </Box>
            </Box>
          </Card>
        );
      })}
    </Box>
  );
};

export default ActionTimeline;
