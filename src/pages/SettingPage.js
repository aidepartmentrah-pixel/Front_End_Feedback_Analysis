// src/pages/SettingPage.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Tabs, TabList, Tab, TabPanel, Alert, Card, Table, Button, Input, Select, Option, CircularProgress, Chip, Modal, ModalDialog, ModalClose, DialogTitle, DialogContent, DialogActions, FormControl, FormLabel, Divider } from "@mui/joy";
import theme from '../theme';
import MainLayout from "../components/common/MainLayout";
import DepartmentTable from "../components/settings/DepartmentTable";
import AddDepartmentForm from "../components/settings/AddDepartmentForm";
import DoctorTable from "../components/settings/DoctorTable";
import AddDoctorForm from "../components/settings/AddDoctorForm";
import PatientTable from "../components/settings/PatientTable";
import AddPatientForm from "../components/settings/AddPatientForm";
import PolicyConfiguration from "../components/settings/PolicyConfiguration";
import Training from "../components/settings/Training";
import UnifiedUsersTab from "./settings/UnifiedUsersTab";
import SectionCreationPanel from "../components/settings/SectionCreationPanel"; // PHASE C — Production Section Creation Tool
import ClassificationManagement from "../components/settings/ClassificationManagement";
import ImportTab from "../components/settings/ImportTab";
import ReportHeaderConfig from "../components/settings/ReportHeaderConfig";
import RcaSuggestionsTab from "../components/settings/RcaSuggestionsTab";
import ForceClosePolicyTab from "../components/settings/ForceClosePolicyTab";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { canRoleSeeSettingsTab, SETTINGS_TAB_KEYS } from "../security/roleVisibilityMap";

const SettingPage = () => {
  // Auth context for role checking
  const { user } = useAuth();
  
  // Helper to get primary role from user
  const getPrimaryRole = (user) => {
    if (!user || !user.roles || user.roles.length === 0) return null;
    return user.roles[0];
  };
  
  // Get primary role for visibility checks
  const primaryRole = getPrimaryRole(user);
  
  // Define all available tabs with their keys
  const allTabs = useMemo(() => [
    {
      key: SETTINGS_TAB_KEYS.DEPARTMENTS,
      label: "🏥 Departments",
      component: 0
    },
    {
      key: SETTINGS_TAB_KEYS.DOCTORS,
      label: "👨‍⚕️ Doctors",
      component: 1
    },
    {
      key: SETTINGS_TAB_KEYS.PATIENTS,
      label: "🧑‍🤝‍🧑 Patients",
      component: 2
    },
    {
      key: SETTINGS_TAB_KEYS.POLICY,
      label: "📋 Policy Configuration",
      component: 4
    },
    {
      key: SETTINGS_TAB_KEYS.TRAINING,
      label: "🚦 Training",
      component: 5
    },
    {
      key: SETTINGS_TAB_KEYS.USERS,
      label: "👥 Users Management",
      component: 6
    },
    {
      key: SETTINGS_TAB_KEYS.CLASSIFICATION_MANAGEMENT,
      label: "🏷️ Classification Management",
      component: 7
    },
    {
      key: SETTINGS_TAB_KEYS.DATA_IMPORT,
      label: "📥 Data Import",
      component: 8
    },
    {
      key: SETTINGS_TAB_KEYS.REPORT_CONFIG,
      label: "📄 Report Configuration",
      component: 9
    },
    {
      key: SETTINGS_TAB_KEYS.RCA_SUGGESTIONS,
      label: "🔍 RCA Suggestions",
      component: 10
    },
    {
      key: SETTINGS_TAB_KEYS.FORCE_CLOSE_POLICY,
      label: "⏰ Force Close Policy",
      component: 11
    },
  ], []);
  
  // Filter tabs based on role visibility
  const visibleTabs = useMemo(() => {
    if (!primaryRole) return [];
    return allTabs.filter(tab => canRoleSeeSettingsTab(primaryRole, tab.key));
  }, [primaryRole, allTabs]);

  // Grouped tab navigation definition
  const TAB_GROUPS = useMemo(() => [
    {
      label: "Core Data",
      keys: [
        SETTINGS_TAB_KEYS.DEPARTMENTS,
        SETTINGS_TAB_KEYS.DOCTORS,
        SETTINGS_TAB_KEYS.PATIENTS,
        SETTINGS_TAB_KEYS.CLASSIFICATION_MANAGEMENT,
      ],
    },
    {
      label: "Governance",
      keys: [
        SETTINGS_TAB_KEYS.POLICY,
        SETTINGS_TAB_KEYS.FORCE_CLOSE_POLICY,
        SETTINGS_TAB_KEYS.REPORT_CONFIG,
        SETTINGS_TAB_KEYS.RCA_SUGGESTIONS,
      ],
    },
    {
      label: "System",
      keys: [
        SETTINGS_TAB_KEYS.TRAINING,
        SETTINGS_TAB_KEYS.USERS,
        SETTINGS_TAB_KEYS.DATA_IMPORT,
      ],
    },
  ], []);

  // State Management
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Section management state
  const [sections, setSections] = useState([]);
  const [deptOptions, setDeptOptions] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [sectionsError, setSectionsError] = useState(null);
  const [sectionSearch, setSectionSearch] = useState("");
  const [editingSection, setEditingSection] = useState(null); // {section_id, name, department_id}
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  const fetchSectionData = useCallback(async () => {
    setSectionsLoading(true);
    setSectionsError(null);
    try {
      const [sResp, dResp] = await Promise.all([
        fetch("/api/settings/sections", { credentials: "include" }),
        fetch("/api/settings/sections/departments", { credentials: "include" }),
      ]);
      if (sResp.ok) { const d = await sResp.json(); setSections(d.sections || []); }
      else setSectionsError("Failed to load sections.");
      if (dResp.ok) { const d = await dResp.json(); setDeptOptions(d.departments || []); }
    } catch (e) {
      setSectionsError("Network error loading sections.");
    } finally {
      setSectionsLoading(false);
    }
  }, []);

  const handleSaveSection = async () => {
    if (!editingSection || !editingSection.name.trim()) return;
    setEditSaving(true);
    setEditError(null);
    try {
      const resp = await fetch(`/api/settings/sections/${editingSection.section_id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingSection.name.trim(), parent_id: editingSection.department_id || null }),
      });
      const data = await resp.json();
      if (!resp.ok) { setEditError(data?.detail?.message || data?.message || "Save failed."); return; }
      setEditingSection(null);
      await fetchSectionData();
      setSuccess("Section updated successfully.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setEditError("Network error.");
    } finally {
      setEditSaving(false);
    }
  };

  // Load sections when the Departments tab (component 0) is active
  useEffect(() => {
    const deptTab = visibleTabs.find(t => t.component === 0);
    if (deptTab && activeTab === visibleTabs.indexOf(deptTab)) {
      fetchSectionData();
    }
  }, [activeTab, visibleTabs, fetchSectionData]);

  // Also load sections on mount if Departments tab is visible
  useEffect(() => {
    if (visibleTabs.some(t => t.component === 0)) {
      fetchSectionData();
    }
  }, [visibleTabs, fetchSectionData]);

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch doctors on mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Fetch patients on mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // Fetch departments from API
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getDepartments();
      setDepartments(response.data || []);
    } catch (err) {
      setError("Failed to fetch departments. Please try again.");
      console.error("Error fetching departments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Edit department
  const handleEditDepartment = async (id, updatedData) => {
    try {
      setError(null);
      const response = await api.updateDepartment(id, updatedData);
      setDepartments(
        departments.map((dept) => (dept.id === id ? response.data : dept))
      );
      setSuccess("Department updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update department");
      console.error("Error updating department:", err);
      return false;
    }
  };

  // Delete department
  const handleDeleteDepartment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) {
      return;
    }
    try {
      setError(null);
      await api.deleteDepartment(id);
      setDepartments(departments.filter((dept) => dept.id !== id));
      setSuccess("Department deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete department");
      console.error("Error deleting department:", err);
    }
  };

  // Add new department
  const handleAddDepartment = async (newDepartment) => {
    try {
      setError(null);
      const response = await api.addDepartment(newDepartment);
      
      // Handle success response from API
      if (response.success || response.data) {
        // Refresh departments list to get updated data
        await fetchDepartments();
        setSuccess(response.message || "Department added successfully!");
        setTimeout(() => setSuccess(null), 3000);
        return true;
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to add department";
      setError(errorMsg);
      console.error("Error adding department:", err);
      return false;
    }
  };

  // Fetch doctors from API (reserve doctors only)
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getDoctors();
      // Response structure: { doctors: [], total: number, message: string }
      setDoctors(response.doctors || []);
    } catch (err) {
      setError("Failed to fetch reserve doctors. Please try again.");
      console.error("Error fetching reserve doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add new doctor
  const handleAddDoctor = async (newDoctor) => {
    try {
      setError(null);
      const response = await api.addDoctor(newDoctor);
      
      // Handle success response from API
      if (response.success) {
        // Refresh doctors list to get updated data
        await fetchDoctors();
        setSuccess(response.message || "Doctor added successfully!");
        setTimeout(() => setSuccess(null), 3000);
        return true;
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to add doctor";
      setError(errorMsg);
      console.error("Error adding doctor:", err);
      return false;
    }
  };

  // Edit doctor
  const handleEditDoctor = async (id, updatedData) => {
    try {
      setError(null);
      const response = await api.updateDoctor(id, updatedData);
      setDoctors(
        doctors.map((doc) => (doc.id === id ? response.data : doc))
      );
      setSuccess("Doctor updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update doctor");
      console.error("Error updating doctor:", err);
      return false;
    }
  };

  // Delete doctor
  const handleDeleteDoctor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) {
      return;
    }
    try {
      setError(null);
      await api.deleteDoctor(id);
      setDoctors(doctors.filter((doc) => doc.id !== id));
      setSuccess("Doctor deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete doctor");
      console.error("Error deleting doctor:", err);
    }
  };

  // Fetch patients from API (reserve patients only)
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getPatients(100, 0, "created_at");
      // Response structure: { patients: [], total: number, count: number }
      setPatients(response.patients || []);
      setTotalPatients(response.total || 0);
    } catch (err) {
      setError("Failed to fetch reserve patients. Please try again.");
      console.error("Error fetching reserve patients:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add new patient
  const handleAddPatient = async (newPatient) => {
    try {
      setError(null);
      const response = await api.addPatient(newPatient);
      
      // Handle success response from API
      if (response.success) {
        // Refresh patients list to get updated data
        await fetchPatients();
        setSuccess(response.message || "Patient added successfully!");
        setTimeout(() => setSuccess(null), 3000);
        return true;
      }
    } catch (err) {
      // Handle different error types from backend
      let errorMsg = "Failed to add patient";
      
      if (err.code === "VALIDATION_ERROR") {
        errorMsg = err.message || "Validation error occurred";
      } else if (err.code === "DUPLICATE_PATIENT") {
        errorMsg = err.message || "Patient already exists";
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      console.error("Error adding patient:", err);
      return false;
    }
  };

  // Edit patient
  const handleEditPatient = async (id, updatedData) => {
    try {
      setError(null);
      const response = await api.updatePatient(id, updatedData);
      setPatients(
        patients.map((patient) => (patient.patient_admission_id === id ? response.data : patient))
      );
      setSuccess("Patient updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update patient");
      console.error("Error updating patient:", err);
      return false;
    }
  };

  // Delete patient
  const handleDeletePatient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) {
      return;
    }
    try {
      setError(null);
      await api.deletePatient(id);
      setPatients(patients.filter((patient) => patient.patient_admission_id !== id));
      setTotalPatients(totalPatients - 1);
      setSuccess("Patient deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete patient");
      console.error("Error deleting patient:", err);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchDepartments();
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            level="h2"
            sx={{
              fontWeight: 800,
              background: theme.gradients.primary,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            ⚙️ Settings
          </Typography>
          <Typography level="body-md" sx={{ color: "#666" }}>
            Manage departments and system configuration
          </Typography>
        </Box>

      {/* Alerts */}
      {error && (
        <Alert color="danger" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert color="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Grouped Tab Navigation */}
      <Card
        variant="outlined"
        sx={{
          mb: 2,
          p: 0,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(31, 111, 115, 0.08)',
          border: '1.5px solid rgba(44, 166, 164, 0.28)',
          fontFamily: theme.settings.fontFamily,
        }}
      >
        {TAB_GROUPS.map((group, groupIdx) => {
          const groupTabs = visibleTabs.filter(t => group.keys.includes(t.key));
          if (groupTabs.length === 0) return null;
          const isLastVisible = !TAB_GROUPS.slice(groupIdx + 1).some(g =>
            visibleTabs.some(t => g.keys.includes(t.key))
          );
          return (
            <Box
              key={group.label}
              sx={{
                display: 'flex',
                alignItems: 'stretch',
                background: 'rgba(44, 166, 164, 0.13)',
                borderLeft: '4px solid #2CA6A4',
                borderBottom: isLastVisible ? 'none' : '1px solid rgba(44, 166, 164, 0.15)',
              }}
            >
              {/* Label column — own teal cell */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2.5,
                  py: 1.75,
                  minWidth: 150,
                  background: 'rgba(44, 166, 164, 0.18)',
                  flexShrink: 0,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: theme.settings.fontFamily,
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: '#1F6F73',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {group.label}
                </Typography>
              </Box>
              {/* Divider */}
              <Box sx={{ width: '1px', bgcolor: 'rgba(44, 166, 164, 0.30)', flexShrink: 0 }} />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', px: 2.5, py: 1.75, flex: 1 }}>
                {groupTabs.map((tab) => {
                  const tabIndex = visibleTabs.indexOf(tab);
                  const isActive = activeTab === tabIndex;
                  return (
                    <Box
                      key={tab.key}
                      onClick={() => setActiveTab(tabIndex)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2.25,
                        py: 0.875,
                        borderRadius: '8px',
                        border: isActive
                          ? '2px solid #1F6F73'
                          : '1.5px solid rgba(44, 166, 164, 0.22)',
                        background: isActive
                          ? '#1F6F73'
                          : 'rgba(44, 166, 164, 0.06)',
                        color: isActive ? '#ffffff' : '#1F6F73',
                        fontFamily: theme.settings.fontFamily,
                        fontSize: '1.2rem',
                        fontWeight: isActive ? 700 : 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        userSelect: 'none',
                        transition: 'all 0.15s ease',
                        boxShadow: isActive
                          ? '0 2px 10px rgba(31, 111, 115, 0.35)'
                          : 'none',
                        '&:hover': {
                          background: isActive
                            ? '#164E51'
                            : 'rgba(44, 166, 164, 0.15)',
                          borderColor: '#2CA6A4',
                          color: isActive ? '#ffffff' : '#1F6F73',
                          boxShadow: '0 2px 8px rgba(31, 111, 115, 0.20)',
                        },
                      }}
                    >
                      {tab.label}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Card>

      {/* Tab Content */}
      <Tabs value={activeTab}>
        {/* No TabList — navigation handled by grouped nav above */}

        {/* Render TabPanels for visible tabs only */}
        {visibleTabs.map((tab, index) => {
          // Departments Tab (also contains Section Management)
          if (tab.component === 0) {
            const filteredSections = sections.filter(s =>
              !sectionSearch || s.section_name.toLowerCase().includes(sectionSearch.toLowerCase()) ||
              (s.department_name || "").toLowerCase().includes(sectionSearch.toLowerCase())
            );
            return (
              <TabPanel key={`panel-${tab.key}-${index}`} value={index} sx={{ p: 3, background: `linear-gradient(135deg, ${theme.colors.primaryLighter} 0%, ${theme.colors.surface} 100%)`, border: `1.5px solid ${theme.colors.primary}33`, borderRadius: '12px' }}>
                <Box sx={{ display: "grid", gap: 3 }}>
                  {/* Department Table */}
                  <DepartmentTable
                    departments={departments}
                    onEdit={handleEditDepartment}
                    onDelete={handleDeleteDepartment}
                    loading={loading}
                  />

                  {/* PHASE C — F-C8 — Role Guard — Section Creation restricted to SOFTWARE_ADMIN */}
                  {primaryRole === 'SOFTWARE_ADMIN' && (
                    <Box sx={{ mt: 3 }}>
                      <SectionCreationPanel />
                    </Box>
                  )}

                  {/* Section Management — inline under Departments */}
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 3 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Typography level="h4" fontWeight={700} sx={{ fontFamily: theme.settings.fontFamily }}>Section Management</Typography>
                      <Button size="sm" variant="soft" onClick={fetchSectionData} loading={sectionsLoading}>Refresh</Button>
                    </Box>
                    <Typography level="body-sm" sx={{ mb: 2, color: theme.colors.textSecondary, fontFamily: theme.settings.fontFamily }}>
                      Rename sections and reassign them to different departments. Historical records are not affected.
                    </Typography>

                    {sectionsError && <Alert color="danger" sx={{ mb: 2 }}>{sectionsError}</Alert>}

                    <Input
                      placeholder="Search sections or departments…"
                      value={sectionSearch}
                      onChange={e => setSectionSearch(e.target.value)}
                      sx={{ mb: 2, maxWidth: 400 }}
                      size="sm"
                    />

                    {sectionsLoading ? (
                      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <Card variant="outlined" sx={{ overflow: "auto" }}>
                        <Table stickyHeader>
                          <thead>
                            <tr>
                              <th>Section Name</th>
                              <th>Department</th>
                              <th>Administration</th>
                              <th style={{ width: 100 }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredSections.length === 0 ? (
                              <tr><td colSpan={4} style={{ textAlign: "center", padding: 24, color: theme.colors.textTertiary }}>No sections found.</td></tr>
                            ) : filteredSections.map(s => (
                              <tr key={s.section_id}>
                                <td><Typography level="body-sm" fontWeight={600}>{s.section_name}</Typography></td>
                                <td><Typography level="body-sm">{s.department_name || "—"}</Typography></td>
                                <td><Typography level="body-sm" sx={{ color: theme.colors.textTertiary }}>{s.administration_name || "—"}</Typography></td>
                                <td>
                                  <Button
                                    size="sm"
                                    variant="plain"
                                    color="primary"
                                    onClick={() => setEditingSection({ section_id: s.section_id, name: s.section_name, department_id: s.department_id })}
                                  >
                                    Edit
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Card>
                    )}

                    {/* Edit Modal */}
                    <Modal
                      open={!!editingSection}
                      onClose={() => { setEditingSection(null); setEditError(null); }}
                      sx={{ zIndex: 3000, backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.55)' }}
                    >
                      <ModalDialog sx={{ width: { xs: '95vw', sm: '560px' }, maxWidth: '600px', boxShadow: '0 12px 40px rgba(0,0,0,0.25)' }}>
                        <ModalClose />
                        <DialogTitle sx={{ fontSize: '1.1rem', fontWeight: 700, pr: 4 }}>Edit Section</DialogTitle>
                        <Divider sx={{ my: 1 }} />
                        <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2.5 }}>
                          {editError && <Alert color="danger">{editError}</Alert>}
                          <FormControl required>
                            <FormLabel>Section Name</FormLabel>
                            <Input
                              value={editingSection?.name || ""}
                              onChange={e => setEditingSection(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Section name…"
                              sx={{ fontSize: '1rem' }}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Reassign to Department (optional)</FormLabel>
                            <Select
                              value={editingSection?.department_id || ""}
                              onChange={(_, v) => setEditingSection(prev => ({ ...prev, department_id: v || null }))}
                              placeholder="Keep current department"
                            >
                              <Option value="">— Keep current —</Option>
                              {deptOptions.map(d => (
                                <Option key={d.department_id} value={d.department_id}>
                                  {d.department_name}{d.administration_name ? ` (${d.administration_name})` : ""}
                                </Option>
                              ))}
                            </Select>
                            <Typography level="body-xs" sx={{ color: theme.colors.textTertiary, mt: 0.5 }}>
                              Only select if you want to move this section to a different department.
                            </Typography>
                          </FormControl>
                        </DialogContent>
                        <DialogActions sx={{ pt: 1.5 }}>
                          <Button variant="solid" color="primary" onClick={handleSaveSection} loading={editSaving} disabled={!editingSection?.name?.trim()}>
                            Save
                          </Button>
                          <Button variant="plain" color="neutral" onClick={() => { setEditingSection(null); setEditError(null); }} disabled={editSaving}>
                            Cancel
                          </Button>
                        </DialogActions>
                      </ModalDialog>
                    </Modal>
                  </Box>
                </Box>
              </TabPanel>
            );
          }
          
          // Doctors Tab
          if (tab.component === 1) {
            return (
              <TabPanel key={`panel-${tab.key}-${index}`} value={index} sx={{ p: 3, background: `linear-gradient(135deg, ${theme.colors.primaryLighter} 0%, ${theme.colors.surface} 100%)`, border: `1.5px solid ${theme.colors.primary}33`, borderRadius: '12px' }}>
                <Box sx={{ display: "grid", gap: 3 }}>
                  {/* Add Doctor Form */}
                  <AddDoctorForm onAdd={handleAddDoctor} />

                  {/* Doctor Table */}
                  <DoctorTable
                    doctors={doctors}
                    onEdit={handleEditDoctor}
                    onDelete={handleDeleteDoctor}
                    loading={loading}
                  />
                </Box>
              </TabPanel>
            );
          }
          
          // Patients Tab
          if (tab.component === 2) {
            return (
              <TabPanel key={`panel-${tab.key}-${index}`} value={index} sx={{ p: 3, background: `linear-gradient(135deg, ${theme.colors.primaryLighter} 0%, ${theme.colors.surface} 100%)`, border: `1.5px solid ${theme.colors.primary}33`, borderRadius: '12px' }}>
                <Box sx={{ display: "grid", gap: 3 }}>
                  {/* Add Patient Form */}
                  <AddPatientForm onAdd={handleAddPatient} />

                  {/* Patient Table */}
                  <PatientTable
                    patients={patients}
                    onEdit={handleEditPatient}
                    onDelete={handleDeletePatient}
                    loading={loading}
                    totalCount={totalPatients}
                  />
                </Box>
              </TabPanel>
            );
          }
          
          // Policy Configuration Tab
          if (tab.component === 4) {
            return (
              <TabPanel key={`panel-${tab.key}-${index}`} value={index} sx={{ p: 3, background: `linear-gradient(135deg, ${theme.colors.primaryLighter} 0%, ${theme.colors.surface} 100%)`, border: `1.5px solid ${theme.colors.primary}33`, borderRadius: '12px' }}>
                <PolicyConfiguration />
              </TabPanel>
            );
          }
          
          // Training Tab
          if (tab.component === 5) {
            return (
              <TabPanel key={`panel-${tab.key}-${index}`} value={index} sx={{ p: 3 }}>
                <Training />
              </TabPanel>
            );
          }
          
          // Unified Users Management Tab
          if (tab.component === 6) {
            return (
              <TabPanel key={`panel-${tab.key}-${index}`} value={index} sx={{ p: 3, background: `linear-gradient(135deg, ${theme.colors.primaryLighter} 0%, ${theme.colors.surface} 100%)`, border: `1.5px solid ${theme.colors.primary}33`, borderRadius: '12px' }}>
                <UnifiedUsersTab />
              </TabPanel>
            );
          }

          // Classification Management Tab
          if (tab.component === 7) {
            return (
              <TabPanel key={`panel-${tab.key}-${index}`} value={index} sx={{ p: 3, background: `linear-gradient(135deg, ${theme.colors.primaryLighter} 0%, ${theme.colors.surface} 100%)`, border: `1.5px solid ${theme.colors.primary}33`, borderRadius: '12px' }}>
                <ClassificationManagement />
              </TabPanel>
            );
          }

          // Data Import Tab
          if (tab.component === 8) {
            return (
              <TabPanel key={`panel-${tab.key}-${index}`} value={index} sx={{ p: 3, background: `linear-gradient(135deg, ${theme.colors.primaryLighter} 0%, ${theme.colors.surface} 100%)`, border: `1.5px solid ${theme.colors.primary}33`, borderRadius: '12px' }}>
                <ImportTab />
              </TabPanel>
            );
          }

          // Report Configuration Tab
          if (tab.component === 9) {
            return (
              <TabPanel key={`panel-${tab.key}-${index}`} value={index} sx={{ p: 3, background: `linear-gradient(135deg, ${theme.colors.primaryLighter} 0%, ${theme.colors.surface} 100%)`, border: `1.5px solid ${theme.colors.primary}33`, borderRadius: '12px' }}>
                <ReportHeaderConfig />
              </TabPanel>
            );
          }

          // RCA Suggestions Tab
          if (tab.component === 10) {
            return (
              <TabPanel key={`panel-${tab.key}-${index}`} value={index} sx={{ p: 0, background: `linear-gradient(135deg, ${theme.colors.primaryLighter} 0%, ${theme.colors.surface} 100%)`, border: `1.5px solid ${theme.colors.primary}33`, borderRadius: '12px', overflow: 'hidden' }}>
                <RcaSuggestionsTab />
              </TabPanel>
            );
          }

          // Automatic Force Close Policy Tab (HCAT Session 6)
          if (tab.component === 11) {
            return (
              <TabPanel key={`panel-${tab.key}-${index}`} value={index} sx={{ p: 3, background: `linear-gradient(135deg, ${theme.colors.primaryLighter} 0%, ${theme.colors.surface} 100%)`, border: `1.5px solid ${theme.colors.primary}33`, borderRadius: '12px' }}>
                <ForceClosePolicyTab />
              </TabPanel>
            );
          }

          return null;
        })}
      </Tabs>
      </Box>
    </MainLayout>
  );
};

export default SettingPage;