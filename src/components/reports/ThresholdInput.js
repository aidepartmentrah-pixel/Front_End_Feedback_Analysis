// src/components/reports/ThresholdInput.js
import React from "react";
import { Box, Card, Typography, FormControl, FormLabel, Input } from "@mui/joy";

const ThresholdInput = ({ threshold, setThreshold }) => {
  return (
    <Card
      sx={{
        p: 3,
        mb: 3,
        background: "linear-gradient(135deg, rgba(255, 165, 2, 0.05) 0%, rgba(255, 140, 0, 0.05) 100%)",
        border: "2px solid rgba(255, 165, 2, 0.3)",
      }}
    >
      <Typography level="h5" sx={{ mb: 3, fontWeight: 700, color: "#ffa502" }}>
        إعدادات العتبة (Threshold Settings)
      </Typography>

      <FormControl>
        <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
          قيمة عتبة الحالات السريرية (Clinical Cases Threshold %)
        </FormLabel>
        <Input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          endDecorator="%"
          slotProps={{
            input: {
              min: 0,
              max: 100,
              step: 0.5,
            },
          }}
          sx={{
            maxWidth: "200px",
            fontWeight: 700,
            fontSize: "18px",
            color: "#ffa502",
          }}
        />
        <Typography level="body-xs" sx={{ mt: 1, color: "#666" }}>
          سيتم مقارنة نسبة الحالات السريرية المفتوحة بهذه العتبة
          <br />
          The percentage of open clinical cases will be compared to this threshold
        </Typography>
      </FormControl>

      <Box
        sx={{
          mt: 3,
          p: 2,
          background: "rgba(255, 165, 2, 0.1)",
          borderRadius: "8px",
        }}
      >
        <Typography level="body-xs" sx={{ fontWeight: 700, color: "#ffa502", mb: 1 }}>
          📌 القاعدة (Rule):
        </Typography>
        <Typography level="body-xs" sx={{ color: "#666" }}>
          • يشمل التقرير الفصلي دائمًا <strong>جميع المجالات</strong> (Clinical + Management + Relational)<br />
          • The seasonal report always includes <strong>all domains</strong><br /><br />
          
          • إذا تجاوزت النسبة → <strong>"تجاوز الحد المسموح"</strong><br />
          • If clinical % exceeds threshold → <strong>"تجاوز الحد المسموح"</strong><br /><br />
          
          • إذا كانت ضمن العتبة → <strong>"ضمن المقبول"</strong><br />
          • If within threshold → <strong>"ضمن المقبول"</strong>
        </Typography>
      </Box>
    </Card>
  );
};

export default ThresholdInput;
