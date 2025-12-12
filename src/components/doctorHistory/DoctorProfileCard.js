// src/components/doctorHistory/DoctorProfileCard.js
import React from "react";
import { Box, Typography, Chip } from "@mui/joy";
import BadgeIcon from "@mui/icons-material/Badge";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const DoctorProfileCard = ({ doctor }) => {
  return (
    <Box
      sx={{
        mb: 3,
        p: 3,
        borderRadius: "8px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
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
            {doctor.nameEn}
          </Typography>
          <Typography level="body-md" sx={{ opacity: 0.9, dir: "rtl" }}>
            {doctor.nameAr}
          </Typography>
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
            ID: {doctor.employeeId}
          </Typography>
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LocalHospitalIcon sx={{ fontSize: 20, opacity: 0.9 }} />
          <Typography level="body-sm" sx={{ opacity: 0.9 }}>
            {doctor.department} - {doctor.specialty}
          </Typography>
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarMonthIcon sx={{ fontSize: 20, opacity: 0.9 }} />
          <Typography level="body-sm" sx={{ opacity: 0.9 }}>
            Active since: {doctor.hireDate}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DoctorProfileCard;
