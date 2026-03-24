import { supabase } from './supabase'

// Load data from Supabase by user ID
export async function loadFromSupabase(userId) {
  if (!supabase || !userId) return null
  const { data, error } = await supabase
    .from('user_data')
    .select('data, updated_at')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data.data
}

// Save data to Supabase by user ID (upsert)
export async function saveToSupabase(userId, appData) {
  if (!supabase || !userId) return
  await supabase
    .from('user_data')
    .upsert({
      user_id: userId,
      data: appData,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
}
