// src/components/insert/RecordMetadata.js

import React from "react";
import {
  Card,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  Grid,
  Chip,
  Box,
  RadioGroup,
  Radio,
  ListItem,
  ListItemButton,
} from "@mui/joy";
import CloseIcon from "@mui/icons-material/Close";

const RecordMetadata = ({ formData, onInputChange, referenceData, errorField }) => {
  // Add department
  const handleAddTargetDepartment = (deptId) => {
    if (!formData.target_department_ids.includes(deptId)) {
      onInputChange("target_department_ids", [
        ...formData.target_department_ids,
        deptId,
      ]);
    }
  };

  // Remove department
  const handleRemoveTargetDepartment = (deptId) => {
    onInputChange(
      "target_department_ids",
      formData.target_department_ids.filter((id) => id !== deptId)
    );
  };

  return (
    <Card
      sx={{
        mb: 3,
        p: 3,
        background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
        border: "2px solid #2196f3",
        boxShadow: "0 4px 12px rgba(33, 150, 243, 0.1)",
      }}
    >
      <Typography level="h3" sx={{ color: "#0d47a1", fontWeight: 700, mb: 2 }}>
        Step 2: Metadata (Date, Source, Departments)
      </Typography>

      <Typography level="body-sm" sx={{ color: "#1565c0", mb: 2 }}>
        Provide administrative details about the feedback record.
      </Typography>

      <Grid container spacing={2}>
        {/* Feedback Date */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              📅 Feedback Received Date *
            </FormLabel>
            <Input
              type="date"
              value={formData.feedback_received_date || ""}
              onChange={(e) =>
                onInputChange("feedback_received_date", e.target.value)
              }
              sx={{
                borderColor:
                  errorField === "feedback_received_date"
                    ? "#ff4757"
                    : undefined,
              }}
            />
          </FormControl>
        </Grid>

        {/* Source */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              📱 Source
            </FormLabel>

            <Select
              value={formData.source_id || ""}
              onChange={(e, value) => onInputChange("source_id", value)}
              placeholder="Select Source"
              slotProps={{
                listbox: { sx: { maxHeight: 250, overflowY: "auto" } },
              }}
            >
              {(referenceData?.sources || []).map((opt) => {
                const displayName =
                  opt.name ||
                  opt.label ||
                  opt.source_name ||
                  opt.name_en ||
                  opt.name_ar ||
                  opt.source_name_en ||
                  opt.source_name_ar;

                return (
                  <Option key={opt.id} value={opt.id}>
                    {displayName || `Source ${opt.id}`}
                  </Option>
                );
              })}
            </Select>
          </FormControl>
        </Grid>

        {/* IN / OUT */}
        <Grid xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🚪 In / Out
            </FormLabel>

            <RadioGroup
              value={formData.in_out || ""}
              onChange={(e) => onInputChange("in_out", e.target.value)}
              orientation="horizontal"
              sx={{ gap: 2, mt: 0.5 }}
            >
              <Radio value="IN" label="IN" size="sm" />
              <Radio value="OUT" label="OUT" size="sm" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Issuing Department (Single Select) */}
        <Grid xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🏢 Issuing Department
            </FormLabel>

            <Select
              value={formData.issuing_department_id || ""}
              placeholder="Select issuing department"
              onChange={(e, value) =>
                onInputChange("issuing_department_id", value)
              }
              slotProps={{
                listbox: {
                  sx: { maxHeight: 250, overflowY: "auto" },
                },
              }}
            >
              {(referenceData?.departments || []).map((dept) => {
                const displayName =
                  dept.name ||
                  dept.label ||
                  dept.department_name ||
                  dept.name_en ||
                  dept.name_ar;

                return (
                  <Option key={dept.id} value={dept.id}>
                    {displayName}
                  </Option>
                );
              })}
            </Select>
          </FormControl>
        </Grid>




        {/* Target Departments */}
        <Grid xs={12} sm={6} md={8}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 1 }}>
              🏥 Target Departments (Multiple)
            </FormLabel>

            {/* Selected */}
            {formData.target_department_ids?.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                {formData.target_department_ids.map((deptId) => {
                  const dept = referenceData?.departments?.find(
                    (d) => d.id === deptId
                  );

                  const displayName =
                    dept?.name ||
                    dept?.label ||
                    dept?.department_name ||
                    dept?.name_en ||
                    dept?.name_ar ||
                    dept?.department_name_en ||
                    dept?.department_name_ar ||
                    `Department ${deptId}`;

                  return (
                    <Chip
                      key={deptId}
                      variant="soft"
                      color="info"
                      endDecorator={
                        <CloseIcon
                          sx={{
                            fontSize: 18,
                            cursor: "pointer",
                            ml: 0.5,
                            "&:hover": { color: "error.main" },
                          }}
                          onClick={() => handleRemoveTargetDepartment(deptId)}
                        />
                      }
                    >
                      {displayName}
                    </Chip>
                  );
                })}
              </Box>
            )}

            {/* Search */}
            <Box sx={{ position: "relative" }}>
              <Input
                placeholder="ابحث عن قسم..."
                value={formData.departmentQuery || ""}
                onChange={(e) =>
                  onInputChange("departmentQuery", e.target.value)
                }
                onFocus={() =>
                  formData.departmentQuery?.length >= 1 &&
                  onInputChange("showDepartmentDropdown", true)
                }
                slotProps={{
                  input: { dir: "rtl" },
                }}
              />

              {formData.showDepartmentDropdown && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    mt: 0.5,
                    maxHeight: 250,
                    overflowY: "auto",
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {(referenceData?.departments || [])
                    .filter((dept) => {
                      const name =
                        dept?.name ||
                        dept?.label ||
                        dept?.department_name ||
                        dept?.name_en ||
                        dept?.name_ar ||
                        "";

                      return (
                        name
                          .toLowerCase()
                          .includes(
                            (formData.departmentQuery || "").toLowerCase()
                          ) &&
                        !formData.target_department_ids.includes(dept.id)
                      );
                    })
                    .map((dept) => (
                      <ListItem key={dept.id}>
                        <ListItemButton
                          onClick={() => {
                            handleAddTargetDepartment(dept.id);
                            onInputChange("departmentQuery", "");
                            onInputChange(
                              "showDepartmentDropdown",
                              false
                            );
                          }}
                        >
                          <Typography level="body-sm" sx={{ dir: "rtl" }}>
                            {dept.name ||
                              dept.label ||
                              dept.department_name ||
                              dept.name_ar ||
                              dept.name_en}
                          </Typography>
                        </ListItemButton>
                      </ListItem>
                    ))}
                </Box>
              )}
            </Box>
          </FormControl>
        </Grid>
      </Grid>

      <Typography
        level="body-xs"
        sx={{ mt: 2, color: "#1565c0", fontStyle: "italic" }}
      >
        ℹ️ You can select multiple target departments. NER extraction will suggest
        departments from the complaint text.
      </Typography>
    </Card>
  );
};

export default RecordMetadata;
