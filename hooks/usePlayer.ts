import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from './useSession';

export type Player = {
  id: string;
  user_id: string;
  full_name: string;
  username: string | null;
  phone: string | null;
  birth_date: string | null;
  photo_url: string | null;
  overall: number | null;
};

export function usePlayer() {
  const { session } = useSession();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session?.user.id) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    setPlayer(data);
    setLoading(false);
  }, [session?.user.id]);

  useEffect(() => { refresh(); }, [refresh]);

  return { player, loading, refresh };
}
