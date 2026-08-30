import { StyleSheet } from 'react-native';
import { Color, Font, Radius, Space, TextSize } from '@/constants/design';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,31,20,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Color.field,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Space.s5,
    paddingTop: Space.s2,
    paddingBottom: Space.s5,
    gap: Space.s4,
    minHeight: '60%',
    maxHeight: '88%',
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontFamily: Font.mono.medium,
    fontSize: 10,
    color: Color.fg3,
    letterSpacing: 1.5,
  },
  title: {
    fontFamily: Font.display.bold,
    fontSize: TextSize.xl,
    color: Color.fg1,
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Color.field2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.sm,
    color: Color.fg4,
    marginTop: Space.s4,
  },
  card: {
    backgroundColor: Color.chalk,
    borderRadius: Radius.lg,
    padding: Space.s4,
    borderWidth: 1,
    borderColor: Color.border1,
    gap: Space.s3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s3,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: Color.pitch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Font.display.black,
    fontSize: 14,
    color: Color.chalk,
  },
  teamName: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.base,
    color: Color.fg1,
  },
  eloText: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    color: Color.fg3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Color.border1,
    paddingTop: Space.s3,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: Font.display.bold,
    fontSize: TextSize.lg,
    color: Color.fg1,
  },
  statValueWon: {
    color: Color.grass500,
  },
  statValueLost: {
    color: Color.clay,
  },
  statLabel: {
    fontFamily: Font.mono.medium,
    fontSize: 10,
    letterSpacing: 0.5,
    color: Color.fg4,
    textTransform: 'uppercase',
  },
});
