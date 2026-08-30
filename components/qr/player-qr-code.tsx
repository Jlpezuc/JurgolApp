import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';
import { Color } from '@/constants/design';
import { styles } from './player-qr-code.styles';

export function playerQrPayload(playerId: string) {
  return `jurgolapp:player:${playerId}`;
}

type Props = {
  visible: boolean;
  onClose: () => void;
  playerId: string;
  playerName: string;
};

export function PlayerQrCodeModal({ visible, onClose, playerId, playerName }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={20} color={Color.fg2} />
          </Pressable>

          <Text style={styles.title}>Mi código QR</Text>
          <Text style={styles.subtitle}>Que otro capitán lo escanee para añadirte al equipo</Text>

          <View style={styles.qrWrapper}>
            <QRCode value={playerQrPayload(playerId)} size={200} color={Color.pitch} backgroundColor={Color.chalk} />
          </View>

          <Text style={styles.playerName}>{playerName}</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
