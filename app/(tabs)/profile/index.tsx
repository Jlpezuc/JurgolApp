import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './profile.styles';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Perfil</Text>

        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>JG</Text>
          </View>
          <Text style={styles.playerName}>Jose Guerra</Text>
          <Text style={styles.playerRole}>Mediocampista</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}
