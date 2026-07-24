// src/components/patientHistory/PatientInfoCard.js
// Phase R-P — Normalized field names: full_name, patient_id, total_incidents, profile_picture
import React from "react";
import { Box, Card, Typography, Avatar, Grid } from "@mui/joy";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import WcIcon from "@mui/icons-material/Wc";
import CakeIcon from "@mui/icons-material/Cake";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import theme from "../../theme";

const PatientInfoCard = ({ patient }) => {
  // The V2 profile contract returns PascalCase keys (PatientID, PatientName,
  // Age, Gender, TotalIncidents...) -- see patient_directory_service.py's
  // _patient_to_profile_shape. MRN/Phone/Email/RegistrationDate are always
  // null/empty from the Hospital Directory API (not part of its Patient
  // schema), so they're intentionally not shown here rather than rendered
  // as permanently-blank fields.
  const name = patient.PatientNameEnglish || patient.PatientName || "Unknown Patient";
  const patientId = patient.PatientID;
  const age = patient.Age;
  const gender = patient.Gender;
  const totalIncidents = patient.TotalIncidents ?? 0;

  return (
    <Card
      sx={{
        p: 3,
        background: theme.gradients.primary,
        color: "white",
        boxShadow: theme.shadows.card,
        borderRadius: theme.radius.lg,
        border: "none",
      }}
    >
      <Grid container spacing={3} alignItems="center">
        {/* Profile Picture */}
        <Grid xs={12} md={2}>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                background: "rgba(255, 255, 255, 0.2)",
                border: "4px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <PersonIcon sx={{ fontSize: 60 }} />
            </Avatar>
          </Box>
        </Grid>

        {/* Patient Info */}
        <Grid xs={12} md={7}>
          <Typography
            level="h3"
            sx={{ fontWeight: 800, mb: 2, color: "white" }}
          >
            {name}
          </Typography>

          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <BadgeIcon sx={{ fontSize: 18, opacity: 0.9 }} />
                <Typography level="body-sm" sx={{ opacity: 0.9 }}>
                  Patient ID:
                </Typography>
                <Typography level="body-md" sx={{ fontWeight: 600 }}>
                  {patientId}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CakeIcon sx={{ fontSize: 18, opacity: 0.9 }} />
                <Typography level="body-sm" sx={{ opacity: 0.9 }}>
                  Age:
                </Typography>
                <Typography level="body-md" sx={{ fontWeight: 600 }}>
                  {age != null ? `${age} years` : "Not available"}
                </Typography>
              </Box>
            </Grid>

            <Grid xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WcIcon sx={{ fontSize: 18, opacity: 0.9 }} />
                <Typography level="body-sm" sx={{ opacity: 0.9 }}>
                  Gender:
                </Typography>
                <Typography level="body-md" sx={{ fontWeight: 600 }}>
                  {gender || "Not available"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>

        {/* Total Incidents */}
        <Grid xs={12} md={3}>
          <Box
            sx={{
              textAlign: "center",
              p: 3,
              borderRadius: theme.radius.lg,
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <ReportProblemIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
            <Typography level="h2" sx={{ fontWeight: 800, mb: 0.5 }}>
              {totalIncidents}
            </Typography>
            <Typography level="body-sm" sx={{ opacity: 0.9 }}>
              Total Incidents
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
};

export default PatientInfoCard;
