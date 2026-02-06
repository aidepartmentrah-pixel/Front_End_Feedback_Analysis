// src/pages/DepartmentFeedbackPage.js
// This page handles TWO types of explanations:
// 1. Incident Explanations (Tab 1): Department explains what happened in a single incident
// 2. Seasonal Explanations (Tab 2): Department explains why performance exceeded thresholds
import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Alert, Modal, ModalDialog, ModalClose, DialogTitle, DialogContent, Divider, Grid, Card, Chip } from "@mui/joy";
import theme from '../theme';
import MainLayout from "../components/common/MainLayout";
import DepartmentFeedbackFilters from "../components/departmentFeedback/DepartmentFeedbackFilters";
import OpenRecordsTable from "../components/departmentFeedback/OpenRecordsTable";
import ComplaintSummary from "../components/departmentFeedback/ComplaintSummary";
import RedFlagFeedbackForm from "../components/departmentFeedback/RedFlagFeedbackForm";
import OrdinaryFeedbackForm from "../components/departmentFeedback/OrdinaryFeedbackForm";
import FeedbackActions from "../components/departmentFeedback/FeedbackActions";
import ExplanationTypeSwitch from "../components/departmentFeedback/ExplanationTypeSwitch";
import * as ExplanationsAPI from "../api/explanations";
// import axios from "axios";

const DepartmentFeedbackPage = () => {
  // Helper function to clean category objects for submission
  const cleanCategoryObject = (categoryObj) => {
    if (!categoryObj) return {};
    
    const cleaned = {};
    Object.keys(categoryObj).forEach(key => {
      if (key === 'other_text') {
        // Convert empty strings to null for other_text fields
        cleaned[key] = categoryObj[key] && categoryObj[key].trim() !== '' ? categoryObj[key] : null;
      } else {
        // Keep boolean values as is
        cleaned[key] = categoryObj[key];
      }
    });
    return cleaned;
  };

  // Helper function to map API response to UI data structure
  const mapApiCaseToUIRecord = (apiCase) => {
    const dateReceived = new Date(apiCase.feedback_received_date || apiCase.FeedbackRecievedDate || apiCase.date_submitted);
    const today = new Date();
    const daysSinceReceived = Math.floor((today - dateReceived) / (1000 * 60 * 60 * 24));
    const isDelayed = daysSinceReceived > delayThreshold;
    
    return {
      id: (apiCase.incident_request_case_id || apiCase.IncidentRequestCaseID || apiCase.case_id).toString(),
      complaintID: apiCase.ComplaintCaseNumber || apiCase.case_number || `CASE-${apiCase.incident_request_case_id || apiCase.IncidentRequestCaseID || apiCase.case_id}`,
      dateReceived: apiCase.feedback_received_date || apiCase.FeedbackRecievedDate || apiCase.date_submitted,
      patientName: apiCase.patient_name || apiCase.PatientName || "N/A",
      patientFullName: apiCase.patient_name || apiCase.PatientName || "N/A",
      targetDepartment: apiCase.IssuingOrgUnitName || apiCase.department_name || "N/A",
      severity: (apiCase.clinical_risk_type_name === "Red Flag" || apiCase.ClinicalRiskType === "Red Flag" || apiCase.case_type === "Red Flag") ? "HIGH" : 
                (apiCase.clinical_risk_type_name === "Never Event" || apiCase.ClinicalRiskType === "Never Event" || apiCase.case_type === "Never Event") ? "HIGH" : "MEDIUM",
      status: isDelayed ? "OVERDUE" : "OPEN",
      daysSinceReceived,
      isDelayed,
      qism: apiCase.IssuingOrgUnitName || apiCase.department_name || "N/A",
      issuingOrgUnitId: apiCase.issuing_org_unit_id || apiCase.IssuingOrgUnitID,
      problemDomain: apiCase.ProblemDomain || apiCase.problem_domain || "N/A",
      problemCategory: apiCase.ProblemCategory || apiCase.problem_category || "N/A",
      subCategory: apiCase.SubCategory || apiCase.sub_category || "N/A",
      classificationAr: apiCase.ClassificationAr || apiCase.classification_ar || "N/A",
      rawContent: apiCase.complaint_text || apiCase.ComplaintText || apiCase.raw_content || "N/A",
      immediateAction: apiCase.ImmediateAction || apiCase.immediate_action || "N/A",
      isRedFlag: (apiCase.clinical_risk_type_name === "Red Flag" || apiCase.ClinicalRiskType === "Red Flag" || apiCase.case_type === "Red Flag"),
      isNeverEvent: (apiCase.clinical_risk_type_name === "Never Event" || apiCase.ClinicalRiskType === "Never Event" || apiCase.case_type === "Never Event"),
      explanation_status: apiCase.explanation_status_name || apiCase.ExplanationStatusName || apiCase.explanation_status,
      case_status: apiCase.case_status_name || apiCase.CaseStatusName || apiCase.case_status,
      requires_explanation: apiCase.requires_explanation !== undefined ? apiCase.requires_explanation : apiCase.RequiresExplanation,
      explanation_type: apiCase.explanation_type || (apiCase.clinical_risk_type_id === 2 || apiCase.clinical_risk_type_id === 3 ? "red_flag" : "ordinary"),
      explanation_endpoint: apiCase.explanation_endpoint,
      clinical_risk_type_id: apiCase.clinical_risk_type_id || apiCase.ClinicalRiskTypeID,
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

  const [seasonalViolations, setSeasonalViolations] = useState([]);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [seasonalDialogOpen, setSeasonalDialogOpen] = useState(false);
  const [seasonalFormData, setSeasonalFormData] = useState({});
  const [loadingSeasonalReports, setLoadingSeasonalReports] = useState(false);

  // Fetch seasonal reports
  useEffect(() => {
    if (activeTab === 1) {
      fetchSeasonalReports();
    }
  }, [activeTab]);

  const fetchSeasonalReports = async () => {
    setLoadingSeasonalReports(true);
    try {
      const response = await ExplanationsAPI.getPendingSeasonalReports({
        non_compliant_only: true, // Only show reports needing explanation
      });
      
      console.log('[DEBUG] Seasonal reports raw response:', response);
      
      if (response.success && response.data) {
        // Map API response to UI structure with rich violation details
        const mappedReports = response.data.map(report => {
          const violatedRulesArray = Array.isArray(report.violated_rules) ? report.violated_rules : [];
          
          console.log('[DEBUG] Mapping report:', {
            seasonal_report_id: report.seasonal_report_id,
            org_unit_id: report.org_unit_id,
            org_unit_type: report.org_unit_type,
            org_unit_name_en: report.org_unit_name_en,
            org_unit_name_ar: report.org_unit_name_ar,
            season_name: report.season_name
          });
          
          return {
            id: report.seasonal_report_id.toString(),
            season: report.season_id,
            seasonLabel: report.season_name,
            seasonStartDate: report.season_start_date,
            seasonEndDate: report.season_end_date,
            department: report.org_unit_name_en || `Unit ${report.org_unit_id}`,
            departmentEn: report.org_unit_name_en,
            qism: report.org_unit_name_ar || `وحدة ${report.org_unit_id}`,
            orgUnitName: report.org_unit_name_en || "N/A",
            orgUnitId: report.org_unit_id,
            orgUnitType: report.org_unit_type,
            totalCases: report.total_cases || 0,
            lowSeverityCount: report.low_severity_count || 0,
            mediumSeverityCount: report.medium_severity_count || 0,
            highSeverityCount: report.high_severity_count || 0,
            clinicalDomainCount: report.clinical_domain_count || 0,
            managementDomainCount: report.management_domain_count || 0,
            relationalDomainCount: report.relational_domain_count || 0,
            status: report.has_explanation || report.explanation_status_id === 2 ? "SUBMITTED" : "PENDING",
            violatedRules: violatedRulesArray,
            isCompliant: report.is_compliant,
            evaluatedAt: report.evaluated_at,
          };
        });
        
        setSeasonalViolations(mappedReports);
      }
      
      setLoadingSeasonalReports(false);
    } catch (err) {
      console.error('[ERROR] Failed to fetch seasonal reports:', err);
      setLoadingSeasonalReports(false);
    }
  };

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
      
      if (!response.success) {
        console.error('Statistics fetch failed:', response.error);
        return;
      }
      
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
      
      console.log('[DEBUG] Full response:', response);
      console.log('[DEBUG] Response.data type:', typeof response.data);
      console.log('[DEBUG] Is array?', Array.isArray(response.data));
      
      if (!response.success) {
        setError(response.error || 'Failed to load records');
        setOpenRecords([]);
        setLoading(false);
        return;
      }
      
      if (!Array.isArray(response.data)) {
        setError('Invalid response format from server');
        setOpenRecords([]);
        setLoading(false);
        return;
      }
      
      // Map API response to UI data structure
      const mappedRecords = response.data.map(mapApiCaseToUIRecord);
      
      setOpenRecords(mappedRecords);
      
      // Update statistics if included in response
      if (response.statistics) {
        setStatistics(response.statistics);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('[ERROR] Failed to fetch records:', err);
      setError(err.message || "فشل تحميل السجلات. حاول مرة أخرى.");
      setOpenRecords([]);
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
      filtered = filtered.filter(r => r.issuingOrgUnitId && r.issuingOrgUnitId.toString() === filters.department);
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
    console.log('[DEBUG] handleOpenDialog called with record:', record);
    console.log('[DEBUG] record.id:', record.id);
    console.log('[DEBUG] explanation_type:', record.explanation_type);
    console.log('[DEBUG] explanation_status:', record.explanation_status);
    
    // Open modal immediately (don't wait for API)
    setSelectedComplaint(record);
    setFormData({});
    setDialogOpen(true);
    setError(null);
    
    // Determine if the case type is Red Flag/Never Event
    const isRedFlagOrNeverEvent = record.explanation_type === 'red_flag' || 
                                   record.explanation_type === 'never_event' || 
                                   record.isRedFlag || 
                                   record.isNeverEvent;
    
    console.log('[DEBUG] ========================================');
    console.log('[DEBUG] OPENING CASE FOR EXPLANATION');
    console.log('[DEBUG] Case ID:', record.id);
    console.log('[DEBUG] Case Number:', record.complaintID);
    console.log('[DEBUG] Explanation Type:', record.explanation_type);
    console.log('[DEBUG] Clinical Risk Type ID:', record.clinical_risk_type_id);
    console.log('[DEBUG] Is Red Flag:', record.isRedFlag);
    console.log('[DEBUG] Is Never Event:', record.isNeverEvent);
    console.log('[DEBUG] Explanation Status:', record.explanation_status);
    console.log('[DEBUG] Case Status:', record.case_status);
    console.log('[DEBUG] Determined as Red Flag/Never Event:', isRedFlagOrNeverEvent);
    console.log('[DEBUG] ========================================');
    
    // Check ExplanationStatus:
    // "Waiting" (or ID=1) → No feedback submitted yet, show empty form
    // "Responded" (or ID=2) → Feedback exists, fetch it
    const explanationStatus = record.explanation_status?.toLowerCase();
    const shouldFetchExisting = explanationStatus === 'responded' || 
                                explanationStatus === 'responded' ||
                                record.explanation_status === 'Responded';
    
    if (!shouldFetchExisting) {
      // No feedback submitted yet - initialize empty form
      console.log('[DEBUG] ExplanationStatus is "Waiting" - showing empty form');
      
      if (isRedFlagOrNeverEvent) {
        setFormData({
          explanation_text: "",
          causes_staff: {
            training: false,
            incentives: false,
            competency: false,
            understaffed: false,
            non_compliance: false,
            no_coordination: false,
            other: false,
            other_text: ""
          },
          causes_process: {
            not_comprehensive: false,
            unclear: false,
            missing_protocol: false,
            other: false,
            other_text: ""
          },
          causes_equipment: {
            not_available: false,
            system_incomplete: false,
            hard_to_apply: false,
            other: false,
            other_text: ""
          },
          causes_environment: {
            place_nature: false,
            surroundings: false,
            work_conditions: false,
            other: false,
            other_text: ""
          },
          preventive_actions: {
            monthly_meetings: false,
            training_programs: false,
            increase_staff: false,
            mm_committee_actions: false,
            other: false,
            other_text: ""
          },
          action_items: []
        });
      } else {
        setFormData({
          explanation_text: "",
          action_items: []
        });
      }
      
      setLoading(false);
      return;
    }
    
    // Feedback exists - fetch it from API
    console.log('[DEBUG] ExplanationStatus is "Responded" - fetching existing feedback');
    setLoading(true);
    
    try {
      let response;
      
      if (isRedFlagOrNeverEvent) {
        // Red Flag/Never Event: Load comprehensive feedback
        response = await ExplanationsAPI.getRedFlagFeedback(record.id);
        console.log('[DEBUG] Red Flag feedback response:', response);
        
        if (response.feedback) {
          // Pre-populate form with existing feedback
          setFormData({
            explanation_text: response.feedback.DepartmentExplanationText || "",
            causes_staff: {
              training: response.feedback.Cause_Staff_Training === 1,
              incentives: response.feedback.Cause_Staff_Incentives === 1,
              competency: response.feedback.Cause_Staff_Competency === 1,
              understaffed: response.feedback.Cause_Staff_Understaffed === 1,
              non_compliance: response.feedback.Cause_Staff_NonCompliance === 1,
              no_coordination: response.feedback.Cause_Staff_NoCoordination === 1,
              other: response.feedback.Cause_Staff_Other === 1,
              other_text: response.feedback.Cause_Staff_OtherText || null,
            },
            causes_process: {
              not_comprehensive: response.feedback.Cause_Process_NotComprehensive === 1,
              unclear: response.feedback.Cause_Process_Unclear === 1,
              missing_protocol: response.feedback.Cause_Process_MissingProtocol === 1,
              other: response.feedback.Cause_Process_Other === 1,
              other_text: response.feedback.Cause_Process_OtherText || null,
            },
            causes_equipment: {
              not_available: response.feedback.Cause_Equipment_NotAvailable === 1,
              system_incomplete: response.feedback.Cause_Equipment_SystemIncomplete === 1,
              hard_to_apply: response.feedback.Cause_Equipment_HardToApply === 1,
              other: response.feedback.Cause_Equipment_Other === 1,
              other_text: response.feedback.Cause_Equipment_OtherText || null,
            },
            causes_environment: {
              place_nature: response.feedback.Cause_Environment_PlaceNature === 1,
              surroundings: response.feedback.Cause_Environment_Surroundings === 1,
              work_conditions: response.feedback.Cause_Environment_WorkConditions === 1,
              other: response.feedback.Cause_Environment_Other === 1,
              other_text: response.feedback.Cause_Environment_OtherText || null,
            },
            preventive_actions: {
              monthly_meetings: response.feedback.Preventive_MonthlyMeetings === 1,
              training_programs: response.feedback.Preventive_TrainingPrograms === 1,
              increase_staff: response.feedback.Preventive_IncreaseStaff === 1,
              mm_committee_actions: response.feedback.Preventive_MMCommitteeActions === 1,
              other: response.feedback.Preventive_Other === 1,
              other_text: response.feedback.Preventive_OtherText || null,
            },
          });
        } else {
          // No feedback data in response - initialize empty form with all fields set to false
          setFormData({
            explanation_text: "",
            causes_staff: {
              training: false,
              incentives: false,
              competency: false,
              understaffed: false,
              non_compliance: false,
              no_coordination: false,
              other: false,
              other_text: ""
            },
            causes_process: {
              not_comprehensive: false,
              unclear: false,
              missing_protocol: false,
              other: false,
              other_text: ""
            },
            causes_equipment: {
              not_available: false,
              system_incomplete: false,
              hard_to_apply: false,
              other: false,
              other_text: ""
            },
            causes_environment: {
              place_nature: false,
              surroundings: false,
              work_conditions: false,
              other: false,
              other_text: ""
            },
            preventive_actions: {
              monthly_meetings: false,
              training_programs: false,
              increase_staff: false,
              mm_committee_actions: false,
              other: false,
              other_text: ""
            },
            action_items: []
          });
        }
      } else {
        // Ordinary case: Load simple explanation
        response = await ExplanationsAPI.getOrdinaryExplanation(record.id);
        console.log('[DEBUG] Ordinary explanation response:', response);
        
        setFormData({
          explanation_text: response.data?.taken_action || response.taken_action || "",
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error("[ERROR] Failed to load case details:", err);
      
      // Handle 404 gracefully (feedback doesn't exist yet)
      if (err.response?.status === 404) {
        console.log('[DEBUG] 404 - No feedback exists yet, showing empty form');
        setError(null); // Clear error - this is expected
      } else {
        setError("تعذر تحميل البيانات. يمكنك المتابعة بإدخال توضيح جديد.");
      }
      
      // Initialize empty form based on type
      if (isRedFlagOrNeverEvent) {
        setFormData({
          explanation_text: "",
          causes_staff: {
            training: false,
            incentives: false,
            competency: false,
            understaffed: false,
            non_compliance: false,
            no_coordination: false,
            other: false,
            other_text: ""
          },
          causes_process: {
            not_comprehensive: false,
            unclear: false,
            missing_protocol: false,
            other: false,
            other_text: ""
          },
          causes_equipment: {
            not_available: false,
            system_incomplete: false,
            hard_to_apply: false,
            other: false,
            other_text: ""
          },
          causes_environment: {
            place_nature: false,
            surroundings: false,
            work_conditions: false,
            other: false,
            other_text: ""
          },
          preventive_actions: {
            monthly_meetings: false,
            training_programs: false,
            increase_staff: false,
            mm_committee_actions: false,
            other: false,
            other_text: ""
          },
          action_items: []
        });
      } else {
        setFormData({
          explanation_text: "",
          action_items: []
        });
      }
      
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
    if (!canSave) {
      alert('⚠️ Cannot save: Form validation failed. Please check all required fields.');
      return;
    }

    setSaving(true);
    setValidationErrors([]);
    setValidationWarnings([]);
    setError(null);

    try {
      let response;
      
      // Submit to appropriate endpoint based on explanation type
      if (selectedComplaint.explanation_type === 'red_flag' || selectedComplaint.explanation_type === 'never_event' || selectedComplaint.isRedFlag || selectedComplaint.isNeverEvent) {
        // Pre-submission validation
        console.log('[DEBUG] ========================================');
        console.log('[DEBUG] PRE-SUBMISSION VALIDATION');
        console.log('[DEBUG] Case ID:', selectedComplaint.id);
        console.log('[DEBUG] Explanation Type:', selectedComplaint.explanation_type);
        console.log('[DEBUG] Clinical Risk Type ID:', selectedComplaint.clinical_risk_type_id);
        console.log('[DEBUG] Is Red Flag:', selectedComplaint.isRedFlag);
        console.log('[DEBUG] Is Never Event:', selectedComplaint.isNeverEvent);
        console.log('[DEBUG] Explanation Length:', formData.explanation_text?.length, 'chars (min: 50)');
        console.log('[DEBUG] Action Items Count:', formData.action_items?.length, '(min: 1)');
        console.log('[DEBUG] ========================================');
        
        // Red Flag/Never Event submission
        const payload = {
          explanation_text: formData.explanation_text,
          causes_staff: cleanCategoryObject(formData.causes_staff),
          causes_process: cleanCategoryObject(formData.causes_process),
          causes_equipment: cleanCategoryObject(formData.causes_equipment),
          causes_environment: cleanCategoryObject(formData.causes_environment),
          preventive_actions: cleanCategoryObject(formData.preventive_actions),
          action_items: formData.action_items || [],
          user_id: 1, // TODO: Replace with actual user ID from authentication
        };
        
        console.log('[DEBUG] ========================================');
        console.log('[DEBUG] RED FLAG SUBMISSION PAYLOAD:');
        console.log('[DEBUG] Case ID:', selectedComplaint.id);
        console.log('[DEBUG] Explanation Length:', payload.explanation_text?.length, 'chars');
        console.log('[DEBUG] Payload:', JSON.stringify(payload, null, 2));
        console.log('[DEBUG] ========================================');
        
        response = await ExplanationsAPI.submitRedFlagFeedback(selectedComplaint.id, payload);
        
        const actionItemsInfo = response.action_items_created 
          ? `\n\nAction Items Created: ${response.action_items_count}\n${response.action_items_created.map(a => `- ${a.title}`).join('\n')}`
          : '';
        
        alert(
          `تم حفظ التوضيح بنجاح!\n` +
          `${response.message}\n` +
          `FSM Transition: ${response.fsm_transition || 'N/A'}${actionItemsInfo}`
        );
      } else {
        // Ordinary case submission
        const payload = {
          explanation_text: formData.explanation_text,
          action_items: formData.action_items || [],
          user_id: 1, // TODO: Replace with actual user ID from authentication
        };
        
        console.log('[DEBUG] Submitting Ordinary explanation:', payload);
        response = await ExplanationsAPI.submitOrdinaryExplanation(selectedComplaint.id, payload);
        
        const actionItemsInfo = response.action_items_created 
          ? `\n\nAction Items Created: ${response.action_items_count}\n${response.action_items_created.map(a => `- ${a.title}`).join('\n')}`
          : '';
        
        alert(
          `تم حفظ التوضيح بنجاح!\n` +
          `${response.message}\n` +
          `FSM Transition: ${response.fsm_transition || 'N/A'}${actionItemsInfo}`
        );
      }

      setSaving(false);
      handleCloseDialog();
      
      // Refresh the cases list and statistics
      fetchOpenRecords();
      fetchStatistics();
    } catch (err) {
      console.error('[ERROR] ========================================');
      console.error('[ERROR] Failed to save explanation:', err);
      console.error('[ERROR] Response Status:', err.response?.status);
      console.error('[ERROR] Response Data:', err.response?.data);
      console.error('[ERROR] Full Error:', JSON.stringify(err.response?.data, null, 2));
      console.error('[ERROR] ========================================');
      
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "فشل حفظ التوضيح. حاول مرة أخرى.";
      setError(errorMessage);
      
      if (err.response?.data?.error) {
        setValidationErrors([`Error: ${err.response.data.error}${err.response.data.hint ? ' - ' + err.response.data.hint : ''}`]);
      }
      
      if (err.response?.data?.detail) {
        console.error('[ERROR] Detail:', err.response.data.detail);
        setValidationErrors(prev => [...prev, `Detail: ${JSON.stringify(err.response.data.detail)}`]);
      }
      
      setSaving(false);
    }
  };

  // Check if form can be saved
  const canSave = useMemo(() => {
    // Check minimum character requirements based on type
    const isRedFlagOrNeverEvent = selectedComplaint?.explanation_type === 'red_flag' || 
                                   selectedComplaint?.explanation_type === 'never_event' || 
                                   selectedComplaint?.isRedFlag || 
                                   selectedComplaint?.isNeverEvent;
    
    const hasValidExplanation = isRedFlagOrNeverEvent
      ? formData.explanation_text && formData.explanation_text.trim().length >= 50
      : formData.explanation_text && formData.explanation_text.trim().length >= 20;
    
    // For Red Flag/Never Event: At least 1 action item is REQUIRED
    if (isRedFlagOrNeverEvent) {
      const hasActionItems = formData.action_items && formData.action_items.length > 0;
      if (!hasActionItems) return false;
      
      // Validate all action items have title and due date
      const allItemsValid = formData.action_items.every(item => 
        item.action_title?.trim() && item.due_date
      );
      if (!allItemsValid) return false;
    }
    
    // For Ordinary: Action items are optional, but if present, must be valid
    if (formData.action_items && formData.action_items.length > 0) {
      const allItemsValid = formData.action_items.every(item => 
        item.action_title?.trim() && item.due_date
      );
      if (!allItemsValid) return false;
    }
    
    return hasValidExplanation;
  }, [formData, selectedComplaint]);

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography
          level="h3"
          sx={{
            mb: 1,
            fontWeight: 900,
            background: theme.gradients.primary,
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
              <Typography level="title-md" sx={{ fontWeight: 700, color: theme.colors.primary }}>
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
                  border: `1px solid ${theme.colors.primary}`,
                  background: "white",
                  color: theme.colors.primary,
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
            
            {loadingSeasonalReports ? (
              <Box sx={{ p: 5, textAlign: "center", border: "1px solid #e0e0e0", borderRadius: "8px" }}>
                <Typography level="body-sm" sx={{ color: "#666" }}>
                  جاري تحميل التقارير الفصلية...
                </Typography>
              </Box>
            ) : seasonalViolations.length === 0 ? (
              <Box sx={{ p: 5, textAlign: "center", border: "1px solid #e0e0e0", borderRadius: "8px" }}>
                <Typography level="h6" sx={{ color: "#2ed573", mb: 1 }}>
                  ✅ جميع التقارير الفصلية متوافقة
                </Typography>
                <Typography level="body-sm" sx={{ color: "#666" }}>
                  لا توجد انتهاكات للقواعد المحددة
                </Typography>
              </Box>
            ) : (
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
                    background: theme.gradients.primary,
                    color: "white",
                  }}
                >
                  <Typography level="h6" sx={{ fontWeight: 700 }}>
                    🚨 Seasonal Threshold Violations
                  </Typography>
                  <Typography level="body-xs" sx={{ opacity: 0.9, mt: 0.5 }}>
                    Reports requiring explanation for exceeding performance thresholds
                  </Typography>
                </Box>
                
                <Box sx={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e0e0e0" }}>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, fontSize: "13px" }}>Season</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, fontSize: "13px" }}>Org Unit</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: 600, fontSize: "13px" }}>Cases</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, fontSize: "13px" }}>Violated Rules</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: 600, fontSize: "13px" }}>Status</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: 600, fontSize: "13px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seasonalViolations.map((violation) => (
                        <tr key={violation.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                          <td style={{ padding: "12px" }}>
                            <Typography level="body-sm" sx={{ fontWeight: 700, color: theme.colors.primary }}>
                              {violation.seasonLabel}
                            </Typography>
                            <Typography level="body-xs" sx={{ color: "#999" }}>
                              {new Date(violation.seasonStartDate).toLocaleDateString()} - {new Date(violation.seasonEndDate).toLocaleDateString()}
                            </Typography>
                          </td>
                          <td style={{ padding: "12px" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              {/* Unit Type Badge */}
                              <Chip
                                size="sm"
                                sx={{
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  px: 1,
                                  background: violation.orgUnitType === 1 ? "#e3f2fd" : violation.orgUnitType === 2 ? "#f3e5f5" : "#e8f5e9",
                                  color: violation.orgUnitType === 1 ? "#1976d2" : violation.orgUnitType === 2 ? "#7b1fa2" : "#388e3c",
                                  border: "none",
                                }}
                              >
                                {violation.orgUnitType === 0 ? "Hospital" : violation.orgUnitType === 1 ? "Admin" : violation.orgUnitType === 2 ? "Dept" : "Section"}
                              </Chip>
                            </Box>
                            <Typography level="body-sm" sx={{ fontWeight: 600, mt: 0.5 }}>
                              {violation.department}
                            </Typography>
                            <Typography level="body-xs" sx={{ color: "#999", dir: "rtl" }}>
                              {violation.qism}
                            </Typography>
                          </td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <Typography level="body-sm" sx={{ fontWeight: 700 }}>
                              {violation.totalCases}
                            </Typography>
                            <Typography level="body-xs" sx={{ color: "#999" }}>
                              L:{violation.lowSeverityCount} M:{violation.mediumSeverityCount} H:{violation.highSeverityCount}
                            </Typography>
                          </td>
                          <td style={{ padding: "12px" }}>
                            {Array.isArray(violation.violatedRules) && violation.violatedRules.length > 0 ? (
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                {violation.violatedRules.map((rule, idx) => (
                                  <Box key={idx} sx={{ fontSize: "12px" }}>
                                    <Typography level="body-xs" sx={{ fontWeight: 600, color: "#ff4757", dir: "rtl" }}>
                                      {rule.rule_name_ar || rule.rule_name_en}
                                    </Typography>
                                    <Typography level="body-xs" sx={{ color: "#666" }}>
                                      Actual: <strong>{rule.actual}{rule.actual_unit}</strong> | Limit: <strong>{rule.threshold}{rule.threshold_unit}</strong>
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            ) : (
                              <Typography level="body-xs" sx={{ color: "#999" }}>No violations</Typography>
                            )}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <Chip
                              sx={{
                                background: violation.status === "SUBMITTED" ? "#2ed573" : "#ffa502",
                                color: "white",
                                fontWeight: 600,
                                fontSize: "11px",
                                px: 1.5,
                              }}
                            >
                              {violation.status === "SUBMITTED" ? "✅ Done" : "⏳ Pending"}
                            </Chip>
                          </td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <button
                              onClick={() => {
                                setSelectedViolation(violation);
                                setSeasonalFormData({
                                  explanation_text: "",
                                  action_items: []
                                });
                                setSeasonalDialogOpen(true);
                              }}
                              disabled={violation.status === "SUBMITTED"}
                              style={{
                                padding: "6px 14px",
                                borderRadius: "4px",
                                border: "none",
                                background: violation.status === "SUBMITTED" ? "#ccc" : theme.colors.primary,
                                color: "white",
                                fontWeight: 600,
                                fontSize: "12px",
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
            )}
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
                      {selectedComplaint.isNeverEvent || selectedComplaint.explanation_type === 'never_event' ? (
                        <Typography level="h4" sx={{ fontWeight: 700, color: "#6a1b9a", mb: 0.5 }}>
                          🏴 ملء توضيح Never Event
                        </Typography>
                      ) : selectedComplaint.isRedFlag || selectedComplaint.explanation_type === 'red_flag' ? (
                        <Typography level="h4" sx={{ fontWeight: 700, color: "#d32f2f", mb: 0.5 }}>
                          🚩 ملء توضيح Red Flag
                        </Typography>
                      ) : (
                        <Typography level="h4" sx={{ fontWeight: 700, color: theme.colors.primary, mb: 0.5 }}>
                          ملء توضيح الحالة (Fill Incident Explanation)
                        </Typography>
                      )}
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
                      {/* Render appropriate form based on explanation type */}
                      {selectedComplaint.explanation_type === 'red_flag' || selectedComplaint.explanation_type === 'never_event' || selectedComplaint.isRedFlag || selectedComplaint.isNeverEvent ? (
                        <>
                          {selectedComplaint.isNeverEvent || selectedComplaint.explanation_type === 'never_event' ? (
                            <Alert 
                              sx={{ 
                                mb: 2,
                                background: "linear-gradient(135deg, rgba(106, 27, 154, 0.1) 0%, rgba(74, 20, 140, 0.1) 100%)",
                                border: "1px solid #6a1b9a",
                                color: "#4a148c"
                              }}
                            >
                              <Typography level="body-sm" sx={{ fontWeight: 600, dir: "rtl", color: "#4a148c" }}>
                                🏴 نموذج Never Event - حدث لا يجب أن يحدث أبداً
                              </Typography>
                              <Typography level="body-xs" sx={{ color: "#6a1b9a", mt: 0.5, dir: "rtl" }}>
                                يتطلب تحليل جذري شامل لجميع الأسباب والإجراءات الوقائية المتخذة
                              </Typography>
                            </Alert>
                          ) : (
                            <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
                              <Typography level="body-sm" sx={{ fontWeight: 600, dir: "rtl" }}>
                                🚩 نموذج Red Flag - يتطلب تحليل شامل
                              </Typography>
                              <Typography level="body-xs" sx={{ color: "#666", mt: 0.5, dir: "rtl" }}>
                                يرجى ملء جميع الأسباب والإجراءات الوقائية ذات الصلة
                              </Typography>
                            </Alert>
                          )}
                          <RedFlagFeedbackForm formData={formData} setFormData={setFormData} />
                        </>
                      ) : (
                        <>
                          <Alert color="primary" variant="soft" sx={{ mb: 2 }}>
                            <Typography level="body-sm" sx={{ fontWeight: 600, dir: "rtl" }}>
                              📝 نموذج الشكوى العادية - توضيح مبسط
                            </Typography>
                            <Typography level="body-xs" sx={{ color: "#666", mt: 0.5, dir: "rtl" }}>
                              يتطلب فقط توضيح الإجراء المتخذ (20 حرف على الأقل)
                            </Typography>
                          </Alert>
                          <OrdinaryFeedbackForm formData={formData} setFormData={setFormData} />
                        </>
                      )}
                    </Grid>
                  </Grid>
                </DialogContent>

                <Divider />

                <Box sx={{ p: 2.5 }}>
                  <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                    <button
                      onClick={handleCloseDialog}
                      disabled={saving}
                      style={{
                        padding: "10px 24px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        background: "white",
                        color: "#333",
                        fontWeight: 600,
                        cursor: saving ? "not-allowed" : "pointer",
                        opacity: saving ? 0.6 : 1,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!canSave || saving}
                      style={{
                        padding: "10px 24px",
                        borderRadius: "6px",
                        border: "none",
                        background: (!canSave || saving) ? "#ccc" : theme.gradients.primary,
                        color: "white",
                        fontWeight: 600,
                        cursor: (!canSave || saving) ? "not-allowed" : "pointer",
                      }}
                    >
                      {saving ? "جاري الحفظ..." : "حفظ التوضيح (Save)"}
                    </button>
                  </Box>
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
                  <Typography level="h4" sx={{ fontWeight: 700, color: theme.colors.primary, mb: 0.5 }}>
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
                      background: "linear-gradient(135deg, rgba(255, 71, 87, 0.1) 0%, rgba(255, 165, 2, 0.1) 100%)",
                      border: "1px solid rgba(255, 71, 87, 0.3)",
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid xs={12}>
                        <Typography level="h6" sx={{ fontWeight: 700, color: "#ff4757", mb: 2 }}>
                          📊 {selectedViolation.seasonLabel} - Performance Report
                        </Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography level="body-xs" sx={{ color: "#666", mb: 0.5 }}>Organization Unit</Typography>
                        <Typography level="body-md" sx={{ fontWeight: 700 }}>{selectedViolation.department}</Typography>
                        <Typography level="body-xs" sx={{ color: "#999", dir: "rtl", mt: 0.5 }}>{selectedViolation.qism}</Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography level="body-xs" sx={{ color: "#666", mb: 0.5 }}>Period</Typography>
                        <Typography level="body-md" sx={{ fontWeight: 700 }}>
                          {new Date(selectedViolation.seasonStartDate).toLocaleDateString()} - {new Date(selectedViolation.seasonEndDate).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography level="body-xs" sx={{ color: "#666", mb: 0.5 }}>Total Cases Processed</Typography>
                        <Typography level="body-md" sx={{ fontWeight: 700 }}>{selectedViolation.totalCases} cases</Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography level="body-xs" sx={{ color: "#666", mb: 0.5 }}>Rules Violated</Typography>
                        <Typography level="body-md" sx={{ fontWeight: 700, color: "#ff4757" }}>
                          {selectedViolation.violatedRules.length} rules
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    {/* Violated Rules Detail */}
                    {Array.isArray(selectedViolation.violatedRules) && selectedViolation.violatedRules.length > 0 && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(255, 71, 87, 0.2)" }}>
                        <Typography level="body-sm" sx={{ fontWeight: 700, color: "#ff4757", mb: 1, dir: "rtl" }}>
                          القواعد المنتهكة:
                        </Typography>
                        {selectedViolation.violatedRules.map((rule, idx) => (
                          <Box key={idx} sx={{ mb: 1, p: 1.5, background: "white", borderRadius: "6px", border: "1px solid #ffe0e0" }}>
                            <Typography level="body-sm" sx={{ fontWeight: 700, dir: "rtl" }}>
                              {rule.rule_name_ar || rule.rule_name_en}
                            </Typography>
                            <Typography level="body-xs" sx={{ color: "#666", mt: 0.5 }}>
                              Actual: <strong style={{ color: "#ff4757" }}>{rule.actual}{rule.actual_unit}</strong> | 
                              Limit: <strong style={{ color: "#2ed573" }}>{rule.threshold}{rule.threshold_unit}</strong> | 
                              Exceeded by: <strong style={{ color: "#ff4757" }}>+{(parseFloat(rule.actual) - parseFloat(rule.threshold)).toFixed(1)}{rule.actual_unit}</strong>
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* Seasonal Explanation Form */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <Box>
                      <Typography level="title-md" sx={{ mb: 1, fontWeight: 700, dir: "rtl" }}>
                        التوضيح الفصلي (Seasonal Explanation) <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <Typography level="body-sm" sx={{ mb: 1.5, color: "#666", dir: "rtl" }}>
                        ما هي الأسباب التي أدت إلى انتهاك القواعد في هذا الفصل؟ (50 حرف على الأقل)
                      </Typography>
                      <textarea
                        value={seasonalFormData.explanation_text || ""}
                        onChange={(e) => setSeasonalFormData({ ...seasonalFormData, explanation_text: e.target.value })}
                        placeholder="اشرح الأسباب والعوامل التي ساهمت في عدم الامتثال للقواعد..."
                        style={{
                          width: "100%",
                          minHeight: "150px",
                          padding: "12px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                          fontFamily: "inherit",
                          fontSize: "14px",
                          resize: "vertical",
                          direction: "rtl",
                        }}
                      />
                      <Typography level="body-xs" sx={{ mt: 0.5, color: "#999" }}>
                        {seasonalFormData.explanation_text?.length || 0} / 5000 characters (minimum 50)
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "6px",
                        background: "#f0f4ff",
                        border: `1px solid ${theme.colors.primary}`,
                      }}
                    >
                      <Typography level="body-sm" sx={{ fontWeight: 600, color: theme.colors.primary, dir: "rtl" }}>
                        ℹ️ القواعد المنتهكة:
                      </Typography>
                      <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                        {Array.isArray(selectedViolation.violatedRules) && selectedViolation.violatedRules.length > 0 ? (
                          selectedViolation.violatedRules.map((rule, idx) => (
                            <Typography key={idx} level="body-xs" sx={{ color: "#666", dir: "rtl" }}>
                              • {rule.rule_name_ar || rule.rule_name_en} (المسموح: {rule.threshold}{rule.threshold_unit}, الفعلي: {rule.actual}{rule.actual_unit})
                            </Typography>
                          ))
                        ) : (
                          <Typography level="body-xs" sx={{ color: "#666", dir: "rtl" }}>
                            {selectedViolation.violatedRules?.length || 0} قاعدة منتهكة
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Action Items (REQUIRED - Min 1) */}
                    <Box sx={{ p: 2.5, borderRadius: "8px", background: "#fff3e0", border: "2px solid #ff9800" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography level="title-md" sx={{ fontWeight: 700, color: "#e65100", dir: "rtl" }}>
                          📋 خطة العمل (Action Items) <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <button
                          onClick={() => {
                            const newActionItems = [...(seasonalFormData.action_items || []), { action_title: "", action_description: "", due_date: "" }];
                            setSeasonalFormData({ ...seasonalFormData, action_items: newActionItems });
                          }}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#ff9800",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          + Add Action Item
                        </button>
                      </Box>
                      <Typography level="body-sm" sx={{ mb: 2, color: "#666", dir: "rtl" }}>
                        يجب إضافة خطة عمل واحدة على الأقل مع موعد محدد للتنفيذ (Required: Minimum 1 action item)
                      </Typography>

                      {(!seasonalFormData.action_items || seasonalFormData.action_items.length === 0) && (
                        <Box sx={{ p: 2, background: "#ffebee", borderRadius: "6px", border: "1px dashed #f44336", textAlign: "center" }}>
                          <Typography level="body-sm" sx={{ color: "#d32f2f", fontWeight: 600 }}>
                            ⚠️ يجب إضافة خطة عمل واحدة على الأقل
                          </Typography>
                        </Box>
                      )}

                      {seasonalFormData.action_items && seasonalFormData.action_items.map((item, index) => (
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
                            <button
                              onClick={() => {
                                const newActionItems = seasonalFormData.action_items.filter((_, i) => i !== index);
                                setSeasonalFormData({ ...seasonalFormData, action_items: newActionItems });
                              }}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "1px solid #f44336",
                                background: "white",
                                color: "#f44336",
                                fontWeight: 600,
                                fontSize: "11px",
                                cursor: "pointer",
                              }}
                            >
                              Delete
                            </button>
                          </Box>

                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            <Box>
                              <Typography level="body-xs" sx={{ mb: 0.5, fontWeight: 600 }}>Action Title *</Typography>
                              <input
                                type="text"
                                value={item.action_title || ""}
                                onChange={(e) => {
                                  const newActionItems = [...seasonalFormData.action_items];
                                  newActionItems[index].action_title = e.target.value;
                                  setSeasonalFormData({ ...seasonalFormData, action_items: newActionItems });
                                }}
                                placeholder="e.g., Implement monthly review meetings"
                                style={{
                                  width: "100%",
                                  padding: "8px",
                                  borderRadius: "4px",
                                  border: "1px solid #ccc",
                                  fontFamily: "inherit",
                                  fontSize: "13px",
                                }}
                              />
                            </Box>

                            <Box>
                              <Typography level="body-xs" sx={{ mb: 0.5, fontWeight: 600 }}>Description</Typography>
                              <textarea
                                value={item.action_description || ""}
                                onChange={(e) => {
                                  const newActionItems = [...seasonalFormData.action_items];
                                  newActionItems[index].action_description = e.target.value;
                                  setSeasonalFormData({ ...seasonalFormData, action_items: newActionItems });
                                }}
                                placeholder="Detailed description of the action..."
                                style={{
                                  width: "100%",
                                  minHeight: "60px",
                                  padding: "8px",
                                  borderRadius: "4px",
                                  border: "1px solid #ccc",
                                  fontFamily: "inherit",
                                  fontSize: "13px",
                                  resize: "vertical",
                                }}
                              />
                            </Box>

                            <Box>
                              <Typography level="body-xs" sx={{ mb: 0.5, fontWeight: 600 }}>Due Date *</Typography>
                              <input
                                type="date"
                                value={item.due_date || ""}
                                onChange={(e) => {
                                  const newActionItems = [...seasonalFormData.action_items];
                                  newActionItems[index].due_date = e.target.value;
                                  setSeasonalFormData({ ...seasonalFormData, action_items: newActionItems });
                                }}
                                style={{
                                  width: "100%",
                                  padding: "8px",
                                  borderRadius: "4px",
                                  border: "1px solid #ccc",
                                  fontFamily: "inherit",
                                  fontSize: "13px",
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
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
                      // Validation
                      if (!seasonalFormData.explanation_text || seasonalFormData.explanation_text.trim().length < 50) {
                        alert("⚠️ يرجى إدخال توضيح لا يقل عن 50 حرفًا\nPlease enter an explanation of at least 50 characters");
                        return;
                      }
                      
                      if (!seasonalFormData.action_items || seasonalFormData.action_items.length === 0) {
                        alert("⚠️ يجب إضافة خطة عمل واحدة على الأقل\nAt least one action item is required");
                        return;
                      }
                      
                      // Validate all action items have required fields
                      const invalidItems = seasonalFormData.action_items.filter(item => 
                        !item.action_title?.trim() || !item.due_date
                      );
                      if (invalidItems.length > 0) {
                        alert("⚠️ يرجى ملء العنوان والموعد لجميع خطط العمل\nPlease fill in title and due date for all action items");
                        return;
                      }
                      
                      try {
                        const payload = {
                          explanation_text: seasonalFormData.explanation_text,
                          action_items: seasonalFormData.action_items || [],
                          user_id: 1, // TODO: Replace with actual user ID
                        };
                        
                        console.log('[DEBUG] Submitting seasonal explanation:', payload);
                        
                        const response = await ExplanationsAPI.submitSeasonalExplanation(selectedViolation.id, payload);
                        
                        alert(`✅ تم تقديم التوضيح الفصلي بنجاح!\n${response.message}`);
                        setSeasonalDialogOpen(false);
                        setSeasonalFormData({});
                        
                        // Refresh seasonal reports
                        fetchSeasonalReports();
                      } catch (err) {
                        console.error('[ERROR] Failed to submit seasonal explanation:', err);
                        alert(`❌ فشل تقديم التوضيح: ${err.response?.data?.message || err.message}`);
                      }
                    }}
                    disabled={!seasonalFormData.explanation_text || seasonalFormData.explanation_text.trim().length < 50 || !seasonalFormData.action_items || seasonalFormData.action_items.length === 0}
                    style={{
                      padding: "10px 24px",
                      borderRadius: "6px",
                      border: "none",
                      background: (!seasonalFormData.explanation_text || seasonalFormData.explanation_text.trim().length < 50 || !seasonalFormData.action_items || seasonalFormData.action_items.length === 0) ? "#ccc" : theme.gradients.primary,
                      color: "white",
                      fontWeight: 600,
                      cursor: (!seasonalFormData.explanation_text || seasonalFormData.explanation_text.trim().length < 50 || !seasonalFormData.action_items || seasonalFormData.action_items.length === 0) ? "not-allowed" : "pointer",
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
