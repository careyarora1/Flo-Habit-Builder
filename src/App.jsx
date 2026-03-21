import { useState, useEffect, useRef } from 'react'
import { loadData, saveData, getToday, getTodayEntry, getYesterdayEntry, calcNextGoal, calcBaseline, getActiveHabit, addHabit, updateActiveHabit, getDevOffset, advanceDay, resetDevMode } from './store'
import { loadFromSupabase, saveToSupabase } from './lib/supabaseSync'
import Onboarding from './pages/Onboarding'
import CheckIn from './pages/CheckIn'
import DailyView from './pages/DailyView'
import Progress from './pages/Progress'

const DEV_MODE = true // Keep on so instructor can step through days

function DevToolbar({ onAdvance, onReset }) {
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
      </div>
    </div>
  )
}

function HabitList({ habits, onSelect, onAdd }) {
  return (
    <div className="min-h-screen bg-warm-50 flex flex-col items-center p-6 pt-16">
      <div className="max-w-md w-full">
        <h2 className="text-2xl font-bold text-warm-900 mb-2">Your habits</h2>
        <p className="text-warm-500 mb-8">Tap a habit to continue tracking.</p>

        <div className="grid gap-3">
          {habits.map(h => {
            const daysLogged = h.entries.filter(e => e.actual != null).length
            const icon = h.direction === 'reduce' ? '↓' : '↑'
            return (
              <button
                key={h.id}
                onClick={() => onSelect(h.id)}
                className="flex items-center justify-between p-5 bg-white rounded-2xl text-left hover:shadow-md transition-all border border-warm-100 active:scale-[0.98]"
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
            )
          })}

          <button
            onClick={onAdd}
            className="p-5 bg-white/50 rounded-2xl text-warm-400 border border-dashed border-warm-200 hover:border-warm-300 transition-colors text-center font-medium"
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
        <p className="text-5xl mb-6">📊</p>
        <h2 className="text-2xl font-bold text-warm-900 mb-3">
          Your baseline is set
        </h2>
        <p className="text-warm-600 mb-2">
          Over the past 7 days, you averaged <span className="font-semibold text-warm-800">{avg} {habit.unit}</span>.
        </p>
        <p className="text-warm-500 mb-6">
          Now we'll start working toward {habit.direction === 'reduce' ? 'reducing' : 'building on'} that — at your pace.
        </p>
        <div className="bg-white rounded-2xl p-5 border border-warm-100 mb-8 text-left">
          <p className="text-warm-700 text-sm leading-relaxed">
            <span className="font-semibold">One thing to know:</span> progress won't be a straight line. Some days you'll backslide, and that's completely normal. What matters is the overall trend, not any single day.
          </p>
        </div>

        <p className="text-warm-600 font-medium mb-4">Set your first goal</p>
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-warm-100 mb-6">
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

function App() {
  const [data, setData] = useState(loadData)
  const [view, setView] = useState('daily')
  const [addingNew, setAddingNew] = useState(false)
  const [, forceRender] = useState(0)
  const saveTimer = useRef(null)

  const devAdvance = () => { advanceDay(); forceRender(n => n + 1) }
  const devReset = () => { resetDevMode(); setData({ habits: [], activeHabitId: null }); setAddingNew(false); forceRender(n => n + 1) }

  // On mount, try loading from Supabase (cloud data takes priority if it has habits)
  useEffect(() => {
    loadFromSupabase().then(cloudData => {
      if (cloudData && cloudData.habits && cloudData.habits.length > 0) {
        setData(cloudData)
        saveData(cloudData) // sync to localStorage too
      }
    }).catch(() => {}) // silently fail — localStorage is the fallback
  }, [])

  // Save to localStorage immediately, debounce Supabase saves
  useEffect(() => {
    saveData(data)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveToSupabase(data).catch(() => {})
    }, 1000)
  }, [data])

  const update = (changes) => {
    setData(prev => ({ ...prev, ...changes }))
  }

  const activeHabit = getActiveHabit(data)

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
    updateHabit({ baseline, phase: 'active', currentGoal })
  }

  const goToList = () => {
    update({ activeHabitId: null })
    setView('daily')
    setAddingNew(false)
  }

  // No habits yet, or adding a new one → show onboarding
  if (data.habits.length === 0 || addingNew) {
    return <>
      <Onboarding
        key={data.habits.length === 0 ? 'fresh' : 'add'}
        startStep={data.habits.length === 0 ? 0 : 1}
        onComplete={(habitInfo) => {
          const newData = addHabit(data, habitInfo)
          setData(newData)
          setAddingNew(false)
        }}
      />
      <DevToolbar onAdvance={devAdvance} onReset={devReset} />
    </>
  }

  // No active habit selected → show habit list
  if (!activeHabit) {
    return <>
      <HabitList
        habits={data.habits}
        onSelect={(id) => update({ activeHabitId: id })}
        onAdd={() => setAddingNew(true)}
      />
      <DevToolbar onAdvance={devAdvance} onReset={devReset} />
    </>
  }

  // Baseline complete — show transition screen with goal setting before activating
  const baselineEntries = activeHabit.entries.filter(e => e.actual != null)
  if (activeHabit.phase === 'baseline' && baselineEntries.length >= 7) {
    const avg = calcBaseline(activeHabit.entries)
    return <>
      <BaselineComplete
        habit={activeHabit}
        avg={avg}
        onStart={(userGoal) => handleActivate(userGoal)}
      />
      <DevToolbar onAdvance={devAdvance} onReset={devReset} />
    </>
  }

  // Morning check-in — only in active phase
  const yesterday = getYesterdayEntry(activeHabit)
  const todayEntry = getTodayEntry(activeHabit)
  const needsCheckIn = activeHabit.phase === 'active' &&
    yesterday && yesterday.actual != null && !yesterday.difficulty && !todayEntry

  if (needsCheckIn) {
    return <>
      <CheckIn
        habit={activeHabit}
        yesterdayEntry={yesterday}
        currentGoal={activeHabit.currentGoal}
        suggestGoal={(difficulty) => {
          return Math.round(calcNextGoal(activeHabit, activeHabit.currentGoal, difficulty))
        }}
        onComplete={(difficulty, userGoal) => {
          const updatedEntries = activeHabit.entries.map(e =>
            e.date === yesterday.date ? { ...e, difficulty } : e
          )
          updateHabit({
            entries: updatedEntries,
            currentGoal: userGoal,
          })
        }}
      />
      <DevToolbar onAdvance={devAdvance} onReset={devReset} />
    </>
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <nav className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
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
        <div className="w-10" />
      </nav>

      {view === 'daily' ? (
        <DailyView
          data={{ ...data, habit: activeHabit, phase: activeHabit.phase, currentGoal: activeHabit.currentGoal, entries: activeHabit.entries }}
          onLog={(actual) => {
            const today = getToday()
            const existing = activeHabit.entries.find(e => e.date === today)
            if (existing) {
              updateHabit({
                entries: activeHabit.entries.map(e =>
                  e.date === today ? { ...e, actual, finalized: actual == null ? false : e.finalized } : e
                ),
              })
            } else {
              updateHabit({
                entries: [...activeHabit.entries, {
                  date: today,
                  goal: activeHabit.currentGoal,
                  actual,
                  difficulty: null,
                  finalized: false,
                }],
              })
            }
          }}
          onFinalize={(done, note) => {
            const today = getToday()
            updateHabit({
              entries: activeHabit.entries.map(e =>
                e.date === today ? { ...e, finalized: done, ...(note !== undefined ? { note } : {}) } : e
              ),
            })
          }}
          onActivate={handleActivate}
        />
      ) : (
        <Progress data={{ ...data, habit: activeHabit, phase: activeHabit.phase, currentGoal: activeHabit.currentGoal, entries: activeHabit.entries }} />
      )}

      <DevToolbar onAdvance={devAdvance} onReset={devReset} />
    </div>
  )
}

export default App
