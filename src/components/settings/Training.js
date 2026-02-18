// src/components/settings/Training.js
import React, { useState, useEffect, useMemo } from "react";
import { 
  Box, 
  Typography, 
  Card, 
  Table, 
  Button, 
  CircularProgress, 
  Alert,
  Chip,
  Select,
  Option,
  Slider,
  Radio,
  RadioGroup,
  Sheet,
  FormControl,
  FormLabel,
  IconButton,
  Divider,
  Badge
} from "@mui/joy";
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from "recharts";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import theme from '../../theme';
import * as trainingApi from '../../api/training';

const Training = () => {
  // State for grouped model data
  const [groupedStatus, setGroupedStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  
  // State for training progress
  const [trainingProgress, setTrainingProgress] = useState(null);
  const [progressPolling, setProgressPolling] = useState(null);
  
  // State for charts
  const [dbGrowthChart, setDbGrowthChart] = useState(null);
  const [performanceTrendsChart, setPerformanceTrendsChart] = useState(null);
  const [familyComparisonChart, setFamilyComparisonChart] = useState(null);
  const [chartsLoading, setChartsLoading] = useState(true);
  
  // State for training process
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Phase 5: Filter & Sort States
  const [groupBy, setGroupBy] = useState("family"); // "family" | "performance" | "record_count"
  const [sortMetric, setSortMetric] = useState("f1"); // "f1" | "accuracy" | "precision" | "recall" | "num_records"
  const [sortAscending, setSortAscending] = useState(false); // Descending by default

  // Fetch grouped model status (Phase 5)
  const fetchGroupedStatus = async () => {
    try {
      setStatusLoading(true);
      const data = await trainingApi.getGroupedStatus();
      console.log("Grouped status response:", data);
      setGroupedStatus(data);
    } catch (err) {
      console.error("Error fetching grouped status:", err);
      setError("Failed to load model status: " + err.message);
    } finally {
      setStatusLoading(false);
    }
  };

  // Fetch training progress (Phase 5)
  const fetchTrainingProgress = async () => {
    try {
      const data = await trainingApi.getTrainingProgress();
      console.log("Training progress:", data);
      setTrainingProgress(data);
      
      // If training is running, keep polling
      if (data.is_running) {
        if (!progressPolling) {
          const interval = setInterval(fetchTrainingProgress, 2500);
          setProgressPolling(interval);
        }
      } else {
        // Training finished, stop polling
        if (progressPolling) {
          clearInterval(progressPolling);
          setProgressPolling(null);
        }
      }
    } catch (err) {
      console.error("Error fetching training progress:", err);
    }
  };

  // Fetch all chart data (Phase 5)
  const fetchCharts = async () => {
    try {
      setChartsLoading(true);
      
      // Fetch all charts in parallel
      const [dbGrowth, perfTrends, familyComp] = await Promise.all([
        trainingApi.getDbGrowthChart(30),
        trainingApi.getPerformanceTrendsChart(),
        trainingApi.getFamilyComparisonChart()
      ]);
      
      console.log("Charts loaded:", { dbGrowth, perfTrends, familyComp });
      setDbGrowthChart(dbGrowth);
      setPerformanceTrendsChart(perfTrends);
      setFamilyComparisonChart(familyComp);
    } catch (err) {
      console.error("Error fetching charts:", err);
      setError("Failed to load chart data: " + err.message);
    } finally {
      setChartsLoading(false);
    }
  };

  // Start training
  const handleTraining = async () => {
    try {
      setIsTraining(true);
      setError(null);
      setSuccess(null);
      
      const data = await trainingApi.runTraining();
      console.log("Training started response:", data);
      setSuccess(`Training started successfully! Run ID: ${data.run_id}`);
      
      // Start polling for progress
      fetchTrainingProgress();
      
      // Refresh data after training completes
      setTimeout(() => {
        fetchGroupedStatus();
        fetchCharts();
      }, 1000);
      
    } catch (err) {
      console.error("Error starting training:", err);
      setError(err.message || "Failed to start training. Please check the console.");
    } finally {
      setIsTraining(false);
    }
  };

  // Phase 5: Filter and Sort Logic
  const processedModelData = useMemo(() => {
    if (!groupedStatus?.model_families) return null;
    
    // Flatten all models from all families
    const allModels = groupedStatus.model_families.flatMap(family => 
      family.models.map(model => ({
        ...model,
        family_key: family.family_key,
        family_name: family.family_name,
        family_name_ar: family.family_name_ar
      }))
    );
    
    // Sort models
    let sorted = [...allModels].sort((a, b) => {
      const aVal = a[sortMetric] || 0;
      const bVal = b[sortMetric] || 0;
      return sortAscending ? aVal - bVal : bVal - aVal;
    });
    
    // Group models based on groupBy setting
    if (groupBy === "family") {
      // Group by family
      const grouped = {};
      sorted.forEach(model => {
        const key = model.family_key;
        if (!grouped[key]) {
          grouped[key] = {
            name: model.family_name,
            name_ar: model.family_name_ar,
            models: []
          };
        }
        grouped[key].models.push(model);
      });
      return Object.entries(grouped).map(([key, value]) => ({
        key,
        ...value
      }));
      
    } else if (groupBy === "performance") {
      // Group by performance level
      const excellent = sorted.filter(m => m.f1 > 0.8);
      const good = sorted.filter(m => m.f1 >= 0.6 && m.f1 <= 0.8);
      const fair = sorted.filter(m => m.f1 >= 0.4 && m.f1 < 0.6);
      const poor = sorted.filter(m => m.f1 < 0.4);
      
      return [
        { key: "excellent", name: "Excellent (F1 > 80%)", name_ar: "ممتاز (F1 > 80%)", models: excellent },
        { key: "good", name: "Good (60-80%)", name_ar: "جيد (60-80%)", models: good },
        { key: "fair", name: "Fair (40-60%)", name_ar: "مقبول (40-60%)", models: fair },
        { key: "poor", name: "Poor (< 40%)", name_ar: "ضعيف (< 40%)", models: poor }
      ].filter(group => group.models.length > 0);
      
    } else if (groupBy === "record_count") {
      // Group by record count
      const wellTrained = sorted.filter(m => m.num_records > 200);
      const moderate = sorted.filter(m => m.num_records >= 50 && m.num_records <= 200);
      const sparse = sorted.filter(m => m.num_records < 50);
      
      return [
        { key: "well_trained", name: "Well-trained (>200 records)", name_ar: "مدرب جيداً (>200 سجل)", models: wellTrained },
        { key: "moderate", name: "Moderate (50-200 records)", name_ar: "متوسط (50-200 سجل)", models: moderate },
        { key: "sparse", name: "Sparse (<50 records)", name_ar: "قليل (<50 سجل)", models: sparse }
      ].filter(group => group.models.length > 0);
    }
    
    return [];
  }, [groupedStatus, groupBy, sortMetric, sortAscending]);

  // Initial data load
  useEffect(() => {
    fetchGroupedStatus();
    fetchCharts();
  }, []);

  // Poll status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchGroupedStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Cleanup progress polling on unmount
  useEffect(() => {
    return () => {
      if (progressPolling) {
        clearInterval(progressPolling);
      }
    };
  }, [progressPolling]);

  // Clear messages after timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Format date for display
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "success";
      case "running": return "warning";
      case "failed": return "danger";
      default: return "neutral";
    }
  };
  
  // Get alert icon and color
  const getAlertIcon = (severity) => {
    switch (severity) {
      case "critical": return <ErrorIcon />;
      case "warning": return <WarningIcon />;
      case "info": return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };
  
  const getAlertColor = (severity) => {
    switch (severity) {
      case "critical": return "danger";
      case "warning": return "warning";
      case "info": return "primary";
      default: return "neutral";
    }
  };
  
  // Get performance badge color
  const getPerformanceBadgeColor = (f1) => {
    if (f1 > 0.8) return "success";
    if (f1 >= 0.6) return "primary";
    if (f1 >= 0.4) return "warning";
    return "danger";
  };

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      {/* Alerts */}
      {error && (
        <Alert color="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert color="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Training Progress Banner */}
      {trainingProgress?.is_running && (
        <Alert 
          color="warning" 
          variant="soft"
          startDecorator={<CircularProgress size="sm" />}
        >
          <Box sx={{ width: "100%" }}>
            <Typography level="title-md">
              Training in Progress: {trainingProgress.current_model}
            </Typography>
            <Typography level="body-sm">
              Step {trainingProgress.current_step} of {trainingProgress.total_steps} ({trainingProgress.progress_percentage}%) • 
              {trainingProgress.estimated_remaining_seconds}s remaining
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Phase 5: Smart Grouping & Sorting */}
      <Card sx={{ p: 3, background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
        <Typography level="h3" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <SortIcon /> Grouping & Sorting
        </Typography>
        
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
          <FormControl>
            <FormLabel>Group By</FormLabel>
            <RadioGroup 
              value={groupBy} 
              onChange={(e) => setGroupBy(e.target.value)}
              orientation="horizontal"
            >
              <Radio value="family" label="Family" />
              <Radio value="performance" label="Performance" />
              <Radio value="record_count" label="Record Count" />
            </RadioGroup>
          </FormControl>
          
          <FormControl>
            <FormLabel sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SortIcon /> Sort By
            </FormLabel>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Select 
                value={sortMetric} 
                onChange={(e, newValue) => setSortMetric(newValue)}
                sx={{ flex: 1 }}
              >
                <Option value="f1">F1 Score</Option>
                <Option value="accuracy">Accuracy</Option>
                <Option value="precision">Precision</Option>
                <Option value="recall">Recall</Option>
                <Option value="num_records">Record Count</Option>
              </Select>
              <IconButton 
                onClick={() => setSortAscending(!sortAscending)}
                variant="outlined"
                color={sortAscending ? "primary" : "neutral"}
              >
                {sortAscending ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
              </IconButton>
            </Box>
          </FormControl>
        </Box>
      </Card>

      {/* Performance Alerts */}
      {groupedStatus?.alerts && groupedStatus.alerts.length > 0 && (
        <Card sx={{ p: 3 }}>
          <Typography level="h3" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Badge badgeContent={groupedStatus.alerts.length} color="danger">
              <WarningIcon />
            </Badge>
            Performance Alerts
          </Typography>
          
          <Box sx={{ display: "grid", gap: 2 }}>
            {groupedStatus.alerts.map((alert, index) => (
              <Alert 
                key={index}
                color={getAlertColor(alert.severity)}
                variant="soft"
                startDecorator={getAlertIcon(alert.severity)}
              >
                <Box>
                  <Typography level="title-sm">
                    {alert.model_name}: {alert.message}
                  </Typography>
                  <Typography level="body-sm" sx={{ mt: 0.5 }}>
                    💡 {alert.recommendation}
                  </Typography>
                </Box>
              </Alert>
            ))}
          </Box>
        </Card>
      )}

      {/* Summary Statistics */}
      {groupedStatus?.summary && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }, gap: 2 }}>
          <Card sx={{ p: 2, textAlign: "center" }}>
            <Typography level="h2">{groupedStatus.summary.total_models}</Typography>
            <Typography level="body-sm">Total Models</Typography>
          </Card>
          <Card sx={{ p: 2, textAlign: "center" }}>
            <Typography level="h2">{groupedStatus.summary.total_families}</Typography>
            <Typography level="body-sm">Model Families</Typography>
          </Card>
          <Card sx={{ p: 2, textAlign: "center" }}>
            <Typography level="h2">{formatPercentage(groupedStatus.summary.overall_avg_f1)}</Typography>
            <Typography level="body-sm">Overall Avg F1</Typography>
          </Card>
          <Card sx={{ p: 2, textAlign: "center", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
            <Typography level="h2" sx={{ color: "white" }}>{groupedStatus.summary.critical_alerts}</Typography>
            <Typography level="body-sm" sx={{ color: "white" }}>Critical Alerts</Typography>
          </Card>
          <Card sx={{ p: 2, textAlign: "center", background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" }}>
            <Typography level="h2">{groupedStatus.summary.warning_alerts}</Typography>
            <Typography level="body-sm">Warning Alerts</Typography>
          </Card>
        </Box>
      )}

      {/* Grouped Models Display */}
      {statusLoading ? (
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        </Card>
      ) : processedModelData && processedModelData.length > 0 ? (
        processedModelData.map((group) => (
          <Card key={group.key} sx={{ p: 3 }}>
            <Typography level="h3" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              📊 {group.name}
              <Chip size="sm" variant="soft">{group.models.length} models</Chip>
            </Typography>
            
            <Table sx={{ "--Table-headerUnderlineThickness": "2px" }}>
              <thead>
                <tr>
                  <th>Model Name</th>
                  <th>Records</th>
                  <th>Accuracy</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>F1 Score</th>
                  <th>Last Trained</th>
                </tr>
              </thead>
              <tbody>
                {group.models.map((model, index) => (
                  <tr key={index}>
                    <td>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <strong>{model.model_name}</strong>
                        <Chip 
                          size="sm" 
                          color={getPerformanceBadgeColor(model.f1)}
                          variant="soft"
                        >
                          {formatPercentage(model.f1)}
                        </Chip>
                      </Box>
                    </td>
                    <td>{model.num_records.toLocaleString()}</td>
                    <td>{formatPercentage(model.accuracy)}</td>
                    <td>{formatPercentage(model.precision)}</td>
                    <td>{formatPercentage(model.recall)}</td>
                    <td>
                      <strong style={{ 
                        color: model.f1 > 0.8 ? '#2e7d32' : 
                               model.f1 >= 0.6 ? '#0288d1' : 
                               model.f1 >= 0.4 ? '#f57c00' : '#d32f2f'
                      }}>
                        {formatPercentage(model.f1)}
                      </strong>
                    </td>
                    <td>{formatDateTime(model.last_trained)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        ))
      ) : (
        <Card sx={{ p: 3 }}>
          <Typography level="body-md" sx={{ color: "text.secondary", textAlign: "center", p: 2 }}>
            No training data available. Click "Train All Models" to get started.
          </Typography>
        </Card>
      )}

      {/* Charts Section */}
      {!chartsLoading && (
        <>
          {/* DB Growth Chart */}
          {dbGrowthChart && dbGrowthChart.datasets && (
            <Card sx={{ p: 3 }}>
              <Typography level="h3" sx={{ mb: 2 }}>
                📈 Database Growth (Last 30 Days)
              </Typography>
              {dbGrowthChart.metadata && (
                <Typography level="body-sm" sx={{ mb: 2, color: "text.secondary" }}>
                  Growth: +{dbGrowthChart.metadata.growth.total} records 
                  ({dbGrowthChart.metadata.growth.percentage.toFixed(1)}%)
                </Typography>
              )}
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dbGrowthChart.labels.map((label, i) => ({
                    date: label,
                    records: dbGrowthChart.datasets[0].data[i]
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="records" 
                      stroke={dbGrowthChart.datasets[0].borderColor}
                      fill={dbGrowthChart.datasets[0].backgroundColor}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          )}

          {/* Performance Trends Chart */}
          {performanceTrendsChart && performanceTrendsChart.datasets && (
            <Card sx={{ p: 3 }}>
              <Typography level="h3" sx={{ mb: 2 }}>
                📊 Performance Trends by Family
              </Typography>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceTrendsChart.labels.map((label, i) => {
                    const dataPoint = { run: label };
                    performanceTrendsChart.datasets.forEach(dataset => {
                      dataPoint[dataset.label] = dataset.data[i];
                    });
                    return dataPoint;
                  })}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="run" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 1]} />
                    <Tooltip />
                    <Legend />
                    {performanceTrendsChart.datasets.map((dataset, i) => (
                      <Line 
                        key={i}
                        type="monotone" 
                        dataKey={dataset.label}
                        stroke={dataset.borderColor}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          )}

          {/* Family Comparison Chart */}
          {familyComparisonChart && familyComparisonChart.datasets && (
            <Card sx={{ p: 3 }}>
              <Typography level="h3" sx={{ mb: 2 }}>
                📊 Family Performance Comparison
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={familyComparisonChart.labels.map((label, i) => {
                    const dataPoint = { family: label };
                    familyComparisonChart.datasets.forEach(dataset => {
                      dataPoint[dataset.label] = dataset.data[i];
                    });
                    return dataPoint;
                  })}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="family" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={100} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 1]} />
                    <Tooltip />
                    <Legend />
                    {familyComparisonChart.datasets.map((dataset, i) => (
                      <Bar 
                        key={i}
                        dataKey={dataset.label}
                        fill={dataset.backgroundColor}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          )}
        </>
      )}

      {/* Train All Button */}
      <Card sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography level="h4" sx={{ mb: 1 }}>
              🚀 Model Training
            </Typography>
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
              Train all machine learning models with the latest data
            </Typography>
          </Box>
          
          <Button
            startDecorator={<PlayArrowIcon />}
            onClick={handleTraining}
            loading={isTraining}
            disabled={isTraining || trainingProgress?.is_running}
            size="lg"
            sx={{
              background: theme.gradients.primary,
              color: "white",
              fontWeight: 700,
              px: 3,
              "&:hover": {
                opacity: 0.9,
              },
            }}
          >
            {isTraining || trainingProgress?.is_running ? "Training..." : "Train All Models"}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default Training;