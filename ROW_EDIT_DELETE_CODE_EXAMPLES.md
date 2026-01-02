# Row Edit/Delete Implementation - Code Examples

## 1. DataTable.js - Action Icons Implementation

```javascript
// Added to imports
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// Updated function signature
const DataTable = ({ complaints, sortBy, sortOrder, onSort, onRowClick, viewMode, customView, onEdit, onDelete }) => {
  
  // Added Actions column to columns array
  columns = [...columns, { key: "actions", label: "Actions", sortable: false }];

  // In the row rendering:
  <tbody>
    {complaints.map((complaint) => (
      <tr key={complaint.id}>
        {columns.map((col) => (
          <td key={col.key}>
            {col.key === "actions" ? (
              <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                <IconButton
                  size="sm"
                  variant="plain"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEdit) onEdit(complaint.id);
                  }}
                  sx={{ fontSize: 18 }}
                  title="Edit complaint"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="sm"
                  variant="plain"
                  color="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDelete) onDelete(complaint.id, complaint);
                  }}
                  sx={{ fontSize: 18 }}
                  title="Delete complaint"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ) : (
              // ... other column rendering
            )}
          </td>
        ))}
      </tr>
    ))}
  </tbody>
};
```

## 2. DeleteConfirmationDialog.js - Complete Component

```javascript
import React from "react";
import { Modal, ModalDialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from "@mui/joy";
import DeleteIcon from "@mui/icons-material/Delete";

const DeleteConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  isLoading,
  complaint,
}) => {
  const patientName = complaint?.patient_name || "Unknown Patient";
  const complaintText = complaint?.complaint_text || "No complaint text";
  const complaintId = complaint?.complaint_number || complaint?.id;

  return (
    <Modal aria-labelledby="delete-dialog-title" open={open} onClose={onClose}>
      <ModalDialog aria-labelledby="delete-dialog-title" variant="outlined" role="alertdialog">
        <DialogTitle sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <DeleteIcon sx={{ color: "danger.main" }} />
          Delete Complaint
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
              Are you sure you want to delete this complaint? This action cannot be undone.
            </Typography>

            <Box>
              <Typography level="body-sm" sx={{ fontWeight: 600 }}>Complaint ID:</Typography>
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>{complaintId}</Typography>
            </Box>

            <Box>
              <Typography level="body-sm" sx={{ fontWeight: 600 }}>Patient Name:</Typography>
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>{patientName}</Typography>
            </Box>

            <Box>
              <Typography level="body-sm" sx={{ fontWeight: 600 }}>Complaint Text:</Typography>
              <Typography level="body-sm" sx={{ bgcolor: "#f5f5f5", p: 1, borderRadius: "sm" }}>
                {complaintText.length > 200 ? `${complaintText.substring(0, 200)}...` : complaintText}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ gap: 1 }}>
          <Button variant="plain" color="neutral" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="solid" color="danger" onClick={onConfirm} loading={isLoading}>
            Delete Complaint
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default DeleteConfirmationDialog;
```

## 3. TableView.js - Handlers Implementation

```javascript
// Added imports
import DeleteConfirmationDialog from "../components/TableView/DeleteConfirmationDialog";
import { fetchComplaints, fetchFilterOptions, exportComplaints, deleteComplaint } from "../api/complaints";

// Added state
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [complaintToDelete, setComplaintToDelete] = useState(null);
const [deleteLoading, setDeleteLoading] = useState(false);

// Added handlers
const handleEditRow = (complaintId) => {
  console.log("✏️ Editing complaint:", complaintId);
  navigate(`/edit-record/${complaintId}`);
};

const handleDeleteRow = (complaintId, complaint) => {
  console.log("🗑️ Opening delete dialog for complaint:", complaintId);
  setComplaintToDelete(complaint);
  setDeleteDialogOpen(true);
};

const handleConfirmDelete = async () => {
  if (!complaintToDelete || !complaintToDelete.id) {
    console.error("❌ No complaint selected for deletion");
    return;
  }

  setDeleteLoading(true);
  try {
    console.log("🗑️ Deleting complaint:", complaintToDelete.id);
    await deleteComplaint(complaintToDelete.id);
    console.log("✅ Complaint deleted successfully");
    
    // Close dialog and refresh data
    setDeleteDialogOpen(false);
    setComplaintToDelete(null);
    await loadComplaints();
  } catch (error) {
    console.error("❌ Error deleting complaint:", error);
    alert("Failed to delete complaint: " + error.message);
  } finally {
    setDeleteLoading(false);
  }
};

// Updated DataTable rendering
<DataTable
  complaints={complaints}
  sortBy={sortBy}
  sortOrder={sortOrder}
  onSort={handleSort}
  onRowClick={handleRowClick}
  onEdit={handleEditRow}
  onDelete={handleDeleteRow}
  viewMode={viewMode}
  customView={selectedCustomView}
/>

// Added dialog rendering
<DeleteConfirmationDialog
  open={deleteDialogOpen}
  onClose={() => {
    setDeleteDialogOpen(false);
    setComplaintToDelete(null);
  }}
  onConfirm={handleConfirmDelete}
  isLoading={deleteLoading}
  complaint={complaintToDelete}
/>
```

## 4. complaints.js - Delete API Function

```javascript
/**
 * Delete a complaint by ID
 * @param {number} complaintId - The ID of the complaint to delete
 * @returns {Promise<Object>} Success response
 */
export async function deleteComplaint(complaintId) {
  console.log("🗑️ Deleting complaint:", complaintId);
  const url = `${BASE_URL}/${complaintId}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete complaint: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Complaint deleted successfully");
    return data;
  } catch (error) {
    console.error("❌ Error deleting complaint:", error);
    throw error;
  }
}
```

## Key Features Summary

### Edit Flow
- Click pencil icon → Navigate to `/edit-record/{complaintId}`
- Edit form should pre-load complaint data
- User modifies fields and saves

### Delete Flow
- Click trash icon → Confirmation dialog opens
- Dialog shows complaint details (patient name, complaint text)
- User confirms deletion
- API call deletes record
- Table refreshes automatically

### Error Handling
- Failed deletes show alert with error message
- Loading states prevent double-clicks
- Proper exception handling throughout
- Comprehensive console logging for debugging

### Styling
- Icons positioned in Actions column (rightmost)
- Blue edit icon, red delete icon
- Centered alignment with small spacing
- Hover effects from MUI
- Dialog with proper modal styling

---
**Reference Implementation Complete**
