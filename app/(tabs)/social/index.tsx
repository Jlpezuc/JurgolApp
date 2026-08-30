import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Match, MatchCard } from '@/components/matches/match-card';
import { Color } from '@/constants/design';
import { usePlayer } from '@/hooks/usePlayer';
import { supabase } from '@/lib/supabase';
import { styles } from './social.styles';

const TEAM_SELECT = 'id, home_team_id, away_team_id, modality, date, location, seeking_opponent, slots_needed, status, score_home, score_away, created_by, home_team:teams!matches_home_team_id_fkey(id,name,elo,created_by), away_team:teams!matches_away_team_id_fkey(id,name,elo,created_by)';

export default function SocialScreen() {
  const { player } = usePlayer();
  const [myTeams, setMyTeams] = useState<{ id: string; name: string }[]>([]);
  const [market, setMarket] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!player?.id) { setLoading(false); return; }
    setLoading(true);

    const { data: memberships } = await supabase
      .from('team_members')
      .select('team_id, teams(id, name)')
      .eq('player_id', player.id)
      .eq('status', 'accepted');

    const teams = (memberships ?? [])
      .map((m: any) => m.teams)
      .filter(Boolean) as { id: string; name: string }[];
    setMyTeams(teams);
    const teamIds = teams.map((t) => t.id);

    let marketQuery = supabase
      .from('matches')
      .select(TEAM_SELECT)
      .eq('status', 'scheduled')
      .or('seeking_opponent.eq.true,slots_needed.gt.0')
      .order('date', { ascending: true });

    if (teamIds.length > 0) {
      marketQuery = marketQuery.not('home_team_id', 'in', `(${teamIds.join(',')})`);
    }

    const { data: marketData } = await marketQuery;
    setMarket((marketData as unknown as Match[]) ?? []);

    setLoading(false);
  }, [player?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function joinAsLoosePlayer(match: Match) {
    if (!player?.id) return;
    const { error } = await supabase.from('match_players').insert({
      match_id: match.id,
      player_id: player.id,
      status: 'confirmed',
      source: 'open_slot',
    });
    if (error) {
      Alert.alert('Error', error.code === '23505' ? 'Ya estás en este partido.' : error.message);
      return;
    }
    await supabase.from('matches').update({ slots_needed: Math.max(0, match.slots_needed - 1) }).eq('id', match.id);
    load();
  }

  async function challengeWithTeam(match: Match, teamId: string) {
    const { error } = await supabase.from('match_challenges').insert({
      match_id: match.id,
      challenger_team_id: teamId,
      status: 'pending',
    });
    if (error) {
      Alert.alert('Error', error.code === '23505' ? 'Tu equipo ya se postuló a este partido.' : error.message);
      return;
    }
    await supabase.from('notifications').insert({
      recipient_player_id: match.created_by,
      type: 'team_challenge',
      message: 'Un equipo quiere ser tu rival en un partido.',
      match_id: match.id,
    });
    Alert.alert('Postulación enviada', 'Le avisamos al equipo organizador.');
  }

  function handleChallenge(match: Match) {
    if (myTeams.length === 0) {
      Alert.alert('Necesitas un equipo', 'Crea o únete a un equipo para postularte.');
      return;
    }
    if (myTeams.length === 1) {
      challengeWithTeam(match, myTeams[0].id);
      return;
    }
    Alert.alert(
      'Elige tu equipo',
      'Selecciona con qué equipo te postulas',
      [
        ...myTeams.map((t) => ({ text: t.name, onPress: () => challengeWithTeam(match, t.id) })),
        { text: 'Cancelar', style: 'cancel' as const },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>SOCIAL</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/create-match')}>
            <Text style={styles.btnPrimaryText}>+ Crear</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator style={{ marginTop: 24 }} />}

        {!loading && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>NOTICIAS</Text>
              <View style={styles.emptyCard}>
                <Ionicons name="newspaper-outline" size={28} color={Color.fg4} />
                <Text style={styles.emptyText}>Todavía no hay noticias.</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>PARTIDOS QUE TE PUEDEN INTERESAR</Text>
              {market.length === 0 && <Text style={styles.emptyText}>No hay partidos abiertos por ahora.</Text>}
              {market.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  footer={
                    <View style={styles.cardActions}>
                      {m.seeking_opponent && (
                        <TouchableOpacity style={styles.smallBtn} onPress={() => handleChallenge(m)}>
                          <Text style={styles.smallBtnText}>Postular mi equipo</Text>
                        </TouchableOpacity>
                      )}
                      {m.slots_needed > 0 && (
                        <TouchableOpacity style={[styles.smallBtn, styles.smallBtnDark]} onPress={() => joinAsLoosePlayer(m)}>
                          <Text style={[styles.smallBtnText, styles.smallBtnTextDark]}>Unirme</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  }
                />
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>LIGAS Y TORNEOS ABIERTOS</Text>
              <View style={styles.emptyCard}>
                <Ionicons name="trophy-outline" size={28} color={Color.fg4} />
                <Text style={styles.emptyText}>Próximamente.</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
