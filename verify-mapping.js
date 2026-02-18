// Quick verification of dateSliderMapping utilities
const {
  daysBetween,
  dateToIndex,
  indexToDate,
  clampIndex,
  isValidDateString,
  getDateRangeDays
} = require('./src/utils/dateSliderMapping');

console.log('=== Date Slider Mapping Verification ===\n');

// Test daysBetween
console.log('daysBetween Tests:');
console.log('  Same day (2024-01-01 to 2024-01-01):', daysBetween('2024-01-01', '2024-01-01'), '(expected: 0)');
console.log('  Next day (2024-01-01 to 2024-01-02):', daysBetween('2024-01-01', '2024-01-02'), '(expected: 1)');
console.log('  Leap year (2024-02-28 to 2024-03-01):', daysBetween('2024-02-28', '2024-03-01'), '(expected: 2)');
console.log('  Full year (2024-01-01 to 2024-12-31):', daysBetween('2024-01-01', '2024-12-31'), '(expected: 365)');

// Test dateToIndex
console.log('\ndateToIndex Tests:');
console.log('  Min date (2024-01-01 from 2024-01-01):', dateToIndex('2024-01-01', '2024-01-01'), '(expected: 0)');
console.log('  10 days after (2024-01-11 from 2024-01-01):', dateToIndex('2024-01-11', '2024-01-01'), '(expected: 10)');

// Test indexToDate
console.log('\nindexToDate Tests:');
console.log('  Index 0 from 2024-01-01:', indexToDate(0, '2024-01-01'), '(expected: 2024-01-01)');
console.log('  Index 15 from 2024-01-01:', indexToDate(15, '2024-01-01'), '(expected: 2024-01-16)');
console.log('  Index 1 from 2024-02-28:', indexToDate(1, '2024-02-28'), '(expected: 2024-02-29)');

// Test roundtrip
console.log('\nRoundtrip Tests:');
const testDate = '2024-06-15';
const idx = dateToIndex(testDate, '2024-01-01');
const backToDate = indexToDate(idx, '2024-01-01');
console.log(`  ${testDate} → index ${idx} → ${backToDate} (match: ${testDate === backToDate})`);

// Test clampIndex
console.log('\nclampIndex Tests:');
console.log('  clampIndex(5, 0, 10):', clampIndex(5, 0, 10), '(expected: 5)');
console.log('  clampIndex(-5, 0, 10):', clampIndex(-5, 0, 10), '(expected: 0)');
console.log('  clampIndex(15, 0, 10):', clampIndex(15, 0, 10), '(expected: 10)');

// Test isValidDateString
console.log('\nisValidDateString Tests:');
console.log('  "2024-01-01":', isValidDateString('2024-01-01'), '(expected: true)');
console.log('  "2024-02-29":', isValidDateString('2024-02-29'), '(expected: true)');
console.log('  "2025-02-29":', isValidDateString('2025-02-29'), '(expected: false)');
console.log('  "invalid":', isValidDateString('invalid'), '(expected: false)');

// Test getDateRangeDays
console.log('\ngetDateRangeDays Tests:');
console.log('  2024-01-01 to 2024-01-31:', getDateRangeDays('2024-01-01', '2024-01-31'), '(expected: 30)');
console.log('  2024-01-01 to 2024-01-01:', getDateRangeDays('2024-01-01', '2024-01-01'), '(expected: 0)');

console.log('\n=== All Functions Verified ===');
