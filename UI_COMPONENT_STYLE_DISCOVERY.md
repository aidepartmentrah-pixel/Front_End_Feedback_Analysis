# UI Component Style Discovery

## UI Library

Primary: MUI Joy (@mui/joy v5.0.0-beta.52)

Secondary: MUI Material (minimal usage, only useMediaQuery hook)

Package.json dependencies:
```json
"@mui/joy": "^5.0.0-beta.52",
"@mui/icons-material": "^7.3.6",
"@emotion/react": "^11.14.0",
"@emotion/styled": "^11.14.1"
```

## Usage Breakdown

### MUI Joy (Primary)
Used in all pages and most components:
- Box, Card, Typography, Button, Sheet
- Select, Option, Input, FormControl, FormLabel
- Modal, ModalDialog, ModalClose
- Tabs, TabList, Tab, TabPanel
- Alert, CircularProgress, Chip
- Grid, Divider, Accordion
- RadioGroup, Radio, Checkbox

Examples from pages:
- [DashBoard.js](src/pages/DashBoard.js#L5)
- [TableView.js](src/pages/TableView.js#L3)
- [TrendMonitoringPage.js](src/pages/TrendMonitoringPage.js#L3)
- [FollowUpPage.js](src/pages/FollowUpPage.js#L4)
- [Login.js](src/pages/Login.js#L3)

### MUI Material (Minimal)
Only used for useMediaQuery in distribution charts:
- [DistributionBarChart.js](src/components/distribution/DistributionBarChart.js#L4)
- [DistributionPieChart.js](src/components/distribution/DistributionPieChart.js#L4)
- [DistributionLineChart.js](src/components/distribution/DistributionLineChart.js#L4)
- [DistributionStackedBarChart.js](src/components/distribution/DistributionStackedBarChart.js#L4)

Usage: `import useMediaQuery from '@mui/material/useMediaQuery';`

### MUI Icons
All icons from @mui/icons-material
Used across all pages and components

## Theme Provider

File: [src/providers/ThemeProvider.js](src/providers/ThemeProvider.js)

Implementation:
```javascript
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";

export const JoyThemeProvider = ({ children }) => (
  <CssVarsProvider
    defaultMode="light"
    modeStorageKey="dashboard-theme"
    colorSchemeSelector="class"
  >
    <CssBaseline />
    {children}
  </CssVarsProvider>
);
```

Applied in: [src/index.js](src/index.js)

## Main Layout Component

File: [src/components/common/MainLayout.js](src/components/common/MainLayout.js)

Structure:
```javascript
import Sidebar from "./Sidebar";
import TopBar from "./Topbar";
import { Box, Sheet } from "@mui/joy";

const MainLayout = ({ children }) => (
  <Box sx={{ display: "flex", height: "100vh", width: "100%" }}>
    <Sidebar />
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", marginLeft: "280px" }}>
      <TopBar />
      <Sheet sx={{ flex: 1, p: 3, overflow: "auto", backgroundColor: "#f5f7fa" }}>
        {children}
      </Sheet>
    </Box>
  </Box>
);
```

Layout components:
- [MainLayout.js](src/components/common/MainLayout.js) - Main wrapper
- [Sidebar.js](src/components/common/Sidebar.js) - Left navigation (280px fixed)
- [Topbar.js](src/components/common/Topbar.js) - Top bar with user info
- [DistributionErrorBoundary.js](src/components/common/DistributionErrorBoundary.js) - Error boundary

## Page Template Patterns

### Pattern 1: Standard Page with Layout
Most pages follow this pattern:

```javascript
import MainLayout from "../components/common/MainLayout";
import { Box, Card, Typography } from "@mui/joy";

const PageName = () => {
  return (
    <MainLayout>
      <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
        {/* Page content */}
      </Box>
    </MainLayout>
  );
};
```

Used in:
- DashBoard.js
- TableView.js
- TrendMonitoringPage.js
- FollowUpPage.js
- InvestigationPage.js
- ReportingPage.js
- SettingPage.js
- All other authenticated pages

### Pattern 2: Login Page (No Layout)
No MainLayout wrapper:

```javascript
import { Box, Card } from "@mui/joy";

const Login = () => {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card>{/* Login form */}</Card>
    </Box>
  );
};
```

Used in:
- [Login.js](src/pages/Login.js)

### Pattern 3: Tabbed Interface
Common pattern for pages with multiple views:

```javascript
import { Tabs, TabList, Tab, TabPanel } from "@mui/joy";

<Tabs defaultValue={0}>
  <TabList>
    <Tab>Tab 1</Tab>
    <Tab>Tab 2</Tab>
  </TabList>
  <TabPanel value={0}>{/* Content 1 */}</TabPanel>
  <TabPanel value={1}>{/* Content 2 */}</TabPanel>
</Tabs>
```

Used in:
- SettingPage.js
- HistoryPage.js
- DepartmentFeedbackPage.js
- TrendMonitoringPage.js
- SeasonalReportsPage.js

## Styling Approach

Method: MUI Joy sx prop with inline styles

Common patterns:
```javascript
<Box sx={{ p: 3, mb: 2, borderRadius: "8px" }}>
<Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
<Typography level="h4" sx={{ fontWeight: 700, color: "#667eea" }}>
```

No external CSS files
No styled-components (despite @emotion/styled being installed)
All styling via sx prop or style attribute

## Summary

Project exclusively uses MUI Joy as the primary UI library. MUI Material is only imported for useMediaQuery utility. All pages use MainLayout wrapper except Login. Standard pattern is MainLayout wrapping Box container with maxWidth constraint. Tabs commonly used for multi-view pages. Styling done entirely through sx prop with inline object notation.
