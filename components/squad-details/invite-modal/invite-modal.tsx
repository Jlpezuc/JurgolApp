import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import { Color } from '@/constants/design';
import { styles } from './invite-modal.styles';

// ── Share options ────────────────────────────────────────────────────────────

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const SHARE_OPTIONS: {
  key: string;
  icon: IoniconName;
  iconColor: string;
  bgColor: string;
  label: string;
  subLabel: string;
}[] = [
  { key: 'imessage', icon: 'chatbubble',     iconColor: '#FFFFFF', bgColor: '#34C759', label: 'Mensaje', subLabel: 'iMessage' },
  { key: 'email',    icon: 'mail',           iconColor: '#FFFFFF', bgColor: Color.sky,  label: 'Email',   subLabel: 'correo' },
  { key: 'whatsapp', icon: 'logo-whatsapp',  iconColor: '#FFFFFF', bgColor: '#25D366', label: 'Chat',    subLabel: 'WhatsApp' },
  { key: 'more',     icon: 'share-social',   iconColor: '#FFFFFF', bgColor: Color.pitch, label: 'Más',   subLabel: 'otros' },
];

// ── Props ────────────────────────────────────────────────────────────────────

type Props = {
  visible: boolean;
  onClose: () => void;
  teamName: string;
  teamInitials: string;
  playerCount: number;
  maxPlayers?: number;
};

// ── Component ────────────────────────────────────────────────────────────────

export function InvitePlayerModal({
  visible,
  onClose,
  teamName,
  teamInitials,
  playerCount,
  maxPlayers = 15,
}: Props) {
  const [nickname, setNickname] = useState('');

  const slug = teamName.toLowerCase().replace(/\s+/g, '-');
  const inviteUrl = `jurgol.app/inv/${slug}`;
  const truncatedUrl = inviteUrl.length > 28 ? inviteUrl.slice(0, 28) + '…' : inviteUrl;

  const hasNickname = nickname.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          {/* ── Header ───────────────────────────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.eyebrow}>INVITACIÓN</Text>
              <Text style={styles.title}>¿A quién invitas?</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={Color.fg2} />
            </Pressable>
          </View>

          {/* ── Team card ────────────────────────────────────────────── */}
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
              {' / '}
              {maxPlayers}
            </Text>
          </View>

          {/* ── Nickname search ──────────────────────────────────────── */}
          <Text style={styles.sectionLabel}>NICKNAME EN JURGOL</Text>
          <View style={styles.searchInput}>
            <Text style={styles.searchAt}>@</Text>
            <TextInput
              placeholder="buscar nickname"
              placeholderTextColor={Color.fg4}
              value={nickname}
              onChangeText={setNickname}
              style={styles.searchInputText}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* ── Divider ──────────────────────────────────────────────── */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O COMPARTIR POR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Share buttons ────────────────────────────────────────── */}
          <View style={styles.shareRow}>
            {SHARE_OPTIONS.map((opt) => (
              <Pressable key={opt.key} style={styles.shareBtn}>
                <View style={[styles.shareIcon, { backgroundColor: opt.bgColor }]}>
                  <Ionicons name={opt.icon} size={24} color={opt.iconColor} />
                </View>
                <Text style={styles.shareLabel}>{opt.label}</Text>
                <Text style={styles.shareSubLabel}>{opt.subLabel}</Text>
              </Pressable>
            ))}
          </View>

          {/* ── Link card ────────────────────────────────────────────── */}
          <View style={styles.linkCard}>
            <View style={styles.linkIconWrap}>
              <Ionicons name="link" size={16} color={Color.fg3} />
            </View>
            <View style={styles.linkInfo}>
              <Text style={styles.linkLabel}>LINK DE INVITACIÓN</Text>
              <Text style={styles.linkUrl} numberOfLines={1}>
                {truncatedUrl}
              </Text>
            </View>
            <Pressable style={styles.copyBtn}>
              <Ionicons name="copy-outline" size={13} color={Color.chalk} />
              <Text style={styles.copyBtnText}>Copiar</Text>
            </Pressable>
          </View>

          {/* ── CTA ──────────────────────────────────────────────────── */}
          <Pressable
            style={[styles.ctaBtn, hasNickname && styles.ctaBtnActive]}
            disabled={!hasNickname}
          >
            <Text style={[styles.ctaBtnText, hasNickname && styles.ctaBtnTextActive]}>
              {hasNickname ? `Invitar a @${nickname.trim()}` : 'Invitar a ...'}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={hasNickname ? Color.chalk : Color.fg3}
            />
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
