import { StyleSheet } from 'react-native';
import { Color, Font, Radius, Space, TextSize } from '@/constants/design';

export const styles = StyleSheet.create({
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
    paddingBottom: Space.s7,
    gap: Space.s5,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Color.border2,
    marginBottom: Space.s2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: Font.display.bold,
    fontSize: TextSize.xl,
    color: Color.fg1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.s4,
  },
  scoreCol: {
    alignItems: 'center',
    gap: Space.s2,
    flex: 1,
  },
  teamLabel: {
    fontFamily: Font.body.semibold,
    fontSize: TextSize.sm,
    color: Color.fg2,
    textAlign: 'center',
  },
  scoreInput: {
    width: 72,
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: Color.field,
    textAlign: 'center',
    fontFamily: Font.display.black,
    fontSize: TextSize['2xl'],
    color: Color.fg1,
  },
  dash: {
    fontFamily: Font.display.bold,
    fontSize: TextSize.xl,
    color: Color.fg4,
    marginTop: 20,
  },
  sectionLabel: {
    fontFamily: Font.mono.medium,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Color.fg3,
  },
  mvpChip: {
    paddingHorizontal: Space.s3,
    paddingVertical: Space.s2,
    borderRadius: Radius.pill,
    backgroundColor: Color.field,
    borderWidth: 1,
    borderColor: Color.border1,
  },
  mvpChipActive: {
    backgroundColor: Color.sun,
    borderColor: Color.sun,
  },
  mvpChipText: {
    fontFamily: Font.body.semibold,
    fontSize: TextSize.sm,
    color: Color.fg2,
  },
  mvpChipTextActive: {
    color: Color.pitch,
  },
  saveBtn: {
    backgroundColor: Color.pitch,
    borderRadius: Radius.lg,
    paddingVertical: Space.s4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.base,
    color: Color.chalk,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
