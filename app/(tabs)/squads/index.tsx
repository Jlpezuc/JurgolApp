import { SquadCard, Squad } from '@/components/squad-card';
import { usePlayer } from '@/hooks/usePlayer';
import { supabase } from '@/lib/supabase';
import { useFocusEffect, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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

function teamToSquad(team: TeamRow, playerId: string): Squad {
  return {
    id: team.id,
    name: team.name,
    playerCount: team.member_count,
    role: team.created_by === playerId ? 'Capitán' : 'Jugador',
    captainName: '',
    createdYear: new Date(team.created_at).getFullYear(),
    color: '#1A7A3C',
    played: 0,
    drawn: 0,
    lost: 0,
    winRate: 0,
    recentForm: [],
  };
}

export default function SquadsScreen() {
  const { player } = usePlayer();
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);

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
            <SquadCard key={team.id} squad={teamToSquad(team, player!.id)} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
