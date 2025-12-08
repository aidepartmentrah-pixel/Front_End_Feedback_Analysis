import React from "react";
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
