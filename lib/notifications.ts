import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

/**
 * Notifications in this app come in two flavours:
 *
 * - **Local reminders** (`scheduleMatchReminder`) — scheduled on the device for
 *   matches the player is confirmed in. These work everywhere, Expo Go included.
 * - **Remote push** (`registerForPushNotifications`) — stores an Expo push token on
 *   `players.push_token` so a server can push later. Getting a token requires a
 *   development build: Expo Go dropped remote-push support on Android in SDK 53,
 *   so there this fails softly and the app keeps working with local reminders only.
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const REMINDER_HOURS_BEFORE = 3;

async function ensurePermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Partidos',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
}

/**
 * Schedules a one-off reminder N hours before kickoff. No-op if that moment has
 * already passed. Returns the scheduled notification id (stored so it can be
 * cancelled if the player leaves the match or it gets cancelled).
 */
export async function scheduleMatchReminder(
  matchId: string,
  date: string,
  title: string,
  body: string
): Promise<string | null> {
  if (!(await ensurePermission())) return null;
  await ensureAndroidChannel();

  const fireAt = new Date(new Date(date).getTime() - REMINDER_HOURS_BEFORE * 3600 * 1000);
  if (fireAt.getTime() <= Date.now()) return null;

  return Notifications.scheduleNotificationAsync({
    content: { title, body, data: { matchId } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireAt,
    },
  });
}

/** Cancels every pending reminder tied to a given match. */
export async function cancelMatchReminders(matchId: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.matchId === matchId)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

/**
 * Asks for permission and saves an Expo push token on the player row.
 * Fails softly (returns null) in Expo Go / simulators, where remote push isn't available.
 */
export async function registerForPushNotifications(playerId: string): Promise<string | null> {
  if (!Device.isDevice) return null;
  if (!(await ensurePermission())) return null;
  await ensureAndroidChannel();

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync();
    if (!token) return null;
    await supabase.from('players').update({ push_token: token }).eq('id', playerId);
    return token;
  } catch {
    // Expo Go on Android (SDK 53+) has no remote-push support — local reminders still work.
    return null;
  }
}
