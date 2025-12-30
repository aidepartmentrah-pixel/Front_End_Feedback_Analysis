// src/components/insert/NEROutputs.js
import React, { useState, useEffect, useRef } from "react";
import { Card, Typography, FormControl, FormLabel, Input, Grid, Button, Box, Chip, List, ListItem, ListItemButton, CircularProgress } from "@mui/joy";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { searchPatients, searchDoctors, searchEmployees } from "../../api/insertRecord";

// Helper to normalize department display name
const getDepartmentDisplayName = (dept) => {
  return dept?.name || dept?.label || dept?.department_name || dept?.name_en || dept?.name_ar || dept?.department_name_en || dept?.department_name_ar || `Department ${dept?.id}`;
};

const NEROutputs = ({ formData, onInputChange, onRunNER, loading, errorField, referenceData }) => {
      // Department search states
      const [departmentQuery, setDepartmentQuery] = useState("");
      const [departmentResults, setDepartmentResults] = useState([]);
      const [departmentLoading, setDepartmentLoading] = useState(false);
      const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
      const departmentTimerRef = useRef(null);

      // Selected departments (for chip display)
      const [selectedDepartments, setSelectedDepartments] = useState([]);
    // Search departments with debounce
    useEffect(() => {
      if (departmentTimerRef.current) {
        clearTimeout(departmentTimerRef.current);
      }
      if (departmentQuery.length >= 1) {
        setDepartmentLoading(true);
        setShowDepartmentDropdown(true);
        departmentTimerRef.current = setTimeout(() => {
          // Filter referenceData.departments by query
          if (referenceData?.departments && Array.isArray(referenceData.departments)) {
            const results = referenceData.departments.filter((dept) => {
              const displayName = getDepartmentDisplayName(dept);
              return displayName.toLowerCase().includes(departmentQuery.toLowerCase());
            });
            setDepartmentResults(results);
          } else {
            setDepartmentResults([]);
          }
          setDepartmentLoading(false);
        }, 400);
      } else {
        setDepartmentResults([]);
        setShowDepartmentDropdown(false);
      }
      return () => {
        if (departmentTimerRef.current) {
          clearTimeout(departmentTimerRef.current);
        }
      };
    }, [departmentQuery, referenceData]);

    // Handle department selection
    const handleSelectDepartment = (dept) => {
      if (!formData.target_department_ids.includes(dept.id)) {
        const newDepartments = [...selectedDepartments, dept];
        const newDeptIds = [...formData.target_department_ids, dept.id];
        setSelectedDepartments(newDepartments);
        onInputChange("target_department_ids", newDeptIds);
      }
      setDepartmentQuery("");
      setShowDepartmentDropdown(false);
    };

    // Handle remove department
    const handleRemoveDepartment = (deptId) => {
      const newDepartments = selectedDepartments.filter((d) => d.id !== deptId);
      const newDeptIds = formData.target_department_ids.filter((id) => id !== deptId);
      setSelectedDepartments(newDepartments);
      onInputChange("target_department_ids", newDeptIds);
    };
  // Search states
  const [patientQuery, setPatientQuery] = useState("");
  const [doctorQuery, setDoctorQuery] = useState("");
  const [employeeQuery, setEmployeeQuery] = useState("");
  
  // Results states
  const [patientResults, setPatientResults] = useState([]);
  const [doctorResults, setDoctorResults] = useState([]);
  const [employeeResults, setEmployeeResults] = useState([]);
  
  // Loading states
  const [patientLoading, setPatientLoading] = useState(false);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  
  // Selected entities (for display)
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  
  // Dropdown visibility
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  
  // Debounce timers
  const patientTimerRef = useRef(null);
  const doctorTimerRef = useRef(null);
  const employeeTimerRef = useRef(null);
  
  // Search patients with debounce
  useEffect(() => {
    if (patientTimerRef.current) {
      clearTimeout(patientTimerRef.current);
    }
    
    if (patientQuery.length >= 1) {
      setPatientLoading(true);
      setShowPatientDropdown(true);
      
      patientTimerRef.current = setTimeout(async () => {
        try {
          const results = await searchPatients(patientQuery);
          setPatientResults(results);
        } catch (error) {
          console.error("Error searching patients:", error);
          setPatientResults([]);
        } finally {
          setPatientLoading(false);
        }
      }, 400);
    } else {
      setPatientResults([]);
      setShowPatientDropdown(false);
    }
    
    return () => {
      if (patientTimerRef.current) {
        clearTimeout(patientTimerRef.current);
      }
    };
  }, [patientQuery]);
  
  // Search doctors with debounce
  useEffect(() => {
    if (doctorTimerRef.current) {
      clearTimeout(doctorTimerRef.current);
    }
    
    if (doctorQuery.length >= 1) {
      setDoctorLoading(true);
      setShowDoctorDropdown(true);
      
      doctorTimerRef.current = setTimeout(async () => {
        try {
          const results = await searchDoctors(doctorQuery);
          console.log("Doctor search results:", results);
          if (results.length > 0) {
            console.log("First doctor:", results[0]);
          }
          setDoctorResults(results);
        } catch (error) {
          console.error("Error searching doctors:", error);
          setDoctorResults([]);
        } finally {
          setDoctorLoading(false);
        }
      }, 400);
    } else {
      setDoctorResults([]);
      setShowDoctorDropdown(false);
    }
    
    return () => {
      if (doctorTimerRef.current) {
        clearTimeout(doctorTimerRef.current);
      }
    };
  }, [doctorQuery]);
  
  // Search employees with debounce
  useEffect(() => {
    if (employeeTimerRef.current) {
      clearTimeout(employeeTimerRef.current);
    }
    
    if (employeeQuery.length >= 1) {
      setEmployeeLoading(true);
      setShowEmployeeDropdown(true);
      
      employeeTimerRef.current = setTimeout(async () => {
        try {
          const results = await searchEmployees(employeeQuery);
          console.log("Employee search results:", results);
          if (results.length > 0) {
            console.log("First employee:", results[0]);
          }
          setEmployeeResults(results);
        } catch (error) {
          console.error("Error searching employees:", error);
          setEmployeeResults([]);
        } finally {
          setEmployeeLoading(false);
        }
      }, 400);
    } else {
      setEmployeeResults([]);
      setShowEmployeeDropdown(false);
    }
    
    return () => {
      if (employeeTimerRef.current) {
        clearTimeout(employeeTimerRef.current);
      }
    };
  }, [employeeQuery]);
  
  // Handle patient selection
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    onInputChange("patient_admission_id", patient.patient_admission_id);
    setPatientQuery("");
    setShowPatientDropdown(false);
  };
  
  // Handle remove patient
  const handleRemovePatient = () => {
    console.log("Removing patient");
    setSelectedPatient(null);
    onInputChange("patient_admission_id", null);
  };
  
  // Handle doctor selection
  const handleSelectDoctor = (doctor) => {
    console.log("Selected doctor:", doctor);
    if (!formData.doctor_ids.includes(doctor.doctor_id)) {
      const newDoctors = [...selectedDoctors, doctor];
      const newDoctorIds = [...formData.doctor_ids, doctor.doctor_id];
      setSelectedDoctors(newDoctors);
      onInputChange("doctor_ids", newDoctorIds);
    }
    setDoctorQuery("");
    setShowDoctorDropdown(false);
  };
  
  // Handle remove doctor
  const handleRemoveDoctor = (doctorId) => {
    console.log("Removing doctor:", doctorId);
    const newDoctors = selectedDoctors.filter(d => d.doctor_id !== doctorId);
    const newDoctorIds = formData.doctor_ids.filter(id => id !== doctorId);
    console.log("New doctors:", newDoctors);
    console.log("New doctor IDs:", newDoctorIds);
    setSelectedDoctors(newDoctors);
    onInputChange("doctor_ids", newDoctorIds);
  };
  
  // Handle employee selection
  const handleSelectEmployee = (employee) => {
    console.log("Selected employee:", employee);
    if (!formData.employee_ids.includes(employee.employee_id)) {
      const newEmployees = [...selectedEmployees, employee];
      const newEmployeeIds = [...formData.employee_ids, employee.employee_id];
      setSelectedEmployees(newEmployees);
      onInputChange("employee_ids", newEmployeeIds);
    }
    setEmployeeQuery("");
    setShowEmployeeDropdown(false);
  };
  
  // Handle remove employee
  const handleRemoveEmployee = (employeeId) => {
    console.log("Removing employee:", employeeId);
    const newEmployees = selectedEmployees.filter(e => e.employee_id !== employeeId);
    const newEmployeeIds = formData.employee_ids.filter(id => id !== employeeId);
    console.log("New employees:", newEmployees);
    console.log("New employee IDs:", newEmployeeIds);
    setSelectedEmployees(newEmployees);
    onInputChange("employee_ids", newEmployeeIds);
  };

  return (
    <Card
      sx={{
        mb: 3,
        p: 3,
        background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
        border: "2px solid #4caf50",
        boxShadow: "0 4px 12px rgba(76, 175, 80, 0.1)",
      }}
    >
      <Typography level="h3" sx={{ color: "#2d5016", fontWeight: 700, mb: 2 }}>
        Step 3: Named Entity Recognition (NER)
      </Typography>

      <Typography level="body-sm" sx={{ color: "#558b2f", mb: 2 }}>
        Extract patient and doctor names from the complaint text. Click "Run NER Extraction" or search manually.
      </Typography>

      <Grid container spacing={2}>
        {/* Patient Search (Single Select) */}
        <Grid xs={12} sm={6}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              👤 Patient Name (Required) *
            </FormLabel>
            
            {/* Selected Patient Display */}
            {selectedPatient && (
              <Box sx={{ mb: 1 }}>
                <Chip
                  variant="soft"
                  color="success"
                  endDecorator={
                    <CloseIcon
                      sx={{ 
                        fontSize: 18, 
                        cursor: "pointer", 
                        ml: 0.5,
                        pointerEvents: "auto",
                        '&:hover': { color: "error.main" }
                      }}
                      onClick={(e) => {
                        console.log("===== PATIENT CLOSE BUTTON CLICKED =====");
                        handleRemovePatient();
                        return false;
                      }}
                    />
                  }
                  sx={{ fontWeight: 600, pointerEvents: "auto" }}
                >
                  {selectedPatient.full_name} ({selectedPatient.document_number} | {selectedPatient.medical_file_number})
                </Chip>
              </Box>
            )}
            
            {/* Search Input */}
            {!selectedPatient && (
              <Box sx={{ position: "relative" }}>
                <Input
                  type="text"
                  placeholder="ابحث عن مريض..."
                  value={patientQuery}
                  onChange={(e) => setPatientQuery(e.target.value)}
                  onFocus={() => patientQuery.length >= 1 && setShowPatientDropdown(true)}
                  startDecorator={<SearchIcon />}
                  endDecorator={patientLoading && <CircularProgress size="sm" />}
                  slotProps={{
                    input: { 
                      style: { borderRadius: "8px" },
                      dir: "rtl"
                    },
                  }}
                  sx={{
                    borderColor: errorField === "patient_admission_id" ? "#ff4757" : undefined,
                  }}
                />
                
                {/* Dropdown Results */}
                {showPatientDropdown && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      mt: 0.5,
                      maxHeight: 250,
                      overflowY: "auto",
                      backgroundColor: "white",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    {patientLoading ? (
                      <Box sx={{ p: 2, textAlign: "center" }}>
                        <CircularProgress size="sm" />
                      </Box>
                    ) : patientResults.length === 0 ? (
                      <Box sx={{ p: 2, textAlign: "center", color: "#999" }}>
                        لا توجد نتائج
                      </Box>
                    ) : (
                      <List>
                        {patientResults.map((patient) => (
                          <ListItem key={patient.patient_admission_id}>
                            <ListItemButton
                              onClick={() => handleSelectPatient(patient)}
                              sx={{ 
                                borderRadius: "4px",
                                "&:hover": { backgroundColor: "#f0f0f0" }
                              }}
                            >
                              <Typography level="body-sm" sx={{ dir: "rtl" }}>
                                {patient.full_name} ({patient.document_number} | {patient.medical_file_number})
                              </Typography>
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </FormControl>
        </Grid>

        {/* Doctor Search (Multi-Select) */}
        <Grid xs={12} sm={6}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              👨‍⚕️ Doctor Names (Multiple)
            </FormLabel>
            
            {/* Selected Doctors Display */}
            {selectedDoctors.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                {selectedDoctors.map((doctor) => {
                  const name = doctor.full_name || doctor.name || doctor.doctor_name || `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim() || `Doctor ${doctor.doctor_id}`;
                  const specialty = doctor.specialty_name || doctor.specialty || doctor.speciality_name || doctor.department || doctor.department_name || doctor.qism_name || doctor.specialty_name_ar || doctor.specialty_arabic || doctor.specialization || "لا يوجد تخصص";
                  const displayText = `${name} - ${specialty}`;
                  return (
                    <Chip
                      key={doctor.doctor_id}
                      variant="soft"
                      color="primary"
                      endDecorator={
                        <CloseIcon
                          sx={{ 
                            fontSize: 18, 
                            cursor: "pointer", 
                            ml: 0.5,
                            pointerEvents: "auto",
                            '&:hover': { color: "error.main" }
                          }}
                          onClick={(e) => {
                            console.log("===== DOCTOR CLOSE BUTTON CLICKED =====", doctor.doctor_id);
                            handleRemoveDoctor(doctor.doctor_id);
                            return false;
                          }}
                        />
                      }
                      sx={{ fontWeight: 600, pointerEvents: "auto" }}
                    >
                      {displayText}
                    </Chip>
                  );
                })}
              </Box>
            )}
            
            {/* Search Input */}
            <Box sx={{ position: "relative" }}>
              <Input
                type="text"
                placeholder="ابحث عن طبيب..."
                value={doctorQuery}
                onChange={(e) => setDoctorQuery(e.target.value)}
                onFocus={() => doctorQuery.length >= 1 && setShowDoctorDropdown(true)}
                startDecorator={<SearchIcon />}
                endDecorator={doctorLoading && <CircularProgress size="sm" />}
                slotProps={{
                  input: { 
                    style: { borderRadius: "8px" },
                    dir: "rtl"
                  },
                }}
              />
              
              {/* Dropdown Results */}
              {showDoctorDropdown && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    mt: 0.5,
                    maxHeight: 250,
                    overflowY: "auto",
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {doctorLoading ? (
                    <Box sx={{ p: 2, textAlign: "center" }}>
                      <CircularProgress size="sm" />
                    </Box>
                  ) : doctorResults.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: "center", color: "#999" }}>
                      لا توجد نتائج
                    </Box>
                  ) : (
                    <List>
                      {doctorResults.map((doctor) => {
                        console.log("Doctor object keys:", Object.keys(doctor));
                        console.log("Doctor full object:", doctor);
                        const name = doctor.full_name || doctor.name || doctor.doctor_name || `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim() || `Doctor ${doctor.doctor_id}`;
                        const specialty = doctor.specialty_name || doctor.specialty || doctor.speciality_name || doctor.department || doctor.department_name || doctor.qism_name || doctor.specialty_name_ar || doctor.specialty_arabic || doctor.specialization || "لا يوجد تخصص";
                        const displayText = `د. ${name} - ${specialty}`;
                        return (
                          <ListItem key={doctor.doctor_id}>
                            <ListItemButton
                              onClick={() => handleSelectDoctor(doctor)}
                              sx={{ 
                                borderRadius: "4px",
                                "&:hover": { backgroundColor: "#f0f0f0" }
                              }}
                            >
                              <Typography level="body-sm" sx={{ dir: "rtl" }}>
                                {displayText}
                              </Typography>
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  )}
                </Box>
              )}
            </Box>
          </FormControl>
        </Grid>

        {/* Employee Search (Multi-Select) */}
        <Grid xs={12} sm={6}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              👔 Employee Names (Multiple)
            </FormLabel>
            
            {/* Selected Employees Display */}
            {selectedEmployees.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                {selectedEmployees.map((employee) => {
                  const name = employee.full_name || employee.name || employee.employee_name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || `Employee ${employee.employee_id}`;
                  const jobTitle = employee.job_title || employee.position || employee.role || "";
                  const displayText = jobTitle ? `${name} - ${jobTitle}` : name;
                  return (
                    <Chip
                      key={employee.employee_id}
                      variant="soft"
                      color="warning"
                      endDecorator={
                        <CloseIcon
                          sx={{ 
                            fontSize: 18, 
                            cursor: "pointer", 
                            ml: 0.5,
                            pointerEvents: "auto",
                            '&:hover': { color: "error.main" }
                          }}
                          onClick={(e) => {
                            console.log("===== EMPLOYEE CLOSE BUTTON CLICKED =====", employee.employee_id);
                            handleRemoveEmployee(employee.employee_id);
                            return false;
                          }}
                        />
                      }
                      sx={{ fontWeight: 600, pointerEvents: "auto" }}
                    >
                      {displayText}
                    </Chip>
                  );
                })}
              </Box>
            )}
            
            {/* Search Input */}
            <Box sx={{ position: "relative" }}>
              <Input
                type="text"
                placeholder="ابحث عن موظف..."
                value={employeeQuery}
                onChange={(e) => setEmployeeQuery(e.target.value)}
                onFocus={() => employeeQuery.length >= 1 && setShowEmployeeDropdown(true)}
                startDecorator={<SearchIcon />}
                endDecorator={employeeLoading && <CircularProgress size="sm" />}
                slotProps={{
                  input: { 
                    style: { borderRadius: "8px" },
                    dir: "rtl"
                  },
                }}
              />
              
              {/* Dropdown Results */}
              {showEmployeeDropdown && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    mt: 0.5,
                    maxHeight: 250,
                    overflowY: "auto",
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {employeeLoading ? (
                    <Box sx={{ p: 2, textAlign: "center" }}>
                      <CircularProgress size="sm" />
                    </Box>
                  ) : employeeResults.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: "center", color: "#999" }}>
                      لا توجد نتائج
                    </Box>
                  ) : (
                    <List>
                      {employeeResults.map((employee) => {
                        const name = employee.full_name || employee.name || employee.employee_name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || `Employee ${employee.employee_id}`;
                        const jobTitle = employee.job_title || employee.position || employee.role || "";
                        const displayText = jobTitle ? `${name} - ${jobTitle}` : name;
                        return (
                          <ListItem key={employee.employee_id}>
                            <ListItemButton
                              onClick={() => handleSelectEmployee(employee)}
                              sx={{ 
                                borderRadius: "4px",
                                "&:hover": { backgroundColor: "#f0f0f0" }
                              }}
                            >
                              <Typography level="body-sm" sx={{ dir: "rtl" }}>
                                {displayText}
                              </Typography>
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  )}
                </Box>
              )}
            </Box>
          </FormControl>
        </Grid>

        {/* Department Search (Multi-Select) */}

        {/* Target Departments (Multi Select) */}
          <Grid xs={12} sm={6} md={6}>
            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
                🏥 Target Departments (Multiple)
              </FormLabel>

              <Select
                multiple
                value={formData.target_department_ids || []}
                placeholder="Select target departments"
                onChange={(event, values) =>
                  onInputChange("target_department_ids", values)
                }
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((deptId) => {
                      const dept = referenceData?.departments?.find(
                        (d) => d.id === deptId
                      );

                      const displayName =
                        dept?.name ||
                        dept?.label ||
                        dept?.department_name ||
                        dept?.name_en ||
                        dept?.name_ar ||
                        `Department ${deptId}`;

                      return (
                        <Chip key={deptId} variant="soft" color="info">
                          {displayName}
                        </Chip>
                      );
                    })}
                  </Box>
                )}
                slotProps={{
                  listbox: {
                    sx: {
                      maxHeight: 300,
                      overflowY: "auto",
                    },
                  },
                }}
              >
                {(referenceData?.departments || []).map((dept) => {
                  const displayName =
                    dept.name ||
                    dept.label ||
                    dept.department_name ||
                    dept.name_en ||
                    dept.name_ar;

                  return (
                    <Option key={dept.id} value={dept.id}>
                      {displayName}
                    </Option>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>

        {/* Run NER Button */}
        <Grid xs={12}>
          <Button
            variant="solid"
            color="success"
            size="lg"
            startDecorator={<PlayArrowIcon />}
            onClick={async () => {
              const extractedNames = await onRunNER();
              if (extractedNames) {
                // Populate search boxes with extracted names
                if (extractedNames.patient) {
                  setPatientQuery(extractedNames.patient);
                }
                if (extractedNames.doctor) {
                  setDoctorQuery(extractedNames.doctor);
                }
                if (extractedNames.employee) {
                  setEmployeeQuery(extractedNames.employee);
                }
                if (extractedNames.department) {
                  setDepartmentQuery(extractedNames.department);
                }
              }
            }}
            loading={loading}
            disabled={!formData.complaint_text || formData.complaint_text.trim().length === 0}
            sx={{
              fontWeight: 600,
              fontSize: "14px",
              px: 3,
              py: 1.5,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
              },
            }}
          >
            {loading ? "Extracting Entities..." : "🤖 Run NER Extraction (Auto-fill Names)"}
          </Button>
        </Grid>
      </Grid>

      <Typography
        level="body-xs"
        sx={{
          mt: 2,
          color: "#558b2f",
          fontStyle: "italic",
        }}
      >
        ✏️ NER can auto-extract names from the complaint text, or you can search and select manually.
      </Typography>
    </Card>
  );
};

export default NEROutputs;
