// src/theme/accessibility.js
/**
 * Accessibility Utilities - WCAG Compliance
 * Validates color contrast ratios for medical UI
 * Target: WCAG AA (minimum 4.5:1 for normal text, 3:1 for large text)
 */

/**
 * Convert hex color to RGB values
 * @param {string} hex - Hex color (#RRGGBB or #RGB)
 * @returns {Object} { r, g, b } values (0-255)
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Calculate relative luminance
 * @param {Object} rgb - { r, g, b } values (0-255)
 * @returns {number} Relative luminance (0-1)
 */
export const getLuminance = (rgb) => {
  const { r, g, b } = rgb;
  
  // Convert RGB to sRGB
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  
  // Apply gamma correction
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - Hex color
 * @param {string} color2 - Hex color
 * @returns {number} Contrast ratio (1-21)
 */
export const getContrastRatio = (color1, color2) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    console.error('Invalid hex color provided');
    return 0;
  }
  
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Validate contrast ratio against WCAG standards
 * @param {string} foreground - Foreground hex color
 * @param {string} background - Background hex color
 * @param {string} level - 'AA' or 'AAA'
 * @param {string} size - 'normal' or 'large' (18pt+ or 14pt+ bold)
 * @returns {Object} { pass, ratio, required }
 */
export const validateContrast = (foreground, background, level = 'AA', size = 'normal') => {
  const ratio = getContrastRatio(foreground, background);
  
  // WCAG requirements
  const requirements = {
    'AA': {
      'normal': 4.5,
      'large': 3.0
    },
    'AAA': {
      'normal': 7.0,
      'large': 4.5
    }
  };
  
  const required = requirements[level][size];
  const pass = ratio >= required;
  
  return {
    pass,
    ratio: ratio.toFixed(2),
    required,
    level,
    size
  };
};

/**
 * Get contrast grade (AA, AAA, or FAIL)
 * @param {string} foreground - Foreground hex color
 * @param {string} background - Background hex color
 * @param {string} size - 'normal' or 'large'
 * @returns {string} 'AAA', 'AA', or 'FAIL'
 */
export const getContrastGrade = (foreground, background, size = 'normal') => {
  const ratio = getContrastRatio(foreground, background);
  
  if (size === 'normal') {
    if (ratio >= 7.0) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    return 'FAIL';
  } else {
    if (ratio >= 4.5) return 'AAA';
    if (ratio >= 3.0) return 'AA';
    return 'FAIL';
  }
};

/**
 * Batch validate multiple color combinations
 * @param {Array} combinations - Array of { fg, bg, label, size? }
 * @returns {Array} Validation results
 */
export const validateColorCombinations = (combinations) => {
  return combinations.map(({ fg, bg, label, size = 'normal' }) => {
    const result = validateContrast(fg, bg, 'AA', size);
    const grade = getContrastGrade(fg, bg, size);
    
    return {
      label,
      foreground: fg,
      background: bg,
      size,
      ...result,
      grade,
      status: result.pass ? '✅ PASS' : '❌ FAIL'
    };
  });
};

export default {
  hexToRgb,
  getLuminance,
  getContrastRatio,
  validateContrast,
  getContrastGrade,
  validateColorCombinations
};
