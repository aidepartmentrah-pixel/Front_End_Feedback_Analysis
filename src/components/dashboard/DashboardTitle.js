// src/components/dashboard/DashboardTitle.js
import React from "react";
import { Typography } from "@mui/joy";
import { mockDepartmentHierarchy } from "./DepartmentSelector";

const DashboardTitle = ({ 
  scope, 
  selectedAdministration, 
  selectedDepartment, 
  selectedSection,
  hierarchy // 👈 Receive real hierarchy from parent
}) => {
  // Use real hierarchy or fallback to mock
  const departmentHierarchy = hierarchy || mockDepartmentHierarchy;

  // Helper to get entity name by ID
  const getEntityName = (type, id) => {
    if (!id) return null;

    if (type === "administration") {
      const entity = (departmentHierarchy.Administration || []).find((i) => i.id === id);
      return entity ? entity.nameEn : null;
    }

    if (type === "department") {
      for (const key in (departmentHierarchy.Department || {})) {
        const entity = departmentHierarchy.Department[key].find((d) => d.id === id);
        if (entity) return entity.nameEn;
      }
      return null;
    }

    if (type === "section") {
      for (const key in (departmentHierarchy.Section || {})) {
        const entity = departmentHierarchy.Section[key].find((q) => q.id === id);
        if (entity) return entity.nameEn;
      }
      return null;
    }

    return null;
  };

  // Determine title based on scope and selections
  const getTitle = () => {
    if (scope === "hospital") {
      return "Hospital";
    } else if (scope === "administration" && selectedAdministration) {
      return getEntityName("administration", selectedAdministration);
    } else if (scope === "department" && selectedDepartment) {
      return getEntityName("department", selectedDepartment);
    } else if (scope === "section" && selectedSection) {
      return getEntityName("section", selectedSection);
    }
    return "Hospital";
  };

  return (
    <Typography
      level="h3"
      sx={{
        mb: 3,
        fontWeight: 700,
        color: "#1F6F73"
      }}
    >
      Dashboard — {getTitle()}
    </Typography>
  );
};

export default DashboardTitle;
