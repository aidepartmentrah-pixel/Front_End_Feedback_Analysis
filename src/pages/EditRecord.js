// src/pages/EditRecord.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Box, Container, Typography, Divider, CircularProgress, Card, Alert } from "@mui/joy";
import { useNavigate, useParams } from "react-router-dom";
import { Warning } from "@mui/icons-material";

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
  fetchClassifications
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

          // Map target_departments array to IDs using department_id field
          const targetDeptIds = Array.isArray(record.target_departments)
            ? record.target_departments.map(dept => dept.department_id).filter(Boolean)
            : [];
          
          console.log("📋 Mapped target department IDs:", targetDeptIds);

          // Map doctors array
          const doctorsList = Array.isArray(record.doctors)
            ? record.doctors.map(doc => ({
                doctor_id: doc.id || doc.doctor_id,
                doctor_name: doc.name || doc.doctor_name
              }))
            : [];

          // Map building_id to building name (RAH/BCI)
          let buildingName = null;
          if (record.building_id === 1) buildingName = "RAH";
          else if (record.building_id === 2) buildingName = "BCI";
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
            is_inpatient: record.is_inpatient,
            explanation_status_id: record.explanation_status_id || null,
            case_status_id: record.case_status_id || 1,
          };
          
          setFormData(initialFormData);
          setHasChanges(false);
          
          // ✅ Validate loaded record
          const initialValidation = validateIncidentCase(initialFormData);
          setRecordValidation(initialValidation);
          
          if (!initialValidation.isValid) {
            console.warn("⚠️ Loaded record is incomplete:", initialValidation.errors);
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
        ? originalRecord.doctors.map(doc => ({
            doctor_id: doc.id || doc.doctor_id,
            doctor_name: doc.name || doc.doctor_name
          }))
        : [];

      let buildingName = null;
      if (originalRecord.building_id === 1) buildingName = "RAH";
      else if (originalRecord.building_id === 2) buildingName = "BCI";
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
        is_inpatient: originalRecord.is_inpatient,
        explanation_status_id: originalRecord.explanation_status_id || null,
        case_status_id: originalRecord.case_status_id || 1,
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
            <CircularProgress size="lg" sx={{ "--CircularProgress-color": "#667eea" }} />
            <Typography level="body-md" sx={{ mt: 2, color: "#667eea", fontWeight: 600 }}>
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

            {/* Row 4: Action Buttons */}
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
