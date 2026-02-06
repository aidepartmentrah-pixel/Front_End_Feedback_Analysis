// Clinical Professional Brand Theme
// Deep teal sidebar with clean light top bar - trustworthy and calm
// Enhanced with depth, hierarchy, and visual life

const brandTheme = {
  // Core Brand Colors
  colors: {
    primary_deep_teal: '#1F6F73',
    primary_teal: '#2CA6A4',
    primary_teal_light: '#3FA7A3',
    accent_green: '#7DBB42',
    bg_app: '#EEF5F5',
    bg_panel: '#F7FBFB',
    bg_card: '#FFFFFF',
    bg_light: '#F7FBFB',
    bg_main: '#F3F8F8',
    border_soft: '#D7ECEB',
    border_card: '#E2EEEE',
    text_dark: '#1F2D2E',
  },

  // Sidebar Styling - Enhanced with gradient and depth
  sidebar: {
    background: '#164E51',
    innerShadow: 'none',
    text: '#FFFFFF',
    textSecondary: '#CFECEC',
    icon: 'rgba(255, 255, 255, 0.85)',
    iconActive: '#FFFFFF',
    hoverBackground: 'rgba(255, 255, 255, 0.14)',
    activeBackground: '#3FA7A3',
    activeBorderLeft: '4px solid #7DBB42',
    activeFontWeight: 600,
    activeBorderRadius: '8px',
    activeBoxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)',
    divider: 'rgba(255, 255, 255, 0.10)',
    // Structural zones
    logoZoneOverlay: 'transparent',
    footerZoneOverlay: 'transparent',
    logoPanel: {
      background: 'transparent',
      border: 'none',
      borderRadius: '0',
      shadow: 'none',
      backdropFilter: 'none',
    },
  },

  // Top Bar Styling - Enhanced with accent stripe and increased weight
  topbar: {
    background: '#F7FBFB',
    topStripe: '3px solid #2CA6A4',
    accentLine: '3px solid #2CA6A4',
    borderBottom: '#D7ECEB',
    titleText: '#1F2D2E',
    accent: '#2CA6A4',
    userText: '#1F6F73',
    userTextSecondary: '#2CA6A4',
    height: '72px',
  },

  // Button Styling - Enhanced hover states
  button: {
    primary: {
      background: '#2CA6A4',
      text: '#FFFFFF',
      hover: '#1F8E8C',
    },
    secondary: {
      background: '#7DBB42',
      text: '#FFFFFF',
      hover: '#6AA535',
    },
  },

  // Card Styling - Premium elevation without borders
  card: {
    background: '#FFFFFF',
    shadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 8px 22px rgba(0,0,0,0.06)',
    accentStripHeight: '4px',
  },

  // Section Accents
  section: {
    accentLine: {
      color: '#2CA6A4',
      thickness: '2px',
      width: '32px',
    },
  },

  // Metric Card Accent Strips (top accent)
  metricStrips: {
    teal: '#6BCBC6',
    green: '#9AD36A',
    orange: '#F5C27A',
    red: '#F2A3A3',
  },

  // Utility Shadows
  shadows: {
    sidebar: '4px 0 20px rgba(31, 111, 115, 0.15)',
    topbar: '0 2px 8px rgba(31, 111, 115, 0.08)',
    button: '0 2px 8px rgba(44, 166, 164, 0.25)',
    card: '0 1px 0 rgba(255,255,255,0.9) inset, 0 8px 22px rgba(0,0,0,0.06)',
    cardPremium: '0 8px 22px rgba(0,0,0,0.06)',
  },

  // Line Hierarchy System (3 Levels)
  lines: {
    // Level 1 - Structural Divider (Thick)
    structural: {
      height: '3px',
      color: '#2CA6A4',
      usage: 'topbar bottom edge, main horizontal anchors'
    },
    // Level 2 - Section Dividers (Medium)
    section: {
      height: '2px',
      color: '#D7EAEA',
      usage: 'card headers, panel separators'
    },
    // Level 3 - Soft Borders (Thin)
    soft: {
      height: '1px',
      color: '#E3EEEE',
      usage: 'inputs, small containers'
    }
  },
};

export default brandTheme;
