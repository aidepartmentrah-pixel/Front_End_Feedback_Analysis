// src/components/common/PersonProfileCard.jsx
// Shared profile header card for Patient/Doctor/Worker History tabs.
// Neutral surface with a thin brand accent -- not a full-card gradient.
//
// Performance metrics (when provided) render as an integrated stat strip
// inside this same card, separated by a divider -- not as a separate row
// of floating KPI cards underneath. A handful of small numbers stretched
// across their own full-width cards reads as a broken-up strip with
// nowhere to breathe; folded into one card, identity + performance become
// a single, unambiguous focal element instead of two competing tiers.
import React from "react";
import { Box, Card, Typography, Avatar, Chip, Divider } from "@mui/joy";
import theme from "../../theme";

/**
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Avatar icon
 * @param {string} props.name - Primary display name
 * @param {string} [props.secondaryName] - Optional secondary name (e.g. Arabic)
 * @param {string} [props.statusLabel] - Optional status chip text (e.g. "Active")
 * @param {"success"|"neutral"|"warning"|"danger"} [props.statusColor]
 * @param {Array<{icon?: React.ReactNode, label: string, value?: string|number}>} props.fields
 *   Only fields that belong to the current data model should be passed in --
 *   this component doesn't decide what's real, the caller does. A missing
 *   value renders as "Not available", never a blank line or "N/A".
 * @param {Array<{key: string, icon?: React.ReactNode, label: string, value: string|number, color?: string}>} [props.metrics]
 *   Optional performance stat strip, rendered below a divider.
 */
const PersonProfileCard = ({
  icon,
  name,
  secondaryName,
  statusLabel,
  statusColor = "neutral",
  fields = [],
  metrics = [],
}) => {
  return (
    <Card
      variant="outlined"
      sx={{
        p: 0,
        borderRadius: theme.radius.lg,
        borderLeft: `4px solid ${theme.colors.primary}`,
        borderColor: theme.colors.borderDark,
        boxShadow: theme.shadows.dropdown,
        background: theme.colors.surface,
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, flexWrap: "wrap" }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              background: theme.colors.primaryLighter,
              color: theme.colors.primary,
            }}
          >
            {icon}
          </Avatar>

          {/* Identity block (name/status/secondary name) and metadata sit
              close together as one composed unit, rather than metadata
              spreading edge-to-edge across a full-width card. */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography level="h4" sx={{ fontWeight: 700, color: theme.colors.textPrimary }}>
                {name || "Unknown"}
              </Typography>
              {statusLabel && (
                <Chip size="sm" variant="soft" color={statusColor} sx={{ fontWeight: 600 }}>
                  {statusLabel}
                </Chip>
              )}
            </Box>

            {secondaryName && (
              <Typography level="body-sm" sx={{ color: theme.colors.textSecondary }}>
                {secondaryName}
              </Typography>
            )}

            {fields.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 1 }}>
                {fields.map((f) => (
                  <Box key={f.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {f.icon && (
                      <Box sx={{ color: theme.colors.primary, display: "flex" }}>{f.icon}</Box>
                    )}
                    <Box>
                      <Typography level="body-xs" sx={{ color: theme.colors.textTertiary }}>
                        {f.label}
                      </Typography>
                      <Typography level="body-sm" sx={{ fontWeight: 600, color: theme.colors.textPrimary }}>
                        {f.value != null && f.value !== "" ? f.value : "Not available"}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {metrics.length > 0 && (
        <>
          <Divider />
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              background: theme.colors.background,
            }}
          >
            {metrics.map((m, i) => (
              <React.Fragment key={m.key}>
                <Box
                  sx={{
                    flex: "1 1 130px",
                    px: 3,
                    py: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                  }}
                >
                  {m.icon && (
                    <Box sx={{ color: m.color || theme.colors.primary, display: "flex", "& svg": { fontSize: 22 } }}>
                      {m.icon}
                    </Box>
                  )}
                  <Box>
                    <Typography level="h3" sx={{ fontWeight: 800, color: theme.colors.textPrimary, lineHeight: 1.1 }}>
                      {m.value}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: theme.colors.textSecondary, fontWeight: 600, whiteSpace: "nowrap" }}>
                      {m.label}
                    </Typography>
                  </Box>
                </Box>
                {i < metrics.length - 1 && (
                  <Divider orientation="vertical" sx={{ my: 1.5 }} />
                )}
              </React.Fragment>
            ))}
          </Box>
        </>
      )}
    </Card>
  );
};

export default PersonProfileCard;
