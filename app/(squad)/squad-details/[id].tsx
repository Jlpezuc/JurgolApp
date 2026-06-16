import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SquadLineup } from '@/components/squad-details/squad-lineup/squad-lineup';
import { Color } from '@/constants/design';
import { AttendanceStatus, PlayerPosition, SquadDetail } from '@/constants/squads.mocks';
import { usePlayer } from '@/hooks/usePlayer';
import { supabase } from '@/lib/supabase';
import { styles } from './squad-detail.styles';

type TeamData = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  description: string | null;
  logo_url: string | null;
};

type MemberRow = {
  player_id: string;
  role: string;
  jersey_number: number | null;
  status: 'pending' | 'accepted' | 'rejected';
  players: {
    id: string;
    full_name: string;
    position: string | null;
    overall: number | null;
    user_id: string | null;
    has_account: boolean | null;
  };
};

type MatchRow = {
  id: string;
  opponent_name: string;
  date: string;
  score_us: number | null;
  score_them: number | null;
  status: 'scheduled' | 'played' | 'cancelled';
  match_attendance: { player_id: string; status: string }[];
};

const POSITION_MAP: Record<string, PlayerPosition> = {
  PO: PlayerPosition.PO,
  DEF: PlayerPosition.DEF,
  MC: PlayerPosition.MC,
  DEL: PlayerPosition.DEL,
};

const ATTENDANCE_MAP: Record<string, AttendanceStatus> = {
  going: AttendanceStatus.Going,
  maybe: AttendanceStatus.Maybe,
  not_going: AttendanceStatus.NotGoing,
};

export default function SquadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { player: currentPlayer } = usePlayer();
  const [team, setTeam] = useState<TeamData | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    async function load() {
      const [{ data: teamData }, { data: memberData }, { data: matchData }] = await Promise.all([
        supabase.from('teams').select('*').eq('id', id).single(),
        supabase
          .from('team_members')
          .select('player_id, role, jersey_number, status, players(id, full_name, position, overall, user_id, has_account)')
          .eq('team_id', id)
          .neq('status', 'rejected'),
        supabase
          .from('matches')
          .select('id, opponent_name, date, score_us, score_them, status, match_attendance(player_id, status)')
          .eq('team_id', id)
          .order('date', { ascending: false }),
      ]);
      setTeam(teamData ?? null);
      setMembers((memberData as unknown as MemberRow[]) ?? []);
      setMatches((matchData as MatchRow[]) ?? []);
      setLoading(false);
    }
    if (id) load();
  }, [id]));

  if (loading) {
    return (
      <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={Color.pitch} />
      </View>
    );
  }

  if (!team) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Text style={{ color: Color.fg2, padding: 20 }}>Equipo no encontrado.</Text>
      </View>
    );
  }

  async function handleRemovePlayer(playerId: string) {
    const member = members.find((m) => m.player_id === playerId);
    const userId = member?.players?.user_id ?? null;

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', id)
      .eq('player_id', playerId);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    if (userId) {
      await supabase.from('notifications').insert({
        recipient_player_id: playerId,
        type: 'player_removed',
        message: `Has sido eliminado del equipo ${team!.name}.`,
      });
    }

    setMembers((prev) => prev.filter((m) => m.player_id !== playerId));
  }

  const isCaptain = team.created_by === currentPlayer?.id;
  const captain = members.find((m) => m.player_id === team.created_by);
  const captainName = captain?.players?.full_name ?? '—';
  const createdYear = new Date(team.created_at).getFullYear();

  // Record stats from played matches
  const played = matches.filter((m) => m.status === 'played');
  const won   = played.filter((m) => (m.score_us ?? 0) > (m.score_them ?? 0)).length;
  const drawn = played.filter((m) => m.score_us === m.score_them && m.score_us !== null).length;
  const lost  = played.filter((m) => (m.score_us ?? 0) < (m.score_them ?? 0)).length;
  const winRate = played.length > 0 ? Math.round((won / played.length) * 100) : null;
  const recentForm = played
    .slice(0, 5)
    .map((m) =>
      (m.score_us ?? 0) > (m.score_them ?? 0) ? 'W' : m.score_us === m.score_them ? 'D' : 'L'
    )
    .reverse();

  // Next match for attendance
  const nextMatch = matches.find((m) => m.status === 'scheduled');
  const attendanceMap = Object.fromEntries(
    (nextMatch?.match_attendance ?? []).map((a) => [a.player_id, a.status])
  );

  const squadDetail: SquadDetail = {
    squadId: team.id,
    nextMatchDate: nextMatch?.date ?? '',
    players: members.map((m, i) => {
      const nameParts = (m.players?.full_name ?? 'Jugador').split(' ');
      return {
        id: m.player_id,
        firstName: nameParts[0] ?? 'Jugador',
        lastName: nameParts.slice(1).join(' ') || '—',
        number: m.jersey_number ?? i + 1,
        position: POSITION_MAP[m.players?.position ?? ''] ?? PlayerPosition.MC,
        overall: m.players?.overall ?? 0,
        attendance: ATTENDANCE_MAP[attendanceMap[m.player_id] ?? 'maybe'] ?? AttendanceStatus.Maybe,
        isCaptain: m.player_id === team.created_by,
        userId: m.players?.user_id ?? null,
        hasAccount: m.players?.has_account ?? false,
        status: (m.status === 'pending' ? 'pending' : 'accepted') as 'pending' | 'accepted',
      };
    }),
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Header bar */}
        <View style={styles.header}>
          <View style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={18} color={Color.fg3} onPress={() => router.back()} />
          </View>
          <Text style={styles.headerTitle}>Detalle de equipo</Text>
          <View style={styles.headerBtn}>
            <Ionicons name="share-outline" size={18} color={Color.fg3} />
          </View>
        </View>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={[styles.avatarWrapper, { backgroundColor: Color.pitch }]}>
              <Text style={styles.avatarText}>{team.name.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.heroMeta}>
              <Text style={styles.heroYear}>Desde {createdYear}</Text>
              <Text style={styles.heroName}>{team.name}</Text>
              <View style={styles.roleBadgeRow}>
                <View style={[styles.roleBadge, isCaptain ? styles.roleBadgeCaptain : styles.roleBadgeMember]}>
                  <Text style={[styles.roleBadgeText, !isCaptain && styles.roleBadgeTextMember]}>
                    {isCaptain ? '⚽ Capitán' : '👤 Jugador'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Jugadores</Text>
              <Text style={styles.heroStatValue}>{members.length}</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Capitán</Text>
              <Text style={styles.heroStatValue}>{captainName}</Text>
            </View>
          </View>
        </View>

        {/* Light content */}
        <View style={styles.lightSection}>
          {/* Record card */}
          <View style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordTitle}>Récord</Text>
              <Text style={styles.recordSubtitle}>{played.length} partidos</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, styles.statValueWon]}>{won}</Text>
                <Text style={styles.statLabel}>PG</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{drawn}</Text>
                <Text style={styles.statLabel}>PE</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, styles.statValueLost]}>{lost}</Text>
                <Text style={styles.statLabel}>PP</Text>
              </View>
            </View>

            <View style={styles.recordDivider} />

            <View style={styles.formRow}>
              <View style={styles.formLeft}>
                <Text style={styles.formLabel}>Forma reciente</Text>
                <View style={styles.formBadges}>
                  {recentForm.length === 0 ? (
                    <Text style={{ color: Color.fg4, fontSize: 12, marginTop: 4 }}>Sin partidos aún</Text>
                  ) : (
                    recentForm.map((r, i) => (
                      <View
                        key={i}
                        style={[
                          styles.formBadge,
                          { backgroundColor: r === 'W' ? Color.grass500 : r === 'D' ? Color.warning : Color.clay },
                        ]}
                      >
                        <Text style={styles.formBadgeText}>{r === 'W' ? 'G' : r === 'D' ? 'E' : 'P'}</Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
              <View style={styles.winRateBlock}>
                <Text style={[styles.winRateValue, winRate === null && { color: Color.fg3 }]}>
                  {winRate !== null ? `${winRate}%` : '—'}
                </Text>
                <Text style={styles.winRateLabel}>Win Rate</Text>
              </View>
            </View>
          </View>

          <SquadLineup detail={squadDetail} onRemovePlayer={handleRemovePlayer} />
        </View>
      </ScrollView>
    </View>
  );
}
