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
    width: '85vw',
    maxWidth: '1500px',
    height: '85vh',
    maxHeight: '900px',
    primaryColumnBasis: '60%',
    supportColumnBasis: '40%',
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

  // ==================== TYPOGRAPHY SYSTEM ====================
  // Cairo supports both Latin and Arabic scripts — one family for everything in Settings
  typography: {
    fontFamilySettings: "'Cairo', 'Segoe UI', Tahoma, sans-serif",

    pageTitle:    { fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif", fontSize: '1.5rem',    fontWeight: 700, letterSpacing: '-0.01em', color: brandColors.gray800 },
    sectionTitle: { fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif", fontSize: '1.1rem',    fontWeight: 700, color: brandColors.gray800 },
    cardTitle:    { fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif", fontSize: '1rem',      fontWeight: 600, color: brandColors.gray800 },
    body:         { fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif", fontSize: '0.875rem',  fontWeight: 400, color: brandColors.gray700 },
    caption:      { fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif", fontSize: '0.75rem',   fontWeight: 400, color: brandColors.gray500 },
    formLabel:    { fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif", fontSize: '0.875rem',  fontWeight: 500, color: brandColors.gray700 },
    table:        { fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif", fontSize: '0.8125rem', fontWeight: 400, color: brandColors.gray800 },

    // Arabic text tokens — Cairo/Segoe UI both render Arabic natively
    arabic:      { fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif", fontSize: '0.9rem',    fontWeight: 500, direction: 'rtl', textAlign: 'right' },
    arabicSmall: { fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif", fontSize: '0.8rem',    fontWeight: 400, direction: 'rtl', textAlign: 'right' },
    arabicTable: { fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif", fontSize: '0.8125rem', fontWeight: 400, direction: 'rtl', textAlign: 'right' },
  },

  // ==================== SPACING SCALE ====================
  spacing: {
    xs:  '4px',
    sm:  '8px',
    md:  '16px',
    lg:  '24px',
    xl:  '32px',
    xxl: '48px',
  },

  // ==================== RADIUS SCALE ====================
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },

  // ==================== SHADOW SCALE ====================
  shadows: {
    card:     '0 2px 8px rgba(0, 0, 0, 0.10)',
    modal:    '0 12px 40px rgba(0, 0, 0, 0.25)',
    dropdown: '0 4px 16px rgba(0, 0, 0, 0.12)',
    hover:    '0 4px 12px rgba(0, 0, 0, 0.15)',
    focus:    '0 0 0 3px rgba(43, 188, 196, 0.25)',
  },

  // ==================== SETTINGS-SPECIFIC TOKENS ====================
  // Used by Settings tabs only — not applied globally
  settings: {
    fontFamily:      "'Cairo', 'Segoe UI', Tahoma, sans-serif",
    panelBackground: brandColors.white,
    sectionSpacing:  '24px',
    tableSpacing:    '16px',
    cardPadding:     '24px',
    tabPadding:      '8px 16px',
    headerColor:     brandColors.gray800,
    subtitleColor:   brandColors.gray500,
    dividerColor:    brandColors.gray200,
  },
};

export default theme;
