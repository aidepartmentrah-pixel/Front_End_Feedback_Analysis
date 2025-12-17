// src/components/departmentFeedback/DepartmentFeedbackForm.js
import React, { useState } from "react";
import { Box, FormControl, FormLabel, Textarea, Input, Grid, Typography, Checkbox, Button, Card, IconButton, Chip } from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const DepartmentFeedbackForm = ({ formData, setFormData, hideExplanation = false, hideFactors = false, hideCorrectiveActions = false }) => {
  const [newActionItem, setNewActionItem] = useState({ title: "", dueDate: "", assignedTo: "" });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddActionItem = () => {
    if (newActionItem.title && newActionItem.dueDate) {
      const currentItems = formData.action_items || [];
      handleChange("action_items", [...currentItems, { ...newActionItem, id: Date.now() }]);
      setNewActionItem({ title: "", dueDate: "", assignedTo: "" });
    }
  };

  const handleRemoveActionItem = (id) => {
    const currentItems = formData.action_items || [];
    handleChange("action_items", currentItems.filter(item => item.id !== id));
  };

  const contributingFactorOptions = [
    "نقص التدريب (Inadequate Training)",
    "حجم المرضى العالي (High Patient Volume)",
    "مشاكل المعدات (Equipment Issues)",
    "انهيار التواصل (Communication Breakdown)",
    "عدم الامتثال للسياسة (Policy Non-Compliance)",
    "نقص الموظفين (Staffing Shortage)",
    "ضغط الوقت (Time Pressure)",
    "مشاكل التوثيق (Documentation Issues)",
  ];

  const toggleFactor = (factor) => {
    const current = formData.contributing_factors || [];
    if (current.includes(factor)) {
      handleChange("contributing_factors", current.filter(f => f !== factor));
    } else {
      handleChange("contributing_factors", [...current, factor]);
    }
  };

  return (
    <Box>
      {!hideExplanation && !hideFactors && !hideCorrectiveActions && (
        <>
          <Typography level="h6" sx={{ mb: 1, fontWeight: 700, color: "#667eea" }}>
            توضيح الحالة (Incident Explanation)
          </Typography>
          <Typography level="body-xs" sx={{ mb: 2, color: "#999", fontStyle: "italic", dir: "rtl" }}>
            شرح ما حدث في هذه الحالة والإجراءات المتخذة لتفادي التكرار
          </Typography>
        </>
      )}

      <Grid container spacing={2}>
        {/* Explanation Text */}
        {!hideExplanation && (
          <Grid xs={12}>
            <FormControl>
              <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
                نص التوضيح (Explanation Text) *
              </FormLabel>
              <Textarea
                minRows={4}
                value={formData.explanation_text || ""}
                onChange={(e) => handleChange("explanation_text", e.target.value)}
                placeholder="اشرح ما حدث في هذه الحالة من وجهة نظر القسم..."
                required
              />
            </FormControl>
          </Grid>
        )}

        {/* Contributing Factors */}
        {!hideFactors && (
          <Grid xs={12}>
            <FormControl>
              <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
                العوامل المساهمة (Contributing Factors)
              </FormLabel>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 1 }}>
                {contributingFactorOptions.map((factor) => (
                  <Checkbox
                    key={factor}
                    label={factor}
                    checked={(formData.contributing_factors || []).includes(factor)}
                    onChange={() => toggleFactor(factor)}
                    sx={{ fontSize: "12px" }}
                  />
                ))}
              </Box>
            </FormControl>
          </Grid>
        )}

        {/* Corrective Actions */}
        {!hideCorrectiveActions && (
          <Grid xs={12}>
            <FormControl>
              <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
                الإجراءات التصحيحية (Corrective Actions) *
              </FormLabel>
              <Textarea
                minRows={4}
                value={formData.corrective_actions || ""}
                onChange={(e) => handleChange("corrective_actions", e.target.value)}
                placeholder="وصف الإجراءات التصحيحية التي سيتم اتخاذها لمنع التكرار..."
                required
              />
            </FormControl>
          </Grid>
        )}

        {/* Action Items Section */}
        <Grid xs={12}>
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography level="h6" sx={{ mb: 2, fontWeight: 700, color: "#667eea", display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarMonthIcon />
              خطة العمل التنفيذية (Action Items)
            </Typography>
            
            {/* Add New Action Item */}
            <Card sx={{ p: 2, mb: 2, background: "rgba(102, 126, 234, 0.05)" }}>
              <Typography level="body-sm" sx={{ mb: 1.5, fontWeight: 600 }}>
                إضافة إجراء جديد
              </Typography>
              <Grid container spacing={1.5}>
                <Grid xs={12} md={4}>
                  <Input
                    placeholder="عنوان الإجراء (مثال: تدريب الطاقم)"
                    value={newActionItem.title}
                    onChange={(e) => setNewActionItem({ ...newActionItem, title: e.target.value })}
                    size="sm"
                  />
                </Grid>
                <Grid xs={12} md={3}>
                  <Input
                    type="date"
                    value={newActionItem.dueDate}
                    onChange={(e) => setNewActionItem({ ...newActionItem, dueDate: e.target.value })}
                    size="sm"
                    slotProps={{ input: { style: { direction: 'ltr' } } }}
                  />
                </Grid>
                <Grid xs={12} md={4}>  
                  <Input
                    placeholder="المسؤول (اختياري)"
                    value={newActionItem.assignedTo}
                    onChange={(e) => setNewActionItem({ ...newActionItem, assignedTo: e.target.value })}
                    size="sm"
                  />
                </Grid>
                <Grid xs={12} md={1}>
                  <Button
                    startDecorator={<AddIcon />}
                    onClick={handleAddActionItem}
                    size="sm"
                    fullWidth
                    disabled={!newActionItem.title || !newActionItem.dueDate}
                  >
                    إضافة
                  </Button>
                </Grid>
              </Grid>
            </Card>

            {/* Action Items List */}
            {(formData.action_items || []).length > 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {formData.action_items.map((item, index) => {
                  return (
                    <Card key={item.id} sx={{ p: 1.5, borderLeft: `4px solid #667eea` }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                            <Typography level="body-sm" sx={{ fontWeight: 700 }}>
                              {index + 1}. {item.title}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                            <Typography level="body-xs" sx={{ color: "#666" }}>
                              📅 {new Date(item.dueDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </Typography>
                            {item.assignedTo && (
                              <Typography level="body-xs" sx={{ color: "#666" }}>
                                👤 {item.assignedTo}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <IconButton
                          size="sm"
                          color="danger"
                          variant="soft"
                          onClick={() => handleRemoveActionItem(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Card>
                  );
                })}
              </Box>
            )}

            {(formData.action_items || []).length === 0 && (
              <Box sx={{ p: 3, textAlign: "center", background: "#f9f9f9", borderRadius: "8px" }}>
                <Typography level="body-sm" sx={{ color: "#999" }}>
                  لم يتم إضافة أي إجراءات بعد. استخدم النموذج أعلاه لإضافة خطة العمل.
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Verification Notes */}
        <Grid xs={12}>
          <FormControl>
            <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
              ملاحظات التحقق (Verification Notes)
            </FormLabel>
            <Textarea
              minRows={3}
              value={formData.verification_notes || ""}
              onChange={(e) => handleChange("verification_notes", e.target.value)}
              placeholder="كيف سيتم التحقق من تنفيذ الإجراءات التصحيحية؟"
            />
          </FormControl>
        </Grid>

        {/* Additional Notes */}
        <Grid xs={12}>
          <FormControl>
            <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
              ملاحظات إضافية (Additional Notes)
            </FormLabel>
            <Textarea
              minRows={2}
              value={formData.additional_notes || ""}
              onChange={(e) => handleChange("additional_notes", e.target.value)}
              placeholder="أي ملاحظات أو تفاصيل إضافية..."
            />
          </FormControl>
        </Grid>
      </Grid>

      <Box
        sx={{
          mt: 3,
          p: 2,
          background: "rgba(102, 126, 234, 0.1)",
          borderRadius: "8px",
        }}
      >
        <Typography level="body-xs" sx={{ color: "#666" }}>
          * الحقول المطلوبة يجب ملؤها قبل الحفظ
        </Typography>
      </Box>
    </Box>
  );
};

export default DepartmentFeedbackForm;
