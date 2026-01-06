// src/components/TableView/DeleteConfirmationDialog.js
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
    <Modal aria-labelledby="delete-dialog-title" open={open} onClose={onClose} sx={{ zIndex: 2000 }}>
      <ModalDialog
        aria-labelledby="delete-dialog-title"
        variant="outlined"
        role="alertdialog"
        sx={{
          maxWidth: "500px",
          boxShadow: "lg",
          zIndex: 2000,
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <DeleteIcon sx={{ color: "danger.main" }} />
          Delete Complaint
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
              Are you sure you want to delete this complaint? This action cannot be undone.
            </Typography>

            {complaintId && (
              <Box>
                <Typography level="body-sm" sx={{ fontWeight: 600, color: "text.primary" }}>
                  Complaint ID:
                </Typography>
                <Typography level="body-sm" sx={{ color: "text.secondary", mb: 1 }}>
                  {complaintId}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography level="body-sm" sx={{ fontWeight: 600, color: "text.primary" }}>
                Patient Name:
              </Typography>
              <Typography level="body-sm" sx={{ color: "text.secondary", mb: 1 }}>
                {patientName}
              </Typography>
            </Box>

            <Box>
              <Typography level="body-sm" sx={{ fontWeight: 600, color: "text.primary" }}>
                Complaint Text:
              </Typography>
              <Typography 
                level="body-sm" 
                sx={{ 
                  color: "text.secondary",
                  bgcolor: "#f5f5f5",
                  p: 1,
                  borderRadius: "sm",
                  maxHeight: "150px",
                  overflow: "auto",
                }}
              >
                {complaintText.length > 200 ? `${complaintText.substring(0, 200)}...` : complaintText}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ gap: 1 }}>
          <Button 
            variant="plain" 
            color="neutral" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="solid" 
            color="danger" 
            onClick={onConfirm}
            loading={isLoading}
          >
            Delete Complaint
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default DeleteConfirmationDialog;
