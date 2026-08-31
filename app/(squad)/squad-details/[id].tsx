import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Share, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnnounceModal } from '@/components/squad-details/announce-modal/announce-modal';
import { SquadLineup } from '@/components/squad-details/squad-lineup/squad-lineup';
import { Match } from '@/components/matches/match-card';
import { RegisterResultSheet } from '@/components/matches/register-result-sheet';
import { Color } from '@/constants/design';
import { AttendanceStatus, SquadDetail } from '@/constants/squads.mocks';
import { usePlayer } from '@/hooks/usePlayer';
import { cancelMatchReminders, scheduleMatchReminder } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { styles } from './squad-detail.styles';

export type MatchAttendance = 'invited' | 'confirmed' | 'declined';

type TeamData = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  description: string | null;
  logo_url: string | null;
  elo: number;
};

type MemberRow = {
  player_id: string;
  role: string;
  jersey_number: number | null;
  status: 'pending' | 'accepted' | 'rejected';
  players: {
    id: string;
    full_name: string;
    overall: number | null;
    user_id: string | null;
    has_account: boolean | null;
    photo_url: string | null;
  };
};

const MATCH_SELECT = 'id, home_team_id, away_team_id, modality, date, location, seeking_opponent, slots_needed, status, score_home, score_away, score_reported_by, score_confirmed, created_by, home_team:teams!matches_home_team_id_fkey(id,name,elo,created_by), away_team:teams!matches_away_team_id_fkey(id,name,elo,created_by)';

export default function SquadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { player: currentPlayer } = usePlayer();
  const [team, setTeam] = useState<TeamData | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [resultMatch, setResultMatch] = useState<Match | null>(null);
  const [resultParticipants, setResultParticipants] = useState<{ player_id: string; full_name: string }[]>([]);
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [attendance, setAttendance] = useState<Record<string, MatchAttendance>>({});

  const load = useCallback(async () => {
    const [{ data: teamData }, { data: memberData }, { data: matchData }] = await Promise.all([
      supabase.from('teams').select('*').eq('id', id).single(),
      supabase
        .from('team_members')
        .select('player_id, role, jersey_number, status, players(id, full_name, overall, user_id, has_account, photo_url)')
        .eq('team_id', id)
        .neq('status', 'rejected'),
      supabase
        .from('matches')
        .select(MATCH_SELECT)
        .or(`home_team_id.eq.${id},away_team_id.eq.${id}`)
        .order('date', { ascending: false }),
    ]);
    setTeam(teamData ?? null);
    setMembers((memberData as unknown as MemberRow[]) ?? []);

    const rows = (matchData as unknown as Match[]) ?? [];
    setMatches(rows);

    // Attendance is tracked against the soonest upcoming match of this team.
    const upcoming = rows
      .filter((m) => m.status === 'scheduled' && new Date(m.date).getTime() >= Date.now())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const next = upcoming[0] ?? null;
    setNextMatch(next);

    if (next) {
      const { data: mp } = await supabase
        .from('match_players')
        .select('player_id, status')
        .eq('match_id', next.id);
      setAttendance(
        Object.fromEntries((mp ?? []).map((r) => [r.player_id, r.status as MatchAttendance]))
      );
    } else {
      setAttendance({});
    }

    setLoading(false);
  }, [id]);

  useFocusEffect(useCallback(() => { if (id) load(); }, [id, load]));

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

  async function handleSetAttendance(status: MatchAttendance) {
    if (!nextMatch || !currentPlayer?.id) return;

    const { error } = await supabase.from('match_players').upsert(
      {
        match_id: nextMatch.id,
        player_id: currentPlayer.id,
        status,
        source: 'notification',
      },
      { onConflict: 'match_id,player_id' }
    );

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setAttendance((prev) => ({ ...prev, [currentPlayer.id]: status }));

    // Keep the local reminder in sync with the answer.
    if (status === 'confirmed') {
      await scheduleMatchReminder(
        nextMatch.id,
        nextMatch.date,
        '⚽ Tienes partido hoy',
        `${team!.name} juega ${nextMatch.modality}${nextMatch.location ? ` en ${nextMatch.location}` : ''}.`
      );
    } else {
      await cancelMatchReminders(nextMatch.id);
    }
  }

  async function handleLeaveTeam() {
    Alert.alert('Salir del equipo', `¿Seguro que quieres salir de ${team!.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.rpc('leave_team', { p_team_id: id });
          if (error) {
            Alert.alert('Error', error.message);
            return;
          }
          router.dismissTo('/(tabs)/squads');
        },
      },
    ]);
  }

  async function handleShareInvite() {
    await Share.share({
      message:
        `¡Únete a ${team!.name} en JurgolApp!\n\n` +
        `Abre este enlace si ya tienes la app instalada:\n` +
        `jurgolapp://join-team/${team!.id}`,
    });
  }

  async function openResultSheet(match: Match) {
    const { data } = await supabase
      .from('match_players')
      .select('player_id, status, players(full_name)')
      .eq('match_id', match.id)
      .eq('status', 'confirmed');
    const rows = (data ?? []).map((r: any) => ({
      player_id: r.player_id,
      full_name: r.players?.full_name ?? 'Jugador',
    }));
    setResultParticipants(rows);
    setResultMatch(match);
  }

  const isCaptain = team.created_by === currentPlayer?.id;
  const captain = members.find((m) => m.player_id === team.created_by);
  const captainName = captain?.players?.full_name ?? '—';
  const createdYear = new Date(team.created_at).getFullYear();

  // Record stats from played matches
  const played = matches.filter((m) => m.status === 'played');
  function resultOf(m: Match): 'W' | 'D' | 'L' | null {
    if (m.score_home == null || m.score_away == null) return null;
    const isHome = m.home_team_id === team!.id;
    const mine = isHome ? m.score_home : m.score_away;
    const theirs = isHome ? m.score_away : m.score_home;
    if (mine === theirs) return 'D';
    return mine > theirs ? 'W' : 'L';
  }
  const won   = played.filter((m) => resultOf(m) === 'W').length;
  const drawn = played.filter((m) => resultOf(m) === 'D').length;
  const lost  = played.filter((m) => resultOf(m) === 'L').length;
  const winRate = played.length > 0 ? Math.round((won / played.length) * 100) : null;
  const recentForm = played.slice(0, 5).map((m) => resultOf(m)).filter(Boolean).reverse() as ('W' | 'D' | 'L')[];

  const ATTENDANCE_MAP: Record<MatchAttendance, AttendanceStatus> = {
    confirmed: AttendanceStatus.Going,
    declined: AttendanceStatus.NotGoing,
    invited: AttendanceStatus.Maybe,
  };

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
        overall: m.players?.overall ?? 0,
        attendance: ATTENDANCE_MAP[attendance[m.player_id] ?? 'invited'],
        isCaptain: m.player_id === team.created_by,
        userId: m.players?.user_id ?? null,
        hasAccount: m.players?.has_account ?? false,
        photoUrl: m.players?.photo_url ?? null,
        status: (m.status === 'pending' ? 'pending' : 'accepted') as 'pending' | 'accepted',
      };
    }),
  };

  const acceptedMembers = members
    .filter((m) => m.status === 'accepted')
    .map((m) => ({ player_id: m.player_id, full_name: m.players?.full_name ?? 'Jugador' }));

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
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={styles.headerBtn}>
              <Ionicons name="share-social-outline" size={18} color={Color.fg3} onPress={handleShareInvite} />
            </View>
            {isCaptain && (
              <>
                <View style={styles.headerBtn}>
                  <Ionicons name="megaphone-outline" size={18} color={Color.fg3} onPress={() => setAnnounceOpen(true)} />
                </View>
                <View style={styles.headerBtn}>
                  <Ionicons
                    name="settings-outline"
                    size={18}
                    color={Color.fg3}
                    onPress={() => router.push({ pathname: '/edit-team/[id]', params: { id: team.id } })}
                  />
                </View>
              </>
            )}
            <View style={styles.headerBtn}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={18}
                color={Color.fg3}
                onPress={() => router.push({ pathname: '/squad-details/chat/[id]', params: { id: team.id } })}
              />
            </View>
          </View>
        </View>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={[styles.avatarWrapper, { backgroundColor: Color.pitch, overflow: 'hidden' }]}>
              {team.logo_url ? (
                <Image source={{ uri: team.logo_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : (
                <Text style={styles.avatarText}>{team.name.slice(0, 2).toUpperCase()}</Text>
              )}
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
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Elo</Text>
              <Text style={styles.heroStatValue}>{team.elo}</Text>
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

          <SquadLineup
            detail={squadDetail}
            teamId={team.id}
            matches={matches}
            onRemovePlayer={handleRemovePlayer}
            onCreateMatch={() => router.push({ pathname: '/create-match', params: { squadId: team.id } })}
            onRegisterResult={openResultSheet}
            currentPlayerId={currentPlayer?.id ?? null}
            myAttendance={currentPlayer ? attendance[currentPlayer.id] ?? 'invited' : null}
            hasNextMatch={!!nextMatch}
            onSetAttendance={handleSetAttendance}
          />

          {!isCaptain && (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.leaveBtn} onPress={handleLeaveTeam}>
                SALIR DEL EQUIPO
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <AnnounceModal
        visible={announceOpen}
        onClose={() => setAnnounceOpen(false)}
        teamId={team.id}
        teamName={team.name}
        members={acceptedMembers}
      />

      {resultMatch && (
        <RegisterResultSheet
          visible={!!resultMatch}
          onClose={() => setResultMatch(null)}
          matchId={resultMatch.id}
          homeName={resultMatch.home_team?.name ?? 'Local'}
          awayName={resultMatch.away_team?.name ?? 'Visitante'}
          participants={resultParticipants}
          onSaved={load}
          reporterPlayerId={currentPlayer?.id ?? null}
          opponentTeamId={
            resultMatch.home_team_id === team.id
              ? resultMatch.away_team?.id ?? null
              : resultMatch.home_team?.id ?? null
          }
          opponentCaptainId={
            resultMatch.home_team_id === team.id
              ? resultMatch.away_team?.created_by ?? null
              : resultMatch.home_team?.created_by ?? null
          }
        />
      )}
    </View>
  );
}
