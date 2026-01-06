# Insert Endpoint Update Summary

## Overview
Updated the Insert Record page to match the new backend endpoint specification for `POST /api/records/add`.

## Changes Made

### 1. **Validation Layer** - [InsertRecord.js Lines 315-406]
Added comprehensive validation for all **12 REQUIRED** fields:

✅ `complaint_text` - Must be non-empty string (min 1 char)
✅ `feedback_received_date` - Must be present in YYYY-MM-DD format
✅ `issuing_department_id` - Must be > 0 (NOW REQUIRED)
✅ `domain_id` - Must be > 0
✅ `category_id` - Must be > 0
✅ `subcategory_id` - Must be > 0
✅ `classification_id` - Must be > 0
✅ `severity_id` - Must be > 0
✅ `stage_id` - Must be > 0
✅ `harm_id` - Must be > 0
✅ `clinical_risk_type_id` - Must be 1, 2, or 3 (special validation)
✅ `feedback_intent_type_id` - Must be > 0

**Error Messages:** Each field has specific validation with clear error messages shown to the user.

### 2. **Payload Construction** - [InsertRecord.js Lines 407-481]

#### Required Fields (Always included)
```javascript
const payload = {
  complaint_text: formData.complaint_text,
  feedback_received_date: formData.feedback_received_date,
  issuing_department_id: Number(formData.issuing_department_id),
  domain_id: Number(formData.domain_id),
  category_id: Number(formData.category_id),
  subcategory_id: Number(formData.subcategory_id),
  classification_id: Number(formData.classification_id),
  severity_id: Number(formData.severity_id),
  stage_id: Number(formData.stage_id),
  harm_id: Number(formData.harm_id),
  clinical_risk_type_id: Number(formData.clinical_risk_type_id),
  feedback_intent_type_id: Number(formData.feedback_intent_type_id),
};
```

#### Optional Fields (Conditionally included)
- **Text Content:** `immediate_action`, `taken_action`
- **Patient/Entity:** `patient_name`, `doctors` (array), `employees` (array)
- **Departments:** `target_department_ids` (array)
- **Metadata:** `source_id`, `building_id`, `is_inpatient`, `explanation_status_id`
- **ML Training:** `classification_ar` (float 0-10), `classification_en` (integer)
- **Type Fields:** `feedback_type`, `improvement_opportunity_type`

### 3. **Field Mappings**

| Frontend Field | Backend Field | Type | Notes |
|---|---|---|---|
| `in_out` | `is_inpatient` | Boolean | "IN" → true, "OUT" → false |
| `building` | `building_id` | Integer | "RAH" → 1, "BIC" → 2 |
| `doctor_ids` | `doctors` | Array of Objects | `{doctor_id, doctor_name}` |
| `employee_ids` | `employees` | Array of Objects | `{employee_id, employee_name}` |

### 4. **Type Conversions**
All numeric fields are converted to proper types:
- `Number()` - for integers
- `parseFloat()` - for floats (classification_ar)

### 5. **UI Components Status**

✅ **RecordMetadata.js** - Correctly shows `issuing_department_id` field
✅ **ClassificationFields.js** - All 12 required fields are present and properly labeled
✅ **TextBlocksWithButtons.js** - Complaint text input available
✅ **NEROutputs.js** - Doctor and employee selection available

## Testing Checklist

- [ ] All 12 required fields must be filled before submission
- [ ] Form validates and shows error messages for missing/invalid fields
- [ ] Payload includes all 12 required fields
- [ ] Optional fields are only included if they have values
- [ ] Numbers are properly typed
- [ ] Doctor/Employee arrays are properly formatted
- [ ] Clinical risk type validates as 1, 2, or 3
- [ ] Building and in_out mappings work correctly
- [ ] API endpoint receives correct JSON structure

## Example Payload

```json
{
  "complaint_text": "تأخر كبير في تشخيص الحالة الطارئة",
  "feedback_received_date": "2024-12-15",
  "issuing_department_id": 5,
  "domain_id": 1,
  "category_id": 2,
  "subcategory_id": 6,
  "classification_id": 10,
  "severity_id": 2,
  "stage_id": 1,
  "harm_id": 4,
  "clinical_risk_type_id": 3,
  "feedback_intent_type_id": 1,
  "immediate_action": "تم توفير الرعاية الفورية",
  "taken_action": "تم اتخاذ إجراءات تصحيحية",
  "patient_name": "أحمد محمد",
  "target_department_ids": [3, 4],
  "is_inpatient": true,
  "doctors": [
    { "doctor_id": 101, "doctor_name": "د. محمد علي" }
  ],
  "classification_en": 78
}
```

## Files Modified

1. **[src/pages/InsertRecord.js](src/pages/InsertRecord.js)**
   - Added validation for 12 required fields
   - Updated payload construction
   - Implemented proper field mappings
   - Added type conversions

2. **[src/api/insertRecord.js](src/api/insertRecord.js)**
   - No changes needed (already correct)
   - Uses `/api/records/add` endpoint
   - Properly handles request/response

## Important Notes

- **issuing_department_id** is now a REQUIRED field (was optional before)
- **clinical_risk_type_id** must be 1, 2, or 3 (special validation)
- All 12 fields must be present in the payload (no partial submissions)
- The form prevents submission until all required fields are valid
- Optional fields are intelligently included only when provided
