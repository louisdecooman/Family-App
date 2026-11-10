import { Session } from '@supabase/supabase-js';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView } from 'react-native';
import { getMyFamily } from './src/api';
import ActivitiesScreen from './src/screens/ActivitiesScreen';
import AuthScreen from './src/screens/AuthScreen';
import FamilySetupScreen from './src/screens/FamilySetupScreen';
import { supabase } from './src/supabase';
import { Family } from './src/types';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const loadFamily = useCallback(async () => {
    setLoading(true);
    try { setFamily(session ? await getMyFamily() : null); }
    catch { setFamily(null); }
    finally { setLoading(false); }
  }, [session]);

  useEffect(() => { loadFamily(); }, [loadFamily]);

  let body;
  if (!session) body = <AuthScreen />;
  else if (loading) body = <ActivityIndicator style={{ flex: 1 }} />;
  else if (!family) body = <FamilySetupScreen onDone={loadFamily} />;
  else body = <ActivitiesScreen family={family} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {body}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
