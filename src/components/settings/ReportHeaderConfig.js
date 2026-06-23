/**
 * ReportHeaderConfig
 * Settings tab for configuring institutional report metadata for both
 * monthly and seasonal Word reports. Values are persisted in APP_ReportConfig.
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Textarea,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  Divider,
  Input,
  Radio,
  RadioGroup,
  Tabs,
  TabList,
  Tab,
  TabPanel,
} from "@mui/joy";
import { getReportConfig, updateReportConfig } from "../../api/reportConfigApi";
import theme from "../../theme";

const MONTHLY_FIELDS = [
  {
    key: "report_code",
    labelAr: "رمز التقرير",
    labelEn: "Report Code",
    hint: "e.g. QM-2026-01 — appears in every row of the generated report",
    multiline: false,
  },
  {
    key: "header_title",
    labelAr: "عنوان التقرير الرئيسي",
    labelEn: "Report Header Title",
    hint: "The main Arabic title displayed at the top of every report page",
    multiline: true,
    rows: 3,
  },
  {
    key: "header_subtitle",
    labelAr: "العنوان الفرعي",
    labelEn: "Header Subtitle",
    hint: "Smaller subtitle line below the main title",
    multiline: false,
  },
  {
    key: "footer_text",
    labelAr: "نص التذييل",
    labelEn: "Footer Text",
    hint: "Institutional motivational quote / footer shown at the bottom of every page",
    multiline: true,
    rows: 3,
  },
];

const SEASONAL_FIELDS = [
  {
    key: "seasonal_report_code",
    labelAr: "رمز التقرير الموسمي",
    labelEn: "Seasonal Report Code",
    hint: "e.g. SEA-2026-Q1 — appears in the generated seasonal report",
    multiline: false,
  },
  {
    key: "seasonal_header_title",
    labelAr: "عنوان التقرير الموسمي الرئيسي",
    labelEn: "Seasonal Report Header Title",
    hint: "The main Arabic title displayed at the top of every seasonal report",
    multiline: true,
    rows: 3,
  },
  {
    key: "seasonal_header_subtitle",
    labelAr: "العنوان الفرعي الموسمي",
    labelEn: "Seasonal Header Subtitle",
    hint: "Smaller subtitle line below the main title",
    multiline: false,
  },
  {
    key: "seasonal_footer_text",
    labelAr: "نص التذييل الموسمي",
    labelEn: "Seasonal Footer Text",
    hint: "Institutional text shown at the bottom of every seasonal report",
    multiline: true,
    rows: 3,
  },
];

const ALL_FIELDS = [...MONTHLY_FIELDS, ...SEASONAL_FIELDS];

const EMPTY_VALUES = {
  report_code: "",
  header_title: "",
  header_subtitle: "",
  footer_text: "",
  seasonal_report_code: "",
  seasonal_header_title: "",
  seasonal_header_subtitle: "",
  seasonal_footer_text: "",
  monthly_report_format: "classical",
};

function FieldList({ fields, values, onChange }) {
  return (
    <Card variant="outlined" sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      {fields.map((field, idx) => (
        <React.Fragment key={field.key}>
          {idx > 0 && <Divider />}
          <FormControl>
            <FormLabel>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                <Typography
                  level="title-sm"
                  sx={{ ...theme.typography.arabic, fontSize: '0.85rem' }}
                >
                  {field.labelAr}
                </Typography>
                <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                  {field.labelEn}
                </Typography>
              </Box>
            </FormLabel>

            {field.multiline ? (
              <Textarea
                value={values[field.key] ?? ""}
                onChange={(e) => onChange(field.key, e.target.value)}
                minRows={field.rows || 2}
                placeholder={field.hint}
                sx={{
                  direction: "rtl",
                  fontFamily: theme.settings.fontFamily,
                }}
              />
            ) : (
              <Input
                value={values[field.key] ?? ""}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder={field.hint}
                sx={{ direction: "ltr" }}
              />
            )}

            <Typography level="body-xs" sx={{ mt: 0.5, color: "text.tertiary" }}>
              {field.hint}
            </Typography>
          </FormControl>
        </React.Fragment>
      ))}
    </Card>
  );
}

export default function ReportHeaderConfig() {
  const [values, setValues]     = useState(EMPTY_VALUES);
  const [original, setOriginal] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getReportConfig()
      .then((cfg) => {
        if (!mounted) return;
        const merged = { ...EMPTY_VALUES, ...cfg };
        setValues(merged);
        setOriginal(merged);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(`Failed to load config: ${e.message}`);
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const hasChanges =
    original !== null && (
      ALL_FIELDS.some((f) => values[f.key] !== original[f.key]) ||
      values.monthly_report_format !== original.monthly_report_format
    );

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setSuccess(false);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await updateReportConfig(values);
      const merged = { ...EMPTY_VALUES, ...updated };
      setValues(merged);
      setOriginal(merged);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (e) {
      setError(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (original) {
      setValues(original);
      setError(null);
      setSuccess(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Typography
        level="h3"
        sx={{ mb: 0.5, fontWeight: 700, fontFamily: theme.settings.fontFamily, color: theme.settings.headerColor }}
      >
        Report Configuration
      </Typography>
      <Typography level="body-sm" sx={{ mb: 3, color: "text.tertiary" }}>
        These values are stored in the database and used when generating Word reports.
        Changes take effect on the next report generation.
      </Typography>

      {error   && <Alert color="danger"  sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert color="success" sx={{ mb: 2 }}>Configuration saved successfully.</Alert>}

      <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ mb: 2 }}>
        <TabList>
          <Tab value={0}>Monthly Report</Tab>
          <Tab value={1}>Seasonal Report</Tab>
        </TabList>

        <TabPanel value={0} sx={{ px: 0, pt: 2 }}>
          <FieldList fields={MONTHLY_FIELDS} values={values} onChange={handleChange} />

          {/* Monthly Report Format Selector — controls the DOCX export formatter only */}
          <Card variant="outlined" sx={{ p: 3, mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl>
              <FormLabel>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                  <Typography
                    level="title-sm"
                    sx={{ ...theme.typography.arabic, fontSize: "0.85rem" }}
                  >
                    تنسيق التقرير الشهري
                  </Typography>
                  <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                    Monthly Report Format
                  </Typography>
                </Box>
              </FormLabel>

              <RadioGroup
                name="monthly_report_format"
                value={values.monthly_report_format || "classical"}
                onChange={(e) => handleChange("monthly_report_format", e.target.value)}
                sx={{ gap: 1, mt: 1 }}
              >
                <Radio
                  value="classical"
                  label={
                    <Box>
                      <Typography level="body-sm" fontWeight={600}>
                        التقرير الشهري الكلاسيكي
                      </Typography>
                      <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                        Classical Monthly Report — current default format
                      </Typography>
                    </Box>
                  }
                />
                <Radio
                  value="stylish"
                  label={
                    <Box>
                      <Typography level="body-sm" fontWeight={600}>
                        التقرير الشهري المحسّن
                      </Typography>
                      <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                        Stylish Monthly Report — enhanced layout (coming in next session)
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>

              <Typography level="body-xs" sx={{ mt: 1.5, color: "text.tertiary" }}>
                يحدد هذا الخيار شكل التقرير الشهري عند التصدير فقط، ولا يغيّر البيانات أو الحسابات أو نطاق التقرير.
              </Typography>
            </FormControl>
          </Card>
        </TabPanel>

        <TabPanel value={1} sx={{ px: 0, pt: 2 }}>
          <FieldList fields={SEASONAL_FIELDS} values={values} onChange={handleChange} />
        </TabPanel>
      </Tabs>

      <Box sx={{ display: "flex", gap: 1.5, mt: 3, justifyContent: "flex-end" }}>
        <Button
          variant="plain"
          color="neutral"
          onClick={handleReset}
          disabled={!hasChanges || saving}
        >
          Reset
        </Button>
        <Button
          variant="solid"
          color="primary"
          onClick={handleSave}
          loading={saving}
          disabled={!hasChanges}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
}
