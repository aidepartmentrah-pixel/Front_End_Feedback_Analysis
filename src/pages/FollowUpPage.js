// src/pages/FollowUpPage.js
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Typography, Card, Button, Select, Option, Input, FormControl, FormLabel, Alert, CircularProgress } from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import ActionCalendar from "../components/followUp/ActionCalendar";
import ActionDetailsModal from "../components/followUp/ActionDetailsModal";
import { 
  getAllActionItems,
  getActionItemsByIncident, 
  getActionItemsBySeasonalReport, 
  getActionItemsBySeason,
  markActionItemDone,  delayActionItem,  transformActionItems 
} from "../api/actionItems";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ClearIcon from "@mui/icons-material/Clear";
import Chip from "@mui/joy/Chip";

const FollowUpPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [actions, setActions] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [delayDays, setDelayDays] = useState({});

  // Data source mode: 'empty' or 'api'
  const [dataSource, setDataSource] = useState("empty");
  
  // Parent filter state
  const [incidentCaseId, setIncidentCaseId] = useState("");
  const [seasonalReportId, setSeasonalReportId] = useState("");
  const [seasonCaseId, setSeasonCaseId] = useState("");
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check URL params for filters on mount, otherwise load all actions
  useEffect(() => {
    const incidentId = searchParams.get('incidentCaseId');
    const reportId = searchParams.get('seasonalReportId');
    const seasonId = searchParams.get('seasonCaseId');
    
    if (incidentId) {
      setIncidentCaseId(incidentId);
      loadIncidentActions(incidentId);
    } else if (reportId) {
      setSeasonalReportId(reportId);
      loadSeasonalReportActions(reportId);
    } else if (seasonId) {
      setSeasonCaseId(seasonId);
      loadSeasonActions(seasonId);
    } else {
      // Load all actions by default
      loadAllActions();
    }
  }, []);

  const loadAllActions = async () => {
    try {
      setLoading(true);
      setError(null);
      setDataSource("api");
      const data = await getAllActionItems();
      const transformedActions = transformActionItems(data);
      setActions(transformedActions);
    } catch (err) {
      setError(err.message || "Failed to load action items");
      setActions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadIncidentActions = async (caseId) => {
    try {
      setLoading(true);
      setError(null);
      setDataSource("api");
      const data = await getActionItemsByIncident(caseId);
      const transformedActions = transformActionItems(data);
      setActions(transformedActions);
    } catch (err) {
      setError(err.message || "Failed to load incident action items");
      setActions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSeasonalReportActions = async (reportId) => {
    try {
      setLoading(true);
      setError(null);
      setDataSource("api");
      const data = await getActionItemsBySeasonalReport(reportId);
      const transformedActions = transformActionItems(data);
      setActions(transformedActions);
    } catch (err) {
      setError(err.message || "Failed to load seasonal report action items");
      setActions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSeasonActions = async (caseId) => {
    try {
      setLoading(true);
      setError(null);
      setDataSource("api");
      const data = await getActionItemsBySeason(caseId);
      const transformedActions = transformActionItems(data);
      setActions(transformedActions);
    } catch (err) {
      setError(err.message || "Failed to load season case action items");
      setActions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredActions = actions.filter(action => {
    if (statusFilter !== "all" && action.status !== statusFilter) return false;
    if (priorityFilter !== "all" && action.priority !== priorityFilter) return false;
    if (departmentFilter !== "all" && action.department !== departmentFilter) return false;
    return true;
  });

  const departments = [...new Set(actions.map(a => a.department))];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const stats = {
    actionsToTake: filteredActions.filter(a => a.status === "pending").length,
    overdue: filteredActions.filter(a => {
      const dueDate = new Date(a.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today && a.status === "pending";
    }).length
  };

  const handleActionClick = (action) => {
    setSelectedAction(action);
    setModalOpen(true);
  };

  const handleMarkComplete = async (actionId) => {
    try {
      await markActionItemDone(actionId);
      const updatedActions = actions.map(action => 
        action.id === actionId 
          ? { ...action, isDone: true, status: "completed", dateSubmitted: new Date().toISOString().split('T')[0] }
          : action
      );
      setActions(updatedActions);
    } catch (err) {
      alert(`Failed to mark action as complete: ${err.message}`);
    }
  };

  const handleDeleteAction = async (actionId) => {
    if (window.confirm('هل أنت متأكد من إتمام هذا الإجراء؟')) {
      await handleMarkComplete(actionId);
    }
  };

  const handleSaveAction = (updatedAction) => {
    const updatedActions = actions.map(action =>
      action.id === updatedAction.id ? updatedAction : action
    );
    setActions(updatedActions);
  };

  const handleDelayAction = async (actionId) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) return;

    // Prompt user for number of days with preset options
    const choice = window.prompt(
      `تأجيل الإجراء: ${action.actionTitle}\n\n` +
      'أدخل عدد الأيام للتأجيل:\n' +
      '• 1 = يوم واحد\n' +
      '• 3 = ثلاثة أيام\n' +
      '• 7 = أسبوع واحد\n' +
      '• 14 = أسبوعين\n' +
      '• 30 = شهر واحد\n\n' +
      'أو أدخل أي رقم آخر:',
      '7'
    );

    if (!choice) return; // User cancelled

    const delayDays = parseInt(choice, 10);
    if (isNaN(delayDays) || delayDays <= 0) {
      alert('الرجاء إدخال رقم صحيح أكبر من 0');
      return;
    }

    try {
      // Call backend API to delay the action
      const { delayActionItem } = await import('../api/actionItems');
      const updatedAction = await delayActionItem(actionId, delayDays);
      
      // Update the action in state with the response from backend
      const updatedActions = actions.map(a =>
        a.id === actionId 
          ? { ...a, dueDate: updatedAction.dueDate }
          : a
      );
      setActions(updatedActions);
      
      alert(`✅ تم تأجيل الإجراء ${delayDays} يوم\nالموعد الجديد: ${updatedAction.dueDate}`);
    } catch (err) {
      alert(`❌ فشل تأجيل الإجراء: ${err.message}`);
    }
  };

  const handleRefresh = () => {
    if (incidentCaseId) {
      loadIncidentActions(incidentCaseId);
    } else if (seasonalReportId) {
      loadSeasonalReportActions(seasonalReportId);
    } else if (seasonCaseId) {
      loadSeasonActions(seasonCaseId);
    } else {
      loadAllActions();
    }
  };

  const handleApplyIncidentFilter = () => {
    if (!incidentCaseId || incidentCaseId.trim() === "") {
      alert("Please enter an Incident Case ID");
      return;
    }
    setSeasonalReportId("");
    setSeasonCaseId("");
    setSearchParams({ incidentCaseId });
    loadIncidentActions(incidentCaseId);
  };

  const handleApplySeasonalReportFilter = () => {
    if (!seasonalReportId || seasonalReportId.trim() === "") {
      alert("Please enter a Seasonal Report ID");
      return;
    }
    setIncidentCaseId("");
    setSeasonCaseId("");
    setSearchParams({ seasonalReportId });
    loadSeasonalReportActions(seasonalReportId);
  };

  const handleApplySeasonFilter = () => {
    if (!seasonCaseId || seasonCaseId.trim() === "") {
      loadAllActions();
      return;
    }
    setIncidentCaseId("");
    setSeasonalReportId("");
    setSearchParams({ seasonCaseId });
    loadSeasonActions(seasonCaseId);
  };

  const handleClearAllFilters = () => {
    setIncidentCaseId("");
    setSeasonalReportId("");
    setSeasonCaseId("");
    setError(null);
    setSearchParams({});
    setActions([]);
    setDataSource("empty");
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography level="h4" sx={{ fontWeight: 800, mb: 1, color: "#667eea" }}>
            📅 متابعة الإجراءات (Follow Up Actions)
          </Typography>
          <Typography level="body-sm" sx={{ color: "#666" }}>
            متابعة وإدارة الإجراءات التصحيحية المطلوبة من الأقسام المختلفة
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 2, mb: 3 }}>
          <Card sx={{ p: 2, background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)" }}>
            <Typography level="body-xs" sx={{ color: "#666", mb: 0.5 }}>إجراءات يجب اتخاذها</Typography>
            <Typography level="h4" sx={{ fontWeight: 800, color: "#667eea" }}>{stats.actionsToTake}</Typography>
            <Typography level="body-xs" sx={{ color: "#999" }}>Actions to Take</Typography>
          </Card>

          <Card sx={{ p: 2, background: "linear-gradient(135deg, rgba(255, 71, 87, 0.1) 0%, rgba(255, 99, 71, 0.1) 100%)" }}>
            <Typography level="body-xs" sx={{ color: "#666", mb: 0.5 }}>إجراءات متأخرة</Typography>
            <Typography level="h4" sx={{ fontWeight: 800, color: "#ff4757" }}>{stats.overdue}</Typography>
            <Typography level="body-xs" sx={{ color: "#999" }}>Overdue Actions</Typography>
          </Card>
        </Box>

        {(incidentCaseId || seasonalReportId || seasonCaseId) && (
          <Alert color="primary" sx={{ mb: 2 }} endDecorator={
            <Button size="sm" variant="plain" color="primary" startDecorator={<ClearIcon />} onClick={handleClearAllFilters}>Clear Filter</Button>
          }>
            📊 <strong>
              {incidentCaseId && `Filtered by Incident Case #${incidentCaseId}`}
              {seasonalReportId && `Filtered by Seasonal Report #${seasonalReportId}`}
              {seasonCaseId && `Filtered by Season Case #${seasonCaseId}`}
            </strong> - Showing {actions.length} action item(s)
          </Alert>
        )}

        {error && (
          <Alert color="danger" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>
        )}

        <Card sx={{ p: 2, mb: 3 }}>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 3 }}>
              <CircularProgress />
              <Typography level="body-sm" sx={{ ml: 2 }}>Loading action items...</Typography>
            </Box>
          )}
          
          {!loading && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", pb: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FilterListIcon sx={{ color: "#667eea" }} />
                  <Typography level="body-sm" sx={{ fontWeight: 700 }}>Parent Filter:</Typography>
                </Box>

                <FormControl size="sm" sx={{ minWidth: 180 }}>
                  <FormLabel sx={{ fontSize: "0.75rem" }}>Incident Case ID</FormLabel>
                  <Input size="sm" type="number" placeholder="Enter Case ID..." value={incidentCaseId}
                    onChange={(e) => setIncidentCaseId(e.target.value)} disabled={loading || !!seasonalReportId || !!seasonCaseId} />
                </FormControl>
                <Button size="sm" color="primary" onClick={handleApplyIncidentFilter} loading={loading}
                  disabled={!incidentCaseId || incidentCaseId.trim() === "" || !!seasonalReportId || !!seasonCaseId}>Apply</Button>

                <FormControl size="sm" sx={{ minWidth: 180 }}>
                  <FormLabel sx={{ fontSize: "0.75rem" }}>Seasonal Report ID</FormLabel>
                  <Input size="sm" type="number" placeholder="Enter Report ID..." value={seasonalReportId}
                    onChange={(e) => setSeasonalReportId(e.target.value)} disabled={loading || !!incidentCaseId || !!seasonCaseId} />
                </FormControl>
                <Button size="sm" color="primary" onClick={handleApplySeasonalReportFilter} loading={loading}
                  disabled={!seasonalReportId || seasonalReportId.trim() === "" || !!incidentCaseId || !!seasonCaseId}>Apply</Button>

                <FormControl size="sm" sx={{ minWidth: 180 }}>
                  <FormLabel sx={{ fontSize: "0.75rem" }}>Season Case ID</FormLabel>
                  <Input size="sm" type="number" placeholder="Enter Season ID..." value={seasonCaseId}
                    onChange={(e) => setSeasonCaseId(e.target.value)} disabled={loading || !!incidentCaseId || !!seasonalReportId} />
                </FormControl>
                <Button size="sm" color="primary" onClick={handleApplySeasonFilter} loading={loading}
                  disabled={!seasonCaseId || seasonCaseId.trim() === "" || !!incidentCaseId || !!seasonalReportId}>Apply</Button>

                {(incidentCaseId || seasonalReportId || seasonCaseId) && (
                  <Button size="sm" variant="outlined" color="neutral" startDecorator={<ClearIcon />} onClick={handleClearAllFilters}>Clear All</Button>
                )}

                <Typography level="body-xs" sx={{ color: "#999", ml: "auto" }}>ℹ️ Filter by one parent type at a time</Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Typography level="body-sm" sx={{ fontWeight: 700 }}>Additional Filters:</Typography>
                <Select size="sm" value={statusFilter} onChange={(e, value) => setStatusFilter(value)} sx={{ minWidth: 150 }} disabled={loading}>
                  <Option value="all">جميع الحالات</Option>
                  <Option value="pending">معلق</Option>
                  <Option value="overdue">متأخر</Option>
                  <Option value="completed">مكتمل</Option>
                </Select>
                <Select size="sm" value={priorityFilter} onChange={(e, value) => setPriorityFilter(value)} sx={{ minWidth: 150 }} disabled={loading}>
                  <Option value="all">جميع الأولويات</Option>
                  <Option value="high">عاجل</Option>
                  <Option value="medium">متوسط</Option>
                  <Option value="low">عادي</Option>
                </Select>
                <Select size="sm" value={departmentFilter} onChange={(e, value) => setDepartmentFilter(value)} sx={{ minWidth: 180 }} disabled={loading}>
                  <Option value="all">جميع الأقسام</Option>
                  {departments.map(dept => (<Option key={dept} value={dept}>{dept}</Option>))}
                </Select>
                <Button size="sm" variant="outlined" startDecorator={<RefreshIcon />} onClick={handleRefresh} disabled={loading} sx={{ ml: "auto" }}>تحديث</Button>
                {dataSource === "api" && (<Chip size="sm" color="success" variant="soft">🔗 API Data</Chip>)}
              </Box>
            </Box>
          )}
        </Card>

        {!loading && actions.length === 0 && (
          <Card sx={{ p: 4, textAlign: "center", mb: 3 }}>
            <Typography level="h6" sx={{ mb: 1, color: "#999" }}>📭 No Action Items Found</Typography>
            <Typography level="body-sm" sx={{ color: "#666" }}>
              There are currently no action items to display. Action items will appear here when they are created from explanations.
            </Typography>
          </Card>
        )}

        {actions.length > 0 && (
          <ActionCalendar 
            actions={filteredActions} 
            onActionClick={handleActionClick} 
            onDeleteAction={handleDeleteAction}
            onDelayAction={handleDelayAction}
          />
        )}

        {/* Action Summary Sections */}
        {actions.length > 0 && (
          <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 3 }}>
            {(() => {
              const overdueActions = filteredActions.filter(action => {
                const dueDate = new Date(action.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return dueDate < today && action.status === "pending";
              });

              const next7Days = filteredActions.filter(action => {
                const dueDate = new Date(action.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const in7Days = new Date(today);
                in7Days.setDate(today.getDate() + 7);
                return dueDate >= today && dueDate <= in7Days && action.status === "pending";
              });

              return (
                <>
                  {/* Overdue Actions */}
                  {overdueActions.length > 0 && (
                    <Card sx={{ p: 2, borderRadius: "8px", background: "rgba(255, 71, 87, 0.05)", border: "1px solid rgba(255, 71, 87, 0.2)" }}>
                      <Typography level="h6" sx={{ mb: 2, color: "#ff4757", fontWeight: 700 }}>
                        🚨 Overdue Action Items ({overdueActions.length})
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {overdueActions.map((action) => (
                          <Box key={action.id} sx={{ p: 1.5, borderRadius: "6px", background: "white", borderLeft: "3px solid #ff4757", display: "flex", alignItems: "center", gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography level="body-sm" sx={{ fontWeight: 700 }}>{action.actionTitle}</Typography>
                              <Typography level="body-xs" sx={{ color: "#666" }}>
                                📍 {action.department} • 👤 {action.assignedTo} • 📅 {action.dueDate}
                              </Typography>
                            </Box>
                            <Button size="sm" color="danger" variant="soft" startDecorator={<DeleteIcon />} onClick={() => handleDeleteAction(action.id)}>
                              Complete
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    </Card>
                  )}

                  {/* Next 7 Days */}
                  {next7Days.length > 0 && (
                    <Card sx={{ p: 2, borderRadius: "8px", background: "rgba(255, 165, 2, 0.05)", border: "1px solid rgba(255, 165, 2, 0.2)" }}>
                      <Typography level="h6" sx={{ mb: 2, color: "#ffa502", fontWeight: 700 }}>
                        ⚠️ Action Items in the Next 7 Days ({next7Days.length})
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {next7Days.map((action) => (
                          <Box key={action.id} sx={{ p: 1.5, borderRadius: "6px", background: "white", borderLeft: "3px solid #ffa502", display: "flex", alignItems: "center", gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography level="body-sm" sx={{ fontWeight: 700 }}>{action.actionTitle}</Typography>
                              <Typography level="body-xs" sx={{ color: "#666" }}>
                                📍 {action.department} • 👤 {action.assignedTo} • 📅 {action.dueDate}
                              </Typography>
                            </Box>
                            <Button size="sm" color="success" variant="soft" onClick={() => handleDeleteAction(action.id)}>
                              Complete
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    </Card>
                  )}
                </>
              );
            })()}
          </Box>
        )}

        <ActionDetailsModal action={selectedAction} open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveAction} />
      </Box>
    </MainLayout>
  );
};

export default FollowUpPage;
