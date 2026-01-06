# Frontend Troubleshooting Updates - Field Selection Issue

## Problem
When running AI extraction, `feedback_intent_type_id` and `clinical_risk_type_id` fields were not being auto-populated by the model's classification response.

## Root Cause
The AI model returns:
- `feedback_type_id` (from API)
- `improvement_opportunity_type_id` (from API)

But the form expects:
- `feedback_intent_type_id` (form field name)
- `clinical_risk_type_id` (form field name)

The mapping was already implemented in `classificationMappings.js`, but lacked proper debugging to verify the flow.

## Solution Implemented

### 1. Enhanced Logging in `src/utils/classificationMappings.js`

Added detailed console logs to track field mapping:

```javascript
// When feedback_type_id is found:
✅ Mapped feedback_type_id: 1 → feedback_intent_type_id: 1

// When improvement_opportunity_type_id is found:
✅ Mapped improvement_opportunity_type_id: 1 → clinical_risk_type_id: 1

// When fields are missing:
⚠️ feedback_type_id not found in response: {...}
⚠️ improvement_opportunity_type_id not found in response: {...}

// Final state:
📊 Final normalized result: {...}
```

### 2. Enhanced Logging in `src/pages/InsertRecord.js`

#### Classification Response Logging:
```javascript
// Raw response from API
console.log("Classification Response (RAW):", JSON.stringify(classResp, null, 2));

// Before normalization
console.log("Classifications RAW (before normalization):", JSON.stringify(classificationsRaw, null, 2));

// After normalization
console.log("Normalized classifications:", JSON.stringify(classifications, null, 2));
```

#### Form Update Logging:
```javascript
// Before setting form values
console.log("🔍 Setting feedback_intent_type_id:", classifications.feedback_intent_type_id);
console.log("🔍 Setting clinical_risk_type_id:", classifications.clinical_risk_type_id);

// After setting
console.log("✅ After setting - check formData state");
```

## Debugging Workflow

### Step 1: Trigger AI Extraction
1. Enter complaint text
2. Click "Run AI Extraction" button

### Step 2: Check Console Logs
Open Browser DevTools (F12) → Console tab

Look for logs in this order:
1. ✅ Classification Response (RAW)
2. ✅ Classifications RAW (before normalization)
3. ✅ Mapped feedback_type_id
4. ✅ Mapped improvement_opportunity_type_id
5. 📊 Final normalized result
6. 🔍 Setting feedback_intent_type_id
7. 🔍 Setting clinical_risk_type_id
8. ✅ After setting - check formData state

### Step 3: Identify Issue

#### If you see ⚠️ "not found" warnings:
- The API response structure might be different
- Check if fields are nested deeper in the response

#### If values show as null/undefined:
- API might not be returning these fields
- Check API response structure

#### If values are set but Select doesn't show them:
- Reference data might not have matching IDs
- Check if `referenceData.feedback_intent_types` and `referenceData.clinical_risk_types` contain the IDs returned by AI

## Files Modified

1. **src/utils/classificationMappings.js**
   - Lines 213-231: Added detailed mapping logs with emojis
   - Added console.warn for missing fields
   - Added final state logging

2. **src/pages/InsertRecord.js**
   - Lines 724-726: Raw API response logging with pretty JSON
   - Line 729: Pre-normalization response logging
   - Line 732: Post-normalization response logging
   - Lines 793-804: Form update logging for feedback and clinical risk fields

## Expected Console Output (Success Case)

```
Calling classifyText with text: [text from complaint]
Classification Response (RAW): {
  "success": true,
  "text": "...",
  "classifications": {
    "feedback_type_id": 1,
    "improvement_opportunity_type_id": 1,
    ...
  }
}
Classifications RAW (before normalization): {
  "feedback_type_id": 1,
  "improvement_opportunity_type_id": 1,
  ...
}
✅ Mapped feedback_type_id: 1 → feedback_intent_type_id: 1
✅ Mapped improvement_opportunity_type_id: 1 → clinical_risk_type_id: 1
📊 Final normalized result: {
  ...,
  feedback_intent_type_id: 1,
  clinical_risk_type_id: 1
}
Normalized classifications: {
  ...,
  feedback_intent_type_id: 1,
  clinical_risk_type_id: 1
}
🔍 Setting feedback_intent_type_id: 1
🔍 Setting clinical_risk_type_id: 1
✅ After setting - check formData state
```

## Next Steps

1. **Run AI Extraction** with the enhanced logging
2. **Check Console Output** - Share what you see
3. **Identify Point of Failure** - Let me know where the chain breaks
4. **Apply Target Fix** - Based on where it fails

## Possible Issues & Solutions

### Issue: Fields showing ⚠️ "not found"
**Solution**: API response structure might differ from expected. Check if response has nested structure that needs adjustment in `normalizeClassifications`.

### Issue: Values set but Select shows empty
**Solution**: The `referenceData.feedback_intent_types` or `referenceData.clinical_risk_types` arrays might not have matching IDs. Need to verify API `/reference/all` returns these with correct IDs.

### Issue: Nothing appears in console
**Solution**: The classification API itself might be failing. Check Network tab in DevTools for API errors.

## Testing Instructions

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. In the Insert page, enter a complaint text
4. Click "Run AI Extraction"
5. Watch the console logs in real-time
6. Share the complete console output for diagnosis

---

**Note**: All logging is added with clear emoji prefixes for easy scanning:
- ✅ Success indicators
- ⚠️ Warnings (missing fields)
- 🔍 Value inspection
- 📊 State inspection
