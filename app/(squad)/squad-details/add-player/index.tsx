import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Color, Space } from '@/constants/design';
import { ALL_SQUADS, PlayerPosition, SQUAD_DETAIL_MOCK } from '@/constants/squads.mocks';
import { styles } from './add-player.styles';
import { InvitePlayerModal } from '@/components/squad-details/invite-modal/invite-modal';

// ── Position config ──────────────────────────────────────────────────────────

const POSITIONS: { key: PlayerPosition; short: string; label: string }[] = [
  { key: PlayerPosition.PO,  short: 'PO',  label: 'Arquero' },
  { key: PlayerPosition.DEF, short: 'DEF', label: 'Defensa' },
  { key: PlayerPosition.MC,  short: 'MC',  label: 'Mediocampo' },
  { key: PlayerPosition.DEL, short: 'DEL', label: 'Delantero' },
];

// Decorative stats by position — shown on the card preview
const STATS_BY_POSITION: Record<
  PlayerPosition,
  { rating: number; stats: [string, number][] }
> = {
  [PlayerPosition.PO]:  { rating: 70, stats: [['PAC', 62], ['TIR', 38], ['PAS', 55], ['REG', 50], ['DEF', 78], ['FÍS', 72]] },
  [PlayerPosition.DEF]: { rating: 73, stats: [['PAC', 70], ['TIR', 55], ['PAS', 68], ['REG', 65], ['DEF', 82], ['FÍS', 78]] },
  [PlayerPosition.MC]:  { rating: 71, stats: [['PAC', 72], ['TIR', 68], ['PAS', 78], ['REG', 75], ['DEF', 65], ['FÍS', 70]] },
  [PlayerPosition.DEL]: { rating: 74, stats: [['PAC', 80], ['TIR', 82], ['PAS', 68], ['REG', 78], ['DEF', 50], ['FÍS', 72]] },
};

// ── Card preview ─────────────────────────────────────────────────────────────

type CardProps = {
  name: string;
  imageUri: string | null;
  position: PlayerPosition;
  teamInitials: string;
  onPressPhoto: () => void;
};

function PlayerCard({ name, imageUri, position, teamInitials, onPressPhoto }: CardProps) {
  const config = STATS_BY_POSITION[position];
  const displayName = name.trim().toUpperCase();

  return (
    <Pressable style={styles.card} onPress={onPressPhoto}>
      <View style={styles.cardGlowTop} />

      <View style={styles.cardTopRow}>
        <View>
          <Text style={styles.cardRating}>{config.rating}</Text>
          <Text style={styles.cardRatingLabel}>{position}</Text>
        </View>
        <View style={styles.cardTeamBadge}>
          <Text style={styles.cardTeamBadgeText}>{teamInitials}</Text>
          <Text style={styles.cardTeamBadgePlus}>+</Text>
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

      <View style={styles.cardDivider} />

      <View style={styles.cardStats}>
        {config.stats.map(([label, value]) => (
          <View key={label} style={styles.cardStat}>
            <Text style={styles.cardStatValue}>{value}</Text>
            <Text style={styles.cardStatLabel}>{label}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────

export default function AddPlayerScreen() {
  const insets = useSafeAreaInsets();
  const { squadId } = useLocalSearchParams<{ squadId?: string }>();
  const squad = ALL_SQUADS.find((s) => s.id === squadId) ?? ALL_SQUADS[0];

  const [name, setName] = useState('');
  const [position, setPosition] = useState<PlayerPosition>(PlayerPosition.MC);
  const [number, setNumber] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  const canSave = name.trim().length > 0;
  const teamInitials = squad.name.slice(0, 2).toUpperCase();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Pressable style={styles.headerBack} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={Color.fg1} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEyebrow}>{squad.name.toUpperCase()}</Text>
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
            imageUri={imageUri}
            position={position}
            teamInitials={teamInitials}
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

            <Text style={styles.fieldLabel}>Posición</Text>
            <View style={styles.positionRow}>
              {POSITIONS.map((p) => {
                const isActive = position === p.key;
                return (
                  <Pressable
                    key={p.key}
                    style={[styles.positionBtn, isActive && styles.positionBtnActive]}
                    onPress={() => setPosition(p.key)}
                  >
                    <Text style={[styles.positionShort, isActive && styles.positionShortActive]}>
                      {p.short}
                    </Text>
                    <Text style={[styles.positionLabel, isActive && styles.positionLabelActive]}>
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
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
              style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
              disabled={!canSave}
              onPress={() => router.back()}
            >
              <Text style={styles.saveBtnText}>Añadir jugador</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <InvitePlayerModal
        visible={inviteOpen}
        onClose={() => setInviteOpen(false)}
        teamName={squad.name}
        teamInitials={teamInitials}
        playerCount={SQUAD_DETAIL_MOCK.players.length}
        maxPlayers={15}
      />
    </View>
  );
}
