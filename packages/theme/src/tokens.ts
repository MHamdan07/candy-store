export const colors = {
  smokyBlack: '#0F172A',
  oliveDrab: '#475569',
  bone: '#E2E8F0',
  floralWhite: '#F8FAFC',

  // Semantic
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  surfaceBone: '#E2E8F0',
  surfaceHover: '#E2E8F0',

  text: '#0F172A',
  textMuted: '#475569',
  textDim: '#94A3B8',
  textInverse: '#FFFFFF',

  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  borderHover: '#CBD5E1',
  borderDark: '#334155',

  // Status
  success: '#059669',
  successBg: '#ECFDF5',
  successBorder: '#A7F3D0',

  warning: '#D97706',
  warningBg: '#FFFBEB',
  warningBorder: '#FDE68A',

  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  dangerBorder: '#FECACA',

  info: '#0284C7',
  infoBg: '#F0F9FF',
  infoBorder: '#BAE6FD',

  // Confectionery accents
  promoCrimson: '#E11D48',
  promoPink: '#FFE4E6',
  promoWarmAmber: '#D97706',
  promoChocolate: '#451A03',
  promoCocoa: '#78350F',
  primary: '#E11D48',
  primaryHover: '#BE123C',

  // Admin layout
  adminSidebarBg: '#0F172A',
  adminSidebarText: '#F8FAFC',
  adminSidebarMuted: '#94A3B8',
  adminSidebarHover: '#1E293B',
  adminSidebarActive: '#E11D48',
  adminCanvas: '#F8FAFC',
} as const;

export const typography = {
  fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyHeading: '"Plus Jakarta Sans", -apple-system, sans-serif',
  fontFamilyMono: '"JetBrains Mono", monospace',
  sizes: {
    xs: '12px',
    sm: '13px',
    base: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const theme = {
  colors,
  typography,
  radii,
  spacing,
} as const;

export default theme;

