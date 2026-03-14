import { useState } from 'react'
import { getTodayEntry } from '../store'
import { getMessage } from '../messages'

export default function DailyView({ data, onLog, onFinalize, onActivate }) {
  const todayEntry = getTodayEntry(data)
  const [inputValue, setInputValue] = useState(todayEntry?.actual?.toString() || '')
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)
  const [showReflection, setShowReflection] = useState(false)
  const [reflectionNote, setReflectionNote] = useState('')
  const [showSuccessReflection, setShowSuccessReflection] = useState(false)
  const [successNote, setSuccessNote] = useState('')
  const logged = todayEntry?.actual != null
  const finalized = todayEntry?.finalized === true
  const isBaseline = data.phase === 'baseline'
  const isReduce = data.habit?.direction === 'reduce'
  const missedGoal = logged && data.currentGoal != null &&
    (isReduce ? todayEntry.actual > data.currentGoal : todayEntry.actual < data.currentGoal)
  const daysLogged = data.entries.filter(e => e.actual != null).length
  const daysLeft = Math.max(0, 7 - daysLogged)

  const handleLog = () => {
    const val = Math.round(Number(inputValue) * 1000) / 1000
    if (!isNaN(val) && val >= 0) {
      onLog(val)
    }
  }

  return (
    <div className="flex flex-col items-center p-6 pt-10">
      <div className="max-w-md w-full">
        {/* Top card — goal (active) or baseline info */}
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-warm-100 mb-6">
          {isBaseline ? (
            <>
              <p className="text-sm text-warm-400 uppercase tracking-wider mb-1">Baseline tracking</p>
              <p className="text-lg text-warm-700 font-medium mt-2">
                Day {daysLogged + (logged ? 0 : 1)} of 7
              </p>
              <p className="text-sm text-warm-400 mt-2">
                {daysLeft > 0 && !logged
                  ? "Just track what you naturally do today."
                  : daysLeft > 0
                  ? `${daysLeft} more day${daysLeft === 1 ? '' : 's'} of tracking.`
                  : "Baseline complete! Ready to start your goals."
                }
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-warm-400 uppercase tracking-wider mb-1">Today's goal</p>
              <p className="text-6xl font-bold text-warm-900 mb-1">{data.currentGoal}</p>
              <p className="text-warm-500">{data.habit.unit}</p>
              <p className="text-xs text-warm-300 mt-3">
                {data.habit.direction === 'reduce'
                  ? `Baseline: ${data.habit.baseline} · ${Math.round((1 - data.currentGoal / data.habit.baseline) * 100)}% reduction`
                  : `Baseline: ${data.habit.baseline} · ${Math.round((data.currentGoal / data.habit.baseline - 1) * 100)}% increase`
                }
              </p>
            </>
          )}
        </div>

        {/* Log section */}
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-warm-100">

          {/* Baseline: simple one-shot log */}
          {isBaseline ? (
            <>
              <p className="text-sm text-warm-400 uppercase tracking-wider mb-4">
                {logged ? "Today's log" : "How much did you naturally do today?"}
              </p>
              {logged ? (
                <>
                  <p className="text-5xl font-bold text-warm-900 mb-1">{todayEntry.actual}</p>
                  <p className="text-warm-500 mb-4">{data.habit.unit}</p>
                  <button
                    onClick={() => {
                      setInputValue(todayEntry.actual.toString())
                      onLog(null)
                    }}
                    className="mt-2 text-sm text-warm-400 hover:text-warm-600 transition-colors"
                  >
                    Edit
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        const cur = Math.round((Number(inputValue) || 0) * 10) / 10
                        const next = Math.max(0, Math.round((cur - 0.1) * 10) / 10)
                        setInputValue(String(next))
                      }}
                      className="w-10 h-10 rounded-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors text-xl font-bold flex items-center justify-center shadow-sm"
                    >
                      −
                    </button>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={inputValue}
                      onChange={e => {
                        const raw = e.target.value
                        if (raw === '' || /^\d*\.?\d{0,3}$/.test(raw)) {
                          setInputValue(raw)
                        }
                      }}
                      placeholder="0"
                      className="text-5xl font-bold text-center w-32 bg-transparent border-b-3 border-warm-200 focus:border-sage-500 outline-none text-warm-900 pb-2 transition-colors"
                    />
                    <button
                      onClick={() => {
                        const cur = Math.round((Number(inputValue) || 0) * 10) / 10
                        const next = Math.round((cur + 0.1) * 10) / 10
                        setInputValue(String(next))
                      }}
                      className="w-10 h-10 rounded-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors text-xl font-bold flex items-center justify-center shadow-sm"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-warm-400 mt-2 mb-6">{data.habit.unit}</p>
                  <button
                    onClick={handleLog}
                    disabled={!inputValue}
                    className="w-full bg-sage-500 text-white py-3.5 rounded-2xl font-medium hover:bg-sage-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Log it
                  </button>
                </>
              )}
            </>
          ) : finalized ? (
            /* Active phase — finalized: show summary */
            <>
              <p className="text-sm text-warm-400 uppercase tracking-wider mb-4">How'd it go today?</p>
              <p className="text-5xl font-bold text-warm-900 mb-1">{todayEntry.actual}</p>
              <p className="text-warm-500 mb-4">{data.habit.unit}</p>
              <p className="text-warm-600 italic text-sm px-4">
                {getMessage(todayEntry.actual, data.currentGoal, data.habit)}
              </p>
              <button
                onClick={() => {
                  setInputValue(todayEntry.actual.toString())
                  onFinalize(false)
                }}
                className="mt-4 text-sm text-warm-400 hover:text-warm-600 transition-colors"
              >
                Edit
              </button>
            </>
          ) : (
            /* Active phase — not finalized: editable log */
            <>
              <p className="text-sm text-warm-400 uppercase tracking-wider mb-4">
                Log as you go
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    const cur = Math.round((Number(inputValue) || 0) * 10) / 10
                    const next = Math.max(0, Math.round((cur - 0.1) * 10) / 10)
                    setInputValue(String(next))
                    onLog(next)
                  }}
                  className="w-10 h-10 rounded-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors text-xl font-bold flex items-center justify-center shadow-sm"
                >
                  −
                </button>
                <input
                  type="text"
                  inputMode="decimal"
                  value={inputValue}
                  onChange={e => {
                    const raw = e.target.value
                    if (raw === '' || /^\d*\.?\d{0,3}$/.test(raw)) {
                      setInputValue(raw)
                      const val = Math.round(Number(raw) * 1000) / 1000
                      if (!isNaN(val) && val >= 0 && raw !== '') {
                        onLog(val)
                      }
                    }
                  }}
                  placeholder="0"
                  className="text-5xl font-bold text-center w-32 bg-transparent border-b-3 border-warm-200 focus:border-sage-500 outline-none text-warm-900 pb-2 transition-colors"
                />
                <button
                  onClick={() => {
                    const cur = Math.round((Number(inputValue) || 0) * 10) / 10
                    const next = Math.round((cur + 0.1) * 10) / 10
                    setInputValue(String(next))
                    onLog(next)
                  }}
                  className="w-10 h-10 rounded-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors text-xl font-bold flex items-center justify-center shadow-sm"
                >
                  +
                </button>
              </div>
              <p className="text-warm-400 mt-2 mb-6">{data.habit.unit}</p>
              <button
                onClick={() => {
                  if (missedGoal) {
                    setShowReflection(true)
                  } else {
                    setShowSuccessReflection(true)
                  }
                }}
                disabled={!logged}
                className="w-full bg-sage-500 text-white py-3.5 rounded-2xl font-medium hover:bg-sage-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Done logging
              </button>

              {/* Reflection prompt when goal was missed */}
              {showReflection && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
                  <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl">
                    <p className="text-lg font-bold text-warm-900 mb-2 text-center">
                      What drained your energy today?
                    </p>
                    <p className="text-sm text-warm-500 text-center mb-4">
                      Your self-control runs on the same energy that handles stress, decisions, and emotions. When life pulls from that pool, habits take the hit.
                    </p>
                    <textarea
                      value={reflectionNote}
                      onChange={e => setReflectionNote(e.target.value)}
                      placeholder="e.g. had a stressful meeting, dealt with car trouble, felt more anxious than usual, didn't sleep well..."
                      rows={3}
                      className="w-full p-3 rounded-xl bg-warm-50 border border-warm-100 text-warm-900 text-sm placeholder:text-warm-300 outline-none focus:border-sage-400 resize-none mb-4"
                    />
                    <button
                      onClick={() => {
                        setShowReflection(false)
                        onFinalize(true, reflectionNote)
                      }}
                      disabled={!reflectionNote.trim()}
                      className="w-full bg-sage-500 text-white py-3 rounded-2xl font-medium hover:bg-sage-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Save & finish
                    </button>
                  </div>
                </div>
              )}

              {/* Success reflection when goal was hit */}
              {showSuccessReflection && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
                  <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl">
                    <p className="text-lg font-bold text-warm-900 mb-2 text-center">
                      What helped you succeed today?
                    </p>
                    <p className="text-sm text-warm-500 text-center mb-4">
                      Understanding what works helps you replicate it.
                    </p>
                    <textarea
                      value={successNote}
                      onChange={e => setSuccessNote(e.target.value)}
                      placeholder="e.g. got enough sleep, stayed busy, planned ahead, avoided triggers, felt motivated..."
                      rows={3}
                      className="w-full p-3 rounded-xl bg-warm-50 border border-warm-100 text-warm-900 text-sm placeholder:text-warm-300 outline-none focus:border-sage-400 resize-none mb-4"
                    />
                    <button
                      onClick={() => {
                        setShowSuccessReflection(false)
                        onFinalize(true, successNote || undefined)
                      }}
                      className="w-full bg-sage-500 text-white py-3 rounded-2xl font-medium hover:bg-sage-600 transition-colors"
                    >
                      {successNote.trim() ? 'Save & finish' : 'Finish'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Early activation option during baseline */}
        {isBaseline && daysLogged >= 1 && logged && (
          <>
            <button
              onClick={() => setShowSkipConfirm(true)}
              className="mt-6 text-xs text-red-400 hover:text-red-500 transition-colors mx-auto block"
            >
              Skip baseline — start {data.habit.direction === 'reduce' ? 'decreasing' : 'increasing'} now
            </button>

            {showSkipConfirm && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
                <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl">
                  <p className="text-lg font-bold text-warm-900 mb-2 text-center">Are you sure?</p>
                  <p className="text-sm text-warm-500 text-center mb-6">
                    This is not recommended. Tracking for 7 days first gives you a better baseline to set accurate goals.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSkipConfirm(false)}
                      className="flex-1 py-3 rounded-2xl font-medium bg-sage-500 text-white hover:bg-sage-600 transition-colors"
                    >
                      Keep tracking
                    </button>
                    <button
                      onClick={() => { setShowSkipConfirm(false); onActivate() }}
                      className="flex-1 py-3 rounded-2xl font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
                    >
                      Skip anyway
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Recent entries */}
        {data.entries.length > 0 && (
          <div className="mt-8">
            <p className="text-sm text-warm-400 uppercase tracking-wider mb-3">Recent</p>
            <div className="space-y-2">
              {data.entries.slice(-5).reverse().map(entry => {
                const isReduce = data.habit.direction === 'reduce'
                const hasGoal = entry.goal != null
                const hitGoal = hasGoal && (isReduce ? entry.actual <= entry.goal : entry.actual >= entry.goal)
                return (
                  <div key={entry.date} className="flex items-center justify-between p-3 bg-white rounded-xl border border-warm-100">
                    <span className="text-sm text-warm-500">
                      {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-3">
                      {hasGoal && <span className="text-sm text-warm-400">Goal: {entry.goal}</span>}
                      <span className={`text-sm font-medium ${hasGoal ? (hitGoal ? 'text-sage-600' : 'text-coral-500') : 'text-warm-700'}`}>
                        {entry.actual != null ? entry.actual : '—'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
