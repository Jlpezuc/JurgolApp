import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { registerForPushNotifications } from '@/lib/notifications';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './profile.styles';
import { Color } from '@/constants/design';
import { usePlayer } from '@/hooks/usePlayer';
import { useSession } from '@/hooks/useSession';
import { useNotifications } from '@/hooks/useNotifications';
import { usePlayerMatchStats } from '@/hooks/usePlayerMatchStats';
import { PlayerQrCodeModal } from '@/components/qr/player-qr-code';

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function ProfileScreen() {
  const { player } = usePlayer();
  const { session } = useSession();
  const { unreadCount } = useNotifications();
  const { stats } = usePlayerMatchStats();
  const [qrOpen, setQrOpen] = useState(false);

  const displayName = player?.full_name ?? '—';
  const initials = player?.full_name ? getInitials(player.full_name) : '?';

  // Best-effort: only succeeds on a development build (Expo Go dropped remote push
  // on Android in SDK 53). Local match reminders don't depend on this.
  useEffect(() => {
    if (player?.id) registerForPushNotifications(player.id);
  }, [player?.id]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Perfil</Text>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color={Color.fg1} />
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            {player?.photo_url ? (
              <Image source={{ uri: player.photo_url }} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <Text style={styles.avatarInitials}>{initials}</Text>
            )}
          </View>
          <Text style={styles.playerName}>{displayName}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Información</Text>
          <View style={styles.statRow}>
            <Text style={styles.statName}>Username</Text>
            <Text style={styles.statValueSmall}>{player?.username ? `@${player.username}` : '—'}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statName}>Correo</Text>
            <Text style={styles.statValueSmall}>{session?.user.email ?? '—'}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statName}>Teléfono</Text>
            <Text style={styles.statValueSmall}>{player?.phone ?? '—'}</Text>
          </View>
          <TouchableOpacity style={styles.editLink} onPress={() => router.push('/edit-profile')}>
            <Ionicons name="create-outline" size={16} color={Color.grass600} />
            <Text style={styles.editLinkText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Estadísticas de carrera</Text>
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

        <TouchableOpacity style={styles.btnSecondary} onPress={() => setQrOpen(true)}>
          <Text style={styles.btnSecondaryText}>Mi código QR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/account')}>
          <Text style={styles.btnSecondaryText}>Cuenta y seguridad</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnLogout} onPress={() => supabase.auth.signOut()}>
          <Text style={styles.btnLogoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {player && (
        <PlayerQrCodeModal
          visible={qrOpen}
          onClose={() => setQrOpen(false)}
          playerId={player.id}
          playerName={player.full_name}
        />
      )}
    </SafeAreaView>
  );
}
