// src/components/reports/SeasonalOpenRecordsHCATTable.js
import React from "react";
import { Box, Typography, Card, Sheet, Table } from "@mui/joy";

const SeasonalOpenRecordsHCATTable = ({ groupedData }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        level="h5"
        sx={{
          mb: 2,
          fontWeight: 700,
          color: "#667eea",
        }}
      >
        📋 جدول HCAT للحالات المفتوحة (HCAT Table - Open Records Preview)
      </Typography>

      <Card sx={{ p: 0, overflow: "hidden" }}>
        <Sheet
          sx={{
            overflow: "auto",
            maxHeight: "700px",
            borderRadius: "8px",
          }}
        >
          <Table
            stickyHeader
            sx={{
              "& thead th": {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                fontWeight: 700,
                fontSize: "0.8rem",
                textAlign: "center",
                py: 1.5,
                borderLeft: "1px solid rgba(255,255,255,0.2)",
              },
              "& tbody td": {
                textAlign: "center",
                fontSize: "0.8rem",
                py: 1.5,
                borderLeft: "1px solid #e0e0e0",
                borderBottom: "1px solid #e0e0e0",
              },
              "& tbody tr:hover": {
                background: "rgba(102, 126, 234, 0.05)",
              },
            }}
          >
            <thead>
              <tr>
                <th style={{ width: "120px" }}>
                  Problem Domain
                  <br />
                  <small style={{ fontWeight: 400 }}>مجال المشكلة</small>
                </th>
                <th style={{ width: "140px" }}>
                  Problem Category
                  <br />
                  <small style={{ fontWeight: 400 }}>فئة المشكلة</small>
                </th>
                <th style={{ width: "150px" }}>
                  Sub-Category
                  <br />
                  <small style={{ fontWeight: 400 }}>الفئة الفرعية</small>
                </th>
                <th style={{ width: "200px" }}>
                  Classification (Arb.)
                  <br />
                  <small style={{ fontWeight: 400 }}>التصنيف (عربي)</small>
                </th>
                <th style={{ width: "200px" }}>
                  Classification (Eng.)
                  <br />
                  <small style={{ fontWeight: 400 }}>التصنيف (إنجليزي)</small>
                </th>
                <th style={{ width: "100px" }}>
                  Percentage
                  <br />
                  <small style={{ fontWeight: 400 }}>النسبة المئوية</small>
                </th>
                <th style={{ width: "120px" }}>
                  نتيجة المقارنة
                  <br />
                  <small style={{ fontWeight: 400 }}>Comparison Result</small>
                </th>
                <th style={{ width: "180px", borderLeft: "2px solid rgba(255,255,255,0.4)" }}>
                  Severity
                  <br />
                  <small style={{ fontWeight: 400 }}>الخطورة</small>
                </th>
                <th style={{ width: "140px" }}>
                  العدد / النسبة المقبولة
                  <br />
                  <small style={{ fontWeight: 400 }}>Count / Acceptable %</small>
                </th>
                <th style={{ width: "160px" }}>
                  هل يجب اتخاذ إجراء معيّن؟
                  <br />
                  <small style={{ fontWeight: 400 }}>Action Required?</small>
                </th>
              </tr>
            </thead>
            <tbody>
              {groupedData.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                    <Typography level="body-md">
                      لا توجد حالات مفتوحة في الفترة المحددة
                      <br />
                      <small>No open records found for the selected period</small>
                    </Typography>
                  </td>
                </tr>
              ) : (
                groupedData.map((row, index) => (
                  <tr key={index}>
                    {/* Problem Domain */}
                    <td>
                      <Typography level="body-sm" sx={{ fontWeight: 700, color: "#667eea" }}>
                        {row.problemDomain}
                      </Typography>
                    </td>

                    {/* Problem Category */}
                    <td>
                      <Typography level="body-xs" sx={{ fontWeight: 600 }}>
                        {row.problemCategory}
                      </Typography>
                    </td>

                    {/* Sub-Category */}
                    <td>
                      <Typography level="body-xs">{row.subCategory}</Typography>
                    </td>

                    {/* Classification Arabic */}
                    <td>
                      <Typography
                        level="body-xs"
                        sx={{ textAlign: "right", direction: "rtl", px: 1 }}
                      >
                        {row.classificationAr}
                      </Typography>
                    </td>

                    {/* Classification English */}
                    <td>
                      <Typography level="body-xs" sx={{ textAlign: "left", px: 1 }}>
                        {row.classificationEn}
                      </Typography>
                    </td>

                    {/* Percentage - BLANK */}
                    <td>
                      <Typography level="body-xs" sx={{ color: "#ccc", fontStyle: "italic" }}>
                        —
                      </Typography>
                    </td>

                    {/* Comparison Result - BLANK */}
                    <td>
                      <Typography level="body-xs" sx={{ color: "#ccc", fontStyle: "italic" }}>
                        —
                      </Typography>
                    </td>

                    {/* Severity */}
                    <td style={{ borderLeft: "2px solid #e0e0e0" }}>
                      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center", flexWrap: "wrap" }}>
                        <Typography level="body-xs" sx={{ whiteSpace: "nowrap" }}>
                          L: {row.severityLow}
                        </Typography>
                        <Typography level="body-xs" sx={{ whiteSpace: "nowrap" }}>
                          M: {row.severityMedium}
                        </Typography>
                        <Typography level="body-xs" sx={{ whiteSpace: "nowrap" }}>
                          H: {row.severityHigh}
                        </Typography>
                      </Box>
                    </td>

                    {/* Count / Acceptable % - BLANK */}
                    <td>
                      <Typography level="body-xs" sx={{ color: "#ccc", fontStyle: "italic" }}>
                        —
                      </Typography>
                    </td>

                    {/* Action Required - BLANK */}
                    <td>
                      <Typography level="body-xs" sx={{ color: "#ccc", fontStyle: "italic" }}>
                        —
                      </Typography>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Sheet>

        {/* Table Footer */}
        {groupedData.length > 0 && (
          <Box
            sx={{
              p: 2,
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
              borderTop: "2px solid rgba(102, 126, 234, 0.2)",
            }}
          >
            <Typography level="body-sm" sx={{ fontWeight: 700, color: "#667eea", textAlign: "center" }}>
              إجمالي الصفوف: {groupedData.length}
              <Typography component="span" sx={{ color: "#999", ml: 2 }}>
                Total Rows: {groupedData.length}
              </Typography>
            </Typography>
            <Typography level="body-xs" sx={{ color: "#999", textAlign: "center", mt: 1 }}>
              💡 الأعمدة التحليلية (النسبة المئوية، نتيجة المقارنة، العدد/النسبة المقبولة، الإجراء المطلوب) ستظل فارغة في التصدير
              <br />
              Analytical columns will remain blank in the exported report
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default SeasonalOpenRecordsHCATTable;
