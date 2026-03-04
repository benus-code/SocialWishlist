import {Platform} from 'react-native';

export const colors = {
  primary: '#7c3aed',
  primaryLight: '#8b5cf6',
  primaryDark: '#6d28d9',
  primaryBg: '#f5f3ff',

  success: '#10b981',
  successBg: '#ecfdf5',
  warning: '#f59e0b',
  warningBg: '#fffbeb',
  error: '#ef4444',
  errorBg: '#fef2f2',
  info: '#3b82f6',

  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
};

export const fonts = {
  regular: Platform.select({ios: 'System', android: 'Roboto'}),
  medium: Platform.select({ios: 'System', android: 'Roboto'}),
  bold: Platform.select({ios: 'System', android: 'Roboto'}),
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
