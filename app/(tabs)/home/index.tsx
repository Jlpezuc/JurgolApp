import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './home.styles';
import { usePlayer } from '@/hooks/usePlayer';
import { usePlayerMatchStats } from '@/hooks/usePlayerMatchStats';
import { supabase } from '@/lib/supabase';

type RecentMatch = {
  id: string;
  team_side: string;
  matches: {
    date: string;
    score_home: number | null;
    score_away: number | null;
    home_team: { name: string } | null;
    away_team: { name: string } | null;
  };
};

function describeResult(r: RecentMatch): string {
  const m = r.matches;
  const opponentName = r.team_side === 'home' ? m.away_team?.name : m.home_team?.name;
  const mine = r.team_side === 'home' ? m.score_home : m.score_away;
  const theirs = r.team_side === 'home' ? m.score_away : m.score_home;
  if (mine == null || theirs == null) return `Partido vs ${opponentName ?? 'rival'}`;
  const verb = mine > theirs ? 'Ganó' : mine === theirs ? 'Empató' : 'Perdió';
  return `${verb} vs ${opponentName ?? 'rival'} (${mine}-${theirs})`;
}

function timeAgoShort(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'Hoy';
  if (days === 1) return 'Hace 1 día';
  return `Hace ${days} días`;
}

export default function DashboardScreen() {
  const { player } = usePlayer();
  const { stats } = usePlayerMatchStats();
  const [recent, setRecent] = useState<RecentMatch[]>([]);

  const load = useCallback(async () => {
    if (!player?.id) return;
    const { data } = await supabase
      .from('match_players')
      .select('id, team_side, matches!inner(date, score_home, score_away, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name))')
      .eq('player_id', player.id)
      .eq('status', 'confirmed')
      .eq('matches.status', 'played')
      .order('date', { foreignTable: 'matches', ascending: false })
      .limit(3);
    setRecent((data as unknown as RecentMatch[]) ?? []);
  }, [player?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Panel</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Tus estadísticas</Text>
          <View style={styles.statRow}>
            <Text style={styles.statName}>Partidos Jugados</Text>
            <Text style={styles.statValue}>{stats.played}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statName}>Veces MVP</Text>
            <Text style={styles.statValue}>{stats.mvps}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statName}>% de Victorias</Text>
            <Text style={styles.statValue}>{stats.winRate !== null ? `${stats.winRate}%` : '—'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Actividad reciente</Text>
          {recent.length === 0 && (
            <Text style={{ color: '#888', fontSize: 13 }}>Aún no tienes partidos jugados.</Text>
          )}
          {recent.map((r) => (
            <View key={r.id} style={styles.activityItem}>
              <View style={styles.activityBar} />
              <View>
                <Text style={styles.activityText}>{describeResult(r)}</Text>
                <Text style={styles.activityDate}>{timeAgoShort(r.matches.date)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Acciones rápidas</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/(tabs)/match')}>
            <Text style={styles.btnPrimaryText}>Buscar partido</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/(tabs)/squads')}>
            <Text style={styles.btnSecondaryText}>Ver equipos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
