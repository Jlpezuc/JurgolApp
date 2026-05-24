import { Color, Font, Radius, TextSize } from '@/constants/design';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Color.field,
  },
  container: {
    padding: 20,
    gap: 16,
  },
  pageTitle: {
    fontFamily: Font.display.black,
    fontSize: 28,
    color: Color.fg1,
    letterSpacing: -0.02 * 28,
    marginBottom: 4,
  },
  avatarCard: {
    backgroundColor: Color.chalk,
    borderRadius: Radius.lg,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Color.border1,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    backgroundColor: Color.pitch,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarInitials: {
    fontFamily: Font.display.black,
    fontSize: 24,
    color: Color.chalk,
  },
  playerName: {
    fontFamily: Font.display.bold,
    fontSize: TextSize.md,
    color: Color.fg1,
  },
  playerRole: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.sm,
    color: Color.fg4,
  },
  card: {
    backgroundColor: Color.chalk,
    borderRadius: Radius.lg,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Color.border1,
  },
  cardLabel: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.14 * TextSize.xs,
    color: Color.fg3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statName: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.sm,
    color: Color.fg2,
  },
  statValue: {
    fontFamily: Font.display.bold,
    fontSize: 18,
    color: Color.fg1,
  },
  btnSecondary: {
    backgroundColor: Color.chalk,
    paddingVertical: 16,
    borderRadius: Radius.sm,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Color.border3,
  },
  btnSecondaryText: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.sm,
    color: Color.fg1,
    letterSpacing: 0.5,
  },
});
