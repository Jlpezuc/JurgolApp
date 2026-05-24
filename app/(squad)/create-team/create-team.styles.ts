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
    paddingBottom: 4,
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    backgroundColor: Color.chalk,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Color.pitch,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  headerTextGroup: {
    flex: 1,
  },
  headerSub: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.14 * TextSize.xs,
    color: Color.fg4,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontFamily: Font.display.black,
    fontSize: 24,
    color: Color.fg1,
    letterSpacing: -0.02 * 24,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Color.chalk,
    borderRadius: Radius.xl,
    padding: 24,
    gap: 24,
    shadowColor: Color.pitch,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  // Logo
  logoSection: {
    alignItems: 'center',
    gap: 8,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Color.border2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.field,
    overflow: 'hidden',
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  logoLabel: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.14 * TextSize.xs,
    color: Color.fg4,
    textTransform: 'uppercase',
  },
  // Name input
  fieldSection: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.14 * TextSize.xs,
    color: Color.fg1,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    position: 'relative',
  },
  textInput: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.base,
    color: Color.fg1,
    backgroundColor: Color.field,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 52,
  },
  charCount: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    fontFamily: Font.mono.regular,
    fontSize: TextSize.xs,
    color: Color.fg4,
  },
  // Color picker
  colorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: Color.chalk,
    shadowColor: Color.pitch,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  // Modality
  modalityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalityBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    backgroundColor: Color.field,
    gap: 2,
  },
  modalityBtnActive: {
    backgroundColor: Color.pitch,
  },
  modalityLabel: {
    fontFamily: Font.display.bold,
    fontSize: TextSize.md,
    color: Color.fg1,
  },
  modalityLabelActive: {
    color: Color.chalk,
  },
  modalitySub: {
    fontFamily: Font.mono.medium,
    fontSize: 9,
    letterSpacing: 1,
    color: Color.fg4,
    textTransform: 'uppercase',
  },
  modalitySubActive: {
    color: Color.fg3,
  },
  // Create button
  createBtn: {
    backgroundColor: Color.pitch,
    borderRadius: Radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Color.pitch,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  createBtnText: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.base,
    color: Color.chalk,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
