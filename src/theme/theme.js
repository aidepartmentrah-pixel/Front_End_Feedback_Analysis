// src/theme/theme.js
/**
 * Hospital Brand Theme - Semantic Role Mapping
 * Maps brand colors to UI component roles
 * Use semantic names (primary, success) not color names (teal, green)
 */

import { brandColors } from './colors';
import { gradients } from './gradients';

export const theme = {
  // ==================== SEMANTIC COLOR ROLES ====================
  colors: {
    // Primary brand colors
    primary: brandColors.teal,
    primaryHover: brandColors.tealDark,
    primaryLight: brandColors.tealLight,
    primaryLighter: brandColors.tealLighter,
    
    // Secondary brand colors
    secondary: brandColors.green,
    secondaryHover: brandColors.greenDark,
    secondaryLight: brandColors.greenLight,
    secondaryLighter: brandColors.greenLighter,
    
    // Status colors
    success: brandColors.success,
    successHover: brandColors.successDark,
    successLight: brandColors.successLight,
    
    warning: brandColors.warning,
    warningHover: brandColors.warningDark,
    warningLight: brandColors.warningLight,
    
    error: brandColors.error,
    errorHover: brandColors.errorDark,
    errorLight: brandColors.errorLight,
    
    info: brandColors.info,
    infoHover: brandColors.infoDark,
    infoLight: brandColors.infoLight,
    
    // UI surface colors
    background: brandColors.gray100,        // Page background
    surface: brandColors.white,             // Card/modal background
    surfaceHover: brandColors.gray50,       // Hover state
    
    // Border colors
    border: brandColors.gray200,
    borderLight: brandColors.gray300,
    borderDark: brandColors.gray400,
    
    // Text colors
    textPrimary: brandColors.gray800,       // Main text
    textSecondary: brandColors.gray600,     // Secondary text
    textTertiary: brandColors.gray500,      // Tertiary/disabled text
    textOnPrimary: brandColors.white,       // Text on teal background
    textOnSecondary: brandColors.white,     // Text on green background
    
    // Disabled state
    disabled: brandColors.gray300,
    disabledText: brandColors.gray400,
  },
  
  // ==================== GRADIENTS ====================
  gradients,
  
  // ==================== COMPONENT TOKENS ====================
  
  // Button styles
  button: {
    primary: {
      background: gradients.button,
      backgroundHover: brandColors.tealDark,
      color: brandColors.white,
    },
    secondary: {
      background: brandColors.green,
      backgroundHover: brandColors.greenDark,
      color: brandColors.white,
    },
    outlined: {
      border: brandColors.teal,
      color: brandColors.teal,
      hoverBackground: brandColors.tealLight,
    },
    disabled: {
      background: brandColors.gray300,
      color: brandColors.gray500,
    },
  },
  
  // Header/TopBar styles
  header: {
    background: gradients.header,
    text: brandColors.white,
  },
  
  // Login page styles
  login: {
    background: gradients.login,
    cardBackground: brandColors.white,
    buttonBackground: gradients.button,
  },
  
  // Card styles
  card: {
    background: brandColors.white,
    backgroundGradient: gradients.card,
    border: brandColors.gray200,
    shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  
  // Table styles
  table: {
    headerBackground: brandColors.tealLight,
    headerText: brandColors.gray800,
    rowHover: brandColors.gray50,
    border: brandColors.gray200,
  },
  
  // Badge/Chip styles
  badge: {
    primary: {
      background: brandColors.tealLight,
      text: brandColors.teal,
    },
    success: {
      background: brandColors.greenLight,
      text: brandColors.green,
    },
    warning: {
      background: brandColors.warningLight,
      text: brandColors.warning,
    },
    error: {
      background: brandColors.errorLight,
      text: brandColors.error,
    },
  },
  
  // Loading/Spinner styles
  loading: {
    color: brandColors.teal,
    background: brandColors.tealLight,
  },
  
  // Modal/Dialog styles
  modal: {
    overlay: 'rgba(0, 0, 0, 0.5)',
    background: brandColors.white,
    border: brandColors.gray200,
  },
  
  // Alert styles
  alert: {
    success: {
      background: brandColors.successLight,
      border: brandColors.success,
      text: brandColors.gray800,
    },
    warning: {
      background: brandColors.warningLight,
      border: brandColors.warning,
      text: brandColors.gray800,
    },
    error: {
      background: brandColors.errorLight,
      border: brandColors.error,
      text: brandColors.gray800,
    },
    info: {
      background: brandColors.infoLight,
      border: brandColors.info,
      text: brandColors.gray800,
    },
  },
};

export default theme;
