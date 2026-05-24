import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './squad-card.styles';

export type RecentResult = 'W' | 'D' | 'L';

export type Squad = {
  id: string;
  name: string;
  playerCount: number;
  role: 'Capitán' | 'Jugador';
  captainName: string;
  createdYear: number;
  color: string;
  played: number;
  drawn: number;
  lost: number;
  winRate: number;
  recentForm: RecentResult[];
};

type Props = {
  squad: Squad;
};

const RESULT_COLORS: Record<RecentResult, string> = {
  W: '#22C55E',
  D: '#F59E0B',
  L: '#EF4444',
};

const RESULT_LABELS: Record<RecentResult, string> = {
  W: 'G',
  D: 'E',
  L: 'P',
};

export function SquadCard({ squad }: Props) {
  const won = squad.played - squad.drawn - squad.lost;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => router.push(`/squad-details/${squad.id}`)}
    >
      <View style={styles.header}>
        <View style={[styles.avatarContainer, { backgroundColor: squad.color }]}>
          <Text style={styles.avatarText}>
            {squad.name.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.squadName}>{squad.name}</Text>
            <View
              style={[
                styles.roleBadge,
                squad.role === 'Capitán' ? styles.badgeCaptain : styles.badgeMember,
              ]}
            >
              <Text style={styles.roleText}>
                {squad.role === 'Capitán' ? '⚽ Capitán' : '👤 Jugador'}
              </Text>
            </View>
          </View>
          <Text style={styles.playerCount}>
            👥 {squad.playerCount} jugadores
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{won}</Text>
          <Text style={styles.statLabel}>PG</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{squad.drawn}</Text>
          <Text style={styles.statLabel}>PE</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.statLost]}>{squad.lost}</Text>
          <Text style={styles.statLabel}>PP</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{squad.winRate}%</Text>
          <Text style={styles.statLabel}>WR</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>FORMA RECIENTE</Text>
        <View style={styles.formRow}>
          {squad.recentForm.map((result, i) => (
            <View
              key={i}
              style={[styles.formBadge, { backgroundColor: RESULT_COLORS[result] }]}
            >
              <Text style={styles.formBadgeText}>{RESULT_LABELS[result]}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

