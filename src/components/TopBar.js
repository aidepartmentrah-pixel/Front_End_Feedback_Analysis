// src/components/TopBar.js
import React from "react";

const TopBar = ({ pageTitle }) => {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 20px",
      borderBottom: "1px solid #ccc",
      backgroundColor: "#f9f9f9",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
    }}>
      {/* Left: Page Title */}
      <div style={{ fontSize: "20px", fontWeight: "600" }}>
        {pageTitle}
      </div>

      {/* Center: Quick Actions */}
      <div>
        <button style={buttonStyle}>Add Record</button>
        <button style={buttonStyle}>Export</button>
      </div>

      {/* Right: User Info */}
      <div>
        <img 
          src="https://via.placeholder.com/32" 
          alt="User" 
          style={{ borderRadius: "50%", marginRight: "8px" }} 
        />
        <span>Admin</span>
      </div>
    </div>
  );
};

// Button style
const buttonStyle = {
  marginLeft: "10px",
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  backgroundColor: "#fff",
  cursor: "pointer",
  fontWeight: "500"
};

export default TopBar;
