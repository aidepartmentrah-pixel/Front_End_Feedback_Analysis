// src/theme/colors.js
/**
 * Brand Color Palette - Hospital Identity
 * Based on logo3.png hospital branding
 * 
 * Primary: Teal (Medical, clean, trustworthy)
 * Secondary: Green (Health, growth, safety)
 */

export const brandColors = {
  // Primary Teal - Main brand color from logo
  teal: '#2BBCC4',
  tealDark: '#1F8F96',      // Hover states, emphasis
  tealLight: '#E6F7F8',     // Backgrounds, cards
  tealLighter: '#F0FAFB',   // Subtle backgrounds
  
  // Secondary Green - From logo leaves and hospital text
  green: '#64A70B',
  greenDark: '#4A7D08',     // Hover states
  greenLight: '#EAF5DA',    // Success backgrounds
  greenLighter: '#F5FAF0',  // Subtle success
  
  // Neutral Palette
  white: '#FFFFFF',
  gray50: '#FAFAFA',
  gray100: '#F5F7F8',       // Page backgrounds
  gray200: '#E0E0E0',       // Borders
  gray300: '#BDBDBD',
  gray400: '#9E9E9E',
  gray500: '#757575',
  gray600: '#616161',
  gray700: '#424242',
  gray800: '#333333',
  gray900: '#212121',
  
  // Status Colors (Semantic)
  success: '#64A70B',       // Green from brand
  successDark: '#4A7D08',
  successLight: '#EAF5DA',
  
  warning: '#FFA726',
  warningDark: '#F57C00',
  warningLight: '#FFF3E0',
  
  error: '#F44336',
  errorDark: '#C62828',
  errorLight: '#FFEBEE',
  
  info: '#2BBCC4',          // Teal from brand
  infoDark: '#1F8F96',
  infoLight: '#E6F7F8',
};

/**
 * Legacy color mappings (for reference during migration)
 * Old purple colors that need to be replaced
 */
export const legacyColors = {
  purplePrimary: '#667eea',   // → Replace with brandColors.teal
  purpleSecondary: '#764ba2', // → Replace with brandColors.green
};

export default brandColors;
