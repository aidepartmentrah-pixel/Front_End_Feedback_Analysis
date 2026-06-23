import React from 'react';
import { Chip } from '@mui/joy';
import ErrorIcon from '@mui/icons-material/Error';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';

const SEVERITY_CONFIG = {
  HIGH:   { Icon: ErrorIcon,        color: 'danger',  label: 'High' },
  MEDIUM: { Icon: WarningAmberIcon, color: 'warning', label: 'Medium' },
  LOW:    { Icon: InfoIcon,         color: 'neutral', label: 'Low' },
};

function SeverityBadge({ severity }) {
  const cfg = SEVERITY_CONFIG[severity];
  if (!cfg) return null;

  return (
    <Chip
      size="sm"
      color={cfg.color}
      variant="soft"
      startDecorator={<cfg.Icon style={{ fontSize: '0.8rem' }} />}
    >
      {cfg.label}
    </Chip>
  );
}

export default SeverityBadge;
