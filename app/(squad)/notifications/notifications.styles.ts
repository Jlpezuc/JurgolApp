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
    gap: Space.s5,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.s5,
    paddingBottom: Space.s4,
    gap: Space.s3,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Color.chalk,
    borderWidth: 1,
    borderColor: Color.border1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  headerEyebrow: {
    fontFamily: Font.mono.medium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: Color.fg3,
  },
  headerTitle: {
    fontFamily: Font.display.bold,
    fontSize: TextSize.lg,
    color: Color.fg1,
    letterSpacing: -0.5,
  },
  readAll: {
    fontFamily: Font.body.semibold,
    fontSize: TextSize.sm,
    color: Color.grass500,
  },
  readAllSpacer: {
    width: 40,
  },

  // ── Section ─────────────────────────────────────────────────────────────
  sectionLabel: {
    fontFamily: Font.mono.medium,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Color.fg3,
    marginBottom: -Space.s2,
  },

  // ── Card ────────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    gap: Space.s3,
    backgroundColor: Color.chalk,
    borderRadius: Radius.lg,
    padding: Space.s4,
    borderWidth: 1,
    borderColor: Color.border1,
  },
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: Color.grass500,
  },
  cardRead: {
    backgroundColor: 'transparent',
    borderColor: Color.border1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardEyebrow: {
    fontFamily: Font.mono.bold,
    fontSize: 10,
    letterSpacing: 1,
  },
  cardTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTime: {
    fontFamily: Font.mono.regular,
    fontSize: 10,
    color: Color.fg4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Color.grass400,
  },
  cardTitle: {
    fontFamily: Font.display.bold,
    fontSize: TextSize.base,
    color: Color.fg1,
  },
  cardText: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.sm,
    color: Color.fg3,
    lineHeight: 19,
  },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Space.s2 + 2,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    marginTop: 4,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontFamily: Font.mono.bold,
    fontSize: 9,
    letterSpacing: 0.8,
  },

  // ── Empty ───────────────────────────────────────────────────────────────
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Space.s10,
    gap: Space.s3,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Color.field2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: Font.display.bold,
    fontSize: TextSize.md,
    color: Color.fg2,
  },
  emptyText: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.sm,
    color: Color.fg4,
    textAlign: 'center',
    paddingHorizontal: Space.s6,
  },
});
