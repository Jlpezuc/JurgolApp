import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './match-card.styles';
import { Color } from '@/constants/design';

export type MatchTeamInfo = { id: string; name: string; elo: number; created_by: string };

export type Match = {
  id: string;
  home_team_id: string;
  away_team_id: string | null;
  modality: string;
  date: string;
  location: string | null;
  seeking_opponent: boolean;
  slots_needed: number;
  status: 'scheduled' | 'played' | 'cancelled';
  score_home: number | null;
  score_away: number | null;
  created_by: string;
  home_team: MatchTeamInfo | null;
  away_team: MatchTeamInfo | null;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

function resultFor(m: Match, myTeamId?: string): 'W' | 'D' | 'L' | null {
  if (m.score_home == null || m.score_away == null || !myTeamId) return null;
  const isHome = m.home_team_id === myTeamId;
  const mine = isHome ? m.score_home : m.score_away;
  const theirs = isHome ? m.score_away : m.score_home;
  if (mine === theirs) return 'D';
  return mine > theirs ? 'W' : 'L';
}

const RESULT_COLOR: Record<'W' | 'D' | 'L', string> = {
  W: Color.grass500,
  D: Color.warning,
  L: Color.clay,
};

type Props = {
  match: Match;
  viewerTeamId?: string;
  footer?: React.ReactNode;
  onPress?: () => void;
};

export function MatchCard({ match, viewerTeamId, footer, onPress }: Props) {
  const result = match.status === 'played' ? resultFor(match, viewerTeamId) : null;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={onPress ? 0.8 : 1} onPress={onPress} disabled={!onPress}>
      <View style={styles.topRow}>
        <View style={styles.modalityBadge}>
          <Text style={styles.modalityText}>{match.modality}</Text>
        </View>
        <Text style={styles.date}>{formatDate(match.date)}</Text>
      </View>

      <View style={styles.teamsRow}>
        <View style={styles.teamCol}>
          <Text style={styles.teamName} numberOfLines={1}>{match.home_team?.name ?? '—'}</Text>
          <Text style={styles.elo}>ELO {match.home_team?.elo ?? '—'}</Text>
        </View>

        {match.status === 'played' ? (
          <View style={styles.scoreBox}>
            <Text style={[styles.scoreText, result && { color: RESULT_COLOR[result] }]}>
              {match.score_home} - {match.score_away}
            </Text>
          </View>
        ) : match.away_team ? (
          <Text style={styles.vs}>VS</Text>
        ) : match.seeking_opponent ? (
          <View style={styles.pill}>
            <Text style={styles.pillText}>BUSCA RIVAL</Text>
          </View>
        ) : match.slots_needed > 0 ? (
          <View style={[styles.pill, styles.pillWarn]}>
            <Text style={styles.pillText}>FALTAN {match.slots_needed}</Text>
          </View>
        ) : (
          <Text style={styles.vs}>—</Text>
        )}

        <View style={[styles.teamCol, styles.teamColRight]}>
          {match.away_team ? (
            <>
              <Text style={[styles.teamName, styles.teamNameRight]} numberOfLines={1}>{match.away_team.name}</Text>
              <Text style={[styles.elo, styles.eloRight]}>ELO {match.away_team.elo}</Text>
            </>
          ) : (
            <Text style={[styles.teamName, styles.teamNameRight, styles.teamNameMuted]}>Sin rival aún</Text>
          )}
        </View>
      </View>

      {match.location ? <Text style={styles.location}>📍 {match.location}</Text> : null}

      {footer}
    </TouchableOpacity>
  );
}
