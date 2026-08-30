import { StyleSheet } from 'react-native';
import { Color, Font, Radius, Space, TextSize } from '@/constants/design';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Color.field,
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.s4,
    paddingTop: Space.s2,
    paddingBottom: Space.s3,
  },
  headerBack: {
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
    letterSpacing: 1.4,
    color: Color.fg3,
  },
  headerTitle: {
    fontFamily: Font.display.bold,
    fontSize: TextSize.md,
    color: Color.fg1,
  },
  headerInvite: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Color.pitch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInviteDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Color.lime,
    borderWidth: 1.5,
    borderColor: Color.pitch,
  },

  // ── Card section ───────────────────────────────────────────────────────────
  cardSection: {
    paddingHorizontal: Space.s5,
    paddingTop: Space.s2,
    paddingBottom: Space.s4,
    alignItems: 'center',
    gap: Space.s3,
  },
  cardHint: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.xs,
    color: Color.fg3,
  },

  // ── Card ───────────────────────────────────────────────────────────────────
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Color.grass500,
    borderRadius: Radius.xl,
    padding: Space.s5,
    paddingBottom: Space.s4,
    overflow: 'hidden',
    shadowColor: Color.grass700,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 8,
  },
  cardGlowTop: {
    position: 'absolute',
    top: -120,
    left: -40,
    right: -40,
    height: 240,
    backgroundColor: Color.grass400,
    opacity: 0.55,
    borderRadius: 300,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardRating: {
    fontFamily: Font.display.black,
    fontSize: 40,
    lineHeight: 42,
    color: Color.chalk,
    letterSpacing: -1,
  },
  cardTeamBadge: {
    minWidth: 38,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Color.pitch3,
    alignItems: 'center',
    gap: 1,
  },
  cardTeamBadgeText: {
    fontFamily: Font.display.black,
    fontSize: 11,
    color: Color.chalk,
    letterSpacing: 0.5,
  },
  cardTeamBadgePlus: {
    fontFamily: Font.display.bold,
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 11,
  },

  // ── Card avatar ────────────────────────────────────────────────────────────
  cardAvatarWrap: {
    alignSelf: 'center',
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Space.s2,
  },
  cardAvatarGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardAvatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardAvatarImage: {
    width: '100%',
    height: '100%',
  },
  cardCameraBtn: {
    position: 'absolute',
    right: 0,
    bottom: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Color.lime,
    borderWidth: 3,
    borderColor: Color.grass500,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Card name ──────────────────────────────────────────────────────────────
  cardName: {
    fontFamily: Font.display.bold,
    fontSize: TextSize.md,
    color: Color.chalk,
    textAlign: 'center',
    marginTop: Space.s3,
    letterSpacing: 1.2,
  },
  cardNamePlaceholder: {
    color: 'rgba(255,255,255,0.55)',
  },

  // ── Card divider + stats ───────────────────────────────────────────────────
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginVertical: Space.s3,
  },
  cardStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: Space.s2,
  },
  cardStat: {
    width: '33.333%',
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
  },
  cardStatValue: {
    fontFamily: Font.display.bold,
    fontSize: TextSize.base,
    color: Color.chalk,
  },
  cardStatLabel: {
    fontFamily: Font.mono.bold,
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.6,
  },

  // ── Form ───────────────────────────────────────────────────────────────────
  formScroll: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: Space.s4,
    paddingTop: Space.s2,
  },
  formCard: {
    backgroundColor: Color.chalk,
    borderRadius: Radius.lg,
    padding: Space.s5,
    gap: Space.s2,
    shadowColor: Color.pitch,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  fieldLabel: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.12 * TextSize.xs,
    color: Color.fg3,
    textTransform: 'uppercase',
    marginTop: Space.s3,
  },
  fieldLabelFirst: {
    marginTop: 0,
  },
  fieldLabelOptional: {
    fontFamily: Font.body.regular,
    color: Color.fg4,
    textTransform: 'none',
    letterSpacing: 0,
  },
  input: {
    backgroundColor: Color.chalk,
    borderWidth: 1,
    borderColor: Color.border2,
    borderRadius: Radius.md,
    paddingHorizontal: Space.s4,
    paddingVertical: Space.s3,
    marginTop: Space.s2,
  },
  inputText: {
    fontFamily: Font.body.medium,
    fontSize: TextSize.base,
    color: Color.fg1,
    padding: 0,
  },

  // ── Save button ────────────────────────────────────────────────────────────
  saveBtn: {
    backgroundColor: Color.grass500,
    borderRadius: Radius.md,
    paddingVertical: Space.s4,
    alignItems: 'center',
    marginTop: Space.s4,
  },
  saveBtnDisabled: {
    backgroundColor: Color.fg4,
  },
  saveBtnText: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.base,
    color: Color.chalk,
  },
});
