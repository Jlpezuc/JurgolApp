import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Color, Space } from '@/constants/design';
import { supabase } from '@/lib/supabase';
import { styles } from './register-result-sheet.styles';

type Participant = { player_id: string; full_name: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  matchId: string;
  homeName: string;
  awayName: string;
  participants: Participant[];
  onSaved: () => void;
  /** Who is reporting — stored so the rival knows who to confirm against. */
  reporterPlayerId: string | null;
  /** Rival team, when there is one. Its absence means no confirmation step. */
  opponentTeamId?: string | null;
  /** Rival captain, notified to confirm the reported score. */
  opponentCaptainId?: string | null;
};

export function RegisterResultSheet({
  visible,
  onClose,
  matchId,
  homeName,
  awayName,
  participants,
  onSaved,
  reporterPlayerId,
  opponentTeamId,
  opponentCaptainId,
}: Props) {
  const [scoreHome, setScoreHome] = useState('');
  const [scoreAway, setScoreAway] = useState('');
  const [mvpId, setMvpId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function reset() {
    setScoreHome('');
    setScoreAway('');
    setMvpId(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSave() {
    if (scoreHome === '' || scoreAway === '') {
      Alert.alert('Falta el marcador', 'Ingresa el resultado de ambos equipos.');
      return;
    }
    if (!reporterPlayerId) return;
    setSaving(true);

    // With a rival team involved the score is only a *proposal* until they confirm
    // it — the match stays 'scheduled', so the Elo trigger doesn't fire yet.
    // Matches without an away team have nobody to confirm, so they close directly.
    const needsConfirmation = !!opponentTeamId;

    const { error } = await supabase
      .from('matches')
      .update({
        status: needsConfirmation ? 'scheduled' : 'played',
        score_home: parseInt(scoreHome, 10),
        score_away: parseInt(scoreAway, 10),
        score_reported_by: reporterPlayerId,
        score_confirmed: !needsConfirmation,
      })
      .eq('id', matchId);

    if (error) {
      setSaving(false);
      Alert.alert('Error', error.message);
      return;
    }

    if (mvpId) {
      await supabase
        .from('match_players')
        .update({ mvp: true })
        .eq('match_id', matchId)
        .eq('player_id', mvpId);
    }

    if (needsConfirmation && opponentCaptainId) {
      await supabase.from('notifications').insert({
        recipient_player_id: opponentCaptainId,
        type: 'result_reported',
        message: `Se reportó ${scoreHome}-${scoreAway} en el partido ${homeName} vs ${awayName}. Confirma si es correcto.`,
        match_id: matchId,
      });
    }

    setSaving(false);
    onSaved();
    handleClose();

    Alert.alert(
      needsConfirmation ? 'Resultado enviado' : 'Resultado guardado',
      needsConfirmation
        ? 'El rival tiene que confirmarlo para que quede oficial y se actualice el Elo.'
        : 'El partido quedó registrado.'
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Cargar resultado</Text>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={20} color={Color.fg2} />
            </Pressable>
          </View>

          <View style={styles.scoreRow}>
            <View style={styles.scoreCol}>
              <Text style={styles.teamLabel} numberOfLines={1}>{homeName}</Text>
              <TextInput
                style={styles.scoreInput}
                keyboardType="number-pad"
                maxLength={2}
                value={scoreHome}
                onChangeText={(v) => setScoreHome(v.replace(/[^0-9]/g, ''))}
                placeholder="0"
                placeholderTextColor={Color.fg4}
              />
            </View>
            <Text style={styles.dash}>–</Text>
            <View style={styles.scoreCol}>
              <Text style={styles.teamLabel} numberOfLines={1}>{awayName}</Text>
              <TextInput
                style={styles.scoreInput}
                keyboardType="number-pad"
                maxLength={2}
                value={scoreAway}
                onChangeText={(v) => setScoreAway(v.replace(/[^0-9]/g, ''))}
                placeholder="0"
                placeholderTextColor={Color.fg4}
              />
            </View>
          </View>

          {participants.length > 0 && (
            <View style={{ gap: Space.s2 }}>
              <Text style={styles.sectionLabel}>MVP DEL PARTIDO · OPCIONAL</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Space.s2 }}>
                {participants.map((p) => {
                  const active = mvpId === p.player_id;
                  return (
                    <Pressable
                      key={p.player_id}
                      onPress={() => setMvpId(active ? null : p.player_id)}
                      style={[styles.mvpChip, active && styles.mvpChipActive]}
                    >
                      <Text style={[styles.mvpChipText, active && styles.mvpChipTextActive]} numberOfLines={1}>
                        {p.full_name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator color={Color.chalk} />
              : <Text style={styles.saveBtnText}>Guardar resultado</Text>
            }
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
