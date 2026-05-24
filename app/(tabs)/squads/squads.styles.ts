import { StyleSheet } from 'react-native';
import { Color, Font, Radius, TextSize } from '@/constants/design';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Color.field,
  },
  container: {
    padding: 20,
    gap: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    fontFamily: Font.display.black,
    fontSize: 28,
    color: Color.fg1,
    letterSpacing: -0.02 * 28,
  },
  btnPrimary: {
    backgroundColor: Color.grass500,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radius.sm,
  },
  btnPrimaryText: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.sm,
    color: Color.chalk,
    letterSpacing: 0.5,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.14 * TextSize.xs,
    color: Color.fg3,
    textTransform: 'uppercase',
  },
});
