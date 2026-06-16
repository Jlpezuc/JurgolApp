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
  user_id: string | null;
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

  const [username, setUsername] = useState('');
  const [foundPlayer, setFoundPlayer] = useState<KnownPlayer | null>(null);
  const [searching, setSearching] = useState(false);

  const [pendingPlayer, setPendingPlayer] = useState<KnownPlayer | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteOnly, setInviteOnly] = useState(false);

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
        .select('id, full_name, position, overall, user_id')
        .in('id', candidateIds);

      setKnownPlayers((players as KnownPlayer[]) ?? []);
      setLoadingKnown(false);
    }

    fetchKnownPlayers();
  }, [visible, currentPlayerId, squadId]);

  function handleClose() {
    setUsername('');
    setFoundPlayer(null);
    setPendingPlayer(null);
    setInviteMessage('');
    setInviteOnly(false);
    onClose();
  }

  function handleSelectPlayer(player: KnownPlayer) {
    if (!player.user_id) {
      addPlayerDirect(player);
      return;
    }
    setInviteOnly(false);
    setInviteMessage('');
    setPendingPlayer(player);
  }

  function handleSelectByUsername(player: KnownPlayer) {
    setInviteOnly(true);
    setInviteMessage('');
    setPendingPlayer(player);
  }

  function handleBackFromMessage() {
    setPendingPlayer(null);
    setInviteMessage('');
    setInviteOnly(false);
  }

  async function handleSearch() {
    const trimmed = username.trim();
    if (!trimmed) return;
    setSearching(true);
    setFoundPlayer(null);

    const { data } = await supabase
      .from('players')
      .select('id, full_name, position, overall, user_id')
      .ilike('username', trimmed)
      .single();

    setSearching(false);

    if (!data) {
      Alert.alert('No encontrado', 'No existe un jugador con ese username.');
      return;
    }
    setFoundPlayer(data as KnownPlayer);
  }

  async function addPlayerDirect(player: KnownPlayer) {
    setAddingId(player.id);

    const { error } = await supabase
      .from('team_members')
      .insert({ team_id: squadId, player_id: player.id, role: 'player', status: 'accepted' });

    setAddingId(null);

    if (error) {
      Alert.alert('Error', error.code === '23505' ? 'Este jugador ya está en el equipo.' : error.message);
      return;
    }

    onPlayerAdded?.();
    handleClose();
  }

  async function handleSendInvite() {
    if (!pendingPlayer) return;
    setAddingId(pendingPlayer.id);

    if (inviteOnly) {
      await supabase.from('notifications').insert({
        recipient_player_id: pendingPlayer.id,
        type: 'team_invitation',
        message: inviteMessage.trim() || null,
        team_member_id: null,
      });
      setAddingId(null);
      handleClose();
      return;
    }

    const { data: member, error } = await supabase
      .from('team_members')
      .insert({ team_id: squadId, player_id: pendingPlayer.id, role: 'player', status: 'pending' })
      .select('id')
      .single();

    if (error) {
      setAddingId(null);
      Alert.alert('Error', error.code === '23505' ? 'Este jugador ya está en el equipo.' : error.message);
      return;
    }

    await supabase.from('notifications').insert({
      recipient_player_id: pendingPlayer.id,
      type: 'team_invitation',
      message: inviteMessage.trim() || null,
      team_member_id: member.id,
    });

    setAddingId(null);
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
        <Pressable style={[styles.sheet, { maxHeight: '92%' }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          {/* ── Message compose step ─────────────────────────────────────── */}
          {pendingPlayer && (
            <>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Text style={styles.eyebrow}>INVITACIÓN</Text>
                  <Text style={styles.title}>Escribe un mensaje</Text>
                </View>
                <Pressable style={styles.closeBtn} onPress={handleClose}>
                  <Ionicons name="close" size={20} color={Color.fg2} />
                </Pressable>
              </View>

              {/* Player preview */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: Space.s3,
                backgroundColor: Color.field,
                borderRadius: Radius.md,
                padding: Space.s3,
              }}>
                <View style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: Color.pitch3,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontFamily: Font.display.bold, fontSize: 13, color: Color.chalk }}>
                    {pendingPlayer.full_name.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: Font.body.semibold, fontSize: TextSize.base, color: Color.fg1 }}>
                    {pendingPlayer.full_name}
                  </Text>
                  <Text style={{ fontFamily: Font.body.regular, fontSize: TextSize.sm, color: Color.fg3 }}>
                    {inviteOnly ? `Invitación a ${teamName}` : `Se unirá a ${teamName}`}
                  </Text>
                </View>
                <PositionBadge position={pendingPlayer.position} />
              </View>

              {/* Message input */}
              <View>
                <Text style={[styles.sectionLabel, { marginBottom: Space.s2 }]}>MENSAJE</Text>
                <View style={{
                  borderWidth: 1.5,
                  borderColor: Color.grass500,
                  borderRadius: Radius.md,
                  backgroundColor: Color.chalk,
                  padding: Space.s4,
                  minHeight: 120,
                }}>
                  <TextInput
                    placeholder={`Ej: ¡Hola! Te invito a unirte a ${teamName}. Sería genial tenerte en el equipo.`}
                    placeholderTextColor={Color.fg4}
                    value={inviteMessage}
                    onChangeText={(v) => setInviteMessage(v.slice(0, 120))}
                    style={{
                      fontFamily: Font.body.regular,
                      fontSize: TextSize.base,
                      color: Color.fg1,
                      lineHeight: 22,
                      textAlignVertical: 'top',
                    }}
                    multiline
                    maxLength={120}
                    autoFocus
                  />
                </View>
                <Text style={{
                  fontFamily: Font.mono.medium,
                  fontSize: 11,
                  color: inviteMessage.length >= 100 ? Color.clay : Color.fg4,
                  textAlign: 'right',
                  marginTop: 4,
                }}>
                  {inviteMessage.length}/120
                </Text>
              </View>

              {/* Actions */}
              <View style={{ flexDirection: 'row', gap: Space.s3, marginTop: Space.s1 }}>
                <Pressable
                  onPress={handleBackFromMessage}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: Space.s4,
                    borderRadius: Radius.md,
                    borderWidth: 1.5,
                    borderColor: Color.border2,
                  }}
                >
                  <Text style={{ fontFamily: Font.body.semibold, fontSize: TextSize.base, color: Color.fg3 }}>
                    Volver
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleSendInvite}
                  disabled={!!addingId}
                  style={{
                    flex: 2,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: Space.s2,
                    paddingVertical: Space.s4,
                    borderRadius: Radius.md,
                    backgroundColor: Color.pitch,
                    opacity: addingId ? 0.6 : 1,
                  }}
                >
                  {addingId
                    ? <ActivityIndicator size="small" color={Color.chalk} />
                    : <>
                        <Ionicons name="mail" size={16} color={Color.chalk} />
                        <Text style={{ fontFamily: Font.body.semibold, fontSize: TextSize.base, color: Color.chalk }}>
                          Enviar invitación
                        </Text>
                      </>
                  }
                </Pressable>
              </View>
            </>
          )}

          {/* ── Player list step ─────────────────────────────────────────── */}
          {!pendingPlayer && <>
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

          {/* Flex area: jugadores scrollables + búsqueda fija abajo */}
          <View style={{ flex: 1, gap: Space.s3 }}>
            <Text style={styles.sectionLabel}>JUGADORES EN COMÚN</Text>

            {/* Lista scrollable — solo los jugadores */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {loadingKnown && (
                <ActivityIndicator color={Color.grass500} style={{ marginTop: Space.s4 }} />
              )}

              {!loadingKnown && knownPlayers.length === 0 && (
                <Text style={{
                  fontFamily: Font.body.regular,
                  fontSize: TextSize.sm,
                  color: Color.fg4,
                  marginTop: Space.s2,
                }}>
                  No tienes jugadores en común con otros equipos.
                </Text>
              )}

              {knownPlayers.map((p, i) => (
                <View key={p.id}>
                  <PlayerRow
                    player={p}
                    onAdd={handleSelectPlayer}
                    adding={addingId === p.id}
                  />
                  {i < knownPlayers.length - 1 && (
                    <View style={{ height: 1, backgroundColor: Color.border1 }} />
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Búsqueda por username — siempre visible abajo */}
            <View style={[styles.divider, { marginVertical: 0 }]}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>O INVITAR POR USERNAME</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.searchInput}>
              <Text style={styles.searchAt}>@</Text>
              <TextInput
                placeholder="username del jugador"
                placeholderTextColor={Color.fg4}
                value={username}
                onChangeText={(v) => { setUsername(v); setFoundPlayer(null); }}
                style={styles.searchInputText}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              {searching
                ? <ActivityIndicator size="small" color={Color.grass500} />
                : (
                  <Pressable onPress={handleSearch} disabled={!username.trim()}>
                    <Ionicons
                      name="search"
                      size={20}
                      color={username.trim() ? Color.grass500 : Color.fg4}
                    />
                  </Pressable>
                )
              }
            </View>

            {foundPlayer && (
              <PlayerRow
                player={foundPlayer}
                onAdd={handleSelectByUsername}
                adding={addingId === foundPlayer.id}
              />
            )}
          </View>
          </>}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
