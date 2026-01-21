// src/components/departmentFeedback/RedFlagFeedbackForm.js
// Complex form for Red Flag and Never Event cases with causes and preventive actions
import React from "react";
import { Box, Typography, Checkbox, Textarea, FormControl, FormLabel, Input, Button, IconButton } from "@mui/joy";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const RedFlagFeedbackForm = ({ formData, setFormData }) => {
  const handleCheckboxChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleOtherTextChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        other_text: value
      }
    }));
  };

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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Explanation Text */}
      <Box>
        <Typography level="title-md" sx={{ mb: 1, fontWeight: 700, dir: "rtl" }}>
          التوضيح التفصيلي (Detailed Explanation) <span style={{ color: "red" }}>*</span>
        </Typography>
        <Typography level="body-sm" sx={{ mb: 1.5, color: "#666", dir: "rtl" }}>
          يرجى توضيح ما حدث في هذه الحالة (50 حرف على الأقل)
        </Typography>
        <Textarea
          value={formData.explanation_text || ""}
          onChange={(e) => setFormData({ ...formData, explanation_text: e.target.value })}
          placeholder="اشرح التفاصيل الكاملة للحادث..."
          minRows={4}
          sx={{ width: "100%", direction: "rtl" }}
        />
        <Typography level="body-xs" sx={{ mt: 0.5, color: "#999" }}>
          {formData.explanation_text?.length || 0} / 5000 characters (minimum 50)
        </Typography>
      </Box>

      {/* Causes - Staff */}
      <Box sx={{ p: 2.5, borderRadius: "8px", background: "#f9fafb", border: "1px solid #e0e0e0" }}>
        <Typography level="title-md" sx={{ mb: 2, fontWeight: 700, color: "#667eea", dir: "rtl" }}>
          🧑‍⚕️ الأسباب المتعلقة بالموظفين (Staff-Related Causes)
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Checkbox
            label="نقص التدريب (Lack of Training)"
            checked={formData.causes_staff?.training || false}
            onChange={(e) => handleCheckboxChange("causes_staff", "training", e.target.checked)}
          />
          <Checkbox
            label="نقص الحوافز (Lack of Incentives)"
            checked={formData.causes_staff?.incentives || false}
            onChange={(e) => handleCheckboxChange("causes_staff", "incentives", e.target.checked)}
          />
          <Checkbox
            label="نقص الكفاءة (Lack of Competency)"
            checked={formData.causes_staff?.competency || false}
            onChange={(e) => handleCheckboxChange("causes_staff", "competency", e.target.checked)}
          />
          <Checkbox
            label="نقص التوظيف (Understaffed)"
            checked={formData.causes_staff?.understaffed || false}
            onChange={(e) => handleCheckboxChange("causes_staff", "understaffed", e.target.checked)}
          />
          <Checkbox
            label="عدم الامتثال (Non-Compliance)"
            checked={formData.causes_staff?.non_compliance || false}
            onChange={(e) => handleCheckboxChange("causes_staff", "non_compliance", e.target.checked)}
          />
          <Checkbox
            label="عدم التنسيق (No Coordination)"
            checked={formData.causes_staff?.no_coordination || false}
            onChange={(e) => handleCheckboxChange("causes_staff", "no_coordination", e.target.checked)}
          />
          <Box>
            <Checkbox
              label="أخرى (Other)"
              checked={formData.causes_staff?.other || false}
              onChange={(e) => handleCheckboxChange("causes_staff", "other", e.target.checked)}
            />
            {formData.causes_staff?.other && (
              <Textarea
                placeholder="حدد سبب آخر..."
                value={formData.causes_staff?.other_text || ""}
                onChange={(e) => handleOtherTextChange("causes_staff", e.target.value)}
                minRows={2}
                sx={{ mt: 1, width: "100%", direction: "rtl" }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Causes - Process */}
      <Box sx={{ p: 2.5, borderRadius: "8px", background: "#f9fafb", border: "1px solid #e0e0e0" }}>
        <Typography level="title-md" sx={{ mb: 2, fontWeight: 700, color: "#667eea", dir: "rtl" }}>
          📋 الأسباب المتعلقة بالعمليات (Process-Related Causes)
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Checkbox
            label="غير شامل (Not Comprehensive)"
            checked={formData.causes_process?.not_comprehensive || false}
            onChange={(e) => handleCheckboxChange("causes_process", "not_comprehensive", e.target.checked)}
          />
          <Checkbox
            label="غير واضح (Unclear)"
            checked={formData.causes_process?.unclear || false}
            onChange={(e) => handleCheckboxChange("causes_process", "unclear", e.target.checked)}
          />
          <Checkbox
            label="بروتوكول مفقود (Missing Protocol)"
            checked={formData.causes_process?.missing_protocol || false}
            onChange={(e) => handleCheckboxChange("causes_process", "missing_protocol", e.target.checked)}
          />
          <Box>
            <Checkbox
              label="أخرى (Other)"
              checked={formData.causes_process?.other || false}
              onChange={(e) => handleCheckboxChange("causes_process", "other", e.target.checked)}
            />
            {formData.causes_process?.other && (
              <Textarea
                placeholder="حدد سبب آخر..."
                value={formData.causes_process?.other_text || ""}
                onChange={(e) => handleOtherTextChange("causes_process", e.target.value)}
                minRows={2}
                sx={{ mt: 1, width: "100%", direction: "rtl" }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Causes - Equipment */}
      <Box sx={{ p: 2.5, borderRadius: "8px", background: "#f9fafb", border: "1px solid #e0e0e0" }}>
        <Typography level="title-md" sx={{ mb: 2, fontWeight: 700, color: "#667eea", dir: "rtl" }}>
          🔧 الأسباب المتعلقة بالمعدات (Equipment-Related Causes)
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Checkbox
            label="غير متوفر (Not Available)"
            checked={formData.causes_equipment?.not_available || false}
            onChange={(e) => handleCheckboxChange("causes_equipment", "not_available", e.target.checked)}
          />
          <Checkbox
            label="نظام غير مكتمل (System Incomplete)"
            checked={formData.causes_equipment?.system_incomplete || false}
            onChange={(e) => handleCheckboxChange("causes_equipment", "system_incomplete", e.target.checked)}
          />
          <Checkbox
            label="صعب التطبيق (Hard to Apply)"
            checked={formData.causes_equipment?.hard_to_apply || false}
            onChange={(e) => handleCheckboxChange("causes_equipment", "hard_to_apply", e.target.checked)}
          />
          <Box>
            <Checkbox
              label="أخرى (Other)"
              checked={formData.causes_equipment?.other || false}
              onChange={(e) => handleCheckboxChange("causes_equipment", "other", e.target.checked)}
            />
            {formData.causes_equipment?.other && (
              <Textarea
                placeholder="حدد سبب آخر..."
                value={formData.causes_equipment?.other_text || ""}
                onChange={(e) => handleOtherTextChange("causes_equipment", e.target.value)}
                minRows={2}
                sx={{ mt: 1, width: "100%", direction: "rtl" }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Causes - Environment */}
      <Box sx={{ p: 2.5, borderRadius: "8px", background: "#f9fafb", border: "1px solid #e0e0e0" }}>
        <Typography level="title-md" sx={{ mb: 2, fontWeight: 700, color: "#667eea", dir: "rtl" }}>
          🏥 الأسباب المتعلقة بالبيئة (Environment-Related Causes)
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Checkbox
            label="طبيعة المكان (Place Nature)"
            checked={formData.causes_environment?.place_nature || false}
            onChange={(e) => handleCheckboxChange("causes_environment", "place_nature", e.target.checked)}
          />
          <Checkbox
            label="المحيط (Surroundings)"
            checked={formData.causes_environment?.surroundings || false}
            onChange={(e) => handleCheckboxChange("causes_environment", "surroundings", e.target.checked)}
          />
          <Checkbox
            label="ظروف العمل (Work Conditions)"
            checked={formData.causes_environment?.work_conditions || false}
            onChange={(e) => handleCheckboxChange("causes_environment", "work_conditions", e.target.checked)}
          />
          <Box>
            <Checkbox
              label="أخرى (Other)"
              checked={formData.causes_environment?.other || false}
              onChange={(e) => handleCheckboxChange("causes_environment", "other", e.target.checked)}
            />
            {formData.causes_environment?.other && (
              <Textarea
                placeholder="حدد سبب آخر..."
                value={formData.causes_environment?.other_text || ""}
                onChange={(e) => handleOtherTextChange("causes_environment", e.target.value)}
                minRows={2}
                sx={{ mt: 1, width: "100%", direction: "rtl" }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Preventive Actions */}
      <Box sx={{ p: 2.5, borderRadius: "8px", background: "#e8f5e9", border: "1px solid #4caf50" }}>
        <Typography level="title-md" sx={{ mb: 2, fontWeight: 700, color: "#2e7d32", dir: "rtl" }}>
          ✅ الإجراءات الوقائية (Preventive Actions)
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Checkbox
            label="اجتماعات شهرية (Monthly Meetings)"
            checked={formData.preventive_actions?.monthly_meetings || false}
            onChange={(e) => handleCheckboxChange("preventive_actions", "monthly_meetings", e.target.checked)}
          />
          <Checkbox
            label="برامج تدريبية (Training Programs)"
            checked={formData.preventive_actions?.training_programs || false}
            onChange={(e) => handleCheckboxChange("preventive_actions", "training_programs", e.target.checked)}
          />
          <Checkbox
            label="زيادة الموظفين (Increase Staff)"
            checked={formData.preventive_actions?.increase_staff || false}
            onChange={(e) => handleCheckboxChange("preventive_actions", "increase_staff", e.target.checked)}
          />
          <Checkbox
            label="إجراءات لجنة M&M (M&M Committee Actions)"
            checked={formData.preventive_actions?.mm_committee_actions || false}
            onChange={(e) => handleCheckboxChange("preventive_actions", "mm_committee_actions", e.target.checked)}
          />
          <Box>
            <Checkbox
              label="أخرى (Other)"
              checked={formData.preventive_actions?.other || false}
              onChange={(e) => handleCheckboxChange("preventive_actions", "other", e.target.checked)}
            />
            {formData.preventive_actions?.other && (
              <Textarea
                placeholder="حدد إجراء آخر..."
                value={formData.preventive_actions?.other_text || ""}
                onChange={(e) => handleOtherTextChange("preventive_actions", e.target.value)}
                minRows={2}
                sx={{ mt: 1, width: "100%", direction: "rtl" }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Action Items (REQUIRED - Min 1) */}
      <Box sx={{ p: 2.5, borderRadius: "8px", background: "#fff3e0", border: "2px solid #ff9800" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography level="title-md" sx={{ fontWeight: 700, color: "#e65100", dir: "rtl" }}>
            📋 خطة العمل (Action Items) <span style={{ color: "red" }}>*</span>
          </Typography>
          <Button
            size="sm"
            startDecorator={<AddCircleOutlineIcon />}
            onClick={handleAddActionItem}
            sx={{ background: "#ff9800", color: "white", fontWeight: 600 }}
          >
            Add Action Item
          </Button>
        </Box>
        <Typography level="body-sm" sx={{ mb: 2, color: "#666", dir: "rtl" }}>
          يجب إضافة خطة عمل واحدة على الأقل مع موعد محدد للتنفيذ (Required: Minimum 1 action item)
        </Typography>

        {(!formData.action_items || formData.action_items.length === 0) && (
          <Box sx={{ p: 2, background: "#ffebee", borderRadius: "6px", border: "1px dashed #f44336", textAlign: "center" }}>
            <Typography level="body-sm" sx={{ color: "#d32f2f", fontWeight: 600 }}>
              ⚠️ يجب إضافة خطة عمل واحدة على الأقل
            </Typography>
          </Box>
        )}

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
              <Typography level="body-sm" sx={{ fontWeight: 700, color: "#ff9800" }}>
                Action Item #{index + 1}
              </Typography>
              {formData.action_items.length > 1 && (
                <IconButton
                  size="sm"
                  color="danger"
                  onClick={() => handleRemoveActionItem(index)}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <FormControl required>
                <FormLabel>Action Title *</FormLabel>
                <Input
                  value={item.action_title || ""}
                  onChange={(e) => handleActionItemChange(index, "action_title", e.target.value)}
                  placeholder="e.g., Conduct staff training on emergency protocols"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={item.action_description || ""}
                  onChange={(e) => handleActionItemChange(index, "action_description", e.target.value)}
                  placeholder="Detailed description of the action..."
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
    </Box>
  );
};

export default RedFlagFeedbackForm;
