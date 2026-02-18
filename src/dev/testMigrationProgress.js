/**
 * Quick Integration Test for Migration Progress Endpoint
 * 
 * Run this to verify backend integration works:
 * node src/dev/testMigrationProgress.js
 */

import { fetchMigrationProgress } from '../api/migrationApi.js';

async function testMigrationProgress() {
  console.log("🔍 Testing Migration Progress Endpoint...\n");
  
  try {
    const progress = await fetchMigrationProgress();
    
    console.log("✅ SUCCESS! Migration progress fetched:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📊 Total Legacy Cases:   ${progress.total}`);
    console.log(`✔️  Migrated Cases:       ${progress.migrated}`);
    console.log(`📈 Progress:              ${progress.percent.toFixed(1)}%`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    // Verify data types
    if (typeof progress.total !== 'number') {
      console.warn("⚠️  WARNING: 'total' should be a number");
    }
    if (typeof progress.migrated !== 'number') {
      console.warn("⚠️  WARNING: 'migrated' should be a number");
    }
    if (typeof progress.percent !== 'number') {
      console.warn("⚠️  WARNING: 'percent' should be a number");
    }
    
    // Verify calculations
    const calculatedPercent = progress.total > 0 
      ? (progress.migrated / progress.total) * 100 
      : 0;
    
    if (Math.abs(calculatedPercent - progress.percent) > 0.1) {
      console.warn(`⚠️  WARNING: Percent calculation mismatch`);
      console.warn(`   Expected: ${calculatedPercent.toFixed(1)}%`);
      console.warn(`   Received: ${progress.percent.toFixed(1)}%`);
    }
    
    console.log("✅ All checks passed! Backend integration working correctly.\n");
    
  } catch (error) {
    console.error("❌ FAILED! Error fetching migration progress:");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("Error:", error.message);
    
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
    
    console.error("\n🔧 Troubleshooting:");
    console.error("1. Check if backend is running");
    console.error("2. Verify you're logged in as SOFTWARE_ADMIN or WORKER");
    console.error("3. Check CORS configuration");
    console.error("4. Verify endpoint: GET /api/migration/progress");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  }
}

testMigrationProgress();
