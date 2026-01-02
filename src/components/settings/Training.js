// src/components/settings/Training.js
import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Card, 
  Table, 
  Button, 
  CircularProgress, 
  Alert,
  Chip
} from "@mui/joy";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const Training = () => {
  // State for current model performance
  const [modelStatus, setModelStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  
  // State for training history
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  
  // State for database growth
  const [dbGrowth, setDbGrowth] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  
  // State for training process
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch model status
  const fetchModelStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await fetch("/api/settings/training/status");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setModelStatus(data);
    } catch (err) {
      console.error("Error fetching model status:", err);
      setError("Failed to load model status");
    } finally {
      setStatusLoading(false);
    }
  };

  // Fetch training history
  const fetchTrainingHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await fetch("/api/settings/training/history");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setTrainingHistory(data.history || []);
    } catch (err) {
      console.error("Error fetching training history:", err);
      setError("Failed to load training history");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch database growth
  const fetchDbGrowth = async () => {
    try {
      setDbLoading(true);
      const response = await fetch("/api/settings/training/db-size");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setDbGrowth(data.points || []);
    } catch (err) {
      console.error("Error fetching DB growth:", err);
      setError("Failed to load database growth data");
    } finally {
      setDbLoading(false);
    }
  };

  // Start training
  const handleTraining = async () => {
    try {
      setIsTraining(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch("/api/settings/training/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) throw new Error(`Training failed: HTTP ${response.status}`);
      
      const data = await response.json();
      setSuccess(`Training started successfully! Run ID: ${data.run_id}`);
      
      // Refresh data after training starts
      setTimeout(() => {
        fetchModelStatus();
        fetchTrainingHistory();
      }, 1000);
      
    } catch (err) {
      console.error("Error starting training:", err);
      setError(err.message || "Failed to start training");
    } finally {
      setIsTraining(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchModelStatus();
    fetchTrainingHistory();
    fetchDbGrowth();
  }, []);

  // Poll status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchModelStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

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

      {/* 1. Current Model Performance */}
      <Card sx={{ p: 3 }}>
        <Typography level="h3" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          🤖 Current Model Performance
        </Typography>
        
        {statusLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : modelStatus?.status === "never_run" ? (
          <Typography level="body-md" sx={{ color: "text.secondary", p: 2 }}>
            No training yet. Click "Train All Models" to get started.
          </Typography>
        ) : (
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
              {modelStatus?.models?.map((model, index) => (
                <tr key={index}>
                  <td><strong>{model.model_name}</strong></td>
                  <td>{model.num_records.toLocaleString()}</td>
                  <td>{formatPercentage(model.accuracy)}</td>
                  <td>{formatPercentage(model.precision)}</td>
                  <td>{formatPercentage(model.recall)}</td>
                  <td>{formatPercentage(model.f1)}</td>
                  <td>{formatDateTime(model.last_trained)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* 2. Training History */}
      <Card sx={{ p: 3 }}>
        <Typography level="h3" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          📈 Training History
        </Typography>
        
        {historyLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : trainingHistory.length === 0 ? (
          <Typography level="body-md" sx={{ color: "text.secondary", p: 2 }}>
            No training history available.
          </Typography>
        ) : (
          <Table sx={{ "--Table-headerUnderlineThickness": "2px" }}>
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Started At</th>
                <th>Finished At</th>
                <th>Status</th>
                <th>Models Trained</th>
              </tr>
            </thead>
            <tbody>
              {trainingHistory.map((run, index) => (
                <tr key={index}>
                  <td><code>{run.run_id}</code></td>
                  <td>{formatDateTime(run.started_at)}</td>
                  <td>{run.finished_at ? formatDateTime(run.finished_at) : "-"}</td>
                  <td>
                    <Chip 
                      color={getStatusColor(run.status)} 
                      size="sm"
                      variant="soft"
                    >
                      {run.status}
                    </Chip>
                  </td>
                  <td>{run.models_trained}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* 3. ML Database Growth Chart */}
      <Card sx={{ p: 3 }}>
        <Typography level="h3" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          📊 ML Database Growth
        </Typography>
        
        {dbLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : dbGrowth.length === 0 ? (
          <Typography level="body-md" sx={{ color: "text.secondary", p: 2 }}>
            No database growth data available.
          </Typography>
        ) : (
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dbGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Records', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value) => [value.toLocaleString(), 'Records']}
                  labelFormatter={(date) => `Date: ${date}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="records" 
                  stroke="#2196f3" 
                  strokeWidth={2}
                  dot={{ fill: "#2196f3", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#2196f3", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Card>

      {/* 4. Train All Button */}
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
            disabled={isTraining}
            size="lg"
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontWeight: 700,
              px: 3,
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
              },
            }}
          >
            {isTraining ? "Training..." : "Train All Models"}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default Training;