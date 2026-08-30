import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { usePlayer } from './usePlayer';

export type PlayerMatchStats = {
  played: number;
  winRate: number | null;
  mvps: number;
};

export function usePlayerMatchStats() {
  const { player } = usePlayer();
  const [stats, setStats] = useState<PlayerMatchStats>({ played: 0, winRate: null, mvps: 0 });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!player?.id) { setLoading(false); return; }

    const { data } = await supabase
      .from('match_players')
      .select('mvp, team_side, matches!inner(status, score_home, score_away)')
      .eq('player_id', player.id)
      .eq('status', 'confirmed')
      .eq('matches.status', 'played');

    const rows = (data ?? []) as unknown as {
      mvp: boolean;
      team_side: string;
      matches: { score_home: number | null; score_away: number | null };
    }[];

    const played = rows.length;
    const mvps = rows.filter((r) => r.mvp).length;
    const wins = rows.filter((r) => {
      const { score_home, score_away } = r.matches;
      if (score_home == null || score_away == null) return false;
      const mine = r.team_side === 'home' ? score_home : score_away;
      const theirs = r.team_side === 'home' ? score_away : score_home;
      return mine > theirs;
    }).length;

    setStats({
      played,
      winRate: played > 0 ? Math.round((wins / played) * 100) : null,
      mvps,
    });
    setLoading(false);
  }, [player?.id]);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  return { stats, loading };
}
