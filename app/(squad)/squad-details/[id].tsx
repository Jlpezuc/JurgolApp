import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RecentResult } from '@/components/squad-card';
import { Color } from '@/constants/design';
import { ALL_SQUADS, SQUAD_DETAIL_MOCK } from '@/constants/squads.mocks';
import { styles } from './squad-detail.styles';
import { SquadLineup } from '@/components/squad-details/squad-lineup/squad-lineup';

const RESULT_COLORS: Record<RecentResult, string> = {
  W: Color.grass500,
  D: Color.warning,
  L: Color.clay,
};

const RESULT_LABELS: Record<RecentResult, string> = {
  W: 'G',
  D: 'E',
  L: 'P',
};

export default function SquadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const squad = ALL_SQUADS.find((s) => s.id === id);

  if (!squad) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Text style={{ color: Color.fgOnPitch, padding: 20 }}>Equipo no encontrado.</Text>
      </View>
    );
  }

  const won = squad.played - squad.drawn - squad.lost;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* ── Header bar ────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerBtn}>
            <Ionicons
              name="chevron-back"
              size={18}
              color={Color.fg3}
              onPress={() => router.back()}
            />
          </View>
          <Text style={styles.headerTitle}>Detalle de equipo</Text>
          <View style={styles.headerBtn}>
            <Ionicons name="share-outline" size={18} color={Color.fg3} />
          </View>
        </View>

        {/* ── Hero card ─────────────────────────────────────────────────── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={[styles.avatarWrapper, { backgroundColor: squad.color }]}>
              <Text style={styles.avatarText}>
                {squad.name.slice(0, 2).toUpperCase()}
              </Text>
            </View>

            <View style={styles.heroMeta}>
              <Text style={styles.heroYear}>Desde {squad.createdYear}</Text>
              <Text style={styles.heroName}>{squad.name}</Text>
              <View style={styles.roleBadgeRow}>
                <View
                  style={[
                    styles.roleBadge,
                    squad.role === 'Capitán'
                      ? styles.roleBadgeCaptain
                      : styles.roleBadgeMember,
                  ]}
                >
                  <Text
                    style={[
                      styles.roleBadgeText,
                      squad.role !== 'Capitán' && styles.roleBadgeTextMember,
                    ]}
                  >
                    {squad.role === 'Capitán' ? '⚽ Capitán' : '👤 Jugador'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Jugadores</Text>
              <Text style={styles.heroStatValue}>{squad.playerCount}</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Capitán</Text>
              <Text style={styles.heroStatValue}>{squad.captainName}</Text>
            </View>
          </View>
        </View>

        {/* ── Light content ─────────────────────────────────────────────── */}
        <View style={styles.lightSection}>
          <View style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordTitle}>Récord</Text>
              <Text style={styles.recordSubtitle}>{squad.played} partidos</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, styles.statValueWon]}>{won}</Text>
                <Text style={styles.statLabel}>PG</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{squad.drawn}</Text>
                <Text style={styles.statLabel}>PE</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, styles.statValueLost]}>{squad.lost}</Text>
                <Text style={styles.statLabel}>PP</Text>
              </View>
            </View>

            <View style={styles.recordDivider} />

            <View style={styles.formRow}>
              <View style={styles.formLeft}>
                <Text style={styles.formLabel}>Forma reciente</Text>
                <View style={styles.formBadges}>
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
              <View style={styles.winRateBlock}>
                <Text style={styles.winRateValue}>{squad.winRate}%</Text>
                <Text style={styles.winRateLabel}>Win Rate</Text>
              </View>
            </View>
          </View>

          <SquadLineup detail={SQUAD_DETAIL_MOCK} />
        </View>
      </ScrollView>
    </View>
  );
}
