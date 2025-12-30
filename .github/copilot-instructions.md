# Copilot Instructions for AI Agents

## Project Overview
- This is a React frontend bootstrapped with Create React App.
- The app is organized by feature domains (dashboard, departmentFeedback, doctorHistory, etc.) under `src/components/` and `src/pages/`.
- API integrations are modularized in `src/api/`.
- Data mocks and helpers are in `src/data/` and `src/utils/`.

## Key Workflows
- **Start Dev Server:** `npm start` (runs on http://localhost:3000)
- **Run Tests:** `npm test` (Jest, Testing Library)
- **Build for Production:** `npm run build`
- **Eject (advanced):** `npm run eject` (irreversible)

## Architectural Patterns
- **Component Structure:**
  - Major UI features are grouped in folders under `src/components/`.
  - Shared layout and UI elements are in `src/components/common/`.
  - Pages route to feature modules via `src/pages/`.
- **API Calls:**
  - Use `axios` via modules in `src/api/` (e.g., `dashboard.js`, `insertRecord.js`).
  - Keep API logic out of UI components.
- **State & Data:**
  - No global state manager (e.g., Redux) is present; state is managed locally or via React context if needed.
- **Styling:**
  - Uses MUI (`@mui/joy`, `@mui/icons-material`) and Emotion for styling.

## Project Conventions
- **File Naming:**
  - Use PascalCase for components, camelCase for helpers and data files.
- **Testing:**
  - Place tests alongside components or in a `__tests__` subfolder (if present).
- **Imports:**
  - Prefer relative imports within feature folders.
- **Data Mocks:**
  - Use files in `src/data/` for mock data during development.

## Integration Points
- **External APIs:**
  - All API endpoints are abstracted in `src/api/`.
- **UI Libraries:**
  - MUI and Emotion are used for UI and theming.

## Examples
- To add a new dashboard chart: create a component in `src/components/dashboard/`, add API logic in `src/api/dashboard.js`, and route via `src/pages/DashBoard.js`.
- For new data helpers: add to `src/utils/` and import where needed.

## References
- See `README.md` for basic scripts and Create React App details.
- Review `src/api/` and `src/components/` for feature structure and integration patterns.

---
If any conventions or workflows are unclear, ask for clarification or check for updates in this file and the project README.
