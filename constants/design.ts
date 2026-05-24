// Jurgol Design System — React Native tokens
// Mirrors the CSS foundations exactly.

// ── Fonts ────────────────────────────────────────────────────────────────────
export const Font = {
  display: {
    medium:    'BricolageGrotesque_500Medium',
    semibold:  'BricolageGrotesque_600SemiBold',
    bold:      'BricolageGrotesque_700Bold',
    black:     'BricolageGrotesque_800ExtraBold',
  },
  body: {
    regular:   'PlusJakartaSans_400Regular',
    medium:    'PlusJakartaSans_500Medium',
    semibold:  'PlusJakartaSans_600SemiBold',
    bold:      'PlusJakartaSans_700Bold',
    black:     'PlusJakartaSans_800ExtraBold',
  },
  mono: {
    regular:   'JetBrainsMono_400Regular',
    medium:    'JetBrainsMono_500Medium',
    bold:      'JetBrainsMono_700Bold',
  },
} as const;

// ── Colors ────────────────────────────────────────────────────────────────────
export const Color = {
  // Brand
  grass50:  '#ECFBEE',
  grass100: '#D2F4D7',
  grass300: '#6FD487',
  grass400: '#36BC61',
  grass500: '#18A34A',
  grass600: '#0E823B',
  grass700: '#0C6730',
  grass800: '#0A5128',
  grass900: '#073B1E',

  // Surfaces
  chalk:   '#FFFFFF',
  field:   '#F4F6EE',
  field2:  '#ECEFE4',
  pitch:   '#0B1F14',
  pitch2:  '#122A1B',
  pitch3:  '#1B3C28',

  // Accents
  lime:  '#6BE65E',
  sun:   '#FACC15',
  clay:  '#DC2A2A',
  sky:   '#2BA8E8',

  // Text
  fg1: '#0B1F14',
  fg2: '#3E4F45',
  fg3: '#6B7A70',
  fg4: '#98A39C',
  fgOnGrass: '#FFFFFF',
  fgOnPitch: '#ECEFE4',

  // Borders
  border1: 'rgba(11,31,20,0.08)',
  border2: 'rgba(11,31,20,0.14)',
  border3: 'rgba(11,31,20,0.24)',
  borderOnPitch: 'rgba(255,255,255,0.10)',

  // Semantic
  success:    '#18A34A',
  successBg:  '#ECFBEE',
  warning:    '#E69500',
  warningBg:  '#FFF1D6',
  danger:     '#DC2A2A',
  dangerBg:   '#FCE5E5',
  info:       '#2BA8E8',
  infoBg:     '#DCF2FC',
} as const;

// ── Spacing ───────────────────────────────────────────────────────────────────
export const Space = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 24,
  s7: 32,
  s8: 40,
  s9: 56,
  s10: 72,
} as const;

// ── Radii ─────────────────────────────────────────────────────────────────────
export const Radius = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   20,
  xl:   28,
  pill: 999,
} as const;

// ── Type scale ────────────────────────────────────────────────────────────────
export const TextSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  '2xl': 30,
  '3xl': 38,
} as const;
