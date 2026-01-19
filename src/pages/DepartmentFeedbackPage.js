// src/pages/DepartmentFeedbackPage.js
// This page handles TWO types of explanations:
// 1. Incident Explanations (Tab 1): Department explains what happened in a single incident
// 2. Seasonal Explanations (Tab 2): Department explains why performance exceeded thresholds
import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Alert, Modal, ModalDialog, ModalClose, DialogTitle, DialogContent, Divider, Grid } from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import DepartmentFeedbackFilters from "../components/departmentFeedback/DepartmentFeedbackFilters";
import OpenRecordsTable from "../components/departmentFeedback/OpenRecordsTable";
import ComplaintSummary from "../components/departmentFeedback/ComplaintSummary";
import DepartmentFeedbackForm from "../components/departmentFeedback/DepartmentFeedbackForm";
import FeedbackActions from "../components/departmentFeedback/FeedbackActions";
import ExplanationTypeSwitch from "../components/departmentFeedback/ExplanationTypeSwitch";
import { syncActionItemsToFollowUp } from "../utils/actionItemsHelper";
import * as ExplanationsAPI from "../api/explanations";
// import axios from "axios";

const DepartmentFeedbackPage = () => {
  // Helper function to map API response to UI data structure
  const mapApiCaseToUIRecord = (apiCase) => {
    const dateReceived = new Date(apiCase.date_submitted);
    const today = new Date();
    const daysSinceReceived = Math.floor((today - dateReceived) / (1000 * 60 * 60 * 24));
    const isDelayed = daysSinceReceived > delayThreshold;
    
    return {
      id: apiCase.case_id.toString(),
      complaintID: apiCase.case_number,
      dateReceived: apiCase.date_submitted,
      patientName: apiCase.patient_name || "N/A",
      patientFullName: apiCase.patient_name || "N/A",
      targetDepartment: apiCase.department_name,
      severity: apiCase.case_type === "Red Flag" ? "HIGH" : apiCase.case_type === "Never Event" ? "HIGH" : "MEDIUM",
      status: isDelayed ? "OVERDUE" : "OPEN",
      daysSinceReceived,
      isDelayed,
      qism: apiCase.department_name, // Will be populated from department lookup if available
      problemDomain: apiCase.problem_domain || "N/A",
      problemCategory: apiCase.problem_category || "N/A",
      subCategory: apiCase.sub_category || "N/A",
      classificationAr: apiCase.classification_ar || "N/A",
      rawContent: apiCase.raw_content || "N/A",
      immediateAction: apiCase.immediate_action || "N/A",
      isRedFlag: apiCase.case_type === "Red Flag",
      explanation_status: apiCase.explanation_status,
      case_status: apiCase.case_status,
    };
  };

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
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [delayThreshold, setDelayThreshold] = useState(14);
  const [statistics, setStatistics] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

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
      isRedFlag: false,
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
      isRedFlag: false,
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
      isRedFlag: true,
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

  // Fetch statistics on mount
  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoadingStats(true);
    try {
      const response = await ExplanationsAPI.getExplanationStatistics();
      setStatistics(response.statistics);
    } catch (err) {
      console.error("Failed to fetch statistics", err);
      // Don't show error to user, just log it
    } finally {
      setLoadingStats(false);
    }
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
      // Build API query parameters from filters
      const apiParams = {
        dept_id: filters.department ? parseInt(filters.department) : undefined,
        start_date: filters.fromDate || undefined,
        end_date: filters.toDate || undefined,
        case_type: filters.severity === "HIGH" ? "Red Flag" : undefined,
        include_red_flags_only: filters.severity === "HIGH" ? true : undefined,
      };

      // Fetch from API
      const response = await ExplanationsAPI.getPendingExplanations(apiParams);
      
      // Map API response to UI data structure
      const mappedRecords = response.data.map(mapApiCaseToUIRecord);
      
      setOpenRecords(mappedRecords);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching open records:", err);
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
      setLoading(true);
      
      // Fetch full case details from API
      const response = await ExplanationsAPI.getCaseDetails(record.id);
      
      // Map API response to UI structure
      const caseDetails = {
        ...record, // Keep the original record data
        // Override with API response data
        id: response.case.case_id.toString(),
        complaintID: response.case.case_number,
        targetDepartment: response.case.department_name,
        qism: response.case.department_name,
        case_status: response.case.case_status,
        explanation_status: response.case.explanation_status,
        requires_explanation: response.case.requires_explanation,
        // Validation info
        can_submit_explanation: response.validation.can_submit_explanation,
        has_existing_explanation: response.validation.has_existing_explanation,
        is_case_closed: response.validation.is_case_closed,
        // Existing explanation data (if any)
        existing_explanation_text: response.case.explanation_text,
        explanation_submitted_date: response.case.explanation_submitted_date,
        explanation_submitted_by: response.case.explanation_submitted_by,
        // Action items
        action_items: response.action_items || [],
      };
      
      setSelectedComplaint(caseDetails);
      
      // Pre-populate form if explanation exists
      if (response.case.explanation_text) {
        setFormData({
          explanation_text: response.case.explanation_text,
          corrective_actions: response.case.corrective_actions || "",
          contributing_factors: response.case.contributing_factors || "",
          action_items: response.action_items || [],
        });
      } else {
        setFormData({});
      }
      
      setDialogOpen(true);
      setLoading(false);
    } catch (err) {
      console.error("Error loading case details:", err);
      setError("فشل تحميل تفاصيل الشكوى. حاول مرة أخرى.");
      setLoading(false);
    }
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedComplaint(null);
    setFormData({});
    setValidationErrors([]);
    setValidationWarnings([]);
    setError(null);
  };

  // Save feedback
  const handleSave = async () => {
    if (!canSave) return;

    setSaving(true);
    setValidationErrors([]);
    setValidationWarnings([]);
    setError(null);

    try {
      // Step 1: Validate the explanation before submitting
      const validationPayload = {
        explanation_text: formData.explanation_text,
        action_items: (formData.action_items || []).map(item => ({
          title: item.title,
          description: item.description || null,
          due_date: item.due_date || null,
        })),
      };

      const validationResult = await ExplanationsAPI.validateExplanation(
        selectedComplaint.id,
        validationPayload
      );

      // Check validation result
      if (!validationResult.valid) {
        setValidationErrors(validationResult.errors || []);
        setValidationWarnings(validationResult.warnings || []);
        setError(`Validation failed: ${validationResult.errors.join(', ')}`);
        setSaving(false);
        return;
      }

      // Show warnings if any (but continue)
      if (validationResult.warnings && validationResult.warnings.length > 0) {
        setValidationWarnings(validationResult.warnings);
      }

      // Step 2: Submit the explanation
      // TODO: Get actual user_id from auth context
      const submissionPayload = {
        explanation_text: formData.explanation_text,
        action_items: (formData.action_items || []).map(item => ({
          title: item.title,
          description: item.description || null,
          due_date: item.due_date || null,
        })),
        user_id: 1, // TODO: Replace with actual user ID from authentication
      };

      const response = await ExplanationsAPI.submitExplanation(
        selectedComplaint.id,
        submissionPayload
      );

      // Success!
      const actionItemsCount = response.action_items_created?.length || 0;
      alert(
        `تم حفظ التوضيح بنجاح!\n` +
        `Case Status: ${response.case.case_status}\n` +
        `Explanation Status: ${response.case.explanation_status}` +
        (actionItemsCount > 0 ? `\n✓ تم إضافة ${actionItemsCount} إجراء إلى نظام المتابعة` : '')
      );

      // Update the selected complaint with new data
      setSelectedComplaint(prev => ({
        ...prev,
        case_status: response.case.case_status,
        explanation_status: response.case.explanation_status,
        has_existing_explanation: true,
        explanation_submitted_date: response.case.explanation_submitted_date,
        explanation_submitted_by: response.case.explanation_submitted_by,
      }));

      setSaving(false);
      
      // Refresh the cases list and statistics
      fetchOpenRecords();
      fetchStatistics();
    } catch (err) {
      console.error('Error saving explanation:', err);
      const errorMessage = err.response?.data?.detail || "فشل حفظ التوضيح. حاول مرة أخرى.";
      setError(errorMessage);
      setSaving(false);
    }
  };

  // Save and close feedback
  const handleSaveAndClose = async () => {
    if (!canSave) return;

    setSaving(true);
    setValidationErrors([]);
    setValidationWarnings([]);
    setError(null);

    try {
      // Step 1: Validate the explanation before submitting
      const validationPayload = {
        explanation_text: formData.explanation_text,
        action_items: (formData.action_items || []).map(item => ({
          title: item.title,
          description: item.description || null,
          due_date: item.due_date || null,
        })),
      };

      const validationResult = await ExplanationsAPI.validateExplanation(
        selectedComplaint.id,
        validationPayload
      );

      // Check validation result
      if (!validationResult.valid) {
        setValidationErrors(validationResult.errors || []);
        setValidationWarnings(validationResult.warnings || []);
        setError(`Validation failed: ${validationResult.errors.join(', ')}`);
        setSaving(false);
        return;
      }

      // Show warnings if any (but continue)
      if (validationResult.warnings && validationResult.warnings.length > 0) {
        setValidationWarnings(validationResult.warnings);
      }

      // Step 2: Submit the explanation
      // TODO: Get actual user_id from auth context
      const submissionPayload = {
        explanation_text: formData.explanation_text,
        action_items: (formData.action_items || []).map(item => ({
          title: item.title,
          description: item.description || null,
          due_date: item.due_date || null,
        })),
        user_id: 1, // TODO: Replace with actual user ID from authentication
      };

      const submitResponse = await ExplanationsAPI.submitExplanation(
        selectedComplaint.id,
        submissionPayload
      );

      const actionItemsCount = submitResponse.action_items_created?.length || 0;

      // Step 3: Check if case can be closed
      const closureCheckResponse = await ExplanationsAPI.checkCaseClosure(
        selectedComplaint.id,
        1 // TODO: Replace with actual user ID
      );

      // Prepare success message
      let successMessage = `تم حفظ التوضيح بنجاح!\n`;
      successMessage += `Case Status: ${closureCheckResponse.case_closed ? 'Closed' : submitResponse.case.case_status}\n`;
      successMessage += `Explanation Status: ${submitResponse.case.explanation_status}\n`;
      
      if (actionItemsCount > 0) {
        successMessage += `✓ تم إضافة ${actionItemsCount} إجراء إلى نظام المتابعة\n`;
      }

      if (closureCheckResponse.case_closed) {
        successMessage += `\n✅ Case automatically closed - all action items complete!`;
      } else if (closureCheckResponse.can_close) {
        successMessage += `\n✓ Case can be closed manually`;
      } else {
        const completion = closureCheckResponse.completion;
        successMessage += `\n⏳ Case remains open: ${completion.completed_action_items}/${completion.total_action_items} action items complete (${completion.percent_complete}%)`;
      }

      alert(successMessage);

      setSaving(false);
      handleCloseDialog();
      
      // Refresh the cases list and statistics
      fetchOpenRecords();
      fetchStatistics();
    } catch (err) {
      console.error('Error saving and closing explanation:', err);
      const errorMessage = err.response?.data?.detail || "فشل حفظ وإغلاق السجل. حاول مرة أخرى.";
      setError(errorMessage);
      setSaving(false);
    }
  };

  // Check if form can be saved
  const canSave = useMemo(() => {
    // Check if required fields are filled
    const hasRequiredFields = (
      formData.explanation_text &&
      formData.explanation_text.trim() !== "" &&
      formData.corrective_actions &&
      formData.corrective_actions.trim() !== ""
    );
    
    // Check API validation if complaint is loaded
    const canSubmitPerAPI = selectedComplaint?.can_submit_explanation !== false;
    const isCaseClosed = selectedComplaint?.is_case_closed === true;
    
    return hasRequiredFields && canSubmitPerAPI && !isCaseClosed;
  }, [formData, selectedComplaint]);

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

        {/* Statistics Display */}
        {statistics && !loadingStats && (
          <Box
            sx={{
              mb: 3,
              p: 2.5,
              borderRadius: "8px",
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
              border: "1px solid rgba(102, 126, 234, 0.2)",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography level="title-md" sx={{ fontWeight: 700, color: "#667eea" }}>
                📊 Explanation Statistics
              </Typography>
              <button
                onClick={() => {
                  fetchStatistics();
                  fetchOpenRecords();
                }}
                disabled={loadingStats || loading}
                style={{
                  padding: "6px 12px",
                  borderRadius: "4px",
                  border: "1px solid #667eea",
                  background: "white",
                  color: "#667eea",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: loadingStats || loading ? "not-allowed" : "pointer",
                  opacity: loadingStats || loading ? 0.6 : 1,
                }}
              >
                {loadingStats || loading ? "🔄 Refreshing..." : "🔄 Refresh"}
              </button>
            </Box>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center", p: 1.5, borderRadius: "6px", background: "#fff" }}>
                  <Typography level="h4" sx={{ color: "#ffa502", fontWeight: 700 }}>
                    {statistics.by_status?.Waiting || 0}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: "#666", mt: 0.5 }}>
                    Waiting for Explanation
                  </Typography>
                </Box>
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center", p: 1.5, borderRadius: "6px", background: "#fff" }}>
                  <Typography level="h4" sx={{ color: "#2ed573", fontWeight: 700 }}>
                    {statistics.by_status?.Responded || 0}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: "#666", mt: 0.5 }}>
                    Responded
                  </Typography>
                </Box>
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center", p: 1.5, borderRadius: "6px", background: "#fff" }}>
                  <Typography level="h4" sx={{ color: "#ff4757", fontWeight: 700 }}>
                    {statistics.overdue?.over_7_days || 0}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: "#666", mt: 0.5 }}>
                    Overdue (7+ days)
                  </Typography>
                </Box>
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center", p: 1.5, borderRadius: "6px", background: "#fff" }}>
                  <Typography level="h4" sx={{ color: "#9b59b6", fontWeight: 700 }}>
                    {statistics.total_requiring_explanation || 0}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: "#666", mt: 0.5 }}>
                    Total Requiring Explanation
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Modern Tab Switcher */}
        <ExplanationTypeSwitch activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab 1: Incident Explanations */}
        {activeTab === 0 && (
          <Box sx={{ mt: 3 }}>
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
          </Box>
        )}

        {/* Tab 2: Seasonal Explanations */}
        {activeTab === 1 && (
          <Box sx={{ mt: 3 }}>
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
          </Box>
        )}

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
                      {selectedComplaint.has_existing_explanation && (
                        <Typography level="body-xs" sx={{ color: "#2ed573", mt: 0.5, fontWeight: 600 }}>
                          ✓ Explanation already submitted on {new Date(selectedComplaint.explanation_submitted_date).toLocaleDateString()}
                        </Typography>
                      )}
                      {selectedComplaint.is_case_closed && (
                        <Typography level="body-xs" sx={{ color: "#ff4757", mt: 0.5, fontWeight: 600 }}>
                          ⚠️ This case is closed
                        </Typography>
                      )}
                    </Grid>
                    <Grid xs={12} md={6} sx={{ textAlign: { xs: "left", md: "right" } }}>
                      <Typography level="body-xs" sx={{ color: "#666" }}>
                        القسم: {selectedComplaint.qism}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: "#666" }}>
                        الشدة: {selectedComplaint.severity} | الحالة: {selectedComplaint.status === "OVERDUE" ? "متأخر" : "مفتوح"}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: "#666" }}>
                        Case Status: {selectedComplaint.case_status} | Explanation: {selectedComplaint.explanation_status}
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
                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                      <Grid xs={12}>
                        <Alert color="danger" variant="soft">
                          <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Validation Errors:
                          </Typography>
                          <ul style={{ margin: "4px 0", paddingLeft: "20px" }}>
                            {validationErrors.map((error, idx) => (
                              <li key={idx}>{error}</li>
                            ))}
                          </ul>
                        </Alert>
                      </Grid>
                    )}

                    {/* Validation Warnings */}
                    {validationWarnings.length > 0 && (
                      <Grid xs={12}>
                        <Alert color="warning" variant="soft">
                          <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Warnings:
                          </Typography>
                          <ul style={{ margin: "4px 0", paddingLeft: "20px" }}>
                            {validationWarnings.map((warning, idx) => (
                              <li key={idx}>{warning}</li>
                            ))}
                          </ul>
                        </Alert>
                      </Grid>
                    )}

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

                    {/* Use the same DepartmentFeedbackForm component for action items */}
                    <DepartmentFeedbackForm 
                      formData={seasonalFormData} 
                      setFormData={setSeasonalFormData}
                      hideExplanation={true}
                      hideFactors={true}
                      hideCorrectiveActions={true}
                    />

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
