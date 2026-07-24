// src/components/doctorHistory/DoctorProfileCard.js
import React from "react";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BadgeIcon from "@mui/icons-material/Badge";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PersonProfileCard from "../common/PersonProfileCard";

const DoctorProfileCard = ({ doctor, metrics = [] }) => {
  // doctors_db.get_doctor_profile returns snake_case keys (id, name_en,
  // name_ar, specialty, status...). Doctors sourced from the hospital
  // directory have no "department" or "hire date" concept in this data
  // model, so those are intentionally not shown here rather than rendered
  // as permanently-blank fields.
  const nameEn = doctor.name_en || doctor.nameEn;
  const nameAr = doctor.name_ar || doctor.nameAr;
  const doctorId = doctor.id ?? doctor.doctor_id ?? doctor.employeeId;

  return (
    <PersonProfileCard
      icon={<LocalHospitalIcon />}
      name={nameEn || "Unknown Doctor"}
      secondaryName={nameAr}
      statusLabel={doctor.status === "active" ? "Active" : "Inactive"}
      statusColor={doctor.status === "active" ? "success" : "neutral"}
      fields={[
        { icon: <BadgeIcon fontSize="small" />, label: "Doctor ID", value: doctorId },
        { icon: <MedicalServicesIcon fontSize="small" />, label: "Specialty", value: doctor.specialty },
      ]}
      metrics={metrics}
    />
  );
};

export default DoctorProfileCard;
