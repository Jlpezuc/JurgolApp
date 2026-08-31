import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Color } from '@/constants/design';
import { usePlayer } from '@/hooks/usePlayer';
import { supabase } from '@/lib/supabase';
import { styles } from '../(squad)/edit-profile/edit-profile.styles';

type TeamInfo = { id: string; name: string; elo: number; logo_url: string | null };

/**
 * Landing screen for the `jurgolapp://join-team/<id>` links shared from a squad.
 * Joining creates a pending `team_members` row plus a notification for the
 * captain — the same shape `invite_player` produces, just initiated by the player.
 */
export default function JoinTeamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { player } = usePlayer();

  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [memberStatus, setMemberStatus] = useState<'none' | 'pending' | 'accepted'>('none');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;

    const { data: teamData } = await supabase
      .from('teams')
      .select('id, name, elo, logo_url')
      .eq('id', id)
      .single();
    setTeam(teamData ?? null);

    if (player?.id) {
      const { data: member } = await supabase
        .from('team_members')
        .select('status')
        .eq('team_id', id)
        .eq('player_id', player.id)
        .maybeSingle();
      setMemberStatus(member?.status === 'accepted' ? 'accepted' : member ? 'pending' : 'none');
    }

    setLoading(false);
  }, [id, player?.id]);

  useEffect(() => { load(); }, [load]);

  async function handleJoin() {
    if (!team || !player?.id) return;
    setSubmitting(true);

    const { data: member, error } = await supabase
      .from('team_members')
      .insert({ team_id: team.id, player_id: player.id, role: 'player', status: 'pending' })
      .select('id')
      .single();

    if (error || !member) {
      setSubmitting(false);
      Alert.alert('Error', error?.message ?? 'No se pudo enviar la solicitud.');
      return;
    }

    const { data: teamRow } = await supabase
      .from('teams')
      .select('created_by')
      .eq('id', team.id)
      .single();

    if (teamRow?.created_by) {
      await supabase.from('notifications').insert({
        recipient_player_id: teamRow.created_by,
        type: 'team_invitation',
        message: `${player.full_name} quiere unirse a ${team.name}.`,
        team_member_id: member.id,
      });
    }

    setSubmitting(false);
    setMemberStatus('pending');
    Alert.alert('Solicitud enviada', 'El capitán tiene que aceptarte para entrar al equipo.', [
      { text: 'OK', onPress: () => router.replace('/(tabs)/squads') },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={Color.grass500} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.replace('/(tabs)/squads')}>
          <Ionicons name="chevron-back" size={18} color="#0D0D0D" />
        </Pressable>
        <Text style={styles.headerTitle}>Invitación</Text>
      </View>

      <View style={styles.scrollContent}>
        {!team ? (
          <Text style={styles.hint}>Este equipo ya no existe.</Text>
        ) : (
          <>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitials}>{team.name.slice(0, 2).toUpperCase()}</Text>
              </View>
              <Text style={styles.headerTitle}>{team.name}</Text>
              <Text style={styles.avatarHint}>ELO {team.elo}</Text>
            </View>

            {memberStatus === 'accepted' ? (
              <Text style={styles.hint}>Ya eres parte de este equipo.</Text>
            ) : memberStatus === 'pending' ? (
              <Text style={styles.hint}>Ya enviaste una solicitud. Espera que el capitán la acepte.</Text>
            ) : (
              <Pressable style={styles.saveBtn} onPress={handleJoin} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Pedir unirme</Text>
                )}
              </Pressable>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
