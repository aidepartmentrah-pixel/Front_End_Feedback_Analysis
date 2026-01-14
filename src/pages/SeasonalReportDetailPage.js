// src/pages/SeasonalReportDetailPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Button,
  Textarea,
  Select,
  Option,
  Stack,
  Divider,
  Chip,
  Table,
  Sheet,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  IconButton,
} from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import {
  getSeasonalReportById,
  saveSeasonalReportExplanation,
  getActionItemsBySeasonalReport,
  exportSeasonalReport,
} from "../api/seasonalReports";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";

const SeasonalReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Report state
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [errorReport, setErrorReport] = useState(null);

  // Action items state
  const [actionItems, setActionItems] = useState([]);
  const [loadingActions, setLoadingActions] = useState(true);
  const [errorActions, setErrorActions] = useState(null);

  // Explanation form state
  const [explanationStatusId, setExplanationStatusId] = useState(null);
  const [explanationText, setExplanationText] = useState("");
  const [savingExplanation, setSavingExplanation] = useState(false);
  const [explanationSuccess, setExplanationSuccess] = useState(false);

  // Action items UI state
  const [editingActionId, setEditingActionId] = useState(null);
  const [newActionItem, setNewActionItem] = useState({
    actionTitle: "",
    dueDate: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Export state
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingWord, setExportingWord] = useState(false);

  // Explanation status options (can be moved to reference data later)
  const explanationStatuses = [
    { id: 1, name: "Not Started", name_ar: "لم تبدأ" },
    { id: 2, name: "In Progress", name_ar: "قيد التنفيذ" },
    { id: 3, name: "Completed", name_ar: "مكتمل" },
    { id: 4, name: "Needs Review", name_ar: "يحتاج مراجعة" },
  ];

  // Load report on mount
  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoadingReport(true);
        setErrorReport(null);
        const data = await getSeasonalReportById(id);
        console.log("✅ Report loaded:", data);
        setReport(data);
        setExplanationStatusId(data.explanationStatusId || null);
        setExplanationText(data.explanationText || "");
      } catch (err) {
        console.error("❌ Failed to load report:", err);
        setErrorReport(err.message || "Failed to load report");
      } finally {
        setLoadingReport(false);
      }
    };

    loadReport();
  }, [id]);

  // Load action items on mount
  useEffect(() => {
    const loadActionItems = async () => {
      try {
        setLoadingActions(true);
        setErrorActions(null);
        const data = await getActionItemsBySeasonalReport(id);
        console.log("✅ Action items loaded:", data);
        setActionItems(data);
      } catch (err) {
        console.error("❌ Failed to load action items:", err);
        setErrorActions(err.message || "Failed to load action items");
      } finally {
        setLoadingActions(false);
      }
    };

    loadActionItems();
  }, [id]);

  // Save explanation
  const handleSaveExplanation = async () => {
    if (!explanationStatusId) {
      alert("Please select an explanation status");
      return;
    }

    try {
      setSavingExplanation(true);
      setExplanationSuccess(false);

      await saveSeasonalReportExplanation(id, {
        explanationStatusId,
        explanationText: explanationText || "",
      });

      console.log("✅ Explanation saved");
      setExplanationSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setExplanationSuccess(false), 3000);
    } catch (err) {
      console.error("❌ Failed to save explanation:", err);
      alert(err.message || "Failed to save explanation");
    } finally {
      setSavingExplanation(false);
    }
  };

  // Toggle action item done status
  const handleToggleActionDone = (actionId) => {
    setActionItems((prev) =>
      prev.map((item) =>
        item.actionItemId === actionId
          ? { ...item, isDone: !item.isDone }
          : item
      )
    );
    // TODO: Call API to update action item status
  };

  // Add new action item (placeholder - needs API endpoint)
  const handleAddActionItem = () => {
    if (!newActionItem.actionTitle.trim()) {
      alert("Please enter action title");
      return;
    }

    const newItem = {
      actionItemId: Date.now(), // Temporary ID
      actionTitle: newActionItem.actionTitle,
      isDone: false,
      dueDate: newActionItem.dueDate || null,
    };

    setActionItems((prev) => [...prev, newItem]);
    setNewActionItem({ actionTitle: "", dueDate: "" });
    setShowAddForm(false);

    // TODO: Call API to create action item
  };

  // Delete action item (placeholder - needs API endpoint)
  const handleDeleteActionItem = (actionId) => {
    if (!window.confirm("Are you sure you want to delete this action item?")) {
      return;
    }

    setActionItems((prev) =>
      prev.filter((item) => item.actionItemId !== actionId)
    );

    // TODO: Call API to delete action item
  };

  // Export to PDF
  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      console.log("📄 Exporting report to PDF...");

      const blob = await exportSeasonalReport(id, "pdf");

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `seasonal_report_${id}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("✅ PDF exported successfully");
    } catch (err) {
      console.error("❌ Failed to export PDF:", err);
      alert(err.message || "Failed to export report to PDF");
    } finally {
      setExportingPDF(false);
    }
  };

  // Export to Word
  const handleExportWord = async () => {
    try {
      setExportingWord(true);
      console.log("📄 Exporting report to Word...");

      const blob = await exportSeasonalReport(id, "docx");

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `seasonal_report_${id}_${new Date().toISOString().split("T")[0]}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("✅ Word document exported successfully");
    } catch (err) {
      console.error("❌ Failed to export Word:", err);
      alert(err.message || "Failed to export report to Word");
    } finally {
      setExportingWord(false);
    }
  };

  if (loadingReport) {
    return (
      <MainLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!report) {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}>
          <Alert color="warning">Report not found</Alert>
          <Button
            sx={{ mt: 2 }}
            startDecorator={<ArrowBackIcon />}
            onClick={() => navigate("/seasonal-reports")}
          >
            Back to Dashboard
          </Button>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="plain"
            startDecorator={<ArrowBackIcon />}
            onClick={() => navigate("/seasonal-reports")}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>

          <Typography level="h2" sx={{ mb: 1 }}>
            📊 Seasonal Report #{report.seasonalReportId}
          </Typography>

          <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
            <Chip size="sm" variant="outlined">
              Season ID: {report.seasonId}
            </Chip>
            <Chip size="sm" variant="outlined">
              Org Unit: {report.orgUnitId} (Type {report.orgUnitType})
            </Chip>
            <Chip size="sm" variant="outlined">
              Total Cases: {report.totalCases || 0}
            </Chip>
            <Chip size="sm" variant="outlined">
              Evaluated: {new Date(report.evaluatedAt).toLocaleString()}
            </Chip>
          </Stack>

          {/* Export Buttons */}
          <Stack direction="row" spacing={2}>
            <Button
              color="danger"
              variant="solid"
              startDecorator={<PictureAsPdfIcon />}
              onClick={handleExportPDF}
              loading={exportingPDF}
              disabled={exportingWord}
            >
              {exportingPDF ? "Exporting..." : "Export to PDF"}
            </Button>
            <Button
              color="primary"
              variant="solid"
              startDecorator={<DescriptionIcon />}
              onClick={handleExportWord}
              loading={exportingWord}
              disabled={exportingPDF}
            >
              {exportingWord ? "Exporting..." : "Export to Word"}
            </Button>
          </Stack>
        </Box>

        {/* Compliance Banner */}
        <Card
          sx={{
            mb: 3,
            bgcolor: report.isCompliant ? "success.softBg" : "danger.softBg",
            borderColor: report.isCompliant ? "success.main" : "danger.main",
            borderWidth: 2,
          }}
        >
          <CardContent>
            <Typography
              level="h3"
              sx={{
                color: report.isCompliant ? "success.main" : "danger.main",
              }}
            >
              {report.isCompliant ? "✅ COMPLIANT" : "⚠️ NON-COMPLIANT"}
            </Typography>

            {!report.isCompliant && report.violatedRules && (
              <Box sx={{ mt: 2 }}>
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  Violated Rules:
                </Typography>
                <Typography level="body-md" sx={{ whiteSpace: "pre-wrap" }}>
                  {report.violatedRules}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Policy Display */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography level="title-lg" sx={{ mb: 2 }}>
              📋 Policy Targets
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography level="title-sm" sx={{ mb: 0.5 }}>
                  Target 1:
                </Typography>
                <Typography level="body-sm">
                  {report.target1 || "No target 1 specified"}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography level="title-sm" sx={{ mb: 0.5 }}>
                  Target 2:
                </Typography>
                <Typography level="body-sm">
                  {report.target2 || "No target 2 specified"}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* HCAT Statistics Table */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography level="title-lg" sx={{ mb: 2 }}>
              📊 HCAT Classification Statistics
            </Typography>

            {report.hcatStats && Array.isArray(report.hcatStats) ? (
              <Sheet sx={{ overflow: "auto" }}>
                <Table stripe="odd">
                  <thead>
                    <tr>
                      <th>Domain</th>
                      <th>Category</th>
                      <th>Subcategory</th>
                      <th>Classification</th>
                      <th style={{ textAlign: "right" }}>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.hcatStats.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.domain || "-"}</td>
                        <td>{row.category || "-"}</td>
                        <td>{row.subcategory || "-"}</td>
                        <td>{row.classification || "-"}</td>
                        <td style={{ textAlign: "right", fontWeight: "bold" }}>
                          {row.count || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan={4} style={{ textAlign: "right" }}>
                        Total:
                      </th>
                      <th style={{ textAlign: "right" }}>
                        {report.totalCases || 0}
                      </th>
                    </tr>
                  </tfoot>
                </Table>
              </Sheet>
            ) : (
              <Alert color="neutral">No classification statistics available</Alert>
            )}
          </CardContent>
        </Card>

        {/* Explanation Editor */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography level="title-lg" sx={{ mb: 2 }}>
              📝 Explanation & Response
            </Typography>

            {explanationSuccess && (
              <Alert color="success" sx={{ mb: 2 }}>
                ✅ Explanation saved successfully
              </Alert>
            )}

            <Stack spacing={2}>
              {/* Explanation Status */}
              <FormControl>
                <FormLabel>Explanation Status</FormLabel>
                <Select
                  value={explanationStatusId}
                  onChange={(e, value) => setExplanationStatusId(value)}
                  placeholder="Select status..."
                >
                  {explanationStatuses.map((status) => (
                    <Option key={status.id} value={status.id}>
                      {status.name}
                    </Option>
                  ))}
                </Select>
              </FormControl>

              {/* Explanation Text */}
              <FormControl>
                <FormLabel>Explanation Text</FormLabel>
                <Textarea
                  value={explanationText}
                  onChange={(e) => setExplanationText(e.target.value)}
                  placeholder="Enter explanation for non-compliance or compliance details..."
                  minRows={5}
                />
              </FormControl>

              {/* Save Button */}
              <Box>
                <Button
                  color="primary"
                  startDecorator={<SaveIcon />}
                  onClick={handleSaveExplanation}
                  loading={savingExplanation}
                >
                  {savingExplanation ? "Saving..." : "Save Explanation"}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Action Items Section */}
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography level="title-lg">🎯 Action Items</Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="sm"
                  variant="outlined"
                  onClick={() => navigate(`/follow-up?seasonalReportId=${id}`)}
                >
                  View in Follow-Up Page
                </Button>
                <Button
                  size="sm"
                  startDecorator={<AddIcon />}
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  Add Action Item
                </Button>
              </Stack>
            </Box>

            {errorActions && (
              <Alert color="danger" sx={{ mb: 2 }}>
                {errorActions}
              </Alert>
            )}

            {/* Add Action Item Form */}
            {showAddForm && (
              <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Stack spacing={2}>
                  <FormControl>
                    <FormLabel>Action Title</FormLabel>
                    <Input
                      value={newActionItem.actionTitle}
                      onChange={(e) =>
                        setNewActionItem({
                          ...newActionItem,
                          actionTitle: e.target.value,
                        })
                      }
                      placeholder="Enter action title..."
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <Input
                      type="date"
                      value={newActionItem.dueDate}
                      onChange={(e) =>
                        setNewActionItem({
                          ...newActionItem,
                          dueDate: e.target.value,
                        })
                      }
                    />
                  </FormControl>

                  <Stack direction="row" spacing={1}>
                    <Button size="sm" onClick={handleAddActionItem}>
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outlined"
                      color="neutral"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewActionItem({ actionTitle: "", dueDate: "" });
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            )}

            {/* Action Items List */}
            {loadingActions ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size="sm" />
              </Box>
            ) : actionItems.length === 0 ? (
              <Alert color="neutral">
                No action items yet. Add one to get started.
              </Alert>
            ) : (
              <Sheet sx={{ overflow: "auto" }}>
                <Table>
                  <thead>
                    <tr>
                      <th style={{ width: "50px" }}>Done</th>
                      <th>Action</th>
                      <th style={{ width: "150px" }}>Due Date</th>
                      <th style={{ width: "100px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actionItems.map((item) => (
                      <tr
                        key={item.actionItemId}
                        style={{
                          opacity: item.isDone ? 0.6 : 1,
                          textDecoration: item.isDone ? "line-through" : "none",
                        }}
                      >
                        <td>
                          <Checkbox
                            checked={item.isDone}
                            onChange={() =>
                              handleToggleActionDone(item.actionItemId)
                            }
                            color={item.isDone ? "success" : "neutral"}
                          />
                        </td>
                        <td>{item.actionTitle}</td>
                        <td>
                          {item.dueDate
                            ? new Date(item.dueDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="sm"
                              color="danger"
                              variant="plain"
                              onClick={() =>
                                handleDeleteActionItem(item.actionItemId)
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Sheet>
            )}
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
};

export default SeasonalReportDetailPage;
