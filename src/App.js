import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TableView from "./pages/TableView";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/table-view" element={<TableView />} />
        <Route path="/" element={<h1>Home Page</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
