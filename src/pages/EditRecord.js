// src/pages/EditRecord.js
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Box, Container, Typography, Divider, CircularProgress, Card, Alert, Input, Chip, IconButton, Sheet, FormControl, FormLabel } from "@mui/joy";
import theme from '../theme';
import { useNavigate, useParams } from "react-router-dom";
import { Warning } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";

// Utils
import { validateIncidentCase } from "../utils/incidentCaseValidation";

// Components
import MainLayout from "../components/common/MainLayout";
import TextBlocksWithButtons from "../components/insert/TextBlocksWithButtons";
import RecordMetadata from "../components/insert/RecordMetadata";
import ClassificationFields from "../components/insert/ClassificationFields";
import EditActionButtons from "../components/edit/EditActionButtons";

// API
import { getRecordById, updateRecord } from "../api/complaints";
import { 
  fetchReferenceData,
  fetchCategories,
  fetchSubcategories,
  fetchClassifications,
  searchEmployees,
  searchDoctors
} from "../api/insertRecord";

const EditRecord = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get record ID from URL params (/edit/:id)

  // State for selected record
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [originalRecord, setOriginalRecord] = useState(null);

  // State for all form fields (matching insert endpoint structure)
  const [formData, setFormData] = useState({
    complaint_text: "",
    feedback_received_date: new Date().toISOString().split("T")[0],
    issuing_department_id: null,
    domain_id: null,
    category_id: null,
    subcategory_id: null,
    classification_id: null,
    severity_id: null,
    stage_id: null,
    harm_id: null,
    clinical_risk_type_id: null,
    feedback_intent_type_id: null,
    immediate_action: "",
    taken_action: "",
    patient_name: "",
    target_department_ids: [],
    source_id: null,
    building: null,
    in_out: null,
    doctors: [],
    employees: [],
    requires_explanation: false,
  });

  // State for UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [recordValidation, setRecordValidation] = useState(null); // Initial validation result
  const [referenceData, setReferenceData] = useState({
    domains: [],
    categories: [],
    severities: [],
    stages: [],
    harm_levels: [],
    building: [],
    clinical_risk_types: [],
    feedback_intent_types: [],
    sources: [],
    departments: [],
  });

  // State for sequential loading of categories, subcategories, classifications
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const isLoadingRecordRef = useRef(false);
  const isSubmittingRef = useRef(false); // Prevent double submit

  // Employee search state
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
  const [employeeSearchResults, setEmployeeSearchResults] = useState([]);
  const [employeeSearchLoading, setEmployeeSearchLoading] = useState(false);
  const employeeSearchTimeoutRef = useRef(null);

  // Debounced employee search
  const handleEmployeeSearch = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setEmployeeSearchResults([]);
      return;
    }
    setEmployeeSearchLoading(true);
    try {
      const results = await searchEmployees(query);
      setEmployeeSearchResults(results || []);
    } catch (err) {
      console.error("Employee search error:", err);
      setEmployeeSearchResults([]);
    } finally {
      setEmployeeSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (employeeSearchTimeoutRef.current) clearTimeout(employeeSearchTimeoutRef.current);
    employeeSearchTimeoutRef.current = setTimeout(() => {
      handleEmployeeSearch(employeeSearchQuery);
    }, 300);
    return () => clearTimeout(employeeSearchTimeoutRef.current);
  }, [employeeSearchQuery, handleEmployeeSearch]);

  const handleAddEmployee = (emp) => {
    const existing = (formData.employees || []).find(e => e.employee_id === emp.employee_id);
    if (existing) return; // Already added
    setFormData(prev => ({
      ...prev,
      employees: [...(prev.employees || []), {
        employee_id: emp.employee_id,
        full_name: emp.full_name || emp.name || '',
        job_title: emp.job_title || ''
      }]
    }));
    setEmployeeSearchQuery("");
    setEmployeeSearchResults([]);
    setHasChanges(true);
  };

  const handleRemoveEmployee = (empId) => {
    setFormData(prev => ({
      ...prev,
      employees: (prev.employees || []).filter(e => e.employee_id !== empId)
    }));
    setHasChanges(true);
  };

  // Doctor search state
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const [doctorSearchResults, setDoctorSearchResults] = useState([]);
  const [doctorSearchLoading, setDoctorSearchLoading] = useState(false);
  const doctorSearchTimeoutRef = useRef(null);

  // Debounced doctor search
  const handleDoctorSearch = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setDoctorSearchResults([]);
      return;
    }
    setDoctorSearchLoading(true);
    try {
      const results = await searchDoctors(query);
      setDoctorSearchResults(results || []);
    } catch (err) {
      console.error("Doctor search error:", err);
      setDoctorSearchResults([]);
    } finally {
      setDoctorSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (doctorSearchTimeoutRef.current) clearTimeout(doctorSearchTimeoutRef.current);
    doctorSearchTimeoutRef.current = setTimeout(() => {
      handleDoctorSearch(doctorSearchQuery);
    }, 300);
    return () => clearTimeout(doctorSearchTimeoutRef.current);
  }, [doctorSearchQuery, handleDoctorSearch]);

  const handleAddDoctor = (doc) => {
    const docId = doc.doctor_id || doc.id || doc.employee_id;
    const existing = (formData.doctors || []).find(d => (d.doctor_id || d.id) === docId);
    if (existing) return; // Already added
    setFormData(prev => ({
      ...prev,
      doctors: [...(prev.doctors || []), {
        doctor_id: docId,
        doctor_name: doc.doctor_name || doc.full_name || doc.name || ''
      }]
    }));
    setDoctorSearchQuery("");
    setDoctorSearchResults([]);
    setHasChanges(true);
  };

  const handleRemoveDoctor = (docId) => {
    setFormData(prev => ({
      ...prev,
      doctors: (prev.doctors || []).filter(d => (d.doctor_id || d.id) !== docId)
    }));
    setHasChanges(true);
  };

  // Compute form validity
  const isFormValid = useMemo(() => {
    const validation = validateIncidentCase(formData);
    return validation.isValid;
  }, [formData]);

  // Load reference data on mount
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const data = await fetchReferenceData();
        console.log("📚 Reference data loaded:", data);
        console.log("📚 Departments count:", data.departments?.length);
        console.log("📚 Sample department:", data.departments?.[0]);
        
        // Normalize field names for compatibility
        const normalized = {
          ...data,
          severities: data.severity || data.severities || [],
          harm_levels: data.harm || data.harm_levels || [],
        };
        
        setReferenceData(normalized);
      } catch (err) {
        console.error("❌ Error loading reference data:", err);
      }
    };
    loadReferenceData();
  }, []);

  // Auto-load record from URL parameter
  useEffect(() => {
    if (id) {
      setLoading(true);
      setError(null);
      console.log("🔄 Loading record:", id);
      getRecordById(id)
        .then(async (res) => {
          const record = res.record;

          console.log("📖 Record loaded:", record);
          console.log("📖 Target departments in record:", record.target_departments);
          console.log("📖 Building ID:", record.building_id, "Building name:", record.building_name);
          console.log("📖 Domain ID:", record.domain_id);
          console.log("📖 Category ID:", record.category_id);
          console.log("📖 Subcategory ID:", record.subcategory_id);
          console.log("📖 Classification ID:", record.classification_id);
          
          setSelectedRecord(record);
          setOriginalRecord(JSON.parse(JSON.stringify(record)));
          isLoadingRecordRef.current = true;

          // Load categories/subcategories/classifications for this record
          try {
            if (record.domain_id) {
              console.log("🔄 Loading categories for domain:", record.domain_id);
              const cats = await fetchCategories(record.domain_id);
              console.log("✅ Categories loaded:", cats.length);
              setCategories(cats);
              
              if (record.category_id) {
                console.log("🔄 Loading subcategories for category:", record.category_id);
                const subs = await fetchSubcategories(record.category_id);
                console.log("✅ Subcategories loaded:", subs.length);
                setSubcategories(subs);
                
                if (record.subcategory_id) {
                  console.log("🔄 Loading classifications for subcategory:", record.subcategory_id);
                  const classifs = await fetchClassifications(record.subcategory_id);
                  console.log("✅ Classifications loaded:", classifs.length);
                  setClassifications(classifs);
                }
              }
            }
          } catch (err) {
            console.error("❌ Error loading classification hierarchy:", err);
          }

          // Map target_departments array to IDs using section_id (stored DepartmentID = leaf/section ID)
          // NOTE: section_id is the actual value stored in APP_IncidentCaseTargetDepartment.DepartmentID
          // department_id is the PARENT org unit, not what the dropdown uses
          const targetDeptIds = Array.isArray(record.target_departments)
            ? record.target_departments.map(dept => dept.section_id || dept.department_id).filter(Boolean)
            : [];
          
          console.log("📋 Mapped target department IDs:", targetDeptIds);

          // Map doctors array
          const doctorsList = Array.isArray(record.doctors)
            ? record.doctors.map(doc => {
                const docId = doc.id || doc.doctor_id || doc.employee_id;
                const docName = doc.name || doc.doctor_name || doc.full_name || `Doctor #${docId}`;
                return {
                  doctor_id: docId,
                  doctor_name: docName
                };
              })
            : [];

          // Map employees array (supervisors/workers)
          const employeesList = Array.isArray(record.employees)
            ? record.employees.map(emp => {
                const empId = emp.employee_id || emp.id;
                const empName = emp.full_name || emp.employee_name || emp.name || `Employee #${empId}`;
                return {
                  employee_id: empId,
                  full_name: empName,
                  job_title: emp.job_title || ''
                };
              })
            : [];

          // Map building_id to building name (RAH/BIC)
          let buildingName = null;
          if (record.building_id === 1) buildingName = "RAH";
          else if (record.building_id === 2) buildingName = "BIC";
          else if (record.building_name) buildingName = record.building_name;

          // Map in_out from is_inpatient or in_out field
          let inOutValue = null;
          if (record.in_out) inOutValue = record.in_out; // Direct field
          else if (record.is_inpatient === true || record.is_inpatient === 1) inOutValue = "IN";
          else if (record.is_inpatient === false || record.is_inpatient === 0) inOutValue = "OUT";

          const initialFormData = {
            complaint_text: record.complaint_text || "",
            feedback_received_date: record.received_date || new Date().toISOString().split("T")[0],
            issuing_department_id: record.issuing_org_unit_id || null,
            domain_id: record.domain_id || null,
            category_id: record.category_id || null,
            subcategory_id: record.subcategory_id || null,
            classification_id: record.classification_id || null,
            severity_id: record.severity_id || null,
            stage_id: record.stage_id || null,
            harm_id: record.harm_level_id || null,
            clinical_risk_type_id: record.clinical_risk_type_id || null,
            feedback_intent_type_id: record.feedback_intent_type_id || null,
            immediate_action: record.immediate_action || "",
            taken_action: record.taken_action || "",
            patient_name: record.patient_name || "",
            target_department_ids: targetDeptIds,
            source_id: record.source_id || null,
            building: buildingName,
            in_out: inOutValue,
            doctors: doctorsList,
            employees: employeesList,
            is_inpatient: record.is_inpatient,
            explanation_status_id: record.explanation_status_id || null,
            case_status_id: record.case_status_id || 1,
            requires_explanation: record.requires_explanation !== undefined ? record.requires_explanation : false,
          };
          
          setFormData(initialFormData);
          setHasChanges(false);
          
          // ✅ Validate loaded record
          const initialValidation = validateIncidentCase(initialFormData);
          setRecordValidation(initialValidation);
          
          if (!initialValidation.isValid) {
            console.warn("⚠️ Loaded record is incomplete:", initialValidation.errors);
            console.warn("📋 Missing fields:", Object.keys(initialValidation.errors));
            console.warn("📊 FormData snapshot:", {
              requires_explanation: initialFormData.requires_explanation,
              is_inpatient: initialFormData.is_inpatient,
              building: initialFormData.building,
            });
          } else {
            console.log("✅ Loaded record is valid!");
          }
          
          // Small delay to ensure state is set before enabling useEffects
          setTimeout(() => {
            isLoadingRecordRef.current = false;
            console.log("✅ Record loading complete, useEffects enabled");
          }, 100);
        })
        .catch((err) => {
          console.error("❌ Error loading record:", err);
          setError(`Failed to load record: ${err.message}`);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Watch for domain_id changes - load categories
  useEffect(() => {
    if (isLoadingRecordRef.current) return; // Skip during initial record load
    
    if (formData.domain_id) {
      const loadCats = async () => {
        try {
          const data = await fetchCategories(formData.domain_id);
          setCategories(data);
        } catch (err) {
          console.error("Error loading categories:", err);
        }
      };
      loadCats();
      
      // Clear dependent fields when domain changes
      setFormData(prev => ({
        ...prev,
        category_id: null,
        subcategory_id: null,
        classification_id: null,
      }));
      setSubcategories([]);
      setClassifications([]);
    } else {
      setCategories([]);
      setSubcategories([]);
      setClassifications([]);
    }
  }, [formData.domain_id]);

  // Watch for category_id changes - load subcategories
  useEffect(() => {
    if (isLoadingRecordRef.current) return; // Skip during initial record load
    
    if (formData.category_id) {
      const loadSubs = async () => {
        try {
          const data = await fetchSubcategories(formData.category_id);
          setSubcategories(data);
        } catch (err) {
          console.error("Error loading subcategories:", err);
        }
      };
      loadSubs();
      
      // Clear dependent fields when category changes
      setFormData(prev => ({
        ...prev,
        subcategory_id: null,
        classification_id: null,
      }));
      setClassifications([]);
    } else {
      setSubcategories([]);
      setClassifications([]);
    }
  }, [formData.category_id]);

  // Watch for subcategory_id changes - load classifications
  useEffect(() => {
    if (isLoadingRecordRef.current) return; // Skip during initial record load
    
    if (formData.subcategory_id) {
      const loadClassifs = async () => {
        try {
          const data = await fetchClassifications(formData.subcategory_id);
          setClassifications(data);
        } catch (err) {
          console.error("Error loading classifications:", err);
        }
      };
      loadClassifs();
      
      // Clear dependent field when subcategory changes
      setFormData(prev => ({
        ...prev,
        classification_id: null,
      }));
    } else {
      setClassifications([]);
    }
  }, [formData.subcategory_id]);

  // Update form data
  const handleInputChange = (field, value) => {
    console.log(`🔄 Field change: ${field} = ${value}`);
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };
      console.log(`📝 Updated formData.${field}:`, updated[field]);
      return updated;
    });
    setHasChanges(true);
  };

  // Handle text block changes
  const handleTextBlockChange = (field, value) => {
    // Convert field names from camelCase to snake_case
    const fieldMap = {
      "complaintText": "complaint_text",
      "additionalNotes": "immediate_action",
      "optionalThirdText": "taken_action",
    };
    const snakeField = fieldMap[field] || field;
    
    setFormData((prev) => ({
      ...prev,
      [snakeField]: value,
    }));
    setHasChanges(true);
  };

  // Handle Update Record
  const handleUpdateRecord = async () => {
    // Prevent double submit
    if (isSubmittingRef.current) {
      console.log("⚠️ Submit already in progress, ignoring duplicate click");
      return;
    }
    
    try {
      isSubmittingRef.current = true;
      setLoading(true);
      setError(null);
      setValidationErrors({});

      // ✅ Run centralized validation
      const validation = validateIncidentCase(formData);
      
      if (!validation.isValid) {
        // Show validation errors
        setValidationErrors(validation.errors);
        const errorCount = Object.keys(validation.errors).length;
        setError(`❌ Please fix ${errorCount} highlighted field${errorCount > 1 ? 's' : ''} before saving.`);
        setLoading(false);
        isSubmittingRef.current = false;
        
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Call API to update record
      console.log("📤 Submitting update with formData:", formData);
      const result = await updateRecord(id, formData);
      console.log("✅ Record updated:", result);

      setSuccess("Record updated successfully! Redirecting...");
      setHasChanges(false);

      // Redirect back to table view after 2 seconds
      setTimeout(() => {
        navigate("/table-view");
      }, 2000);
    } catch (err) {
      console.error("❌ Error updating record:", err);
      setError(`Error updating record: ${err.message}`);
      isSubmittingRef.current = false;
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    if (hasChanges && !window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
      return;
    }
    navigate("/table-view");
  };

  // Handle Reset to Original
  const handleReset = () => {
    if (originalRecord) {
      // Re-map all fields from originalRecord
      const targetDeptIds = Array.isArray(originalRecord.target_departments)
        ? originalRecord.target_departments.map(dept => dept.department_id).filter(Boolean)
        : [];

      const doctorsList = Array.isArray(originalRecord.doctors)
        ? originalRecord.doctors.map(doc => {
            const docId = doc.id || doc.doctor_id || doc.employee_id;
            const docName = doc.name || doc.doctor_name || doc.full_name || `Doctor #${docId}`;
            return {
              doctor_id: docId,
              doctor_name: docName
            };
          })
        : [];

      const employeesList = Array.isArray(originalRecord.employees)
        ? originalRecord.employees.map(emp => {
            const empId = emp.employee_id || emp.id;
            const empName = emp.full_name || emp.employee_name || emp.name || `Employee #${empId}`;
            return {
              employee_id: empId,
              full_name: empName,
              job_title: emp.job_title || ''
            };
          })
        : [];

      let buildingName = null;
      if (originalRecord.building_id === 1) buildingName = "RAH";
      else if (originalRecord.building_id === 2) buildingName = "BIC";
      else if (originalRecord.building_name) buildingName = originalRecord.building_name;

      let inOutValue = null;
      if (originalRecord.in_out) inOutValue = originalRecord.in_out;
      else if (originalRecord.is_inpatient === true || originalRecord.is_inpatient === 1) inOutValue = "IN";
      else if (originalRecord.is_inpatient === false || originalRecord.is_inpatient === 0) inOutValue = "OUT";

      const resetFormData = {
        complaint_text: originalRecord.complaint_text || "",
        feedback_received_date: originalRecord.received_date || new Date().toISOString().split("T")[0],
        issuing_department_id: originalRecord.issuing_org_unit_id || null,
        domain_id: originalRecord.domain_id || null,
        category_id: originalRecord.category_id || null,
        subcategory_id: originalRecord.subcategory_id || null,
        classification_id: originalRecord.classification_id || null,
        severity_id: originalRecord.severity_id || null,
        stage_id: originalRecord.stage_id || null,
        harm_id: originalRecord.harm_level_id || null,
        clinical_risk_type_id: originalRecord.clinical_risk_type_id || null,
        feedback_intent_type_id: originalRecord.feedback_intent_type_id || null,
        immediate_action: originalRecord.immediate_action || "",
        taken_action: originalRecord.taken_action || "",
        patient_name: originalRecord.patient_name || "",
        target_department_ids: targetDeptIds,
        source_id: originalRecord.source_id || null,
        building: buildingName,
        in_out: inOutValue,
        doctors: doctorsList,
        employees: employeesList,
        is_inpatient: originalRecord.is_inpatient,
        explanation_status_id: originalRecord.explanation_status_id || null,
        case_status_id: originalRecord.case_status_id || 1,
        requires_explanation: originalRecord.requires_explanation !== undefined ? originalRecord.requires_explanation : false,
      };
      
      setFormData(resetFormData);
      setHasChanges(false);
      setSuccess(null);
      setValidationErrors({});
      
      // Re-validate after reset
      const validation = validateIncidentCase(resetFormData);
      setRecordValidation(validation);
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <h1 style={{ color: "#1a1e3f", marginBottom: "8px" }}>📝 Edit Record</h1>
          <p style={{ color: "#667eea", margin: 0 }}>
            Update feedback/incident record #{id}
          </p>
        </Box>

        {/* Loading State */}
        {loading && !selectedRecord && (
          <Card sx={{ 
            p: 4, 
            textAlign: "center",
            background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
            border: "1px solid rgba(102, 126, 234, 0.1)",
          }}>
            <CircularProgress size="lg" sx={{ "--CircularProgress-color": theme.colors.primary }} />
            <Typography level="body-md" sx={{ mt: 2, color: theme.colors.primary, fontWeight: 600 }}>
              Loading record...
            </Typography>
          </Card>
        )}

        {/* Error Messages */}
        {error && (
          <Card sx={{ 
            mb: 2, 
            p: 3, 
            bgcolor: "danger.softBg",
            border: "2px solid",
            borderColor: "danger.solidBg",
            boxShadow: "0 4px 12px rgba(220, 38, 38, 0.15)"
          }}>
            <Typography 
              color="danger" 
              level="title-md"
              sx={{ 
                fontWeight: 700, 
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              ❌ Validation Error
            </Typography>
            <Typography 
              color="danger" 
              level="body-sm"
              sx={{ whiteSpace: "pre-line" }}
            >
              {error}
            </Typography>
          </Card>
        )}

        {/* Success Messages */}
        {success && (
          <Card sx={{ mb: 2, p: 2, bgcolor: "success.softBg" }}>
            <Typography color="success">✅ {success}</Typography>
          </Card>
        )}
        
        {/* Warning Banner for Incomplete Records */}
        {recordValidation && !recordValidation.isValid && !loading && (
          <Alert 
            color="warning" 
            variant="soft"
            startDecorator={<Warning />}
            sx={{ 
              mb: 2, 
              p: 3,
              border: "2px solid",
              borderColor: "warning.solidBg",
              boxShadow: "0 4px 12px rgba(237, 108, 2, 0.15)"
            }}
          >
            <Box>
              <Typography level="title-md" sx={{ fontWeight: 700, mb: 1 }}>
                ⚠️ This record is incomplete and must be fixed before saving.
              </Typography>
              <Typography level="body-sm">
                Missing required fields: {Object.keys(recordValidation.errors).length}
              </Typography>
              <Typography level="body-xs" sx={{ mt: 1, fontStyle: "italic" }}>
                Please fill all fields marked with * before updating.
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Form (show only when record is loaded) */}
        {selectedRecord && !loading && (
          <>
            <Divider sx={{ my: 3 }} />

            {/* Row 1: Text Inputs + Buttons */}
            <TextBlocksWithButtons
              complaintText={formData.complaint_text}
              additionalNotes={formData.immediate_action}
              optionalThirdText={formData.taken_action}
              onTextChange={handleTextBlockChange}
              validationErrors={validationErrors}
            />

            {/* Row 2: Metadata Inputs */}
            <RecordMetadata 
              formData={formData} 
              onInputChange={handleInputChange} 
              referenceData={referenceData}
              validationErrors={validationErrors}
            />

            {/* Row 3: Classification Fields */}
            <ClassificationFields 
              formData={formData} 
              onInputChange={handleInputChange}
              referenceData={referenceData}
              categories={categories}
              subcategories={subcategories}
              classifications={classifications}
              validationErrors={validationErrors}
            />

            {/* Row 4: Employees (Supervisor / Worker) */}
            <Card sx={{ 
              p: 3, 
              mt: 3, 
              mb: 3,
              background: "#c8e4e6",
              border: "1px solid rgba(31, 111, 115, 0.3)",
              borderRadius: "12px"
            }}>
              <Typography level="title-md" sx={{ fontWeight: 700, mb: 2, color: "#1F6F73" }}>
                <PersonIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Employees (Supervisor / Worker)
              </Typography>

              {/* Current linked employees */}
              {formData.employees && formData.employees.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {formData.employees.map((emp) => {
                    const empName = emp.full_name || emp.employee_name || emp.name || `Employee #${emp.employee_id}`;
                    return (
                      <Chip
                        key={emp.employee_id}
                        variant="soft"
                        color="primary"
                        endDecorator={
                          <IconButton
                            size="sm"
                            variant="plain"
                            color="neutral"
                            onClick={() => handleRemoveEmployee(emp.employee_id)}
                          >
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        }
                        sx={{ py: 0.5, px: 1 }}
                      >
                        <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        {empName}
                        {emp.job_title ? ` (${emp.job_title})` : ""}
                      </Chip>
                    );
                  })}
                </Box>
              )}

              {/* Employee search */}
              <FormControl>
                <FormLabel>Search & Add Employee</FormLabel>
                <Input
                  placeholder="Type employee name to search..."
                  value={employeeSearchQuery}
                  onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                  startDecorator={<SearchIcon sx={{ color: "neutral.400" }} />}
                  endDecorator={employeeSearchLoading ? <CircularProgress size="sm" /> : null}
                  sx={{ mb: 1 }}
                />
              </FormControl>

              {/* Search results dropdown */}
              {employeeSearchResults.length > 0 && (
                <Sheet
                  variant="outlined"
                  sx={{
                    borderRadius: "8px",
                    maxHeight: 200,
                    overflowY: "auto",
                    p: 0
                  }}
                >
                  {employeeSearchResults.map((emp) => {
                    const empId = emp.employee_id || emp.id;
                    const empName = emp.full_name || emp.name || `Employee #${empId}`;
                    const empTitle = emp.job_title || "";
                    const isAlreadyAdded = (formData.employees || []).some(e => e.employee_id === empId);
                    return (
                      <Box
                        key={empId}
                        onClick={() => !isAlreadyAdded && handleAddEmployee({
                          employee_id: empId,
                          full_name: empName,
                          job_title: empTitle
                        })}
                        sx={{
                          p: 1.5,
                          cursor: isAlreadyAdded ? "default" : "pointer",
                          opacity: isAlreadyAdded ? 0.5 : 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          "&:hover": !isAlreadyAdded ? {
                            bgcolor: "primary.softBg"
                          } : {},
                          "&:last-child": { borderBottom: "none" }
                        }}
                      >
                        <PersonIcon sx={{ color: "primary.500", fontSize: 20 }} />
                        <Box>
                          <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                            {empName}
                          </Typography>
                          {empTitle && (
                            <Typography level="body-xs" sx={{ color: "neutral.500" }}>
                              {empTitle}
                            </Typography>
                          )}
                        </Box>
                        {isAlreadyAdded && (
                          <Chip size="sm" variant="soft" color="success" sx={{ ml: "auto" }}>
                            Added
                          </Chip>
                        )}
                      </Box>
                    );
                  })}
                </Sheet>
              )}

              {employeeSearchQuery.length >= 2 && employeeSearchResults.length === 0 && !employeeSearchLoading && (
                <Typography level="body-xs" sx={{ color: "neutral.500", mt: 1 }}>
                  No employees found for "{employeeSearchQuery}"
                </Typography>
              )}
            </Card>

            {/* Row 5: Doctors */}
            <Card sx={{ 
              p: 3, 
              mt: 3, 
              mb: 3,
              background: "#c8e4e6",
              border: "1px solid rgba(31, 111, 115, 0.3)",
              borderRadius: "12px"
            }}>
              <Typography level="title-md" sx={{ fontWeight: 700, mb: 2, color: "#1F6F73" }}>
                🩺 Doctors
              </Typography>

              {/* Current linked doctors */}
              {formData.doctors && formData.doctors.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {formData.doctors.map((doc) => {
                    const docId = doc.doctor_id || doc.id;
                    const docName = doc.doctor_name || doc.name || `Doctor #${docId}`;
                    return (
                      <Chip
                        key={docId}
                        variant="soft"
                        color="success"
                        endDecorator={
                          <IconButton
                            size="sm"
                            variant="plain"
                            color="neutral"
                            onClick={() => handleRemoveDoctor(docId)}
                          >
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        }
                        sx={{ py: 0.5, px: 1 }}
                      >
                        🩺 {docName}
                      </Chip>
                    );
                  })}
                </Box>
              )}

              {/* Doctor search */}
              <FormControl>
                <FormLabel>Search & Add Doctor</FormLabel>
                <Input
                  placeholder="Type doctor name to search..."
                  value={doctorSearchQuery}
                  onChange={(e) => setDoctorSearchQuery(e.target.value)}
                  startDecorator={<SearchIcon sx={{ color: "neutral.400" }} />}
                  endDecorator={doctorSearchLoading ? <CircularProgress size="sm" /> : null}
                  sx={{ mb: 1 }}
                />
              </FormControl>

              {/* Search results dropdown */}
              {doctorSearchResults.length > 0 && (
                <Sheet
                  variant="outlined"
                  sx={{
                    borderRadius: "8px",
                    maxHeight: 200,
                    overflowY: "auto",
                    p: 0
                  }}
                >
                  {doctorSearchResults.map((doc) => {
                    const docId = doc.doctor_id || doc.id || doc.employee_id;
                    const docName = doc.doctor_name || doc.full_name || doc.name || `Doctor #${docId}`;
                    const isAlreadyAdded = (formData.doctors || []).some(d => (d.doctor_id || d.id) === docId);
                    return (
                      <Box
                        key={docId}
                        onClick={() => !isAlreadyAdded && handleAddDoctor({
                          doctor_id: docId,
                          doctor_name: docName
                        })}
                        sx={{
                          p: 1.5,
                          cursor: isAlreadyAdded ? "default" : "pointer",
                          opacity: isAlreadyAdded ? 0.5 : 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          "&:hover": !isAlreadyAdded ? {
                            bgcolor: "success.softBg"
                          } : {},
                          "&:last-child": { borderBottom: "none" }
                        }}
                      >
                        <Box sx={{ fontSize: 20 }}>🩺</Box>
                        <Box>
                          <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                            {docName}
                          </Typography>
                        </Box>
                        {isAlreadyAdded && (
                          <Chip size="sm" variant="soft" color="success" sx={{ ml: "auto" }}>
                            Added
                          </Chip>
                        )}
                      </Box>
                    );
                  })}
                </Sheet>
              )}

              {doctorSearchQuery.length >= 2 && doctorSearchResults.length === 0 && !doctorSearchLoading && (
                <Typography level="body-xs" sx={{ color: "neutral.500", mt: 1 }}>
                  No doctors found for "{doctorSearchQuery}"
                </Typography>
              )}
            </Card>

            {/* Row 6: Action Buttons */}
            <EditActionButtons
              onUpdate={handleUpdateRecord}
              onCancel={handleCancel}
              onReset={handleReset}
              loading={loading}
              hasChanges={hasChanges}
              isFormValid={isFormValid}
            />
          </>
        )}

        {/* Empty/Loading State */}
        {!loading && !selectedRecord && (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
              border: "2px dashed rgba(102, 126, 234, 0.2)",
            }}
          >
            <Typography level="h3" sx={{ color: "#667eea", mb: 1 }}>
              🔍 No Data
            </Typography>
            <Typography level="body-sm" sx={{ color: "#999" }}>
              {error ? "Failed to load record details" : "No record data available"}
            </Typography>
          </Box>
        )}

      </Container>
    </MainLayout>
  );
};
export default EditRecord;
