import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Color, Space } from '@/constants/design';
import { supabase } from '@/lib/supabase';
import { styles } from './announce-modal.styles';

type Member = { player_id: string; full_name: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  members: Member[];
  onSent?: () => void;
};

export function AnnounceModal({ visible, onClose, teamId, teamName, members, onSent }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleClose() {
    setSelected(new Set());
    setMessage('');
    onClose();
  }

  async function handleSend() {
    if (!message.trim()) {
      Alert.alert('Falta el mensaje', 'Escribe qué quieres avisar.');
      return;
    }
    if (selected.size === 0) {
      Alert.alert('Elige destinatarios', 'Selecciona al menos un jugador.');
      return;
    }
    setSending(true);

    await supabase.from('notifications').insert(
      Array.from(selected).map((playerId) => ({
        recipient_player_id: playerId,
        type: 'announcement',
        message: message.trim(),
        team_id: teamId,
      }))
    );

    setSending(false);
    onSent?.();
    handleClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>{teamName.toUpperCase()}</Text>
              <Text style={styles.title}>Enviar aviso</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={handleClose}>
              <Ionicons name="close" size={20} color={Color.fg2} />
            </Pressable>
          </View>

          <View>
            <Text style={styles.sectionLabel}>MENSAJE</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Practicamos mañana a las 19hs"
              placeholderTextColor={Color.fg4}
              value={message}
              onChangeText={(v) => setMessage(v.slice(0, 200))}
              multiline
              maxLength={200}
            />
          </View>

          <View style={{ flex: 1, gap: Space.s2 }}>
            <View style={styles.destRow}>
              <Text style={styles.sectionLabel}>DESTINATARIOS</Text>
              <Pressable onPress={() => setSelected(new Set(members.map((m) => m.player_id)))}>
                <Text style={styles.selectAll}>Seleccionar todos</Text>
              </Pressable>
            </View>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {members.map((m) => {
                const active = selected.has(m.player_id);
                return (
                  <Pressable key={m.player_id} style={styles.memberRow} onPress={() => toggle(m.player_id)}>
                    <View style={[styles.checkbox, active && styles.checkboxActive]}>
                      {active && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                    <Text style={styles.memberName}>{m.full_name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <Pressable style={styles.sendBtn} onPress={handleSend} disabled={sending}>
            {sending
              ? <ActivityIndicator color={Color.chalk} />
              : <Text style={styles.sendBtnText}>Enviar a {selected.size || ''} jugador{selected.size === 1 ? '' : 'es'}</Text>
            }
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
