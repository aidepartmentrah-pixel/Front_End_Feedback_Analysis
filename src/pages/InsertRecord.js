// src/components/insert/InsertRecord.js
import React, { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { Box, Container } from "@mui/joy";

// Utils
import { normalizeClassifications } from "../utils/classificationMappings";
import { validateIncidentCase, getFieldError } from "../utils/incidentCaseValidation";

// Components
import MainLayout from "../components/common/MainLayout";
import TextBlocksWithButtons from "../components/insert/TextBlocksWithButtons";
import RecordMetadata from "../components/insert/RecordMetadata";
import NEROutputs from "../components/insert/NEROutputs";
import ClassificationFields from "../components/insert/ClassificationFields";
import ActionButtons from "../components/insert/ActionButtons";

// API
import {
  fetchReferenceData,
  fetchCategories,
  fetchSubcategories,
  fetchClassifications,
  submitRecord,
  extractNER,
  classifyText,
  searchPatients,
  searchDoctors,
  searchEmployees,
} from "../api/insertRecord";

const InsertRecord = () => {
  // State for all form fields with proper ID-based structure
  const [formData, setFormData] = useState({
    // Step 1: Text blocks (REQUIRED by backend)
    complaint_text: "",
    immediate_action: "",
    taken_action: "",

    // Step 2: Metadata (REQUIRED by backend)
    feedback_received_date: new Date().toISOString().split("T")[0],
    issuing_department_id: null,
    target_department_ids: [], // Multiple departments (OPTIONAL)
    source_id: null,
    is_inpatient: true, // REQUIRED: true = Inpatient, false = Outpatient (default: true)
    building: null, // REQUIRED: RAH or BIC
    worker_type: null, // OPTIONAL: Doctor, Clerk, Nurse, etc.
    explanation_status_id: null, // OPTIONAL
    requires_explanation: false, // REQUIRED: Boolean: Does this case require explanation? (default: false)

    // Step 3: NER Outputs
    patient_name: "", // REQUIRED: Patient name from NER
    patient_admission_id: null, // Single patient ID (OPTIONAL)
    doctor_ids: [], // Multiple doctor IDs (OPTIONAL)
    doctor_names: [], // Doctor names for payload
    employee_ids: [], // Multiple employee IDs (OPTIONAL)
    employee_names: [], // Employee names for payload

    // Step 4: Classification (REQUIRED: Domain first!)
    domain_id: null,
    category_id: null,
    subcategory_id: null,
    classification_id: null,

    // Step 5: Additional attributes (REQUIRED)
    severity_id: null,
    stage_id: null,
    harm_id: null,
    feedback_intent_type_id: null,
    clinical_risk_type_id: null,

    // ⭐ ML Training fields (OPTIONAL)
    classification_ar: null, // 0.0-10.0
    classification_en: null, // >= 0
  });

  // State for reference data
  const [referenceData, setReferenceData] = useState({
    departments: [],
    sources: [],
    domains: [],
    severity: [],
    stages: [],
    harm: [],
  });

  // State for cascading dropdowns
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [classifications, setClassifications] = useState([]);

  // State for API responses and loading
  const [dataLoading, setDataLoading] = useState(false);
  const [nerLoading, setNerLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorField, setErrorField] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isAiExtracting, setIsAiExtracting] = useState(false); // Flag to prevent clearing during AI
  const [extractionDebug, setExtractionDebug] = useState(null); // Debug info to show what's being set
  const [resetNER, setResetNER] = useState(0); // Trigger to reset NER outputs
  const isAiExtractingRef = useRef(false); // Ref for immediate access in useEffect
  const isSubmittingRef = useRef(false); // Prevent double submit

  // Load reference data on mount
  useEffect(() => {
    loadReferenceData();
  }, []);

  const loadReferenceData = async () => {
    try {
      setDataLoading(true);
      const data = await fetchReferenceData();
      console.log("Setting reference data:", data);
      console.log("Domains count:", data?.domains?.length);
      console.log("Sources count:", data?.sources?.length);
      console.log("Departments count:", data?.departments?.length);
      console.log("Worker types count:", data?.worker_types?.length);
      console.log("❌ Feedback Intent Types:", data?.feedback_intent_types);
      console.log("❌ Clinical Risk Types:", data?.clinical_risk_types);
      console.log("Worker types data:", data?.worker_types);
      setReferenceData(data);
      
      // Pre-load ALL categories, subcategories, classifications on mount
      // This way they're ALWAYS available and we can set values instantly during extraction
      if (data?.domains && Array.isArray(data.domains)) {
        for (const domain of data.domains) {
          try {
            const catsData = await fetchCategories(domain.id);
            // Store categories keyed by domain ID
            console.log(`Pre-loaded ${catsData?.length || 0} categories for domain ${domain.id}`);
            
            if (catsData && Array.isArray(catsData)) {
              for (const cat of catsData) {
                try {
                  const subCatsData = await fetchSubcategories(cat.id);
                  console.log(`Pre-loaded ${subCatsData?.length || 0} subcategories for category ${cat.id}`);
                  
                  if (subCatsData && Array.isArray(subCatsData)) {
                    for (const subCat of subCatsData) {
                      try {
                        const classData = await fetchClassifications(subCat.id);
                        console.log(`Pre-loaded ${classData?.length || 0} classifications for subcategory ${subCat.id}`);
                      } catch (e) {
                        // Ignore errors, just log
                      }
                    }
                  }
                } catch (e) {
                  // Ignore errors, just log
                }
              }
            }
          } catch (e) {
            // Ignore errors, just log
          }
        }
      }
    } catch (err) {
      setError("Failed to load reference data. Please refresh the page.");
      console.error("Error loading reference data:", err);
    } finally {
      setDataLoading(false);
    }
  };

  // Handle domain change - fetch categories and clear dependent fields
  useEffect(() => {
    if (isAiExtractingRef.current) return; // Skip during AI extraction
    
    if (formData.domain_id) {
      loadCategories(formData.domain_id);
      // Only clear dependent fields if NOT during AI extraction
      if (!isAiExtracting && !isAiExtractingRef.current) {
        setFormData((prev) => ({
          ...prev,
          category_id: null,
          subcategory_id: null,
          classification_id: null,
        }));
        setSubcategories([]);
        setClassifications([]);
      }
    } else {
      setCategories([]);
      setSubcategories([]);
      setClassifications([]);
    }
  }, [formData.domain_id, isAiExtracting]);

  // Handle category change - fetch subcategories and clear dependent fields
  useEffect(() => {
    if (isAiExtractingRef.current) return; // Skip during AI extraction
    
    if (formData.category_id) {
      loadSubcategories(formData.category_id);
      // Only clear dependent fields if NOT during AI extraction
      if (!isAiExtracting && !isAiExtractingRef.current) {
        setFormData((prev) => ({
          ...prev,
          subcategory_id: null,
          classification_id: null,
        }));
        setClassifications([]);
      }
    } else {
      setSubcategories([]);
      setClassifications([]);
    }
  }, [formData.category_id, isAiExtracting]);

  // Handle subcategory change - fetch classifications and clear dependent fields
  useEffect(() => {
    if (isAiExtractingRef.current) return; // Skip during AI extraction
    
    if (formData.subcategory_id) {
      loadClassifications(formData.subcategory_id);
      // Only clear dependent field if NOT during AI extraction
      if (!isAiExtracting && !isAiExtractingRef.current) {
        setFormData((prev) => ({
          ...prev,
          classification_id: null,
        }));
      }
    } else {
      setClassifications([]);
    }
  }, [formData.subcategory_id, isAiExtracting]);

  const loadCategories = async (domainId) => {
    try {
      const data = await fetchCategories(domainId);
      console.log("Setting categories:", data);
      console.log("Categories count:", data?.length);
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const loadSubcategories = async (categoryId) => {
    try {
      const data = await fetchSubcategories(categoryId);
      setSubcategories(data);
    } catch (err) {
      console.error("Error loading subcategories:", err);
    }
  };

  const loadClassifications = async (subcategoryId) => {
    try {
      const data = await fetchClassifications(subcategoryId);
      setClassifications(data);
    } catch (err) {
      console.error("Error loading classifications:", err);
    }
  };

  // Update form data
  const handleInputChange = (field, value) => {
    console.log(`🔧 Field update: ${field} =`, value, `(type: ${typeof value})`);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts fixing the issue
    if (errorField === field) {
      setErrorField(null);
      setError(null);
    }
  };

  // Compute form validation status
  const isFormValid = React.useMemo(() => {
    const validation = validateIncidentCase(formData);
    return validation.isValid;
  }, [formData]);

  // Handle NER Extraction button click
  const handleRunNER = async () => {
    try {
      setNerLoading(true);
      setError(null);
      setErrorField(null);

      if (!formData.complaint_text || formData.complaint_text.trim().length === 0) {
        setError("Complaint text is required for NER extraction");
        setNerLoading(false);
        return;
      }

      // Call NER API to extract names
      const response = await extractNER(formData.complaint_text);
      console.log("NER extraction response:", response);

      // Return extracted names to be populated in search boxes
      const extractedNames = {
        patient: response.patient_name || response.patient || "",
        doctor: response.doctor_name || response.doctor || "",
        employee: response.employee_name || response.employee || "",
      };

      setSuccess("NER extraction completed! Names populated in search boxes.");
      setTimeout(() => setSuccess(null), 3000);

      // Return the extracted names so NEROutputs can populate search boxes
      return extractedNames;
    } catch (err) {
      setError("Error during NER extraction. Please try again or search manually.");
      console.error("NER Error:", err);
      return null;
    } finally {
      setNerLoading(false);
    }
  };

  // Handle transcription completion (auto-trigger NER)
  const handleTranscriptionComplete = async (transcribedText) => {
    if (transcribedText && transcribedText.trim().length > 0) {
      // Auto-run NER after successful transcription
      setTimeout(() => {
        handleRunNER();
      }, 500);
    }
  };

  // Handle Add Record button click (submits to database)
  const handleAddRecord = async () => {
    // Prevent double submit
    if (isSubmittingRef.current) {
      console.log("⚠️ Submit already in progress, ignoring duplicate click");
      return;
    }
    
    try {
      isSubmittingRef.current = true;
      setSubmitLoading(true);
      setError(null);
      setErrorField(null);
      setValidationErrors({});

      // ✅ Run centralized validation
      const validation = validateIncidentCase(formData);
      
      console.log("📋 Validation result:", validation);
      console.log("📋 FormData before submit:", {
        requires_explanation: formData.requires_explanation,
        is_inpatient: formData.is_inpatient,
        building: formData.building,
        source_id: formData.source_id,
        patient_name: formData.patient_name,
        immediate_action: formData.immediate_action,
        taken_action: formData.taken_action,
      });
      
      if (!validation.isValid) {
        // Show validation errors
        setValidationErrors(validation.errors);
        const errorCount = Object.keys(validation.errors).length;
        setError(`❌ Please fix ${errorCount} highlighted field${errorCount > 1 ? 's' : ''} before submitting.`);
        
        // Find first error field and set it
        const firstErrorField = Object.keys(validation.errors)[0];
        if (firstErrorField) {
          setErrorField(firstErrorField);
        }
        
        // Scroll to top to show error banner
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setSubmitLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      // ✅ BUILD PAYLOAD per backend API spec - ALL 18 REQUIRED FIELDS
      const payload = {
        // REQUIRED: Text content (3 fields)
        complaint_text: formData.complaint_text,
        immediate_action: formData.immediate_action,
        taken_action: formData.taken_action,
        
        // REQUIRED: Metadata (4 fields)
        feedback_received_date: formData.feedback_received_date,
        issuing_department_id: Number(formData.issuing_department_id),
        source_id: Number(formData.source_id),
        patient_name: formData.patient_name,
        
        // REQUIRED: Classification hierarchy (4 fields)
        domain_id: Number(formData.domain_id),
        category_id: Number(formData.category_id),
        subcategory_id: Number(formData.subcategory_id),
        classification_id: Number(formData.classification_id),
        
        // REQUIRED: Additional attributes (5 fields)
        severity_id: Number(formData.severity_id),
        stage_id: Number(formData.stage_id),
        harm_id: Number(formData.harm_id),
        clinical_risk_type_id: Number(formData.clinical_risk_type_id),
        feedback_intent_type_id: Number(formData.feedback_intent_type_id),
        
        // REQUIRED: Boolean fields (2 fields)
        is_inpatient: formData.is_inpatient,
        requires_explanation: formData.requires_explanation,
      };
      
      console.log("📦 Payload being sent:", JSON.stringify(payload, null, 2));
      console.log("📦 requires_explanation in payload:", payload.requires_explanation, `(type: ${typeof payload.requires_explanation})`);
      console.log("📦 is_inpatient in payload:", payload.is_inpatient, `(type: ${typeof payload.is_inpatient})`);

      // REQUIRED: Building (map to building_id)
      if (formData.building) {
        const buildingIdMap = { "RAH": 1, "BIC": 2 };
        payload.building_id = buildingIdMap[formData.building] || 1;
      }

      // OPTIONAL FIELDS
      
      // Map doctors - keep as array of objects with doctor_id and doctor_name
      if (formData.doctor_ids && formData.doctor_ids.length > 0) {
        payload.doctors = formData.doctor_ids.map((doctorId, index) => ({
          doctor_id: Number(doctorId),
          doctor_name: formData.doctor_names?.[index] || "",
        }));
      }
      
      // Map employees - keep as array of objects with employee_id and employee_name
      if (formData.employee_ids && formData.employee_ids.length > 0) {
        payload.employees = formData.employee_ids.map((employeeId, index) => ({
          employee_id: Number(employeeId),
          employee_name: formData.employee_names?.[index] || "",
        }));
      }

      // OPTIONAL: Department targets
      if (formData.target_department_ids && formData.target_department_ids.length > 0) {
        payload.target_department_ids = formData.target_department_ids.map(id => Number(id));
      }
      
      // OPTIONAL: Worker type and explanation status
      if (formData.explanation_status_id && formData.explanation_status_id > 0) {
        payload.explanation_status_id = Number(formData.explanation_status_id);
      }

      // ⭐ ML Training fields (OPTIONAL)
      if (formData.classification_ar !== null && formData.classification_ar !== undefined) {
        payload.classification_ar = parseFloat(formData.classification_ar);
      }
      if (formData.classification_en !== null && formData.classification_en !== undefined) {
        payload.classification_en = Number(formData.classification_en);
      }
      
      // OPTIONAL: Feedback type and improvement type fields if provided
      if (formData.feedback_type && formData.feedback_type > 0) {
        payload.feedback_type = Number(formData.feedback_type);
      }
      if (formData.improvement_opportunity_type && formData.improvement_opportunity_type > 0) {
        payload.improvement_opportunity_type = Number(formData.improvement_opportunity_type);
      }

      // Submit to backend
      const response = await submitRecord(payload);

      console.log("Record added successfully:", response);

      // Show success message with record ID
      setSuccess(
        `✅ Record added successfully! Record ID: ${response.record_id || response.id}`
      );
      setError(null);
      setErrorField(null);

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          complaint_text: "",
          immediate_action: "",
          taken_action: "",
          feedback_received_date: new Date().toISOString().split("T")[0],
          issuing_department_id: null,
          target_department_ids: [],
          source_id: null,
          is_inpatient: true, // Reset to default: true
          building: null,
          worker_type: null,
          explanation_status_id: null,
          requires_explanation: false, // Reset to default: false
          patient_name: "",
          patient_admission_id: null,
          doctor_ids: [],
          doctor_names: [],
          employee_ids: [],
          employee_names: [],
          domain_id: null,
          category_id: null,
          subcategory_id: null,
          classification_id: null,
          severity_id: null,
          stage_id: null,
          harm_id: null,
          feedback_intent_type_id: null,
          clinical_risk_type_id: null,
          classification_ar: null,
          classification_en: null,
        });
        setSuccess(null);
        // Reset cascading dropdowns
        setCategories([]);
        setSubcategories([]);
        setClassifications([]);
        // Trigger NER component to clear selected entities
        setResetNER(prev => prev + 1);
      }, 3000);
    } catch (err) {
      // Handle error response format from backend
      const errorMessage = err.message_ar || err.message || "Error adding record. Please try again.";
      setError(errorMessage);
      if (err.field) {
        setErrorField(err.field);
      }
      console.error("Submit Error:", err);
      isSubmittingRef.current = false;
    } finally {
      setSubmitLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <h1 style={{ color: "#1a1e3f", marginBottom: "8px" }}>Insert New Record</h1>
        </Box>

        {/* Loading indicator */}
        {dataLoading && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: "8px",
              background: "#ffa726",
              color: "white",
              fontWeight: 600,
            }}
          >
            ⏳ Loading reference data...
          </Box>
        )}

        {/* Error and Success Messages */}
        {error && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: "8px",
              background: "#ff4757",
              color: "white",
              fontWeight: 600,
            }}
          >
            ❌ {error}
          </Box>
        )}
        {success && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: "8px",
              background: "#2ed573",
              color: "white",
              fontWeight: 600,
            }}
          >
            {success}
          </Box>
        )}

        {/* Step 1: Text Inputs */}
        <TextBlocksWithButtons
          complaintText={formData.complaint_text}
          additionalNotes={formData.immediate_action}
          optionalThirdText={formData.taken_action}
          onTextChange={(field, value) => {
            setFormData((prev) => ({
              ...prev,
              [field]: value,
            }));
          }}
          onTranscriptionComplete={handleTranscriptionComplete}
          validationErrors={validationErrors}
        />

        {/* Step 2: Metadata */}
        <RecordMetadata
          formData={formData}
          onInputChange={handleInputChange}
          referenceData={referenceData}
          errorField={errorField}
          validationErrors={validationErrors}
        />

        {/* Step 3: NER Outputs (always visible) */}
        <NEROutputs
          formData={formData}
          onInputChange={handleInputChange}
          onRunNER={async () => {
            const response = await handleRunNER();
            if (response) {
              if (response.patient) setFormData((prev) => ({ ...prev, patientQuery: response.patient }));
              if (response.doctor) setFormData((prev) => ({ ...prev, doctorQuery: response.doctor }));
              if (response.employee) setFormData((prev) => ({ ...prev, employeeQuery: response.employee }));
              if (response.department) setFormData((prev) => ({ ...prev, departmentQuery: response.department }));
            }
            return response;
          }}
          loading={nerLoading}
          errorField={errorField}
          referenceData={referenceData}
          resetTrigger={resetNER}
          validationErrors={validationErrors}
        />

        {/* Step 4: AI Classification & Severity Fields (merged Step 4 + 5) */}
        <ClassificationFields
          validationErrors={validationErrors}
          formData={formData}
          onInputChange={handleInputChange}
          referenceData={referenceData}
          categories={categories}
          subcategories={subcategories}
          classifications={classifications}
          errorField={errorField}
        />

        {/* Action Buttons */}
        <ActionButtons
          onExtract={async () => {
            try {
              setNerLoading(true);
              setError(null);
              setErrorField(null);
              setIsAiExtracting(true); // Prevent clearing during AI extraction
              isAiExtractingRef.current = true; // Immediate access for useEffect
              
              console.log("Starting NER extraction...");
              
              if (!formData.complaint_text || formData.complaint_text.trim().length === 0) {
                setError("Please enter complaint text first");
                setNerLoading(false);
                setIsAiExtracting(false);
                return;
              }
              
              // NER
              console.log("Calling extractNER with text:", formData.complaint_text);
              const nerResp = await extractNER(formData.complaint_text);
              console.log("NER Response:", nerResp);
              
              if (nerResp) {
                // Extract entities from nested structure
                const entities = nerResp.entities || {};
                
                // Take first patient name
                if (entities.patients && entities.patients.length > 0) {
                  const patientName = entities.patients[0];
                  console.log("Setting patientQuery to:", patientName);
                  handleInputChange("patientQuery", patientName);
                  setSuccess(`Found patient: ${patientName}`);
                }

                // Take first doctor name
                if (entities.doctors && entities.doctors.length > 0) {
                  const doctorName = entities.doctors[0];
                  console.log("Setting doctorQuery to:", doctorName);
                  handleInputChange("doctorQuery", doctorName);
                }

                // Take first employee name
                if (entities.employees && entities.employees.length > 0) {
                  const employeeName = entities.employees[0];
                  console.log("Setting employeeQuery to:", employeeName);
                  handleInputChange("employeeQuery", employeeName);
                }
                
                // Show success message with all found entities
                const foundNames = [];
                if (entities.patients && entities.patients.length > 0) foundNames.push(`Patient: ${entities.patients[0]}`);
                if (entities.doctors && entities.doctors.length > 0) foundNames.push(`Doctor: ${entities.doctors[0]}`);
                if (entities.employees && entities.employees.length > 0) foundNames.push(`Employee: ${entities.employees[0]}`);
                
                if (foundNames.length > 0) {
                  setSuccess(`NER extracted: ${foundNames.join(', ')}`);
                } else {
                  setSuccess("NER completed - no names found");
                }
              } else {
                setError("NER returned no data");
              }
              
              // Classification
              console.log("Calling classifyText with text:", formData.complaint_text);
              const classResp = await classifyText(formData.complaint_text);
              console.log("Classification Response (RAW):", JSON.stringify(classResp, null, 2));
              
              if (classResp) {
                console.log("Updating classification fields...");
                
                // Extract classifications from nested structure AND normalize text values to IDs
                const classificationsRaw = classResp.classifications || classResp;
                console.log("Classifications RAW - feedback_type_id:", classificationsRaw.feedback_type_id);
                console.log("Classifications RAW - improvement_opportunity_type_id:", classificationsRaw.improvement_opportunity_type_id);
                console.log("All response keys:", Object.keys(classificationsRaw || {}));
                const classifications = normalizeClassifications(classificationsRaw);
                
                console.log("🔴 After normalization - feedback_intent_type_id:", classifications.feedback_intent_type_id);
                console.log("🔴 After normalization - clinical_risk_type_id:", classifications.clinical_risk_type_id);
                
                // Show what fields were found
                const foundFields = [];
                if (classifications.domain_id) foundFields.push(`Domain: ${classifications.domain_id}`);
                if (classifications.category_id) foundFields.push(`Category: ${classifications.category_id}`);
                if (classifications.subcategory_id) foundFields.push(`Sub: ${classifications.subcategory_id}`);
                if (classifications.classification_id) foundFields.push(`Class: ${classifications.classification_id}`);
                if (classifications.severity_id) foundFields.push(`Severity: ${classifications.severity_id}`);
                if (classifications.stage_id) foundFields.push(`Stage: ${classifications.stage_id}`);
                if (classifications.harm_id) foundFields.push(`Harm: ${classifications.harm_id}`);
                if (classifications.feedback_intent_type_id) foundFields.push(`Feedback: ${classifications.feedback_intent_type_id}`);
                if (classifications.clinical_risk_type_id) foundFields.push(`Clinical Risk: ${classifications.clinical_risk_type_id}`);
                
                if (foundFields.length > 0) {
                  setSuccess(`Classifications: ${foundFields.join(', ')}`);
                } else {
                  setError(`Classification Response: ${JSON.stringify(classResp)} - No IDs found`);
                }
                
                // Set classification fields one by one with delays for cascading dropdowns
                const setClassificationFieldsSequentially = async () => {
                  console.log("Starting extraction...");
                  const debug = [];
                  
                  try {
                    debug.push("Setting domain_id: " + Number(classifications.domain_id));
                    debug.push("Setting category_id: " + Number(classifications.category_id));
                    debug.push("Setting subcategory_id: " + Number(classifications.subcategory_id));
                    debug.push("Setting classification_id: " + Number(classifications.classification_id));
                    debug.push("Setting severity_id: " + Number(classifications.severity_id));
                    debug.push("Setting stage_id: " + Number(classifications.stage_id));
                    debug.push("Setting harm_id: " + Number(classifications.harm_id));
                    debug.push("Setting feedback_intent_type_id: " + Number(classifications.feedback_intent_type_id));
                    debug.push("Setting clinical_risk_type_id: " + Number(classifications.clinical_risk_type_id));
                    
                    // STEP 1: Set domain and fetch categories
                    debug.push("STEP 1: Setting domain_id");
                    flushSync(() => {
                      setFormData((prev) => ({
                        ...prev,
                        domain_id: Number(classifications.domain_id),
                      }));
                    });
                    
                    const catsData = await fetchCategories(classifications.domain_id);
                    const normalizedCats = catsData.map(c => ({ ...c, id: Number(c.id) }));
                    
                    flushSync(() => {
                      setCategories(normalizedCats);
                    });
                    
                    // Wait for categories to render
                    debug.push("Waiting 150ms for categories to render...");
                    await new Promise(resolve => setTimeout(resolve, 150));
                    
                    // STEP 2: Set category, severity, stage, harm, and feedback/clinical types
                    debug.push("STEP 2: Setting category_id and other basic fields");
                    console.log("🔍 About to set feedback_intent_type_id:", classifications.feedback_intent_type_id, "Type:", typeof classifications.feedback_intent_type_id);
                    console.log("🔍 About to set clinical_risk_type_id:", classifications.clinical_risk_type_id, "Type:", typeof classifications.clinical_risk_type_id);
                    flushSync(() => {
                      setFormData((prev) => {
                        const updated = {
                          ...prev,
                          category_id: Number(classifications.category_id),
                          severity_id: Number(classifications.severity_id),
                          stage_id: Number(classifications.stage_id),
                          harm_id: Number(classifications.harm_id),
                          feedback_intent_type_id: Number(classifications.feedback_intent_type_id),
                          clinical_risk_type_id: Number(classifications.clinical_risk_type_id),
                        };
                        console.log("✅ After update - feedback_intent_type_id:", updated.feedback_intent_type_id);
                        console.log("✅ After update - clinical_risk_type_id:", updated.clinical_risk_type_id);
                        return updated;
                      });
                    });
                    console.log("✅ After setting - check formData state");
                    
                    // STEP 3: Fetch subcategories based on category
                    const subCatsData = await fetchSubcategories(classifications.category_id);
                    const normalizedSubCats = subCatsData.map(s => ({ ...s, id: Number(s.id) }));
                    
                    flushSync(() => {
                      setSubcategories(normalizedSubCats);
                    });
                    
                    // Wait for subcategories to render
                    debug.push("Waiting 150ms for subcategories to render...");
                    await new Promise(resolve => setTimeout(resolve, 150));
                    
                    // STEP 4: Set subcategory
                    debug.push("STEP 4: Setting subcategory_id");
                    flushSync(() => {
                      setFormData((prev) => ({
                        ...prev,
                        subcategory_id: Number(classifications.subcategory_id),
                      }));
                    });
                    
                    // STEP 5: Fetch classifications based on subcategory
                    const classData = await fetchClassifications(classifications.subcategory_id);
                    const normalizedClass = classData.map(c => ({ ...c, id: Number(c.id) }));
                    
                    flushSync(() => {
                      setClassifications(normalizedClass);
                    });
                    
                    // Wait for classifications to render
                    debug.push("Waiting 150ms for classifications to render...");
                    await new Promise(resolve => setTimeout(resolve, 150));
                    
                    // STEP 6: Set classification (final cascade)
                    debug.push("STEP 6: Setting classification_id");
                    flushSync(() => {
                      setFormData((prev) => ({
                        ...prev,
                        classification_id: Number(classifications.classification_id),
                      }));
                    });
                    
                    debug.push("All cascading dropdowns populated successfully");
                    setExtractionDebug(debug);
                    
                  } finally {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    flushSync(() => {
                      setIsAiExtracting(false);
                    });
                    isAiExtractingRef.current = false;
                    console.log("Extraction complete");
                  }
                };
                
                setClassificationFieldsSequentially();
              } else {
                setError("Classification returned no data");
              }
              
              setSuccess("NER + Classification completed!");
              setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
              console.error("Extract Error:", err);
              setError(`Error during NER + Classification: ${err.message}`);
              setTimeout(() => setError(null), 5000);
            } finally {
              setNerLoading(false);
              // Keep isAiExtracting true until complete
              // Will be set to false after setClassificationFieldsSequentially finishes
            }
          }}
          onAddRecord={handleAddRecord}
          loading={nerLoading || submitLoading}
          hasComplaintText={true}
          isFormValid={isFormValid}
        />
      </Container>
    </MainLayout>
  );
};

export default InsertRecord;
