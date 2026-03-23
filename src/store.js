// localStorage-backed data store for habit tracking

const STORAGE_KEY = 'habit-tracker-data'

// Dev mode: override the current date for testing
let devDateOffset = 0 // days ahead of real today

export function getDevOffset() {
  return devDateOffset
}

export function setDevOffset(days) {
  devDateOffset = days
}

export function advanceDay() {
  devDateOffset++
}

export function resetDevMode() {
  devDateOffset = 0
  localStorage.removeItem(STORAGE_KEY)
}

const defaultData = {
  habits: [],           // [{ id, name, unit, direction, baseline?, phase, entries, currentGoal }]
  activeHabitId: null,   // which habit is currently being viewed
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultData }
    const parsed = JSON.parse(raw)
    // Migration: old single-habit format → multi-habit
    if (parsed.habit && !parsed.habits) {
      const id = generateId()
      const migrated = {
        habits: [{
          id,
          name: parsed.habit.name,
          unit: parsed.habit.unit,
          direction: parsed.habit.direction,
          baseline: parsed.habit.baseline || null,
          phase: parsed.phase || 'baseline',
          entries: parsed.entries || [],
          currentGoal: parsed.currentGoal,
        }],
        activeHabitId: id,
      }
      return migrated
    }
    return { ...defaultData, ...parsed }
  } catch {
    return { ...defaultData }
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function resetData() {
  localStorage.removeItem(STORAGE_KEY)
}

// Get the currently active habit object
export function getActiveHabit(data) {
  if (!data.activeHabitId) return null
  return data.habits.find(h => h.id === data.activeHabitId) || null
}

// Add a new habit and make it active
export function addHabit(data, habitInfo) {
  const id = generateId()
  const newHabit = {
    id,
    name: habitInfo.name,
    unit: habitInfo.unit,
    direction: habitInfo.direction,
    baseline: habitInfo.skipBaseline ? 0 : null,
    phase: habitInfo.skipBaseline ? 'active' : 'baseline',
    entries: habitInfo.skipBaseline
      ? [{ date: getToday(), goal: habitInfo.startingGoal, actual: null, difficulty: null, finalized: false }]
      : [],
    currentGoal: habitInfo.skipBaseline ? habitInfo.startingGoal : null,
    desiredOutcome: habitInfo.desiredOutcome || '',
    layers: habitInfo.layers || [],
    layerGoals: habitInfo.startingLayerGoals || {},
    ...(habitInfo.scoringSystem ? { scoringSystem: habitInfo.scoringSystem } : {}),
  }
  return {
    habits: [...data.habits, newHabit],
    activeHabitId: id,
  }
}

// Update the active habit's fields
export function updateActiveHabit(data, changes) {
  return {
    ...data,
    habits: data.habits.map(h =>
      h.id === data.activeHabitId ? { ...h, ...changes } : h
    ),
  }
}

export function getToday() {
  const d = new Date()
  d.setDate(d.getDate() + devDateOffset)
  return d.toISOString().split('T')[0]
}

export function getTodayEntry(habit) {
  const today = getToday()
  return habit.entries.find(e => e.date === today)
}

export function getYesterdayEntry(habit) {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() + devDateOffset - 1)
  const dateStr = yesterday.toISOString().split('T')[0]
  return habit.entries.find(e => e.date === dateStr)
}

// Calculate baseline from logged entries
export function calcBaseline(entries) {
  const withActual = entries.filter(e => e.actual != null)
  if (withActual.length === 0) return 0
  const sum = withActual.reduce((s, e) => s + e.actual, 0)
  return Math.round((sum / withActual.length) * 100) / 100
}

// Calculate next goal based on difficulty feedback
export function calcNextGoal(habit, currentGoal, difficulty) {
  const step = habit.baseline * 0.05 // 5% of baseline per adjustment
  const isReduce = habit.direction === 'reduce'

  if (difficulty === 'too-easy') {
    return isReduce
      ? Math.max(0, currentGoal - step)
      : currentGoal + step
  } else if (difficulty === 'too-hard') {
    return isReduce
      ? currentGoal + step * 0.5
      : Math.max(0, currentGoal - step * 0.5)
  }
  // 'about-right'
  return isReduce
    ? Math.max(0, currentGoal - step * 0.3)
    : currentGoal + step * 0.3
}
