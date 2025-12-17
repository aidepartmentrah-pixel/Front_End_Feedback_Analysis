// src/components/followUp/DelayedActionsSection.js
import React from "react";
import { Box, Typography, Card, Chip, Button, Sheet, Table, IconButton } from "@mui/joy";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DeleteIcon from "@mui/icons-material/Delete";
import ScheduleIcon from "@mui/icons-material/Schedule";

const DelayedActionsSection = ({ actions, onDeleteAction, onDelayAction }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const delayedActions = actions.filter(action => action.status === "delayed");
  const overdueActions = actions.filter(action => {
    const daysRemaining = new Date(action.dueDate) - new Date();
    return daysRemaining < 0 && action.status === "pending";
  });

  const allNeedingAttention = [...delayedActions, ...overdueActions];

  if (allNeedingAttention.length === 0) {
    return (
      <Card sx={{ p: 3, background: "linear-gradient(135deg, rgba(46, 213, 115, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CheckCircleIcon sx={{ fontSize: "2.5rem", color: "#2ed573" }} />
          <Box>
            <Typography level="h6" sx={{ color: "#2ed573", fontWeight: 700 }}>
              ممتاز! لا توجد إجراءات متأخرة
            </Typography>
            <Typography level="body-sm" sx={{ color: "#666" }}>
              جميع الإجراءات ضمن الجدول الزمني المحدد
            </Typography>
          </Box>
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3, border: "2px solid #ff4757", background: "rgba(255, 71, 87, 0.02)" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <ErrorIcon sx={{ fontSize: "2rem", color: "#ff4757" }} />
        <Box>
          <Typography level="h6" sx={{ color: "#ff4757", fontWeight: 700 }}>
            الإجراءات المتأخرة التي تحتاج إلى متابعة
          </Typography>
          <Typography level="body-sm" sx={{ color: "#666" }}>
            {allNeedingAttention.length} إجراء يحتاج إلى اهتمام فوري
          </Typography>
        </Box>
        <Chip 
          color="danger" 
          variant="solid" 
          size="lg"
          sx={{ ml: "auto", fontWeight: 800, fontSize: "1.1rem" }}
        >
          {allNeedingAttention.length}
        </Chip>
      </Box>

      <Sheet sx={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #ff4757" }}>
        <Box sx={{ overflowX: "auto" }}>
          <Table
            sx={{
              "--TableCell-paddingY": "12px",
              "--TableCell-paddingX": "10px",
              fontSize: "0.85rem",
            }}
          >
            <thead>
              <tr style={{ background: "linear-gradient(135deg, #ff4757 0%, #ff6b7a 100%)" }}>
                <th style={{ color: "white" }}>الأولوية<br />Priority</th>
                <th style={{ color: "white" }}>عنوان الإجراء<br />Action Title</th>
                <th style={{ color: "white" }}>القسم<br />Department</th>
                <th style={{ color: "white" }}>المسؤول<br />Assigned To</th>
                <th style={{ color: "white" }}>تاريخ الاستحقاق<br />Due Date</th>
                <th style={{ color: "white" }}>الحالة<br />Status</th>
                <th style={{ color: "white" }}>أيام التأخير<br />Days Overdue</th>
                <th style={{ color: "white" }}>الملاحظات<br />Notes</th>
                <th style={{ color: "white" }}>إجراءات<br />Actions</th>
              </tr>
            </thead>
            <tbody>
              {allNeedingAttention.map((action) => {
                const daysOverdue = getDaysOverdue(action.dueDate);
                return (
                  <tr key={action.id} style={{ background: "rgba(255, 71, 87, 0.05)" }}>
                    <td>
                      <Chip
                        size="sm"
                        color={action.priority === "high" ? "danger" : action.priority === "medium" ? "warning" : "primary"}
                        variant="soft"
                      >
                        {action.priority === "high" ? "عاجل" : action.priority === "medium" ? "متوسط" : "عادي"}
                      </Chip>
                    </td>
                    <td>
                      <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                        {action.actionTitle}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: "#999" }}>
                        {action.actionTitleEn}
                      </Typography>
                    </td>
                    <td>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <BusinessIcon sx={{ fontSize: "14px", color: "#667eea" }} />
                        <Typography level="body-sm">{action.department}</Typography>
                      </Box>
                    </td>
                    <td>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <PersonIcon sx={{ fontSize: "14px", color: "#667eea" }} />
                        <Typography level="body-sm">{action.assignedTo}</Typography>
                      </Box>
                    </td>
                    <td>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CalendarMonthIcon sx={{ fontSize: "14px", color: "#667eea" }} />
                        <Typography level="body-sm">{formatDate(action.dueDate)}</Typography>
                      </Box>
                    </td>
                    <td>
                      <Chip
                        size="sm"
                        color="danger"
                        variant={action.status === "delayed" ? "solid" : "soft"}
                      >
                        {action.status === "delayed" ? "متأخر" : "متجاوز الموعد"}
                      </Chip>
                    </td>
                    <td>
                      <Typography level="body-sm" sx={{ color: "#ff4757", fontWeight: 700 }}>
                        {daysOverdue} يوم
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-xs" sx={{ color: "#666", maxWidth: "200px" }}>
                        {action.notes || "-"}
                      </Typography>
                    </td>
                    <td>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton
                          size="sm"
                          color="warning"
                          variant="soft"
                          onClick={() => onDelayAction(action.id)}
                          title="تأجيل أسبوع"
                        >
                          <ScheduleIcon />
                        </IconButton>
                        <IconButton
                          size="sm"
                          color="danger"
                          variant="soft"
                          onClick={() => onDeleteAction(action.id)}
                          title="حذف"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Box>
      </Sheet>
    </Card>
  );
};

export default DelayedActionsSection;
