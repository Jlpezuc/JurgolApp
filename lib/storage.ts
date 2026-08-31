import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';

const BUCKET = 'avatars';

export type PickedImage = { uri: string; base64: string };

/**
 * Opens the gallery and returns a square-cropped image with its base64 payload
 * (needed to upload to Supabase Storage from React Native — `fetch(uri).blob()`
 * is unreliable on Android/Hermes).
 */
export async function pickSquareImage(): Promise<PickedImage | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.6,
    base64: true,
  });
  if (result.canceled) return null;

  const asset = result.assets[0];
  if (!asset.base64) return null;
  return { uri: asset.uri, base64: asset.base64 };
}

/**
 * Uploads a picked image to the public `avatars` bucket and returns its public URL.
 * `folder` namespaces the file (e.g. `players/<id>` or `teams/<id>`).
 */
export async function uploadImage(image: PickedImage, folder: string): Promise<string> {
  const isPng = image.uri.toLowerCase().endsWith('.png');
  const path = `${folder}/${Date.now()}.${isPng ? 'png' : 'jpg'}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, decode(image.base64), {
      contentType: isPng ? 'image/png' : 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
