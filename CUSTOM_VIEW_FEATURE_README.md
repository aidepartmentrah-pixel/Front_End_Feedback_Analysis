# Custom Table View Feature

## Overview
This document describes the Custom User Table View feature that allows users to create, edit, delete, and select custom column views for the complaints table in the TableView page.

## Feature Components

### 1. **API Service Layer** (`src/api/customViews.js`)
Provides complete CRUD operations for custom views:

#### Available Functions:
- **`fetchCustomViews(activeOnly = true)`** - GET /api/custom-views?active_only=true|false
  - Returns list of all custom views
  - `activeOnly` parameter filters active/inactive views

- **`fetchCustomView(viewId)`** - GET /api/custom-views/{view_id}
  - Retrieves single view details by ID

- **`createCustomView(viewData)`** - POST /api/custom-views
  - Creates new custom view with column selections
  - Required fields: `ViewName`, at least one `Show*` flag = true

- **`updateCustomView(viewId, viewData)`** - PUT /api/custom-views/{view_id}
  - Updates existing custom view
  - Supports partial updates

- **`deleteCustomView(viewId, hardDelete = false)`** - DELETE /api/custom-views/{view_id}?hard=false|true
  - Soft delete (default) or hard delete
  - Soft delete marks as inactive, hard delete removes record

#### DEFAULT_VIEW_COLUMNS
Array of 23 available column definitions that can be included in custom views:
```javascript
[
  'ShowIncidentRequestCaseID',
  'ShowComplaintText',
  'ShowImmediateAction',
  'ShowTakenAction',
  'ShowFeedbackRecievedDate',
  'ShowPatientName',
  'ShowIssuingOrgUnitID',
  'ShowCreatedAt',
  'ShowCreatedByUserID',
  'ShowIsInPatient',
  'ShowClinicalRiskTypeID',
  'ShowFeedbackIntentTypeID',
  'ShowBuildingID',
  'ShowDomainID',
  'ShowCategoryID',
  'ShowSubCategoryID',
  'ShowClassificationID',
  'ShowSeverityID',
  'ShowStageID',
  'ShowHarmLevelID',
  'ShowCaseStatusID',
  'ShowSourceID',
  'ShowExplanationStatusID'
]
```

### 2. **UI Component** (`src/components/TableView/CustomViewManager.js`)
React component for managing custom views with the following features:

#### Props:
- **`onViewSelect(view)`** - Callback when a custom view is selected
  - Receives view object with all properties including ShowX flags

#### Features:
- **View Selection**: Chip-based display showing all available custom views
- **Create View**: Button to open dialog for creating new custom view
- **Edit View**: Edit button for each view to modify columns and name
- **Delete View**: Delete button with confirmation for removing views
- **Column Selection**: Checkbox grid for selecting which columns to show (all 23 columns)
- **Form Validation**: 
  - View name is required
  - At least one column must be selected
  - Error messages for validation failures
- **Loading States**: Handles loading, error states gracefully
- **Caching**: Views are loaded once and cached in component state

#### Usage:
```javascript
import CustomViewManager from '../components/TableView/CustomViewManager';

<CustomViewManager onViewSelect={(view) => setSelectedCustomView(view)} />
```

### 3. **DataTable Integration** (`src/components/TableView/DataTable.js`)
Updated to support custom view column filtering:

#### New Props:
- **`customView`** - Optional custom view object to determine visible columns

#### Changes:
- Added comprehensive `allColumnsDefinition` array with all 24 available columns
- Each column definition includes:
  - `key` - Data field name
  - `label` - Display label
  - `sortable` - Whether column can be sorted
  - `showKey` - Corresponding ShowX flag name (or null for standard fields)

#### Logic:
- If `customView` is provided: Filters columns based on ShowX flags
- If `customView` is null: Uses traditional `viewMode` (complete/simplified)
- Columns with null `showKey` are always included when custom view is active

### 4. **TableView Page Integration** (`src/pages/TableView.js`)
Updated to integrate custom views:

#### State:
- `selectedCustomView` - Tracks currently selected custom view

#### Changes:
- Added import for CustomViewManager component
- Added state for selectedCustomView
- Added CustomViewManager component to JSX (before SearchBar)
- Passes selectedCustomView to DataTable component

#### Rendering:
```javascript
<CustomViewManager onViewSelect={setSelectedCustomView} />
{/* DataTable receives customView prop */}
<DataTable 
  complaints={complaints}
  customView={selectedCustomView}
  // ... other props
/>
```

## Custom View Object Structure

When a view is selected or created, it has this structure:
```javascript
{
  id: number,
  ViewName: string,
  ShowIncidentRequestCaseID: boolean,
  ShowComplaintText: boolean,
  ShowImmediateAction: boolean,
  ShowTakenAction: boolean,
  ShowFeedbackRecievedDate: boolean,
  ShowPatientName: boolean,
  ShowIssuingOrgUnitID: boolean,
  ShowCreatedAt: boolean,
  ShowCreatedByUserID: boolean,
  ShowIsInPatient: boolean,
  ShowClinicalRiskTypeID: boolean,
  ShowFeedbackIntentTypeID: boolean,
  ShowBuildingID: boolean,
  ShowDomainID: boolean,
  ShowCategoryID: boolean,
  ShowSubCategoryID: boolean,
  ShowClassificationID: boolean,
  ShowSeverityID: boolean,
  ShowStageID: boolean,
  ShowHarmLevelID: boolean,
  ShowCaseStatusID: boolean,
  ShowSourceID: boolean,
  ShowExplanationStatusID: boolean,
  IsActive: boolean,
  CreatedAt: string (ISO timestamp),
  UpdatedAt: string (ISO timestamp)
}
```

## Column Mapping Reference

| ShowX Flag | Field Key | Label |
|---|---|---|
| ShowIncidentRequestCaseID | complaint_number | Complaint # |
| ShowComplaintText | complaint_text | Complaint Text |
| ShowImmediateAction | immediate_action | Immediate Action |
| ShowTakenAction | taken_action | Taken Action |
| ShowFeedbackRecievedDate | received_date | Received Date |
| ShowPatientName | patient_name | Patient Name |
| ShowIssuingOrgUnitID | issuing_org_unit_name | Issuing Dept |
| ShowCreatedAt | created_at | Created At |
| ShowCreatedByUserID | created_by_user_id | Created By |
| ShowIsInPatient | is_in_patient | In Patient |
| ShowClinicalRiskTypeID | clinical_risk_type_name | Clinical Risk |
| ShowFeedbackIntentTypeID | feedback_intent_type_name | Feedback Intent |
| ShowBuildingID | building_name | Building |
| ShowDomainID | domain_name | Domain |
| ShowCategoryID | category_name | Category |
| ShowSubCategoryID | subcategory_name | Subcategory |
| ShowClassificationID | classification_en_label | Classification (EN) |
| ShowSeverityID | severity_name | Severity |
| ShowStageID | stage_name | Stage |
| ShowHarmLevelID | harm_level_name | Harm Level |
| ShowCaseStatusID | case_status_name | Case Status |
| ShowSourceID | source_name | Source |
| ShowExplanationStatusID | explanation_status_name | Explanation Status |
| (null) | status_name | Status |

## User Workflow

### Creating a Custom View:
1. Click "Create View" button in CustomViewManager
2. Enter view name
3. Check checkboxes for desired columns
4. Click "Save"
5. New view appears in chip list and is immediately available

### Selecting a Custom View:
1. Click on a view chip in the CustomViewManager
2. Table automatically filters to show only selected columns
3. View persists during session

### Editing a Custom View:
1. Click edit icon on desired view chip
2. Modify name and/or column selections
3. Click "Update"
4. If currently selected, table updates automatically

### Deleting a Custom View:
1. Click delete icon on desired view chip
2. Confirm deletion in dialog
3. View is removed from list

## API Response Examples

### GET /api/custom-views
```json
{
  "views": [
    {
      "id": 1,
      "ViewName": "Safety Dashboard",
      "ShowIncidentRequestCaseID": true,
      "ShowPatientName": true,
      "ShowDomainID": true,
      "ShowSeverityID": true,
      // ... all other Show* flags
      "IsActive": true,
      "CreatedAt": "2024-01-15T10:00:00Z",
      "UpdatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /api/custom-views
Request:
```json
{
  "ViewName": "My Custom View",
  "ShowIncidentRequestCaseID": true,
  "ShowPatientName": true,
  "ShowDomainID": true,
  // ... selected Show* flags
}
```

Response:
```json
{
  "id": 2,
  "ViewName": "My Custom View",
  // ... all fields as shown in GET response
}
```

## Error Handling

### Validation Errors:
- Empty view name → "View name is required"
- No columns selected → "At least one column must be selected"
- Duplicate view name → Backend validation

### Network Errors:
- Failed to load views → Error message displayed
- Failed to create/update/delete → User feedback with retry option
- All errors are caught and logged to console

## Testing Checklist

- [ ] Load TableView page - CustomViewManager displays
- [ ] Create custom view with various column combinations
- [ ] Select custom view - table updates with correct columns
- [ ] Edit custom view - changes apply immediately
- [ ] Delete custom view - view removed from list
- [ ] Switch between custom view and Complete/Simplified views
- [ ] Navigate away and back to page - state preserved in session
- [ ] Test with empty view list (no custom views created)
- [ ] Test with many columns selected

## Browser Compatibility

Works with all modern browsers that support:
- ES6+ JavaScript
- CSS Grid
- MUI Joy UI components
- React 17+

## Future Enhancements

- [ ] Save selected view to localStorage for persistence
- [ ] Export/Import view configurations
- [ ] Share views between users
- [ ] View usage analytics
- [ ] Default view selection on page load
- [ ] Keyboard shortcuts for quick view switching
