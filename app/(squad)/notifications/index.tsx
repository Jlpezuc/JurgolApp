import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Color } from '@/constants/design';
import { AppNotification, useNotifications } from '@/hooks/useNotifications';
import { timeAgo } from '@/lib/time';
import { supabase } from '@/lib/supabase';
import { styles } from './notifications.styles';

type Presentation = {
  eyebrow: string;
  eyebrowColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  body: string;
  pending: boolean;
  tappable: boolean;
};

function present(n: AppNotification): Presentation {
  if (n.type === 'team_invitation') {
    const team = n.team_member?.team;
    const inviter = team?.inviter?.full_name ?? 'Alguien';
    const teamName = team?.name ?? 'un equipo';
    return {
      eyebrow: 'EQUIPO',
      eyebrowColor: Color.info,
      icon: 'people',
      iconBg: Color.infoBg,
      iconColor: Color.info,
      title: 'Invitación de equipo',
      body: n.message?.trim()
        ? n.message
        : `${inviter} te invitó a unirte a ${teamName}.`,
      pending: n.team_member?.status === 'pending',
      tappable: n.team_member?.status === 'pending',
    };
  }

  if (n.type === 'match_created') {
    const home = n.match?.home_team?.name ?? 'un equipo';
    return {
      eyebrow: 'PARTIDO',
      eyebrowColor: Color.grass600,
      icon: 'football',
      iconBg: Color.successBg,
      iconColor: Color.grass600,
      title: 'Partido creado',
      body: n.message?.trim() ? n.message : `${home} organizó un partido.`,
      pending: true,
      tappable: !!n.match_id,
    };
  }

  if (n.type === 'team_challenge') {
    return {
      eyebrow: 'PARTIDO',
      eyebrowColor: Color.grass600,
      icon: 'shield-outline',
      iconBg: Color.successBg,
      iconColor: Color.grass600,
      title: 'Postulación de rival',
      body: n.message?.trim() ? n.message : 'Un equipo quiere ser tu rival.',
      pending: true,
      tappable: !!n.match_id,
    };
  }

  if (n.type === 'result_reported') {
    return {
      eyebrow: 'RESULTADO',
      eyebrowColor: Color.warning,
      icon: 'clipboard-outline',
      iconBg: Color.warningBg,
      iconColor: Color.warning,
      title: 'Confirma el resultado',
      body: n.message?.trim() ? n.message : 'El rival cargó el resultado de un partido.',
      pending: true,
      tappable: !!n.match_id,
    };
  }

  if (n.type === 'match_cancelled') {
    return {
      eyebrow: 'PARTIDO',
      eyebrowColor: Color.danger,
      icon: 'close-circle-outline',
      iconBg: Color.dangerBg,
      iconColor: Color.danger,
      title: 'Partido cancelado',
      body: n.message?.trim() ? n.message : 'Se canceló un partido en el que estabas.',
      pending: false,
      tappable: false,
    };
  }

  if (n.type === 'announcement') {
    const team = n.announce_team?.name ?? 'tu equipo';
    return {
      eyebrow: n.announce_team?.name ?? 'EQUIPO',
      eyebrowColor: Color.info,
      icon: 'megaphone-outline',
      iconBg: Color.infoBg,
      iconColor: Color.info,
      title: `Aviso de ${team}`,
      body: n.message?.trim() ? n.message : 'Tu capitán envió un aviso.',
      pending: false,
      tappable: false,
    };
  }

  // player_removed
  return {
    eyebrow: 'EQUIPO',
    eyebrowColor: Color.danger,
    icon: 'exit-outline',
    iconBg: Color.dangerBg,
    iconColor: Color.danger,
    title: 'Saliste del equipo',
    body: n.message?.trim() ? n.message : 'Has sido eliminado de un equipo.',
    pending: false,
    tappable: false,
  };
}

function NotificationCard({ n }: { n: AppNotification }) {
  const p = present(n);

  function onPress() {
    if (!p.tappable) return;
    if (n.type === 'match_created' || n.type === 'team_challenge' || n.type === 'result_reported') {
      router.push({ pathname: '/notifications/match/[id]', params: { id: n.id } });
      return;
    }
    router.push({ pathname: '/notifications/[id]', params: { id: n.id } });
  }

  return (
    <Pressable
      style={[styles.card, !n.is_read ? styles.cardUnread : styles.cardRead]}
      onPress={onPress}
      disabled={!p.tappable}
    >
      <View style={[styles.iconBox, { backgroundColor: p.iconBg }]}>
        <Ionicons name={p.icon} size={20} color={p.iconColor} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={[styles.cardEyebrow, { color: p.eyebrowColor }]}>{p.eyebrow}</Text>
          <View style={styles.cardTimeRow}>
            <Text style={styles.cardTime}>{timeAgo(n.created_at)}</Text>
            {!n.is_read && <View style={styles.unreadDot} />}
          </View>
        </View>

        <Text style={styles.cardTitle}>{p.title}</Text>
        <Text style={styles.cardText}>{p.body}</Text>

        {p.pending && (
          <View style={[styles.pill, { backgroundColor: Color.warningBg }]}>
            <View style={[styles.pillDot, { backgroundColor: Color.warning }]} />
            <Text style={[styles.pillText, { color: Color.warning }]}>PENDIENTE DE RESPUESTA</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { notifications, unreadCount, loading, refresh } = useNotifications();

  const nuevas = notifications.filter((n) => !n.is_read);
  const anteriores = notifications.filter((n) => n.is_read);

  async function markAllRead() {
    if (unreadCount === 0) return;
    const ids = nuevas.map((n) => n.id);
    await supabase.from('notifications').update({ is_read: true }).in('id', ids);
    refresh();
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View style={{ paddingTop: insets.top + 8 }}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={Color.fg2} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerEyebrow}>
              {unreadCount > 0 ? `${unreadCount} SIN LEER` : 'AL DÍA'}
            </Text>
            <Text style={styles.headerTitle}>Notificaciones</Text>
          </View>
          {unreadCount > 0 ? (
            <Pressable onPress={markAllRead} hitSlop={8}>
              <Text style={styles.readAll}>Leer todas</Text>
            </Pressable>
          ) : (
            <View style={styles.readAllSpacer} />
          )}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Color.grass500} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="notifications-off-outline" size={28} color={Color.fg4} />
          </View>
          <Text style={styles.emptyTitle}>Sin notificaciones</Text>
          <Text style={styles.emptyText}>
            Cuando recibas invitaciones o novedades de tus equipos, aparecerán aquí.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {nuevas.length > 0 && (
            <View style={{ gap: 12 }}>
              <Text style={styles.sectionLabel}>NUEVAS</Text>
              {nuevas.map((n) => (
                <NotificationCard key={n.id} n={n} />
              ))}
            </View>
          )}

          {anteriores.length > 0 && (
            <View style={{ gap: 12 }}>
              <Text style={styles.sectionLabel}>ANTERIORES</Text>
              {anteriores.map((n) => (
                <NotificationCard key={n.id} n={n} />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
