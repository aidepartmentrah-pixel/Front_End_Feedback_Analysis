// src/theme/index.js
/**
 * Theme System Barrel Export
 * Import everything from one place
 * 
 * Usage:
 *   import theme from '../theme';
 *   import { brandColors, gradients } from '../theme';
 */

export { brandColors, legacyColors } from './colors';
export { gradients, legacyGradients } from './gradients';
export { theme } from './theme';

// Default export is the complete theme object
export { theme as default } from './theme';
