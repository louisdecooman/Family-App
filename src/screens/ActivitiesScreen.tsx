import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { addActivity, deleteActivity, listActivities } from '../api';
import { supabase } from '../supabase';
import { Activity, Family } from '../types';

export default function ActivitiesScreen({ family }: { family: Family }) {
  const [items, setItems] = useState<Activity[]>([]);
  const [title, setTitle] = useState('');
  const [who, setWho] = useState('');
  const [note, setNote] = useState('');

  const refresh = useCallback(
    () => listActivities(family.id).then(setItems).catch((e) => Alert.alert('Laden mislukt', e.message)),
    [family.id],
  );

  useEffect(() => {
    refresh();
    // Realtime: nieuwe activiteiten van andere gezinsleden verschijnen meteen.
    const channel = supabase
      .channel(`activities-${family.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities', filter: `family_id=eq.${family.id}` }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [family.id, refresh]);

  const add = async () => {
    if (!title.trim()) return;
    try {
      await addActivity(family.id, { title: title.trim(), who: who.trim(), note: note.trim() });
      setTitle(''); setNote('');
      refresh();
    } catch (e) { Alert.alert('Toevoegen mislukt', (e as Error).message); }
  };

  const remove = async (id: string) => {
    try { await deleteActivity(id); refresh(); } catch (e) { Alert.alert('Verwijderen mislukt', (e as Error).message); }
  };

  return (
    <View style={s.c}>
      <Text style={s.h}>{family.name}</Text>
      <Text style={s.meta}>Uitnodigingscode: {family.invite_code}</Text>
      <View style={s.form}>
        <TextInput style={s.i} placeholder="Activiteit (bv. Zwemmen)" value={title} onChangeText={setTitle} />
        <TextInput style={s.i} placeholder="Wie?" value={who} onChangeText={setWho} />
        <TextInput style={s.i} placeholder="Notitie" value={note} onChangeText={setNote} />
        <Pressable style={s.b} onPress={add}><Text style={s.bt}>Toevoegen</Text></Pressable>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<Text style={s.empty}>Nog niets bijgehouden.</Text>}
        renderItem={({ item }) => (
          <Pressable style={s.card} onLongPress={() => remove(item.id)}>
            <Text style={s.ct}>{item.title}</Text>
            <Text style={s.meta}>
              {new Date(item.occurred_at).toLocaleDateString('nl-BE')}{item.who ? ` · ${item.who}` : ''}
            </Text>
            {item.note ? <Text>{item.note}</Text> : null}
          </Pressable>
        )}
      />
      <Pressable onPress={() => supabase.auth.signOut()}><Text style={s.out}>Uitloggen</Text></Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, padding: 16 },
  h: { fontSize: 24, fontWeight: '700', marginTop: 12 },
  form: { gap: 8, marginVertical: 12 },
  i: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  b: { backgroundColor: '#2f6fed', borderRadius: 8, padding: 12, alignItems: 'center' },
  bt: { color: '#fff', fontWeight: '600' },
  card: { padding: 12, borderRadius: 8, backgroundColor: '#f3f4f6', marginBottom: 8 },
  ct: { fontWeight: '600', fontSize: 16 },
  meta: { color: '#666', marginBottom: 4 },
  empty: { textAlign: 'center', color: '#888', marginTop: 24 },
  out: { textAlign: 'center', color: '#c00', padding: 12 },
});
