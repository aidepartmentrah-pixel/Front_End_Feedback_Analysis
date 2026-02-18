// Diagnostic script to check RedFlags and Never Events API endpoints
const axios = require('axios');

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const endpoints = [
  // Red Flags endpoints
  { name: "Red Flags List", url: "/api/red-flags" },
  { name: "Red Flags Statistics", url: "/api/red-flags/statistics" },
  { name: "Red Flags Trends", url: "/api/red-flags/trends" },
  { name: "Red Flags Category Breakdown", url: "/api/red-flags/category-breakdown" },
  { name: "Red Flags Department Breakdown", url: "/api/red-flags/department-breakdown" },
  
  // Never Events endpoints
  { name: "Never Events List", url: "/api/never-events" },
  { name: "Never Events Statistics", url: "/api/never-events/statistics" },
  { name: "Never Events Trends", url: "/api/never-events/trends" },
  { name: "Never Events Category Breakdown", url: "/api/never-events/category-breakdown" },
  { name: "Never Events Timeline Comparison", url: "/api/never-events/timeline-comparison" },
];

async function checkEndpoint(endpoint) {
  const fullUrl = `${API_BASE_URL}${endpoint.url}`;
  try {
    console.log(`\n🔍 Testing: ${endpoint.name}`);
    console.log(`   URL: ${fullUrl}`);
    
    const response = await axios.get(fullUrl, {
      withCredentials: true,
      timeout: 5000,
      validateStatus: () => true // Accept any status code
    });
    
    if (response.status === 200) {
      console.log(`   ✅ SUCCESS (200)`);
      console.log(`   Data:`, JSON.stringify(response.data, null, 2).substring(0, 200));
    } else if (response.status === 404) {
      console.log(`   ❌ NOT FOUND (404) - Endpoint does not exist`);
    } else if (response.status === 401) {
      console.log(`   🔒 UNAUTHORIZED (401) - Authentication required`);
    } else if (response.status === 403) {
      console.log(`   🚫 FORBIDDEN (403) - Access denied`);
    } else {
      console.log(`   ⚠️  Status: ${response.status}`);
      console.log(`   Message:`, response.data);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`   ❌ CONNECTION REFUSED - Backend server not running`);
    } else if (error.code === 'ETIMEDOUT') {
      console.log(`   ⏱️  TIMEOUT - Server not responding`);
    } else {
      console.log(`   ❌ ERROR:`, error.message);
    }
  }
}

async function runDiagnostics() {
  console.log("=" .repeat(60));
  console.log("🚩 RedFlags & Never Events API Diagnostics");
  console.log("=" .repeat(60));
  console.log(`Backend URL: ${API_BASE_URL}`);
  
  for (const endpoint of endpoints) {
    await checkEndpoint(endpoint);
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("📋 Summary:");
  console.log("=".repeat(60));
  console.log("\nIf you see '404 NOT FOUND' for all endpoints:");
  console.log("  → Backend has not implemented these API endpoints yet");
  console.log("\nIf you see 'CONNECTION REFUSED':");
  console.log("  → Backend server is not running");
  console.log("\nIf you see '401 UNAUTHORIZED':");
  console.log("  → You need to login first (use browser session)");
  console.log("\n");
}

runDiagnostics();
