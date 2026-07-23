import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { JoyThemeProvider } from "./providers/ThemeProvider";
import "./assets/fonts/cairo/cairo.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <JoyThemeProvider>
      <App />
    </JoyThemeProvider>
  </React.StrictMode>
);
