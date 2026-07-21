// src/components/followUp/ActionCalendar.js
import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Card, Chip, IconButton, Tooltip, Button, Sheet } from "@mui/joy";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import DeleteIcon from "@mui/icons-material/Delete";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CloseIcon from "@mui/icons-material/Close";
import { parseDueDate, formatDueDate, getToday } from "../../utils/dateOnly";

const statusChipProps = (displayStatus) => {
  switch (displayStatus) {
    case 'Overdue':  return { color: 'danger',  label: 'Overdue' };
    case 'Due Today': return { color: 'warning', label: 'Due Today' };
    case 'Upcoming': return { color: 'primary',  label: 'Upcoming' };
    case 'Completed': return { color: 'success', label: 'Completed' };
    default:         return { color: 'neutral',  label: displayStatus || 'Active' };
  }
};

const formatDisplayDate = (dueDateStr) => {
  if (!dueDateStr) return null;
  const d = parseDueDate(dueDateStr);
  return d ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : null;
};

const ActionCalendar = ({ actions, onActionClick, onDeleteAction, onDelayAction, selectedActionId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [processingActionId, setProcessingActionId] = useState(null);
  const closeTimerRef = useRef(null);

  // Get calendar data for current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Adjust to make Monday = 0

  // Table → Calendar: jump to the month containing the selected action's due date
  useEffect(() => {
    if (selectedActionId == null) return;
    const selected = actions.find(a => a.id === selectedActionId);
    if (!selected || !selected.dueDate) return;
    const due = parseDueDate(selected.dueDate);
    if (!due) return;
    if (due.getFullYear() !== year || due.getMonth() !== month) {
      setCurrentDate(new Date(due.getFullYear(), due.getMonth(), 1));
    }
  }, [selectedActionId, actions, year, month]);

  const monthNames = [
    "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const weekDays = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"];

  // Get actions for a specific date
  const getActionsForDate = (day) => {
    const dateStr = formatDueDate(new Date(year, month, day));
    return actions.filter(action => action.dueDate === dateStr);
  };

  const isToday = (day) => {
    const today = getToday();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isPastDue = (day) => {
    const checkDate = new Date(year, month, day);
    return checkDate < getToday() && !isToday(day);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "high": return "#ff4757";
      case "medium": return "#ffa502";
      case "low": return "#1e90ff";
      default: return "#999";
    }
  };

  const getTimingColor = (action) => {
    // Completed actions are always green
    if (action.status === "completed") return "#2ed573";

    const today = getToday();
    const due = parseDueDate(action.dueDate);

    // Overdue
    if (due < today) return "#ff4757";

    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);

    // Next 7 days
    if (due >= today && due <= in7Days) return "#ffa502";

    const in14Days = new Date(today);
    in14Days.setDate(today.getDate() + 14);

    // Next 8-14 days
    if (due > in7Days && due <= in14Days) return "#1e90ff";

    // Further out
    return "#999";
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "completed":
        return <CheckCircleIcon sx={{ fontSize: "14px", color: "#2ed573" }} />;
      case "delayed":
        return <ErrorIcon sx={{ fontSize: "14px", color: "#ff4757" }} />;
      default:
        return <WarningIcon sx={{ fontSize: "14px", color: "#ffa502" }} />;
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayMouseEnter = (day, event) => {
    const dayActions = getActionsForDate(day);
    if (dayActions.length > 0) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setHoveredDay(day);
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({ x: rect.left, y: rect.bottom });
    }
  };

  // Closing is delayed slightly so moving the cursor from the day cell to the
  // fixed-position tooltip below it (across the small gap between them)
  // doesn't dismiss the tooltip before the click on Complete/Delay registers.
  const handleDayMouseLeave = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setHoveredDay(null);
      closeTimerRef.current = null;
    }, 250);
  };

  const cancelTooltipClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleDelete = async (actionId, e) => {
    e.stopPropagation();
    if (processingActionId) return;
    setProcessingActionId(actionId);
    try {
      await onDeleteAction(actionId);
    } finally {
      setProcessingActionId(null);
      setHoveredDay(null);
    }
  };

  const handleDelay = (actionId, e) => {
    e.stopPropagation();
    if (processingActionId) return;
    onDelayAction(actionId);
    setHoveredDay(null);
  };

  // Create calendar grid with global numbering for all actions
  const calendarDays = [];
  let globalActionNumber = 0;
  
  // First pass: count all actions to get global numbering
  const actionNumberMap = new Map();
  for (let day = 1; day <= daysInMonth; day++) {
    const dayActions = getActionsForDate(day);
    dayActions.forEach(action => {
      actionNumberMap.set(action.id, ++globalActionNumber);
    });
  }

  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(<Box key={`empty-${i}`} sx={{ minHeight: "120px" }} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayActions = getActionsForDate(day);
    const isCurrentDay = isToday(day);
    const isPast = isPastDue(day);
    const hasSelectedAction = selectedActionId != null && dayActions.some(a => a.id === selectedActionId);

    calendarDays.push(
      <Box
        key={day}
        onMouseEnter={(e) => handleDayMouseEnter(day, e)}
        onMouseLeave={handleDayMouseLeave}
        sx={{
          minHeight: "120px",
          border: "1px solid #e0e0e0",
          borderRadius: "6px",
          p: 1,
          background: isCurrentDay ? "rgba(102, 126, 234, 0.08)" : isPast ? "#f9f9f9" : "white",
          borderColor: isCurrentDay ? "#667eea" : "#e0e0e0",
          borderWidth: isCurrentDay ? "2px" : "1px",
          boxShadow: hasSelectedAction ? "inset 0 0 0 2px rgba(102,126,234,0.5)" : "none",
          position: "relative",
          overflow: "visible",
          cursor: dayActions.length > 0 ? "pointer" : "default",
          "&:hover": dayActions.length > 0 ? {
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          } : {}
        }}
      >
        <Typography
          level="body-sm"
          sx={{
            fontWeight: isCurrentDay ? 700 : 600,
            color: isCurrentDay ? "#667eea" : isPast ? "#999" : "#333",
            mb: 0.5
          }}
        >
          {day}
        </Typography>

        {dayActions.length > 0 && (
          <Box sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.5,
            mt: 1
          }}>
            {dayActions.map(action => {
              const isSelected = selectedActionId != null && action.id === selectedActionId;
              return (
                <Chip
                  key={action.id}
                  size="sm"
                  variant="solid"
                  onClick={(e) => {
                    e.stopPropagation();
                    onActionClick(action);
                  }}
                  sx={{
                    background: getTimingColor(action),
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    minWidth: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    boxShadow: isSelected ? "0 0 0 3px rgba(102,126,234,0.6)" : "none",
                    transform: isSelected ? "scale(1.1)" : "scale(1)",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                >
                  {actionNumberMap.get(action.id)}
                </Chip>
              );
            })}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Card sx={{ p: 3, position: "relative" }}>
      {/* Calendar Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography level="h5" sx={{ fontWeight: 700, color: "#667eea" }}>
            {monthNames[month]} {year}
          </Typography>
          <Chip color="primary" variant="soft" size="sm">
            {actions.filter(a => a.status === "pending").length} معلق
          </Chip>
          <Chip color="danger" variant="soft" size="sm">
            {actions.filter(a => a.status === "delayed").length} متأخر
          </Chip>
        </Box>
        
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton onClick={handlePrevMonth} size="sm" variant="outlined">
            <ChevronRightIcon />
          </IconButton>
          <IconButton onClick={handleNextMonth} size="sm" variant="outlined">
            <ChevronLeftIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Calendar Grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, mb: 2 }}>
        {weekDays.map(day => (
          <Box key={day} sx={{ textAlign: "center", p: 1 }}>
            <Typography level="body-sm" sx={{ fontWeight: 700, color: "#667eea" }}>
              {day}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
        {calendarDays}
      </Box>

      {/* Hover Tooltip with Horizontal Scroll */}
      {hoveredDay !== null && (
        <Sheet
          sx={{
            position: "fixed",
            left: tooltipPosition.x,
            top: tooltipPosition.y + 5,
            zIndex: 10000,
            maxWidth: "80vw",
            p: 2,
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            border: "1px solid #e0e0e0",
            background: "white"
          }}
          onMouseEnter={cancelTooltipClose}
          onMouseLeave={handleDayMouseLeave}
        >
          <Typography level="body-sm" sx={{ fontWeight: 700, mb: 1.5, color: "#667eea" }}>
            إجراءات يوم {hoveredDay}
          </Typography>
          <Box sx={{ 
            display: "flex",
            gap: 2,
            overflowX: "auto",
            pb: 1,
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            }
          }}>
            {getActionsForDate(hoveredDay).map((action) => {
              const timingColor = getTimingColor(action);
              const style = {
                bg: timingColor === "#2ed573" ? "rgba(46, 213, 115, 0.1)" :
                    timingColor === "#ff4757" ? "rgba(255, 71, 87, 0.1)" :
                    timingColor === "#ffa502" ? "rgba(255, 165, 2, 0.1)" :
                    timingColor === "#1e90ff" ? "rgba(30, 144, 255, 0.1)" :
                    "rgba(153, 153, 153, 0.1)",
                color: timingColor
              };

              const isSelected = selectedActionId != null && action.id === selectedActionId;
              return (
                <Card
                  key={action.id}
                  variant="outlined"
                  sx={{
                    minWidth: "300px",
                    maxWidth: "300px",
                    p: 2,
                    borderRadius: "8px",
                    background: style.bg,
                    borderLeft: `4px solid ${style.color}`,
                    outline: isSelected ? "2px solid rgba(102,126,234,0.55)" : "none",
                    outlineOffset: "-1px",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      transform: "translateY(-2px)"
                    }
                  }}
                  onClick={() => onActionClick(action)}
                >
                  {/* Title + status chip */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 1 }}>
                    <Typography level="body-sm" sx={{ fontWeight: 700, flex: 1, lineHeight: 1.3 }}>
                      {action.actionTitle}
                    </Typography>
                    {action.displayStatus && (() => {
                      const s = statusChipProps(action.displayStatus);
                      return (
                        <Chip size="sm" color={s.color} variant="soft" sx={{ flexShrink: 0, fontSize: "0.65rem" }}>
                          {s.label}
                        </Chip>
                      );
                    })()}
                  </Box>

                  {/* Context rows — only render rows where data exists */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4, mb: 1.5 }}>
                    {formatDisplayDate(action.dueDate) && (
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Typography level="body-xs" sx={{ color: "#999", fontWeight: 600, flexShrink: 0 }}>Due:</Typography>
                        <Typography level="body-xs" sx={{ color: "#444" }}>{formatDisplayDate(action.dueDate)}</Typography>
                      </Box>
                    )}
                    {action.incidentNumber && (
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Typography level="body-xs" sx={{ color: "#999", fontWeight: 600, flexShrink: 0 }}>Incident:</Typography>
                        <Typography level="body-xs" sx={{ color: "#444" }}>{action.incidentNumber}</Typography>
                      </Box>
                    )}
                    {action.patientName && (
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Typography level="body-xs" sx={{ color: "#999", fontWeight: 600, flexShrink: 0 }}>Patient:</Typography>
                        <Typography level="body-xs" sx={{ color: "#444" }}>{action.patientName}</Typography>
                      </Box>
                    )}
                    {action.orgUnitName && (
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Typography level="body-xs" sx={{ color: "#999", fontWeight: 600, flexShrink: 0 }}>Unit:</Typography>
                        <Typography level="body-xs" sx={{ color: "#444" }}>{action.orgUnitName}</Typography>
                      </Box>
                    )}
                    {action.description && (
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Typography level="body-xs" sx={{ color: "#999", fontWeight: 600, flexShrink: 0 }}>Note:</Typography>
                        <Typography level="body-xs" sx={{ color: "#555", fontStyle: "italic" }}>
                          {action.description.length > 80 ? action.description.substring(0, 80) + '…' : action.description}
                        </Typography>
                      </Box>
                    )}
                    {action.caseDescription && (
                      <Typography
                        level="body-xs"
                        sx={{
                          color: "#666",
                          fontStyle: "italic",
                          mt: 0.5,
                          pt: 0.5,
                          borderTop: "1px solid rgba(0,0,0,0.06)",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                        title={action.caseDescription}
                      >
                        {action.caseDescription}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="sm"
                      color="success"
                      variant="soft"
                      startDecorator={<CheckCircleIcon />}
                      onClick={(e) => handleDelete(action.id, e)}
                      onMouseEnter={cancelTooltipClose}
                      loading={processingActionId === action.id}
                      disabled={processingActionId != null}
                      sx={{ flex: 1, fontSize: "0.7rem" }}
                    >
                      إتمام
                    </Button>
                    <Button
                      size="sm"
                      color="warning"
                      variant="soft"
                      startDecorator={<ScheduleIcon />}
                      onClick={(e) => handleDelay(action.id, e)}
                      onMouseEnter={cancelTooltipClose}
                      disabled={processingActionId != null}
                      sx={{ flex: 1, fontSize: "0.7rem" }}
                    >
                      تأجيل
                    </Button>
                  </Box>
                </Card>
              );
            })}
          </Box>
        </Sheet>
      )}
    </Card>
  );
};

export default ActionCalendar;
