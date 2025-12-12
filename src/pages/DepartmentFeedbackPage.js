// src/pages/DepartmentFeedbackPage.js
import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Alert, Modal, ModalDialog, ModalClose, DialogTitle, DialogContent, Divider, Grid } from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import DepartmentFeedbackFilters from "../components/departmentFeedback/DepartmentFeedbackFilters";
import OpenRecordsTable from "../components/departmentFeedback/OpenRecordsTable";
import ComplaintSummary from "../components/departmentFeedback/ComplaintSummary";
import DepartmentFeedbackForm from "../components/departmentFeedback/DepartmentFeedbackForm";
import FeedbackActions from "../components/departmentFeedback/FeedbackActions";
// import axios from "axios";

const DepartmentFeedbackPage = () => {
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
            mb: 3,
            fontWeight: 900,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          📝 توضيحات الأقسام (Department Feedback)
        </Typography>

        {error && (
          <Alert color="danger" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <DepartmentFeedbackFilters filters={filters} setFilters={setFilters} />

        <OpenRecordsTable
          records={filteredAndSortedRecords}
          loading={loading}
          onOpenDrawer={handleOpenDialog}
          delayThreshold={delayThreshold}
        />

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
                        ملء توضيح القسم
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
      </Box>
    </MainLayout>
  );
};

export default DepartmentFeedbackPage;
