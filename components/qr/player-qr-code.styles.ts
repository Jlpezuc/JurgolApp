import { StyleSheet } from 'react-native';
import { Color, Font, Radius, Space, TextSize } from '@/constants/design';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,31,20,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Space.s6,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Color.chalk,
    borderRadius: Radius.xl,
    padding: Space.s6,
    alignItems: 'center',
    gap: Space.s3,
  },
  closeBtn: {
    position: 'absolute',
    top: Space.s3,
    right: Space.s3,
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Color.field2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Font.display.bold,
    fontSize: TextSize.lg,
    color: Color.fg1,
    marginTop: Space.s2,
  },
  subtitle: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.sm,
    color: Color.fg3,
    textAlign: 'center',
  },
  qrWrapper: {
    padding: Space.s4,
    backgroundColor: Color.chalk,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Color.border1,
    marginTop: Space.s2,
  },
  playerName: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.base,
    color: Color.fg1,
  },
});
