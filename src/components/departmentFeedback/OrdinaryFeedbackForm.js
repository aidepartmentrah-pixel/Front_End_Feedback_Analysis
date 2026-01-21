// src/components/departmentFeedback/OrdinaryFeedbackForm.js
// Simple form for Ordinary cases requiring explanation
import React from "react";
import { Box, Typography, Textarea, Button, IconButton, FormControl, FormLabel, Input } from "@mui/joy";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const OrdinaryFeedbackForm = ({ formData, setFormData }) => {
  const handleAddActionItem = () => {
    setFormData(prev => ({
      ...prev,
      action_items: [
        ...(prev.action_items || []),
        { action_title: "", action_description: "", due_date: "" }
      ]
    }));
  };

  const handleRemoveActionItem = (index) => {
    setFormData(prev => ({
      ...prev,
      action_items: prev.action_items.filter((_, i) => i !== index)
    }));
  };

  const handleActionItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      action_items: prev.action_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography level="title-md" sx={{ mb: 1, fontWeight: 700, dir: "rtl" }}>
          التوضيح (Explanation) <span style={{ color: "red" }}>*</span>
        </Typography>
        <Typography level="body-sm" sx={{ mb: 1.5, color: "#666", dir: "rtl" }}>
          يرجى توضيح الإجراء المتخذ لهذه الشكوى (20 حرف على الأقل)
        </Typography>
        <Textarea
          value={formData.explanation_text || ""}
          onChange={(e) => setFormData({ ...formData, explanation_text: e.target.value })}
          placeholder="اشرح الإجراءات المتخذة للتعامل مع هذه الشكوى..."
          minRows={4}
          sx={{ width: "100%", direction: "rtl" }}
        />
        <Typography level="body-xs" sx={{ mt: 0.5, color: "#999" }}>
          {formData.explanation_text?.length || 0} / 2000 characters (minimum 20)
        </Typography>
      </Box>

      {/* Action Items (OPTIONAL for Ordinary) */}
      <Box sx={{ p: 2.5, borderRadius: "8px", background: "#f0f4ff", border: "1px solid #667eea" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography level="title-md" sx={{ fontWeight: 700, color: "#667eea", dir: "rtl" }}>
            📋 خطة العمل (Action Items) - اختياري
          </Typography>
          <Button
            size="sm"
            startDecorator={<AddCircleOutlineIcon />}
            onClick={handleAddActionItem}
            sx={{ background: "#667eea", color: "white", fontWeight: 600 }}
          >
            Add Action Item
          </Button>
        </Box>
        <Typography level="body-sm" sx={{ mb: 2, color: "#666", dir: "rtl" }}>
          يمكنك إضافة خطة عمل إذا لزم الأمر (Optional)
        </Typography>

        {formData.action_items && formData.action_items.map((item, index) => (
          <Box
            key={index}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: "8px",
              background: "white",
              border: "1px solid #e0e0e0",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography level="body-sm" sx={{ fontWeight: 700, color: "#667eea" }}>
                Action Item #{index + 1}
              </Typography>
              <IconButton
                size="sm"
                color="danger"
                onClick={() => handleRemoveActionItem(index)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <FormControl required>
                <FormLabel>Action Title *</FormLabel>
                <Input
                  value={item.action_title || ""}
                  onChange={(e) => handleActionItemChange(index, "action_title", e.target.value)}
                  placeholder="e.g., Improve communication protocol"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={item.action_description || ""}
                  onChange={(e) => handleActionItemChange(index, "action_description", e.target.value)}
                  placeholder="Detailed description..."
                  minRows={2}
                />
              </FormControl>

              <FormControl required>
                <FormLabel>Due Date *</FormLabel>
                <Input
                  type="date"
                  value={item.due_date || ""}
                  onChange={(e) => handleActionItemChange(index, "due_date", e.target.value)}
                />
              </FormControl>
            </Box>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          p: 2,
          borderRadius: "6px",
          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
          border: "1px solid rgba(102, 126, 234, 0.2)",
        }}
      >
        <Typography level="body-sm" sx={{ color: "#667eea", fontWeight: 600, dir: "rtl" }}>
          💡 ملاحظة: هذا نموذج مبسط للشكاوى العادية
        </Typography>
        <Typography level="body-xs" sx={{ color: "#666", mt: 0.5, dir: "rtl" }}>
          يتطلب فقط توضيح بسيط للإجراء المتخذ
        </Typography>
      </Box>
    </Box>
  );
};

export default OrdinaryFeedbackForm;
