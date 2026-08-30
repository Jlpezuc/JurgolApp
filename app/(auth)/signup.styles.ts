import { StyleSheet } from 'react-native';
import { Color, Font, Radius, TextSize } from '@/constants/design';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.chalk,
  },
  scroll: {
    padding: 24,
    paddingTop: 56,
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    backgroundColor: Color.field,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: Font.display.black,
    fontSize: 28,
    color: Color.fg1,
    letterSpacing: -0.02 * 28,
  },
  subtitle: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.sm,
    color: Color.fg3,
    marginBottom: 8,
  },
  form: {
    gap: 6,
    marginTop: 12,
  },
  fieldLabel: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.14 * TextSize.xs,
    color: Color.fg1,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 4,
  },
  optional: {
    color: Color.fg4,
    textTransform: 'none',
    letterSpacing: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: Color.border2,
    borderRadius: Radius.md,
    padding: 14,
    fontFamily: Font.body.regular,
    fontSize: TextSize.base,
    color: Color.fg1,
    backgroundColor: Color.field,
  },
  button: {
    backgroundColor: Color.pitch,
    borderRadius: Radius.md,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.base,
    color: Color.chalk,
    letterSpacing: 0.5,
  },
});
