export const colors = {
  primary: '#4F46E5', // Indigo modern
  primaryDark: '#3730A3',
  primaryLight: '#818CF8',
  primarySoft: '#EEF2FF',

  accent: '#06B6D4', // Vibrant Cyan
  accentSoft: '#ECFEFF',

  background: '#F8FAFC', // Slate 50
  card: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',

  textPrimary: '#0F172A', // Slate 900
  textSecondary: '#475569', // Slate 600
  textMuted: '#94A3B8', // Slate 400
  textInverse: '#FFFFFF',

  border: '#E2E8F0', // Slate 200
  borderFocus: '#6366F1',

  // Status colors
  status: {
    pending: {
      bg: '#FEF3C7',
      text: '#D97706',
      border: '#FDE68A',
      dot: '#F59E0B',
    },
    assigned: {
      bg: '#E0E7FF',
      text: '#4338CA',
      border: '#C7D2FE',
      dot: '#4F46E5',
    },
    inProgress: {
      bg: '#F3E8FF',
      text: '#7E22CE',
      border: '#E9D5FF',
      dot: '#9333EA',
    },
    closed: {
      bg: '#D1FAE5',
      text: '#065F46',
      border: '#A7F3D0',
      dot: '#10B981',
    },
    onHold: {
      bg: '#FFEDD5',
      text: '#C2410C',
      border: '#FED7AA',
      dot: '#F97316',
    },
  },

  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  shadowColor: '#0F172A',
};

export const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
};
