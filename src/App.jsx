import { useState, useEffect, useRef } from 'react'
import { loadData, saveData, getToday, calcNextGoal, calcBaseline, getActiveHabit, addHabit, updateActiveHabit, advanceDay, getDevOffset, resetDevMode } from './store'
import { loadFromSupabase, saveToSupabase } from './lib/supabaseSync'
import { useAuth } from './contexts/AuthContext'
import AuthPage from './pages/AuthPage'
import Onboarding from './pages/Onboarding'
import DailyView from './pages/DailyView'
import Progress from './pages/Progress'


const DEV_MODE = import.meta.env.DEV

function DevToolbar({ onAdvance, onReset, onFullReset, onSkipSignIn }) {
  if (!DEV_MODE) return null
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white text-xs flex items-center justify-between px-4 py-2 z-[9999]">
      <span>DEV · Day +{getDevOffset()} · "{getToday()}"</span>
      <div className="flex gap-2">
        {onSkipSignIn && <button onClick={onSkipSignIn} className="bg-blue-600 px-3 py-1 rounded">Skip Sign-in</button>}
        {onAdvance && <button onClick={onAdvance} className="bg-blue-600 px-3 py-1 rounded">Next Day →</button>}
        {onReset && <button onClick={onReset} className="bg-gray-600 px-3 py-1 rounded">Reset</button>}
        {onFullReset && <button onClick={onFullReset} className="bg-red-600 px-3 py-1 rounded">Full Reset</button>}
      </div>
    </div>
  )
}

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
        <p className="text-warm-500 mb-2 text-sm leading-relaxed">
          Pick a goal you are 100% confident you will succeed at. The point is to succeed each day at the goal you set. Don't worry about how much of an improvement you can make, just make an improvement.
        </p>
        <p className="text-warm-400 mb-6 text-sm leading-relaxed">
          If you're still not sure what's a good goal, set a goal that seems pointless — a number that you just know you will not fail, even if it feels trivial. Building habits is about a gradual process that is unnoticeable, which is exactly how bad habits come to be in the first place.
        </p>

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
  const [data, setData] = useState(null)
  const [view, setView] = useState('daily')
  const [addingNew, setAddingNew] = useState(false)
  const [viewingDate, setViewingDate] = useState(getToday())
  const [, forceRender] = useState(0)
  const [syncReady, setSyncReady] = useState(false)
  const saveTimer = useRef(null)

  const [devSkipAuth, setDevSkipAuth] = useState(false)
  const devAdvance = () => { advanceDay(); forceRender(n => n + 1) }
  const devReset = () => { resetDevMode(); setData({ habits: [], activeHabitId: null }); setAddingNew(false); setViewingDate(getToday()); forceRender(n => n + 1) }
  const devFullReset = async () => { resetDevMode(); localStorage.clear(); if (signOut) await signOut(); window.location.reload() }

  const activeHabit = data ? getActiveHabit(data) : null

  // On login, load cloud data first, fall back to localStorage
  useEffect(() => {
    if (!user) {
      setData(null)
      setSyncReady(false)
      return
    }

    loadFromSupabase(user.id).then(cloudData => {
      const localData = loadData()

      if (cloudData && cloudData.habits && cloudData.habits.length > 0) {
        // Cloud has data — use it as the source of truth
        // Also merge in any local-only habits (created offline on this device)
        const cloudIds = new Set(cloudData.habits.map(h => h.id))
        const localOnly = (localData.habits || []).filter(h => !cloudIds.has(h.id))
        const merged = {
          ...cloudData,
          habits: [...cloudData.habits, ...localOnly],
        }
        setData(merged)
        saveData(merged)
      } else {
        // No cloud data — start fresh (don't use stale localStorage from another session)
        setData({ habits: [], activeHabitId: null })
      }
      setSyncReady(true)
    }).catch(() => {
      // Network error — use localStorage as fallback
      setData(loadData())
      setSyncReady(true)
    })
  }, [user?.id])

  // Keep viewingDate in sync when habit changes
  useEffect(() => {
    if (activeHabit) {
      setViewingDate(getLatestViewingDate(activeHabit))
    }
  }, [activeHabit?.id])

  // Save to localStorage + Supabase whenever data changes (only after initial sync)
  useEffect(() => {
    if (!data || !syncReady) return
    saveData(data)
    if (!user) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveToSupabase(user.id, data)
    }, 1000)
  }, [data])

  // Flush save to Supabase immediately before signing out
  const handleSignOut = async () => {
    if (user && data && syncReady) {
      clearTimeout(saveTimer.current)
      console.log('[Sync] Flushing save before sign out...')
      await saveToSupabase(user.id, data)
    }
    saveData({ habits: [], activeHabitId: null }) // clear localStorage so stale data doesn't interfere
    await signOut()
  }

  // Show auth page if not logged in, show loading while syncing
  if (authLoading) return <div className="min-h-screen bg-warm-50 flex items-center justify-center"><p className="text-warm-400">Loading...</p></div>
  if (!user) return <><BridgeCars /><AuthPage /></>
  if (!syncReady) return <><BridgeCars /><div className="min-h-screen flex items-center justify-center"><p className="text-warm-400">Syncing your data...</p></div></>

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

  const SignOutButton = () => (
    <button
      onClick={handleSignOut}
      className="fixed top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full text-warm-500 hover:bg-warm-100/30 transition-colors"
      title="Sign out"
      style={{ backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 41, 0.4)' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    </button>
  )

  // No habits yet, or adding a new one → show onboarding
  if (data.habits.length === 0 || addingNew) {
    return <>
      <BridgeCars />
      <SignOutButton />
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

    </>
  }

  // No active habit selected → show habit list
  if (!activeHabit) {
    return <>
      <BridgeCars />
      <SignOutButton />
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

    </>
  }

  // Baseline complete — show transition screen with goal setting before activating
  const baselineEntries = activeHabit.entries.filter(e => e.actual != null)
  if (activeHabit.phase === 'baseline' && baselineEntries.length >= 7) {
    const avg = calcBaseline(activeHabit.entries)
    return <>
      <BridgeCars />
      <SignOutButton />
      <BaselineComplete
        habit={activeHabit}
        avg={avg}
        onStart={(userGoal) => { handleActivate(userGoal); setViewingDate(getToday()) }}
      />

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
          onClick={handleSignOut}
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


    </div>
  )
}

export default App
