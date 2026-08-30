import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Color } from '@/constants/design';
import { styles } from './qr-scanner-sheet.styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  onScanned: (playerId: string) => void;
};

export function QrScannerSheet({ visible, onClose, onScanned }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const handledRef = useRef(false);

  function handleBarcodeScanned({ data }: { data: string }) {
    if (handledRef.current) return;
    const match = data.match(/^jurgolapp:player:(.+)$/);
    if (!match) return;
    handledRef.current = true;
    onScanned(match[1]);
  }

  function handleClose() {
    handledRef.current = false;
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>Escanear QR</Text>
          <Pressable style={styles.closeBtn} onPress={handleClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={Color.chalk} />
          </Pressable>
        </View>

        {!permission ? (
          <View style={styles.centered} />
        ) : !permission.granted ? (
          <View style={styles.centered}>
            <Text style={styles.permissionText}>Necesitamos acceso a la cámara para escanear.</Text>
            <Pressable style={styles.permissionBtn} onPress={requestPermission}>
              <Text style={styles.permissionBtnText}>Dar permiso</Text>
            </Pressable>
          </View>
        ) : (
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarcodeScanned}
          >
            <View style={styles.frame} />
            <Text style={styles.hint}>Apunta al código QR del jugador</Text>
          </CameraView>
        )}
      </View>
    </Modal>
  );
}
