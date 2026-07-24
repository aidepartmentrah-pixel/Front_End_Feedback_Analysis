// src/components/doctorHistory/DoctorProfileCard.js
import React from "react";
import { Box, Typography, Chip } from "@mui/joy";
import BadgeIcon from "@mui/icons-material/Badge";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import theme from "../../theme";

const DoctorProfileCard = ({ doctor }) => {
  // doctors_db.get_doctor_profile returns snake_case keys (id, name_en,
  // name_ar, specialty, status...). Doctors sourced from the hospital
  // directory have no "department" or "hire date" concept in this data
  // model, so those are intentionally not shown here rather than rendered
  // as permanently-blank fields.
  const nameEn = doctor.name_en || doctor.nameEn;
  const nameAr = doctor.name_ar || doctor.nameAr;
  const doctorId = doctor.id ?? doctor.doctor_id ?? doctor.employeeId;

  return (
    <Box
      sx={{
        mb: 3,
        p: 3,
        borderRadius: theme.radius.lg,
        background: theme.gradients.primary,
        color: "white",
        boxShadow: theme.shadows.card,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
          }}
        >
          👨‍⚕️
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography level="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            {nameEn || "Unknown Doctor"}
          </Typography>
          {nameAr && (
            <Typography level="body-md" sx={{ opacity: 0.9, dir: "rtl" }}>
              {nameAr}
            </Typography>
          )}
        </Box>

        <Chip
          variant="soft"
          sx={{
            background: "rgba(255, 255, 255, 0.2)",
            color: "white",
            fontWeight: 700,
          }}
        >
          {doctor.status === "active" ? "✅ Active" : "⏸️ Inactive"}
        </Chip>
      </Box>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <BadgeIcon sx={{ fontSize: 20, opacity: 0.9 }} />
          <Typography level="body-sm" sx={{ opacity: 0.9 }}>
            ID: {doctorId ?? "N/A"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LocalHospitalIcon sx={{ fontSize: 20, opacity: 0.9 }} />
          <Typography level="body-sm" sx={{ opacity: 0.9 }}>
            {doctor.specialty || "Specialty not available"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DoctorProfileCard;
