/**
 * PHASE J-9 — Visibility Test Runner Page
 * Temporary dev page to run visibility tests in the browser
 * 
 * HOW TO USE:
 * 1. Import this component in App.js temporarily
 * 2. Add a route: <Route path="/test-visibility" element={<VisibilityTestPage />} />
 * 3. Navigate to http://localhost:3000/test-visibility
 * 4. Click "Run Tests" button
 * 5. Check browser console for detailed output
 * 6. Remove this component and route after testing
 */

import React, { useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/joy';
import MainLayout from '../components/common/MainLayout';
import { runPhaseJVisibilityTests } from '../security/visibilityTestHarness';

const VisibilityTestPage = () => {
  const [testResult, setTestResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = () => {
    setIsRunning(true);
    setTestResult(null);

    console.log('\n' + '='.repeat(80));
    console.log('🚀 RUNNING PHASE J-9 VISIBILITY TESTS FROM UI');
    console.log('='.repeat(80) + '\n');

    try {
      // Run the test harness
      const result = runPhaseJVisibilityTests();
      
      setTestResult(result);
      setIsRunning(false);

      console.log('\n' + '='.repeat(80));
      console.log('✅ TEST EXECUTION COMPLETE - CHECK CONSOLE FOR DETAILS');
      console.log('='.repeat(80) + '\n');
    } catch (error) {
      console.error('❌ TEST EXECUTION FAILED:', error);
      setTestResult({ error: error.message });
      setIsRunning(false);
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography level="h1" sx={{ color: '#1a1e3f', mb: 2 }}>
            Phase J-9 — Visibility Test Harness
          </Typography>
          <Typography level="body-md" sx={{ color: '#666', mb: 3 }}>
            This page runs the visibility certification test that validates all role-based
            page and settings tab visibility rules.
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Button
            onClick={handleRunTests}
            disabled={isRunning}
            size="lg"
            sx={{
              backgroundColor: '#1a1e3f',
              '&:hover': {
                backgroundColor: '#2a2e4f',
              },
            }}
          >
            {isRunning ? '⏳ Running Tests...' : '🚀 Run Visibility Tests'}
          </Button>
        </Box>

        {testResult && testResult.error && (
          <Box
            sx={{
              p: 3,
              mb: 3,
              borderRadius: '8px',
              backgroundColor: '#ff4757',
              color: 'white',
            }}
          >
            <Typography level="h4" sx={{ mb: 1 }}>
              ❌ Error
            </Typography>
            <Typography>{testResult.error}</Typography>
          </Box>
        )}

        {testResult && !testResult.error && (
          <Box>
            <Box
              sx={{
                p: 3,
                mb: 3,
                borderRadius: '8px',
                backgroundColor:
                  testResult.totalFailed === 0 ? '#2ed573' : '#ff4757',
                color: 'white',
              }}
            >
              <Typography level="h4" sx={{ mb: 2 }}>
                {testResult.totalFailed === 0
                  ? '✅ ALL TESTS PASSED!'
                  : `❌ ${testResult.totalFailed} TESTS FAILED`}
              </Typography>
              <Typography level="body-lg" sx={{ mb: 1 }}>
                Passed: {testResult.totalPassed}/{testResult.totalTests}
              </Typography>
              <Typography level="body-lg">
                Failed: {testResult.totalFailed}/{testResult.totalTests}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 3,
                borderRadius: '8px',
                backgroundColor: '#f5f5f5',
              }}
            >
              <Typography level="h4" sx={{ mb: 2, color: '#1a1e3f' }}>
                📊 Test Breakdown
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography level="body-md" sx={{ color: '#666' }}>
                  📄 Page Visibility Tests: {testResult.allResults.pageResults.passed}{' '}
                  passed, {testResult.allResults.pageResults.failed} failed
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography level="body-md" sx={{ color: '#666' }}>
                  ⚙️ Settings Tab Tests:{' '}
                  {testResult.allResults.settingsResults.passed} passed,{' '}
                  {testResult.allResults.settingsResults.failed} failed
                </Typography>
              </Box>
              <Box>
                <Typography level="body-md" sx={{ color: '#666' }}>
                  🛡️ Guard Helper Tests:{' '}
                  {testResult.allResults.guardResults.passed} passed,{' '}
                  {testResult.allResults.guardResults.failed} failed
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                mt: 3,
                p: 3,
                borderRadius: '8px',
                backgroundColor: '#fff3cd',
              }}
            >
              <Typography level="body-md" sx={{ color: '#856404' }}>
                ℹ️ <strong>Detailed test output is in the browser console.</strong>
                <br />
                Open Developer Tools (F12) and check the Console tab for the full
                test matrix.
              </Typography>
            </Box>
          </Box>
        )}
      </Container>
    </MainLayout>
  );
};

export default VisibilityTestPage;
