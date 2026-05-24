import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './match.styles';

export default function MatchScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Partido</Text>

        <TouchableOpacity style={styles.btnPrimary}>
          <Text style={styles.btnPrimaryText}>Buscar partido</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Próximos partidos</Text>
          <Text style={styles.emptyText}>No hay partidos programados.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Historial de partidos</Text>
          <Text style={styles.emptyText}>Aún no has jugado partidos.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
