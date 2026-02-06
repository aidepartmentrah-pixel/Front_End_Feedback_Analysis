// src/theme/accessibility.test.js
/**
 * WCAG AA Accessibility Validation - Hospital Brand Colors
 * Tests all critical color combinations for medical UI compliance
 * Run this in browser console or Node to verify accessibility
 */

import { validateColorCombinations } from './accessibility';
import { brandColors } from './colors';

/**
 * Critical color combinations used in the hospital UI
 * Each must meet WCAG AA standards (4.5:1 for normal, 3:1 for large)
 */
export const criticalColorTests = [
  // ==================== PRIMARY BUTTONS ====================
  {
    label: 'Button: White text on Teal',
    fg: brandColors.white,
    bg: brandColors.teal,
    size: 'normal'
  },
  {
    label: 'Button: White text on Teal Dark (hover)',
    fg: brandColors.white,
    bg: brandColors.tealDark,
    size: 'normal'
  },
  {
    label: 'Button: White text on Green',
    fg: brandColors.white,
    bg: brandColors.green,
    size: 'normal'
  },
  {
    label: 'Button: White text on Green Dark (hover)',
    fg: brandColors.white,
    bg: brandColors.greenDark,
    size: 'normal'
  },
  
  // ==================== OUTLINED BUTTONS ====================
  {
    label: 'Outlined Button: Teal text on White',
    fg: brandColors.teal,
    bg: brandColors.white,
    size: 'normal'
  },
  {
    label: 'Outlined Button: Green text on White',
    fg: brandColors.green,
    bg: brandColors.white,
    size: 'normal'
  },
  
  // ==================== TEXT ON LIGHT BACKGROUNDS ====================
  {
    label: 'Text: Gray 800 (primary) on White',
    fg: brandColors.gray800,
    bg: brandColors.white,
    size: 'normal'
  },
  {
    label: 'Text: Gray 800 on Teal Light background',
    fg: brandColors.gray800,
    bg: brandColors.tealLight,
    size: 'normal'
  },
  {
    label: 'Text: Gray 800 on Green Light background',
    fg: brandColors.gray800,
    bg: brandColors.greenLight,
    size: 'normal'
  },
  {
    label: 'Text: Teal on Teal Light background',
    fg: brandColors.teal,
    bg: brandColors.tealLight,
    size: 'normal'
  },
  {
    label: 'Text: Green on Green Light background',
    fg: brandColors.green,
    bg: brandColors.greenLight,
    size: 'normal'
  },
  
  // ==================== TABLE HEADERS ====================
  {
    label: 'Table Header: Gray 800 text on Teal Light',
    fg: brandColors.gray800,
    bg: brandColors.tealLight,
    size: 'normal'
  },
  
  // ==================== BADGES / CHIPS ====================
  {
    label: 'Badge Primary: Teal text on Teal Light',
    fg: brandColors.teal,
    bg: brandColors.tealLight,
    size: 'normal'
  },
  {
    label: 'Badge Success: Green text on Green Light',
    fg: brandColors.green,
    bg: brandColors.greenLight,
    size: 'normal'
  },
  {
    label: 'Badge Warning: Warning text on Warning Light',
    fg: brandColors.warning,
    bg: brandColors.warningLight,
    size: 'normal'
  },
  {
    label: 'Badge Error: Error text on Error Light',
    fg: brandColors.error,
    bg: brandColors.errorLight,
    size: 'normal'
  },
  
  // ==================== ALERT STATES ====================
  {
    label: 'Alert Success: Gray 800 text on Green Light',
    fg: brandColors.gray800,
    bg: brandColors.greenLight,
    size: 'normal'
  },
  {
    label: 'Alert Warning: Gray 800 text on Warning Light',
    fg: brandColors.gray800,
    bg: brandColors.warningLight,
    size: 'normal'
  },
  {
    label: 'Alert Error: Gray 800 text on Error Light',
    fg: brandColors.gray800,
    bg: brandColors.errorLight,
    size: 'normal'
  },
  {
    label: 'Alert Info: Gray 800 text on Teal Light',
    fg: brandColors.gray800,
    bg: brandColors.tealLight,
    size: 'normal'
  },
  
  // ==================== SEVERITY INDICATORS ====================
  {
    label: 'Severity High: White text on Error',
    fg: brandColors.white,
    bg: brandColors.error,
    size: 'normal'
  },
  {
    label: 'Severity Medium: White text on Warning',
    fg: brandColors.white,
    bg: brandColors.warning,
    size: 'normal'
  },
  {
    label: 'Severity Low: White text on Success',
    fg: brandColors.white,
    bg: brandColors.success,
    size: 'normal'
  },
  
  // ==================== SECONDARY TEXT ====================
  {
    label: 'Secondary Text: Gray 600 on White',
    fg: brandColors.gray600,
    bg: brandColors.white,
    size: 'normal'
  },
  {
    label: 'Secondary Text: Gray 600 on Gray 100',
    fg: brandColors.gray600,
    bg: brandColors.gray100,
    size: 'normal'
  },
  
  // ==================== LARGE TEXT (Headers) ====================
  {
    label: 'Large Header: Teal on White',
    fg: brandColors.teal,
    bg: brandColors.white,
    size: 'large'
  },
  {
    label: 'Large Header: Green on White',
    fg: brandColors.green,
    bg: brandColors.white,
    size: 'large'
  },
];

/**
 * Run validation and return results
 */
export const runAccessibilityValidation = () => {
  console.log('\n🏥 HOSPITAL BRAND COLOR - WCAG AA ACCESSIBILITY VALIDATION\n');
  console.log('Target: WCAG AA (4.5:1 for normal text, 3:1 for large text)\n');
  console.log('='.repeat(80));
  
  const results = validateColorCombinations(criticalColorTests);
  
  // Display results
  results.forEach((result) => {
    console.log(`\n${result.status} ${result.label}`);
    console.log(`   Ratio: ${result.ratio}:1 | Required: ${result.required}:1 | Grade: ${result.grade}`);
    console.log(`   FG: ${result.foreground} | BG: ${result.background} | Size: ${result.size}`);
  });
  
  // Summary
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  const total = results.length;
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 SUMMARY: ${passed}/${total} PASSED | ${failed} FAILED`);
  
  if (failed > 0) {
    console.log('\n⚠️  WARNING: Some color combinations failed WCAG AA standards!');
    console.log('These need adjustment before production use in medical UI.\n');
    
    const failedTests = results.filter(r => !r.pass);
    console.log('Failed combinations:');
    failedTests.forEach(test => {
      console.log(`  - ${test.label} (${test.ratio}:1, needs ${test.required}:1)`);
    });
  } else {
    console.log('\n✅ SUCCESS: All color combinations meet WCAG AA standards!');
    console.log('Hospital brand colors are accessible for medical use.\n');
  }
  
  return {
    results,
    summary: {
      total,
      passed,
      failed,
      passRate: ((passed / total) * 100).toFixed(1) + '%'
    }
  };
};

// Auto-run in development
if (process.env.NODE_ENV === 'development') {
  console.log('📋 Accessibility validation available.');
  console.log('Run: import { runAccessibilityValidation } from "./theme/accessibility.test"');
  console.log('     runAccessibilityValidation()');
}

export default runAccessibilityValidation;
