import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { usePlayer } from './usePlayer';

export type NotificationType =
  | 'team_invitation'
  | 'player_removed'
  | 'match_created'
  | 'team_challenge'
  | 'announcement'
  | 'result_reported'
  | 'match_cancelled';

export type AppNotification = {
  id: string;
  type: NotificationType;
  message: string | null;
  is_read: boolean;
  created_at: string;
  team_member_id: string | null;
  match_id: string | null;
  team_id: string | null;
  team_member: {
    id: string;
    status: 'pending' | 'accepted' | 'rejected';
    team_id: string;
    team: {
      id: string;
      name: string;
      created_by: string;
      inviter: { full_name: string; username: string | null } | null;
    } | null;
  } | null;
  match: {
    id: string;
    date: string;
    modality: string;
    home_team_id: string;
    away_team_id: string | null;
    home_team: { name: string } | null;
    away_team: { name: string } | null;
  } | null;
  announce_team: { id: string; name: string } | null;
};

const SELECT = `
  id, type, message, is_read, created_at, team_member_id, match_id, team_id,
  team_member:team_members!notifications_team_member_id_fkey (
    id, status, team_id,
    team:teams!team_members_team_id_fkey (
      id, name, created_by,
      inviter:players!teams_created_by_fkey ( full_name, username )
    )
  ),
  match:matches!notifications_match_id_fkey (
    id, date, modality, home_team_id, away_team_id,
    home_team:teams!matches_home_team_id_fkey ( name ),
    away_team:teams!matches_away_team_id_fkey ( name )
  ),
  announce_team:teams!notifications_team_id_fkey ( id, name )
`;

export function useNotifications() {
  const { player } = usePlayer();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const playerId = player?.id;

  const refresh = useCallback(async () => {
    if (!playerId) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('notifications')
      .select(SELECT)
      .eq('recipient_player_id', playerId)
      .order('created_at', { ascending: false });

    setNotifications((data as unknown as AppNotification[]) ?? []);
    setLoading(false);
  }, [playerId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return { notifications, unreadCount, loading, refresh };
}
