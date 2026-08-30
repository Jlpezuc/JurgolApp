import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { usePlayer } from '@/hooks/usePlayer';
import { SelectOpponentModal } from '@/components/matches/select-opponent-modal';
import { styles } from './create-match.styles';

const MODALITIES = [
  { id: '5v5', label: '5v5' },
  { id: '7v7', label: '7v7' },
  { id: '11v11', label: '11v11' },
];

type TeamOption = { id: string; name: string };
type Member = { player_id: string; full_name: string };
type TargetTeam = { id: string; name: string; created_by: string };

export default function CreateMatchScreen() {
  const {
    squadId: paramSquadId,
    rematchTeamId,
    rematchTeamName,
    rematchCreatedBy,
    modality: paramModality,
    location: paramLocation,
  } = useLocalSearchParams<{
    squadId?: string;
    rematchTeamId?: string;
    rematchTeamName?: string;
    rematchCreatedBy?: string;
    modality?: string;
    location?: string;
  }>();
  const { player } = usePlayer();

  const [myTeams, setMyTeams] = useState<TeamOption[]>([]);
  const [squadId, setSquadId] = useState<string | null>(paramSquadId ?? null);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectOpponentOpen, setSelectOpponentOpen] = useState(false);

  const [modality, setModality] = useState(paramModality ?? '5v5');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState(paramLocation ?? '');
  const [seekingOpponent, setSeekingOpponent] = useState(!!rematchTeamId);
  const [challengeMode, setChallengeMode] = useState<'open' | 'specific'>(rematchTeamId ? 'specific' : 'open');
  const [targetTeam, setTargetTeam] = useState<TargetTeam | null>(
    rematchTeamId ? { id: rematchTeamId, name: rematchTeamName ?? 'Equipo', created_by: rematchCreatedBy ?? '' } : null
  );
  const [slotsNeeded, setSlotsNeeded] = useState(0);
  const [openJoin, setOpenJoin] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // If no squadId was passed in, let the player pick from their own teams
  // (auto-selected when there's only one, so the rest of the form isn't blocked on a tap)
  useEffect(() => {
    if (paramSquadId || !player?.id) return;
    supabase
      .from('team_members')
      .select('team_id, teams(id, name)')
      .eq('player_id', player.id)
      .eq('status', 'accepted')
      .then(({ data }) => {
        const teams = (data ?? [])
          .map((r: any) => r.teams)
          .filter(Boolean) as TeamOption[];
        setMyTeams(teams);
        if (teams.length === 1) setSquadId(teams[0].id);
      });
  }, [paramSquadId, player?.id]);

  useEffect(() => {
    if (!squadId) return;
    supabase
      .from('team_members')
      .select('player_id, players(full_name)')
      .eq('team_id', squadId)
      .eq('status', 'accepted')
      .then(({ data }) => {
        const rows = (data ?? []).map((r: any) => ({
          player_id: r.player_id,
          full_name: r.players?.full_name ?? 'Jugador',
        }));
        setMembers(rows);
      });
  }, [squadId]);

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleCreate() {
    if (!squadId) {
      Alert.alert('Falta el equipo', 'Elige qué equipo organiza el partido.');
      return;
    }
    if (!player?.id) return;
    if (!date.trim() || !time.trim()) {
      Alert.alert('Falta la fecha', 'Ingresa fecha (AAAA-MM-DD) y hora (HH:MM).');
      return;
    }
    const iso = new Date(`${date.trim()}T${time.trim()}:00`);
    if (isNaN(iso.getTime())) {
      Alert.alert('Fecha inválida', 'Revisa el formato: AAAA-MM-DD y HH:MM.');
      return;
    }
    if (seekingOpponent && challengeMode === 'specific' && !targetTeam) {
      Alert.alert('Falta el rival', 'Elige a qué equipo quieres retar.');
      return;
    }

    setSaving(true);

    const isSpecificChallenge = seekingOpponent && challengeMode === 'specific';

    const { data: match, error } = await supabase
      .from('matches')
      .insert({
        home_team_id: squadId,
        modality,
        date: iso.toISOString(),
        location: location.trim() || null,
        seeking_opponent: seekingOpponent && !isSpecificChallenge,
        slots_needed: seekingOpponent ? 0 : slotsNeeded,
        created_by: player.id,
      })
      .select('id')
      .single();

    if (error || !match) {
      setSaving(false);
      Alert.alert('Error', error?.message ?? 'No se pudo crear el partido.');
      return;
    }

    // Creator is always in the lineup
    await supabase.from('match_players').insert({
      match_id: match.id,
      player_id: player.id,
      status: 'confirmed',
      source: 'captain',
    });

    if (isSpecificChallenge && targetTeam) {
      await supabase.from('match_challenges').insert({
        match_id: match.id,
        challenger_team_id: targetTeam.id,
        status: 'pending',
      });
      if (targetTeam.created_by) {
        await supabase.from('notifications').insert({
          recipient_player_id: targetTeam.created_by,
          type: 'team_challenge',
          message: 'Te desafiaron a un partido.',
          match_id: match.id,
        });
      }
    }

    const others = members.filter((m) => m.player_id !== player.id);

    if (!seekingOpponent) {
      if (openJoin) {
        if (others.length > 0) {
          await supabase.from('notifications').insert(
            others.map((m) => ({
              recipient_player_id: m.player_id,
              type: 'match_created',
              message: `Se creó un partido para el ${date.trim()}. ¡Únete!`,
              match_id: match.id,
            }))
          );
        }
      } else {
        const picked = others.filter((m) => selectedIds.has(m.player_id));
        if (picked.length > 0) {
          await supabase.from('match_players').insert(
            picked.map((m) => ({
              match_id: match.id,
              player_id: m.player_id,
              status: 'confirmed',
              source: 'captain',
            }))
          );
          await supabase.from('notifications').insert(
            picked.map((m) => ({
              recipient_player_id: m.player_id,
              type: 'match_created',
              message: `Fuiste convocado para el partido del ${date.trim()}.`,
              match_id: match.id,
            }))
          );
        }
      }
    }

    setSaving(false);
    router.back();
  }

  const otherMembers = members.filter((m) => m.player_id !== player?.id);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color="#0D0D0D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{rematchTeamId ? 'Revancha' : 'Crear partido'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {!paramSquadId && (
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Equipo organizador</Text>
            <View style={styles.chipsRow}>
              {myTeams.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.chip, squadId === t.id && styles.chipActive]}
                  onPress={() => setSquadId(t.id)}
                >
                  <Text style={[styles.chipText, squadId === t.id && styles.chipTextActive]}>{t.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Modalidad</Text>
          <View style={styles.chipsRow}>
            {MODALITIES.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.chip, modality === m.id && styles.chipActive]}
                onPress={() => setModality(m.id)}
              >
                <Text style={[styles.chipText, modality === m.id && styles.chipTextActive]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Fecha y hora</Text>
          <View style={styles.rowInputs}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="AAAA-MM-DD"
              value={date}
              onChangeText={setDate}
            />
            <TextInput
              style={[styles.input, { width: 100 }]}
              placeholder="HH:MM"
              value={time}
              onChangeText={setTime}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Lugar · Opcional</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Cancha Municipal"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={[styles.section, styles.switchRow]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Buscar equipo rival</Text>
            <Text style={styles.hint}>
              {seekingOpponent ? 'Otros equipos podrán unirse.' : 'Personas individuales podrán unirse.'}
            </Text>
          </View>
          <Switch
            value={seekingOpponent}
            onValueChange={(v) => { setSeekingOpponent(v); if (v) setSlotsNeeded(0); }}
          />
        </View>

        {seekingOpponent && (
          <View style={styles.section}>
            <View style={styles.chipsRow}>
              <TouchableOpacity
                style={[styles.chip, challengeMode === 'open' && styles.chipActive]}
                onPress={() => setChallengeMode('open')}
              >
                <Text style={[styles.chipText, challengeMode === 'open' && styles.chipTextActive]}>Abierto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, challengeMode === 'specific' && styles.chipActive]}
                onPress={() => setChallengeMode('specific')}
              >
                <Text style={[styles.chipText, challengeMode === 'specific' && styles.chipTextActive]}>
                  Equipo específico
                </Text>
              </TouchableOpacity>
            </View>

            {challengeMode === 'open' ? (
              <Text style={styles.hint}>Aparecerá en Social para que cualquier equipo se postule.</Text>
            ) : (
              <TouchableOpacity
                style={styles.opponentPicker}
                onPress={() => {
                  if (!squadId) {
                    Alert.alert('Falta el equipo', 'Elige primero qué equipo organiza el partido.');
                    return;
                  }
                  setSelectOpponentOpen(true);
                }}
              >
                {targetTeam ? (
                  <>
                    <View style={styles.opponentAvatar}>
                      <Text style={styles.opponentAvatarText}>{targetTeam.name.slice(0, 2).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.opponentName}>{targetTeam.name}</Text>
                  </>
                ) : (
                  <Text style={styles.hint}>Toca para elegir a quién retar</Text>
                )}
                <Ionicons name="chevron-forward" size={18} color="#6B7A70" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {!seekingOpponent && (
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Jugadores sueltos que faltan</Text>
            <Text style={styles.hint}>Si ya tienes casi el equipo completo pero faltan algunos.</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setSlotsNeeded((n) => Math.max(0, n - 1))}
              >
                <Ionicons name="remove" size={18} color="#0D0D0D" />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{slotsNeeded}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setSlotsNeeded((n) => Math.min(30, n + 1))}
              >
                <Ionicons name="add" size={18} color="#0D0D0D" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!seekingOpponent && (
          <View style={[styles.section, styles.switchRow]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Dejar que el equipo se una libremente</Text>
              <Text style={styles.hint}>Le llega notificación a todo el plantel con botón de unirse.</Text>
            </View>
            <Switch value={openJoin} onValueChange={setOpenJoin} />
          </View>
        )}

        {!seekingOpponent && !openJoin && (
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Elige quién juega</Text>
            {otherMembers.map((m) => {
              const active = selectedIds.has(m.player_id);
              return (
                <TouchableOpacity
                  key={m.player_id}
                  style={styles.memberRow}
                  onPress={() => toggleSelected(m.player_id)}
                >
                  <View style={[styles.checkbox, active && styles.checkboxActive]}>
                    {active && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  <Text style={styles.memberName}>{m.full_name}</Text>
                </TouchableOpacity>
              );
            })}
            {otherMembers.length === 0 && (
              <Text style={styles.hint}>No hay más jugadores en el equipo todavía.</Text>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={saving}>
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.createBtnText}>{rematchTeamId ? 'Enviar revancha' : 'Crear partido'}</Text>
          }
        </TouchableOpacity>
      </ScrollView>

      {squadId && (
        <SelectOpponentModal
          visible={selectOpponentOpen}
          onClose={() => setSelectOpponentOpen(false)}
          squadId={squadId}
          onSelect={(team) => { setTargetTeam(team); setSelectOpponentOpen(false); }}
        />
      )}
    </SafeAreaView>
  );
}
