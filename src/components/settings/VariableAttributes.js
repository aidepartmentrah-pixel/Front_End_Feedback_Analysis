// src/components/settings/VariableAttributes.js
import React, { useState, useEffect } from "react";
import { Box, Card, Typography, FormControl, FormLabel, Input, Button, Grid, Alert } from "@mui/joy";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
// import axios from "axios";

const VariableAttributes = () => {
  const [delayThreshold, setDelayThreshold] = useState(14);
  const [originalThreshold, setOriginalThreshold] = useState(14);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Fetch delay threshold from API
  useEffect(() => {
    fetchDelayThreshold();
  }, []);

  const fetchDelayThreshold = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const response = await axios.get('/api/settings/feedback-delay');
      // setDelayThreshold(response.data.delay_threshold_days);
      // setOriginalThreshold(response.data.delay_threshold_days);
      
      // Mock data
      setTimeout(() => {
        setDelayThreshold(14);
        setOriginalThreshold(14);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError("فشل تحميل الإعدادات. حاول مرة أخرى.");
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!delayThreshold || delayThreshold < 1) {
      setError("يجب أن تكون مدة التأخير رقم صحيح أكبر من 0");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // TODO: Replace with actual API call
      // await axios.put('/api/settings/feedback-delay', { delay_threshold_days: delayThreshold });
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOriginalThreshold(delayThreshold);
      setSuccess("✅ تم حفظ الإعدادات بنجاح!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("فشل حفظ الإعدادات. حاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setDelayThreshold(originalThreshold);
    setError(null);
    setSuccess(null);
  };

  const hasChanges = delayThreshold !== originalThreshold;

  return (
    <Box>
      <Typography level="h4" sx={{ mb: 3, fontWeight: 700, color: "#667eea" }}>
        ⚙️ المتغيرات والإعدادات (Variable Attributes)
      </Typography>

      {success && (
        <Alert color="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert color="danger" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card
        sx={{
          p: 4,
          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
          border: "2px solid rgba(102, 126, 234, 0.2)",
        }}
      >
        <Typography level="h5" sx={{ mb: 3, fontWeight: 700, color: "#333" }}>
          📅 إعدادات التأخير (Delay Settings)
        </Typography>

        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <FormControl>
              <FormLabel sx={{ fontWeight: 600, mb: 1, fontSize: "14px" }}>
                مدة التأخير (عدد الأيام)
              </FormLabel>
              <FormLabel sx={{ fontWeight: 400, mb: 1.5, fontSize: "12px", color: "#666" }}>
                Delay Threshold (Days)
              </FormLabel>
              <Input
                type="number"
                value={delayThreshold}
                onChange={(e) => setDelayThreshold(Number(e.target.value))}
                disabled={loading || saving}
                slotProps={{
                  input: {
                    min: 1,
                    max: 365,
                  },
                }}
                sx={{
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              />
              <Typography level="body-xs" sx={{ mt: 1, color: "#666" }}>
                بعد هذا العدد من الأيام، سيتم اعتبار الشكوى متأخرة
              </Typography>
              <Typography level="body-xs" sx={{ color: "#666" }}>
                After this many days, a complaint will be considered delayed
              </Typography>
            </FormControl>
          </Grid>

          <Grid xs={12} md={6}>
            <Box
              sx={{
                p: 3,
                background: "white",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography level="body-sm" sx={{ fontWeight: 700, color: "#667eea", mb: 1 }}>
                📊 معاينة (Preview)
              </Typography>
              <Typography level="body-sm" sx={{ color: "#333", mb: 2 }}>
                الشكاوى التي مر عليها أكثر من <strong style={{ color: "#667eea" }}>{delayThreshold}</strong> يوم
                ستظهر بحالة <strong style={{ color: "#ff4757" }}>متأخرة (Delayed)</strong>
              </Typography>
              <Typography level="body-xs" sx={{ color: "#666" }}>
                Complaints older than <strong>{delayThreshold}</strong> days will be marked as{" "}
                <strong style={{ color: "#ff4757" }}>Delayed</strong>
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            startDecorator={<RefreshIcon />}
            onClick={handleReset}
            disabled={!hasChanges || saving}
            sx={{
              borderColor: "#999",
              color: "#666",
            }}
          >
            إعادة تعيين (Reset)
          </Button>

          <Button
            startDecorator={<SaveIcon />}
            onClick={handleSave}
            disabled={!hasChanges || saving}
            loading={saving}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontWeight: 700,
            }}
          >
            {saving ? "جاري الحفظ..." : "حفظ التغييرات (Save)"}
          </Button>
        </Box>
      </Card>

      <Box
        sx={{
          mt: 3,
          p: 3,
          background: "rgba(102, 126, 234, 0.05)",
          borderRadius: "8px",
          border: "1px solid rgba(102, 126, 234, 0.2)",
        }}
      >
        <Typography level="body-sm" sx={{ fontWeight: 700, color: "#667eea", mb: 1 }}>
          💡 ملاحظات (Notes)
        </Typography>
        <Typography level="body-xs" sx={{ color: "#666", mb: 1 }}>
          • التغييرات ستؤثر فوراً على جميع الشكاوى في صفحة توضيحات الأقسام
        </Typography>
        <Typography level="body-xs" sx={{ color: "#666", mb: 1 }}>
          • يُنصح بتعيين المدة حسب سياسة المستشفى للرد على الشكاوى
        </Typography>
        <Typography level="body-xs" sx={{ color: "#666" }}>
          • Changes will immediately affect all complaints in the Department Feedback page
        </Typography>
      </Box>
    </Box>
  );
};

export default VariableAttributes;
