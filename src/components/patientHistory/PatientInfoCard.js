// src/components/patientHistory/PatientInfoCard.js
// Phase R-P — Normalized field names: full_name, patient_id, total_incidents, profile_picture
import React from "react";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import WcIcon from "@mui/icons-material/Wc";
import CakeIcon from "@mui/icons-material/Cake";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import PersonProfileCard from "../common/PersonProfileCard";

const PatientInfoCard = ({ patient }) => {
  // The V2 profile contract returns PascalCase keys (PatientID, PatientName,
  // Age, Gender, TotalIncidents...) -- see patient_directory_service.py's
  // _patient_to_profile_shape. MRN/Phone/Email/RegistrationDate are always
  // null/empty from the Hospital Directory API (not part of its Patient
  // schema), so they're intentionally not shown here rather than rendered
  // as permanently-blank fields.
  const name = patient.PatientNameEnglish || patient.PatientName || "Unknown Patient";
  const age = patient.Age;

  return (
    <PersonProfileCard
      icon={<PersonIcon />}
      name={name}
      fields={[
        { icon: <BadgeIcon fontSize="small" />, label: "Patient ID", value: patient.PatientID },
        { icon: <CakeIcon fontSize="small" />, label: "Age", value: age != null ? `${age} years` : null },
        { icon: <WcIcon fontSize="small" />, label: "Gender", value: patient.Gender },
        { icon: <ReportProblemIcon fontSize="small" />, label: "Total Incidents", value: patient.TotalIncidents ?? 0 },
      ]}
    />
  );
};

export default PatientInfoCard;
