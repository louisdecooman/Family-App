import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  FlatList, KeyboardAvoidingView, Platform, Pressable,
  SafeAreaView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { loadActivities, saveActivities } from './src/storage/activities';
import { Activity } from './src/types';

export default function App() {
  const [items, setItems] = useState<Activity[]>([]);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [who, setWho] = useState('');

  useEffect(() => {
    loadActivities().then(setItems);
  }, []);

  const add = () => {
    if (!title.trim()) return;
    const next: Activity[] = [
      { id: Date.now().toString(), title: title.trim(), note: note.trim(), who: who.trim(), date: new Date().toISOString() },
      ...items,
    ];
    setItems(next);
    saveActivities(next);
    setTitle(''); setNote('');
  };

  const remove = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    saveActivities(next);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Text style={styles.header}>Wat doen wij als gezin?</Text>
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Activiteit (bv. Zwemmen)" value={title} onChangeText={setTitle} />
          <TextInput style={styles.input} placeholder="Wie?" value={who} onChangeText={setWho} />
          <TextInput style={styles.input} placeholder="Notitie" value={note} onChangeText={setNote} />
          <Pressable style={styles.button} onPress={add}>
            <Text style={styles.buttonText}>Toevoegen</Text>
          </Pressable>
        </View>
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          ListEmptyComponent={<Text style={styles.empty}>Nog niets bijgehouden.</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onLongPress={() => remove(item.id)}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.meta}>
                {new Date(item.date).toLocaleDateString('nl-BE')}{item.who ? ` · ${item.who}` : ''}
              </Text>
              {item.note ? <Text>{item.note}</Text> : null}
            </Pressable>
          )}
        />
      </KeyboardAvoidingView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: '700', marginVertical: 12 },
  form: { gap: 8, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  button: { backgroundColor: '#2f6fed', borderRadius: 8, padding: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  card: { padding: 12, borderRadius: 8, backgroundColor: '#f3f4f6', marginBottom: 8 },
  cardTitle: { fontWeight: '600', fontSize: 16 },
  meta: { color: '#666', marginBottom: 4 },
  empty: { textAlign: 'center', color: '#888', marginTop: 24 },
});
