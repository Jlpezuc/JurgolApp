import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePlayer } from '@/hooks/usePlayer';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/lib/supabase';
import { styles } from './edit-profile.styles';

export default function EditProfileScreen() {
  const { player, refresh } = usePlayer();
  const { session } = useSession();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!player || loaded) return;
    setFullName(player.full_name ?? '');
    setUsername(player.username ?? '');
    setPhone(player.phone ?? '');
    setLoaded(true);
  }, [player, loaded]);

  async function handleSave() {
    if (!player) return;
    if (!fullName.trim()) {
      Alert.alert('Falta el nombre', 'Tu nombre completo no puede quedar vacío.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      Alert.alert('Falta el username', 'Elige un username para que te puedan encontrar.');
      return;
    }
    if (/\s/.test(cleanUsername)) {
      Alert.alert('Username inválido', 'No puede tener espacios.');
      return;
    }

    setSaving(true);

    if (cleanUsername !== player.username) {
      const { data: existing } = await supabase
        .from('players')
        .select('id')
        .ilike('username', cleanUsername)
        .neq('id', player.id)
        .maybeSingle();

      if (existing) {
        setSaving(false);
        Alert.alert('Username ocupado', 'Elige otro username.');
        return;
      }
    }

    const { error } = await supabase
      .from('players')
      .update({
        full_name: fullName.trim(),
        username: cleanUsername,
        phone: phone.trim() || null,
      })
      .eq('id', player.id);

    setSaving(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    await refresh();
    router.back();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color="#0D0D0D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Username</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputPrefix}>@</Text>
            <TextInput
              style={[styles.input, styles.inputWithPrefix]}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Correo electrónico</Text>
          <View style={[styles.input, styles.inputDisabled]}>
            <Text style={styles.disabledText}>{session?.user.email ?? '—'}</Text>
          </View>
          <Text style={styles.hint}>El correo no se puede cambiar desde aquí.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>
            Teléfono <Text style={styles.optional}>(opcional)</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Ej: +56 9 1234 5678"
            placeholderTextColor="#98A39C"
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Guardar cambios</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
