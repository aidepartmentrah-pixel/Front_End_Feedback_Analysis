// src/components/investigation/IncidentCountTree.js
import React, { useRef } from "react";
import { Box, Card, Typography, Button } from "@mui/joy";
import DownloadIcon from "@mui/icons-material/Download";
import html2canvas from "html2canvas";

const TreeNode = ({ name, displayValue, level, x, y, children, parentX, parentY, nodeColor, nodeSize = "normal" }) => {
  // Default neutral colors (used for Number of Incidents tree)
  const defaultColors = {
    0: { bg: "#9ca3af", text: "#fff", border: "#6b7280" },
    1: { bg: "#9ca3af", text: "#fff", border: "#6b7280" },
    2: { bg: "#9ca3af", text: "#fff", border: "#6b7280" },
    3: { bg: "#9ca3af", text: "#fff", border: "#6b7280" },
  };

  // Use provided color or default
  const color = nodeColor || defaultColors[level] || defaultColors[3];
  
  // Dynamic sizing based on content and node size
  const sizeMultiplier = nodeSize === "large" ? 1.5 : nodeSize === "small" ? 0.8 : 1;
  const nodeWidth = 240 * sizeMultiplier;
  const nodeHeight = 85 * sizeMultiplier;

  return (
    <g>
      {/* Connecting line from parent */}
      {parentX !== undefined && parentY !== undefined && (
        <line
          x1={parentX + nodeWidth}
          y1={parentY + nodeHeight / 2}
          x2={x}
          y2={y + nodeHeight / 2}
          stroke={color.border}
          strokeWidth="3"
          opacity="0.6"
        />
      )}

      {/* Node */}
      <foreignObject x={x} y={y} width={nodeWidth} height={nodeHeight}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            padding: "10px 14px",
            backgroundColor: color.bg,
            color: color.text,
            borderRadius: "8px",
            border: `2px solid ${color.border}`,
            height: "100%",
            boxSizing: "border-box",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "0.9rem", lineHeight: "1.2" }}>
            {name}
          </span>
          <span
            style={{
              padding: "6px 10px",
              borderRadius: "4px",
              backgroundColor: "white",
              color: color.bg,
              fontWeight: 800,
              fontSize: "0.85rem",
              textAlign: "center",
              whiteSpace: "pre-wrap",
              lineHeight: "1.4",
              wordBreak: "break-word",
            }}
          >
            {displayValue}
          </span>
        </div>
      </foreignObject>

      {/* Render children */}
      {children && children.map((child, idx) => (
        <TreeNode
          key={idx}
          {...child}
          parentX={x}
          parentY={y}
        />
      ))}
    </g>
  );
};

const IncidentCountTree = ({ selectedAdmin, selectedDept, selectedSection, treeType = "incident-count" }) => {
  const treeRef = useRef(null);

  // Complete hospital base data
  const baseTreeData = {
    name: "King Fahad Hospital",
    count: 1250,
    domains: { medical: 500, nursing: 450, administrative: 300 },
    severity: { low: 750, medium: 350, high: 150 },
    redFlags: 85,
    neverEver: 12,
    level: 0,
    x: 50,
    y: 20,
    children: [
      {
        name: "Nursing Administration",
        count: 580,
        domains: { medical: 120, nursing: 340, administrative: 120 },
        severity: { low: 350, medium: 160, high: 70 },
        redFlags: 40,
        neverEver: 5,
        level: 1,
        x: 420,
        y: 400,
        children: [
          {
            name: "Emergency Nursing",
            count: 220,
            domains: { medical: 50, nursing: 130, administrative: 40 },
            severity: { low: 130, medium: 60, high: 30 },
            redFlags: 18,
            neverEver: 2,
            level: 2,
            x: 790,
            y: 30,
            children: [
              { 
                name: "ER Triage", 
                count: 120,
                domains: { medical: 25, nursing: 70, administrative: 25 },
                severity: { low: 70, medium: 35, high: 15 },
                redFlags: 10,
                neverEver: 1,
                level: 3, 
                x: 1160, 
                y: 10 
              },
              { 
                name: "ER Treatment", 
                count: 100,
                domains: { medical: 25, nursing: 60, administrative: 15 },
                severity: { low: 60, medium: 25, high: 15 },
                redFlags: 8,
                neverEver: 1,
                level: 3, 
                x: 1160, 
                y: 190 
              },
            ],
          },
          {
            name: "ICU Nursing",
            count: 180,
            domains: { medical: 40, nursing: 110, administrative: 30 },
            severity: { low: 110, medium: 50, high: 20 },
            redFlags: 12,
            neverEver: 2,
            level: 2,
            x: 790,
            y: 400,
            children: [
              { 
                name: "ICU Ward 1", 
                count: 90,
                domains: { medical: 20, nursing: 55, administrative: 15 },
                severity: { low: 55, medium: 25, high: 10 },
                redFlags: 6,
                neverEver: 1,
                level: 3, 
                x: 1160, 
                y: 380 
              },
              { 
                name: "ICU Ward 2", 
                count: 90,
                domains: { medical: 20, nursing: 55, administrative: 15 },
                severity: { low: 55, medium: 25, high: 10 },
                redFlags: 6,
                neverEver: 1,
                level: 3, 
                x: 1160, 
                y: 560 
              },
            ],
          },
          {
            name: "Ward Nursing",
            count: 180,
            domains: { medical: 30, nursing: 100, administrative: 50 },
            severity: { low: 110, medium: 50, high: 20 },
            redFlags: 10,
            neverEver: 1,
            level: 2,
            x: 790,
            y: 760,
            children: [
              { 
                name: "Ward A", 
                count: 60,
                domains: { medical: 10, nursing: 35, administrative: 15 },
                severity: { low: 37, medium: 17, high: 6 },
                redFlags: 3,
                neverEver: 0,
                level: 3, 
                x: 1160, 
                y: 740 
              },
              { 
                name: "Ward B", 
                count: 60,
                domains: { medical: 10, nursing: 33, administrative: 17 },
                severity: { low: 37, medium: 17, high: 6 },
                redFlags: 4,
                neverEver: 0,
                level: 3, 
                x: 1160, 
                y: 920 
              },
              { 
                name: "Ward C", 
                count: 60,
                domains: { medical: 10, nursing: 32, administrative: 18 },
                severity: { low: 36, medium: 16, high: 8 },
                redFlags: 3,
                neverEver: 1,
                level: 3, 
                x: 1160, 
                y: 1100 
              },
            ],
          },
        ],
      },
      {
        name: "Medical Administration",
        count: 420,
        domains: { medical: 280, nursing: 80, administrative: 60 },
        severity: { low: 250, medium: 120, high: 50 },
        redFlags: 30,
        neverEver: 5,
        level: 1,
        x: 420,
        y: 1400,
        children: [
          {
            name: "Surgery Department",
            count: 150,
            domains: { medical: 100, nursing: 30, administrative: 20 },
            severity: { low: 90, medium: 40, high: 20 },
            redFlags: 12,
            neverEver: 2,
            level: 2,
            x: 790,
            y: 1400,
            children: [
              { 
                name: "General Surgery", 
                count: 80,
                domains: { medical: 55, nursing: 15, administrative: 10 },
                severity: { low: 48, medium: 22, high: 10 },
                redFlags: 7,
                neverEver: 1,
                level: 3, 
                x: 1160, 
                y: 1380 
              },
              { 
                name: "Orthopedic Surgery", 
                count: 70,
                domains: { medical: 45, nursing: 15, administrative: 10 },
                severity: { low: 42, medium: 18, high: 10 },
                redFlags: 5,
                neverEver: 1,
                level: 3, 
                x: 1160, 
                y: 1560 
              },
            ],
          },
          {
            name: "Internal Medicine",
            count: 140,
            domains: { medical: 90, nursing: 30, administrative: 20 },
            severity: { low: 80, medium: 40, high: 20 },
            redFlags: 10,
            neverEver: 2,
            level: 2,
            x: 790,
            y: 1760,
            children: [
              { 
                name: "Cardiology", 
                count: 70,
                domains: { medical: 45, nursing: 15, administrative: 10 },
                severity: { low: 40, medium: 20, high: 10 },
                redFlags: 5,
                neverEver: 1,
                level: 3, 
                x: 1160, 
                y: 1740 
              },
              { 
                name: "Gastroenterology", 
                count: 70,
                domains: { medical: 45, nursing: 15, administrative: 10 },
                severity: { low: 40, medium: 20, high: 10 },
                redFlags: 5,
                neverEver: 1,
                level: 3, 
                x: 1160, 
                y: 1920 
              },
            ],
          },
          {
            name: "Pediatrics Department",
            count: 130,
            domains: { medical: 90, nursing: 20, administrative: 20 },
            severity: { low: 80, medium: 40, high: 10 },
            redFlags: 8,
            neverEver: 1,
            level: 2,
            x: 790,
            y: 2120,
            children: [
              { 
                name: "Pediatric Ward", 
                count: 80,
                domains: { medical: 55, nursing: 12, administrative: 13 },
                severity: { low: 50, medium: 24, high: 6 },
                redFlags: 5,
                neverEver: 0,
                level: 3, 
                x: 1160, 
                y: 2100 
              },
              { 
                name: "NICU", 
                count: 50,
                domains: { medical: 35, nursing: 8, administrative: 7 },
                severity: { low: 30, medium: 16, high: 4 },
                redFlags: 3,
                neverEver: 1,
                level: 3, 
                x: 1160, 
                y: 2280 
              },
            ],
          },
        ],
      },
      {
        name: "Support Services",
        count: 250,
        domains: { medical: 100, nursing: 30, administrative: 120 },
        severity: { low: 150, medium: 70, high: 30 },
        redFlags: 15,
        neverEver: 2,
        level: 1,
        x: 420,
        y: 2700,
        children: [
          {
            name: "Radiology Department",
            count: 120,
            domains: { medical: 50, nursing: 15, administrative: 55 },
            severity: { low: 70, medium: 35, high: 15 },
            redFlags: 8,
            neverEver: 1,
            level: 2,
            x: 790,
            y: 2680,
            children: [
              { 
                name: "X-Ray", 
                count: 60,
                domains: { medical: 25, nursing: 8, administrative: 27 },
                severity: { low: 35, medium: 18, high: 7 },
                redFlags: 4,
                neverEver: 0,
                level: 3, 
                x: 1160, 
                y: 2660 
              },
              { 
                name: "CT Scan", 
                count: 60,
                domains: { medical: 25, nursing: 7, administrative: 28 },
                severity: { low: 35, medium: 17, high: 8 },
                redFlags: 4,
                neverEver: 1,
                level: 3, 
                x: 1160, 
                y: 2840 
              },
            ],
          },
          {
            name: "Laboratory Department",
            count: 130,
            domains: { medical: 50, nursing: 15, administrative: 65 },
            severity: { low: 80, medium: 35, high: 15 },
            redFlags: 7,
            neverEver: 1,
            level: 2,
            x: 790,
            y: 3040,
            children: [
              { 
                name: "Clinical Lab", 
                count: 70,
                domains: { medical: 27, nursing: 8, administrative: 35 },
                severity: { low: 43, medium: 19, high: 8 },
                redFlags: 4,
                neverEver: 0,
                level: 3, 
                x: 1160, 
                y: 3020 
              },
              { 
                name: "Pathology", 
                count: 60,
                domains: { medical: 23, nursing: 7, administrative: 30 },
                severity: { low: 37, medium: 16, high: 7 },
                redFlags: 3,
                neverEver: 1,
                level: 3, 
                x: 1160, 
                y: 3200 
              },
            ],
          },
        ],
      },
    ],
  };

  // Judgment/Evaluation Protocols (configurable thresholds - mock data)
  const thresholds = {
    domainCount: {
      clinical: 50,    // Max incidents for clinical domain
      management: 40,  // Max incidents for management domain
      relational: 30,  // Max incidents for relational domain
    },
    domainPercentage: {
      clinical: 45,    // Max percentage for clinical domain
      management: 35,  // Max percentage for management domain
      relational: 25,  // Max percentage for relational domain
    },
    severityCount: {
      low: 100,        // Max low severity incidents
      medium: 50,      // Max medium severity incidents
    },
    severityPercentage: {
      high: 15,        // Max percentage of high severity incidents
    },
  };

  // Color evaluation functions
  const evaluateNodeColor = (node, level) => {
    switch (treeType) {
      case "incident-count": {
        // Blue gradient by hierarchy level (no judgment)
        const blueColors = {
          0: { bg: "#667eea", text: "#fff", border: "#5568d3" },
          1: { bg: "#764ba2", text: "#fff", border: "#5e3c81" },
          2: { bg: "#5f27cd", text: "#fff", border: "#4c1fa3" },
          3: { bg: "#341f97", text: "#fff", border: "#281876" },
        };
        return blueColors[level] || blueColors[3];
      }

      case "domain-count": {
        // Count-based threshold evaluation
        const clinical = node.domains.medical;
        const management = node.domains.administrative;
        const relational = node.domains.nursing;
        
        const clinicalPass = clinical <= thresholds.domainCount.clinical;
        const managementPass = management <= thresholds.domainCount.management;
        const relationalPass = relational <= thresholds.domainCount.relational;
        
        const passCount = [clinicalPass, managementPass, relationalPass].filter(Boolean).length;
        
        // All pass = green, any fail = red, mixed = blend
        if (passCount === 3) {
          return { bg: "#10b981", text: "#fff", border: "#059669" }; // Green
        } else if (passCount === 0) {
          return { bg: "#ef4444", text: "#fff", border: "#dc2626" }; // Red
        } else {
          return { bg: "#f97316", text: "#fff", border: "#ea580c" }; // Orange (mixed)
        }
      }

      case "domain-percentage": {
        // Percentage-based threshold evaluation
        const total = node.count;
        const clinicalPct = (node.domains.medical / total) * 100;
        const managementPct = (node.domains.administrative / total) * 100;
        const relationalPct = (node.domains.nursing / total) * 100;
        
        const clinicalPass = clinicalPct <= thresholds.domainPercentage.clinical;
        const managementPass = managementPct <= thresholds.domainPercentage.management;
        const relationalPass = relationalPct <= thresholds.domainPercentage.relational;
        
        const passCount = [clinicalPass, managementPass, relationalPass].filter(Boolean).length;
        
        if (passCount === 3) {
          return { bg: "#10b981", text: "#fff", border: "#059669" }; // Green
        } else if (passCount === 0) {
          return { bg: "#ef4444", text: "#fff", border: "#dc2626" }; // Red
        } else {
          return { bg: "#f97316", text: "#fff", border: "#ea580c" }; // Orange
        }
      }

      case "severity-count": {
        // Traffic light system for severity counts
        const low = node.severity.low;
        const medium = node.severity.medium;
        
        const lowExceeds = low > thresholds.severityCount.low;
        const mediumExceeds = medium > thresholds.severityCount.medium;
        
        if (lowExceeds || mediumExceeds) {
          return { bg: "#ef4444", text: "#fff", border: "#dc2626" }; // Red
        } else if (low > thresholds.severityCount.low * 0.8 || medium > thresholds.severityCount.medium * 0.8) {
          return { bg: "#f59e0b", text: "#fff", border: "#d97706" }; // Amber (warning)
        } else {
          return { bg: "#10b981", text: "#fff", border: "#059669" }; // Green
        }
      }

      case "severity-percentage": {
        // High severity percentage evaluation
        const total = node.count;
        const highPct = (node.severity.high / total) * 100;
        
        if (highPct > thresholds.severityPercentage.high) {
          return { bg: "#ef4444", text: "#fff", border: "#dc2626" }; // Red
        } else if (highPct > thresholds.severityPercentage.high * 0.8) {
          return { bg: "#f59e0b", text: "#fff", border: "#d97706" }; // Amber
        } else {
          return { bg: "#10b981", text: "#fff", border: "#059669" }; // Green
        }
      }

      case "red-flag": {
        // Red intensity increases with count (no green state)
        const count = node.redFlags;
        if (count === 0) {
          return { bg: "#d1d5db", text: "#374151", border: "#9ca3af" }; // Light gray
        } else if (count <= 5) {
          return { bg: "#fca5a5", text: "#7f1d1d", border: "#f87171" }; // Light red
        } else if (count <= 10) {
          return { bg: "#f87171", text: "#fff", border: "#ef4444" }; // Medium red
        } else {
          return { bg: "#dc2626", text: "#fff", border: "#991b1b" }; // Dark red
        }
      }

      case "never-ever": {
        // Binary: 0 = acceptable, ≥1 = violation
        const count = node.neverEver;
        if (count === 0) {
          return { bg: "#10b981", text: "#fff", border: "#059669" }; // Green (acceptable)
        } else {
          return { bg: "#dc2626", text: "#fff", border: "#991b1b" }; // Red (violation)
        }
      }

      default:
        return {
          bg: "#9ca3af",
          text: "#fff",
          border: "#6b7280"
        };
    }
  };

  // Transform data based on tree type with judgment
  const transformNodeData = (node) => {
    const transformed = { ...node };
    
    // Evaluate color based on judgment protocol
    transformed.nodeColor = evaluateNodeColor(node, node.level);
    
    switch (treeType) {
      case "incident-count":
        transformed.displayValue = node.count.toString();
        transformed.nodeSize = "normal";
        break;
        
      case "domain-count":
        transformed.displayValue = `Clinical: ${node.domains.medical}\nManagement: ${node.domains.administrative}\nRelational: ${node.domains.nursing}`;
        transformed.nodeSize = "large";
        break;
        
      case "domain-percentage":
        const total = node.count;
        const clinicalPct = ((node.domains.medical / total) * 100).toFixed(1);
        const managementPct = ((node.domains.administrative / total) * 100).toFixed(1);
        const relationalPct = ((node.domains.nursing / total) * 100).toFixed(1);
        transformed.displayValue = `Clinical: ${clinicalPct}%\nManagement: ${managementPct}%\nRelational: ${relationalPct}%`;
        transformed.nodeSize = "large";
        break;
        
      case "severity-count":
        transformed.displayValue = `Low: ${node.severity.low}\nMedium: ${node.severity.medium}\nHigh: ${node.severity.high}`;
        transformed.nodeSize = "large";
        break;
        
      case "severity-percentage":
        const sevTotal = node.count;
        const lowPct = ((node.severity.low / sevTotal) * 100).toFixed(1);
        const medSevPct = ((node.severity.medium / sevTotal) * 100).toFixed(1);
        const highPct = ((node.severity.high / sevTotal) * 100).toFixed(1);
        transformed.displayValue = `Low: ${lowPct}%\nMedium: ${medSevPct}%\nHigh: ${highPct}%`;
        transformed.nodeSize = "large";
        break;
        
      case "red-flag":
        transformed.displayValue = node.redFlags === 0 ? "0" : `⚠️ ${node.redFlags}`;
        transformed.nodeSize = "normal";
        break;
        
      case "never-ever":
        transformed.displayValue = node.neverEver === 0 ? "✓ 0" : `⚠️ ${node.neverEver}`;
        transformed.nodeSize = "normal";
        break;
        
      default:
        transformed.displayValue = node.count.toString();
        transformed.nodeSize = "normal";
    }
    
    if (node.children) {
      transformed.children = node.children.map(transformNodeData);
    }
    
    return transformed;
  };

  // Center parent nodes relative to their children
  const centerParentNodes = (node) => {
    if (!node.children || node.children.length === 0) {
      return node;
    }

    // First, recursively center all children
    const centeredChildren = node.children.map(centerParentNodes);

    // Calculate the vertical center of all children
    const firstChildY = centeredChildren[0].y;
    const lastChildY = centeredChildren[centeredChildren.length - 1].y;
    const centerY = (firstChildY + lastChildY) / 2;

    // Return node with centered y position
    return {
      ...node,
      y: centerY,
      children: centeredChildren,
    };
  };

  // Filter tree based on selections
  const getFilteredTree = () => {
    if (!selectedAdmin && !selectedDept && !selectedSection) {
      return transformNodeData(baseTreeData);
    }

    let filtered = { ...baseTreeData };

    if (selectedAdmin) {
      const admin = baseTreeData.children.find(a => a.name === selectedAdmin);
      if (admin) {
        filtered = {
          ...admin,
          level: 0,
          x: 50,
          y: 20,
          children: admin.children?.map((dept, idx) => ({
            ...dept,
            level: 1,
            x: 420,
            y: 30 + idx * 400,
            children: dept.children?.map((sec, secIdx) => ({
              ...sec,
              level: 2,
              x: 790,
              y: 30 + idx * 400 + secIdx * 180,
            })),
          })),
        };
      }
    }

    if (selectedDept && selectedAdmin) {
      const admin = baseTreeData.children.find(a => a.name === selectedAdmin);
      if (admin) {
        const dept = admin.children.find(d => d.name === selectedDept);
        if (dept) {
          filtered = {
            ...dept,
            level: 0,
            x: 50,
            y: 20,
            children: dept.children?.map((sec, idx) => ({
              ...sec,
              level: 1,
              x: 420,
              y: 30 + idx * 180,
            })),
          };
        }
      }
    }

    if (selectedSection && selectedDept && selectedAdmin) {
      const admin = baseTreeData.children.find(a => a.name === selectedAdmin);
      if (admin) {
        const dept = admin.children.find(d => d.name === selectedDept);
        if (dept) {
          const section = dept.children?.find(s => s.name === selectedSection);
          if (section) {
            filtered = {
              ...section,
              level: 0,
              x: 50,
              y: 20,
              children: undefined,
            };
          }
        }
      }
    }

    return transformNodeData(filtered);
  };

  const treeData = centerParentNodes(getFilteredTree());

  // Calculate dynamic SVG dimensions based on actual node positions
  const calculateTreeDimensions = (node, depth = 0) => {
    let maxDepth = depth;
    let maxY = node.y || 0;
    let maxX = node.x || 0;
    
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        const childDims = calculateTreeDimensions(child, depth + 1);
        maxDepth = Math.max(maxDepth, childDims.maxDepth);
        maxY = Math.max(maxY, childDims.maxY);
        maxX = Math.max(maxX, childDims.maxX);
      });
    }
    
    return { maxDepth, maxY, maxX };
  };

  const { maxDepth, maxY, maxX } = calculateTreeDimensions(treeData);
  
  // Dynamic sizing based on actual coordinates
  const nodeHeight = treeData.nodeSize === "large" ? 128 : 85;
  const nodeWidth = treeData.nodeSize === "large" ? 360 : 240;
  const horizontalSpacing = 300;
  
  const svgWidth = Math.max(1400, maxX + nodeWidth + 100);
  const svgHeight = Math.max(600, maxY + nodeHeight + 200);

  const handleExport = async () => {
    if (treeRef.current) {
      try {
        // Temporarily remove scroll constraints for full capture
        const originalOverflow = treeRef.current.style.overflow;
        const originalMaxHeight = treeRef.current.style.maxHeight;
        treeRef.current.style.overflow = 'visible';
        treeRef.current.style.maxHeight = 'none';
        
        const canvas = await html2canvas(treeRef.current, {
          backgroundColor: "#f9fafb",
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
          width: svgWidth + 48, // Include padding
          height: svgHeight + 48,
        });
        
        // Restore original styles
        treeRef.current.style.overflow = originalOverflow;
        treeRef.current.style.maxHeight = originalMaxHeight;
        
        const link = document.createElement("a");
        link.download = `tree-${treeType}-${new Date().toISOString().split("T")[0]}.png`;
        link.href = canvas.toDataURL("image/png", 1.0);
        link.click();
      } catch (error) {
        console.error("Export failed:", error);
      }
    }
  };

  const getTreeTitle = () => {
    const titles = {
      "incident-count": "Number of Incidents",
      "domain-count": "Domain Distribution (Numbers)",
      "domain-percentage": "Domain Distribution (Percentage)",
      "severity-count": "Severity Distribution (Numbers)",
      "severity-percentage": "Severity Distribution (Percentage)",
      "red-flag": "Red Flag Incident",
      "never-ever": "Never Ever Incident",
    };
    return titles[treeType] || "Incident Tree";
  };

  const getTreeDescription = () => {
    const descriptions = {
      "incident-count": "Pure distribution of incident counts. Neutral visualization with no pass/fail judgment.",
      "domain-count": "Evaluates domains (Clinical, Management, Relational) using count-based thresholds. Green = within limits, Red = exceeds limits.",
      "domain-percentage": "Evaluates domains using percentage thresholds normalized by total incidents. Color indicates threshold compliance.",
      "severity-count": "Evaluates Low and Medium severity incidents using count-based thresholds. Traffic-light colors: Green (safe), Amber (warning), Red (exceeds).",
      "severity-percentage": "Evaluates High severity incidents using percentage thresholds. Color reflects policy compliance.",
      "red-flag": "Critical-risk incidents concentration. Red intensity increases with count (no green state).",
      "never-ever": "Zero-tolerance incidents tracking. Binary judgment: 0 = acceptable (green), ≥1 = violation (red).",
    };
    return descriptions[treeType] || "Incident distribution tree visualization.";
  };

  return (
    <Card>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography level="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {getTreeTitle()}
          </Typography>
          <Typography level="body-sm" sx={{ color: "#666" }}>
            {getTreeDescription()}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          startDecorator={<DownloadIcon />}
          onClick={handleExport}
        >
          Export Chart
        </Button>
      </Box>

      <Box
        ref={treeRef}
        sx={{
          width: "100%",
          maxHeight: "800px",
          overflowX: "auto",
          overflowY: "auto",
          bgcolor: "#f9fafb",
          borderRadius: "md",
          p: 3,
        }}
      >
        <svg width={svgWidth} height={svgHeight} style={{ minWidth: `${svgWidth}px`, minHeight: `${svgHeight}px` }}>
          <TreeNode {...treeData} />
        </svg>
      </Box>
    </Card>
  );
};

export default IncidentCountTree;
