// src/components/reports/BulkExportTable.js
import React, { useState } from "react";
import { Box, Typography, Button, Modal, ModalDialog, ModalClose, DialogTitle, DialogContent, Divider } from "@mui/joy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";

const BulkExportTable = ({ reportType, period, departmentCounts }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDepartment, setPreviewDepartment] = useState(null);

  const departmentsWithData = departmentCounts.filter(d => d.count > 0);
  const departmentsEmpty = departmentCounts.filter(d => d.count === 0);
  const totalIncidents = departmentsWithData.reduce((sum, d) => sum + d.count, 0);

  const handlePreview = (dept) => {
    setPreviewDepartment(dept);
    setPreviewOpen(true);
  };

  const handleExportAll = () => {
    const periodLabel = reportType === "monthly" ? period : period;
    alert(
      `🚀 Bulk Export Started!\n\n` +
      `Report Type: ${reportType.toUpperCase()}\n` +
      `Period: ${periodLabel}\n` +
      `Departments: ${departmentsWithData.length}\n` +
      `Total Incidents: ${totalIncidents}\n\n` +
      `File: hospital_reports_${reportType}_${periodLabel}.zip\n\n` +
      `⏳ Backend will generate ${departmentsWithData.length} PDF reports and compress them into a ZIP file.`
    );
  };

  return (
    <Box>
      {/* Summary Header */}
      <Box
        sx={{
          mb: 3,
          p: 3,
          borderRadius: "8px",
          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
          border: "1px solid rgba(102, 126, 234, 0.3)",
        }}
      >
        <Typography level="h5" sx={{ mb: 2, fontWeight: 700, color: "#667eea" }}>
          📦 Bulk Export - All Leaf Departments
        </Typography>
        
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box
            sx={{
              flex: 1,
              p: 2,
              borderRadius: "6px",
              background: "rgba(46, 213, 115, 0.1)",
              border: "1px solid rgba(46, 213, 115, 0.3)",
            }}
          >
            <Typography level="body-xs" sx={{ color: "#666", mb: 0.5 }}>
              Departments with Data
            </Typography>
            <Typography level="h3" sx={{ fontWeight: 700, color: "#2ed573" }}>
              {departmentsWithData.length}
            </Typography>
            <Typography level="body-xs" sx={{ color: "#999" }}>
              {totalIncidents} total incidents
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: 2,
              borderRadius: "6px",
              background: "rgba(255, 71, 87, 0.1)",
              border: "1px solid rgba(255, 71, 87, 0.3)",
            }}
          >
            <Typography level="body-xs" sx={{ color: "#666", mb: 0.5 }}>
              Empty Departments
            </Typography>
            <Typography level="h3" sx={{ fontWeight: 700, color: "#ff4757" }}>
              {departmentsEmpty.length}
            </Typography>
            <Typography level="body-xs" sx={{ color: "#999" }}>
              Will be skipped
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Departments Table */}
      <Box
        sx={{
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          overflow: "hidden",
          mb: 3,
        }}
      >
        <Box
          sx={{
            p: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Typography level="h6" sx={{ fontWeight: 700 }}>
            Department Breakdown
          </Typography>
          <Typography level="body-xs" sx={{ opacity: 0.9, mt: 0.5 }}>
            Click "Preview" to see how each report will look before exporting
          </Typography>
        </Box>

        <Box sx={{ overflowX: "auto", maxHeight: "500px", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e0e0e0" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, minWidth: "200px" }}>
                  Department
                </th>
                <th style={{ padding: "12px", textAlign: "center", fontWeight: 600, width: "120px" }}>
                  Incidents
                </th>
                <th style={{ padding: "12px", textAlign: "center", fontWeight: 600, width: "150px" }}>
                  Status
                </th>
                <th style={{ padding: "12px", textAlign: "center", fontWeight: 600, width: "180px" }}>
                  Preview
                </th>
              </tr>
            </thead>
            <tbody>
              {departmentsWithData.map((dept) => (
                <tr key={dept.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "12px" }}>
                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                      {dept.name}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "#999", dir: "rtl" }}>
                      {dept.nameAr}
                    </Typography>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <Typography level="body-sm" sx={{ fontWeight: 700, color: "#667eea" }}>
                      {dept.count}
                    </Typography>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        padding: "4px 12px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: "#2ed573",
                        color: "white",
                      }}
                    >
                      ✅ Will Export
                    </Box>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <Button
                      size="sm"
                      variant="outlined"
                      startDecorator={<VisibilityIcon />}
                      onClick={() => handlePreview(dept)}
                      sx={{
                        borderColor: "#667eea",
                        color: "#667eea",
                        fontWeight: 600,
                        "&:hover": {
                          background: "rgba(102, 126, 234, 0.1)",
                        },
                      }}
                    >
                      Preview
                    </Button>
                  </td>
                </tr>
              ))}
              {departmentsEmpty.map((dept) => (
                <tr key={dept.id} style={{ borderBottom: "1px solid #f0f0f0", opacity: 0.5 }}>
                  <td style={{ padding: "12px" }}>
                    <Typography level="body-sm" sx={{ fontWeight: 600, color: "#999" }}>
                      {dept.name}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "#ccc", dir: "rtl" }}>
                      {dept.nameAr}
                    </Typography>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <Typography level="body-sm" sx={{ color: "#999" }}>
                      0
                    </Typography>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        padding: "4px 12px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: "#e0e0e0",
                        color: "#999",
                      }}
                    >
                      ⏭️ Skip
                    </Box>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <Typography level="body-xs" sx={{ color: "#999", fontStyle: "italic" }}>
                      No data
                    </Typography>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>

      {/* Export Button */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Button
          size="lg"
          startDecorator={<DownloadIcon />}
          onClick={handleExportAll}
          disabled={departmentsWithData.length === 0}
          sx={{
            px: 4,
            py: 1.5,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            fontWeight: 700,
            fontSize: "16px",
            "&:hover": {
              background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
            },
            "&:disabled": {
              background: "#ccc",
              color: "#999",
            },
          }}
        >
          🚀 Export All as ZIP ({departmentsWithData.length} Department{departmentsWithData.length !== 1 ? "s" : ""})
        </Button>
      </Box>

      {/* Preview Modal */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
        <ModalDialog
          sx={{
            maxWidth: "1000px",
            width: "95vw",
            maxHeight: "90vh",
            overflow: "hidden",
            p: 0,
          }}
        >
          <ModalClose />
          
          {previewDepartment && (
            <>
              <DialogTitle sx={{ p: 3, pb: 2 }}>
                <Typography level="h4" sx={{ fontWeight: 700, color: "#667eea" }}>
                  👁️ Report Preview - {previewDepartment.name}
                </Typography>
                <Typography level="body-sm" sx={{ color: "#666", dir: "rtl" }}>
                  {previewDepartment.nameAr}
                </Typography>
              </DialogTitle>

              <Divider />

              <DialogContent sx={{ p: 3, overflow: "auto" }}>
                <Box
                  sx={{
                    p: 3,
                    border: "2px dashed #667eea",
                    borderRadius: "8px",
                    background: "rgba(102, 126, 234, 0.05)",
                  }}
                >
                  <Typography level="h6" sx={{ mb: 2, fontWeight: 700 }}>
                    {reportType === "monthly" ? "Monthly Report" : "Seasonal Report"} - {period}
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography level="body-sm" sx={{ fontWeight: 600, mb: 1 }}>
                      Department: {previewDepartment.name}
                    </Typography>
                    <Typography level="body-sm" sx={{ mb: 1 }}>
                      Total Incidents: <strong>{previewDepartment.count}</strong>
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography level="body-sm" sx={{ color: "#666", fontStyle: "italic", mb: 2 }}>
                    📄 This is a preview showing how the PDF report will be structured.
                  </Typography>

                  {/* Mock report structure */}
                  <Box sx={{ p: 2, background: "white", borderRadius: "6px", border: "1px solid #e0e0e0" }}>
                    <Typography level="title-lg" sx={{ mb: 2, fontWeight: 700, textAlign: "center" }}>
                      Hospital Incident Report
                    </Typography>
                    <Typography level="body-sm" sx={{ mb: 1 }}>
                      Period: {period}
                    </Typography>
                    <Typography level="body-sm" sx={{ mb: 2 }}>
                      Department: {previewDepartment.name} ({previewDepartment.nameAr})
                    </Typography>

                    <Box sx={{ my: 2, p: 2, background: "#f9fafb", borderRadius: "4px" }}>
                      <Typography level="body-sm" sx={{ fontWeight: 600, mb: 1 }}>
                        Summary Statistics:
                      </Typography>
                      <Typography level="body-xs">• Total Incidents: {previewDepartment.count}</Typography>
                      <Typography level="body-xs">• HCAT Violations: TBD</Typography>
                      <Typography level="body-xs">• Average Resolution Time: TBD</Typography>
                      <Typography level="body-xs">• Status Breakdown: TBD</Typography>
                    </Box>

                    <Typography level="body-sm" sx={{ fontStyle: "italic", color: "#999", mt: 2 }}>
                      [Full incident details table will appear here in actual PDF]
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 3, p: 2, background: "#fff3cd", borderRadius: "6px", border: "1px solid #ffc107" }}>
                    <Typography level="body-xs" sx={{ color: "#856404" }}>
                      💡 <strong>Note:</strong> This is a simplified preview. The actual PDF will include detailed tables, 
                      charts, and all incident records for this department.
                    </Typography>
                  </Box>
                </Box>
              </DialogContent>

              <Divider />

              <Box sx={{ p: 2.5, display: "flex", justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={() => setPreviewOpen(false)}>
                  Close Preview
                </Button>
              </Box>
            </>
          )}
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default BulkExportTable;
