import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Color } from '@/constants/design';
import {
  AttendanceStatus,
  PlayerPosition,
  SquadDetail,
  SquadPlayer,
} from '@/constants/squads.mocks';
import { styles } from './squad-lineup.styles';

// ── Position config ──────────────────────────────────────────────────────────

const POSITION_LABELS: Record<PlayerPosition, string> = {
  [PlayerPosition.PO]:  'Arquero',
  [PlayerPosition.DEF]: 'Defensa',
  [PlayerPosition.MC]:  'Mediocampo',
  [PlayerPosition.DEL]: 'Delantero',
};

const POSITION_ORDER: PlayerPosition[] = [PlayerPosition.PO, PlayerPosition.DEF, PlayerPosition.MC, PlayerPosition.DEL];

const POSITION_BADGE_COLOR: Record<PlayerPosition, string> = {
  [PlayerPosition.PO]:  Color.pitch3,
  [PlayerPosition.DEF]: Color.sky,
  [PlayerPosition.MC]:  '#0E9E8A',
  [PlayerPosition.DEL]: Color.clay,
};

const ATTENDANCE_DOT_COLOR: Record<AttendanceStatus, string> = {
  [AttendanceStatus.Going]:    Color.grass500,
  [AttendanceStatus.Maybe]:    Color.warning,
  [AttendanceStatus.NotGoing]: Color.fg4,
};

const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.Going]:    'Va',
  [AttendanceStatus.Maybe]:    'Quizás',
  [AttendanceStatus.NotGoing]: 'No va',
};

// ── Sub-components ───────────────────────────────────────────────────────────

function getInitials(firstName: string, lastName: string) {
  return (firstName[0] + lastName[0]).toUpperCase();
}

function PlayerRowItem({ player, isLast }: { player: SquadPlayer; isLast: boolean }) {
  return (
    <View style={[styles.playerRow, isLast && styles.playerRowLast]}>
      <View style={[styles.playerAvatar, player.isCaptain && styles.playerAvatarCaptain]}>
        <Text style={[styles.playerAvatarText, player.isCaptain && styles.playerAvatarTextCaptain]}>
          {getInitials(player.firstName, player.lastName)}
        </Text>
      </View>

      <View style={styles.playerInfo}>
        <View style={styles.playerNameRow}>
          <Text style={styles.playerName}>
            {player.firstName[0]}. {player.lastName}
          </Text>
          {player.isCaptain && <Text style={styles.captainIcon}>👑</Text>}
        </View>

        <View style={styles.playerMeta}>
          <View style={[styles.positionBadge, { backgroundColor: POSITION_BADGE_COLOR[player.position] }]}>
            <Text style={styles.positionBadgeText}>{player.position}</Text>
          </View>
          <Text style={styles.playerNumber}>#{player.number}</Text>
          <View style={[styles.attendanceDot, { backgroundColor: ATTENDANCE_DOT_COLOR[player.attendance] }]} />
          <Text style={styles.attendanceLabel}>{player.attendance}</Text>
        </View>
      </View>

      <View style={styles.playerOvr}>
        <Text style={styles.ovrValue}>{player.overall}</Text>
        <Text style={styles.ovrLabel}>OVR</Text>
      </View>
    </View>
  );
}

function AttendanceCard({ players }: { players: SquadPlayer[] }) {
  const total = players.length;
  const va     = players.filter((p) => p.attendance === AttendanceStatus.Going).length;
  const quizas = players.filter((p) => p.attendance === AttendanceStatus.Maybe).length;
  const noVa   = players.filter((p) => p.attendance === AttendanceStatus.NotGoing).length;

  return (
    <View style={styles.attendanceCard}>
      <View style={styles.attendanceHeader}>
        <Text style={styles.attendanceTitle}>Asistencia próximo partido</Text>
        <Text style={styles.attendanceTotal}>
          {va}
          <Text style={styles.attendanceTotalDim}>/{total}</Text>
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[styles.progressSegment, { flex: va, backgroundColor: Color.grass500 }]}
        />
        <View
          style={[styles.progressSegment, { flex: quizas, backgroundColor: Color.warning }]}
        />
        <View
          style={[styles.progressSegment, { flex: noVa, backgroundColor: Color.fg4 }]}
        />
      </View>

      <View style={styles.attendanceLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Color.grass500 }]} />
          <Text style={styles.legendText}>{ATTENDANCE_LABELS[AttendanceStatus.Going]} {va}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Color.warning }]} />
          <Text style={styles.legendText}>{ATTENDANCE_LABELS[AttendanceStatus.Maybe]} {quizas}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Color.fg4 }]} />
          <Text style={styles.legendText}>{ATTENDANCE_LABELS[AttendanceStatus.NotGoing]} {noVa}</Text>
        </View>
      </View>
    </View>
  );
}

function RosterByPosition({ players }: { players: SquadPlayer[] }) {
  const grouped = POSITION_ORDER.reduce<Record<PlayerPosition, SquadPlayer[]>>(
    (acc, pos) => {
      acc[pos] = players.filter((p) => p.position === pos);
      return acc;
    },
    { [PlayerPosition.PO]: [], [PlayerPosition.DEF]: [], [PlayerPosition.MC]: [], [PlayerPosition.DEL]: [] } as Record<PlayerPosition, SquadPlayer[]>,
  );

  const activePositions = POSITION_ORDER.filter((pos) => grouped[pos].length > 0);

  return (
    <View style={styles.rosterCard}>
      {activePositions.map((pos, posIndex) => {
        const isLastPosition = posIndex === activePositions.length - 1;
        return (
          <View key={pos}>
            <View style={styles.positionHeader}>
              <Text style={styles.positionLabel}>{POSITION_LABELS[pos]}</Text>
              <Text style={styles.positionCount}>{grouped[pos].length}</Text>
            </View>
            {grouped[pos].map((player, i) => {
              const isLastPlayer = i === grouped[pos].length - 1;
              return (
                <PlayerRowItem
                  key={`${player.id}-${i}`}
                  player={player}
                  isLast={isLastPosition && isLastPlayer}
                />
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

// ── Tab views ────────────────────────────────────────────────────────────────

function PlantillaTab({ detail }: { detail: SquadDetail }) {
  return (
    <>
      <AttendanceCard players={detail.players} />
      <Pressable
        style={styles.inviteButton}
        onPress={() =>
          router.push({ pathname: '/squad-details/add-player', params: { squadId: detail.squadId } })
        }
      >
        <Text style={styles.inviteButtonText}>+ Invitar jugador</Text>
      </Pressable>
      <RosterByPosition players={detail.players} />
    </>
  );
}

function EmptyTab({ label }: { label: string }) {
  return (
    <View style={styles.emptyTab}>
      <Text style={styles.emptyText}>{label} próximamente</Text>
    </View>
  );
}

// ── Tab config ────────────────────────────────────────────────────────────────

type TabKey = 'plantilla' | 'proximos' | 'historial';

const TABS: { key: TabKey; label: string; count: (d: SquadDetail) => number }[] = [
  { key: 'plantilla', label: 'Plantilla', count: (d) => d.players.length },
  { key: 'proximos',  label: 'Próximos',  count: () => 3 },
  { key: 'historial', label: 'Historial', count: () => 6 },
];

// ── Main export ───────────────────────────────────────────────────────────────

export function SquadLineup({ detail }: { detail: SquadDetail }) {
  const [activeTab, setActiveTab] = useState<TabKey>('plantilla');

  return (
    <>
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = tab.count(detail);
          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {activeTab === 'plantilla' && <PlantillaTab detail={detail} />}
      {activeTab === 'proximos'  && <EmptyTab label="Próximos partidos" />}
      {activeTab === 'historial' && <EmptyTab label="Historial" />}
    </>
  );
}
