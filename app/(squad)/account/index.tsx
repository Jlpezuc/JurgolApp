import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/hooks/useSession';
import { supabase } from '@/lib/supabase';
import { styles } from '../edit-profile/edit-profile.styles';

export default function AccountScreen() {
  const { session } = useSession();

  const [email, setEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const currentEmail = session?.user.email ?? '—';

  async function handleChangeEmail() {
    const clean = email.trim().toLowerCase();
    if (!clean) {
      Alert.alert('Falta el correo', 'Ingresa el nuevo correo electrónico.');
      return;
    }
    if (clean === currentEmail.toLowerCase()) {
      Alert.alert('Es el mismo correo', 'Ingresa uno distinto al actual.');
      return;
    }

    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: clean });
    setSavingEmail(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setEmail('');
    Alert.alert(
      'Confirma el cambio',
      `Te enviamos un correo a ${clean}. El cambio se aplica recién cuando abras ese enlace.`
    );
  }

  async function handleChangePassword() {
    if (password.length < 6) {
      Alert.alert('Contraseña muy corta', 'Debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Las contraseñas no coinciden', 'Revisa que ambas sean iguales.');
      return;
    }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSavingPassword(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setPassword('');
    setConfirmPassword('');
    Alert.alert('Contraseña actualizada', 'Tu nueva contraseña ya está activa.');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color="#0D0D0D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cuenta y seguridad</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Correo actual</Text>
          <View style={[styles.input, styles.inputDisabled]}>
            <Text style={styles.disabledText}>{currentEmail}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Nuevo correo</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="nuevo@correo.com"
            placeholderTextColor="#98A39C"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          <Text style={styles.hint}>
            Tendrás que confirmar el cambio desde un enlace enviado al correo nuevo.
          </Text>
          <TouchableOpacity style={styles.saveBtn} onPress={handleChangeEmail} disabled={savingEmail}>
            {savingEmail ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Cambiar correo</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Nueva contraseña</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#98A39C"
            secureTextEntry
          />

          <Text style={styles.fieldLabel}>Repetir contraseña</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repite la nueva contraseña"
            placeholderTextColor="#98A39C"
            secureTextEntry
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword} disabled={savingPassword}>
            {savingPassword ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Cambiar contraseña</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
