import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './profile.styles';
import { Color } from '@/constants/design';
import { usePlayer } from '@/hooks/usePlayer';
import { useNotifications } from '@/hooks/useNotifications';

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
  const { unreadCount } = useNotifications();

  const displayName = player?.full_name ?? '—';
  const initials = player?.full_name ? getInitials(player.full_name) : '?';
  const position = player?.position ?? '';

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
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={styles.playerName}>{displayName}</Text>
          <Text style={styles.playerRole}>{position}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Estadísticas de carrera</Text>
          <View style={styles.statRow}>
            <Text style={styles.statName}>Partidos Jugados</Text>
            <Text style={styles.statValue}>24</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statName}>Goles Anotados</Text>
            <Text style={styles.statValue}>12</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statName}>% de Victorias</Text>
            <Text style={styles.statValue}>67%</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btnSecondary}>
          <Text style={styles.btnSecondaryText}>Editar perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnLogout} onPress={() => supabase.auth.signOut()}>
          <Text style={styles.btnLogoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
