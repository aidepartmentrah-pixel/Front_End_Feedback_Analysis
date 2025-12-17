// src/components/followUp/ActionDetailsModal.js
import React, { useState } from "react";
import { 
  Modal, 
  ModalDialog, 
  Typography, 
  Box, 
  Button, 
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Chip,
  Divider
} from "@mui/joy";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";

const ActionDetailsModal = ({ action, open, onClose, onSave }) => {
  const [extendedDate, setExtendedDate] = useState(action?.dueDate || "");
  const [notes, setNotes] = useState(action?.notes || "");

  if (!action) return null;

  const handleSave = () => {
    onSave({
      ...action,
      dueDate: extendedDate,
      notes: notes
    });
    onClose();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getPriorityStyle = (priority) => {
    switch(priority) {
      case "high":
        return { color: "#ff4757", bg: "rgba(255, 71, 87, 0.1)" };
      case "medium":
        return { color: "#ffa502", bg: "rgba(255, 165, 2, 0.1)" };
      case "low":
        return { color: "#1e90ff", bg: "rgba(30, 144, 255, 0.1)" };
      default:
        return { color: "#999", bg: "#f5f5f5" };
    }
  };

  const priorityStyle = getPriorityStyle(action.priority);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog 
        sx={{ 
          maxWidth: "700px", 
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto"
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography level="h5" sx={{ fontWeight: 700, color: "#667eea" }}>
            تفاصيل الإجراء
          </Typography>
          <Button
            size="sm"
            variant="plain"
            color="neutral"
            onClick={onClose}
            sx={{ minWidth: "auto" }}
          >
            <CloseIcon />
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Action Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Chip 
              size="sm" 
              variant="soft"
              sx={{ 
                background: priorityStyle.bg,
                color: priorityStyle.color,
                fontWeight: 700
              }}
            >
              {action.priority === "high" ? "عاجل" : action.priority === "medium" ? "متوسط" : "عادي"}
            </Chip>
            <Chip 
              size="sm"
              color={action.status === "completed" ? "success" : action.status === "delayed" ? "danger" : "warning"}
              variant="soft"
            >
              {action.status === "completed" ? "مكتمل" : action.status === "delayed" ? "متأخر" : "معلق"}
            </Chip>
          </Box>

          <Typography level="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {action.actionTitle}
          </Typography>
          <Typography level="body-sm" sx={{ color: "#999", mb: 2 }}>
            {action.actionTitleEn}
          </Typography>

          <Typography level="body-sm" sx={{ color: "#666", lineHeight: 1.6 }}>
            {action.description}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Action Info */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
          <Box>
            <FormLabel sx={{ fontSize: "0.75rem", color: "#999", mb: 0.5 }}>
              رقم الشكوى المرتبطة
            </FormLabel>
            <Typography level="body-sm" sx={{ fontWeight: 600 }}>
              {action.relatedComplaintID}
            </Typography>
          </Box>

          <Box>
            <FormLabel sx={{ fontSize: "0.75rem", color: "#999", mb: 0.5 }}>
              القسم
            </FormLabel>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <BusinessIcon sx={{ fontSize: "16px", color: "#667eea" }} />
              <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                {action.department}
              </Typography>
            </Box>
          </Box>

          <Box>
            <FormLabel sx={{ fontSize: "0.75rem", color: "#999", mb: 0.5 }}>
              الإدارة
            </FormLabel>
            <Typography level="body-sm" sx={{ fontWeight: 600 }}>
              {action.idara}
            </Typography>
          </Box>

          <Box>
            <FormLabel sx={{ fontSize: "0.75rem", color: "#999", mb: 0.5 }}>
              المسؤول
            </FormLabel>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PersonIcon sx={{ fontSize: "16px", color: "#667eea" }} />
              <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                {action.assignedTo}
              </Typography>
            </Box>
          </Box>

          <Box>
            <FormLabel sx={{ fontSize: "0.75rem", color: "#999", mb: 0.5 }}>
              تاريخ الإنشاء
            </FormLabel>
            <Typography level="body-sm" sx={{ fontWeight: 600 }}>
              {formatDate(action.createdDate)}
            </Typography>
          </Box>

          <Box>
            <FormLabel sx={{ fontSize: "0.75rem", color: "#999", mb: 0.5 }}>
              تاريخ الاستحقاق الحالي
            </FormLabel>
            <Typography level="body-sm" sx={{ fontWeight: 600, color: "#ff4757" }}>
              {formatDate(action.dueDate)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Edit Section */}
        {action.status !== "completed" && (
          <Box sx={{ mb: 3 }}>
            <Typography level="body-sm" sx={{ fontWeight: 700, mb: 2, color: "#667eea" }}>
              تحديث الإجراء
            </Typography>

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>تمديد تاريخ الاستحقاق</FormLabel>
              <Input
                type="date"
                value={extendedDate}
                onChange={(e) => setExtendedDate(e.target.value)}
                sx={{ direction: "ltr" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>ملاحظات</FormLabel>
              <Textarea
                minRows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف ملاحظات حول سبب التأخير أو التحديث..."
              />
            </FormControl>
          </Box>
        )}

        {action.completedDate && (
          <Box sx={{ p: 2, background: "rgba(46, 213, 115, 0.1)", borderRadius: "8px", mb: 2 }}>
            <Typography level="body-sm" sx={{ color: "#2ed573", fontWeight: 600 }}>
              ✓ تم إنجاز هذا الإجراء بتاريخ: {formatDate(action.completedDate)}
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" color="neutral" onClick={onClose}>
            إلغاء
          </Button>
          {action.status !== "completed" && (
            <>
              <Button
                color="warning"
                variant="soft"
                startDecorator={<AccessTimeIcon />}
                onClick={handleSave}
              >
                حفظ التغييرات
              </Button>
              <Button
                color="success"
                variant="solid"
                startDecorator={<CheckCircleIcon />}
                onClick={() => {
                  onSave({ ...action, status: "completed", completedDate: new Date().toISOString().split('T')[0] });
                  onClose();
                }}
              >
                إتمام الإجراء
              </Button>
            </>
          )}
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default ActionDetailsModal;
