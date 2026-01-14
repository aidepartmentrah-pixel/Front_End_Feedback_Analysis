// src/components/insert/NEROutputs.js
import React, { useState, useEffect, useRef } from "react";
import { Card, Typography, FormControl, FormLabel, Input, Grid, Button, Box, Chip, List, ListItem, ListItemButton, CircularProgress } from "@mui/joy";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { searchPatients, searchDoctors, searchEmployees } from "../../api/insertRecord";

// ...existing code...

const NEROutputs = ({ formData, onInputChange, onRunNER, loading, errorField, validationErrors = {}, referenceData, resetTrigger }) => {
// ...existing code...
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

  // Reset handler when form is successfully submitted
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger !== null) {
      console.log("NEROutputs: Resetting selected entities");
      setSelectedPatient(null);
      setSelectedDoctors([]);
      setSelectedEmployees([]);
      setPatientQuery("");
      setDoctorQuery("");
      setEmployeeQuery("");
      setPatientResults([]);
      setDoctorResults([]);
      setEmployeeResults([]);
    }
  }, [resetTrigger]);

  // Paste queries coming from parent formData without auto-selection
  useEffect(() => {
    if (typeof formData.patientQuery !== "undefined") {
      console.log("NEROutputs: Updating patientQuery to:", formData.patientQuery);
      setPatientQuery(formData.patientQuery || "");
      if (formData.patientQuery) {
        setShowPatientDropdown(true);
      }
    }
  }, [formData.patientQuery]);
  useEffect(() => {
    if (typeof formData.doctorQuery !== "undefined") {
      console.log("NEROutputs: Updating doctorQuery to:", formData.doctorQuery);
      setDoctorQuery(formData.doctorQuery || "");
      if (formData.doctorQuery) {
        setShowDoctorDropdown(true);
      }
    }
  }, [formData.doctorQuery]);
  useEffect(() => {
    if (typeof formData.employeeQuery !== "undefined") {
      console.log("NEROutputs: Updating employeeQuery to:", formData.employeeQuery);
      setEmployeeQuery(formData.employeeQuery || "");
      if (formData.employeeQuery) {
        setShowEmployeeDropdown(true);
      }
    }
  }, [formData.employeeQuery]);

  const handleRunExtract = async () => {
    try {
      const resp = await (onRunNER ? onRunNER() : null);
      if (resp) {
        if (resp.patient) setPatientQuery(resp.patient);
        if (resp.doctor) setDoctorQuery(resp.doctor);
        if (resp.employee) setEmployeeQuery(resp.employee);
        // Do not auto-select; let user choose from dropdown results
        setShowPatientDropdown(!!resp.patient);
        setShowDoctorDropdown(!!resp.doctor);
        setShowEmployeeDropdown(!!resp.employee);
      }
    } catch (e) {
      console.error("Error running NER extract:", e);
    }
  };
  
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
    onInputChange("patient_name", patient.full_name || patient.name || "");
    setPatientQuery("");
    setShowPatientDropdown(false);
  };
  
  // Handle remove patient
  const handleRemovePatient = () => {
    console.log("Removing patient");
    setSelectedPatient(null);
    onInputChange("patient_admission_id", null);
    onInputChange("patient_name", "");
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
        Extract patient and doctor names from the complaint text or search manually.
      </Typography>

      <Grid container spacing={2}>
        {/* Patient Search (Single Select) */}
        <Grid xs={12} sm={6}>
          <FormControl fullWidth error={!!validationErrors.patient_name}>
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
                    borderColor: (validationErrors.patient_name || errorField === "patient_admission_id") ? "#ff4757" : undefined,
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
                    ) : patientResults.length === 0 ? null : (
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
            {validationErrors.patient_name && (
              <Typography level="body-xs" sx={{ color: "#ff4757", mt: 0.5 }}>
                {validationErrors.patient_name}
              </Typography>
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
                  ) : doctorResults.length === 0 ? null : (
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
                  ) : employeeResults.length === 0 ? null : (
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
        {/* Run NER Button */}
        <Grid xs={12}></Grid>
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
