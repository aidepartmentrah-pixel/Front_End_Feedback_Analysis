// src/pages/ConfigPage.jsx
/**
 * Bootstrap Configuration Page
 * Standalone page for database/network/email configuration.
 * Accessible from the Login page — NOT inside the authenticated layout.
 * Protected by a static config password (not session auth).
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Input,
  Button,
  FormControl,
  FormLabel,
  Alert,
  Divider,
  Switch,
  Select,
  Option,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  CircularProgress,
  IconButton,
  Chip,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import StorageIcon from "@mui/icons-material/Storage";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SettingsIcon from "@mui/icons-material/Settings";
import theme from "../theme";
import {
  verifyPassword,
  getSettings,
  testConnection,
  saveSettings,
  reloadConfig,
  getDrivers,
  getSystemStatus,
} from "../api/configApi";

// ─── Password Gate ──────────────────────────────────────────────
const PasswordGate = ({ onAuthenticated }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await verifyPassword(password);
      if (result.valid) {
        onAuthenticated(password);
      } else {
        setError("كلمة مرور الإعدادات غير صحيحة (Invalid configuration password)");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.login.background,
        padding: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 440,
          width: "100%",
          p: 4,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          borderRadius: "16px",
          background: theme.colors.surface,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}>
          <IconButton
            variant="plain"
            onClick={() => navigate("/login")}
            sx={{ color: theme.colors.textSecondary }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <SettingsIcon sx={{ fontSize: 28, color: theme.colors.primary }} />
            <Typography level="h4" sx={{ fontWeight: 700 }}>
              إعدادات النظام
            </Typography>
          </Box>
        </Box>

        <Typography level="body-sm" sx={{ mb: 3, color: theme.colors.textSecondary }}>
          أدخل كلمة مرور الإعدادات للوصول إلى صفحة التكوين
          <br />
          (Enter the configuration password to access system settings)
        </Typography>

        {error && (
          <Alert color="danger" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <FormControl sx={{ mb: 3 }}>
            <FormLabel sx={{ fontWeight: 600 }}>كلمة مرور الإعدادات (Config Password)</FormLabel>
            <Input
              type="password"
              placeholder="Enter configuration password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startDecorator={<LockIcon />}
              required
              disabled={loading}
              sx={{ fontSize: "15px" }}
            />
          </FormControl>

          <Button
            type="submit"
            fullWidth
            loading={loading}
            startDecorator={!loading && <LockIcon />}
            sx={{
              background: theme.login.buttonBackground,
              color: theme.colors.textOnPrimary,
              fontWeight: 700,
              fontSize: "16px",
              py: 1.5,
              "&:hover": { background: theme.colors.primaryHover },
            }}
          >
            {loading ? "جاري التحقق..." : "تحقق (Verify)"}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

// ─── Main Config Panel ──────────────────────────────────────────
const ConfigPanel = ({ configPassword }) => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [drivers, setDrivers] = useState({ drivers: [], sql_server_drivers: [], recommended: null });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Form state (editable copy of settings)
  const [form, setForm] = useState({});

  // Load settings + drivers + status on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [settingsData, driversData, statusData] = await Promise.all([
          getSettings(configPassword),
          getDrivers(configPassword),
          getSystemStatus(),
        ]);
        setSettings(settingsData);
        setDrivers(driversData);
        setStatus(statusData);
        setForm(JSON.parse(JSON.stringify(settingsData))); // deep clone
      } catch (err) {
        console.error("Failed to load config:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [configPassword]);

  // Helper to update nested form values
  const updateForm = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  // Test DB connection
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const dbParams = {
        server: form.database?.server || "",
        database: form.database?.database || "",
        driver: form.database?.driver || "",
        use_windows_auth: form.database?.use_windows_auth || false,
        username: form.database?.username || "",
        password: form.database?.password || "",
        trust_server_certificate: form.database?.trust_server_certificate ?? true,
      };
      const result = await testConnection(configPassword, dbParams);
      setTestResult(result);
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  // Save all settings
  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const result = await saveSettings(configPassword, form);
      setSaveMessage({ type: "success", text: "تم حفظ الإعدادات بنجاح (Settings saved successfully)" });
      // Refresh settings from server
      const fresh = await getSettings(configPassword);
      setSettings(fresh);
      setForm(JSON.parse(JSON.stringify(fresh)));
    } catch (err) {
      setSaveMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Reload config + re-test DB
  const handleReload = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const result = await reloadConfig(configPassword);
      const statusData = await getSystemStatus();
      setStatus(statusData);
      setSaveMessage({
        type: result.database_connected ? "success" : "warning",
        text: result.database_connected
          ? "تم إعادة التحميل — قاعدة البيانات متصلة ✓ (Reloaded — Database connected)"
          : "تم إعادة التحميل — قاعدة البيانات غير متصلة ✗ (Reloaded — Database NOT connected)",
      });
    } catch (err) {
      setSaveMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.colors.background }}>
        <CircularProgress size="lg" />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", background: theme.colors.background, pb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          background: theme.header.background,
          color: theme.header.text,
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton variant="plain" onClick={() => navigate("/login")} sx={{ color: "white" }}>
            <ArrowBackIcon />
          </IconButton>
          <SettingsIcon sx={{ fontSize: 28 }} />
          <Typography level="h4" sx={{ fontWeight: 700, color: "white" }}>
            إعدادات النظام (System Configuration)
          </Typography>
        </Box>

        {/* Status chip */}
        {status && (
          <Chip
            variant="soft"
            color={status.database?.connected ? "success" : "danger"}
            startDecorator={status.database?.connected ? <CheckCircleIcon /> : <ErrorIcon />}
            sx={{ fontWeight: 600 }}
          >
            {status.database?.connected
              ? "قاعدة البيانات متصلة (DB Connected)"
              : "قاعدة البيانات غير متصلة (DB Disconnected)"}
          </Chip>
        )}
      </Box>

      {/* Alert bar */}
      {saveMessage && (
        <Alert
          color={saveMessage.type === "success" ? "success" : saveMessage.type === "warning" ? "warning" : "danger"}
          sx={{ mx: 3, mt: 2, borderRadius: "8px" }}
          endDecorator={
            <Button size="sm" variant="plain" color="neutral" onClick={() => setSaveMessage(null)}>
              ✕
            </Button>
          }
        >
          {saveMessage.text}
        </Alert>
      )}

      {/* Main content */}
      <Box sx={{ maxWidth: 900, mx: "auto", mt: 3, px: 2 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <TabList sx={{ borderRadius: "12px 12px 0 0", background: theme.colors.surface }}>
            <Tab sx={{ fontWeight: 600 }}>
              <StorageIcon sx={{ mr: 1, fontSize: 20 }} />
              قاعدة البيانات (Database)
            </Tab>
            <Tab sx={{ fontWeight: 600 }}>
              <NetworkCheckIcon sx={{ mr: 1, fontSize: 20 }} />
              الشبكة (Network)
            </Tab>
            <Tab sx={{ fontWeight: 600 }}>
              <EmailIcon sx={{ mr: 1, fontSize: 20 }} />
              البريد (Email)
            </Tab>
            <Tab sx={{ fontWeight: 600 }}>
              <VisibilityIcon sx={{ mr: 1, fontSize: 20 }} />
              العروض (Views)
            </Tab>
          </TabList>

          {/* ─── Database Tab ────────────────────────── */}
          <TabPanel value={0}>
            <Card sx={{ p: 3, borderRadius: "0 0 12px 12px" }}>
              <Typography level="title-lg" sx={{ mb: 2, fontWeight: 700 }}>
                إعدادات قاعدة البيانات (Database Settings)
              </Typography>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                <FormControl>
                  <FormLabel>Server / عنوان الخادم</FormLabel>
                  <Input
                    value={form.database?.server || ""}
                    onChange={(e) => updateForm("database", "server", e.target.value)}
                    placeholder="e.g. 192.168.1.100"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Database / اسم قاعدة البيانات</FormLabel>
                  <Input
                    value={form.database?.database || ""}
                    onChange={(e) => updateForm("database", "database", e.target.value)}
                    placeholder="e.g. IncidentManager"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>ODBC Driver</FormLabel>
                  <Select
                    value={form.database?.driver || ""}
                    onChange={(_, v) => updateForm("database", "driver", v)}
                  >
                    {drivers.sql_server_drivers.length > 0
                      ? drivers.sql_server_drivers.map((d) => (
                          <Option key={d} value={d}>
                            {d} {d === drivers.recommended ? " ★" : ""}
                          </Option>
                        ))
                      : [
                          <Option key="default" value="ODBC Driver 18 for SQL Server">
                            ODBC Driver 18 for SQL Server
                          </Option>,
                          <Option key="17" value="ODBC Driver 17 for SQL Server">
                            ODBC Driver 17 for SQL Server
                          </Option>,
                        ]}
                  </Select>
                </FormControl>

                <FormControl sx={{ display: "flex", alignItems: "flex-start" }}>
                  <FormLabel>Windows Auth / مصادقة ويندوز</FormLabel>
                  <Switch
                    checked={form.database?.use_windows_auth || false}
                    onChange={(e) => updateForm("database", "use_windows_auth", e.target.checked)}
                    sx={{ mt: 0.5 }}
                  />
                </FormControl>

                {!form.database?.use_windows_auth && (
                  <>
                    <FormControl>
                      <FormLabel>Username / اسم المستخدم</FormLabel>
                      <Input
                        value={form.database?.username || ""}
                        onChange={(e) => updateForm("database", "username", e.target.value)}
                        placeholder="SQL username"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Password / كلمة المرور</FormLabel>
                      <Input
                        type="password"
                        value={form.database?.password || ""}
                        onChange={(e) => updateForm("database", "password", e.target.value)}
                        placeholder="SQL password"
                      />
                    </FormControl>
                  </>
                )}

                <FormControl sx={{ display: "flex", alignItems: "flex-start" }}>
                  <FormLabel>Trust Server Certificate</FormLabel>
                  <Switch
                    checked={form.database?.trust_server_certificate ?? true}
                    onChange={(e) => updateForm("database", "trust_server_certificate", e.target.checked)}
                    sx={{ mt: 0.5 }}
                  />
                </FormControl>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Test Connection */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  color="primary"
                  loading={testing}
                  startDecorator={!testing && <PlayArrowIcon />}
                  onClick={handleTestConnection}
                >
                  {testing ? "جاري الاختبار..." : "اختبار الاتصال (Test Connection)"}
                </Button>

                {testResult && (
                  <Alert
                    color={testResult.success ? "success" : "danger"}
                    startDecorator={testResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
                    sx={{ flex: 1, minWidth: 200 }}
                  >
                    {testResult.message}
                    {testResult.duration_ms != null && ` (${testResult.duration_ms}ms)`}
                  </Alert>
                )}
              </Box>
            </Card>
          </TabPanel>

          {/* ─── Network Tab ─────────────────────────── */}
          <TabPanel value={1}>
            <Card sx={{ p: 3, borderRadius: "0 0 12px 12px" }}>
              <Typography level="title-lg" sx={{ mb: 2, fontWeight: 700 }}>
                إعدادات الشبكة (Network Settings)
              </Typography>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                <FormControl>
                  <FormLabel>Backend Host</FormLabel>
                  <Input
                    value={form.network?.backend_host || ""}
                    onChange={(e) => updateForm("network", "backend_host", e.target.value)}
                    placeholder="0.0.0.0"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Backend Port</FormLabel>
                  <Input
                    type="number"
                    value={form.network?.backend_port || ""}
                    onChange={(e) => updateForm("network", "backend_port", parseInt(e.target.value) || 8000)}
                    placeholder="8000"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Backend API URL</FormLabel>
                  <Input
                    value={form.network?.backend_api_url || ""}
                    onChange={(e) => updateForm("network", "backend_api_url", e.target.value)}
                    placeholder="http://localhost:8000"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>CORS Origins (comma-separated)</FormLabel>
                  <Input
                    value={
                      Array.isArray(form.network?.cors_origins)
                        ? form.network.cors_origins.join(", ")
                        : form.network?.cors_origins || ""
                    }
                    onChange={(e) =>
                      updateForm(
                        "network",
                        "cors_origins",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                    placeholder="http://localhost:3000, http://localhost:8000"
                  />
                </FormControl>
              </Box>
            </Card>
          </TabPanel>

          {/* ─── Email Tab ────────────────────────────── */}
          <TabPanel value={2}>
            <Card sx={{ p: 3, borderRadius: "0 0 12px 12px" }}>
              <Typography level="title-lg" sx={{ mb: 2, fontWeight: 700 }}>
                إعدادات البريد الإلكتروني (Email Settings)
              </Typography>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                <FormControl>
                  <FormLabel>Notification Mode</FormLabel>
                  <Select
                    value={form.email?.notification_mode || "none"}
                    onChange={(_, v) => updateForm("email", "notification_mode", v)}
                  >
                    <Option value="none">None</Option>
                    <Option value="email">Email</Option>
                    <Option value="both">Both</Option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>SMTP Server</FormLabel>
                  <Input
                    value={form.email?.smtp_server || ""}
                    onChange={(e) => updateForm("email", "smtp_server", e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>SMTP Port</FormLabel>
                  <Input
                    type="number"
                    value={form.email?.smtp_port || ""}
                    onChange={(e) => updateForm("email", "smtp_port", parseInt(e.target.value) || 587)}
                    placeholder="587"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Sender Email</FormLabel>
                  <Input
                    value={form.email?.sender_email || ""}
                    onChange={(e) => updateForm("email", "sender_email", e.target.value)}
                    placeholder="noreply@hospital.com"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Sender Password</FormLabel>
                  <Input
                    type="password"
                    value={form.email?.sender_password || ""}
                    onChange={(e) => updateForm("email", "sender_password", e.target.value)}
                    placeholder="App password"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Sender Name</FormLabel>
                  <Input
                    value={form.email?.sender_name || ""}
                    onChange={(e) => updateForm("email", "sender_name", e.target.value)}
                    placeholder="Hospital Feedback System"
                  />
                </FormControl>
              </Box>
            </Card>
          </TabPanel>

          {/* ─── Views Tab ────────────────────────────── */}
          <TabPanel value={3}>
            <Card sx={{ p: 3, borderRadius: "0 0 12px 12px" }}>
              <Typography level="title-lg" sx={{ mb: 2, fontWeight: 700 }}>
                إعدادات العروض (Database Views)
              </Typography>

              <Typography level="body-sm" sx={{ mb: 2, color: theme.colors.textSecondary }}>
                أسماء العروض (Views) المستخدمة للربط مع أنظمة المستشفى الخارجية
                <br />
                (View names used to integrate with external hospital systems)
              </Typography>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2, maxWidth: 500 }}>
                <FormControl>
                  <FormLabel>HR Employees View</FormLabel>
                  <Input
                    value={form.views?.hr_employees_view || ""}
                    onChange={(e) => updateForm("views", "hr_employees_view", e.target.value)}
                    placeholder="vw_Aborad_HCATInsight_HR_Employees"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Patient Admission View</FormLabel>
                  <Input
                    value={form.views?.patient_admission_view || ""}
                    onChange={(e) => updateForm("views", "patient_admission_view", e.target.value)}
                    placeholder="vw_Aborad_patientAdmission"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Doctors View</FormLabel>
                  <Input
                    value={form.views?.doctors_view || ""}
                    onChange={(e) => updateForm("views", "doctors_view", e.target.value)}
                    placeholder="vw_Aborad_Doctors"
                  />
                </FormControl>
              </Box>
            </Card>
          </TabPanel>
        </Tabs>

        {/* ─── Action Buttons ─────────────────────────── */}
        <Box sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            color="neutral"
            startDecorator={<RefreshIcon />}
            loading={saving}
            onClick={handleReload}
          >
            إعادة تحميل (Reload & Test)
          </Button>

          <Button
            color="primary"
            startDecorator={<SaveIcon />}
            loading={saving}
            onClick={handleSave}
            sx={{
              background: theme.login.buttonBackground,
              color: theme.colors.textOnPrimary,
              fontWeight: 700,
              "&:hover": { background: theme.colors.primaryHover },
            }}
          >
            حفظ الإعدادات (Save Settings)
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

// ─── Page Root ──────────────────────────────────────────────────
const ConfigPage = () => {
  const [configPassword, setConfigPassword] = useState(null);

  if (!configPassword) {
    return <PasswordGate onAuthenticated={setConfigPassword} />;
  }

  return <ConfigPanel configPassword={configPassword} />;
};

export default ConfigPage;
