import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './profile.styles';
import { usePlayer } from '@/hooks/usePlayer';

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

  const displayName = player?.full_name ?? '—';
  const initials = player?.full_name ? getInitials(player.full_name) : '?';
  const position = player?.position ?? '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Perfil</Text>

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
