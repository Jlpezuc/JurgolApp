import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Color } from '@/constants/design';
import { supabase } from '@/lib/supabase';
import { styles } from './select-opponent-modal.styles';

type Opponent = {
  id: string;
  name: string;
  elo: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  squadId: string;
  onSelect: (opponent: { id: string; name: string; created_by: string }) => void;
};

export function SelectOpponentModal({ visible, onClose, squadId, onSelect }: Props) {
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [ownerById, setOwnerById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !squadId) return;
    setLoading(true);
    setErrorMsg(null);

    supabase
      .from('matches')
      .select(`
        home_team_id, away_team_id, score_home, score_away,
        home_team:teams!matches_home_team_id_fkey(id,name,elo,created_by),
        away_team:teams!matches_away_team_id_fkey(id,name,elo,created_by)
      `)
      .or(`home_team_id.eq.${squadId},away_team_id.eq.${squadId}`)
      .eq('status', 'played')
      .then(({ data, error }) => {
        if (error) {
          setErrorMsg(error.message);
          setOpponents([]);
          setLoading(false);
          return;
        }

        const byId = new Map<string, Opponent>();
        const owners: Record<string, string> = {};

        (data ?? []).forEach((m: any) => {
          const isHome = m.home_team_id === squadId;
          const opp = isHome ? m.away_team : m.home_team;
          const myScore = isHome ? m.score_home : m.score_away;
          const theirScore = isHome ? m.score_away : m.score_home;
          if (!opp || myScore == null || theirScore == null) return;

          owners[opp.id] = opp.created_by;

          const entry = byId.get(opp.id) ?? {
            id: opp.id, name: opp.name, elo: opp.elo, played: 0, won: 0, drawn: 0, lost: 0,
          };
          entry.played += 1;
          if (myScore === theirScore) entry.drawn += 1;
          else if (myScore > theirScore) entry.won += 1;
          else entry.lost += 1;
          byId.set(opp.id, entry);
        });

        setOwnerById(owners);
        setOpponents(Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name)));
        setLoading(false);
      });
  }, [visible, squadId]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>RETAR A UN EQUIPO</Text>
              <Text style={styles.title}>Equipos que has enfrentado</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={Color.fg2} />
            </Pressable>
          </View>

          {loading && <ActivityIndicator color={Color.grass500} style={{ marginTop: 24 }} />}

          {!loading && errorMsg && (
            <Text style={styles.emptyText}>No pudimos cargar tus rivales: {errorMsg}</Text>
          )}

          {!loading && !errorMsg && opponents.length === 0 && (
            <Text style={styles.emptyText}>Aún no te has enfrentado a ningún equipo.</Text>
          )}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {opponents.map((o) => (
              <Pressable
                key={o.id}
                style={styles.card}
                onPress={() => onSelect({ id: o.id, name: o.name, created_by: ownerById[o.id] })}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{o.name.slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.teamName}>{o.name}</Text>
                    <Text style={styles.eloText}>ELO {o.elo}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Color.fg4} />
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{o.played}</Text>
                    <Text style={styles.statLabel}>PJ</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, styles.statValueWon]}>{o.won}</Text>
                    <Text style={styles.statLabel}>PG</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{o.drawn}</Text>
                    <Text style={styles.statLabel}>PE</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, styles.statValueLost]}>{o.lost}</Text>
                    <Text style={styles.statLabel}>PP</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
