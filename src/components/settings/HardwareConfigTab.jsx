// src/components/settings/HardwareConfigTab.jsx
/**
 * Hardware Configuration Tab
 * 
 * Deployment settings management for SOFTWARE_ADMIN only.
 * Allows configuration of:
 * - Database connection
 * - External system views
 * - Network/API settings
 * - SMTP email server
 * 
 * Features:
 * - Live connection testing with status indicators
 * - Grouped configuration by category
 * - Batch save functionality
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  Switch,
  Button,
  Divider,
  Sheet,
  CircularProgress,
  Alert,
  Chip,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Tooltip,
  IconButton,
} from "@mui/joy";
import Snackbar from "@mui/joy/Snackbar";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StorageIcon from "@mui/icons-material/Storage";
import CloudIcon from "@mui/icons-material/Cloud";
import EmailIcon from "@mui/icons-material/Email";
import SettingsIcon from "@mui/icons-material/Settings";
import TableChartIcon from "@mui/icons-material/TableChart";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import hardwareConfigApi from "../../api/hardwareConfigApi";

// Group icons mapping
const GROUP_ICONS = {
  database: <StorageIcon />,
  views: <TableChartIcon />,
  network: <CloudIcon />,
  email: <EmailIcon />,
  system: <SettingsIcon />,
};

// Connection status component
const ConnectionStatus = ({ status, message }) => {
  if (status === null) {
    return (
      <Chip variant="soft" color="neutral" size="sm">
        Not tested
      </Chip>
    );
  }
  
  if (status === 'testing') {
    return (
      <Chip 
        variant="soft" 
        color="primary" 
        size="sm"
        startDecorator={<CircularProgress size="sm" />}
      >
        Testing...
      </Chip>
    );
  }
  
  return (
    <Tooltip title={message} placement="top">
      <Chip
        variant="soft"
        color={status === true ? "success" : "danger"}
        size="sm"
        startDecorator={status === true ? <CheckCircleIcon /> : <ErrorIcon />}
      >
        {status === true ? "Connected" : "Failed"}
      </Chip>
    </Tooltip>
  );
};

// Configuration field component
const ConfigField = ({ config, value, onChange, disabled }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const handleChange = (newValue) => {
    onChange(config.key, newValue);
  };
  
  // Boolean field (switch)
  if (config.type === 'bool') {
    const isChecked = value === 'true' || value === '1' || value === 'yes' || value === true;
    return (
      <FormControl sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Switch
            checked={isChecked}
            onChange={(e) => handleChange(e.target.checked ? 'true' : 'false')}
            disabled={disabled || !config.is_editable}
          />
          <Box>
            <FormLabel>{config.display_name}</FormLabel>
            <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
              {config.description}
            </Typography>
          </Box>
        </Box>
      </FormControl>
    );
  }
  
  // Password field
  if (config.type === 'password') {
    return (
      <FormControl sx={{ mb: 2 }}>
        <FormLabel>{config.display_name}</FormLabel>
        <Input
          type={showPassword ? 'text' : 'password'}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled || !config.is_editable}
          placeholder={config.is_encrypted ? '••••••••' : 'Enter password'}
          endDecorator={
            <IconButton
              variant="plain"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          }
        />
        <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
          {config.description}
        </Typography>
      </FormControl>
    );
  }
  
  // Integer field
  if (config.type === 'int') {
    return (
      <FormControl sx={{ mb: 2 }}>
        <FormLabel>{config.display_name}</FormLabel>
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled || !config.is_editable}
        />
        <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
          {config.description}
        </Typography>
      </FormControl>
    );
  }
  
  // Default: String field
  return (
    <FormControl sx={{ mb: 2 }}>
      <FormLabel>{config.display_name}</FormLabel>
      <Input
        type="text"
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled || !config.is_editable}
      />
      <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
        {config.description}
      </Typography>
    </FormControl>
  );
};

// Configuration group panel
const ConfigGroupPanel = ({ 
  groupKey, 
  group, 
  values, 
  onChange, 
  onTestConnection,
  connectionStatus,
  testingConnection,
  disabled 
}) => {
  const showTestButton = groupKey === 'database' || groupKey === 'email';
  
  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {GROUP_ICONS[groupKey]}
          <Typography level="title-lg">{group.metadata.name}</Typography>
        </Box>
        
        {showTestButton && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ConnectionStatus 
              status={connectionStatus?.status} 
              message={connectionStatus?.message} 
            />
            <Button
              variant="soft"
              color="primary"
              size="sm"
              startDecorator={testingConnection ? <CircularProgress size="sm" /> : <PlayArrowIcon />}
              onClick={() => onTestConnection(groupKey)}
              disabled={testingConnection || disabled}
            >
              Test Connection
            </Button>
          </Box>
        )}
      </Box>
      
      <Typography level="body-sm" sx={{ mb: 2, color: 'text.secondary' }}>
        {group.metadata.description}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {group.configs.map((config) => (
          <ConfigField
            key={config.key}
            config={config}
            value={values[config.key] ?? config.value}
            onChange={onChange}
            disabled={disabled}
          />
        ))}
      </Box>
    </Card>
  );
};

// Main component
const HardwareConfigTab = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [configData, setConfigData] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", color: "success" });
  
  // Connection test states
  const [connectionStatus, setConnectionStatus] = useState({
    database: null,
    email: null,
  });
  const [testingConnection, setTestingConnection] = useState({
    database: false,
    email: false,
  });

  // Load configuration on mount
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hardwareConfigApi.getAllConfigs();
      setConfigData(data);
      
      // Initialize edited values from loaded data
      const initialValues = {};
      Object.values(data.groups).forEach(group => {
        group.configs.forEach(config => {
          initialValues[config.key] = config.value;
        });
      });
      setEditedValues(initialValues);
      setHasChanges(false);
    } catch (err) {
      console.error("Error loading hardware config:", err);
      setError("Failed to load configuration. Please check your permissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Handle value change
  const handleValueChange = (key, value) => {
    setEditedValues(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
    
    // Clear connection status when database/email settings change
    if (key.startsWith('db_') || key.startsWith('smtp_')) {
      const group = key.startsWith('db_') ? 'database' : 'email';
      setConnectionStatus(prev => ({
        ...prev,
        [group]: null,
      }));
    }
  };

  // Test connection
  const handleTestConnection = async (groupKey) => {
    setTestingConnection(prev => ({ ...prev, [groupKey]: true }));
    setConnectionStatus(prev => ({ ...prev, [groupKey]: { status: 'testing', message: '' } }));
    
    try {
      let result;
      
      if (groupKey === 'database') {
        // Use custom test with edited values
        result = await hardwareConfigApi.testCustomDatabaseConnection({
          server: editedValues.db_server,
          database: editedValues.db_database,
          driver: editedValues.db_driver,
          use_windows_auth: editedValues.db_use_windows_auth === 'true',
          username: editedValues.db_username || null,
          password: editedValues.db_password === '********' ? null : editedValues.db_password,
        });
      } else if (groupKey === 'email') {
        result = await hardwareConfigApi.testCustomSmtpConnection({
          host: editedValues.smtp_host,
          port: parseInt(editedValues.smtp_port) || 25,
          use_tls: editedValues.smtp_use_tls === 'true',
          use_ssl: editedValues.smtp_use_ssl === 'true',
          username: editedValues.smtp_username || null,
          password: editedValues.smtp_password === '********' ? null : editedValues.smtp_password,
        });
      }
      
      setConnectionStatus(prev => ({
        ...prev,
        [groupKey]: { status: result.success, message: result.message },
      }));
      
      setSnackbar({
        open: true,
        message: result.message,
        color: result.success ? "success" : "danger",
      });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || "Connection test failed";
      setConnectionStatus(prev => ({
        ...prev,
        [groupKey]: { status: false, message: errorMessage },
      }));
      setSnackbar({
        open: true,
        message: errorMessage,
        color: "danger",
      });
    } finally {
      setTestingConnection(prev => ({ ...prev, [groupKey]: false }));
    }
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Find changed values
      const updates = [];
      Object.entries(editedValues).forEach(([key, value]) => {
        // Find original value
        let originalValue = null;
        if (configData?.groups) {
          Object.values(configData.groups).forEach(group => {
            const config = group.configs.find(c => c.key === key);
            if (config) originalValue = config.value;
          });
        }
        
        if (value !== originalValue && value !== '********') {
          updates.push({ key, value: String(value) });
        }
      });
      
      if (updates.length === 0) {
        setSnackbar({
          open: true,
          message: "No changes to save",
          color: "warning",
        });
        setSaving(false);
        return;
      }
      
      const result = await hardwareConfigApi.updateConfigsBatch(updates);
      
      if (result.success_count > 0) {
        setSnackbar({
          open: true,
          message: `Saved ${result.success_count} configuration(s) successfully`,
          color: "success",
        });
        
        // Reload to get updated values
        await loadConfig();
      }
      
      if (result.error_count > 0) {
        const errorMessages = result.errors.map(e => `${e.key}: ${e.error}`).join(', ');
        setSnackbar({
          open: true,
          message: `Some configurations failed to save: ${errorMessages}`,
          color: "danger",
        });
      }
    } catch (err) {
      console.error("Error saving config:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || "Failed to save configuration",
        color: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset changes
  const handleReset = () => {
    if (configData?.groups) {
      const initialValues = {};
      Object.values(configData.groups).forEach(group => {
        group.configs.forEach(config => {
          initialValues[config.key] = config.value;
        });
      });
      setEditedValues(initialValues);
      setHasChanges(false);
      setConnectionStatus({ database: null, email: null });
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert color="danger" sx={{ m: 2 }}>
        {error}
        <Button variant="soft" size="sm" sx={{ ml: 2 }} onClick={loadConfig}>
          Retry
        </Button>
      </Alert>
    );
  }

  // No data
  if (!configData?.groups) {
    return (
      <Alert color="warning" sx={{ m: 2 }}>
        No configuration data available
      </Alert>
    );
  }

  const groupKeys = Object.keys(configData.groups);

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography level="h3">Hardware Configuration</Typography>
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            Deployment and infrastructure settings (SOFTWARE_ADMIN only)
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="soft"
            color="neutral"
            startDecorator={<RefreshIcon />}
            onClick={handleReset}
            disabled={!hasChanges || saving}
          >
            Reset
          </Button>
          <Button
            variant="solid"
            color="primary"
            startDecorator={saving ? <CircularProgress size="sm" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      {/* Changed indicator */}
      {hasChanges && (
        <Alert color="warning" variant="soft" sx={{ mb: 2 }}>
          You have unsaved changes. Click "Save Changes" to apply them.
        </Alert>
      )}

      {/* Configuration tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, value) => setActiveTab(value)}
        sx={{ borderRadius: 'lg' }}
      >
        <TabList>
          {groupKeys.map((key, index) => (
            <Tab key={key} value={index}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {GROUP_ICONS[key]}
                {configData.groups[key].metadata.name}
              </Box>
            </Tab>
          ))}
        </TabList>

        {groupKeys.map((key, index) => (
          <TabPanel key={key} value={index} sx={{ p: 2 }}>
            <ConfigGroupPanel
              groupKey={key}
              group={configData.groups[key]}
              values={editedValues}
              onChange={handleValueChange}
              onTestConnection={handleTestConnection}
              connectionStatus={connectionStatus[key]}
              testingConnection={testingConnection[key]}
              disabled={saving}
            />
          </TabPanel>
        ))}
      </Tabs>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        autoHideDuration={5000}
        color={snackbar.color}
        variant="soft"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {snackbar.message}
      </Snackbar>
    </Box>
  );
};

export default HardwareConfigTab;
