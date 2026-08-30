import { StyleSheet } from 'react-native';
import { Color, Font, Radius, TextSize } from '@/constants/design';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Color.field,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    backgroundColor: Color.chalk,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Font.display.black,
    fontSize: 22,
    color: Color.fg1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
    paddingBottom: 48,
  },
  section: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.14 * TextSize.xs,
    color: Color.fg1,
    textTransform: 'uppercase',
  },
  optional: {
    color: Color.fg4,
    textTransform: 'none',
    letterSpacing: 0,
  },
  hint: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.sm,
    color: Color.fg3,
  },
  input: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.base,
    color: Color.fg1,
    backgroundColor: Color.chalk,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Color.border1,
  },
  inputDisabled: {
    backgroundColor: Color.field2,
  },
  disabledText: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.base,
    color: Color.fg3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.chalk,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Color.border1,
    paddingLeft: 16,
  },
  inputPrefix: {
    fontFamily: Font.body.medium,
    fontSize: TextSize.base,
    color: Color.fg3,
  },
  inputWithPrefix: {
    flex: 1,
    borderWidth: 0,
    paddingLeft: 4,
  },
  saveBtn: {
    backgroundColor: Color.pitch,
    borderRadius: Radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.base,
    color: Color.chalk,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
