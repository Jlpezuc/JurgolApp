import { StyleSheet } from 'react-native';
import { Color, Font, Radius, TextSize } from '@/constants/design';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: Color.chalk,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Color.border1,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Font.display.black,
    fontSize: 16,
    color: Color.chalk,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  squadName: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.base,
    color: Color.fg1,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  badgeCaptain: {
    backgroundColor: '#FEF3C7',
  },
  badgeMember: {
    backgroundColor: Color.field,
  },
  roleText: {
    fontFamily: Font.body.semibold,
    fontSize: TextSize.xs,
    color: Color.fg1,
  },
  playerCount: {
    fontFamily: Font.body.regular,
    fontSize: TextSize.sm,
    color: Color.fg3,
  },
  divider: {
    height: 1,
    backgroundColor: Color.border1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: Font.display.bold,
    fontSize: 20,
    color: Color.fg1,
  },
  statLost: {
    color: Color.clay,
  },
  statLabel: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.14 * TextSize.xs,
    color: Color.fg4,
    textTransform: 'uppercase',
  },
  formSection: {
    gap: 8,
  },
  formLabel: {
    fontFamily: Font.mono.medium,
    fontSize: TextSize.xs,
    letterSpacing: 0.14 * TextSize.xs,
    color: Color.fg4,
    textTransform: 'uppercase',
  },
  formRow: {
    flexDirection: 'row',
    gap: 6,
  },
  formBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formBadgeText: {
    fontFamily: Font.body.bold,
    fontSize: TextSize.xs,
    color: Color.chalk,
  },
});
