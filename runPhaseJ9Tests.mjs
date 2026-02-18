/**
 * PHASE J-9 — Run Visibility Tests via Node.js
 * 
 * This script imports the test harness directly and runs it via Node.js
 * Uses ES modules to import the harness
 */

import { runPhaseJVisibilityTests } from './src/security/visibilityTestHarness.js';

console.log('\n🚀 Executing Phase J-9 Visibility Certification Test...\n');

try {
  const results = runPhaseJVisibilityTests();
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINAL RESULTS');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${results.totalTests}`);
  console.log(`✅ Passed: ${results.totalPassed}`);  
  console.log(`❌ Failed: ${results.totalFailed}`);
  console.log('='.repeat(80) + '\n');
  
  // Exit with appropriate code
  if (results.totalFailed === 0) {
    console.log('✅ SUCCESS: All visibility tests passed!');
    process.exit(0);
  } else {
    console.log(`❌ FAILURE: ${results.totalFailed} tests failed`);
    process.exit(1);
  }
} catch (error) {
  console.error('\n❌ ERROR: Failed to run visibility tests');
  console.error(error);
  process.exit(1);
}
