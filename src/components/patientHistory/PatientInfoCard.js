// src/components/patientHistory/PatientInfoCard.js
import React from "react";
import { Box, Card, Typography, Avatar, Grid } from "@mui/joy";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import WcIcon from "@mui/icons-material/Wc";
import CakeIcon from "@mui/icons-material/Cake";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

const PatientInfoCard = ({ patient }) => {
  return (
    <Card
      sx={{
        p: 3,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
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
              {patient.profilePicture ? (
                <img src={patient.profilePicture} alt={patient.name} />
              ) : (
                <PersonIcon sx={{ fontSize: 60 }} />
              )}
            </Avatar>
          </Box>
        </Grid>

        {/* Patient Info */}
        <Grid xs={12} md={7}>
          <Typography
            level="h3"
            sx={{ fontWeight: 800, mb: 2, color: "white" }}
          >
            {patient.name}
          </Typography>

          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <BadgeIcon sx={{ fontSize: 18, opacity: 0.9 }} />
                <Typography level="body-sm" sx={{ opacity: 0.9 }}>
                  Patient ID:
                </Typography>
                <Typography level="body-md" sx={{ fontWeight: 600 }}>
                  {patient.id}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <CakeIcon sx={{ fontSize: 18, opacity: 0.9 }} />
                <Typography level="body-sm" sx={{ opacity: 0.9 }}>
                  Age:
                </Typography>
                <Typography level="body-md" sx={{ fontWeight: 600 }}>
                  {patient.age} years
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WcIcon sx={{ fontSize: 18, opacity: 0.9 }} />
                <Typography level="body-sm" sx={{ opacity: 0.9 }}>
                  Gender:
                </Typography>
                <Typography level="body-md" sx={{ fontWeight: 600 }}>
                  {patient.gender}
                </Typography>
              </Box>
            </Grid>

            <Grid xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <PhoneIcon sx={{ fontSize: 18, opacity: 0.9 }} />
                <Typography level="body-sm" sx={{ opacity: 0.9 }}>
                  Phone:
                </Typography>
                <Typography level="body-md" sx={{ fontWeight: 600 }}>
                  {patient.phone}
                </Typography>
              </Box>

              {patient.email && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EmailIcon sx={{ fontSize: 18, opacity: 0.9 }} />
                  <Typography level="body-sm" sx={{ opacity: 0.9 }}>
                    Email:
                  </Typography>
                  <Typography level="body-md" sx={{ fontWeight: 600 }}>
                    {patient.email}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Grid>

        {/* Total Incidents */}
        <Grid xs={12} md={3}>
          <Box
            sx={{
              textAlign: "center",
              p: 3,
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <ReportProblemIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
            <Typography level="h2" sx={{ fontWeight: 800, mb: 0.5 }}>
              {patient.totalIncidents}
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
