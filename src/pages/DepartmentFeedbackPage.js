// src/pages/DepartmentFeedbackPage.js
// This page handles TWO types of explanations:
// 1. Incident Explanations (Tab 1): Department explains what happened in a single incident
// 2. Seasonal Explanations (Tab 2): Department explains why performance exceeded thresholds
import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Alert, Modal, ModalDialog, ModalClose, DialogTitle, DialogContent, Divider, Grid, Tabs, TabList, Tab, TabPanel } from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import DepartmentFeedbackFilters from "../components/departmentFeedback/DepartmentFeedbackFilters";
import OpenRecordsTable from "../components/departmentFeedback/OpenRecordsTable";
import ComplaintSummary from "../components/departmentFeedback/ComplaintSummary";
import DepartmentFeedbackForm from "../components/departmentFeedback/DepartmentFeedbackForm";
import FeedbackActions from "../components/departmentFeedback/FeedbackActions";
import ExplanationTypeSwitch from "../components/departmentFeedback/ExplanationTypeSwitch";
// import axios from "axios";

const DepartmentFeedbackPage = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  const [openRecords, setOpenRecords] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    severity: "",
    status: "",
    fromDate: "",
    toDate: "",
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [delayThreshold, setDelayThreshold] = useState(14);

  // Mock Data - Replace with API call
  const mockOpenRecords = [
    {
      id: "1",
      complaintID: "C-2024-0015",
      dateReceived: "2024-01-10",
      patientName: "أحمد محمد",
      patientFullName: "أحمد محمد علي",
      targetDepartment: "Emergency Department",
      severity: "HIGH",
      status: "OVERDUE",
      daysSinceReceived: 12,
      qism: "قسم الطوارئ",
      problemDomain: "CLINICAL",
      problemCategory: "نقص الرعاية الطبية",
      subCategory: "تأخير في التشخيص",
      classificationAr: "نقص الرعاية الطبية > تأخير في التشخيص",
      rawContent: "تأخر كبير في تشخيص الحالة الطارئة مما أدى إلى تفاقم الحالة",
      immediateAction: "تم توفير الرعاية الفورية وتحويل المريض للوحدة المختصة",
    },
    {
      id: "2",
      complaintID: "C-2024-0018",
      dateReceived: "2024-01-15",
      patientName: "فاطمة علي",
      patientFullName: "فاطمة علي حسن",
      targetDepartment: "ICU",
      severity: "MEDIUM",
      status: "OVERDUE",
      daysSinceReceived: 8,
      qism: "وحدة العناية المركزة",
      problemDomain: "MANAGEMENT",
      problemCategory: "الانتظار والوقت",
      subCategory: "طول فترة الانتظار",
      classificationAr: "الانتظار والوقت > طول فترة الانتظار",
      rawContent: "طول فترة انتظار نقل المريض من الطوارئ للعناية المركزة",
      immediateAction: "تم تحديد أولوية النقل وتخصيص سرير فوراً",
    },
    {
      id: "3",
      complaintID: "C-2024-0022",
      dateReceived: "2024-01-18",
      patientName: "خالد حسن",
      patientFullName: "خالد حسن أحمد",
      targetDepartment: "Cardiology",
      severity: "LOW",
      status: "OPEN",
      daysSinceReceived: 5,
      qism: "قسم القلب",
      problemDomain: "RELATIONAL",
      problemCategory: "السلوكيات والأخلاقيات",
      subCategory: "افتقار للتعاطف",
      classificationAr: "السلوكيات والأخلاقيات > افتقار للتعاطف",
      rawContent: "عدم تعاطف الطاقم الطبي مع قلق عائلة المريض",
      immediateAction: "اجتماع مع الطاقم لتوضيح أهمية التواصل مع العائلات",
    },
    {
      id: "4",
      complaintID: "C-2024-0024",
      dateReceived: "2024-01-20",
      patientName: "سارة محمود",
      patientFullName: "سارة محمود علي",
      targetDepartment: "Radiology",
      severity: "MEDIUM",
      status: "OPEN",
      daysSinceReceived: 3,
      qism: "قسم الأشعة",
      problemDomain: "CLINICAL",
      problemCategory: "الأخطاء الطبية",
      subCategory: "نتيجة تحليل خاطئة",
      classificationAr: "الأخطاء الطبية > نتيجة تحليل خاطئة",
      rawContent: "خطأ في قراءة الأشعة تسبب في تأخير العلاج",
      immediateAction: "إعادة قراءة الأشعة من قبل استشاري آخر وتصحيح التقرير",
    },
  ];

  // Mock seasonal violations data (departments that exceeded thresholds)
  const mockSeasonalViolations = [
    {
      id: "1",
      season: "2024-Q4",
      seasonLabel: "Q4 2024 (Oct-Dec)",
      department: "Cardiac 1",
      qism: "قسم القلب 1",
      metricType: "HCAT_violations",
      metricLabel: "HCAT Violations",
      thresholdValue: 15,
      actualValue: 18.5,
      status: "PENDING",
      totalRecords: 120,
      violationCount: 22,
    },
    {
      id: "2",
      season: "2024-Q4",
      seasonLabel: "Q4 2024 (Oct-Dec)",
      department: "Emergency",
      qism: "قسم الطوارئ",
      metricType: "avg_days_open",
      metricLabel: "Average Days Open",
      thresholdValue: 14,
      actualValue: 16.8,
      status: "PENDING",
      totalRecords: 85,
      violationCount: null,
    },
    {
      id: "3",
      season: "2024-Q3",
      seasonLabel: "Q3 2024 (Jul-Sep)",
      department: "ICU",
      qism: "وحدة العناية المركزة",
      metricType: "HCAT_violations",
      metricLabel: "HCAT Violations",
      thresholdValue: 15,
      actualValue: 21.3,
      status: "SUBMITTED",
      totalRecords: 94,
      violationCount: 20,
    },
  ];

  const [seasonalViolations, setSeasonalViolations] = useState(mockSeasonalViolations);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [seasonalDialogOpen, setSeasonalDialogOpen] = useState(false);
  const [seasonalFormData, setSeasonalFormData] = useState({});

  // Calculate days since received and determine status
  const processRecords = (records) => {
    return records.map(record => {
      const days = Math.floor((new Date() - new Date(record.dateReceived)) / (1000 * 60 * 60 * 24));
      const isDelayed = days > delayThreshold;
      const status = isDelayed ? "OVERDUE" : "OPEN";
      return { ...record, daysSinceReceived: days, isDelayed, status };
    });
  };

  // Fetch delay threshold from settings
  useEffect(() => {
    const fetchDelayThreshold = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await axios.get('/api/settings/feedback-delay');
        // setDelayThreshold(response.data.delay_threshold_days);
        
        // Mock data - using 14 days as default
        setDelayThreshold(14);
      } catch (err) {
        console.error("Failed to fetch delay threshold", err);
        setDelayThreshold(14); // fallback to 14 days
      }
    };
    fetchDelayThreshold();
  }, []);

  // Fetch open records
  useEffect(() => {
    fetchOpenRecords();
  }, [filters, delayThreshold]);

  const fetchOpenRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const response = await axios.get('/api/department-feedback/open-records', { params: filters });
      // setOpenRecords(response.data);
      
      // Mock data with delay
      setTimeout(() => {
        setOpenRecords(processRecords(mockOpenRecords));
        setLoading(false);
      }, 500);
    } catch (err) {
      setError("فشل تحميل السجلات. حاول مرة أخرى.");
      setLoading(false);
    }
  };

  // Filter and sort records
  const filteredAndSortedRecords = useMemo(() => {
    let filtered = [...openRecords];

    // Apply filters
    if (filters.search) {
      filtered = filtered.filter(
        r =>
          r.complaintID.toLowerCase().includes(filters.search.toLowerCase()) ||
          r.patientName.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.department) {
      filtered = filtered.filter(r => r.targetDepartment === filters.department);
    }
    if (filters.severity) {
      filtered = filtered.filter(r => r.severity === filters.severity);
    }
    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    if (filters.fromDate) {
      filtered = filtered.filter(r => new Date(r.dateReceived) >= new Date(filters.fromDate));
    }
    if (filters.toDate) {
      filtered = filtered.filter(r => new Date(r.dateReceived) <= new Date(filters.toDate));
    }

    // Sort: Delayed first, then by days descending
    filtered.sort((a, b) => {
      if (a.isDelayed && !b.isDelayed) return -1;
      if (!a.isDelayed && b.isDelayed) return 1;
      return b.daysSinceReceived - a.daysSinceReceived;
    });

    return filtered;
  }, [openRecords, filters]);

  // Open dialog with complaint details
  const handleOpenDialog = async (record) => {
    try {
      // TODO: Replace with actual API call
      // const response = await axios.get(`/api/department-feedback/${record.id}/details`);
      // setSelectedComplaint(response.data);
      
      // Mock data
      setSelectedComplaint(record);
      setFormData({});
      setDialogOpen(true);
    } catch (err) {
      setError("فشل تحميل تفاصيل الشكوى. حاول مرة أخرى.");
    }
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedComplaint(null);
    setFormData({});
  };

  // Save feedback
  const handleSave = async () => {
    if (!canSave) return;

    setSaving(true);
    try {
      // TODO: Replace with actual API call
      // await axios.post(`/api/department-feedback/${selectedComplaint.id}/add`, formData);
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("تم حفظ التوضيح بنجاح!");
      setSaving(false);
    } catch (err) {
      setError("فشل حفظ التوضيح. حاول مرة أخرى.");
      setSaving(false);
    }
  };

  // Save and close feedback
  const handleSaveAndClose = async () => {
    if (!canSave) return;

    setSaving(true);
    try {
      // TODO: Replace with actual API calls
      // await axios.post(`/api/department-feedback/${selectedComplaint.id}/add`, formData);
      // await axios.post(`/api/department-feedback/${selectedComplaint.id}/close`);
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("تم حفظ وإغلاق السجل بنجاح!");
      setSaving(false);
      handleCloseDialog();
      fetchOpenRecords();
    } catch (err) {
      setError("فشل حفظ وإغلاق السجل. حاول مرة أخرى.");
      setSaving(false);
    }
  };

  // Check if form can be saved
  const canSave = useMemo(() => {
    return (
      formData.explanation_text &&
      formData.explanation_text.trim() !== "" &&
      formData.corrective_actions &&
      formData.corrective_actions.trim() !== ""
    );
  }, [formData]);

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography
          level="h3"
          sx={{
            mb: 1,
            fontWeight: 900,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          📋 التوضيحات (Explanations)
        </Typography>

        <Typography level="body-sm" sx={{ mb: 0.5, color: "#666", fontStyle: "italic" }}>
          This page is used to document explanations: for single incident records, and for seasonal performance violations.
        </Typography>
        <Typography level="body-sm" sx={{ mb: 2, color: "#666", fontStyle: "italic", dir: "rtl" }}>
          تُستخدم هذه الصفحة لتوثيق التوضيحات: للحالات الفردية، وللأداء الفصلي الذي تجاوز العتبة.
        </Typography>

        {error && (
          <Alert color="danger" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 0 }}>
          <TabList>
            <Tab>📋 توضيح الحالات (Incident Explanations)</Tab>
            <Tab>📊 توضيح الأداء الفصلي (Seasonal Explanations)</Tab>
          </TabList>

          {/* Tab 1: Incident Explanations */}
          <TabPanel value={0} sx={{ p: 0, pt: 3 }}>
            <Alert color="warning" variant="soft" sx={{ mb: 3 }}>
              <Typography level="body-sm" sx={{ dir: "rtl" }}>
                ⚠️ هذا التوضيح خاص بهذه الحالة فقط، ولا يُستخدم للتقارير الفصلية.
              </Typography>
            </Alert>

            <DepartmentFeedbackFilters filters={filters} setFilters={setFilters} />

            <OpenRecordsTable
              records={filteredAndSortedRecords}
              loading={loading}
              onOpenDrawer={handleOpenDialog}
              delayThreshold={delayThreshold}
            />
          </TabPanel>

          {/* Tab 2: Seasonal Explanations */}
          <TabPanel value={1} sx={{ p: 0, pt: 3 }}>
            <Typography level="body-sm" sx={{ mb: 2, color: "#666", fontStyle: "italic", dir: "rtl" }}>
              هذه الصفحة لتوضيح لماذا تجاوزت نسبة الأداء العتبة المحددة في الفصل.
            </Typography>
            
            {/* Seasonal Violations Table */}
            <Box
              sx={{
                borderRadius: "8px",
                border: "1px solid rgba(102, 126, 234, 0.2)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                }}
              >
                <Typography level="h6" sx={{ fontWeight: 700 }}>
                  🚨 Seasonal Threshold Violations
                </Typography>
                <Typography level="body-xs" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Departments that exceeded performance thresholds this season
                </Typography>
              </Box>
              
              <Box sx={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e0e0e0" }}>
                      <th style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>Season</th>
                      <th style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>Department</th>
                      <th style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>Metric</th>
                      <th style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>Threshold</th>
                      <th style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>Actual</th>
                      <th style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>Status</th>
                      <th style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seasonalViolations.map((violation) => (
                      <tr key={violation.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                            {violation.seasonLabel}
                          </Typography>
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <Typography level="body-sm">{violation.department}</Typography>
                          <Typography level="body-xs" sx={{ color: "#999", dir: "rtl" }}>
                            {violation.qism}
                          </Typography>
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <Typography level="body-sm">{violation.metricLabel}</Typography>
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <Typography level="body-sm" sx={{ color: "#2ed573", fontWeight: 600 }}>
                            {violation.metricType === "HCAT_violations" ? `${violation.thresholdValue}%` : `${violation.thresholdValue} days`}
                          </Typography>
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <Typography level="body-sm" sx={{ color: "#ff4757", fontWeight: 700 }}>
                            {violation.metricType === "HCAT_violations" ? `${violation.actualValue}%` : `${violation.actualValue} days`}
                          </Typography>
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <Box
                            sx={{
                              display: "inline-flex",
                              padding: "4px 12px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: 600,
                              background: violation.status === "SUBMITTED" ? "#2ed573" : "#ffa502",
                              color: "white",
                            }}
                          >
                            {violation.status === "SUBMITTED" ? "✅ Submitted" : "⏳ Pending"}
                          </Box>
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <button
                            onClick={() => {
                              setSelectedViolation(violation);
                              setSeasonalFormData({});
                              setSeasonalDialogOpen(true);
                            }}
                            disabled={violation.status === "SUBMITTED"}
                            style={{
                              padding: "8px 16px",
                              borderRadius: "4px",
                              border: "none",
                              background: violation.status === "SUBMITTED" ? "#ccc" : "#667eea",
                              color: "white",
                              fontWeight: 600,
                              cursor: violation.status === "SUBMITTED" ? "not-allowed" : "pointer",
                              opacity: violation.status === "SUBMITTED" ? 0.6 : 1,
                            }}
                          >
                            {violation.status === "SUBMITTED" ? "View" : "Explain"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Box>
          </TabPanel>
        </Tabs>

        <Modal open={dialogOpen} onClose={handleCloseDialog}>
          <ModalDialog
            sx={{
              maxWidth: "1400px",
              width: "95vw",
              maxHeight: "90vh",
              overflow: "hidden",
              p: 0,
            }}
          >
            <ModalClose />
            {selectedComplaint && (
              <>
                <DialogTitle sx={{ p: 3, pb: 2 }}>
                  <Grid container spacing={2} sx={{ alignItems: "center" }}>
                    <Grid xs={12} md={6}>
                      <Typography level="h4" sx={{ fontWeight: 700, color: "#667eea", mb: 0.5 }}>
                        ملء توضيح الحالة (Fill Incident Explanation)
                      </Typography>
                      <Typography level="body-sm" sx={{ color: "#666" }}>
                        {selectedComplaint.complaintID} - {selectedComplaint.patientFullName}
                      </Typography>
                    </Grid>
                    <Grid xs={12} md={6} sx={{ textAlign: { xs: "left", md: "right" } }}>
                      <Typography level="body-xs" sx={{ color: "#666" }}>
                        القسم: {selectedComplaint.qism}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: "#666" }}>
                        الشدة: {selectedComplaint.severity} | الحالة: {selectedComplaint.status === "OVERDUE" ? "متأخر" : "مفتوح"}
                      </Typography>
                    </Grid>
                  </Grid>
                </DialogTitle>

                <Divider />

                <DialogContent
                  sx={{
                    p: 3,
                    overflow: "auto",
                    maxHeight: "calc(90vh - 180px)",
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid xs={12}>
                      <ComplaintSummary complaint={selectedComplaint} />
                    </Grid>

                    <Grid xs={12}>
                      <DepartmentFeedbackForm formData={formData} setFormData={setFormData} />
                    </Grid>
                  </Grid>
                </DialogContent>

                <Divider />

                <Box sx={{ p: 2.5 }}>
                  <FeedbackActions
                    onSave={handleSave}
                    onSaveAndClose={handleSaveAndClose}
                    onCancel={handleCloseDialog}
                    saving={saving}
                    canSave={canSave}
                  />
                </Box>
              </>
            )}
          </ModalDialog>
        </Modal>

        {/* Modal for Seasonal Explanation (Tab 2) */}
        <Modal open={seasonalDialogOpen} onClose={() => setSeasonalDialogOpen(false)}>
          <ModalDialog
            sx={{
              maxWidth: "900px",
              width: "90vw",
              maxHeight: "85vh",
              overflow: "hidden",
              p: 0,
            }}
          >
            <ModalClose />
            {selectedViolation && (
              <>
                <DialogTitle sx={{ p: 3, pb: 2 }}>
                  <Typography level="h4" sx={{ fontWeight: 700, color: "#667eea", mb: 0.5 }}>
                    📊 Seasonal Performance Explanation
                  </Typography>
                  <Typography level="body-sm" sx={{ color: "#666", dir: "rtl" }}>
                    توضيح تجاوز العتبة المحددة في الأداء الفصلي
                  </Typography>
                </DialogTitle>

                <Divider />

                <DialogContent
                  sx={{
                    p: 3,
                    overflow: "auto",
                    maxHeight: "calc(85vh - 180px)",
                  }}
                >
                  {/* Violation Summary */}
                  <Box
                    sx={{
                      mb: 3,
                      p: 2.5,
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                      border: "1px solid rgba(102, 126, 234, 0.3)",
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid xs={6}>
                        <Typography level="body-xs" sx={{ color: "#666", mb: 0.5 }}>Season</Typography>
                        <Typography level="body-md" sx={{ fontWeight: 700 }}>{selectedViolation.seasonLabel}</Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography level="body-xs" sx={{ color: "#666", mb: 0.5 }}>Department</Typography>
                        <Typography level="body-md" sx={{ fontWeight: 700 }}>{selectedViolation.department}</Typography>
                        <Typography level="body-xs" sx={{ color: "#999", dir: "rtl" }}>{selectedViolation.qism}</Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography level="body-xs" sx={{ color: "#666", mb: 0.5 }}>Metric</Typography>
                        <Typography level="body-md" sx={{ fontWeight: 700 }}>{selectedViolation.metricLabel}</Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography level="body-xs" sx={{ color: "#666", mb: 0.5 }}>Performance</Typography>
                        <Typography level="body-md" sx={{ fontWeight: 700 }}>
                          <span style={{ color: "#2ed573" }}>
                            Threshold: {selectedViolation.metricType === "HCAT_violations" ? `${selectedViolation.thresholdValue}%` : `${selectedViolation.thresholdValue} days`}
                          </span>
                          {" → "}
                          <span style={{ color: "#ff4757" }}>
                            Actual: {selectedViolation.metricType === "HCAT_violations" ? `${selectedViolation.actualValue}%` : `${selectedViolation.actualValue} days`}
                          </span>
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Seasonal Explanation Form */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <Box>
                      <Typography level="title-md" sx={{ mb: 1, fontWeight: 700, dir: "rtl" }}>
                        التحليل الجذري (Root Cause Analysis) <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <Typography level="body-sm" sx={{ mb: 1.5, color: "#666", dir: "rtl" }}>
                        ما هي الأسباب الجذرية التي أدت إلى تجاوز العتبة في هذا الفصل؟
                      </Typography>
                      <textarea
                        value={seasonalFormData.root_cause_analysis || ""}
                        onChange={(e) => setSeasonalFormData({ ...seasonalFormData, root_cause_analysis: e.target.value })}
                        placeholder="اشرح الأسباب الجذرية والعوامل النظامية التي ساهمت في تجاوز العتبة..."
                        style={{
                          width: "100%",
                          minHeight: "120px",
                          padding: "12px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                          fontFamily: "inherit",
                          fontSize: "14px",
                          resize: "vertical",
                          direction: "rtl",
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography level="title-md" sx={{ mb: 1, fontWeight: 700, dir: "rtl" }}>
                        الإجراءات التصحيحية (Corrective Actions) <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <Typography level="body-sm" sx={{ mb: 1.5, color: "#666", dir: "rtl" }}>
                        ما هي الإجراءات التصحيحية طويلة المدى لمنع تكرار هذا الأداء؟
                      </Typography>
                      <textarea
                        value={seasonalFormData.corrective_actions || ""}
                        onChange={(e) => setSeasonalFormData({ ...seasonalFormData, corrective_actions: e.target.value })}
                        placeholder="اذكر الإجراءات النظامية والتحسينات المخطط لها لتحسين الأداء..."
                        style={{
                          width: "100%",
                          minHeight: "120px",
                          padding: "12px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                          fontFamily: "inherit",
                          fontSize: "14px",
                          resize: "vertical",
                          direction: "rtl",
                        }}
                      />
                    </Box>

                    <Grid container spacing={2}>
                      <Grid xs={6}>
                        <Typography level="title-sm" sx={{ mb: 1, fontWeight: 600, dir: "rtl" }}>
                          تاريخ الإنجاز المتوقع
                        </Typography>
                        <input
                          type="date"
                          value={seasonalFormData.expected_completion_date || ""}
                          onChange={(e) => setSeasonalFormData({ ...seasonalFormData, expected_completion_date: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            fontFamily: "inherit",
                            fontSize: "14px",
                          }}
                        />
                      </Grid>
                      <Grid xs={6}>
                        <Typography level="title-sm" sx={{ mb: 1, fontWeight: 600, dir: "rtl" }}>
                          الشخص المسؤول
                        </Typography>
                        <input
                          type="text"
                          value={seasonalFormData.responsible_person || ""}
                          onChange={(e) => setSeasonalFormData({ ...seasonalFormData, responsible_person: e.target.value })}
                          placeholder="اسم المسؤول عن التنفيذ"
                          style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            fontFamily: "inherit",
                            fontSize: "14px",
                            direction: "rtl",
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </DialogContent>

                <Divider />

                <Box sx={{ p: 2.5, display: "flex", gap: 2, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setSeasonalDialogOpen(false)}
                    style={{
                      padding: "10px 24px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      background: "white",
                      color: "#333",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!seasonalFormData.root_cause_analysis || !seasonalFormData.corrective_actions) {
                        alert("Please fill in all required fields");
                        return;
                      }
                      // TODO: Save to API
                      await new Promise(resolve => setTimeout(resolve, 1000));
                      alert("Seasonal explanation submitted successfully!");
                      setSeasonalDialogOpen(false);
                      // Update violation status
                      setSeasonalViolations(prev => 
                        prev.map(v => v.id === selectedViolation.id ? { ...v, status: "SUBMITTED" } : v)
                      );
                    }}
                    disabled={!seasonalFormData.root_cause_analysis || !seasonalFormData.corrective_actions}
                    style={{
                      padding: "10px 24px",
                      borderRadius: "6px",
                      border: "none",
                      background: (!seasonalFormData.root_cause_analysis || !seasonalFormData.corrective_actions) ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      fontWeight: 600,
                      cursor: (!seasonalFormData.root_cause_analysis || !seasonalFormData.corrective_actions) ? "not-allowed" : "pointer",
                    }}
                  >
                    Submit Explanation
                  </button>
                </Box>
              </>
            )}
          </ModalDialog>
        </Modal>
      </Box>
    </MainLayout>
  );
};

export default DepartmentFeedbackPage;
