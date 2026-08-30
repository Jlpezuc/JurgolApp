import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { supabase } from '@/lib/supabase';
import { styles } from './signup.styles';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername) {
      Alert.alert('Falta el username', 'Elige un username, lo usarán para encontrarte.');
      return;
    }
    if (/\s/.test(cleanUsername)) {
      Alert.alert('Username inválido', 'No puede tener espacios.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Falta el correo', 'Ingresa tu correo electrónico.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña muy corta', 'Debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Las contraseñas no coinciden', 'Revisa que ambas sean iguales.');
      return;
    }

    setLoading(true);

    const { data: existing } = await supabase
      .from('players')
      .select('id')
      .ilike('username', cleanUsername)
      .maybeSingle();

    if (existing) {
      setLoading(false);
      Alert.alert('Username ocupado', 'Elige otro username.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() || undefined } },
    });

    if (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
      return;
    }

    if (data.user) {
      await supabase
        .from('players')
        .update({ username: cleanUsername, phone: phone.trim() || null })
        .eq('user_id', data.user.id);
    }

    setLoading(false);

    Alert.alert(
      'Cuenta creada',
      data.session ? '¡Bienvenido a JurgolApp!' : 'Revisa tu correo para confirmar tu cuenta antes de entrar.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color="#0D0D0D" />
        </TouchableOpacity>

        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>El username es lo que otros usarán para encontrarte.</Text>

        <View style={styles.form}>
          <Text style={styles.fieldLabel}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="ej: jlopez10"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.fieldLabel}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@correo.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.fieldLabel}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.fieldLabel}>Repetir contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Text style={styles.fieldLabel}>
            Nombre completo <Text style={styles.optional}>(opcional)</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Juan López"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          <Text style={styles.fieldLabel}>
            Teléfono <Text style={styles.optional}>(opcional)</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: +56 9 1234 5678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Registrarme</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
