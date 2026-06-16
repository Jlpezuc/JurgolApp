import { StyleSheet } from 'react-native';
import { Color, Font, Radius, Space, TextSize } from '@/constants/design';

export const styles = StyleSheet.create({
  // ── Backdrop & sheet ───────────────────────────────────────────────────────
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,31,20,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Color.chalk,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Space.s5,
    paddingTop: Space.s2,
    paddingBottom: Space.s5,
    gap: Space.s4,
    flexDirection: 'column',
    flexShrink: 1,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Color.border2,
    marginBottom: Space.s2,
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    gap: 4,
  },
  eyebrow: {
    fontFamily: Font.mono.medium,
    fontSize: 10,
    color: Color.fg3,
    letterSpacing: 1.5,
  },
  title: {
    fontFamily: Font.display.bold,
    fontSize: TextSize.xl,
    color: Color.fg1,
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Color.field2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Team card ──────────────────────────────────────────────────────────────
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s3,
    backgroundColor: Color.field,
    borderRadius: Radius.md,
    padding: Space.s3,
  },
  teamBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Color.grass500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamBadgeText: {
    fontFamily: Font.display.black,
    fontSize: 13,
    color: Color.chalk,
    letterSpacing: 0.5,
  },
  teamInfo: {
    flex: 1,
    gap: 1,
  },
  teamLabel: {
    fontFamily: Font.mono.medium,
    fontSize: 10,
    color: Color.fg3,
    letterSpacing: 1.2,
  },
  teamName: {
    fontFamily: Font.display.bold,
    fontSize: TextSize.base,
    color: Color.fg1,
  },
  teamCount: {
    fontFamily: Font.mono.bold,
    fontSize: TextSize.sm,
    color: Color.fg3,
  },
  teamCountActive: {
    color: Color.grass500,
  },

  // ── Section label ──────────────────────────────────────────────────────────
  sectionLabel: {
    fontFamily: Font.mono.medium,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Color.fg3,
    marginBottom: -Space.s2,
  },

  // ── Search input ───────────────────────────────────────────────────────────
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s2,
    borderWidth: 1.5,
    borderColor: Color.grass500,
    borderRadius: Radius.md,
    paddingHorizontal: Space.s4,
    paddingVertical: Space.s3,
    backgroundColor: Color.chalk,
  },
  searchAt: {
    fontFamily: Font.body.medium,
    fontSize: TextSize.base,
    color: Color.fg3,
  },
  searchInputText: {
    flex: 1,
    fontFamily: Font.body.medium,
    fontSize: TextSize.base,
    color: Color.fg1,
    padding: 0,
  },

  // ── Divider ────────────────────────────────────────────────────────────────
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s3,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Color.border1,
  },
  dividerText: {
    fontFamily: Font.mono.medium,
    fontSize: 10,
    color: Color.fg3,
    letterSpacing: 1.5,
  },

  // ── Share buttons ──────────────────────────────────────────────────────────
  shareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Space.s2,
  },
  shareBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  shareIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  shareLabel: {
    fontFamily: Font.body.semibold,
    fontSize: TextSize.sm,
    color: Color.fg1,
  },
  shareSubLabel: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.xs,
    color: Color.fg3,
  },

  // ── Link card ──────────────────────────────────────────────────────────────
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s3,
    backgroundColor: Color.field,
    borderRadius: Radius.md,
    padding: Space.s2 + 2,
    paddingLeft: Space.s3,
  },
  linkIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Color.chalk,
    borderWidth: 1,
    borderColor: Color.border1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkInfo: {
    flex: 1,
    gap: 1,
  },
  linkLabel: {
    fontFamily: Font.mono.medium,
    fontSize: 10,
    color: Color.fg3,
    letterSpacing: 1.2,
  },
  linkUrl: {
    fontFamily: Font.mono.bold,
    fontSize: TextSize.sm,
    color: Color.fg1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Color.pitch,
    borderRadius: Radius.sm,
    paddingHorizontal: Space.s3,
    paddingVertical: Space.s2,
  },
  copyBtnText: {
    fontFamily: Font.body.semibold,
    fontSize: TextSize.xs,
    color: Color.chalk,
  },

  // ── CTA ────────────────────────────────────────────────────────────────────
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.s2,
    borderWidth: 1.5,
    borderColor: Color.border2,
    borderRadius: Radius.md,
    paddingVertical: Space.s4,
    backgroundColor: Color.chalk,
  },
  ctaBtnDisabled: {
    opacity: 1,
  },
  ctaBtnText: {
    fontFamily: Font.body.semibold,
    fontSize: TextSize.base,
    color: Color.fg3,
  },
  ctaBtnActive: {
    backgroundColor: Color.pitch,
    borderColor: Color.pitch,
  },
  ctaBtnTextActive: {
    color: Color.chalk,
  },
});
