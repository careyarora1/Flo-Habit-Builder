import { supabase } from './supabase'

const DEVICE_ID_KEY = 'habit-tracker-device-id'

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

// Load data from Supabase (returns null if not found)
export async function loadFromSupabase() {
  const deviceId = getDeviceId()
  const { data, error } = await supabase
    .from('user_data')
    .select('data, updated_at')
    .eq('device_id', deviceId)
    .single()

  if (error || !data) return null
  return data.data
}

// Save data to Supabase (upsert)
export async function saveToSupabase(appData) {
  const deviceId = getDeviceId()
  await supabase
    .from('user_data')
    .upsert({
      device_id: deviceId,
      data: appData,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'device_id' })
}
