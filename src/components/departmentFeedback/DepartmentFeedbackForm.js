// src/components/departmentFeedback/DepartmentFeedbackForm.js
import React from "react";
import { Box, FormControl, FormLabel, Textarea, Input, Grid, Typography, Checkbox } from "@mui/joy";

const DepartmentFeedbackForm = ({ formData, setFormData }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
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
      <Typography level="h6" sx={{ mb: 3, fontWeight: 700, color: "#667eea" }}>
        توضيح القسم (Department Explanation)
      </Typography>

      <Grid container spacing={2}>
        {/* Explanation Text */}
        <Grid xs={12}>
          <FormControl>
            <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
              نص التوضيح (Explanation Text) *
            </FormLabel>
            <Textarea
              minRows={4}
              value={formData.explanation_text || ""}
              onChange={(e) => handleChange("explanation_text", e.target.value)}
              placeholder="اشرح الموقف وما حدث من وجهة نظر القسم..."
              required
            />
          </FormControl>
        </Grid>

        {/* Contributing Factors */}
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

        {/* Corrective Actions */}
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

        {/* Execution Date */}
        <Grid xs={12} sm={6}>
          <FormControl>
            <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
              تاريخ التنفيذ المتوقع (Expected Execution Date)
            </FormLabel>
            <Input
              type="date"
              value={formData.execution_date || ""}
              onChange={(e) => handleChange("execution_date", e.target.value)}
            />
          </FormControl>
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
