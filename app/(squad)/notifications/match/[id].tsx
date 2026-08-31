import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Color } from '@/constants/design';
import { usePlayer } from '@/hooks/usePlayer';
import { scheduleMatchReminder } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { styles } from '../invitation.styles';

type MatchTeam = { id: string; name: string; elo: number; created_by: string };
type MatchInfo = {
  id: string;
  date: string;
  modality: string;
  location: string | null;
  home_team_id: string;
  away_team_id: string | null;
  score_home: number | null;
  score_away: number | null;
  score_reported_by: string | null;
  score_confirmed: boolean;
  home_team: MatchTeam | null;
  away_team: MatchTeam | null;
};
type Challenge = { id: string; status: string; challenger_team: MatchTeam | null };

type NotifType = 'match_created' | 'team_challenge' | 'result_reported';

export default function MatchNotificationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { player } = usePlayer();

  const [type, setType] = useState<NotifType | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [match, setMatch] = useState<MatchInfo | null>(null);
  const [alreadyIn, setAlreadyIn] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const { data: notif } = await supabase
      .from('notifications')
      .select('id, type, message, match_id, is_read')
      .eq('id', id)
      .single();

    if (!notif || !notif.match_id) { setLoading(false); return; }

    if (!notif.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    }

    setType(notif.type as NotifType);
    setMessage(notif.message);

    const { data: matchData } = await supabase
      .from('matches')
      .select('id, date, modality, location, home_team_id, away_team_id, score_home, score_away, score_reported_by, score_confirmed, home_team:teams!matches_home_team_id_fkey(id,name,elo,created_by), away_team:teams!matches_away_team_id_fkey(id,name,elo,created_by)')
      .eq('id', notif.match_id)
      .single();

    setMatch((matchData as unknown as MatchInfo) ?? null);

    if (notif.type === 'match_created' && player?.id) {
      const { data: mp } = await supabase
        .from('match_players')
        .select('id')
        .eq('match_id', notif.match_id)
        .eq('player_id', player.id)
        .eq('status', 'confirmed')
        .maybeSingle();
      setAlreadyIn(!!mp);
    }

    if (notif.type === 'team_challenge') {
      const { data: ch } = await supabase
        .from('match_challenges')
        .select('id, status, challenger_team:teams!match_challenges_challenger_team_id_fkey(id,name,elo,created_by)')
        .eq('match_id', notif.match_id)
        .eq('status', 'pending');
      setChallenges((ch as unknown as Challenge[]) ?? []);
    }

    setLoading(false);
  }, [id, player?.id]);

  useEffect(() => { load(); }, [load]);

  async function handleJoin() {
    if (!match || !player?.id) return;
    setSubmitting(true);
    const { error } = await supabase.from('match_players').insert({
      match_id: match.id,
      player_id: player.id,
      status: 'confirmed',
      source: 'notification',
    });
    setSubmitting(false);
    if (error && error.code !== '23505') {
      Alert.alert('Error', error.message);
      return;
    }
    await scheduleMatchReminder(
      match.id,
      match.date,
      '⚽ Tienes partido hoy',
      `${match.home_team?.name ?? 'Tu equipo'} juega ${match.modality}${match.location ? ` en ${match.location}` : ''}.`
    );

    setAlreadyIn(true);
    Alert.alert('¡Listo!', 'Te uniste al partido.', [{ text: 'OK', onPress: () => router.back() }]);
  }

  async function handleConfirmResult(accept: boolean) {
    if (!match) return;
    setSubmitting(true);

    if (accept) {
      // Flipping to 'played' with both scores set is what fires apply_match_elo.
      await supabase
        .from('matches')
        .update({ status: 'played', score_confirmed: true })
        .eq('id', match.id);
    } else {
      // Reject: wipe the proposal so the other team can report again.
      await supabase
        .from('matches')
        .update({ score_home: null, score_away: null, score_reported_by: null })
        .eq('id', match.id);
    }

    if (match.score_reported_by) {
      await supabase.from('notifications').insert({
        recipient_player_id: match.score_reported_by,
        type: 'result_reported',
        message: accept
          ? `Confirmaron el resultado ${match.score_home}-${match.score_away}.`
          : 'Rechazaron el resultado que cargaste. Vuelve a cargarlo con el marcador correcto.',
        match_id: match.id,
      });
    }

    setSubmitting(false);
    Alert.alert(
      accept ? 'Resultado confirmado' : 'Resultado rechazado',
      accept ? 'El partido quedó oficial y se actualizó el Elo.' : 'Le avisamos al otro equipo.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }

  async function handleChallengeResponse(challenge: Challenge, accept: boolean) {
    if (!match) return;
    setSubmitting(true);

    if (accept) {
      const awayTeamId = challenge.challenger_team?.id;

      await supabase.from('matches').update({
        away_team_id: awayTeamId,
        status: 'scheduled',
        seeking_opponent: false,
      }).eq('id', match.id);

      await supabase.from('match_challenges').update({ status: 'accepted' }).eq('id', challenge.id);
      await supabase
        .from('match_challenges')
        .update({ status: 'rejected' })
        .eq('match_id', match.id)
        .neq('id', challenge.id);

      // Register the away roster too, otherwise only the home team's players get
      // career stats and `overall` updates when the result is applied.
      if (awayTeamId) {
        const { data: awayMembers } = await supabase
          .from('team_members')
          .select('player_id')
          .eq('team_id', awayTeamId)
          .eq('status', 'accepted');

        if (awayMembers?.length) {
          await supabase.from('match_players').upsert(
            awayMembers.map((m) => ({
              match_id: match.id,
              player_id: m.player_id,
              team_side: 'away',
              status: 'confirmed',
              source: 'captain',
            })),
            { onConflict: 'match_id,player_id' }
          );
        }
      }
    } else {
      await supabase.from('match_challenges').update({ status: 'rejected' }).eq('id', challenge.id);
    }

    setSubmitting(false);
    Alert.alert(
      accept ? 'Rival confirmado' : 'Postulación rechazada',
      accept ? `${challenge.challenger_team?.name ?? 'El equipo'} será tu rival.` : undefined,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }

  if (loading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <StatusBar style="dark" />
        <ActivityIndicator color={Color.grass500} />
      </View>
    );
  }

  if (!match || !type) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={{ paddingTop: insets.top + 8 }}>
          <View style={styles.header}>
            <Pressable style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={Color.fg2} />
            </Pressable>
            <Text style={styles.headerTitle}>PARTIDO</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>
        <View style={styles.centered}>
          <Text style={styles.teamMeta}>Este partido ya no está disponible.</Text>
        </View>
      </View>
    );
  }

  const dateLabel = new Date(match.date).toLocaleDateString('es', {
    weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View style={{ paddingTop: insets.top + 8 }}>
        <View style={styles.header}>
          <Pressable style={styles.iconBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={Color.fg2} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {type === 'match_created'
              ? 'PARTIDO CREADO'
              : type === 'result_reported'
                ? 'RESULTADO'
                : 'POSTULACIÓN DE RIVAL'}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{match.home_team?.name.slice(0, 2).toUpperCase() ?? '??'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroEyebrow}>{match.modality.toUpperCase()}</Text>
            <Text style={styles.heroTitle}>{match.home_team?.name ?? '—'}</Text>
            <Text style={styles.heroSub}>{dateLabel}{match.location ? ` · ${match.location}` : ''}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>EQUIPO ORGANIZADOR</Text>
          <View style={styles.teamRow}>
            <View style={styles.teamBadge}>
              <Text style={styles.teamBadgeText}>{match.home_team?.name.slice(0, 2).toUpperCase() ?? '??'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.teamName}>{match.home_team?.name ?? '—'}</Text>
              <Text style={styles.teamMeta}>ELO {match.home_team?.elo ?? '—'}</Text>
            </View>
          </View>
        </View>

        {message?.trim() ? (
          <View style={styles.messageCard}>
            <Text style={styles.cardLabel}>MENSAJE</Text>
            <Text style={styles.messageText}>“{message.trim()}”</Text>
          </View>
        ) : null}

        {type === 'match_created' && (
          alreadyIn ? (
            <View style={[styles.resolvedBanner, { backgroundColor: Color.successBg }]}>
              <Ionicons name="checkmark-circle" size={20} color={Color.success} />
              <Text style={[styles.resolvedText, { color: Color.success }]}>Ya estás confirmado</Text>
            </View>
          ) : (
            <View style={styles.actions}>
              <Pressable style={styles.acceptBtn} onPress={handleJoin} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator size="small" color={Color.pitch} />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color={Color.pitch} />
                    <Text style={styles.acceptText}>Unirme al partido</Text>
                  </>
                )}
              </Pressable>
            </View>
          )
        )}

        {type === 'result_reported' && (
          match.score_confirmed ? (
            <View style={[styles.resolvedBanner, { backgroundColor: Color.successBg }]}>
              <Ionicons name="checkmark-circle" size={20} color={Color.success} />
              <Text style={[styles.resolvedText, { color: Color.success }]}>
                Resultado confirmado: {match.score_home}–{match.score_away}
              </Text>
            </View>
          ) : match.score_home == null || match.score_away == null ? (
            <View style={[styles.resolvedBanner, { backgroundColor: Color.field }]}>
              <Text style={styles.resolvedText}>Ya no hay un resultado pendiente de confirmar.</Text>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>MARCADOR REPORTADO</Text>
                <View style={styles.teamRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.teamName}>{match.home_team?.name ?? 'Local'}</Text>
                  </View>
                  <Text style={styles.teamName}>
                    {match.score_home} – {match.score_away}
                  </Text>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={styles.teamName}>{match.away_team?.name ?? 'Visitante'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.actions}>
                <Pressable
                  style={styles.acceptBtn}
                  disabled={submitting}
                  onPress={() => handleConfirmResult(true)}
                >
                  <Ionicons name="checkmark" size={18} color={Color.pitch} />
                  <Text style={styles.acceptText}>Confirmar</Text>
                </Pressable>
                <Pressable
                  style={styles.rejectBtn}
                  disabled={submitting}
                  onPress={() => handleConfirmResult(false)}
                >
                  <Ionicons name="close" size={18} color={Color.danger} />
                  <Text style={styles.rejectText}>Rechazar</Text>
                </Pressable>
              </View>
            </>
          )
        )}

        {type === 'team_challenge' && (
          challenges.length === 0 ? (
            <View style={[styles.resolvedBanner, { backgroundColor: Color.field }]}>
              <Text style={styles.resolvedText}>No hay postulaciones pendientes.</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              <Text style={styles.cardLabel}>EQUIPOS POSTULADOS</Text>
              {challenges.map((c) => (
                <View key={c.id} style={styles.card}>
                  <View style={styles.teamRow}>
                    <View style={styles.teamBadge}>
                      <Text style={styles.teamBadgeText}>
                        {c.challenger_team?.name.slice(0, 2).toUpperCase() ?? '??'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.teamName}>{c.challenger_team?.name ?? '—'}</Text>
                      <Text style={styles.teamMeta}>ELO {c.challenger_team?.elo ?? '—'}</Text>
                    </View>
                  </View>
                  <View style={styles.actions}>
                    <Pressable
                      style={styles.acceptBtn}
                      disabled={submitting}
                      onPress={() => handleChallengeResponse(c, true)}
                    >
                      <Ionicons name="checkmark" size={18} color={Color.pitch} />
                      <Text style={styles.acceptText}>Aceptar</Text>
                    </Pressable>
                    <Pressable
                      style={styles.rejectBtn}
                      disabled={submitting}
                      onPress={() => handleChallengeResponse(c, false)}
                    >
                      <Ionicons name="close" size={18} color={Color.danger} />
                      <Text style={styles.rejectText}>Rechazar</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}
