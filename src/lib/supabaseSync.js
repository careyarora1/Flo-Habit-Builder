import { supabase } from './supabase'

// Load data from Supabase by user ID
export async function loadFromSupabase(userId) {
  if (!supabase || !userId) return null
  console.log('[Sync] Loading from Supabase for user:', userId)
  const { data, error } = await supabase
    .from('user_data')
    .select('device_id, data, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)

  if (error) {
    console.warn('[Sync] Load error:', error.message, error.code)
    return null
  }
  if (!data || data.length === 0) {
    console.log('[Sync] No cloud data found for this user')
    return null
  }
  console.log('[Sync] Loaded cloud data:', data[0].data?.habits?.length, 'habits')
  return data[0].data
}

// Save data to Supabase by user ID
export async function saveToSupabase(userId, appData) {
  if (!supabase || !userId) return
  console.log('[Sync] Saving to Supabase:', appData?.habits?.length, 'habits')

  // Check if a row already exists for this user
  const { data: existing } = await supabase
    .from('user_data')
    .select('device_id')
    .eq('user_id', userId)
    .limit(1)

  const now = new Date().toISOString()

  if (existing && existing.length > 0) {
    // Update existing row
    const { error } = await supabase
      .from('user_data')
      .update({ data: appData, updated_at: now })
      .eq('device_id', existing[0].device_id)

    if (error) {
      console.error('[Sync] UPDATE FAILED:', error.message, error.code, error.details)
    } else {
      console.log('[Sync] Update successful')
    }
  } else {
    // Insert new row — generate a device_id since the table requires it
    const { error } = await supabase
      .from('user_data')
      .insert({
        device_id: crypto.randomUUID(),
        user_id: userId,
        data: appData,
        updated_at: now,
      })

    if (error) {
      console.error('[Sync] INSERT FAILED:', error.message, error.code, error.details)
    } else {
      console.log('[Sync] Insert successful')
    }
  }
}
