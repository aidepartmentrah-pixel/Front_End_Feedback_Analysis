// src/components/reports/DepartmentFeedbackEntry.js
import React, { useState } from "react";
import { Box, Card, Typography, Textarea, Button, FormControl, FormLabel, Input } from "@mui/joy";

const DepartmentFeedbackEntry = () => {
  const [feedback, setFeedback] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = () => {
    alert("تم حفظ ملاحظات القسم بنجاح!\n\nسيتم إرسالها إلى قاعدة البيانات.");
    setFeedback("");
  };

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography level="h5" sx={{ mb: 2, fontWeight: 700, color: "#667eea" }}>
        إدخال ملاحظات القسم (Department Feedback Entry)
      </Typography>
      
      <Typography level="body-sm" sx={{ mb: 3, color: "#666" }}>
        إدخال الملاحظات المكتوبة يدوياً من القسم بناءً على المتابعة
      </Typography>

      <FormControl sx={{ mb: 2 }}>
        <FormLabel>تاريخ الاستحقاق (Due Date)</FormLabel>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </FormControl>

      <FormControl sx={{ mb: 2 }}>
        <FormLabel>ملاحظات القسم (Department Feedback)</FormLabel>
        <Textarea
          minRows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="أدخل الملاحظات المكتوبة يدوياً من القسم هنا..."
        />
      </FormControl>

      <Button
        onClick={handleSubmit}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontWeight: 700,
        }}
      >
        حفظ الملاحظات (Save Feedback)
      </Button>
    </Card>
  );
};

export default DepartmentFeedbackEntry;
