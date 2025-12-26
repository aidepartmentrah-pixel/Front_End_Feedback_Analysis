// src/components/dashboard/DepartmentSelector.js
import React from "react";
import { Box, Card, FormControl, FormLabel, Select, Option, Stack } from "@mui/joy";
import TuneIcon from "@mui/icons-material/Tune";

// Mock department hierarchy data
const mockDepartmentHierarchy = {
  Administration: [
    { id: "nursing", nameAr: "إدارة التمريضية", nameEn: "Nursing Administration" },
    { id: "medical", nameAr: "إدارة الطبية", nameEn: "Medical Administration" },
    { id: "support", nameAr: "إدارة الخدمات المساندة", nameEn: "Support Services" }
  ],
  Department: {
    nursing: [
      { id: "emergency_nursing", nameAr: "دائرة الطوارئ التمريضية", nameEn: "Emergency Nursing" },
      { id: "icu_nursing", nameAr: "دائرة العناية المركزة التمريضية", nameEn: "ICU Nursing" },
      { id: "ward_nursing", nameAr: "دائرة الأجنحة التمريضية", nameEn: "Ward Nursing" }
    ],
    medical: [
      { id: "surgery", nameAr: "دائرة الجراحة", nameEn: "Surgery Department" },
      { id: "internal", nameAr: "دائرة الباطنية", nameEn: "Internal Medicine" },
      { id: "pediatrics", nameAr: "دائرة الأطفال", nameEn: "Pediatrics" }
    ],
    support: [
      { id: "lab", nameAr: "دائرة المختبرات", nameEn: "Laboratory Services" },
      { id: "radiology", nameAr: "دائرة الأشعة", nameEn: "Radiology" },
      { id: "pharmacy", nameAr: "دائرة الصيدلية", nameEn: "Pharmacy" }
    ]
  },
  Section: {
    emergency_nursing: [
      { id: "er_triage", nameAr: "قسم الفرز", nameEn: "Triage Section" },
      { id: "er_trauma", nameAr: "قسم الإصابات", nameEn: "Trauma Section" }
    ],
    icu_nursing: [
      { id: "icu_adult", nameAr: "قسم العناية المركزة للبالغين", nameEn: "Adult ICU" },
      { id: "icu_peds", nameAr: "قسم العناية المركزة للأطفال", nameEn: "Pediatric ICU" }
    ],
    ward_nursing: [
      { id: "maternity", nameAr: "قسم التوليد والجراحة النسائية", nameEn: "Maternity & Gynecology" },
      { id: "general_ward", nameAr: "قسم الجراحة العامة", nameEn: "General Surgery Ward" }
    ],
    surgery: [
      { id: "general_surgery", nameAr: "قسم الجراحة العامة", nameEn: "General Surgery" },
      { id: "ortho", nameAr: "قسم جراحة العظام", nameEn: "Orthopedics" }
    ],
    internal: [
      { id: "cardiology", nameAr: "قسم القلب", nameEn: "Cardiology" },
      { id: "nephrology", nameAr: "قسم الكلى", nameEn: "Nephrology" }
    ],
    pediatrics: [
      { id: "nicu", nameAr: "قسم حديثي الولادة", nameEn: "NICU" },
      { id: "peds_general", nameAr: "قسم الأطفال العام", nameEn: "General Pediatrics" }
    ],
    lab: [
      { id: "hematology", nameAr: "قسم أمراض الدم", nameEn: "Hematology" },
      { id: "microbiology", nameAr: "قسم الأحياء الدقيقة", nameEn: "Microbiology" }
    ],
    radiology: [
      { id: "ct", nameAr: "قسم الأشعة المقطعية", nameEn: "CT Scan" },
      { id: "mri", nameAr: "قسم الرنين المغناطيسي", nameEn: "MRI" }
    ],
    pharmacy: [
      { id: "inpatient_pharm", nameAr: "قسم صيدلية المرضى الداخليين", nameEn: "Inpatient Pharmacy" },
      { id: "outpatient_pharm", nameAr: "قسم صيدلية المرضى الخارجيين", nameEn: "Outpatient Pharmacy" }
    ]
  }
};

const DepartmentSelector = ({ 
  scope, 
  setScope, 
  selectedAdministration, 
  setSelectedAdministration,
  selectedDepartment,
  setSelectedDepartment,
  selectedSection,
  setSelectedSection,
  hierarchy // 👈 Receive real hierarchy from parent
}) => {
  // Use real hierarchy or fallback to mock
  const departmentHierarchy = hierarchy || mockDepartmentHierarchy;
  
  // Debug logging
  React.useEffect(() => {
    if (hierarchy) {
      console.log("🏢 DepartmentSelector received hierarchy:", hierarchy);
      console.log("🏢 Available administrations:", departmentHierarchy.Administration);
    }
  }, [hierarchy, departmentHierarchy.Administration]);

  // Handle scope change - reset all dependent selections
  const handleScopeChange = (value) => {
    setScope(value);
    setSelectedAdministration(null);
    setSelectedDepartment(null);
    setSelectedSection(null);
  };

  // Handle administration change - reset department and section
  const handleAdministrationChange = (value) => {
    // Find the full object from hierarchy
    const administrations = departmentHierarchy.Administration || [];
    console.log("🔍 Looking for admin with ID:", value, "in", administrations);
    
    const adminObj = administrations.find(a => {
      // Try both strict and loose comparison in case of type mismatch
      return a.id === value || String(a.id) === String(value) || Number(a.id) === Number(value);
    });
    
    console.log("🏢 Administration selected - ID:", value, "Object:", adminObj);
    setSelectedAdministration(adminObj || null);
    setSelectedDepartment(null);
    setSelectedSection(null);
  };

  // Handle department change - reset section
  const handleDepartmentChange = (value) => {
    // Find the full object from hierarchy
    const deptObj = getAvailableDepartments().find(d => d.id === value);
    setSelectedDepartment(deptObj || null);
    setSelectedSection(null);
  };

  // Handle section change
  const handleSectionChange = (value) => {
    // Find the full object from hierarchy
    const sectionObj = getAvailableSections().find(s => s.id === value);
    setSelectedSection(sectionObj || null);
  };

  // Get available departments based on selected administration
  const getAvailableDepartments = () => {
    if (!selectedAdministration) return [];
    const adminId = typeof selectedAdministration === 'object' ? selectedAdministration.id : selectedAdministration;
    return departmentHierarchy.Department?.[adminId] || [];
  };

  // Get available sections based on selected department
  const getAvailableSections = () => {
    if (!selectedDepartment) return [];
    const deptId = typeof selectedDepartment === 'object' ? selectedDepartment.id : selectedDepartment;
    return departmentHierarchy.Section?.[deptId] || [];
  };

  return (
    <Card
      sx={{
        p: 3,
        mb: 3,
        background: "linear-gradient(135deg, #f5f7ff 0%, #fff 100%)",
        border: "2px solid rgba(102, 126, 234, 0.2)",
      }}
    >
      <Stack spacing={2}>
        {/* Step 1: Select Scope Level */}
        <FormControl>
          <FormLabel sx={{ fontWeight: 700, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
            <TuneIcon sx={{ fontSize: 20, color: "#667eea" }} />
            Select Dashboard Scope
          </FormLabel>
          <Select
            value={scope}
            onChange={(e, value) => handleScopeChange(value)}
            sx={{ fontWeight: 600 }}
          >
            <Option value="hospital">🏥 All Hospital (المستشفى)</Option>
            <Option value="administration">🏢 Administration (إدارة)</Option>
            <Option value="department">🏛️ Department (دائرة)</Option>
            <Option value="section">📋 Section (قسم)</Option>
          </Select>
        </FormControl>

        {/* Step 2: Select Entity (Dynamic based on scope) */}
        {scope === "administration" && (
          <FormControl>
            <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
              Select Administration
            </FormLabel>
            <Select
              value={selectedAdministration?.id || null}
              onChange={(e, value) => handleAdministrationChange(value)}
              placeholder="اختر الإدارة..."
              sx={{ fontWeight: 600 }}
            >
              {(departmentHierarchy.Administration || []).map((idara) => (
                <Option key={idara.id} value={idara.id}>
                  {idara.nameAr} ({idara.nameEn})
                </Option>
              ))}
            </Select>
          </FormControl>
        )}

        {scope === "department" && (
          <>
            <FormControl>
              <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
                Select Administration First
              </FormLabel>
              <Select
                value={selectedAdministration?.id || null}
                onChange={(e, value) => handleAdministrationChange(value)}
                placeholder="اختر الإدارة..."
                sx={{ fontWeight: 600 }}
              >
                {(departmentHierarchy.Administration || []).map((idara) => (
                  <Option key={idara.id} value={idara.id}>
                    {idara.nameAr} ({idara.nameEn})
                  </Option>
                ))}
              </Select>
            </FormControl>

            {selectedAdministration && (
              <FormControl>
                <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
                  Select Department
                </FormLabel>
                <Select
                  value={selectedDepartment?.id || null}
                  onChange={(e, value) => handleDepartmentChange(value)}
                  placeholder="اختر الدائرة..."
                  sx={{ fontWeight: 600 }}
                >
                  {getAvailableDepartments().map((dayra) => (
                    <Option key={dayra.id} value={dayra.id}>
                      {dayra.nameAr} ({dayra.nameEn})
                    </Option>
                  ))}
                </Select>
              </FormControl>
            )}
          </>
        )}

        {scope === "section" && (
          <>
            <FormControl>
              <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
                Select Administration First
              </FormLabel>
              <Select
                value={selectedAdministration?.id || null}
                onChange={(e, value) => handleAdministrationChange(value)}
                placeholder="اختر الإدارة..."
                sx={{ fontWeight: 600 }}
              >
                {(departmentHierarchy.Administration || []).map((idara) => (
                  <Option key={idara.id} value={idara.id}>
                    {idara.nameAr} ({idara.nameEn})
                  </Option>
                ))}
              </Select>
            </FormControl>

            {selectedAdministration && (
              <FormControl>
                <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
                  Select Department
                </FormLabel>
                <Select
                  value={selectedDepartment?.id || null}
                  onChange={(e, value) => handleDepartmentChange(value)}
                  placeholder="اختر الدائرة..."
                  sx={{ fontWeight: 600 }}
                >
                  {getAvailableDepartments().map((dayra) => (
                    <Option key={dayra.id} value={dayra.id}>
                      {dayra.nameAr} ({dayra.nameEn})
                    </Option>
                  ))}
                </Select>
              </FormControl>
            )}

            {selectedDepartment && (
              <FormControl>
                <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
                  Select Section
                </FormLabel>
                <Select
                  value={selectedSection?.id || null}
                  onChange={(e, value) => handleSectionChange(value)}
                  placeholder="اختر القسم..."
                  sx={{ fontWeight: 600 }}
                >
                  {getAvailableSections().map((qism) => (
                    <Option key={qism.id} value={qism.id}>
                      {qism.nameAr} ({qism.nameEn})
                    </Option>
                  ))}
                </Select>
              </FormControl>
            )}
          </>
        )}
      </Stack>
    </Card>
  );
};

export default DepartmentSelector;
export { mockDepartmentHierarchy };
