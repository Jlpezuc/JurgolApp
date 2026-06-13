import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { usePlayer } from '@/hooks/usePlayer';
import { styles } from './create-team.styles';

const TEAM_COLORS = [
  { id: 'forest',  hex: '#1A7A3C' },
  { id: 'gold',    hex: '#D4A017' },
  { id: 'sky',     hex: '#3B82F6' },
  { id: 'crimson', hex: '#DC2626' },
  { id: 'slate',   hex: '#1E293B' },
  { id: 'lime',    hex: '#22C55E' },
];

const MODALITIES = [
  { id: '5v5',   label: '5v5',   sub: 'Futbolito' },
  { id: '7v7',   label: '7v7',   sub: 'Cancha 7'  },
  { id: '11v11', label: '11v11', sub: 'Full'       },
];

const MAX_NAME = 40;

export default function CreateTeamScreen() {
  const { player } = usePlayer();
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(TEAM_COLORS[0].id);
  const [selectedModality, setSelectedModality] = useState(MODALITIES[1].id);
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'Necesitamos acceso a tu galería para subir el logo del equipo.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setLogoUri(result.assets[0].uri);
    }
  }

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert('Falta el nombre', 'Por favor ingresa un nombre para el equipo.');
      return;
    }
    if (!player) {
      Alert.alert('Error', 'No se encontró tu perfil de jugador.');
      return;
    }

    setLoading(true);

    const { data: team, error } = await supabase
      .from('teams')
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        created_by: player.id,
      })
      .select()
      .single();

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
      return;
    }

    // Add creator as captain in team_members
    await supabase.from('team_members').insert({
      team_id: team.id,
      player_id: player.id,
      role: 'captain',
    });

    setLoading(false);
    router.back();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color="#0D0D0D" />
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerSub}>Nuevo equipo</Text>
          <Text style={styles.headerTitle}>Crear equipo</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoSection}>
            <TouchableOpacity style={styles.logoCircle} onPress={pickImage} activeOpacity={0.7}>
              {logoUri ? (
                <Image source={{ uri: logoUri }} style={styles.logoImage} />
              ) : (
                <Ionicons name="image-outline" size={36} color="#BBBBBB" />
              )}
            </TouchableOpacity>
            <Text style={styles.logoLabel}>Logo · Opcional</Text>
          </View>

          {/* Name */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Nombre del equipo</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Los Galácticos del Barrio"
                placeholderTextColor="#BBBBBB"
                value={name}
                onChangeText={(t) => setName(t.slice(0, MAX_NAME))}
                maxLength={MAX_NAME}
                returnKeyType="next"
              />
              <Text style={styles.charCount}>{name.length}/{MAX_NAME}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Descripción · Opcional</Text>
            <TextInput
              style={[styles.textInput, { minHeight: 72, paddingRight: 16 }]}
              placeholder="Ej: Equipo del barrio, jugamos los sábados"
              placeholderTextColor="#BBBBBB"
              value={description}
              onChangeText={setDescription}
              multiline
              returnKeyType="done"
            />
          </View>

          {/* Color */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Color del equipo</Text>
            <View style={styles.colorRow}>
              {TEAM_COLORS.map((color) => {
                const active = color.id === selectedColor;
                return (
                  <TouchableOpacity
                    key={color.id}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color.hex },
                      active && styles.colorSwatchSelected,
                    ]}
                    onPress={() => setSelectedColor(color.id)}
                    activeOpacity={0.8}
                  >
                    {active && (
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Modality */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Modalidad favorita</Text>
            <View style={styles.modalityRow}>
              {MODALITIES.map((m) => {
                const active = m.id === selectedModality;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.modalityBtn, active && styles.modalityBtnActive]}
                    onPress={() => setSelectedModality(m.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.modalityLabel, active && styles.modalityLabelActive]}>
                      {m.label}
                    </Text>
                    <Text style={[styles.modalitySub, active && styles.modalitySubActive]}>
                      {m.sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Create button */}
        <TouchableOpacity style={styles.createBtn} onPress={handleCreate} activeOpacity={0.85} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.createBtnText}>Crear equipo</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
