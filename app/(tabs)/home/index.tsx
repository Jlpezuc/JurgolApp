import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './home.styles';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Panel</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Tus estadísticas</Text>
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

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Actividad reciente</Text>
          <View style={styles.activityItem}>
            <View style={styles.activityBar} />
            <View>
              <Text style={styles.activityText}>{`Se unió al Equipo "Strikers"`}</Text>
              <Text style={styles.activityDate}>Hace 2 días</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityBar} />
            <View>
              <Text style={styles.activityText}>Ganó vs Equipo Delta</Text>
              <Text style={styles.activityDate}>Hace 5 días</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Acciones rápidas</Text>
          <TouchableOpacity style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>Buscar partido</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary}>
            <Text style={styles.btnSecondaryText}>Ver equipos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
