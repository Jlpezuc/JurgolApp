import { SquadCard, Squad } from '@/components/squad-card';
import { usePlayer } from '@/hooks/usePlayer';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/lib/supabase';
import { useFocusEffect, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './squads.styles';

type TeamRow = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_by: string;
  created_at: string;
  member_count: number;
};

type TeamStats = {
  played: number;
  drawn: number;
  lost: number;
  winRate: number;
  recentForm: ('W' | 'D' | 'L')[];
};

const EMPTY_STATS: TeamStats = { played: 0, drawn: 0, lost: 0, winRate: 0, recentForm: [] };

function teamToSquad(team: TeamRow, playerId: string, stats: TeamStats): Squad {
  return {
    id: team.id,
    name: team.name,
    playerCount: team.member_count,
    role: team.created_by === playerId ? 'Capitán' : 'Jugador',
    captainName: '',
    createdYear: new Date(team.created_at).getFullYear(),
    color: '#1A7A3C',
    played: stats.played,
    drawn: stats.drawn,
    lost: stats.lost,
    winRate: stats.winRate,
    recentForm: stats.recentForm,
  };
}

export default function SquadsScreen() {
  const { player } = usePlayer();
  const { notifications } = useNotifications();
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [statsByTeam, setStatsByTeam] = useState<Record<string, TeamStats>>({});
  const [loading, setLoading] = useState(true);

  const pendingInvites = notifications
    .filter((n) => n.type === 'team_invitation' && n.team_member?.status === 'pending')
    .slice(0, 2);

  const fetchTeams = useCallback(async () => {
    if (!player?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);

    // Teams where I'm creator OR a member
    const { data: memberTeamIds } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('player_id', player.id);

    const memberIds = memberTeamIds?.map((r) => r.team_id) ?? [];
    const allIds = Array.from(new Set([...memberIds]));

    const { data } = await supabase
      .from('teams')
      .select('id, name, description, logo_url, created_by, created_at')
      .or(`created_by.eq.${player.id}${allIds.length ? `,id.in.(${allIds.join(',')})` : ''}`);

    if (!data) {
      setTeams([]);
      setLoading(false);
      return;
    }

    // Get member counts per team
    const teamIds = data.map((t) => t.id);
    const { data: counts } = await supabase
      .from('team_members')
      .select('team_id')
      .in('team_id', teamIds);

    const countMap: Record<string, number> = {};
    counts?.forEach(({ team_id }) => {
      countMap[team_id] = (countMap[team_id] ?? 0) + 1;
    });

    setTeams(data.map((t) => ({ ...t, member_count: countMap[t.id] ?? 1 })));

    // Record stats per team, from played matches
    let matchData: { home_team_id: string; away_team_id: string | null; score_home: number | null; score_away: number | null }[] = [];
    if (teamIds.length > 0) {
      const idList = teamIds.join(',');
      const { data: mData } = await supabase
        .from('matches')
        .select('home_team_id, away_team_id, score_home, score_away')
        .or(`home_team_id.in.(${idList}),away_team_id.in.(${idList})`)
        .eq('status', 'played')
        .order('date', { ascending: false });
      matchData = mData ?? [];
    }

    const nextStats: Record<string, TeamStats> = {};
    for (const teamId of teamIds) {
      const teamMatches = (matchData ?? []).filter(
        (m) => m.home_team_id === teamId || m.away_team_id === teamId
      );
      let drawn = 0;
      let lost = 0;
      let played = 0;
      const recentForm: ('W' | 'D' | 'L')[] = [];
      for (const m of teamMatches) {
        if (m.score_home == null || m.score_away == null) continue;
        const isHome = m.home_team_id === teamId;
        const mine = isHome ? m.score_home : m.score_away;
        const theirs = isHome ? m.score_away : m.score_home;
        played += 1;
        if (mine === theirs) { drawn += 1; recentForm.push('D'); }
        else if (mine > theirs) { recentForm.push('W'); }
        else { lost += 1; recentForm.push('L'); }
      }
      nextStats[teamId] = {
        played,
        drawn,
        lost,
        winRate: played > 0 ? Math.round(((played - drawn - lost) / played) * 100) : 0,
        recentForm: recentForm.slice(0, 5).reverse(),
      };
    }
    setStatsByTeam(nextStats);

    setLoading(false);
  }, [player]);

  // Fetch when player first loads
  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  // Re-fetch when screen comes back into focus (e.g. after creating a team)
  useFocusEffect(useCallback(() => { fetchTeams(); }, [fetchTeams]));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>EQUIPOS</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/create-team')}>
            <Text style={styles.btnPrimaryText}>+ Crear</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MIS EQUIPOS</Text>

          {loading && <ActivityIndicator style={{ marginTop: 24 }} />}

          {!loading && teams.length === 0 && (
            <View style={{ alignItems: 'center', marginTop: 40, gap: 8 }}>
              <Text style={{ fontSize: 40 }}>⚽</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#0D0D0D' }}>
                No tienes equipos aún
              </Text>
              <Text style={{ fontSize: 14, color: '#888', textAlign: 'center' }}>
                Crea tu primer equipo o pide que te inviten a uno
              </Text>
            </View>
          )}

          {!loading && teams.map((team) => (
            <SquadCard key={team.id} squad={teamToSquad(team, player!.id, statsByTeam[team.id] ?? EMPTY_STATS)} />
          ))}
        </View>

        {pendingInvites.length > 0 && (
          <View style={styles.section}>
            <View style={styles.titleRow}>
              <Text style={styles.sectionLabel}>INVITACIONES</Text>
              <TouchableOpacity onPress={() => router.push('/notifications')}>
                <Text style={styles.seeAllText}>Ver todas</Text>
              </TouchableOpacity>
            </View>

            {pendingInvites.map((n) => {
              const teamName = n.team_member?.team?.name ?? 'un equipo';
              const inviter = n.team_member?.team?.inviter?.full_name ?? 'Alguien';
              return (
                <Pressable
                  key={n.id}
                  style={styles.inviteCard}
                  onPress={() => router.push({ pathname: '/notifications/[id]', params: { id: n.id } })}
                >
                  <View style={styles.inviteBadge}>
                    <Text style={styles.inviteBadgeText}>{teamName.slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inviteTeamName}>{teamName}</Text>
                    <Text style={styles.inviteMeta}>Invitación de {inviter}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
