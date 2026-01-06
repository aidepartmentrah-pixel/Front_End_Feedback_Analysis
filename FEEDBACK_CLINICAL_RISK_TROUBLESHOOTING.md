# Feedback Intent & Clinical Risk Type Selection Troubleshooting

## Issue Summary
The AI model classification returns:
- `feedback_type_id: 1` → Should map to `feedback_intent_type_id`
- `improvement_opportunity_type_id: 1` → Should map to `clinical_risk_type_id`

But these fields are not being selected in the form UI.

## Root Cause Analysis

### 1. **Data Flow Verification**

The mapping IS implemented correctly in `src/utils/classificationMappings.js`:

```javascript
// Maps feedback_type_id from API → feedback_intent_type_id for form
if (classificationResponse.feedback_type_id) {
  result.feedback_intent_type_id = Number(classificationResponse.feedback_type_id);
}

// Maps improvement_opportunity_type_id from API → clinical_risk_type_id for form  
if (classificationResponse.improvement_opportunity_type_id) {
  result.clinical_risk_type_id = Number(classificationResponse.improvement_opportunity_type_id);
}
```

### 2. **Three Possible Issues**

#### Issue A: Dropdown Options Not Loading
The form displays dropdown options from `referenceData`:
- `referenceData.feedback_intent_types` (array of objects with `id` property)
- `referenceData.clinical_risk_types` (array of objects with `id` property)

**Check:** Does `GET /api/reference/all` return these arrays with matching IDs?

#### Issue B: ID Mismatch
The AI model returns `feedback_type_id: 1` but the reference data might have different ID ranges:
- AI returns: `1, 2, 3...`
- Reference data has: `10, 11, 12...`

**Check:** Do the IDs from classification API match the IDs in reference data?

#### Issue C: Form Field Not Updating
The values ARE being set in formData but the Select component might not be rendering them.

**Check:** Browser console should show:
```
🔍 Setting feedback_intent_type_id: 1
🔍 Setting clinical_risk_type_id: 1
```

## Debugging Steps

### Step 1: Check Reference Data is Loading
Open browser DevTools Console and check:
```javascript
// Look for this in console logs
console.log("Setting reference data:", data);
// Check if these arrays exist:
// - feedback_intent_types
// - clinical_risk_types
```

### Step 2: Check API Response Structure
When running "Run AI Extraction", check the classification response:
```
Classification Response (RAW): {
  "success": true,
  "text": "...",
  "classifications": {
    "feedback_type_id": 1,
    "improvement_opportunity_type_id": 1,
    ...
  }
}
```

### Step 3: Check Mapping Results
Look for these console logs:
```
✅ Mapped feedback_type_id: 1 → feedback_intent_type_id: 1
✅ Mapped improvement_opportunity_type_id: 1 → clinical_risk_type_id: 1
📊 Final normalized result: { ..., feedback_intent_type_id: 1, clinical_risk_type_id: 1 }
```

### Step 4: Check Form Update
Look for:
```
🔍 Setting feedback_intent_type_id: 1
🔍 Setting clinical_risk_type_id: 1
✅ After setting - check formData state
```

## Quick Diagnostics

Add this to the browser console to check current state:

```javascript
// Run this in browser console during the AI extraction process

// 1. Check if reference data has the types
let feedback_types = document.querySelector('[aria-label*="Feedback Intent"]')?.parentElement;
console.log("Feedback Intent Types Available:", feedback_types);

// 2. Check form values
// (This would need React DevTools to inspect actual state)

// 3. Check API response manually
fetch('http://127.0.0.1:8000/api/reference/all')
  .then(r => r.json())
  .then(data => {
    console.log("Available Feedback Intent Types:", data.feedback_intent_types);
    console.log("Available Clinical Risk Types:", data.clinical_risk_types);
  });
```

## Expected Behavior

After running "Run AI Extraction":

1. ✅ AI returns classification with `feedback_type_id` and `improvement_opportunity_type_id`
2. ✅ `normalizeClassifications` maps these to form field names
3. ✅ Form state updates with mapped values
4. ✅ Select dropdowns display the selected values
5. ✅ Form is ready to submit

## Solution Checklist

- [ ] Verify `GET /api/reference/all` returns `feedback_intent_types` array
- [ ] Verify `GET /api/reference/all` returns `clinical_risk_types` array
- [ ] Check that IDs in both arrays match the values returned by AI
- [ ] Verify Select components are receiving the correct props
- [ ] Run AI extraction and check all console logs
- [ ] Verify dropdown options appear and are selectable
- [ ] Test form submission with auto-filled values

## Next Steps

1. **Run the improved logging** - All changes have been made to add detailed console logs
2. **Trigger AI Extraction** - Watch the console for the debug output
3. **Report findings** - Share which step fails and what console shows
4. **Backend validation** - If IDs don't match, backend may need adjustment

## Files Modified for Debugging

1. `src/utils/classificationMappings.js` - Added detailed logging for field mapping
2. `src/pages/InsertRecord.js` - Added detailed logging for form updates

All new logs are prefixed with emoji for easy scanning:
- ✅ Success mapping
- ⚠️ Warnings (field not found)
- 🔍 Value inspection
- 📊 State inspection
- 🔄 Process steps
