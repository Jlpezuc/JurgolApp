import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePlayer } from '@/hooks/usePlayer';
import { pickSquareImage, uploadImage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { styles } from '../edit-profile/edit-profile.styles';

export default function EditTeamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { player } = usePlayer();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [createdBy, setCreatedBy] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('teams')
      .select('name, description, logo_url, created_by')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setName(data.name ?? '');
          setDescription(data.description ?? '');
          setLogoUrl(data.logo_url ?? null);
          setCreatedBy(data.created_by ?? null);
        }
        setLoading(false);
      });
  }, [id]);

  const isCaptain = !!player && createdBy === player.id;

  async function handlePickLogo() {
    try {
      const image = await pickSquareImage();
      if (!image) return;
      setUploadingLogo(true);
      const url = await uploadImage(image, `teams/${id}`);
      setLogoUrl(url);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo subir el logo.');
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Falta el nombre', 'El equipo necesita un nombre.');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('teams')
      .update({
        name: name.trim(),
        description: description.trim() || null,
        logo_url: logoUrl,
      })
      .eq('id', id);
    setSaving(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    router.back();
  }

  function confirmDelete() {
    Alert.alert(
      'Eliminar equipo',
      `Se eliminará "${name}" con todos sus partidos, mensajes y miembros. Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: handleDelete },
      ]
    );
  }

  async function handleDelete() {
    setSaving(true);
    const { error } = await supabase.rpc('delete_team', { p_team_id: id });
    setSaving(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    Alert.alert('Equipo eliminado', 'El equipo y todos sus datos fueron eliminados.', [
      { text: 'OK', onPress: () => router.dismissTo('/(tabs)/squads') },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color="#0D0D0D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar equipo</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.avatarWrap} onPress={handlePickLogo} disabled={uploadingLogo}>
          <View style={styles.avatar}>
            {uploadingLogo ? (
              <ActivityIndicator color="#fff" />
            ) : logoUrl ? (
              <Image source={{ uri: logoUrl }} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <Text style={styles.avatarInitials}>{name.slice(0, 2).toUpperCase() || '??'}</Text>
            )}
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.avatarHint}>Toca para cambiar el logo</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Nombre del equipo</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} autoCapitalize="words" />
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>
            Descripción <Text style={styles.optional}>(opcional)</Text>
          </Text>
          <TextInput
            style={[styles.input, { minHeight: 88, textAlignVertical: 'top' }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Ej: Jugamos los martes en la cancha del barrio"
            placeholderTextColor="#98A39C"
            multiline
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Guardar cambios</Text>}
        </TouchableOpacity>

        {isCaptain && (
          <>
            <View style={styles.sectionDivider} />
            <TouchableOpacity style={styles.dangerBtn} onPress={confirmDelete} disabled={saving}>
              <Text style={styles.dangerBtnText}>ELIMINAR EQUIPO</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
