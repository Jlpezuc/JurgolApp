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
  content: {
    paddingHorizontal: Space.s5,
    paddingBottom: Space.s8,
    gap: Space.s4,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.s5,
    paddingBottom: Space.s4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Color.chalk,
    borderWidth: 1,
    borderColor: Color.border1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Font.mono.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: Color.fg3,
  },

  // ── Hero ────────────────────────────────────────────────────────────────
  hero: {
    backgroundColor: Color.pitch,
    borderRadius: Radius.xl,
    padding: Space.s5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s4,
    overflow: 'hidden',
  },
  heroBadge: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    backgroundColor: Color.grass500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeText: {
    fontFamily: Font.display.black,
    fontSize: 22,
    color: Color.chalk,
  },
  heroEyebrow: {
    fontFamily: Font.mono.medium,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Color.grass300,
  },
  heroTitle: {
    fontFamily: Font.display.bold,
    fontSize: TextSize.lg,
    color: Color.chalk,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  heroSub: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.sm,
    color: Color.fgOnPitch,
    opacity: 0.7,
    marginTop: 2,
  },

  // ── Card ────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: Color.chalk,
    borderRadius: Radius.lg,
    padding: Space.s4,
    borderWidth: 1,
    borderColor: Color.border1,
    gap: Space.s3,
  },
  cardLabel: {
    fontFamily: Font.mono.medium,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Color.fg3,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s3,
  },
  teamBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Color.field2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamBadgeText: {
    fontFamily: Font.display.black,
    fontSize: 15,
    color: Color.pitch,
  },
  teamName: {
    fontFamily: Font.display.bold,
    fontSize: TextSize.md,
    color: Color.fg1,
  },
  teamMeta: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.sm,
    color: Color.fg3,
  },

  // ── Message ─────────────────────────────────────────────────────────────
  messageCard: {
    backgroundColor: Color.field,
    borderRadius: Radius.md,
    padding: Space.s4,
    gap: 6,
    borderLeftWidth: 3,
    borderLeftColor: Color.grass400,
  },
  messageText: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.base,
    color: Color.fg2,
    lineHeight: 22,
    fontStyle: 'italic',
  },

  // ── Inviter ─────────────────────────────────────────────────────────────
  inviterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s3,
  },
  inviterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Color.pitch3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviterAvatarText: {
    fontFamily: Font.display.bold,
    fontSize: 13,
    color: Color.chalk,
  },
  inviterName: {
    fontFamily: Font.body.semibold,
    fontSize: TextSize.base,
    color: Color.fg1,
  },
  inviterUsername: {
    fontFamily: Font.mono.regular,
    fontSize: TextSize.sm,
    color: Color.fg3,
  },

  // ── Actions ─────────────────────────────────────────────────────────────
  actions: {
    gap: Space.s3,
    marginTop: Space.s2,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.s2,
    backgroundColor: Color.grass400,
    borderRadius: Radius.md,
    paddingVertical: Space.s4 + 2,
  },
  acceptText: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.md,
    color: Color.pitch,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.s2,
    backgroundColor: Color.dangerBg,
    borderRadius: Radius.md,
    paddingVertical: Space.s4 + 2,
  },
  rejectText: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.md,
    color: Color.danger,
  },

  // ── Resolved banner ─────────────────────────────────────────────────────
  resolvedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.s2,
    borderRadius: Radius.md,
    paddingVertical: Space.s4,
    marginTop: Space.s2,
  },
  resolvedText: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.base,
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
