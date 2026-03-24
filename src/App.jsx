import { useState, useEffect, useRef } from 'react'
import { loadData, saveData, getToday, calcNextGoal, calcBaseline, getActiveHabit, addHabit, updateActiveHabit, getDevOffset, advanceDay, resetDevMode } from './store'
import { loadFromSupabase, saveToSupabase } from './lib/supabaseSync'
import { useAuth } from './contexts/AuthContext'
import AuthPage from './pages/AuthPage'
import Onboarding from './pages/Onboarding'
import DailyView from './pages/DailyView'
import Progress from './pages/Progress'

const DEV_MODE = true // Keep on so instructor can step through days

function BridgeCars() {
  return (
    <>
      <div className="bridge-road" />
      <div className="bridge-cars">
        <div className="bridge-car bridge-car--right" />
        <div className="bridge-car bridge-car--left" />
        <div className="bridge-car bridge-car--right" />
        <div className="bridge-car bridge-car--left" />
      </div>
    </>
  )
}

function DevToolbar({ onAdvance, onReset, onFullReset }) {
  if (!DEV_MODE) return null
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white px-4 py-2 flex items-center justify-between text-xs z-50">
      <span className="font-mono">
        DEV · Day +{getDevOffset()} · "{getToday()}"
      </span>
      <div className="flex gap-2">
        <button
          onClick={onAdvance}
          className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded font-medium"
        >
          Next Day →
        </button>
        <button
          onClick={onReset}
          className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded font-medium"
        >
          Reset
        </button>
        <button
          onClick={onFullReset}
          className="bg-red-700 hover:bg-red-600 px-3 py-1 rounded font-medium"
        >
          Full Reset
        </button>
      </div>
    </div>
  )
}

function HabitList({ habits, onSelect, onAdd, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(null)
  return (
    <div className="min-h-screen bg-warm-50 flex flex-col items-center p-6 pt-16">
      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-6">
          <div className="steel-plate rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-semibold text-warm-900 text-center">Delete habit?</h3>
            <p className="text-warm-400 text-sm text-center">
              Are you sure you want to delete <span className="text-warm-900 font-medium">{confirmDelete.name}</span>? All tracking data will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-xl font-medium text-warm-400 bg-warm-50 hover:bg-warm-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { onDelete(confirmDelete.id); setConfirmDelete(null) }}
                className="flex-1 py-3 rounded-xl font-medium text-white bg-red-600 hover:bg-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md w-full">
        <h2 className="text-2xl font-bold text-warm-900 mb-2">Your habits</h2>
        <p className="text-warm-500 mb-8">Tap a habit to continue tracking.</p>

        <div className="grid gap-3">
          {habits.map(h => {
            const daysLogged = h.entries.filter(e => e.actual != null).length
            const icon = h.direction === 'reduce' ? '↓' : '↑'
            return (
              <div key={h.id} className="flex items-center gap-2">
                <button
                  onClick={() => onSelect(h.id)}
                  className="flex-1 flex items-center justify-between p-5 bg-white rounded-2xl text-left hover:shadow-md transition-all steel-plate active:scale-[0.98]"
                >
                  <div>
                    <div className="font-medium text-warm-900">{h.name}</div>
                    <div className="text-sm text-warm-400">
                      {h.phase === 'baseline'
                        ? `Baseline · ${daysLogged}/7 days`
                        : `${icon} ${h.currentGoal} ${h.unit} · Day ${daysLogged}`
                      }
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warm-300"><path d="m9 18 6-6-6-6"/></svg>
                </button>
                <button
                  onClick={() => setConfirmDelete(h)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-warm-400 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
                  title="Delete habit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            )
          })}

          <button
            onClick={onAdd}
            className="p-5 bg-white/50 rounded-2xl border border-dashed border-warm-200 hover:border-warm-300 transition-colors text-center font-medium"
            style={{ color: '#f0c060', textShadow: '0 0 6px rgba(18, 26, 42, 0.6), 0 1px 3px rgba(18, 26, 42, 0.5), 0 0 10px rgba(18, 26, 42, 0.35)' }}
          >
            + Add a new habit
          </button>
        </div>
      </div>
    </div>
  )
}

function BaselineComplete({ habit, avg, onStart }) {
  const suggested = habit.direction === 'reduce'
    ? Math.round(avg * 0.9 * 10) / 10
    : Math.round(avg * 1.1 * 10) / 10
  const [goalInput, setGoalInput] = useState(String(suggested))

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-warm-100 text-warm-500 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-warm-900 mb-3">
          Your baseline is set
        </h2>
        <p className="text-warm-600 mb-2">
          Over the past 7 days, you averaged <span className="font-semibold text-warm-800">{avg} {habit.unit}</span>.
        </p>
        <p className="text-warm-500 mb-6">
          Now we'll start working toward {habit.direction === 'reduce' ? 'reducing' : 'building on'} that — at your pace.
        </p>
        <div className="bg-white rounded-2xl p-5 steel-plate mb-8 text-left">
          <p className="text-warm-700 text-sm leading-relaxed">
            <span className="font-semibold">One thing to know:</span> progress won't be a straight line. Some days you'll backslide, and that's completely normal. What matters is the overall trend, not any single day.
          </p>
        </div>

        <p className="text-warm-600 font-medium mb-4">Set your first goal</p>
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm steel-plate mb-6">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                const cur = Math.round((Number(goalInput) || 0) * 10) / 10
                const next = Math.max(0, Math.round((cur - 0.1) * 10) / 10)
                setGoalInput(String(next))
              }}
              className="w-10 h-10 rounded-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors text-xl font-bold flex items-center justify-center shadow-sm"
            >
              −
            </button>
            <input
              type="text"
              inputMode="decimal"
              value={goalInput}
              onChange={e => {
                const raw = e.target.value
                if (raw === '' || /^\d*\.?\d{0,3}$/.test(raw)) {
                  setGoalInput(raw)
                }
              }}
              className="text-5xl font-bold text-center w-40 bg-transparent border-b-3 border-warm-200 focus:border-sage-500 outline-none text-warm-900 pb-2 transition-colors"
            />
            <button
              onClick={() => {
                const cur = Math.round((Number(goalInput) || 0) * 10) / 10
                const next = Math.round((cur + 0.1) * 10) / 10
                setGoalInput(String(next))
              }}
              className="w-10 h-10 rounded-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors text-xl font-bold flex items-center justify-center shadow-sm"
            >
              +
            </button>
          </div>
          <p className="text-warm-400 mt-2">{habit.unit}</p>
        </div>

        <button
          onClick={() => {
            const val = Number(goalInput)
            if (!isNaN(val) && val >= 0) onStart(val)
          }}
          disabled={!goalInput || Number(goalInput) < 0}
          className="w-full bg-sage-500 text-white py-3.5 px-6 rounded-2xl font-medium text-lg hover:bg-sage-600 transition-colors shadow-lg shadow-sage-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Let's start
        </button>
      </div>
    </div>
  )
}

// Helper: get the latest date the user should be viewing
function getLatestViewingDate(habit) {
  if (!habit || habit.entries.length === 0) return getToday()
  // Find the last entry that isn't fully complete
  const sorted = [...habit.entries].sort((a, b) => a.date.localeCompare(b.date))
  const lastEntry = sorted[sorted.length - 1]
  const isBaseline = habit.phase === 'baseline'

  // If last entry is complete, the next date is today (if it's available)
  const lastComplete = isBaseline
    ? lastEntry.actual != null
    : lastEntry.finalized === true

  if (lastComplete) {
    // Show today if today is after the last entry
    const today = getToday()
    if (today > lastEntry.date) return today
    return lastEntry.date
  }
  // Otherwise show the incomplete day
  return lastEntry.date
}

// Get next calendar day from a date string
function nextDay(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

function prevDay(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function App() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [data, setData] = useState(loadData)
  const [view, setView] = useState('daily')
  const [addingNew, setAddingNew] = useState(false)
  const [viewingDate, setViewingDate] = useState(getToday())
  const [, forceRender] = useState(0)
  const saveTimer = useRef(null)

  const activeHabit = getActiveHabit(data)

  // Keep viewingDate in sync when habit changes
  useEffect(() => {
    if (activeHabit) {
      setViewingDate(getLatestViewingDate(activeHabit))
    }
  }, [activeHabit?.id])

  // On mount, try loading from Supabase (cloud data takes priority if it has habits)
  useEffect(() => {
    if (!user) return
    loadFromSupabase(user.id).then(cloudData => {
      if (cloudData && cloudData.habits && cloudData.habits.length > 0) {
        setData(cloudData)
        saveData(cloudData) // sync to localStorage too
      }
    }).catch(() => {}) // silently fail — localStorage is the fallback
  }, [user?.id])

  // Save to localStorage immediately, debounce Supabase saves
  useEffect(() => {
    saveData(data)
    if (!user) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveToSupabase(user.id, data).catch(() => {})
    }, 1000)
  }, [data])

  const devAdvance = () => { advanceDay(); forceRender(n => n + 1) }
  const devReset = () => { resetDevMode(); setData({ habits: [], activeHabitId: null }); setAddingNew(false); setViewingDate(getToday()); forceRender(n => n + 1) }
  const devFullReset = async () => { resetDevMode(); localStorage.clear(); if (signOut) await signOut(); window.location.reload() }

  // Show auth page if not logged in
  if (authLoading) return <div className="min-h-screen bg-warm-50 flex items-center justify-center"><p className="text-warm-400">Loading...</p></div>
  if (!user) return <><BridgeCars /><AuthPage /></>

  const update = (changes) => {
    setData(prev => ({ ...prev, ...changes }))
  }

  // Update fields on the active habit
  const updateHabit = (changes) => {
    setData(prev => updateActiveHabit(prev, changes))
  }

  const handleActivate = (userGoal) => {
    if (!activeHabit) return
    const baseline = calcBaseline(activeHabit.entries)
    if (baseline <= 0) return
    const currentGoal = userGoal != null ? userGoal : (
      activeHabit.direction === 'reduce'
        ? Math.floor(baseline * 0.9)
        : Math.ceil(baseline * 1.1)
    )
    // Create today's entry with the goal so MorningSetup doesn't re-ask
    const today = getToday()
    const existingEntry = activeHabit.entries.find(e => e.date === today)
    const updatedEntries = existingEntry
      ? activeHabit.entries.map(e => e.date === today ? { ...e, goal: currentGoal } : e)
      : [...activeHabit.entries, { date: today, goal: currentGoal, actual: null, difficulty: null, finalized: false }]
    updateHabit({ baseline, phase: 'active', currentGoal, entries: updatedEntries })
  }

  const goToList = () => {
    update({ activeHabitId: null })
    setView('daily')
    setAddingNew(false)
  }

  // No habits yet, or adding a new one → show onboarding
  if (data.habits.length === 0 || addingNew) {
    return <>
      <BridgeCars />
      <Onboarding
        key={data.habits.length === 0 ? 'fresh' : 'add'}
        startStep={data.habits.length === 0 ? 0 : 1}
        onBack={data.habits.length > 0 ? () => setAddingNew(false) : null}
        onComplete={(habitInfo) => {
          const newData = addHabit(data, habitInfo)
          setData(newData)
          setAddingNew(false)
          setViewingDate(getToday())
        }}
      />
      <DevToolbar onAdvance={devAdvance} onReset={devReset} onFullReset={devFullReset} />
    </>
  }

  // No active habit selected → show habit list
  if (!activeHabit) {
    return <>
      <BridgeCars />
      <HabitList
        habits={data.habits}
        onSelect={(id) => {
          update({ activeHabitId: id })
          const habit = data.habits.find(h => h.id === id)
          if (habit) setViewingDate(getLatestViewingDate(habit))
        }}
        onAdd={() => setAddingNew(true)}
        onDelete={(id) => {
          setData(prev => ({
            ...prev,
            habits: prev.habits.filter(h => h.id !== id),
            activeHabitId: prev.activeHabitId === id ? null : prev.activeHabitId,
          }))
        }}
      />
      <DevToolbar onAdvance={devAdvance} onReset={devReset} onFullReset={devFullReset} />
    </>
  }

  // Baseline complete — show transition screen with goal setting before activating
  const baselineEntries = activeHabit.entries.filter(e => e.actual != null)
  if (activeHabit.phase === 'baseline' && baselineEntries.length >= 7) {
    const avg = calcBaseline(activeHabit.entries)
    return <>
      <BridgeCars />
      <BaselineComplete
        habit={activeHabit}
        avg={avg}
        onStart={(userGoal) => { handleActivate(userGoal); setViewingDate(getToday()) }}
      />
      <DevToolbar onAdvance={devAdvance} onReset={devReset} onFullReset={devFullReset} />
    </>
  }

  // Can the user go forward?
  // During baseline: always (each tap = next day, no waiting for midnight)
  // During active: only if the next calendar day has actually arrived
  const today = getToday()
  const next = nextDay(viewingDate)
  const isBaselinePhase = activeHabit.phase === 'baseline'
  const canGoForward = isBaselinePhase ? true : next <= today

  return (
    <div className="min-h-screen bg-warm-50">
      <BridgeCars />
      <nav className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm sticky top-0 z-10 steel-nav">
        <button
          onClick={goToList}
          className="w-10 h-10 flex items-center justify-center rounded-full text-warm-500 hover:bg-warm-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => setView('daily')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              view === 'daily'
                ? 'bg-sage-500 text-white shadow-md'
                : 'text-warm-600 hover:bg-warm-100'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setView('progress')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              view === 'progress'
                ? 'bg-sage-500 text-white shadow-md'
                : 'text-warm-600 hover:bg-warm-100'
            }`}
          >
            Progress
          </button>
        </div>
        <button
          onClick={signOut}
          className="w-10 h-10 flex items-center justify-center rounded-full text-warm-500 hover:bg-warm-100 transition-colors"
          title="Sign out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </nav>

      {view === 'daily' ? (
        <DailyView
          key={viewingDate}
          data={{ ...data, habit: activeHabit, phase: activeHabit.phase, currentGoal: activeHabit.currentGoal, entries: activeHabit.entries }}
          viewingDate={viewingDate}
          canGoForward={canGoForward}
          onPrevDay={() => {
            // Go to the previous entry's date
            const sorted = [...activeHabit.entries].sort((a, b) => a.date.localeCompare(b.date))
            const prevEntries = sorted.filter(e => e.date < viewingDate)
            if (prevEntries.length > 0) {
              setViewingDate(prevEntries[prevEntries.length - 1].date)
            }
          }}
          onNextDay={() => {
            // During baseline, advance dev clock so next day gets a new date
            if (isBaselinePhase && next > today) {
              advanceDay()
              forceRender(n => n + 1)
            }
            setViewingDate(isBaselinePhase ? nextDay(viewingDate) : next)
          }}
          onSetGoal={(difficulty, goal, date, layerGoals) => {
            // Save difficulty on yesterday's entry, set today's goal
            const sorted = [...activeHabit.entries].sort((a, b) => a.date.localeCompare(b.date))
            const prevEntry = sorted.filter(e => e.date < date).pop()
            let updatedEntries = [...activeHabit.entries]
            if (prevEntry) {
              updatedEntries = updatedEntries.map(e =>
                e.date === prevEntry.date ? { ...e, difficulty } : e
              )
            }
            // Build layerData with goals if layers exist
            const layerData = layerGoals ? Object.fromEntries(
              Object.entries(layerGoals).map(([id, g]) => [id, { goal: g, actual: null }])
            ) : undefined
            // Create today's entry with the chosen goal
            const existing = updatedEntries.find(e => e.date === date)
            if (existing) {
              updatedEntries = updatedEntries.map(e =>
                e.date === date ? { ...e, goal, ...(layerData ? { layerData } : {}) } : e
              )
            } else {
              updatedEntries.push({ date, goal, actual: null, difficulty: null, finalized: false, ...(layerData ? { layerData } : {}) })
            }
            updateHabit({ entries: updatedEntries, currentGoal: goal, ...(layerGoals ? { layerGoals } : {}) })
          }}
          onLog={(actual, date, newLayerData) => {
            const existing = activeHabit.entries.find(e => e.date === date)
            if (existing) {
              // Merge new layer actuals with existing layer goals
              let mergedLayerData = existing.layerData
              if (newLayerData) {
                mergedLayerData = { ...existing.layerData }
                for (const [id, vals] of Object.entries(newLayerData)) {
                  mergedLayerData[id] = { ...mergedLayerData[id], ...vals }
                }
              }
              updateHabit({
                entries: activeHabit.entries.map(e =>
                  e.date === date ? { ...e, actual, finalized: actual == null ? false : e.finalized, ...(mergedLayerData ? { layerData: mergedLayerData } : {}) } : e
                ),
              })
            } else {
              updateHabit({
                entries: [...activeHabit.entries, {
                  date,
                  goal: activeHabit.currentGoal,
                  actual,
                  difficulty: null,
                  finalized: false,
                  ...(newLayerData ? { layerData: newLayerData } : {}),
                }],
              })
            }
          }}
          onFinalize={(done, note, date) => {
            updateHabit({
              entries: activeHabit.entries.map(e =>
                e.date === date ? { ...e, finalized: done, ...(note !== undefined ? { note } : {}) } : e
              ),
            })
          }}
          onActivate={handleActivate}
        />
      ) : (
        <Progress
          data={{ ...data, habit: activeHabit, phase: activeHabit.phase, currentGoal: activeHabit.currentGoal, entries: activeHabit.entries }}
          onUpdateOutcome={(newOutcome) => updateHabit({ desiredOutcome: newOutcome })}
        />
      )}

      <DevToolbar onAdvance={devAdvance} onReset={devReset} onFullReset={devFullReset} />
    </div>
  )
}

export default App
