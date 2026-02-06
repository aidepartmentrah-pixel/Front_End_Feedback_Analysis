# InsightPage.jsx Field Usage Verification Report

**Date:** February 3, 2026  
**Task:** F-I11 — Verify InsightPage.jsx Field Usage  
**Status:** ⚠️ 1 Critical Issue Found

---

## Verification Results

### ✅ 1. KPI Cards (Lines 163-189)
**Status: CORRECT**

Fields match `adaptKpiSummary` output:
```javascript
kpis?.open_subcases       ✓
kpis?.pending_approvals   ✓
kpis?.active_action_items ✓
kpis?.overdue_items       ✓
```

No references to old backend fields:
- ~~total_subcases~~ ✓ Not found
- ~~by_status~~ ✓ Not found
- ~~action_items.*~~ ✓ Not found

---

### ✅ 2. Distribution Chart (Lines 351-370)
**Status: CORRECT**

PieChart configuration matches `adaptDistribution` output:
```jsx
<Pie
  data={distribution}
  dataKey="value"    ✓  // Correct
  nameKey="label"    ✓  // Correct
  ...
/>
```

No usage of old backend fields:
- ~~key~~ ✓ Not found
- ~~count~~ ✓ Not found (correctly uses "value")

---

### ✅ 3. Trend Chart (Lines 389-408)
**Status: CORRECT**

LineChart configuration matches `adaptTrend` output:
```jsx
<LineChart data={trend}>
  <XAxis dataKey="period" />  ✓  // Correct
  <Line dataKey="count" />    ✓  // Correct
  ...
</LineChart>
```

No usage of old backend field:
- ~~bucket~~ ✓ Not found (correctly uses "period")

---

### ❌ 4. Stuck Table & Data Loading
**Status: MISMATCHED**

#### Issue: Data Extraction Expects Wrong Structure (Lines 132-135)

**Current Code:**
```javascript
setDistribution(distData?.data || []);    // ❌ Expects {data: [...]}
setTrend(trendData?.data || []);          // ❌ Expects {data: [...]}
setStuckCases(stuckData?.items || []);    // ❌ Expects {items: [...]}
```

**Problem:**
The adapted API functions return flat arrays directly:
- `getInsightDistribution()` → `[{label, value}, ...]`
- `getInsightTrend()` → `[{period, count}, ...]`
- `getStuckCases()` → `[{subcase_id, stage, ...}, ...]`

But the page expects nested structures:
- `{data: [{label, value}, ...]}`
- `{data: [{period, count}, ...]}`
- `{items: [{subcase_id, stage, ...}, ...]}`

**Expected Fix:**
```javascript
setDistribution(distData || []);     // ✓ Use flat array directly
setTrend(trendData || []);           // ✓ Use flat array directly
setStuckCases(stuckData || []);      // ✓ Use flat array directly
```

**Impact:**
Currently displays empty charts/table because:
- `distData?.data` evaluates to `undefined` (distData is already the array)
- `trendData?.data` evaluates to `undefined`
- `stuckData?.items` evaluates to `undefined`

#### Table Columns (Lines 434-488)
**Status: CORRECT** ✓

All column references match `adaptStuckCases` output:
```javascript
row.subcase_id          ✓
row.target_org_unit_id  ✓
row.stage               ✓
row.days_in_stage       ✓
row.assigned_level      ✓
row.status              ✓
```

---

## Summary

### Statistics
- **Total Sections Checked:** 4
- **Correct Sections:** 3
- **Issues Found:** 1 (critical)

### What Works
- ✅ KPI card field references
- ✅ Distribution chart dataKey/nameKey
- ✅ Trend chart dataKey
- ✅ Stuck table column references

### What Needs Fixing
- ❌ **Lines 132-135:** Data extraction expects nested structure but adapters return flat arrays

### Recommendation
**Next Task (F-I12):** Update lines 132-135 to remove `.data` and `.items` accessors since the adapted API functions now return flat arrays directly.

---

## Adapter Output Shapes (Reference)

```javascript
// getInsightKpis() returns:
{
  open_subcases: 0,
  pending_approvals: 0,
  active_action_items: 0,
  overdue_items: 0
}

// getInsightDistribution() returns:
[
  { label: 'DRAFT', value: 30 },
  { label: 'IN_REVIEW', value: 20 },
  ...
]

// getInsightTrend() returns:
[
  { period: '2024-01', count: 10 },
  { period: '2024-02', count: 15 },
  ...
]

// getStuckCases() returns:
[
  {
    subcase_id: 1001,
    target_org_unit_id: 5,
    updated_at: '2024-01-15T10:30:00Z',
    days_in_stage: 10,
    status: 'SECTION_REVIEW',
    stage: 'SECTION_REVIEW',
    assigned_level: '—'
  },
  ...
]
```

---

**Verification Complete**  
No code changes made (READ ONLY verification as requested)
