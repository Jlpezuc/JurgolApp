import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Color, Font, Radius, Space, TextSize } from '@/constants/design';
import { supabase } from '@/lib/supabase';
import { styles } from './invite-modal.styles';

type KnownPlayer = {
  id: string;
  full_name: string;
  position: string | null;
  overall: number | null;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  teamName: string;
  teamInitials: string;
  playerCount: number;
  maxPlayers?: number;
  squadId: string;
  currentPlayerId: string;
  onPlayerAdded?: () => void;
};

function PositionBadge({ position }: { position: string | null }) {
  const COLOR: Record<string, string> = {
    PO: '#6B7280', DEF: Color.sky, MC: '#0E9E8A', DEL: Color.clay,
  };
  const pos = position ?? 'MC';
  return (
    <View style={{
      backgroundColor: COLOR[pos] ?? Color.fg4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    }}>
      <Text style={{ fontFamily: Font.mono.bold, fontSize: 10, color: '#fff' }}>{pos}</Text>
    </View>
  );
}

function PlayerRow({
  player,
  onAdd,
  adding,
}: {
  player: KnownPlayer;
  onAdd: (p: KnownPlayer) => void;
  adding: boolean;
}) {
  const initials = player.full_name.slice(0, 2).toUpperCase();
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Space.s3,
      gap: Space.s3,
    }}>
      <View style={{
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Color.pitch3,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontFamily: Font.display.bold, fontSize: 13, color: Color.chalk }}>
          {initials}
        </Text>
      </View>

      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ fontFamily: Font.body.semibold, fontSize: TextSize.base, color: Color.fg1 }}>
          {player.full_name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <PositionBadge position={player.position} />
          {player.overall != null && (
            <Text style={{ fontFamily: Font.mono.medium, fontSize: 11, color: Color.fg3 }}>
              OVR {player.overall}
            </Text>
          )}
        </View>
      </View>

      <Pressable
        onPress={() => onAdd(player)}
        disabled={adding}
        style={{
          backgroundColor: adding ? Color.fg4 : Color.pitch,
          borderRadius: Radius.sm,
          paddingHorizontal: Space.s3,
          paddingVertical: Space.s2,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {adding
          ? <ActivityIndicator size="small" color={Color.chalk} />
          : <>
              <Ionicons name="add" size={14} color={Color.chalk} />
              <Text style={{ fontFamily: Font.body.semibold, fontSize: 12, color: Color.chalk }}>
                Añadir
              </Text>
            </>
        }
      </Pressable>
    </View>
  );
}

export function InvitePlayerModal({
  visible,
  onClose,
  teamName,
  teamInitials,
  playerCount,
  maxPlayers = 15,
  squadId,
  currentPlayerId,
  onPlayerAdded,
}: Props) {
  const [knownPlayers, setKnownPlayers] = useState<KnownPlayer[]>([]);
  const [loadingKnown, setLoadingKnown] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const [playerId, setPlayerId] = useState('');
  const [foundPlayer, setFoundPlayer] = useState<KnownPlayer | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!visible || !currentPlayerId || !squadId) return;

    async function fetchKnownPlayers() {
      setLoadingKnown(true);
      setKnownPlayers([]);

      // 1. IDs already in this team (to exclude them)
      const { data: currentMembers } = await supabase
        .from('team_members')
        .select('player_id')
        .eq('team_id', squadId);

      const excludeIds = new Set<string>(
        (currentMembers ?? []).map((m) => m.player_id)
      );
      excludeIds.add(currentPlayerId);

      // 2. Other teams the current player is in
      const { data: myTeams } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('player_id', currentPlayerId)
        .neq('team_id', squadId);

      const myTeamIds = (myTeams ?? []).map((t) => t.team_id);

      if (myTeamIds.length === 0) {
        console.log('[InviteModal] no other teams found');
        setKnownPlayers([]);
        setLoadingKnown(false);
        return;
      }

      // 3. All player_ids in those teams, excluding already-members
      const { data: memberRows } = await supabase
        .from('team_members')
        .select('player_id')
        .in('team_id', myTeamIds);

      const candidateIds = [
        ...new Set(
          (memberRows ?? [])
            .map((r) => r.player_id)
            .filter((id) => !excludeIds.has(id))
        ),
      ];

      if (candidateIds.length === 0) {
        setKnownPlayers([]);
        setLoadingKnown(false);
        return;
      }

      // 4. Fetch full player data
      const { data: players } = await supabase
        .from('players')
        .select('id, full_name, position, overall')
        .in('id', candidateIds);

      setKnownPlayers((players as KnownPlayer[]) ?? []);
      setLoadingKnown(false);
    }

    fetchKnownPlayers();
  }, [visible, currentPlayerId, squadId]);

  function handleClose() {
    setPlayerId('');
    setFoundPlayer(null);
    onClose();
  }

  async function handleSearch() {
    const trimmed = playerId.trim();
    if (!trimmed) return;
    setSearching(true);
    setFoundPlayer(null);

    const { data } = await supabase
      .from('players')
      .select('id, full_name, position, overall')
      .eq('id', trimmed)
      .single();

    setSearching(false);

    if (!data) {
      Alert.alert('No encontrado', 'No existe un jugador con ese ID.');
      return;
    }
    setFoundPlayer(data as KnownPlayer);
  }

  async function addPlayer(player: KnownPlayer) {
    setAddingId(player.id);

    const { error } = await supabase
      .from('team_members')
      .insert({ team_id: squadId, player_id: player.id, role: 'player' });

    setAddingId(null);

    if (error) {
      Alert.alert('Error', error.code === '23505' ? 'Este jugador ya está en el equipo.' : error.message);
      return;
    }

    onPlayerAdded?.();
    handleClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={[styles.sheet, { maxHeight: '85%' }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.eyebrow}>AÑADIR JUGADOR</Text>
              <Text style={styles.title}>Elige un jugador</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={handleClose}>
              <Ionicons name="close" size={20} color={Color.fg2} />
            </Pressable>
          </View>

          {/* Team card */}
          <View style={styles.teamCard}>
            <View style={styles.teamBadge}>
              <Text style={styles.teamBadgeText}>{teamInitials}</Text>
            </View>
            <View style={styles.teamInfo}>
              <Text style={styles.teamLabel}>EQUIPO</Text>
              <Text style={styles.teamName}>{teamName}</Text>
            </View>
            <Text style={styles.teamCount}>
              <Text style={styles.teamCountActive}>{playerCount}</Text>
              {' / '}{maxPlayers}
            </Text>
          </View>

          {/* Known players */}
          <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>JUGADORES EN COMÚN</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }}>

            {loadingKnown && (
              <ActivityIndicator color={Color.grass500} style={{ marginTop: Space.s4 }} />
            )}

            {!loadingKnown && knownPlayers.length === 0 && (
              <Text style={{
                fontFamily: Font.body.regular,
                fontSize: TextSize.sm,
                color: Color.fg4,
                marginTop: Space.s3,
                marginBottom: Space.s2,
              }}>
                No tienes jugadores en común con otros equipos.
              </Text>
            )}

            {knownPlayers.map((p, i) => (
              <View key={p.id}>
                <PlayerRow
                  player={p}
                  onAdd={addPlayer}
                  adding={addingId === p.id}
                />
                {i < knownPlayers.length - 1 && (
                  <View style={{ height: 1, backgroundColor: Color.border1 }} />
                )}
              </View>
            ))}

            {/* Divider */}
            <View style={[styles.divider, { marginVertical: Space.s4 }]}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>O BUSCAR POR ID</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* ID search */}
            <View style={styles.searchInput}>
              <TextInput
                placeholder="Pega el ID del jugador"
                placeholderTextColor={Color.fg4}
                value={playerId}
                onChangeText={(v) => { setPlayerId(v); setFoundPlayer(null); }}
                style={styles.searchInputText}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searching
                ? <ActivityIndicator size="small" color={Color.grass500} />
                : (
                  <Pressable onPress={handleSearch} disabled={!playerId.trim()}>
                    <Ionicons
                      name="search"
                      size={20}
                      color={playerId.trim() ? Color.grass500 : Color.fg4}
                    />
                  </Pressable>
                )
              }
            </View>

            {/* Found player via ID */}
            {foundPlayer && (
              <View style={{ marginTop: Space.s3 }}>
                <PlayerRow
                  player={foundPlayer}
                  onAdd={addPlayer}
                  adding={addingId === foundPlayer.id}
                />
              </View>
            )}

            <View style={{ height: Space.s5 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
