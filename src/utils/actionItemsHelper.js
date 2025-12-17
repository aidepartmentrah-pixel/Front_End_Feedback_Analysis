// src/utils/actionItemsHelper.js
// Helper functions to sync action items between feedback forms and follow-up calendar

export const syncActionItemsToFollowUp = (feedbackData, complaintData) => {
  const actionItems = feedbackData.action_items || [];
  
  return actionItems.map(item => ({
    id: item.id || Date.now() + Math.random(),
    actionTitle: item.title,
    actionTitleEn: item.title, // In real app, could use translation
    relatedComplaintID: complaintData.complaintID || complaintData.record_id,
    department: complaintData.sendingDepartment || complaintData.issuing_department || "Unknown",
    idara: complaintData.idara || "Unknown",
    assignedTo: item.assignedTo || "غير محدد",
    assignedToEn: item.assignedTo || "Not Assigned",
    dueDate: item.dueDate,
    status: "pending",
    description: feedbackData.corrective_actions || feedbackData.explanation_text || "",
    descriptionEn: feedbackData.corrective_actions || feedbackData.explanation_text || "",
    createdDate: new Date().toISOString().split('T')[0],
    notes: feedbackData.additional_notes || ""
  }));
};

export const addActionItemsToFollowUp = (existingActions, newActions) => {
  // Filter out duplicates based on ID
  const existingIds = new Set(existingActions.map(a => a.id));
  const uniqueNewActions = newActions.filter(a => !existingIds.has(a.id));
  
  return [...existingActions, ...uniqueNewActions];
};

export const getActionItemsByComplaint = (actions, complaintId) => {
  return actions.filter(action => action.relatedComplaintID === complaintId);
};

export const updateActionItemStatus = (actions, actionId, newStatus, completedDate = null) => {
  return actions.map(action => 
    action.id === actionId 
      ? { ...action, status: newStatus, completedDate: completedDate }
      : action
  );
};
