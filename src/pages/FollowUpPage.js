// src/pages/FollowUpPage.js
import React, { useState, useEffect } from "react";
import { Box, Typography, Card, Tabs, TabList, Tab, TabPanel, Button, Select, Option, Input, FormControl, FormLabel } from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import ActionCalendar from "../components/followUp/ActionCalendar";
import ActionDetailsModal from "../components/followUp/ActionDetailsModal";
import { mockFollowUpActions } from "../data/followUpData";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import ScheduleIcon from "@mui/icons-material/Schedule";
import Chip from "@mui/joy/Chip";

const FollowUpPage = () => {
  // Load actions from both mock data and localStorage (saved from feedback forms)
  const loadActions = () => {
    const savedActions = JSON.parse(localStorage.getItem('followUpActions') || '[]');
    return [...mockFollowUpActions, ...savedActions];
  };
  
  const [actions, setActions] = useState(loadActions());
  const [selectedAction, setSelectedAction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [delayDays, setDelayDays] = useState({});

  // Reload actions when component mounts or when coming from feedback page
  useEffect(() => {
    const handleStorageChange = () => {
      setActions(loadActions());
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also reload on focus (when returning to the page)
    window.addEventListener('focus', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  // Filter actions
  const filteredActions = actions.filter(action => {
    if (statusFilter !== "all" && action.status !== statusFilter) return false;
    if (priorityFilter !== "all" && action.priority !== priorityFilter) return false;
    if (departmentFilter !== "all" && action.department !== departmentFilter) return false;
    return true;
  });

  // Get unique departments
  const departments = [...new Set(actions.map(a => a.department))];

  // Statistics
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

  const handleMarkComplete = (actionId) => {
    const updatedActions = actions.map(action => 
      action.id === actionId 
        ? { ...action, status: "completed", completedDate: new Date().toISOString().split('T')[0] }
        : action
    );
    setActions(updatedActions);
    
    // Update localStorage
    const savedActions = JSON.parse(localStorage.getItem('followUpActions') || '[]');
    const updatedSavedActions = savedActions.map(action => 
      action.id === actionId 
        ? { ...action, status: "completed", completedDate: new Date().toISOString().split('T')[0] }
        : action
    );
    localStorage.setItem('followUpActions', JSON.stringify(updatedSavedActions));
  };

  const handleRequestDelay = (actionId) => {
    const action = actions.find(a => a.id === actionId);
    setSelectedAction(action);
    setModalOpen(true);
  };

  const handleDeleteAction = (actionId) => {
    if (window.confirm('هل أنت متأكد من إتمام هذا الإجراء؟')) {
      const updatedActions = actions.map(action => 
        action.id === actionId 
          ? { ...action, status: "completed", completedDate: new Date().toISOString().split('T')[0] }
          : action
      );
      setActions(updatedActions);
      
      // Update localStorage
      const savedActions = JSON.parse(localStorage.getItem('followUpActions') || '[]');
      const updatedSavedActions = savedActions.map(action => 
        action.id === actionId 
          ? { ...action, status: "completed", completedDate: new Date().toISOString().split('T')[0] }
          : action
      );
      localStorage.setItem('followUpActions', JSON.stringify(updatedSavedActions));
    }
  };

  const handleDelayActionByWeek = (actionId) => {
    const action = actions.find(a => a.id === actionId);
    if (action) {
      const currentDueDate = new Date(action.dueDate);
      currentDueDate.setDate(currentDueDate.getDate() + 7);
      const newDueDate = currentDueDate.toISOString().split('T')[0];
      
      const updatedAction = {
        ...action,
        dueDate: newDueDate,
        status: action.status === 'delayed' ? 'pending' : action.status,
        notes: (action.notes || '') + `\nتم التأجيل لمدة أسبوع في ${new Date().toLocaleDateString('ar-SA')}`
      };
      
      handleSaveAction(updatedAction);
    }
  };

  const handleDelayActionByDays = (actionId, days) => {
    const action = actions.find(a => a.id === actionId);
    if (action && days > 0) {
      const currentDueDate = new Date(action.dueDate);
      currentDueDate.setDate(currentDueDate.getDate() + parseInt(days));
      const newDueDate = currentDueDate.toISOString().split('T')[0];
      
      const updatedAction = {
        ...action,
        dueDate: newDueDate,
        status: action.status === 'delayed' ? 'pending' : action.status,
        notes: (action.notes || '') + `\nتم التأجيل لمدة ${days} يوم في ${new Date().toLocaleDateString('ar-SA')}`
      };
      
      handleSaveAction(updatedAction);
      
      // Reset delay days input
      setDelayDays(prev => ({ ...prev, [actionId]: '' }));
    }
  };

const handleSaveAction = (updatedAction) => {
  // 1️⃣ Update React state
  const updatedActions = actions.map(action =>
    action.id === updatedAction.id ? updatedAction : action
  );
  setActions(updatedActions);

  // 2️⃣ Sync to localStorage
  const savedActions = JSON.parse(localStorage.getItem('followUpActions') || '[]');
  const updatedSavedActions = savedActions.map(action =>
    action.id === updatedAction.id ? updatedAction : action
  );
  localStorage.setItem('followUpActions', JSON.stringify(updatedSavedActions));
};

  const handleRefresh = () => {
    // Reload actions from localStorage and mock data
    setActions(loadActions());
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography level="h4" sx={{ fontWeight: 800, mb: 1, color: "#667eea" }}>
            📅 متابعة الإجراءات (Follow Up Actions)
          </Typography>
          <Typography level="body-sm" sx={{ color: "#666" }}>
            متابعة وإدارة الإجراءات التصحيحية المطلوبة من الأقسام المختلفة
          </Typography>
        </Box>

        {/* Statistics Cards */}
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

        {/* Filters */}
        <Card sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterListIcon sx={{ color: "#667eea" }} />
              <Typography level="body-sm" sx={{ fontWeight: 700 }}>تصفية:</Typography>
            </Box>

            <Select
              size="sm"
              value={statusFilter}
              onChange={(e, value) => setStatusFilter(value)}
              sx={{ minWidth: 150 }}
            >
              <Option value="all">جميع الحالات</Option>
              <Option value="pending">معلق</Option>
              <Option value="delayed">متأخر</Option>
              <Option value="completed">مكتمل</Option>
            </Select>

            <Select
              size="sm"
              value={priorityFilter}
              onChange={(e, value) => setPriorityFilter(value)}
              sx={{ minWidth: 150 }}
            >
              <Option value="all">جميع الأولويات</Option>
              <Option value="high">عاجل</Option>
              <Option value="medium">متوسط</Option>
              <Option value="low">عادي</Option>
            </Select>

            <Select
              size="sm"
              value={departmentFilter}
              onChange={(e, value) => setDepartmentFilter(value)}
              sx={{ minWidth: 180 }}
            >
              <Option value="all">جميع الأقسام</Option>
              {departments.map(dept => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
            </Select>

            <Button
              size="sm"
              variant="outlined"
              startDecorator={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ ml: "auto" }}
            >
              تحديث
            </Button>
          </Box>
        </Card>

        {/* Calendar View */}
        <ActionCalendar 
          actions={filteredActions} 
          onActionClick={handleActionClick}
          onDeleteAction={handleDeleteAction}
          onDelayAction={handleDelayActionByWeek}
        />

        {/* Action Summary Sections */}
        <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 3 }}>
          {(() => {
            // Calculate all action groups first to get running totals
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

            const next8to14Days = filteredActions.filter(action => {
              const dueDate = new Date(action.dueDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const in8Days = new Date(today);
              in8Days.setDate(today.getDate() + 8);
              const in14Days = new Date(today);
              in14Days.setDate(today.getDate() + 14);
              return dueDate >= in8Days && dueDate <= in14Days && action.status === "pending";
            });

            let cumulativeCount = 0;

            return (
              <>
                {/* Overdue Actions */}
                {overdueActions.length > 0 && (
                  <Card sx={{ p: 2, borderRadius: "8px", background: "rgba(255, 71, 87, 0.05)", border: "1px solid rgba(255, 71, 87, 0.2)" }}>
                    <Typography level="h6" sx={{ mb: 2, color: "#ff4757", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
                      🚨 Overdue Action Items ({overdueActions.length})
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {overdueActions.map((action, index) => {
                        const itemNumber = cumulativeCount + index + 1;
                        return (
                          <Box key={action.id} sx={{ p: 1.5, borderRadius: "6px", background: "white", borderLeft: "3px solid #ff4757", display: "flex", alignItems: "center", gap: 2 }}>
                            <Chip 
                              size="sm" 
                              variant="solid" 
                              sx={{ 
                                background: "#ff4757", 
                                minWidth: "30px", 
                                fontWeight: 700,
                                fontSize: "0.85rem"
                              }}
                            >
                              {itemNumber}
                            </Chip>
                            <Box sx={{ flex: 1 }}>
                              <Typography level="body-sm" sx={{ fontWeight: 700 }}>{action.actionTitle}</Typography>
                              <Typography level="body-xs" sx={{ color: "#666" }}>
                                📍 {action.department} • 👤 {action.assignedTo} • 📅 {new Date(action.dueDate).toLocaleDateString("ar-EG")}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Input
                                size="sm"
                                type="number"
                                placeholder="Days"
                                value={delayDays[action.id] || ''}
                                onChange={(e) => setDelayDays(prev => ({ ...prev, [action.id]: e.target.value }))}
                                sx={{ width: "70px" }}
                              />
                              <Button
                                size="sm"
                                color="warning"
                                variant="soft"
                                startDecorator={<ScheduleIcon />}
                                onClick={() => handleDelayActionByDays(action.id, delayDays[action.id])}
                                disabled={!delayDays[action.id] || delayDays[action.id] <= 0}
                              >
                                Delay
                              </Button>
                              <Button
                                size="sm"
                                color="danger"
                                variant="soft"
                                startDecorator={<DeleteIcon />}
                                onClick={() => handleDeleteAction(action.id)}
                              >
                                Delete
                              </Button>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Card>
                )}

                {/* Next 7 Days */}
                {(() => {
                  cumulativeCount += overdueActions.length;
                  if (next7Days.length === 0) return null;

                  return (
                    <Card sx={{ p: 2, borderRadius: "8px", background: "rgba(255, 165, 2, 0.05)", border: "1px solid rgba(255, 165, 2, 0.2)" }}>
                      <Typography level="h6" sx={{ mb: 2, color: "#ffa502", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
                        ⚠️ Action Items in the Next 7 Days ({next7Days.length})
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {next7Days.map((action, index) => {
                          const itemNumber = cumulativeCount + index + 1;
                          return (
                            <Box key={action.id} sx={{ p: 1.5, borderRadius: "6px", background: "white", borderLeft: "3px solid #ffa502", display: "flex", alignItems: "center", gap: 2 }}>
                              <Chip 
                                size="sm" 
                                variant="solid" 
                                sx={{ 
                                  background: "#ffa502", 
                                  minWidth: "30px", 
                                  fontWeight: 700,
                                  fontSize: "0.85rem"
                                }}
                              >
                                {itemNumber}
                              </Chip>
                              <Box sx={{ flex: 1 }}>
                                <Typography level="body-sm" sx={{ fontWeight: 700 }}>{action.actionTitle}</Typography>
                                <Typography level="body-xs" sx={{ color: "#666" }}>
                                  📍 {action.department} • 👤 {action.assignedTo} • 📅 {new Date(action.dueDate).toLocaleDateString("ar-EG")}
                                </Typography>
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Input
                                  size="sm"
                                  type="number"
                                  placeholder="Days"
                                  value={delayDays[action.id] || ''}
                                  onChange={(e) => setDelayDays(prev => ({ ...prev, [action.id]: e.target.value }))}
                                  sx={{ width: "70px" }}
                                />
                                <Button
                                  size="sm"
                                  color="warning"
                                  variant="soft"
                                  startDecorator={<ScheduleIcon />}
                                  onClick={() => handleDelayActionByDays(action.id, delayDays[action.id])}
                                  disabled={!delayDays[action.id] || delayDays[action.id] <= 0}
                                >
                                  Delay
                                </Button>
                                <Button
                                  size="sm"
                                  color="danger"
                                  variant="soft"
                                  startDecorator={<DeleteIcon />}
                                  onClick={() => handleDeleteAction(action.id)}
                                >
                                  Delete
                                </Button>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Card>
                  );
                })()}

                {/* Next 8-14 Days */}
                {(() => {
                  cumulativeCount += next7Days.length;
                  if (next8to14Days.length === 0) return null;

                  return (
                    <Card sx={{ p: 2, borderRadius: "8px", background: "rgba(30, 144, 255, 0.05)", border: "1px solid rgba(30, 144, 255, 0.2)" }}>
                      <Typography level="h6" sx={{ mb: 2, color: "#1e90ff", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
                        📋 الإجراءات القادمة - الأيام 8-14 ({next8to14Days.length})
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {next8to14Days.map((action, index) => {
                          const itemNumber = cumulativeCount + index + 1;
                          return (
                            <Box key={action.id} sx={{ p: 1.5, borderRadius: "6px", background: "white", borderLeft: "3px solid #1e90ff", display: "flex", alignItems: "center", gap: 2 }}>
                              <Chip 
                                size="sm" 
                                variant="solid" 
                                sx={{ 
                                  background: "#1e90ff", 
                                  minWidth: "30px", 
                                  fontWeight: 700,
                                  fontSize: "0.85rem"
                                }}
                              >
                                {itemNumber}
                              </Chip>
                              <Box sx={{ flex: 1 }}>
                                <Typography level="body-sm" sx={{ fontWeight: 700 }}>{action.actionTitle}</Typography>
                                <Typography level="body-xs" sx={{ color: "#666" }}>
                                  📍 {action.department} • 👤 {action.assignedTo} • 📅 {new Date(action.dueDate).toLocaleDateString("ar-EG")}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Card>
                  );
                })()}
              </>
            );
          })()}
        </Box>

        {/* Action Details Modal */}
        <ActionDetailsModal
          action={selectedAction}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveAction}
        />
      </Box>
    </MainLayout>
  );
};

export default FollowUpPage;
