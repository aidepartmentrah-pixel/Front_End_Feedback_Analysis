# 🧠 Cascaded Hierarchy Report Scope - Implementation Summary

## 📋 Overview

The Report Scope selector now supports **cascaded hierarchy navigation** while maintaining a **depth control** via radio buttons. This allows users to navigate through the organizational structure (Administration → Department → Section) while the radio determines where the report generation stops.

---

## 🎯 Key Concept

**Radio = Report Depth** (Where does the report stop?)  
**Cascading Selectors = Navigation Tools** (How do I find the target unit?)

---

## 🛠️ State Structure

```javascript
const [reportScope, setReportScope] = useState({
  level: "hospital",            // Report depth: "hospital" | "administration" | "department" | "section"
  administrationIds: [],        // Selected administrations for navigation
  departmentIds: [],            // Selected departments for navigation
  sectionIds: []                // Selected sections (final target when level="section")
});
```

---

## 📊 UI Behavior by Level

### 1️⃣ Hospital Level
- **Radio Selected:** 🏥 المستشفى (Hospital)
- **Selectors Shown:** None
- **Report Generated For:** Entire hospital
- **State:**
  ```javascript
  {
    level: "hospital",
    administrationIds: [],
    departmentIds: [],
    sectionIds: []
  }
  ```

### 2️⃣ Administration Level
- **Radio Selected:** 🏢 إدارة (Administration)
- **Selectors Shown:** 
  - ✅ Administration (multi-select)
- **Report Generated For:** Selected administrations (or all if none selected)
- **State Example:**
  ```javascript
  {
    level: "administration",
    administrationIds: [1, 3, 5],  // User selected these
    departmentIds: [],              // Not used at this level
    sectionIds: []                  // Not used at this level
  }
  ```

### 3️⃣ Department Level
- **Radio Selected:** 🏬 دائرة (Department)
- **Selectors Shown:**
  - ✅ Administration (multi-select) - for navigation
  - ✅ Department (multi-select, filtered by selected administrations)
- **Report Generated For:** Selected departments (or all if none selected)
- **State Example:**
  ```javascript
  {
    level: "department",
    administrationIds: [2],         // Navigation: user navigated to this administration
    departmentIds: [4, 7, 9],       // TARGET: user selected these departments
    sectionIds: []                  // Not used at this level
  }
  ```

### 4️⃣ Section Level
- **Radio Selected:** 🧩 قسم (Section)
- **Selectors Shown:**
  - ✅ Administration (multi-select) - for navigation
  - ✅ Department (multi-select, filtered by selected administrations) - for navigation
  - ✅ Section (multi-select, filtered by selected departments)
- **Report Generated For:** Selected sections (or all if none selected)
- **State Example:**
  ```javascript
  {
    level: "section",
    administrationIds: [1],         // Navigation: drilling down
    departmentIds: [3],             // Navigation: drilling down
    sectionIds: [12, 15, 18]        // TARGET: final selection
  }
  ```

---

## 🧹 State Reset Rules

### When Report Level Changes (Radio Selection)
**Action:** User switches between Hospital/Administration/Department/Section  
**Reset:**
```javascript
administrationIds: []
departmentIds: []
sectionIds: []
```
**Why:** New depth requires fresh navigation

### When Administration Selection Changes
**Action:** User selects/deselects administrations  
**Reset:**
```javascript
departmentIds: []   // Clear downstream
sectionIds: []      // Clear downstream
```
**Why:** Departments belong to administrations - must re-navigate

### When Department Selection Changes
**Action:** User selects/deselects departments  
**Reset:**
```javascript
sectionIds: []  // Clear downstream
```
**Why:** Sections belong to departments - must re-navigate

---

## 🧠 Filtering Logic (Helper Functions)

### `getAdministrations()`
Returns all available administrations from hierarchy

### `getDepartments()`
- **If no administrations selected:** Returns ALL departments
- **If administrations selected:** Returns departments filtered by selected administrations

### `getSections()`
- **If no departments selected:** Returns ALL sections
- **If departments selected:** Returns sections filtered by selected departments

---

## 🎨 UX Features

✅ **Empty Selection = "ALL"**  
When no items are selected in a multi-select, it displays "الكل (All)" label

✅ **Chip Display**  
Selected items are shown as chips with Arabic names

✅ **Conditional Rendering**  
Selectors only appear when needed based on report level

✅ **Cascading Filters**  
Downstream selectors automatically update when upstream selections change

✅ **Loading State**  
All selectors are disabled while hierarchy data is loading

---

## 📁 Modified Files

### 1. `src/pages/ReportingPage.js`
**Changes:**
- Updated `reportScope` state structure to use `administrationIds`, `departmentIds`, `sectionIds`
- Updated `handleResetFilters` to reset all three ID arrays

### 2. `src/components/reports/ReportFilters.js`
**Changes:**
- Replaced single `handleScopeIdsChange` with three handlers:
  - `handleAdministrationChange` (clears departments & sections)
  - `handleDepartmentChange` (clears sections)
  - `handleSectionChange` (no downstream clearing)
- Replaced `getScopeItems()` with three specialized functions:
  - `getAdministrations()` - all administrations
  - `getDepartments()` - filtered by selected administrations
  - `getSections()` - filtered by selected departments
- Updated UI to show cascaded selectors based on report level:
  - `level="administration"` → Shows Administration selector only
  - `level="department"` → Shows Administration + Department selectors
  - `level="section"` → Shows Administration + Department + Section selectors

---

## ✅ Acceptance Criteria Status

✅ Radio controls how deep the user can go  
✅ Hierarchy navigation still works (cascaded selectors)  
✅ User can easily find departments & sections (filtered lists)  
✅ State stays consistent (proper reset rules)  
✅ No broken UI (all components render correctly)  
✅ No logic duplication (clean helper functions)  

---

## 🔮 Next Steps (Future Backend Integration)

When connecting to backend API:

1. **Parse reportScope state** to determine:
   - Report depth (`level`)
   - Target IDs based on level:
     - `level="administration"` → Use `administrationIds`
     - `level="department"` → Use `departmentIds`
     - `level="section"` → Use `sectionIds`

2. **Example API Call:**
```javascript
const payload = {
  reportType: "monthly",
  level: reportScope.level,
  targetIds: reportScope.level === "administration" ? reportScope.administrationIds :
             reportScope.level === "department" ? reportScope.departmentIds :
             reportScope.level === "section" ? reportScope.sectionIds : [],
  filters: { /* date, mode, etc */ }
};
```

3. **Backend should:**
   - Generate report AT the specified level
   - Aggregate data from selected units (or all if empty array)
   - Never mix levels (e.g., if level="department", only return department-level data)

---

## 🎯 Mental Model Summary

| **Radio Level** | **Purpose** | **Navigation Selectors** | **Target IDs** |
|----------------|-------------|--------------------------|----------------|
| Hospital       | Hospital-wide report | None | None |
| Administration | Report per Administration | Administration | `administrationIds` |
| Department     | Report per Department | Administration → Department | `departmentIds` |
| Section        | Report per Section | Administration → Department → Section | `sectionIds` |

**Remember:** The cascading selectors are NOT filters - they are navigation tools to help users locate specific organizational units deep in the hierarchy.

---

**Implementation Date:** January 8, 2026  
**Status:** ✅ Complete (UI/State Only - Backend Integration Pending)
