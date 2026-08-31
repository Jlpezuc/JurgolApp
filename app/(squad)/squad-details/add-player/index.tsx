import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InvitePlayerModal } from '@/components/squad-details/invite-modal/invite-modal';
import { Color, Space } from '@/constants/design';
import { usePlayer } from '@/hooks/usePlayer';
import { PickedImage, pickSquareImage, uploadImage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { styles } from './add-player.styles';

// ── Card preview ─────────────────────────────────────────────────────────────

type CardProps = {
  name: string;
  imageUri: string | null;
  onPressPhoto: () => void;
};

function PlayerCard({ name, imageUri, onPressPhoto }: CardProps) {
  const displayName = name.trim().toUpperCase();

  return (
    <Pressable style={styles.card} onPress={onPressPhoto}>
      <View style={styles.cardGlowTop} />

      <View style={styles.cardTopRow}>
        <View>
          <Text style={styles.cardRating}>50</Text>
        </View>
      </View>

      <View style={styles.cardAvatarWrap}>
        <View style={styles.cardAvatarGlow} />
        <View style={styles.cardAvatar}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.cardAvatarImage} resizeMode="cover" />
          ) : (
            <Ionicons name="person" size={56} color="rgba(255,255,255,0.55)" />
          )}
        </View>
        <View style={styles.cardCameraBtn}>
          <Ionicons name="camera" size={16} color={Color.pitch} />
        </View>
      </View>

      <Text
        style={[styles.cardName, !displayName && styles.cardNamePlaceholder]}
        numberOfLines={1}
      >
        {displayName || 'TU NOMBRE'}
      </Text>
    </Pressable>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────

export default function AddPlayerScreen() {
  const insets = useSafeAreaInsets();
  const { squadId } = useLocalSearchParams<{ squadId?: string }>();
  const { player: currentPlayer } = usePlayer();

  const [teamName, setTeamName] = useState('');
  const [memberCount, setMemberCount] = useState(0);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [image, setImage] = useState<PickedImage | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!squadId) return;
    Promise.all([
      supabase.from('teams').select('name').eq('id', squadId).single(),
      supabase.from('team_members').select('id', { count: 'exact', head: true }).eq('team_id', squadId),
    ]).then(([{ data: t }, { count }]) => {
      if (t) setTeamName(t.name);
      setMemberCount(count ?? 0);
    });
  }, [squadId]);

  async function pickImage() {
    const picked = await pickSquareImage();
    if (picked) setImage(picked);
  }

  async function handleSave() {
    if (!squadId || !name.trim()) return;
    setSaving(true);

    const { data: player, error } = await supabase
      .from('players')
      .insert({ full_name: name.trim(), overall: 50 })
      .select('id')
      .single();

    if (error || !player) {
      Alert.alert('Error', error?.message ?? 'No se pudo crear el jugador.');
      setSaving(false);
      return;
    }

    // Photo is uploaded after the insert so it can be namespaced by the new player id.
    if (image) {
      try {
        const url = await uploadImage(image, `players/${player.id}`);
        await supabase.from('players').update({ photo_url: url }).eq('id', player.id);
      } catch {
        // Non-fatal: the player was created, just without a photo.
      }
    }

    await supabase.from('team_members').insert({
      team_id: squadId,
      player_id: player.id,
      role: 'player',
      jersey_number: number ? parseInt(number, 10) : null,
    });

    setSaving(false);

    Alert.alert(
      'Jugador añadido',
      `ID del jugador:\n${player.id}\n\nGuárdalo para añadirlo a otros equipos.`,
      [
        {
          text: 'Copiar ID',
          onPress: () => {
            Clipboard.setStringAsync(player.id);
            router.back();
          },
        },
        { text: 'Cerrar', onPress: () => router.back() },
      ]
    );
  }

  const canSave = name.trim().length > 0;
  const teamInitials = teamName.slice(0, 2).toUpperCase() || '??';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Pressable style={styles.headerBack} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={Color.fg1} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEyebrow}>{teamName.toUpperCase()}</Text>
          <Text style={styles.headerTitle}>Añadir jugador</Text>
        </View>
        <Pressable style={styles.headerInvite} onPress={() => setInviteOpen(true)}>
          <Ionicons name="mail-outline" size={18} color={Color.fgOnPitch} />
          <View style={styles.headerInviteDot} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + Space.s6 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Card preview ─────────────────────────────────────────────── */}
        <View style={styles.cardSection}>
          <PlayerCard
            name={name}
            imageUri={image?.uri ?? null}
            onPressPhoto={pickImage}
          />
          <Text style={styles.cardHint}>Toca la tarjeta para subir la foto</Text>
        </View>

        {/* ── Form ─────────────────────────────────────────────────────── */}
        <View style={styles.formContent}>
          <View style={styles.formCard}>
            <Text style={[styles.fieldLabel, styles.fieldLabelFirst]}>
              Nombre del jugador
            </Text>
            <View style={styles.input}>
              <TextInput
                placeholder="Ej: Luca Méndez"
                placeholderTextColor={Color.fg4}
                value={name}
                onChangeText={setName}
                style={styles.inputText}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <Text style={styles.fieldLabel}>
              Dorsal <Text style={styles.fieldLabelOptional}>(opcional)</Text>
            </Text>
            <View style={styles.input}>
              <TextInput
                placeholder="Ej: 10"
                placeholderTextColor={Color.fg4}
                value={number}
                onChangeText={(v) => setNumber(v.replace(/[^0-9]/g, ''))}
                style={styles.inputText}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>

            <Pressable
              style={[styles.saveBtn, (!canSave || saving) && styles.saveBtnDisabled]}
              disabled={!canSave || saving}
              onPress={handleSave}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveBtnText}>Añadir jugador</Text>
              }
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <InvitePlayerModal
        visible={inviteOpen}
        onClose={() => setInviteOpen(false)}
        teamName={teamName}
        teamInitials={teamInitials}
        playerCount={memberCount}
        maxPlayers={15}
        squadId={squadId ?? ''}
        currentPlayerId={currentPlayer?.id ?? ''}
        onPlayerAdded={() => { setMemberCount((c) => c + 1); router.back(); }}
      />
    </View>
  );
}
