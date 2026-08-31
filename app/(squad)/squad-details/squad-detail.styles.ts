import { StyleSheet } from 'react-native';
import { Color, Font, Radius, Space, TextSize } from '@/constants/design';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Color.field,
  },
  scroll: {
    flex: 1,
  },

  // Header bar
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Space.s4,
    paddingTop: Space.s3,
    paddingBottom: Space.s4,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Color.chalk,
    borderWidth: 1,
    borderColor: Color.border2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.14 * TextSize.xs,
    color: Color.fg1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  // Team hero card
  heroCard: {
    marginHorizontal: Space.s4,
    marginBottom: Space.s5,
    backgroundColor: Color.chalk,
    borderRadius: Radius.xl,
    padding: Space.s5,
    gap: Space.s5,
    borderWidth: 1,
    borderColor: Color.border2,
    shadowColor: Color.pitch,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.s4,
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
  },
  avatarText: {
    fontFamily: Font.display.black,
    fontSize: TextSize.xl,
    color: Color.fgOnGrass,
  },
  heroMeta: {
    flex: 1,
    gap: Space.s1,
    paddingTop: 2,
  },
  heroYear: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.14 * TextSize.xs,
    color: Color.fg3,
    textTransform: 'uppercase',
  },
  heroName: {
    fontFamily: Font.display.black,
    fontSize: TextSize['2xl'],
    color: Color.fg1,
    lineHeight: TextSize['2xl'] * 1.1,
    letterSpacing: -0.02 * TextSize['2xl'],
  },
  roleBadgeRow: {
    flexDirection: 'row',
    marginTop: Space.s1,
  },
  roleBadge: {
    paddingHorizontal: Space.s3,
    paddingVertical: Space.s1,
    borderRadius: Radius.pill,
  },
  roleBadgeCaptain: {
    backgroundColor: Color.sun,
  },
  roleBadgeMember: {
    backgroundColor: Color.pitch3,
  },
  roleBadgeText: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.xs,
    color: Color.pitch,
  },
  roleBadgeTextMember: {
    color: Color.fg1,
  },

  // Hero bottom stats
  heroDivider: {
    height: 1,
    backgroundColor: Color.border1,
  },
  heroStats: {
    flexDirection: 'row',
    gap: Space.s7,
  },
  heroStatItem: {
    gap: 2,
  },
  heroStatLabel: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.14 * TextSize.xs,
    color: Color.fg3,
    textTransform: 'uppercase',
  },
  heroStatValue: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.md,
    color: Color.fg1,
  },

  // ── Light content area ──────────────────────────────────────────────────────
  lightSection: {
    backgroundColor: Color.field,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Space.s4,
    gap: Space.s4,
  },

  // Record card
  recordCard: {
    backgroundColor: Color.chalk,
    borderRadius: Radius.lg,
    padding: Space.s5,
    gap: Space.s5,
    shadowColor: Color.pitch,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordTitle: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.14 * TextSize.xs,
    color: Color.fg1,
    textTransform: 'uppercase',
  },
  recordSubtitle: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.08 * TextSize.xs,
    color: Color.fg4,
  },

  statsRow: {
    flexDirection: 'row',
    gap: Space.s2,
  },
  statBox: {
    flex: 1,
    backgroundColor: Color.field,
    borderRadius: Radius.md,
    paddingVertical: Space.s4,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: Font.display.black,
    fontSize: TextSize['2xl'],
    color: Color.fg1,
    letterSpacing: -0.02 * TextSize['2xl'],
  },
  statValueWon: {
    color: Color.grass500,
  },
  statValueLost: {
    color: Color.clay,
  },
  statLabel: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.14 * TextSize.xs,
    color: Color.fg4,
    textTransform: 'uppercase',
  },

  recordDivider: {
    height: 1,
    backgroundColor: Color.border1,
  },

  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formLeft: {
    gap: Space.s2,
  },
  formLabel: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.14 * TextSize.xs,
    color: Color.fg4,
    textTransform: 'uppercase',
  },
  formBadges: {
    flexDirection: 'row',
    gap: Space.s1 + 2,
  },
  formBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formBadgeText: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.xs,
    color: Color.chalk,
  },
  winRateBlock: {
    alignItems: 'flex-end',
    gap: 2,
  },
  winRateValue: {
    fontFamily: Font.display.black,
    fontSize: TextSize['3xl'],
    color: Color.grass500,
    letterSpacing: -0.02 * TextSize['3xl'],
  },
  winRateLabel: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.14 * TextSize.xs,
    color: Color.fg4,
    textTransform: 'uppercase',
  },
  leaveBtn: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.sm,
    color: '#DC2626',
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    borderRadius: Radius.sm,
    backgroundColor: Color.chalk,
    overflow: 'hidden',
  },
});
