import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Color } from '@/constants/design';
import { AppNotification } from '@/hooks/useNotifications';
import { supabase } from '@/lib/supabase';
import { styles } from './invitation.styles';

const SELECT = `
  id, type, message, is_read, created_at, team_member_id,
  team_member:team_members!notifications_team_member_id_fkey (
    id, status, team_id,
    team:teams!team_members_team_id_fkey (
      id, name, created_by,
      inviter:players!teams_created_by_fkey ( full_name, username )
    )
  )
`;

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

export default function InvitationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [notif, setNotif] = useState<AppNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<null | 'accept' | 'reject'>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('notifications')
        .select(SELECT)
        .eq('id', id)
        .single();
      setNotif((data as unknown as AppNotification) ?? null);
      setLoading(false);

      // Mark as read on open
      if (data && !(data as unknown as AppNotification).is_read) {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      }
    }
    if (id) load();
  }, [id]);

  async function respond(accept: boolean) {
    if (!notif?.team_member_id) return;
    setSubmitting(accept ? 'accept' : 'reject');

    const { error } = await supabase.rpc('respond_to_invitation', {
      p_team_member_id: notif.team_member_id,
      p_accept: accept,
    });

    setSubmitting(null);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert(
      accept ? '¡Te uniste al equipo!' : 'Invitación rechazada',
      accept
        ? `Ahora eres parte de ${notif.team_member?.team?.name ?? 'el equipo'}.`
        : 'Has rechazado la invitación.',
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

  if (!notif || notif.type !== 'team_invitation' || !notif.team_member?.team) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={{ paddingTop: insets.top + 8 }}>
          <View style={styles.header}>
            <Pressable style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={Color.fg2} />
            </Pressable>
            <Text style={styles.headerTitle}>INVITACIÓN</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>
        <View style={styles.centered}>
          <Text style={styles.teamMeta}>Esta invitación ya no está disponible.</Text>
        </View>
      </View>
    );
  }

  const team = notif.team_member.team;
  const inviter = team.inviter;
  const status = notif.team_member.status;
  const pending = status === 'pending';

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View style={{ paddingTop: insets.top + 8 }}>
        <View style={styles.header}>
          <Pressable style={styles.iconBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={Color.fg2} />
          </Pressable>
          <Text style={styles.headerTitle}>INVITACIÓN DE EQUIPO</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{team.name.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroEyebrow}>EQUIPO</Text>
            <Text style={styles.heroTitle}>Te invitaron a unirte</Text>
            <Text style={styles.heroSub}>{team.name}</Text>
          </View>
        </View>

        {/* Team card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>EQUIPO</Text>
          <View style={styles.teamRow}>
            <View style={styles.teamBadge}>
              <Text style={styles.teamBadgeText}>{team.name.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.teamName}>{team.name}</Text>
              <Text style={styles.teamMeta}>Te unirás como jugador</Text>
            </View>
          </View>
        </View>

        {/* Optional message */}
        {notif.message?.trim() ? (
          <View style={styles.messageCard}>
            <Text style={styles.cardLabel}>MENSAJE</Text>
            <Text style={styles.messageText}>“{notif.message.trim()}”</Text>
          </View>
        ) : null}

        {/* Inviter */}
        {inviter && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>TE INVITÓ</Text>
            <View style={styles.inviterRow}>
              <View style={styles.inviterAvatar}>
                <Text style={styles.inviterAvatarText}>{initials(inviter.full_name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inviterName}>{inviter.full_name}</Text>
                {inviter.username && (
                  <Text style={styles.inviterUsername}>@{inviter.username}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Actions / resolved state */}
        {pending ? (
          <View style={styles.actions}>
            <Pressable
              style={styles.acceptBtn}
              onPress={() => respond(true)}
              disabled={submitting !== null}
            >
              {submitting === 'accept' ? (
                <ActivityIndicator size="small" color={Color.pitch} />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color={Color.pitch} />
                  <Text style={styles.acceptText}>Aceptar invitación</Text>
                </>
              )}
            </Pressable>
            <Pressable
              style={styles.rejectBtn}
              onPress={() => respond(false)}
              disabled={submitting !== null}
            >
              {submitting === 'reject' ? (
                <ActivityIndicator size="small" color={Color.danger} />
              ) : (
                <>
                  <Ionicons name="close" size={20} color={Color.danger} />
                  <Text style={styles.rejectText}>Rechazar</Text>
                </>
              )}
            </Pressable>
          </View>
        ) : (
          <View
            style={[
              styles.resolvedBanner,
              { backgroundColor: status === 'accepted' ? Color.successBg : Color.dangerBg },
            ]}
          >
            <Ionicons
              name={status === 'accepted' ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={status === 'accepted' ? Color.success : Color.danger}
            />
            <Text
              style={[
                styles.resolvedText,
                { color: status === 'accepted' ? Color.success : Color.danger },
              ]}
            >
              {status === 'accepted' ? 'Ya eres parte del equipo' : 'Rechazaste esta invitación'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
