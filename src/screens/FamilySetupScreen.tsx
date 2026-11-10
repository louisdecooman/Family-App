import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { createFamily, joinFamily } from '../api';

export default function FamilySetupScreen({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [code, setCode] = useState('');

  const go = async (fn: () => Promise<void>) => {
    if (!name.trim()) return Alert.alert('Vul eerst je naam in');
    try { await fn(); onDone(); } catch (e) { Alert.alert('Mislukt', (e as Error).message); }
  };

  return (
    <View style={s.c}>
      <Text style={s.h}>Jouw gezin</Text>
      <TextInput style={s.i} placeholder="Jouw naam" value={name} onChangeText={setName} />
      <Text style={s.l}>Nieuw gezin</Text>
      <TextInput style={s.i} placeholder="Naam van het gezin" value={familyName} onChangeText={setFamilyName} />
      <Pressable style={s.b} onPress={() => familyName.trim() && go(() => createFamily(familyName.trim(), name.trim()))}>
        <Text style={s.bt}>Gezin aanmaken</Text>
      </Pressable>
      <Text style={s.l}>Of word lid met een code</Text>
      <TextInput style={s.i} placeholder="Uitnodigingscode" autoCapitalize="none" value={code} onChangeText={setCode} />
      <Pressable style={s.b} onPress={() => code.trim() && go(() => joinFamily(code.trim(), name.trim()))}>
        <Text style={s.bt}>Deelnemen</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, justifyContent: 'center', padding: 24, gap: 10 },
  h: { fontSize: 24, fontWeight: '700' },
  l: { fontWeight: '600', marginTop: 12 },
  i: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  b: { backgroundColor: '#2f6fed', borderRadius: 8, padding: 12, alignItems: 'center' },
  bt: { color: '#fff', fontWeight: '600' },
});
