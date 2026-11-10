import { supabase } from './supabase';
import { Activity, Family } from './types';

export async function getMyFamily(): Promise<Family | null> {
  const { data, error } = await supabase
    .from('families')
    .select('id, name, invite_code')
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createFamily(familyName: string, memberName: string) {
  const { error } = await supabase.rpc('create_family', { family_name: familyName, member_name: memberName });
  if (error) throw error;
}

export async function joinFamily(code: string, memberName: string) {
  const { error } = await supabase.rpc('join_family', { code, member_name: memberName });
  if (error) throw error;
}

export async function listActivities(familyId: string): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('id, family_id, title, note, who, occurred_at')
    .eq('family_id', familyId)
    .order('occurred_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addActivity(familyId: string, a: { title: string; who: string; note: string }) {
  const { error } = await supabase.from('activities').insert({ family_id: familyId, ...a });
  if (error) throw error;
}

export async function deleteActivity(id: string) {
  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) throw error;
}
