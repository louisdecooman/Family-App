import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../supabase';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (mode: 'in' | 'up') => {
    setBusy(true);
    const creds = { email: email.trim(), password };
    const { error } = mode === 'in'
      ? await supabase.auth.signInWithPassword(creds)
      : await supabase.auth.signUp(creds);
    setBusy(false);
    if (error) Alert.alert('Mislukt', error.message);
    else if (mode === 'up') Alert.alert('Account aangemaakt', 'Bevestig eventueel je e-mail en log daarna in.');
  };

  return (
    <View style={s.c}>
      <Text style={s.h}>Family App</Text>
      <TextInput style={s.i} placeholder="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={s.i} placeholder="Wachtwoord" secureTextEntry value={password} onChangeText={setPassword} />
      <Pressable style={s.b} disabled={busy} onPress={() => run('in')}><Text style={s.bt}>Inloggen</Text></Pressable>
      <Pressable style={[s.b, s.alt]} disabled={busy} onPress={() => run('up')}><Text style={s.alt_t}>Account maken</Text></Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, justifyContent: 'center', padding: 24, gap: 10 },
  h: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
  i: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  b: { backgroundColor: '#2f6fed', borderRadius: 8, padding: 12, alignItems: 'center' },
  bt: { color: '#fff', fontWeight: '600' },
  alt: { backgroundColor: '#eef2ff' },
  alt_t: { color: '#2f6fed', fontWeight: '600' },
});
