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
};

export function RegisterResultSheet({
  visible,
  onClose,
  matchId,
  homeName,
  awayName,
  participants,
  onSaved,
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
    setSaving(true);

    const { error } = await supabase
      .from('matches')
      .update({
        status: 'played',
        score_home: parseInt(scoreHome, 10),
        score_away: parseInt(scoreAway, 10),
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

    setSaving(false);
    onSaved();
    handleClose();
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
