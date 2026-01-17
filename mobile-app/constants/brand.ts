/**
 * The Roots Digital Brand Colors and Theme
 */

export const BrandColors = {
  // Primary Brand Colors
  primary: '#2D5016', // Deep forest green - roots/nature
  primaryLight: '#4A7C2A',
  primaryDark: '#1A3009',
  
  // Secondary Colors
  secondary: '#8B7355', // Earthy brown
  secondaryLight: '#A68B6B',
  secondaryDark: '#6B5A40',
  
  // Accent Colors
  accent: '#C9A961', // Golden accent
  accentLight: '#E5C782',
  accentDark: '#A68840',
  
  // Status Colors
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',
  
  // Neutral Colors
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceDark: '#2C3E50',
  
  // Text Colors
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  textLight: '#FFFFFF',
  textDark: '#1A1A1A',
  
  // Border & Divider
  border: '#E0E0E0',
  divider: '#ECF0F1',
  
  // Shadows
  shadowLight: 'rgba(45, 80, 22, 0.1)',
  shadowMedium: 'rgba(45, 80, 22, 0.2)',
  shadowDark: 'rgba(45, 80, 22, 0.3)',
};

export const BrandGradients = {
  primary: ['#2D5016', '#4A7C2A', '#6B9E3E'],
  secondary: ['#8B7355', '#A68B6B', '#C9A961'],
  accent: ['#C9A961', '#E5C782', '#F5D99E'],
  background: ['#F8F9FA', '#FFFFFF'],
};

export const BrandTypography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    semiBold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
};

export const BrandSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export const BrandBorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const BrandShadows = {
  sm: {
    shadowColor: BrandColors.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: BrandColors.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: BrandColors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

