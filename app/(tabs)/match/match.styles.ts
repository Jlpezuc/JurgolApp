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
  emptyText: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.sm,
    color: Color.fg4,
  },
  btnPrimary: {
    backgroundColor: Color.grass500,
    paddingVertical: 16,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.sm,
    color: Color.chalk,
    letterSpacing: 0.5,
  },
});
