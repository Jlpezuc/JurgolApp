import { StyleSheet } from 'react-native';
import { Color, Font, Radius, Space, TextSize } from '@/constants/design';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: Color.chalk,
    borderRadius: Radius.lg,
    padding: Space.s4,
    borderWidth: 1,
    borderColor: Color.border1,
    gap: Space.s3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalityBadge: {
    backgroundColor: Color.field,
    borderRadius: Radius.pill,
    paddingHorizontal: Space.s3,
    paddingVertical: 3,
  },
  modalityText: {
    fontFamily: Font.mono.bold,
    fontSize: TextSize.xs,
    color: Color.fg2,
  },
  date: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    color: Color.fg4,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s2,
  },
  teamCol: {
    flex: 1,
    gap: 2,
  },
  teamColRight: {
    alignItems: 'flex-end',
  },
  teamName: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.base,
    color: Color.fg1,
  },
  teamNameRight: {
    textAlign: 'right',
  },
  teamNameMuted: {
    color: Color.fg4,
    fontFamily: Font.body.semibold,
  },
  elo: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    color: Color.fg3,
  },
  eloRight: {
    textAlign: 'right',
  },
  vs: {
    fontFamily: Font.mono.bold,
    fontSize: TextSize.xs,
    color: Color.fg4,
    paddingHorizontal: Space.s2,
  },
  scoreBox: {
    paddingHorizontal: Space.s3,
  },
  scoreText: {
    fontFamily: Font.display.black,
    fontSize: TextSize.lg,
    color: Color.fg1,
  },
  pill: {
    backgroundColor: Color.infoBg,
    borderRadius: Radius.pill,
    paddingHorizontal: Space.s2,
    paddingVertical: 4,
  },
  pillWarn: {
    backgroundColor: Color.warningBg,
  },
  pillText: {
    fontFamily: Font.mono.bold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: Color.fg2,
  },
  location: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.sm,
    color: Color.fg3,
  },
});
