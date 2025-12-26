# API Endpoints Specification for Red Flags & Never Events Cards

## Summary
Both Red Flags and Never Events pages need additional aggregated data endpoints to display detailed breakdown cards that were in the original design.

---

## 1. Red Flags - Category Breakdown Card

**Endpoint:** `GET /api/red-flags/category-breakdown`

**Purpose:** Show detailed breakdown of red flags by category with counts

**Query Parameters:**
- `from_date` (optional): Filter from date (YYYY-MM-DD)
- `to_date` (optional): Filter to date (YYYY-MM-DD)

**Response Format:**
```json
{
  "total": 245,
  "period": "2024-01-01 to 2024-12-31",
  "categories": [
    {
      "category_name": "Patient Safety",
      "category_name_ar": "سلامة المريض",
      "count": 98,
      "percentage": 40.0,
      "severity_breakdown": {
        "CRITICAL": 45,
        "HIGH": 53
      }
    },
    {
      "category_name": "Medical Errors",
      "category_name_ar": "الأخطاء الطبية",
      "count": 67,
      "percentage": 27.3,
      "severity_breakdown": {
        "CRITICAL": 30,
        "HIGH": 37
      }
    },
    {
      "category_name": "Medication Issues",
      "category_name_ar": "مشاكل الأدوية",
      "count": 45,
      "percentage": 18.4,
      "severity_breakdown": {
        "CRITICAL": 14,
        "HIGH": 31
      }
    }
  ]
}
```

**Frontend Usage:**
Display as a card showing:
- Pie chart or bar chart of categories
- List with category name, count, percentage
- Color-coded by severity

---

## 2. Red Flags - Department Breakdown Card

**Endpoint:** `GET /api/red-flags/department-breakdown`

**Purpose:** Show which departments have the most red flags

**Query Parameters:**
- `from_date` (optional): Filter from date (YYYY-MM-DD)
- `to_date` (optional): Filter to date (YYYY-MM-DD)
- `limit` (optional): Number of top departments to return (default: 10)

**Response Format:**
```json
{
  "total": 245,
  "period": "2024-01-01 to 2024-12-31",
  "departments": [
    {
      "department": "الطوارئ",
      "department_en": "Emergency",
      "count": 45,
      "percentage": 18.4,
      "status_breakdown": {
        "OPEN": 12,
        "UNDER_REVIEW": 20,
        "FINISHED": 13
      }
    },
    {
      "department": "العناية المركزة",
      "department_en": "ICU",
      "count": 38,
      "percentage": 15.5,
      "status_breakdown": {
        "OPEN": 8,
        "UNDER_REVIEW": 15,
        "FINISHED": 15
      }
    }
  ]
}
```

**Frontend Usage:**
Display as horizontal bar chart or table showing top departments with most red flags

---

## 3. Never Events - Category Breakdown Card

**Endpoint:** `GET /api/never-events/category-breakdown`

**Purpose:** Show detailed breakdown of never events by category

**Query Parameters:**
- `from_date` (optional): Filter from date (YYYY-MM-DD)
- `to_date` (optional): Filter to date (YYYY-MM-DD)

**Response Format:**
```json
{
  "total": 156,
  "period": "2024-01-01 to 2024-12-31",
  "goal": 0,
  "categories": [
    {
      "category_name": "Surgical Events",
      "category_name_ar": "أحداث جراحية",
      "count": 45,
      "percentage": 28.8,
      "types": [
        {
          "type": "Wrong Site Surgery",
          "type_ar": "الجراحة في الموقع الخطأ",
          "count": 20
        },
        {
          "type": "Retained Foreign Object",
          "type_ar": "جسم غريب متبقي",
          "count": 15
        }
      ]
    },
    {
      "category_name": "Product or Device Events",
      "category_name_ar": "أحداث المنتجات أو الأجهزة",
      "count": 38,
      "percentage": 24.4,
      "types": [
        {
          "type": "Contaminated Drugs",
          "type_ar": "أدوية ملوثة",
          "count": 25
        }
      ]
    }
  ]
}
```

**Frontend Usage:**
Display as expandable card showing:
- Category with count and percentage
- Expandable list showing specific never event types within each category
- RED color scheme to emphasize zero-tolerance
- Show "Goal: 0" prominently

---

## 4. Never Events - Timeline Comparison Card

**Endpoint:** `GET /api/never-events/timeline-comparison`

**Purpose:** Compare current period with previous periods to show if things are improving

**Query Parameters:**
- `period` (optional): `month` | `quarter` | `year` (default: `month`)

**Response Format:**
```json
{
  "goal": 0,
  "current": {
    "period": "December 2024",
    "period_ar": "ديسمبر 2024",
    "count": 12,
    "start_date": "2024-12-01",
    "end_date": "2024-12-31"
  },
  "previous": {
    "period": "November 2024",
    "period_ar": "نوفمبر 2024",
    "count": 15,
    "start_date": "2024-11-01",
    "end_date": "2024-11-30"
  },
  "change": {
    "absolute": -3,
    "percentage": -20.0,
    "trend": "improving"
  },
  "year_to_date": {
    "count": 156,
    "average_per_month": 13
  }
}
```

**Frontend Usage:**
Display as comparison card showing:
- Current period count vs previous period
- Arrow indicator (up/down) with percentage change
- "Improving" or "Worsening" label
- Year-to-date total
- Emphasis that goal is zero

---

## 5. Red Flags & Never Events Overlap Card (ALREADY EXISTS)

**Endpoint:** Already exists in `/api/red-flags/statistics`

**Current Response Field:**
```json
{
  "never_event_overlap": {
    "total_never_events": 45,
    "red_flags_also_never_events": 34,
    "never_events_only": 11,
    "red_flags_only": 211
  }
}
```

**This is already implemented and working** ✅

---

## Implementation Priority

### High Priority (Most Useful):
1. ✅ **Red Flags - Category Breakdown** - Shows what types of issues are most common
2. ✅ **Never Events - Category Breakdown** - Critical for understanding which never events occur
3. ✅ **Never Events - Timeline Comparison** - Shows if things are improving (critical for zero-tolerance goal)

### Medium Priority:
4. **Red Flags - Department Breakdown** - Helps identify which departments need support

---

## Frontend Card Layout Examples

### Red Flags Category Breakdown Card:
```
┌─────────────────────────────────────────────┐
│ 📊 Red Flags by Category                   │
│                                             │
│ Patient Safety        98 (40%)   [====]    │
│ Medical Errors        67 (27%)   [===]     │
│ Medication Issues     45 (18%)   [==]      │
│ Communication         35 (15%)   [==]      │
│                                             │
│ Total: 245 red flags                       │
└─────────────────────────────────────────────┘
```

### Never Events Category Breakdown Card:
```
┌─────────────────────────────────────────────┐
│ ⚠️ Never Events by Category (Goal: 0)      │
│                                             │
│ ▼ Surgical Events        45 (28.8%)        │
│   • Wrong Site Surgery        20           │
│   • Retained Foreign Object   15           │
│   • Wrong Patient/Procedure   10           │
│                                             │
│ ▼ Product/Device Events  38 (24.4%)        │
│   • Contaminated Drugs        25           │
│   • Air Embolism              13           │
│                                             │
│ Total: 156 events (Target: 0) 🎯           │
└─────────────────────────────────────────────┘
```

### Never Events Timeline Comparison Card:
```
┌─────────────────────────────────────────────┐
│ 📅 Never Events - Monthly Comparison       │
│                                             │
│ Current Month (Dec 2024):     12 events    │
│ Previous Month (Nov 2024):    15 events    │
│                                             │
│ Change: ↓ -3 (-20%) ✓ Improving           │
│                                             │
│ Year to Date: 156 events                   │
│ Monthly Average: 13                        │
│                                             │
│ 🎯 Goal: 0 events (Zero Tolerance)        │
└─────────────────────────────────────────────┘
```

---

## Notes for Backend Developer

1. **Date Filtering**: All endpoints should respect `from_date` and `to_date` parameters to allow users to compare different time periods

2. **Arabic Support**: Include both English and Arabic names where applicable (categories, departments, event types)

3. **Performance**: These are aggregation queries - consider caching results for common date ranges

4. **Sorting**: Categories/departments should be sorted by count (descending) by default

5. **Consistency**: Use the same field names as existing endpoints:
   - Status values: `OPEN`, `UNDER_REVIEW`, `FINISHED`
   - Severity values: `CRITICAL`, `HIGH`

6. **Error Handling**: Return 200 with empty arrays if no data exists for the period

---

## Testing URLs (Once Implemented)

```
GET http://127.0.0.1:8000/api/red-flags/category-breakdown
GET http://127.0.0.1:8000/api/red-flags/category-breakdown?from_date=2024-01-01&to_date=2024-12-31

GET http://127.0.0.1:8000/api/red-flags/department-breakdown?limit=10

GET http://127.0.0.1:8000/api/never-events/category-breakdown
GET http://127.0.0.1:8000/api/never-events/category-breakdown?from_date=2024-01-01

GET http://127.0.0.1:8000/api/never-events/timeline-comparison
GET http://127.0.0.1:8000/api/never-events/timeline-comparison?period=month
GET http://127.0.0.1:8000/api/never-events/timeline-comparison?period=quarter
```

---

**Once these endpoints are implemented, send me the response examples and I'll update the frontend to display the cards.**
