import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, Share, Text, View } from 'react-native';

import { Color, Font } from '@/constants/design';
import {
  AttendanceStatus,
  SquadDetail,
  SquadPlayer,
} from '@/constants/squads.mocks';
import { Match, MatchCard } from '@/components/matches/match-card';
import { styles } from './squad-lineup.styles';

// ── Attendance config ────────────────────────────────────────────────────────

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

function invitePlayerToApp(player: SquadPlayer) {
  Share.share({
    message: `¡Hola ${player.firstName}! Te invito a unirte a JurgolApp para seguir al equipo, confirmar asistencia a los partidos y mucho más. Descárgala y crea tu cuenta.`,
  }).catch(() => {});
}

function PlayerRowItem({
  player,
  isLast,
  selected,
  onSelect,
  onRemove,
}: {
  player: SquadPlayer;
  isLast: boolean;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const isPending = player.status === 'pending';

  return (
    <Pressable
      style={[
        styles.playerRow,
        isLast && styles.playerRowLast,
        isPending && { backgroundColor: Color.field, opacity: 0.7 },
      ]}
      onPress={onSelect}
    >
      <View style={[styles.playerAvatar, player.isCaptain && styles.playerAvatarCaptain]}>
        {player.photoUrl ? (
          <Image source={{ uri: player.photoUrl }} style={styles.playerAvatarImage} resizeMode="cover" />
        ) : (
          <Text style={[styles.playerAvatarText, player.isCaptain && styles.playerAvatarTextCaptain]}>
            {getInitials(player.firstName, player.lastName)}
          </Text>
        )}
      </View>

      <View style={styles.playerInfo}>
        <View style={styles.playerNameRow}>
          <Text style={styles.playerName}>
            {player.firstName[0]}. {player.lastName}
          </Text>
          {player.isCaptain && <Text style={styles.captainIcon}>👑</Text>}
        </View>

        {!selected && (
          isPending ? (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              marginTop: 2,
            }}>
              <Ionicons name="time-outline" size={11} color={Color.warning} />
              <Text style={{
                fontFamily: Font.mono.medium,
                fontSize: 10,
                color: Color.warning,
                letterSpacing: 0.8,
              }}>
                PENDIENTE
              </Text>
            </View>
          ) : (
            <View style={styles.playerMeta}>
              <Text style={styles.playerNumber}>#{player.number}</Text>
              <View style={[styles.attendanceDot, { backgroundColor: ATTENDANCE_DOT_COLOR[player.attendance] }]} />
              <Text style={styles.attendanceLabel}>{player.attendance}</Text>
            </View>
          )
        )}
      </View>

      {!selected && !isPending && !player.hasAccount && (
        <Pressable
          onPress={() => invitePlayerToApp(player)}
          hitSlop={6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 999,
            borderWidth: 1.5,
            borderColor: Color.grass400,
            backgroundColor: Color.grass50,
            marginRight: 8,
          }}
        >
          <Ionicons name="person-add-outline" size={13} color={Color.grass600} />
          <Text style={{ fontFamily: Font.body.bold, fontSize: 12, color: Color.grass600 }}>
            Invitar
          </Text>
        </Pressable>
      )}

      {selected ? (
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: Color.clay + '18',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="trash-outline" size={18} color={Color.clay} />
        </Pressable>
      ) : isPending ? (
        <Ionicons name="hourglass-outline" size={18} color={Color.warning} />
      ) : (
        <View style={styles.playerOvr}>
          <Text style={styles.ovrValue}>{player.overall}</Text>
          <Text style={styles.ovrLabel}>OVR</Text>
        </View>
      )}
    </Pressable>
  );
}

export type MatchAttendance = 'invited' | 'confirmed' | 'declined';

const MY_ATTENDANCE_OPTIONS: { key: MatchAttendance; label: string; color: string }[] = [
  { key: 'confirmed', label: 'Voy',    color: Color.grass500 },
  { key: 'invited',   label: 'Quizás', color: Color.warning },
  { key: 'declined',  label: 'No voy', color: Color.fg4 },
];

function MyAttendancePicker({
  value,
  onChange,
}: {
  value: MatchAttendance;
  onChange: (v: MatchAttendance) => void;
}) {
  return (
    <>
      <View style={styles.attendanceDividerLine} />
      <Text style={styles.attendanceTitle}>Tu asistencia</Text>
      <View style={styles.attendancePicker}>
        {MY_ATTENDANCE_OPTIONS.map((opt) => {
          const active = value === opt.key;
          return (
            <Pressable
              key={opt.key}
              style={[
                styles.attendanceOption,
                active && { backgroundColor: opt.color, borderColor: opt.color },
              ]}
              onPress={() => onChange(opt.key)}
            >
              <Text style={[styles.attendanceOptionText, active && styles.attendanceOptionTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

function AttendanceCard({
  players,
  myAttendance,
  hasNextMatch,
  onSetAttendance,
}: {
  players: SquadPlayer[];
  myAttendance: MatchAttendance | null;
  hasNextMatch: boolean;
  onSetAttendance?: (status: MatchAttendance) => void;
}) {
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

      {hasNextMatch && myAttendance && onSetAttendance ? (
        <MyAttendancePicker value={myAttendance} onChange={onSetAttendance} />
      ) : !hasNextMatch ? (
        <Text style={styles.attendanceEmptyHint}>No hay un próximo partido agendado.</Text>
      ) : null}
    </View>
  );
}

function Roster({
  players,
  onRemovePlayer,
}: {
  players: SquadPlayer[];
  onRemovePlayer?: (playerId: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Captains first, otherwise keep the roster's natural order
  const ordered = [...players].sort((a, b) => (b.isCaptain ? 1 : 0) - (a.isCaptain ? 1 : 0));

  function handleRemove(player: SquadPlayer) {
    Alert.alert(
      'Eliminar jugador',
      `¿Eliminar a ${player.firstName} ${player.lastName} del equipo?${player.userId ? '\nSe le notificará.' : ''}`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => setSelectedId(null) },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setSelectedId(null);
            onRemovePlayer?.(player.id);
          },
        },
      ],
    );
  }

  return (
    <Pressable style={styles.rosterCard} onPress={() => setSelectedId(null)}>
      {ordered.map((player, i) => (
        <PlayerRowItem
          key={`${player.id}-${i}`}
          player={player}
          isLast={i === ordered.length - 1}
          selected={selectedId === player.id}
          onSelect={() => setSelectedId(selectedId === player.id ? null : player.id)}
          onRemove={() => handleRemove(player)}
        />
      ))}
    </Pressable>
  );
}

// ── Tab views ────────────────────────────────────────────────────────────────

function PlantillaTab({
  detail,
  onRemovePlayer,
  myAttendance,
  hasNextMatch,
  onSetAttendance,
}: {
  detail: SquadDetail;
  onRemovePlayer?: (id: string) => void;
  myAttendance: MatchAttendance | null;
  hasNextMatch: boolean;
  onSetAttendance?: (status: MatchAttendance) => void;
}) {
  return (
    <>
      <AttendanceCard
        players={detail.players}
        myAttendance={myAttendance}
        hasNextMatch={hasNextMatch}
        onSetAttendance={onSetAttendance}
      />
      <Pressable
        style={styles.inviteButton}
        onPress={() =>
          router.push({ pathname: '/squad-details/add-player', params: { squadId: detail.squadId } })
        }
      >
        <Text style={styles.inviteButtonText}>+ Invitar jugador</Text>
      </Pressable>
      <Roster players={detail.players} onRemovePlayer={onRemovePlayer} />
    </>
  );
}

function ProximosTab({
  teamId,
  matches,
  onCreateMatch,
  onRegisterResult,
}: {
  teamId: string;
  matches: Match[];
  onCreateMatch: () => void;
  onRegisterResult: (match: Match) => void;
}) {
  const upcoming = matches.filter((m) => m.status === 'scheduled');

  return (
    <View style={{ gap: 12 }}>
      <Pressable style={styles.inviteButton} onPress={onCreateMatch}>
        <Text style={styles.inviteButtonText}>+ Crear partido</Text>
      </Pressable>

      {upcoming.length === 0 ? (
        <View style={styles.emptyTab}>
          <Text style={styles.emptyText}>No hay partidos programados</Text>
        </View>
      ) : (
        upcoming.map((m) => (
          <MatchCard
            key={m.id}
            match={m}
            viewerTeamId={teamId}
            footer={
              <Pressable style={styles.registerResultBtn} onPress={() => onRegisterResult(m)}>
                <Text style={styles.registerResultBtnText}>Cargar resultado</Text>
              </Pressable>
            }
          />
        ))
      )}
    </View>
  );
}

function HistorialTab({ teamId, matches }: { teamId: string; matches: Match[] }) {
  const played = matches.filter((m) => m.status === 'played');

  if (played.length === 0) {
    return (
      <View style={styles.emptyTab}>
        <Text style={styles.emptyText}>Aún no has jugado partidos</Text>
      </View>
    );
  }

  function handleRematch(m: Match) {
    const opponent = teamId === m.home_team_id ? m.away_team : m.home_team;
    if (!opponent) return;
    router.push({
      pathname: '/create-match',
      params: {
        squadId: teamId,
        rematchTeamId: opponent.id,
        rematchTeamName: opponent.name,
        rematchCreatedBy: opponent.created_by,
        modality: m.modality,
        location: m.location ?? '',
      },
    });
  }

  return (
    <View style={{ gap: 12 }}>
      {played.map((m) => (
        <MatchCard
          key={m.id}
          match={m}
          viewerTeamId={teamId}
          footer={
            m.home_team && m.away_team ? (
              <Pressable style={styles.registerResultBtn} onPress={() => handleRematch(m)}>
                <Text style={styles.registerResultBtnText}>Revancha</Text>
              </Pressable>
            ) : undefined
          }
        />
      ))}
    </View>
  );
}

type Rival = {
  id: string;
  name: string;
  elo: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
};

/** Head-to-head record against every team this squad has actually played. */
function rivalsFrom(teamId: string, matches: Match[]): Rival[] {
  const byRival = new Map<string, Rival>();

  for (const m of matches) {
    if (m.status !== 'played' || m.score_home == null || m.score_away == null) continue;
    const isHome = m.home_team_id === teamId;
    const opponent = isHome ? m.away_team : m.home_team;
    if (!opponent) continue;

    const mine = isHome ? m.score_home : m.score_away;
    const theirs = isHome ? m.score_away : m.score_home;

    const entry = byRival.get(opponent.id) ?? {
      id: opponent.id,
      name: opponent.name,
      elo: opponent.elo,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
    };

    entry.played += 1;
    if (mine > theirs) entry.won += 1;
    else if (mine === theirs) entry.drawn += 1;
    else entry.lost += 1;

    byRival.set(opponent.id, entry);
  }

  return [...byRival.values()].sort((a, b) => b.played - a.played);
}

function RivalesTab({ teamId, matches }: { teamId: string; matches: Match[] }) {
  const rivals = rivalsFrom(teamId, matches);

  if (rivals.length === 0) {
    return (
      <View style={styles.emptyTab}>
        <Text style={styles.emptyText}>Aún no te has enfrentado a nadie</Text>
      </View>
    );
  }

  function handleRematch(rival: Rival) {
    const last = matches.find(
      (m) =>
        m.status === 'played' &&
        (m.home_team?.id === rival.id || m.away_team?.id === rival.id)
    );
    const opponent = last
      ? last.home_team_id === teamId
        ? last.away_team
        : last.home_team
      : null;
    if (!opponent) return;

    router.push({
      pathname: '/create-match',
      params: {
        squadId: teamId,
        rematchTeamId: opponent.id,
        rematchTeamName: opponent.name,
        rematchCreatedBy: opponent.created_by,
        modality: last?.modality ?? '5v5',
        location: last?.location ?? '',
      },
    });
  }

  return (
    <View style={{ gap: 12 }}>
      {rivals.map((r) => (
        <View key={r.id} style={styles.rivalCard}>
          <View style={styles.rivalHeader}>
            <View style={styles.rivalBadge}>
              <Text style={styles.rivalBadgeText}>{r.name.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rivalName}>{r.name}</Text>
              <Text style={styles.rivalElo}>ELO {r.elo}</Text>
            </View>
            <Pressable style={styles.registerResultBtn} onPress={() => handleRematch(r)}>
              <Text style={styles.registerResultBtnText}>Revancha</Text>
            </Pressable>
          </View>

          <View style={styles.rivalStats}>
            {[
              { label: 'PJ', value: r.played, color: Color.fg1 },
              { label: 'PG', value: r.won, color: Color.grass500 },
              { label: 'PE', value: r.drawn, color: Color.fg1 },
              { label: 'PP', value: r.lost, color: Color.clay },
            ].map((s) => (
              <View key={s.label} style={styles.rivalStat}>
                <Text style={[styles.rivalStatValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.rivalStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Tab config ────────────────────────────────────────────────────────────────

type TabKey = 'plantilla' | 'proximos' | 'historial' | 'rivales';

const TABS: {
  key: TabKey;
  label: string;
  count: (d: SquadDetail, matches: Match[], teamId: string) => number;
}[] = [
  { key: 'plantilla', label: 'Plantilla', count: (d) => d.players.length },
  { key: 'proximos',  label: 'Próximos',  count: (_d, matches) => matches.filter((m) => m.status === 'scheduled').length },
  { key: 'historial', label: 'Historial', count: (_d, matches) => matches.filter((m) => m.status === 'played').length },
  { key: 'rivales',   label: 'Rivales',   count: (_d, matches, teamId) => rivalsFrom(teamId, matches).length },
];

// ── Main export ───────────────────────────────────────────────────────────────

type Props = {
  detail: SquadDetail;
  teamId: string;
  matches: Match[];
  onRemovePlayer?: (id: string) => void;
  onCreateMatch: () => void;
  onRegisterResult: (match: Match) => void;
  currentPlayerId: string | null;
  myAttendance: MatchAttendance | null;
  hasNextMatch: boolean;
  onSetAttendance?: (status: MatchAttendance) => void;
};

export function SquadLineup({
  detail,
  teamId,
  matches,
  onRemovePlayer,
  onCreateMatch,
  onRegisterResult,
  myAttendance,
  hasNextMatch,
  onSetAttendance,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('plantilla');

  return (
    <>
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = tab.count(detail, matches, teamId);
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

      {activeTab === 'plantilla' && (
        <PlantillaTab
          detail={detail}
          onRemovePlayer={onRemovePlayer}
          myAttendance={myAttendance}
          hasNextMatch={hasNextMatch}
          onSetAttendance={onSetAttendance}
        />
      )}
      {activeTab === 'proximos'  && (
        <ProximosTab teamId={teamId} matches={matches} onCreateMatch={onCreateMatch} onRegisterResult={onRegisterResult} />
      )}
      {activeTab === 'historial' && <HistorialTab teamId={teamId} matches={matches} />}
      {activeTab === 'rivales'   && <RivalesTab teamId={teamId} matches={matches} />}
    </>
  );
}
