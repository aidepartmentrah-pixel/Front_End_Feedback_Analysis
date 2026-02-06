// src/theme/gradients.js
/**
 * Centralized Gradient Definitions
 * Prevents gradient drift across components
 * All gradients use hospital brand colors (teal + green)
 */

import { brandColors } from './colors';

export const gradients = {
  // Primary gradients - Teal to Green (brand identity)
  primary: `linear-gradient(135deg, ${brandColors.teal} 0%, ${brandColors.green} 100%)`,
  primaryReverse: `linear-gradient(135deg, ${brandColors.green} 0%, ${brandColors.teal} 100%)`,
  
  // Teal-only gradients
  teal: `linear-gradient(135deg, ${brandColors.teal} 0%, ${brandColors.tealDark} 100%)`,
  tealLight: `linear-gradient(135deg, ${brandColors.tealLight} 0%, ${brandColors.white} 100%)`,
  
  // Green-only gradients
  green: `linear-gradient(135deg, ${brandColors.green} 0%, ${brandColors.greenDark} 100%)`,
  greenLight: `linear-gradient(135deg, ${brandColors.greenLight} 0%, ${brandColors.white} 100%)`,
  
  // Subtle background gradients with opacity
  primarySubtle: `linear-gradient(135deg, rgba(43, 188, 196, 0.08) 0%, rgba(100, 167, 11, 0.08) 100%)`,
  primaryVerySubtle: `linear-gradient(135deg, rgba(43, 188, 196, 0.05) 0%, rgba(100, 167, 11, 0.05) 100%)`,
  
  tealSubtle: `linear-gradient(135deg, rgba(43, 188, 196, 0.1) 0%, rgba(31, 143, 150, 0.1) 100%)`,
  greenSubtle: `linear-gradient(135deg, rgba(100, 167, 11, 0.1) 0%, rgba(74, 125, 8, 0.1) 100%)`,
  
  // Neutral gradients
  neutral: `linear-gradient(135deg, ${brandColors.gray100} 0%, ${brandColors.white} 100%)`,
  neutralSubtle: `linear-gradient(135deg, ${brandColors.gray50} 0%, ${brandColors.white} 100%)`,
  
  // Specific use-case gradients
  header: `linear-gradient(135deg, ${brandColors.teal} 0%, ${brandColors.tealDark} 100%)`,
  button: `linear-gradient(135deg, ${brandColors.teal} 0%, ${brandColors.green} 100%)`,
  login: `linear-gradient(135deg, ${brandColors.teal} 0%, ${brandColors.green} 100%)`,
  card: `linear-gradient(135deg, ${brandColors.tealLight} 0%, ${brandColors.greenLight} 100%)`,
  
  // Success/Warning/Error gradients
  success: `linear-gradient(135deg, ${brandColors.success} 0%, ${brandColors.successDark} 100%)`,
  successSubtle: `linear-gradient(135deg, ${brandColors.successLight} 0%, ${brandColors.white} 100%)`,
  
  warning: `linear-gradient(135deg, ${brandColors.warning} 0%, ${brandColors.warningDark} 100%)`,
  warningSubtle: `linear-gradient(135deg, ${brandColors.warningLight} 0%, ${brandColors.white} 100%)`,
  
  error: `linear-gradient(135deg, ${brandColors.error} 0%, ${brandColors.errorDark} 100%)`,
  errorSubtle: `linear-gradient(135deg, ${brandColors.errorLight} 0%, ${brandColors.white} 100%)`,
};

/**
 * Legacy gradient mappings (for reference)
 * Old purple gradients to be replaced
 */
export const legacyGradients = {
  purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',           // → gradients.primary
  purpleSubtle: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', // → gradients.primarySubtle
};

export default gradients;
