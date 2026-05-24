import { StyleSheet } from 'react-native';
import { Color, Font, Radius, Space, TextSize } from '@/constants/design';

export const styles = StyleSheet.create({
  // ── Tabs ───────────────────────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Color.field2,
    borderRadius: Radius.pill,
    padding: 4,
    marginBottom: Space.s4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: Space.s2,
    borderRadius: Radius.pill,
  },
  tabActive: {
    backgroundColor: Color.pitch,
  },
  tabLabel: {
    fontFamily: Font.body.semibold,
    fontSize: TextSize.sm,
    color: Color.fg3,
  },
  tabLabelActive: {
    color: Color.fgOnPitch,
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: Radius.pill,
    backgroundColor: Color.border3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  tabBadgeActive: {
    backgroundColor: Color.grass500,
  },
  tabBadgeText: {
    fontFamily: Font.mono.bold,
    fontSize: 10,
    color: Color.fg3,
    lineHeight: 12,
  },
  tabBadgeTextActive: {
    color: Color.chalk,
  },

  // ── Attendance card ────────────────────────────────────────────────────────
  attendanceCard: {
    backgroundColor: Color.chalk,
    borderRadius: Radius.lg,
    padding: Space.s4,
    gap: Space.s3,
    marginBottom: Space.s4,
    shadowColor: Color.pitch,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceTitle: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.12 * TextSize.xs,
    color: Color.fg3,
    textTransform: 'uppercase',
  },
  attendanceTotal: {
    fontFamily: Font.mono.bold,
    fontSize: TextSize.sm,
    color: Color.grass500,
  },
  attendanceTotalDim: {
    color: Color.fg3,
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: Color.field2,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressSegment: {
    height: '100%',
  },
  attendanceLegend: {
    flexDirection: 'row',
    gap: Space.s4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s1,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
  },
  legendText: {
    fontFamily: Font.body.medium,
    fontSize: TextSize.xs,
    color: Color.fg3,
  },

  // ── Roster section ─────────────────────────────────────────────────────────
  rosterCard: {
    backgroundColor: Color.chalk,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Space.s4,
    shadowColor: Color.pitch,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Space.s4,
    paddingVertical: Space.s3,
    backgroundColor: Color.field,
    borderTopWidth: 1,
    borderTopColor: Color.border1,
    borderBottomWidth: 1,
    borderBottomColor: Color.border1,
  },
  positionLabel: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.14 * TextSize.xs,
    color: Color.fg3,
    textTransform: 'uppercase',
  },
  positionCount: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    color: Color.fg4,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Space.s4,
    paddingVertical: Space.s3,
    gap: Space.s3,
    borderBottomWidth: 1,
    borderBottomColor: Color.border1,
  },
  playerRowLast: {
    borderBottomWidth: 0,
  },
  playerAvatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Color.field2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerAvatarCaptain: {
    backgroundColor: Color.sun,
  },
  playerAvatarText: {
    fontFamily: Font.display.black,
    fontSize: TextSize.sm,
    color: Color.fg2,
  },
  playerAvatarTextCaptain: {
    color: Color.pitch,
  },
  playerInfo: {
    flex: 1,
    gap: 3,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  playerName: {
    fontFamily: Font.body.semibold,
    fontSize: TextSize.base,
    color: Color.fg1,
  },
  captainIcon: {
    fontSize: 12,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s2,
  },
  positionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  positionBadgeText: {
    fontFamily: Font.mono.bold,
    fontSize: 10,
    color: Color.chalk,
  },
  playerNumber: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    color: Color.fg3,
  },
  attendanceDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
  },
  attendanceLabel: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.xs,
    color: Color.fg3,
  },
  playerOvr: {
    alignItems: 'flex-end',
    gap: 2,
  },
  ovrValue: {
    fontFamily: Font.display.black,
    fontSize: TextSize.md,
    color: Color.fg1,
    letterSpacing: -0.01 * TextSize.md,
  },
  ovrLabel: {
    fontFamily: Font.mono.medium,
    fontSize: 9,
    color: Color.fg4,
    textTransform: 'uppercase',
  },

  // ── Empty tab ──────────────────────────────────────────────────────────────
  emptyTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Space.s9,
    gap: Space.s2,
  },
  emptyText: {
    fontFamily: Font.body.medium,
    fontSize: TextSize.base,
    color: Color.fg3,
  },

  // ── Invite button ──────────────────────────────────────────────────────────
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.s2,
    borderWidth: 1.5,
    borderColor: Color.border3,
    borderRadius: Radius.md,
    paddingVertical: Space.s4,
    backgroundColor: Color.chalk,
  },
  inviteButtonText: {
    fontFamily: Font.body.semibold,
    fontSize: TextSize.base,
    color: Color.fg1,
  },
});
