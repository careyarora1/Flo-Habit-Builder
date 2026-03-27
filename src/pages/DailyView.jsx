import { useState } from 'react'
import { getMessage } from '../messages'
import JunkfoodGuide from '../components/JunkfoodGuide'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDate()
  const suffix = [,'st','nd','rd'][day % 10] && day < 11 || day > 13
    ? ['st','nd','rd'][(day % 10) - 1] || 'th'
    : 'th'
  return d.toLocaleDateString('en-US', { month: 'long' }) + ' ' + day + suffix
}

export default function DailyView({ data, viewingDate, onLog, onFinalize, onActivate, canGoForward, onPrevDay, onNextDay, onSetGoal }) {
  const entry = data.entries.find(e => e.date === viewingDate)
  const [inputValue, setInputValue] = useState(entry?.actual?.toString() || '')
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)
  const [showSkipGoalSetting, setShowSkipGoalSetting] = useState(false)
  const [skipGoalValue, setSkipGoalValue] = useState(0.1)
  const [showReflection, setShowReflection] = useState(false)
  const [reflectionNote, setReflectionNote] = useState('')
  const [showSuccessReflection, setShowSuccessReflection] = useState(false)
  const [successNote, setSuccessNote] = useState('')
  const [showScoringGuide, setShowScoringGuide] = useState(false)

  const layers = data.habit?.layers || []
  const hasLayers = layers.length > 0
  // Layer input values: { layerId: 'value' }
  const [layerValues, setLayerValues] = useState(() => {
    const init = {}
    layers.forEach(l => { init[l.id] = entry?.layerData?.[l.id]?.actual?.toString() || '' })
    return init
  })

  const isJunkFood = data.habit?.name === 'Junk food'
  const logged = entry?.actual != null
  const finalized = entry?.finalized === true
  const isBaseline = data.phase === 'baseline'
  const isReduce = data.habit?.direction === 'reduce'
  const missedGoal = logged && entry && data.currentGoal != null &&
    (isReduce ? entry.actual > data.currentGoal : entry.actual < data.currentGoal)
  const daysLogged = data.entries.filter(e => e.actual != null).length
  const daysLeft = Math.max(0, 7 - daysLogged)

  // Morning setup: active phase, today has no goal set yet (need to reflect on yesterday + set today's goal)
  const needsMorningSetup = !isBaseline && entry?.goal == null

  // Check if this day is fully complete (for gating forward navigation)
  const dayComplete = isBaseline
    ? logged
    : (finalized === true)

  const handleLog = () => {
    const val = Math.round(Number(inputValue) * 1000) / 1000
    if (!isNaN(val) && val >= 0) {
      onLog(val, viewingDate)
    }
  }

  // Whether there are previous entries to go back to
  const hasPrevEntries = data.entries.length > 0 && data.entries[0]?.date < viewingDate

  return (
    <div className="flex flex-col items-center p-6 pt-4 pb-24">
      <div className="max-w-md w-full">

        {/* Date display */}
        <p className="text-center text-warm-500 font-medium text-lg mb-4">
          {formatDate(viewingDate)}
        </p>

        {/* Morning setup: reflect on yesterday + set today's goal */}
        {needsMorningSetup && (
          <MorningSetup
            habit={data.habit}
            entries={data.entries}
            viewingDate={viewingDate}
            onComplete={(difficulty, goal, layerGoals) => onSetGoal(difficulty, goal, viewingDate, layerGoals)}
          />
        )}

        {/* Top card — goal (active) or baseline info */}
        {!needsMorningSetup && (<>
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm mb-6 cable-accent steel-plate">
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
              <p className="text-sm text-warm-400 uppercase tracking-wider mb-1">Today's goal{hasLayers ? 's' : ''}</p>
              {hasLayers ? (
                <div className="space-y-2 mt-3">
                  {layers.map(l => (
                    <div key={l.id} className="flex items-center justify-between">
                      <span className="text-sm text-warm-600">{l.name}</span>
                      <span className="text-2xl font-bold text-warm-900">{entry?.layerData?.[l.id]?.goal ?? data.habit.layerGoals?.[l.id] ?? '—'} <span className="text-sm text-warm-400 font-normal">{l.unit}</span></span>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <p className="text-6xl font-bold text-warm-900 mb-1">{data.currentGoal}</p>
                  <p className="text-warm-500">{data.habit.unit}</p>
                </>
              )}
              {!hasLayers && data.habit.baseline > 0 && (
                <p className="text-xs text-warm-300 mt-3">
                  {data.habit.direction === 'reduce'
                    ? `Baseline: ${data.habit.baseline} · ${Math.round((1 - data.currentGoal / data.habit.baseline) * 100)}% reduction`
                    : `Baseline: ${data.habit.baseline} · ${Math.round((data.currentGoal / data.habit.baseline - 1) * 100)}% increase`
                  }
                </p>
              )}
            </>
          )}
        </div>

        {/* Log section */}
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm steel-plate">

          {/* Baseline: simple one-shot log */}
          {isBaseline ? (
            <>
              <p className="text-sm text-warm-400 uppercase tracking-wider mb-4">
                {logged ? "Today's log" : "How much did you naturally do today?"}
              </p>
              {logged && !hasLayers ? (
                <>
                  <p className="text-5xl font-bold text-warm-900 mb-1">{entry.actual}</p>
                  <p className="text-warm-500 mb-4">{data.habit.unit}</p>
                  <button
                    onClick={() => {
                      setInputValue(entry.actual.toString())
                      onLog(null, viewingDate)
                    }}
                    className="mt-2 text-sm text-warm-400 hover:text-warm-600 transition-colors"
                  >
                    Edit
                  </button>
                </>
              ) : logged && hasLayers ? (
                <>
                  {layers.map(l => (
                    <div key={l.id} className="flex items-center justify-between py-2 border-b border-warm-50 last:border-0">
                      <span className="text-sm text-warm-600">{l.name}</span>
                      <span className="text-lg font-semibold text-warm-900">{entry?.layerData?.[l.id]?.actual ?? '—'} <span className="text-sm text-warm-400">{l.unit}</span></span>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const init = {}
                      layers.forEach(l => { init[l.id] = entry?.layerData?.[l.id]?.actual?.toString() || '' })
                      setLayerValues(init)
                      onLog(null, viewingDate)
                    }}
                    className="mt-3 text-sm text-warm-400 hover:text-warm-600 transition-colors"
                  >
                    Edit
                  </button>
                </>
              ) : hasLayers ? (
                <>
                  <div className="space-y-4 text-left mb-6">
                    {layers.map(l => (
                      <div key={l.id}>
                        <p className="text-sm font-medium text-warm-700 mb-1">{l.name} <span className="text-warm-400 font-normal">({l.unit})</span></p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const cur = Math.round((Number(layerValues[l.id]) || 0) * 10) / 10
                              const next = Math.max(0, Math.round((cur - 0.1) * 10) / 10)
                              setLayerValues(v => ({ ...v, [l.id]: String(next) }))
                            }}
                            className="w-9 h-9 rounded-full border-2 border-sage-500 text-sage-500 hover:bg-sage-500 hover:text-warm-50 transition-colors text-lg font-bold flex items-center justify-center"
                          >−</button>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={layerValues[l.id] || ''}
                            onChange={e => {
                              const raw = e.target.value
                              if (raw === '' || /^\d*\.?\d{0,3}$/.test(raw)) {
                                setLayerValues(v => ({ ...v, [l.id]: raw }))
                              }
                            }}
                            placeholder="0"
                            className="flex-1 text-2xl font-bold text-center bg-transparent border-b-2 border-warm-200 focus:border-sage-500 outline-none text-warm-900 pb-1"
                          />
                          <button
                            onClick={() => {
                              const cur = Math.round((Number(layerValues[l.id]) || 0) * 10) / 10
                              const next = Math.round((cur + 0.1) * 10) / 10
                              setLayerValues(v => ({ ...v, [l.id]: String(next) }))
                            }}
                            className="w-9 h-9 rounded-full border-2 border-sage-500 text-sage-500 hover:bg-sage-500 hover:text-warm-50 transition-colors text-lg font-bold flex items-center justify-center"
                          >+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const layerData = {}
                      let total = 0
                      layers.forEach(l => {
                        const val = Math.round(Number(layerValues[l.id] || 0) * 1000) / 1000
                        layerData[l.id] = { actual: val }
                        total += val
                      })
                      onLog(total, viewingDate, layerData)
                    }}
                    disabled={!Object.values(layerValues).some(v => v !== '')}
                    className="w-full bg-sage-500 text-white py-3.5 rounded-2xl font-medium hover:bg-sage-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Log it
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
                      className="w-10 h-10 rounded-full border-2 border-sage-500 text-sage-500 hover:bg-sage-500 hover:text-warm-50 transition-colors text-xl font-bold flex items-center justify-center shadow-sm"
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
                      className="w-10 h-10 rounded-full border-2 border-sage-500 text-sage-500 hover:bg-sage-500 hover:text-warm-50 transition-colors text-xl font-bold flex items-center justify-center shadow-sm"
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
              <p className="text-sm text-warm-400 uppercase tracking-wider mb-4">Day complete</p>
              {hasLayers ? (
                <>
                  {layers.map(l => (
                    <div key={l.id} className="flex items-center justify-between py-2 border-b border-warm-50 last:border-0">
                      <span className="text-sm text-warm-600">{l.name}</span>
                      <span className="text-lg font-semibold text-warm-900">{entry.layerData?.[l.id]?.actual ?? '—'} <span className="text-sm text-warm-400">{l.unit}</span></span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <p className="text-5xl font-bold text-warm-900 mb-1">{entry.actual}</p>
                  <p className="text-warm-500 mb-4">{data.habit.unit}</p>
                </>
              )}
              <p className="text-warm-600 italic text-sm px-4 mt-4">
                {getMessage(entry.actual, data.currentGoal, data.habit)}
              </p>
              <button
                onClick={() => {
                  setInputValue(entry.actual?.toString() || '')
                  if (hasLayers) {
                    const init = {}
                    layers.forEach(l => { init[l.id] = entry.layerData?.[l.id]?.actual?.toString() || '' })
                    setLayerValues(init)
                  }
                  onFinalize(false, undefined, viewingDate)
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
              {hasLayers ? (
                <div className="space-y-4 text-left mb-6">
                  {layers.map(l => (
                    <div key={l.id}>
                      <p className="text-sm font-medium text-warm-700 mb-1">{l.name} <span className="text-warm-400 font-normal">({l.unit})</span></p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const cur = Math.round((Number(layerValues[l.id]) || 0) * 10) / 10
                            const next = Math.max(0, Math.round((cur - 0.1) * 10) / 10)
                            const newVals = { ...layerValues, [l.id]: String(next) }
                            setLayerValues(newVals)
                            const layerData = {}
                            let total = 0
                            layers.forEach(la => {
                              const v = Math.round(Number(newVals[la.id] || 0) * 1000) / 1000
                              layerData[la.id] = { actual: v }
                              total += v
                            })
                            onLog(total, viewingDate, layerData)
                          }}
                          className="w-9 h-9 rounded-full border-2 border-sage-500 text-sage-500 hover:bg-sage-500 hover:text-warm-50 transition-colors text-lg font-bold flex items-center justify-center"
                        >−</button>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={layerValues[l.id] || ''}
                          onChange={e => {
                            const raw = e.target.value
                            if (raw === '' || /^\d*\.?\d{0,3}$/.test(raw)) {
                              const newVals = { ...layerValues, [l.id]: raw }
                              setLayerValues(newVals)
                              const layerData = {}
                              let total = 0
                              layers.forEach(la => {
                                const v = Math.round(Number(newVals[la.id] || 0) * 1000) / 1000
                                layerData[la.id] = { actual: v }
                                total += v
                              })
                              if (raw !== '') onLog(total, viewingDate, layerData)
                            }
                          }}
                          placeholder="0"
                          className="flex-1 text-2xl font-bold text-center bg-transparent border-b-2 border-warm-200 focus:border-sage-500 outline-none text-warm-900 pb-1"
                        />
                        <button
                          onClick={() => {
                            const cur = Math.round((Number(layerValues[l.id]) || 0) * 10) / 10
                            const next = Math.round((cur + 0.1) * 10) / 10
                            const newVals = { ...layerValues, [l.id]: String(next) }
                            setLayerValues(newVals)
                            const layerData = {}
                            let total = 0
                            layers.forEach(la => {
                              const v = Math.round(Number(newVals[la.id] || 0) * 1000) / 1000
                              layerData[la.id] = { actual: v }
                              total += v
                            })
                            onLog(total, viewingDate, layerData)
                          }}
                          className="w-9 h-9 rounded-full border-2 border-sage-500 text-sage-500 hover:bg-sage-500 hover:text-warm-50 transition-colors text-lg font-bold flex items-center justify-center"
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        const cur = Math.round((Number(inputValue) || 0) * 10) / 10
                        const next = Math.max(0, Math.round((cur - 0.1) * 10) / 10)
                        setInputValue(String(next))
                        onLog(next, viewingDate)
                      }}
                      className="w-10 h-10 rounded-full border-2 border-sage-500 text-sage-500 hover:bg-sage-500 hover:text-warm-50 transition-colors text-xl font-bold flex items-center justify-center shadow-sm"
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
                            onLog(val, viewingDate)
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
                        onLog(next, viewingDate)
                      }}
                      className="w-10 h-10 rounded-full border-2 border-sage-500 text-sage-500 hover:bg-sage-500 hover:text-warm-50 transition-colors text-xl font-bold flex items-center justify-center shadow-sm"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-warm-400 mt-2 mb-6">{data.habit.unit}</p>
                </>
              )}
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
                  <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl relative">
                    <button
                      onClick={() => setShowReflection(false)}
                      className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full text-warm-400 hover:bg-warm-100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                    </button>
                    <p className="text-base font-bold text-warm-900 mb-1 text-center" style={{ textDecoration: 'underline' }}>
                      Don't worry, this is totally normal
                    </p>
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
                        onFinalize(true, reflectionNote, viewingDate)
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
                  <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl relative">
                    <button
                      onClick={() => setShowSuccessReflection(false)}
                      className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full text-warm-400 hover:bg-warm-100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                    </button>
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
                        onFinalize(true, successNote || undefined, viewingDate)
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
                      onClick={() => { setShowSkipConfirm(false); setShowSkipGoalSetting(true) }}
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

        {/* Goal setting after skipping baseline */}
        {showSkipGoalSetting && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl steel-plate">
              <button
                onClick={() => setShowSkipGoalSetting(false)}
                className="text-warm-400 hover:text-warm-600 mb-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
              </button>
              <p className="text-lg font-bold text-warm-900 mb-2 text-center">Be honest with yourself.</p>
              <p className="text-sm text-warm-500 text-center mb-1">
                Pick a goal you are 100% confident you will succeed at. The point is to succeed each day at the goal you set. Don't worry about how much of an improvement you can make, just make an improvement.
              </p>
              <p className="text-xs text-warm-400 text-center mb-6">
                If you're still not sure what's a good goal, set a goal that seems pointless — a number that you just know you will not fail, even if it feels trivial. Building habits is about a gradual process that is unnoticeable, which is exactly how bad habits come to be in the first place.
              </p>
              <div className="flex items-center justify-center gap-4 mb-2">
                <button
                  onClick={() => setSkipGoalValue(v => Math.max(0.1, Math.round(((Number(v) || 0) - 0.1) * 10) / 10))}
                  className="w-10 h-10 rounded-full border-2 border-warm-200 text-warm-500 flex items-center justify-center text-xl font-bold hover:border-warm-300"
                >−</button>
                <div className="text-center">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={skipGoalValue}
                    onChange={e => {
                      const raw = e.target.value
                      if (raw === '' || /^\d*\.?\d{0,1}$/.test(raw)) {
                        setSkipGoalValue(raw)
                      }
                    }}
                    className="text-5xl font-bold text-center w-28 bg-transparent border-b-2 border-warm-200 focus:border-sage-500 outline-none text-warm-900 pb-1"
                  />
                  <p className="text-warm-500 text-sm">{data.habit.unit}</p>
                </div>
                <button
                  onClick={() => setSkipGoalValue(v => Math.round(((Number(v) || 0) + 0.1) * 10) / 10)}
                  className="w-10 h-10 rounded-full border-2 border-warm-200 text-warm-500 flex items-center justify-center text-xl font-bold hover:border-warm-300"
                >+</button>
              </div>
              <button
                onClick={() => { setShowSkipGoalSetting(false); onActivate(Number(skipGoalValue) || 0.1) }}
                className="w-full bg-sage-500 text-white py-3.5 rounded-2xl font-medium text-lg hover:bg-sage-600 transition-colors"
              >
                I can do this — let's go
              </button>
            </div>
          </div>
        )}

        {/* Recent entries */}
        {data.entries.length > 0 && (
          <div className="mt-8">
            <p className="text-sm text-warm-400 uppercase tracking-wider mb-3">Recent</p>
            <div className="space-y-2">
              {data.entries.slice(-5).reverse().map(e => {
                const hasGoal = e.goal != null
                const hitGoal = hasGoal && (isReduce ? e.actual <= e.goal : e.actual >= e.goal)
                return (
                  <div key={e.date} className="flex items-center justify-between p-3 bg-white rounded-xl border border-warm-100">
                    <span className="text-sm text-warm-500">
                      {new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-3">
                      {hasGoal && <span className="text-sm text-warm-400">Goal: {e.goal}</span>}
                      <span className={`text-sm font-medium ${hasGoal ? (hitGoal ? 'text-sage-600' : 'text-coral-500') : 'text-warm-700'}`}>
                        {e.actual != null ? e.actual : '—'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Junkfood scoring help button */}
        {isJunkFood && (
          <button
            onClick={() => setShowScoringGuide(true)}
            className="mt-6 flex items-center justify-center gap-1.5 text-sm text-sage-600 hover:text-sage-700 transition-colors mx-auto"
          >
            <span className="w-5 h-5 rounded-full border-2 border-sage-500 flex items-center justify-center text-xs font-bold">?</span>
            How to score your food
          </button>
        )}

        {/* Junkfood scoring guide modal */}
        {showScoringGuide && (
          <JunkfoodGuide
            isModal
            onBack={() => setShowScoringGuide(false)}
          />
        )}
        </>)}
      </div>

      {/* Day navigation arrows */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-between items-center px-6 py-4 z-40 pointer-events-none">
        <button
          onClick={onPrevDay}
          disabled={!hasPrevEntries}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg pointer-events-auto transition-all ${
            hasPrevEntries
              ? 'bg-white border-2 border-warm-200 text-warm-600 hover:bg-warm-50 hover:border-warm-300'
              : 'bg-warm-100 text-warm-200 cursor-not-allowed'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>

        <button
          onClick={() => {
            if (!dayComplete) return
            onNextDay()
          }}
          disabled={!canGoForward || !dayComplete}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg pointer-events-auto transition-all ${
            canGoForward && dayComplete
              ? 'bg-sage-500 text-white hover:bg-sage-600'
              : 'bg-warm-100 text-warm-200 cursor-not-allowed'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  )
}

function MorningSetup({ habit, entries, viewingDate, onComplete }) {
  // Skip reflection if there's no previous entry with a goal (e.g. first day after baseline)
  const sortedAll = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const prev = sortedAll.filter(e => e.date < viewingDate).pop()
  const hasPrevGoal = prev?.goal != null
  const [step, setStep] = useState(hasPrevGoal ? 'reflect' : 'set-goal') // 'reflect' | 'set-goal'
  const [difficulty, setDifficulty] = useState(null)
  const [goalInput, setGoalInput] = useState('')

  const layers = habit.layers || []
  const hasLayers = layers.length > 0
  const [layerGoalInputs, setLayerGoalInputs] = useState(() => {
    const init = {}
    layers.forEach(l => { init[l.id] = '' })
    return init
  })

  const isReduce = habit.direction === 'reduce'

  // Find yesterday's entry to show what they logged
  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const prevEntry = sortedEntries.filter(e => e.date < viewingDate).pop()

  const options = isReduce
    ? [
        { value: 'too-easy', label: 'I can cut more', desc: "It felt easy — I'm ready to push further" },
        { value: 'about-right', label: 'Keep it the same', desc: "That pace feels right for now" },
        { value: 'too-hard', label: 'I need more room', desc: "It was a stretch — I need to ease up a bit" },
      ]
    : [
        { value: 'too-easy', label: 'I can do more', desc: "It felt easy — I'm ready to push further" },
        { value: 'about-right', label: 'Keep it the same', desc: "That pace feels right for now" },
        { value: 'too-hard', label: 'I need to dial back', desc: "It was a stretch — I need to ease up a bit" },
      ]

  if (step === 'reflect') {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm steel-plate">
        <p className="text-lg font-bold text-warm-900 mb-2 text-center">
          How did yesterday feel?
        </p>
        {prevEntry && (
          <>
            {hasLayers && prevEntry.layerData ? (
              <div className="mb-6">
                {layers.map(l => (
                  <p key={l.id} className="text-sm text-warm-500 text-center">
                    {l.name}: <span className="font-semibold text-warm-700">{prevEntry.layerData[l.id]?.actual ?? '—'} {l.unit}</span>
                    {prevEntry.layerData[l.id]?.goal != null && (
                      <span className="text-warm-400"> (goal: {prevEntry.layerData[l.id].goal})</span>
                    )}
                  </p>
                ))}
              </div>
            ) : (
              <>
                <p className="text-sm text-warm-500 text-center mb-1">
                  You logged <span className="font-semibold text-warm-700">{prevEntry.actual} {habit.unit}</span>
                </p>
                {prevEntry.goal != null && (
                  <p className="text-sm text-warm-400 text-center mb-6">
                    Your goal was {prevEntry.goal} {habit.unit}
                  </p>
                )}
              </>
            )}
          </>
        )}
        <div className="grid gap-3">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDifficulty(opt.value)}
              className={`p-4 rounded-2xl text-left border-2 transition-all ${
                difficulty === opt.value
                  ? 'border-sage-500 bg-sage-50'
                  : 'border-warm-100 hover:border-warm-200'
              }`}
            >
              <div className="font-medium text-warm-900">{opt.label}</div>
              <div className="text-sm text-warm-400">{opt.desc}</div>
            </button>
          ))}
        </div>
        <button
          onClick={() => setStep('set-goal')}
          disabled={!difficulty}
          className="w-full mt-4 bg-sage-500 text-white py-3 rounded-2xl font-medium hover:bg-sage-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    )
  }

  // Step 2: Set today's goal(s)
  const allLayerGoalsSet = hasLayers && layers.every(l => layerGoalInputs[l.id] && Number(layerGoalInputs[l.id]) >= 0)

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm steel-plate">
      <button
        onClick={() => setStep('reflect')}
        className="w-8 h-8 flex items-center justify-center rounded-full text-warm-400 hover:bg-warm-100 transition-colors mb-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
      </button>
      <p className="text-lg font-bold text-warm-900 mb-2 text-center">
        Set today's {hasLayers ? 'goals' : 'goal'}
      </p>
      <p className="text-sm text-warm-500 text-center mb-2">
        Pick a goal you are 100% confident you will succeed at. The point is to succeed each day at the goal you set. Don't worry about how much of an improvement you can make, just make an improvement.
      </p>
      <p className="text-xs text-warm-400 text-center mb-6">
        If you're still not sure what's a good goal, set a goal that seems pointless — a number that you just know you will not fail, even if it feels trivial. Building habits is about a gradual process that is unnoticeable, which is exactly how bad habits come to be in the first place.
      </p>

      {hasLayers ? (
        <div className="space-y-5 mb-6">
          {layers.map(l => (
            <div key={l.id} className="bg-warm-50 rounded-2xl p-4">
              <p className="text-sm font-medium text-warm-700 mb-2">{l.name} <span className="text-warm-400 font-normal">({l.unit})</span></p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    const cur = Math.round((Number(layerGoalInputs[l.id]) || 0) * 10) / 10
                    const next = Math.max(0, Math.round((cur - 0.1) * 10) / 10)
                    setLayerGoalInputs(v => ({ ...v, [l.id]: String(next) }))
                  }}
                  className="w-9 h-9 rounded-full border-2 border-sage-500 text-sage-500 hover:bg-sage-500 hover:text-warm-50 transition-colors text-lg font-bold flex items-center justify-center"
                >−</button>
                <input
                  type="text"
                  inputMode="decimal"
                  value={layerGoalInputs[l.id] || ''}
                  onChange={e => {
                    const raw = e.target.value
                    if (raw === '' || /^\d*\.?\d{0,3}$/.test(raw)) {
                      setLayerGoalInputs(v => ({ ...v, [l.id]: raw }))
                    }
                  }}
                  placeholder="0"
                  className="text-3xl font-bold text-center w-24 bg-transparent border-b-2 border-warm-200 focus:border-sage-500 outline-none text-warm-900 pb-1"
                />
                <button
                  onClick={() => {
                    const cur = Math.round((Number(layerGoalInputs[l.id]) || 0) * 10) / 10
                    const next = Math.round((cur + 0.1) * 10) / 10
                    setLayerGoalInputs(v => ({ ...v, [l.id]: String(next) }))
                  }}
                  className="w-9 h-9 rounded-full border-2 border-sage-500 text-sage-500 hover:bg-sage-500 hover:text-warm-50 transition-colors text-lg font-bold flex items-center justify-center"
                >+</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-3 mb-2">
            <button
              onClick={() => {
                const cur = Math.round((Number(goalInput) || 0) * 10) / 10
                const next = Math.max(0, Math.round((cur - 0.1) * 10) / 10)
                setGoalInput(String(next))
              }}
              className="w-10 h-10 rounded-full border-2 border-sage-500 text-sage-500 hover:bg-sage-500 hover:text-warm-50 transition-colors text-xl font-bold flex items-center justify-center shadow-sm"
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
              placeholder="0"
              className="text-5xl font-bold text-center w-32 bg-transparent border-b-3 border-warm-200 focus:border-sage-500 outline-none text-warm-900 pb-2 transition-colors"
            />
            <button
              onClick={() => {
                const cur = Math.round((Number(goalInput) || 0) * 10) / 10
                const next = Math.round((cur + 0.1) * 10) / 10
                setGoalInput(String(next))
              }}
              className="w-10 h-10 rounded-full border-2 border-sage-500 text-sage-500 hover:bg-sage-500 hover:text-warm-50 transition-colors text-xl font-bold flex items-center justify-center shadow-sm"
            >
              +
            </button>
          </div>
          <p className="text-warm-400 text-sm text-center mb-6">{habit.unit}</p>
        </>
      )}

      <button
        onClick={() => {
          if (hasLayers) {
            const layerGoals = {}
            let totalGoal = 0
            layers.forEach(l => {
              const val = Number(layerGoalInputs[l.id] || 0)
              layerGoals[l.id] = val
              totalGoal += val
            })
            onComplete(difficulty, totalGoal, layerGoals)
          } else {
            const val = Number(goalInput)
            if (!isNaN(val) && val >= 0) {
              onComplete(difficulty, val)
            }
          }
        }}
        disabled={hasLayers ? !allLayerGoalsSet : (!goalInput || Number(goalInput) < 0)}
        className="w-full bg-sage-500 text-white py-3 rounded-2xl font-medium hover:bg-sage-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Let's go
      </button>
    </div>
  )
}
