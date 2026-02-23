// src/components/redflags/NeverEventsSummaryCard.js
import React from "react";
import { Card, Typography, Box, Button } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { mockNeverEvents } from "../../data/neverEventsData";

const NeverEventsSummaryCard = () => {
  const navigate = useNavigate();
  
  // Calculate stats
  const totalEvents = mockNeverEvents.length;
  const openEvents = mockNeverEvents.filter(event => event.status === "OPEN").length;
  
  // Get recent events (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentEvents = mockNeverEvents.filter(event => new Date(event.date) >= thirtyDaysAgo).length;

  return (
    <Card
      sx={{
        p: 3,
        mb: 3,
        background: "linear-gradient(135deg, rgba(255, 71, 87, 0.05) 0%, rgba(232, 65, 24, 0.05) 100%)",
        border: "2px solid rgba(255, 71, 87, 0.3)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px rgba(255, 71, 87, 0.2)",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #ff4757 0%, #e84118 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <WarningAmberIcon sx={{ fontSize: "28px" }} />
            </Box>
            <Box>
              <Typography level="h4" sx={{ fontWeight: 800, color: "#ff4757" }}>
                Never Events
              </Typography>
              <Typography level="body-xs" sx={{ color: "#666" }}>
                Zero Tolerance Events
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 2 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: "8px",
                background: "rgba(255, 71, 87, 0.1)",
                border: "1px solid rgba(255, 71, 87, 0.2)",
              }}
            >
              <Typography level="h3" sx={{ fontWeight: 900, color: "#ff4757", mb: 0.5 }}>
                {totalEvents}
              </Typography>
              <Typography level="body-xs" sx={{ color: "#666" }}>
                Total Events
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: "8px",
                background: "rgba(255, 71, 87, 0.1)",
                border: "1px solid rgba(255, 71, 87, 0.2)",
              }}
            >
              <Typography level="h3" sx={{ fontWeight: 900, color: "#ff4757", mb: 0.5 }}>
                {openEvents}
              </Typography>
              <Typography level="body-xs" sx={{ color: "#666" }}>
                Open Events
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: "8px",
                background: "rgba(255, 165, 2, 0.1)",
                border: "1px solid rgba(255, 165, 2, 0.2)",
              }}
            >
              <Typography level="h3" sx={{ fontWeight: 900, color: "#ffa502", mb: 0.5 }}>
                {recentEvents}
              </Typography>
              <Typography level="body-xs" sx={{ color: "#666" }}>
                Last 30 Days
              </Typography>
            </Box>
          </Box>

          <Typography level="body-sm" sx={{ color: "#666", mb: 2, lineHeight: 1.6 }}>
            Never Events are serious preventable events that should never occur in a healthcare setting.
            These events require immediate investigation and strict corrective actions.
          </Typography>
        </Box>

        <Button
          size="lg"
          endDecorator={<ArrowForwardIcon />}
          onClick={() => navigate("/never-events")}
          sx={{
            background: "linear-gradient(135deg, #ff4757 0%, #e84118 100%)",
            color: "white",
            fontWeight: 700,
            minWidth: "160px",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        >
          View Never Events
        </Button>
      </Box>
    </Card>
  );
};

export default NeverEventsSummaryCard;
