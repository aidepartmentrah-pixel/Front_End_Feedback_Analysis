// src/pages/ConfigPage.jsx
/**
 * Bootstrap Configuration Page
 * Standalone page for database/network/email configuration.
 * Accessible from the Login page — NOT inside the authenticated layout.
 * Protected by a static config password (not session auth).
 */
import React, { useState, useEffect, useRef } from "react";
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
import EmailIcon from "@mui/icons-material/Email";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SettingsIcon from "@mui/icons-material/Settings";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import theme from "../theme";
import {
  verifyPassword,
  getSettings,
  testConnection,
  saveSettings,
  reloadConfig,
  getDrivers,
  getSystemStatus,
  getExternalApiSettings,
  saveExternalApiSettings,
  testExternalApiConnection,
  revealDatabasePassword,
  revealExternalApiKey,
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
  const [restartRequired, setRestartRequired] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  // showDbPassword/showApiKey: whether the field is currently rendered as
  // plain text (true) or dots (false).
  //
  // dbPasswordKnown/apiKeyKnown: whether the field's current value is
  // something real (either fetched via Reveal, or typed by the admin) as
  // opposed to the untouched masked placeholder from the initial load.
  // This is what lets the single eye icon behave correctly in every state:
  // clicking it when the field is still the untouched mask fetches the
  // real value from the server; clicking it once it's "known" just toggles
  // local visibility (no network call — and critically, never overwrites
  // an in-progress edit with the old stored value).
  const [showDbPassword, setShowDbPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [dbPasswordKnown, setDbPasswordKnown] = useState(false);
  const [apiKeyKnown, setApiKeyKnown] = useState(false);
  const [dbPasswordRevealing, setDbPasswordRevealing] = useState(false);
  const [apiKeyRevealing, setApiKeyRevealing] = useState(false);
  const dbRevealTimeoutRef = useRef(null);
  const apiKeyRevealTimeoutRef = useRef(null);

  // Clear any pending auto-hide timers on unmount so they don't fire a
  // state update after the page is gone.
  useEffect(() => {
    return () => {
      if (dbRevealTimeoutRef.current) clearTimeout(dbRevealTimeoutRef.current);
      if (apiKeyRevealTimeoutRef.current) clearTimeout(apiKeyRevealTimeoutRef.current);
    };
  }, []);

  // Form state (editable copy of settings)
  const [form, setForm] = useState({});

  // Hospital Directory API tab — separate state, since it saves/tests
  // independently (applies immediately, no restart-required workflow).
  const [externalApiForm, setExternalApiForm] = useState({});
  const [externalApiSaving, setExternalApiSaving] = useState(false);
  const [externalApiTesting, setExternalApiTesting] = useState(false);
  const [externalApiTestResult, setExternalApiTestResult] = useState(null);
  const [externalApiSaveMessage, setExternalApiSaveMessage] = useState(null);

  const loadExternalApiSettings = async () => {
    try {
      const data = await getExternalApiSettings(configPassword);
      setExternalApiForm(data);
      // Freshly loaded value is always the masked placeholder again — the
      // eye icon should re-fetch on next click, not assume it already
      // knows the real value.
      setApiKeyKnown(false);
      setShowApiKey(false);
    } catch (err) {
      console.error("Failed to load Hospital Directory API settings:", err);
    }
  };

  // Load settings + drivers + status on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [settingsData, driversData, statusData] = await Promise.all([
          getSettings(configPassword),
          getDrivers(configPassword),
          getSystemStatus(),
          loadExternalApiSettings(),
        ]);
        setSettings(settingsData);
        setDrivers(driversData);
        setStatus(statusData);
        setForm(JSON.parse(JSON.stringify(settingsData))); // deep clone
        setRestartRequired(!!settingsData.restart_required);
        setDbPasswordKnown(false);
        setShowDbPassword(false);
      } catch (err) {
        console.error("Failed to load config:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [configPassword]);

  const updateExternalApiForm = (key, value) => {
    setExternalApiForm((prev) => ({ ...prev, [key]: value }));
  };

  // Fetches the REAL decrypted API key and displays it for 10 seconds
  // before auto-hiding — same accepted exception as the DB password reveal.
  const handleRevealApiKey = async () => {
    setApiKeyRevealing(true);
    try {
      const { api_key } = await revealExternalApiKey(configPassword);
      updateExternalApiForm("api_key", api_key);
      setApiKeyKnown(true);
      setShowApiKey(true);
      if (apiKeyRevealTimeoutRef.current) clearTimeout(apiKeyRevealTimeoutRef.current);
      apiKeyRevealTimeoutRef.current = setTimeout(() => setShowApiKey(false), 10000);
    } catch (err) {
      setExternalApiSaveMessage({ type: "error", text: err.message });
    } finally {
      setApiKeyRevealing(false);
    }
  };

  // The single eye icon's click handler for the API key field: fetches the
  // real value on first click (while the field is still the untouched
  // mask), then just toggles local visibility on subsequent clicks (or if
  // the admin has already typed a new value) — never re-fetches over an
  // in-progress edit.
  const handleApiKeyEyeClick = () => {
    if (showApiKey) {
      setShowApiKey(false);
      return;
    }
    if (apiKeyKnown) {
      setShowApiKey(true);
      return;
    }
    handleRevealApiKey();
  };

  const handleTestExternalApi = async () => {
    setExternalApiTesting(true);
    setExternalApiTestResult(null);
    try {
      // Test whatever's currently typed (base_url/api_key/timeout/verify_tls),
      // so admins can check a candidate value before saving it. Runs BOTH a
      // health check (server reachable?) and a real authenticated call
      // (does the key work?) — health alone can't answer the second
      // question, since /health needs no auth per the API's own contract.
      const result = await testExternalApiConnection(configPassword, {
        base_url: externalApiForm.base_url,
        api_key: externalApiForm.api_key,
        timeout_seconds: externalApiForm.timeout_seconds,
        verify_tls: externalApiForm.verify_tls,
      });
      setExternalApiTestResult(result);
      // Server persists the test result too, but refresh so the "Last
      // connection-test" fields reflect it without a full page reload.
      await loadExternalApiSettings();
    } catch (err) {
      setExternalApiTestResult({ success: false, message: err.message });
    } finally {
      setExternalApiTesting(false);
    }
  };

  const handleSaveExternalApi = async () => {
    setExternalApiSaving(true);
    setExternalApiSaveMessage(null);
    try {
      const result = await saveExternalApiSettings(configPassword, {
        base_url: externalApiForm.base_url,
        api_key: externalApiForm.api_key,
        timeout_seconds: externalApiForm.timeout_seconds,
        verify_tls: externalApiForm.verify_tls,
        // No "enabled" flag — the integration isn't an optional feature to
        // toggle off once patient/doctor/worker data depends on it; being
        // configured (a Base URL is set) is the only signal that matters.
      });
      setExternalApiSaveMessage({ type: "success", text: result.message });
      await loadExternalApiSettings();
    } catch (err) {
      setExternalApiSaveMessage({ type: "error", text: err.message });
    } finally {
      setExternalApiSaving(false);
    }
  };

  // Helper to update nested form values
  const updateForm = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  // Test DB connection
  // Fetches the REAL stored DB password and displays it for 10 seconds
  // before auto-hiding — an explicit, deliberate exception to "never send
  // secrets to the browser," requested by the admin.
  const handleRevealDbPassword = async () => {
    setDbPasswordRevealing(true);
    try {
      const { password } = await revealDatabasePassword(configPassword);
      updateForm("database", "password", password);
      setDbPasswordKnown(true);
      setShowDbPassword(true);
      if (dbRevealTimeoutRef.current) clearTimeout(dbRevealTimeoutRef.current);
      dbRevealTimeoutRef.current = setTimeout(() => setShowDbPassword(false), 10000);
    } catch (err) {
      setSaveMessage({ type: "error", text: err.message });
    } finally {
      setDbPasswordRevealing(false);
    }
  };

  // Same contextual behavior as the API key eye icon — see its handler for
  // the full reasoning.
  const handleDbPasswordEyeClick = () => {
    if (showDbPassword) {
      setShowDbPassword(false);
      return;
    }
    if (dbPasswordKnown) {
      setShowDbPassword(true);
      return;
    }
    handleRevealDbPassword();
  };

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
      setRestartRequired(!!result.restart_required);
      setSaveMessage({
        type: result.restart_required ? "warning" : "success",
        text: result.restart_required
          ? `تم حفظ الإعدادات — يلزم إعادة تشغيل الخادم لتطبيقها (Settings saved — backend RESTART required to apply them). ${result.message || ""}`
          : "تم حفظ الإعدادات بنجاح (Settings saved successfully)",
      });
      // Refresh settings from server (shows updated "saved" values; active
      // values won't change until an actual restart)
      const fresh = await getSettings(configPassword);
      setSettings(fresh);
      setForm(JSON.parse(JSON.stringify(fresh)));
      setDbPasswordKnown(false);
      setShowDbPassword(false);
    } catch (err) {
      setSaveMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Test whether the SAVED settings are reachable — does NOT affect the
  // active connection currently used by live traffic (that only changes on
  // an actual backend restart).
  const handleReload = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const result = await reloadConfig(configPassword);
      const statusData = await getSystemStatus();
      setStatus(statusData);
      setRestartRequired(!!result.restart_required);
      setSaveMessage({
        type: !result.saved_settings_reachable ? "danger" : result.config_in_sync ? "success" : "warning",
        text: result.message,
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

      {/* Persistent restart-required banner — stays visible independent of
          the save/reload toast below, since it reflects a standing fact
          (saved settings differ from the active connection), not a one-off
          action result. */}
      {restartRequired && (
        <Alert color="warning" sx={{ mx: 3, mt: 2, borderRadius: "8px", fontWeight: 600 }}>
          ⚠ الإعدادات المحفوظة تختلف عن الاتصال النشط حالياً — يلزم إعادة تشغيل الخادم لتطبيقها
          <br />
          (Saved settings differ from the active connection — restart the backend to apply them)
        </Alert>
      )}

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
              <EmailIcon sx={{ mr: 1, fontSize: 20 }} />
              البريد (Email)
            </Tab>
            <Tab sx={{ fontWeight: 600 }}>
              <CloudQueueIcon sx={{ mr: 1, fontSize: 20 }} />
              دليل المستشفى (Hospital Directory API)
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
                        type={showDbPassword ? "text" : "password"}
                        value={form.database?.password || ""}
                        onChange={(e) => {
                          updateForm("database", "password", e.target.value);
                          setDbPasswordKnown(true);
                        }}
                        placeholder="SQL password"
                        endDecorator={
                          <IconButton
                            variant="plain"
                            size="sm"
                            loading={dbPasswordRevealing}
                            onClick={handleDbPasswordEyeClick}
                            tabIndex={-1}
                          >
                            {showDbPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        }
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
                    sx={{ flex: 1, minWidth: 200, flexDirection: "column", alignItems: "flex-start" }}
                  >
                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                      {testResult.message}
                      {testResult.duration_ms != null && ` (${testResult.duration_ms}ms)`}
                    </Typography>
                    {!testResult.success && testResult.raw_error && (
                      <Typography level="body-xs" sx={{ mt: 0.5, opacity: 0.8, fontFamily: "monospace" }}>
                        Raw error: {testResult.raw_error}
                      </Typography>
                    )}
                  </Alert>
                )}
              </Box>
            </Card>
          </TabPanel>

          {/* ─── Email Tab ────────────────────────────── */}
          <TabPanel value={1}>
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

          {/* ─── Hospital Directory API Tab ─────────────── */}
          {/* Views tab removed from the UI per explicit request — the
              backend still reads/saves form.views unchanged (GET/POST
              /api/config/settings still accept it), so it remains reachable
              directly via the API if it's ever needed before Session C
              replaces the underlying VW_* reads; it's just not exposed here. */}
          <TabPanel value={2}>
            <Card sx={{ p: 3, borderRadius: "0 0 12px 12px" }}>
              <Typography level="title-lg" sx={{ mb: 2, fontWeight: 700 }}>
                إعدادات دليل المستشفى (Hospital Directory API Settings)
              </Typography>
              <Typography level="body-sm" sx={{ mb: 2, color: theme.colors.textSecondary }}>
                هذه الإعدادات تُطبَّق فوراً عند الحفظ — لا حاجة لإعادة تشغيل الخادم
                <br />
                (These settings apply immediately when saved — no backend restart required)
              </Typography>

              {externalApiForm.api_key_error && (
                <Alert color="warning" sx={{ mb: 2 }}>
                  {externalApiForm.api_key_error}
                </Alert>
              )}
              {externalApiForm.encryption_key_configured === false && (
                <Alert color="danger" sx={{ mb: 2 }}>
                  SETTINGS_ENCRYPTION_KEY is not configured on the server — saving an API key will fail until it is set.
                </Alert>
              )}

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                <FormControl sx={{ gridColumn: { md: "1 / -1" } }}>
                  <FormLabel>API Base URL</FormLabel>
                  <Input
                    value={externalApiForm.base_url || ""}
                    onChange={(e) => updateExternalApiForm("base_url", e.target.value)}
                    placeholder="http://<host>:<port>/api/directory/v1"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>API Key</FormLabel>
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={externalApiForm.api_key || ""}
                    onChange={(e) => {
                      updateExternalApiForm("api_key", e.target.value);
                      setApiKeyKnown(true);
                    }}
                    placeholder={externalApiForm.has_api_key ? "" : "Not set"}
                    endDecorator={
                      <IconButton
                        variant="plain"
                        size="sm"
                        loading={apiKeyRevealing}
                        onClick={handleApiKeyEyeClick}
                        tabIndex={-1}
                      >
                        {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Request Timeout (seconds)</FormLabel>
                  <Input
                    type="number"
                    value={externalApiForm.timeout_seconds ?? ""}
                    onChange={(e) => updateExternalApiForm("timeout_seconds", parseInt(e.target.value) || 10)}
                    placeholder="10"
                  />
                </FormControl>

                <FormControl sx={{ display: "flex", alignItems: "flex-start" }}>
                  <FormLabel>Verify TLS Certificate</FormLabel>
                  <Switch
                    checked={externalApiForm.verify_tls ?? true}
                    onChange={(e) => updateExternalApiForm("verify_tls", e.target.checked)}
                    sx={{ mt: 0.5 }}
                  />
                </FormControl>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography level="title-sm" sx={{ mb: 1, fontWeight: 700 }}>
                آخر اختبار اتصال (Last Connection Test)
              </Typography>
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 2 }}>
                <Typography level="body-sm">
                  Result:{" "}
                  <Chip
                    size="sm"
                    variant="soft"
                    color={externalApiForm.last_test_status === "SUCCESS" ? "success" : externalApiForm.last_test_status === "FAILED" ? "danger" : "neutral"}
                  >
                    {externalApiForm.last_test_status || "never tested"}
                  </Chip>
                </Typography>
                <Typography level="body-sm" sx={{ color: theme.colors.textSecondary }}>
                  {externalApiForm.last_test_message}
                </Typography>
                <Typography level="body-sm" sx={{ color: theme.colors.textSecondary }}>
                  {externalApiForm.last_test_at ? new Date(externalApiForm.last_test_at).toLocaleString() : ""}
                </Typography>
              </Box>

              {/* Test Connection */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mb: 3 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  loading={externalApiTesting}
                  startDecorator={!externalApiTesting && <PlayArrowIcon />}
                  onClick={handleTestExternalApi}
                >
                  {externalApiTesting ? "جاري الاختبار..." : "اختبار الاتصال (Test Connection)"}
                </Button>

                {externalApiTestResult && (
                  <Alert
                    color={externalApiTestResult.success ? "success" : "danger"}
                    startDecorator={externalApiTestResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
                    sx={{ flex: 1, minWidth: 200, flexDirection: "column", alignItems: "flex-start", gap: 0.5 }}
                  >
                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                      {externalApiTestResult.message}
                    </Typography>
                    {externalApiTestResult.health && (
                      <Typography level="body-xs">
                        {externalApiTestResult.health.success ? "✓" : "✗"} Server reachable:{" "}
                        {externalApiTestResult.health.message}
                        {externalApiTestResult.health.duration_ms != null && ` (${externalApiTestResult.health.duration_ms}ms)`}
                      </Typography>
                    )}
                    {externalApiTestResult.auth && (
                      <Typography level="body-xs">
                        {externalApiTestResult.auth.success ? "✓" : "✗"} API key verified:{" "}
                        {externalApiTestResult.auth.message}
                        {externalApiTestResult.auth.duration_ms != null && ` (${externalApiTestResult.auth.duration_ms}ms)`}
                      </Typography>
                    )}
                  </Alert>
                )}
              </Box>

              {externalApiSaveMessage && (
                <Alert
                  color={externalApiSaveMessage.type === "success" ? "success" : "danger"}
                  sx={{ mb: 2 }}
                >
                  {externalApiSaveMessage.text}
                </Alert>
              )}

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  color="primary"
                  startDecorator={<SaveIcon />}
                  loading={externalApiSaving}
                  onClick={handleSaveExternalApi}
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
            </Card>
          </TabPanel>
        </Tabs>

        {/* ─── Action Buttons ─────────────────────────── */}
        {/* Hidden on the Hospital Directory API tab (index 2) — that tab has
            its own self-contained Test/Save actions and applies immediately,
            unlike the bootstrap tabs below which need Reload & Test / a
            restart. Showing both here would be confusing (two unrelated
            "Save Settings" buttons on screen at once). */}
        {activeTab !== 2 && (
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
        )}
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
