// src/components/followUp/ActionCalendar.js
import React, { useState } from "react";
import { Box, Typography, Card, Chip, IconButton, Tooltip, Button, Sheet } from "@mui/joy";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import DeleteIcon from "@mui/icons-material/Delete";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CloseIcon from "@mui/icons-material/Close";

const ActionCalendar = ({ actions, onActionClick, onDeleteAction, onDelayAction }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Get calendar data for current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Adjust to make Monday = 0

  const monthNames = [
    "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const weekDays = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"];

  // Get actions for a specific date
  const getActionsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return actions.filter(action => action.dueDate === dateStr);
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isPastDue = (day) => {
    const today = new Date();
    const checkDate = new Date(year, month, day);
    return checkDate < today && !isToday(day);
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
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(action.dueDate);
    due.setHours(0, 0, 0, 0);
    
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
      setHoveredDay(day);
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({ x: rect.left, y: rect.bottom });
    }
  };

  const handleDayMouseLeave = () => {
    setHoveredDay(null);
  };

  const handleDelete = (actionId, e) => {
    e.stopPropagation();
    onDeleteAction(actionId);
    setHoveredDay(null);
  };

  const handleDelay = (actionId, e) => {
    e.stopPropagation();
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
            {dayActions.map(action => (
              <Chip
                key={action.id}
                size="sm"
                variant="solid"
                sx={{
                  background: getTimingColor(action),
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  minWidth: "28px",
                  height: "28px",
                  borderRadius: "50%"
                }}
              >
                {actionNumberMap.get(action.id)}
              </Chip>
            ))}
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
          onMouseEnter={() => setHoveredDay(hoveredDay)}
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
                  <Typography level="body-sm" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {action.actionTitle}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: "#666", mb: 0.5 }}>
                    📍 {action.department} • 👤 {action.assignedTo}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: "#666", mb: 1.5, minHeight: "40px" }}>
                    {action.description?.substring(0, 60)}{action.description?.length > 60 ? '...' : ''}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="sm"
                      color="success"
                      variant="soft"
                      startDecorator={<CheckCircleIcon />}
                      onClick={(e) => handleDelete(action.id, e)}
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
