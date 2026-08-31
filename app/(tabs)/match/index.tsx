import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Match, MatchCard } from '@/components/matches/match-card';
import { RegisterResultSheet } from '@/components/matches/register-result-sheet';
import { usePlayer } from '@/hooks/usePlayer';
import { cancelMatchReminders } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { styles } from './match.styles';

const TEAM_SELECT = 'id, home_team_id, away_team_id, modality, date, location, seeking_opponent, slots_needed, status, score_home, score_away, score_reported_by, score_confirmed, created_by, home_team:teams!matches_home_team_id_fkey(id,name,elo,created_by), away_team:teams!matches_away_team_id_fkey(id,name,elo,created_by)';

export default function MatchScreen() {
  const { player } = usePlayer();
  const [myTeamIds, setMyTeamIds] = useState<string[]>([]);
  const [upcoming, setUpcoming] = useState<Match[]>([]);
  const [history, setHistory] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultMatch, setResultMatch] = useState<Match | null>(null);
  const [participants, setParticipants] = useState<{ player_id: string; full_name: string }[]>([]);

  const load = useCallback(async () => {
    if (!player?.id) { setLoading(false); return; }
    setLoading(true);

    const { data: memberships } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('player_id', player.id)
      .eq('status', 'accepted');

    const teamIds = (memberships ?? []).map((m) => m.team_id);
    setMyTeamIds(teamIds);

    if (teamIds.length === 0) {
      setUpcoming([]);
      setHistory([]);
    } else {
      const orFilter = teamIds.map((id) => `home_team_id.eq.${id},away_team_id.eq.${id}`).join(',');
      const { data: mine } = await supabase
        .from('matches')
        .select(TEAM_SELECT)
        .or(orFilter)
        .order('date', { ascending: true });

      const rows = (mine as unknown as Match[]) ?? [];
      setUpcoming(rows.filter((m) => m.status === 'scheduled'));
      setHistory(rows.filter((m) => m.status === 'played').reverse());
    }

    setLoading(false);
  }, [player?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

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
    setParticipants(rows);
    setResultMatch(match);
  }

  function confirmCancel(m: Match) {
    Alert.alert(
      'Cancelar partido',
      'Se avisará a los jugadores confirmados. El partido dejará de aparecer como próximo.',
      [
        { text: 'Volver', style: 'cancel' },
        { text: 'Cancelar partido', style: 'destructive', onPress: () => cancelMatch(m) },
      ]
    );
  }

  async function cancelMatch(m: Match) {
    const { error } = await supabase.from('matches').update({ status: 'cancelled' }).eq('id', m.id);
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    // Tell everyone who was confirmed, except whoever cancelled it.
    const { data: confirmed } = await supabase
      .from('match_players')
      .select('player_id')
      .eq('match_id', m.id)
      .eq('status', 'confirmed');

    const recipients = (confirmed ?? []).map((r) => r.player_id).filter((pid) => pid !== player?.id);
    if (recipients.length > 0) {
      await supabase.from('notifications').insert(
        recipients.map((pid) => ({
          recipient_player_id: pid,
          type: 'match_cancelled',
          message: `Se canceló el partido de ${m.home_team?.name ?? 'tu equipo'}.`,
          match_id: m.id,
        }))
      );
    }

    await cancelMatchReminders(m.id);
    load();
  }

  function handleRematch(m: Match) {
    const myTeamId = myTeamIds.includes(m.home_team_id) ? m.home_team_id : m.away_team_id;
    const opponent = myTeamId === m.home_team_id ? m.away_team : m.home_team;
    if (!myTeamId || !opponent) return;
    router.push({
      pathname: '/create-match',
      params: {
        squadId: myTeamId,
        rematchTeamId: opponent.id,
        rematchTeamName: opponent.name,
        rematchCreatedBy: opponent.created_by,
        modality: m.modality,
        location: m.location ?? '',
      },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>PARTIDO</Text>
        </View>

        {loading && <ActivityIndicator style={{ marginTop: 24 }} />}

        {!loading && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>MIS PRÓXIMOS PARTIDOS</Text>
              {upcoming.length === 0 && <Text style={styles.emptyText}>No hay partidos programados.</Text>}
              {upcoming.map((m) => {
                const myTeamId = myTeamIds.includes(m.home_team_id) ? m.home_team_id : (m.away_team_id ?? undefined);
                return (
                  <MatchCard
                    key={m.id}
                    match={m}
                    viewerTeamId={myTeamId}
                    footer={
                      <View style={styles.cardActions}>
                        <TouchableOpacity style={[styles.smallBtn, styles.smallBtnDark]} onPress={() => openResultSheet(m)}>
                          <Text style={[styles.smallBtnText, styles.smallBtnTextDark]}>Cargar resultado</Text>
                        </TouchableOpacity>
                        {m.created_by === player?.id && (
                          <TouchableOpacity style={[styles.smallBtn, styles.smallBtnDanger]} onPress={() => confirmCancel(m)}>
                            <Text style={[styles.smallBtnText, styles.smallBtnTextDanger]}>Cancelar</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    }
                  />
                );
              })}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>HISTORIAL</Text>
              {history.length === 0 && <Text style={styles.emptyText}>Aún no has jugado partidos.</Text>}
              {history.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  viewerTeamId={myTeamIds.includes(m.home_team_id) ? m.home_team_id : (m.away_team_id ?? undefined)}
                  footer={
                    m.home_team && m.away_team ? (
                      <View style={styles.cardActions}>
                        <TouchableOpacity style={styles.smallBtn} onPress={() => handleRematch(m)}>
                          <Text style={styles.smallBtnText}>Revancha</Text>
                        </TouchableOpacity>
                      </View>
                    ) : undefined
                  }
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {resultMatch && (
        <RegisterResultSheet
          visible={!!resultMatch}
          onClose={() => setResultMatch(null)}
          matchId={resultMatch.id}
          homeName={resultMatch.home_team?.name ?? 'Local'}
          awayName={resultMatch.away_team?.name ?? 'Visitante'}
          participants={participants}
          onSaved={load}
          reporterPlayerId={player?.id ?? null}
          opponentTeamId={
            myTeamIds.includes(resultMatch.home_team_id)
              ? resultMatch.away_team?.id ?? null
              : resultMatch.home_team?.id ?? null
          }
          opponentCaptainId={
            myTeamIds.includes(resultMatch.home_team_id)
              ? resultMatch.away_team?.created_by ?? null
              : resultMatch.home_team?.created_by ?? null
          }
        />
      )}
    </SafeAreaView>
  );
}
