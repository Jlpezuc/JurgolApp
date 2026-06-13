import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from './useSession';

export type Player = {
  id: string;
  user_id: string;
  full_name: string;
  position: string | null;
  birth_date: string | null;
  photo_url: string | null;
};

export function usePlayer() {
  const { session } = useSession();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user.id) {
      setLoading(false);
      return;
    }
    supabase
      .from('players')
      .select('*')
      .eq('user_id', session.user.id)
      .single()
      .then(({ data }) => {
        setPlayer(data);
        setLoading(false);
      });
  }, [session?.user.id]);

  return { player, loading };
}
