import { StyleSheet } from 'react-native';
import { Color, Font, Radius, Space, TextSize } from '@/constants/design';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Color.pitch,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.s5,
    paddingTop: Space.s8,
    paddingBottom: Space.s4,
  },
  title: {
    fontFamily: Font.display.bold,
    fontSize: TextSize.lg,
    color: Color.chalk,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.s4,
    paddingHorizontal: Space.s6,
  },
  permissionText: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.base,
    color: Color.fgOnPitch,
    textAlign: 'center',
  },
  permissionBtn: {
    backgroundColor: Color.grass500,
    borderRadius: Radius.md,
    paddingHorizontal: Space.s5,
    paddingVertical: Space.s3,
  },
  permissionBtnText: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.base,
    color: Color.chalk,
  },
  frame: {
    alignSelf: 'center',
    marginTop: '30%',
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: Color.grass400,
    borderRadius: Radius.lg,
  },
  hint: {
    alignSelf: 'center',
    marginTop: Space.s5,
    fontFamily: Font.body.medium,
    fontSize: TextSize.sm,
    color: Color.fgOnPitch,
  },
});
