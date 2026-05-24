import { SquadCard } from '@/components/squad-card';
import { MY_SQUADS } from '@/constants/squads.mocks';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './squads.styles';

export default function SquadsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>EQUIPOS</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/create-team')}>
            <Text style={styles.btnPrimaryText}>+ Crear</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MIS EQUIPOS</Text>
          {MY_SQUADS.map((squad) => (
            <SquadCard key={squad.id} squad={squad} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
