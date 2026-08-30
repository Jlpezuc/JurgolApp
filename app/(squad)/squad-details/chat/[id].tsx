import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Color } from '@/constants/design';
import { usePlayer } from '@/hooks/usePlayer';
import { supabase } from '@/lib/supabase';
import { styles } from './chat.styles';

type Message = {
  id: string;
  message: string;
  created_at: string;
  player_id: string;
  full_name: string;
};

export default function TeamChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { player } = usePlayer();
  const [teamName, setTeamName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const namesRef = useRef<Record<string, string>>({});
  const listRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    if (!id) return;

    const [{ data: team }, { data: members }, { data: msgs }] = await Promise.all([
      supabase.from('teams').select('name').eq('id', id).single(),
      supabase.from('team_members').select('player_id, players(full_name)').eq('team_id', id),
      supabase
        .from('team_messages')
        .select('id, message, created_at, player_id, players(full_name)')
        .eq('team_id', id)
        .order('created_at', { ascending: true }),
    ]);

    if (team) setTeamName(team.name);

    const names: Record<string, string> = {};
    (members ?? []).forEach((m: any) => { names[m.player_id] = m.players?.full_name ?? 'Jugador'; });
    namesRef.current = names;

    setMessages(
      (msgs ?? []).map((m: any) => ({
        id: m.id,
        message: m.message,
        created_at: m.created_at,
        player_id: m.player_id,
        full_name: m.players?.full_name ?? names[m.player_id] ?? 'Jugador',
      }))
    );
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`team_messages_${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'team_messages', filter: `team_id=eq.${id}` },
        (payload) => {
          const row = payload.new as { id: string; message: string; created_at: string; player_id: string };
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, {
              id: row.id,
              message: row.message,
              created_at: row.created_at,
              player_id: row.player_id,
              full_name: namesRef.current[row.player_id] ?? 'Jugador',
            }];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || !player?.id || !id) return;
    setDraft('');
    await supabase.from('team_messages').insert({ team_id: id, player_id: player.id, message: text });
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={Color.fg2} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{teamName || 'Chat'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 56}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={<Text style={styles.emptyText}>Aún no hay mensajes. ¡Escribe el primero!</Text>}
          renderItem={({ item }) => {
            const mine = item.player_id === player?.id;
            return (
              <View style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
                <View style={[styles.bubble, mine && styles.bubbleMine]}>
                  {!mine && <Text style={styles.senderName}>{item.full_name}</Text>}
                  <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.message}</Text>
                </View>
              </View>
            );
          }}
        />

        <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={Color.fg4}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <Pressable style={styles.sendBtn} onPress={handleSend} disabled={!draft.trim()}>
            <Ionicons name="send" size={18} color={Color.chalk} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
