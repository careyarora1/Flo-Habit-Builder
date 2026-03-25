import { useState } from 'react'
import BackButton from '../components/BackButton'
import JunkfoodGuide from '../components/JunkfoodGuide'

// Minimal line icons for each habit
const HabitIcon = ({ name }) => {
  const icons = {
    'Junk food': (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11h18M5 11c0-4 3.5-7 7-7s7 3 7 7"/><rect x="4" y="11" width="16" height="3" rx="1.5"/><path d="M7 14v2M12 14v2M17 14v2M6 16h12"/>
      </svg>
    ),
    'Smoking': (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17h13v3H3z"/><path d="M18 17h2v3h-2z"/><path d="M18 12V8c0-1.5-1-2-2-2"/><path d="M18 8c1.5 0 3 .5 3 3v1h-3"/><path d="M6 17v-1"/>
      </svg>
    ),
    'Screen time': (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/>
      </svg>
    ),
    'Social media': (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
    ),
    'Exercise': (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5l11 11"/><path d="M21 3l-2 6-4-4 6-2z"/><path d="M3 21l2-6 4 4-6 2z"/><path d="M14.5 13.5L11 10"/>
      </svg>
    ),
    'Reading': (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
    'Water intake': (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
      </svg>
    ),
  }
  return icons[name] || <span className="text-sm font-bold">+</span>
}

const presets = [
  { name: 'Junk food', unit: 'junkfoods', direction: 'reduce', unitOptions: ['junkfoods', 'items', 'times'] },
  { name: 'Smoking', unit: 'cigarettes', direction: 'reduce', unitOptions: ['cigarettes', 'puffs', 'packs'] },
  { name: 'Screen time', unit: 'hours', direction: 'reduce', unitOptions: ['hours', 'minutes'] },
  { name: 'Social media', unit: 'hours', direction: 'reduce', unitOptions: ['hours', 'minutes'] },
  { name: 'Exercise', unit: 'minutes', direction: 'build', unitOptions: ['minutes', 'hours', 'sessions'] },
  { name: 'Reading', unit: 'minutes', direction: 'build', unitOptions: ['minutes', 'pages', 'chapters'] },
  { name: 'Water intake', unit: 'glasses', direction: 'build', unitOptions: ['glasses', 'ounces', 'bottles', 'liters'] },
]

export default function Onboarding({ onComplete, startStep = 0, onBack }) {
  const [screen, setScreen] = useState(startStep === 0 ? 'welcome' : 'presets')
  const [habit, setHabit] = useState({ name: '', unit: '', direction: 'reduce', desiredOutcome: '', layers: [] })
  const [showCustom, setShowCustom] = useState(false)
  const [customUnit, setCustomUnit] = useState('')
  const [step, setStep] = useState(1)
  // Steps: 1=presets, 2=junkfood guide, 3=desired outcome, 4=unit+start, 5=build goal picker
  const [buildGoal, setBuildGoal] = useState(null)
  const [showLayers, setShowLayers] = useState(false)
  const [newLayerName, setNewLayerName] = useState('')
  const [newLayerUnit, setNewLayerUnit] = useState('')
  const [layerGoals, setLayerGoals] = useState({}) // { layerId: number }

  // ── Welcome screen ──────────────────────────────
  if (screen === 'welcome') {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-warm-900 mb-2">
            Change at your pace
          </h1>
          <p className="text-warm-600 mb-10">
            No streaks. No guilt. Just gradual progress that adapts to your life.
          </p>
          <button
            onClick={() => setScreen('presets')}
            className="w-full bg-sage-500 text-white py-3.5 px-6 rounded-2xl font-medium text-lg hover:bg-sage-600 transition-colors shadow-lg shadow-sage-500/20"
          >
            Get started
          </button>
        </div>
      </div>
    )
  }

  // ── Preset selection ────────────────────────────
  if (screen !== 'presets') return null

  const preset = presets.find(p => p.name === habit.name)
  const options = preset?.unitOptions || []
  const isBuild = habit.direction === 'build'
  const isReduce = habit.direction === 'reduce'

  // ── Step 1: Pick a habit ────────────────────────
  if (step === 1) {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center p-6 pt-16">
        <div className="max-w-md w-full">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-1 text-warm-400 hover:text-warm-300 mb-4 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back to habits
            </button>
          )}
          <h2 className="text-2xl font-bold text-warm-900 mb-2">
            What do you want to work on?
          </h2>
          <p className="text-warm-500 mb-8">Pick a habit to get started.</p>

          <div className="grid gap-3">
            {presets.map(p => (
              <button
                key={p.name}
                onClick={() => {
                  setHabit({ name: p.name, unit: p.unit, direction: p.direction, desiredOutcome: '', layers: [] })
                  setStep(p.name === 'Junk food' ? 2 : 3)
                }}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl text-left hover:shadow-md transition-all steel-plate"
              >
                <span className="w-10 h-10 rounded-xl bg-warm-100 text-warm-600 flex items-center justify-center flex-shrink-0"><HabitIcon name={p.name} /></span>
                <div>
                  <div className="font-medium text-warm-900">{p.name}</div>
                  <div className="text-sm text-warm-400">
                    {p.direction === 'reduce' ? 'Reduce' : 'Build'}
                  </div>
                </div>
              </button>
            ))}

            {!showCustom ? (
              <button
                onClick={() => setShowCustom(true)}
                className="p-4 rounded-2xl font-medium border border-dashed border-amber-500/50 hover:border-amber-400 transition-colors"
                style={{ backgroundColor: 'rgba(210, 155, 50, 0.35)', color: '#ffffff', textShadow: '-1px -1px 0 #1a1a2e, 1px -1px 0 #1a1a2e, -1px 1px 0 #1a1a2e, 1px 1px 0 #1a1a2e, 0 0 8px rgba(18, 26, 42, 0.6)' }}
              >
                + Something else
              </button>
            ) : (
              <div className="p-4 bg-white rounded-2xl border border-warm-100 space-y-3">
                <input
                  type="text"
                  placeholder="Habit name"
                  value={habit.name}
                  onChange={e => setHabit(h => ({ ...h, name: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-warm-50 border border-warm-100 text-warm-900 placeholder:text-warm-300 outline-none focus:border-sage-400"
                />
                <input
                  type="text"
                  placeholder="Unit (e.g. minutes, times, cups)"
                  value={habit.unit}
                  onChange={e => setHabit(h => ({ ...h, unit: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-warm-50 border border-warm-100 text-warm-900 placeholder:text-warm-300 outline-none focus:border-sage-400"
                />
                <div className="flex gap-2">
                  {['reduce', 'build'].map(d => (
                    <button
                      key={d}
                      onClick={() => setHabit(h => ({ ...h, direction: d }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                        habit.direction === d
                          ? 'bg-sage-500 text-white'
                          : 'bg-warm-100 text-warm-500'
                      }`}
                    >
                      {d === 'reduce' ? 'Reduce' : 'Build up'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { if (habit.name && habit.unit) setStep(3) }}
                  disabled={!habit.name || !habit.unit}
                  className="w-full py-2.5 rounded-xl bg-sage-500 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Step 2: Junkfood scoring guide ──────────────
  if (step === 2) {
    return (
      <JunkfoodGuide
        onBack={() => setStep(1)}
        onContinue={() => setStep(3)}
      />
    )
  }

  // ── Step 3: Desired outcome ─────────────────────
  if (step === 3) {
    const outcomePlaceholder = isReduce
      ? `e.g. "Cut down to once a week" or "Quit entirely"`
      : `e.g. "30 minutes a day" or "3 times a week"`

    const outcomeQuestion = isReduce
      ? "Where do you want to end up?"
      : "What are you working towards?"

    const outcomeSubtext = isReduce
      ? "This is your long-term aim — not what you need to do tomorrow. We'll work towards it gradually."
      : "Think big picture. We'll figure out a realistic starting point next."

    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center p-6 relative">
        <BackButton onClick={() => setStep(habit.name === 'Junk food' ? 2 : 1)} />
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-warm-900 mb-3">
            {outcomeQuestion}
          </h2>
          <p className="text-warm-500 mb-8 text-sm leading-relaxed">
            {outcomeSubtext}
          </p>

          <textarea
            value={habit.desiredOutcome}
            onChange={e => setHabit(h => ({ ...h, desiredOutcome: e.target.value }))}
            placeholder={outcomePlaceholder}
            rows={3}
            className="w-full p-4 rounded-2xl bg-white border border-warm-100 text-warm-900 placeholder:text-warm-300 outline-none focus:border-sage-400 resize-none text-center mb-6"
          />

          <button
            onClick={() => setStep(4)}
            disabled={!habit.desiredOutcome.trim()}
            className="w-full bg-sage-500 text-white py-3.5 px-6 rounded-2xl font-medium text-lg hover:bg-sage-600 transition-colors shadow-lg shadow-sage-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ── Step 4: Unit selection + how to start ───────
  if (step === 4) {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center p-6 relative">
        <BackButton onClick={() => setStep(3)} />
        <div className="max-w-md w-full text-center">

          {/* Reduce habits */}
          {isReduce && (
            <>
              <h2 className="text-2xl font-bold text-warm-900 mb-3">
                Before we set any goals, let's see where you're actually at.
              </h2>
              <p className="text-warm-500 mb-2 text-sm leading-relaxed">
                For the next seven days, don't try to change anything. Just track what you naturally do.
              </p>
              <p className="text-warm-400 mb-8 text-sm leading-relaxed">
                No judgement — we need honest data to set a goal you'll actually hit.
              </p>

              {options.length > 0 && (
                <div className="mb-6">
                  <p className="text-warm-400 text-xs uppercase tracking-wider mb-2">Track by</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {options.map(u => (
                      <button
                        key={u}
                        onClick={() => { setHabit(h => ({ ...h, unit: u })); setCustomUnit('') }}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          habit.unit === u && !customUnit
                            ? 'bg-sage-500 text-white'
                            : 'bg-warm-100 text-warm-500 hover:bg-warm-200'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                    <button
                      onClick={() => setCustomUnit(customUnit || ' ')}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        customUnit
                          ? 'bg-sage-500 text-white'
                          : 'bg-warm-100 text-warm-500 hover:bg-warm-200'
                      }`}
                    >
                      custom
                    </button>
                  </div>
                  {customUnit !== '' && (
                    <input
                      type="text"
                      value={customUnit.trim()}
                      onChange={e => {
                        setCustomUnit(e.target.value)
                        setHabit(h => ({ ...h, unit: e.target.value.trim() || h.unit }))
                      }}
                      placeholder="e.g. ounces, sessions"
                      autoFocus
                      className="mt-3 w-48 mx-auto block p-2 rounded-xl bg-warm-50 border border-warm-100 text-warm-900 text-center text-sm placeholder:text-warm-300 outline-none focus:border-sage-400"
                    />
                  )}
                </div>
              )}

              <LayersEditor
                layers={habit.layers}
                showLayers={showLayers}
                setShowLayers={setShowLayers}
                newLayerName={newLayerName}
                setNewLayerName={setNewLayerName}
                newLayerUnit={newLayerUnit}
                setNewLayerUnit={setNewLayerUnit}
                onAdd={() => {
                  if (newLayerName.trim() && newLayerUnit.trim()) {
                    setHabit(h => ({ ...h, layers: [...h.layers, { id: Date.now().toString(36), name: newLayerName.trim(), unit: newLayerUnit.trim() }] }))
                    setNewLayerName('')
                    setNewLayerUnit('')
                  }
                }}
                onRemove={(id) => setHabit(h => ({ ...h, layers: h.layers.filter(l => l.id !== id) }))}
              />

              <button
                onClick={() => onComplete({ ...habit })}
                className="w-full bg-sage-500 text-white py-3.5 px-6 rounded-2xl font-medium text-lg hover:bg-sage-600 transition-colors shadow-lg shadow-sage-500/20 mb-3"
              >
                Start tracking
              </button>
              <button
                onClick={() => setStep(5)}
                className="w-full text-warm-500 py-3 px-6 rounded-2xl font-medium text-sm hover:text-warm-700 transition-colors"
              >
                I already know my habits — skip to goal setting
              </button>
            </>
          )}

          {/* Build habits */}
          {isBuild && (
            <>
              <h2 className="text-2xl font-bold text-warm-900 mb-3">
                How do you want to start?
              </h2>
              <p className="text-warm-500 mb-8 text-sm leading-relaxed">
                If you're not doing this yet, we can set a starting goal together. If you already do it sometimes, we can track where you're at first.
              </p>

              {options.length > 0 && (
                <div className="mb-6">
                  <p className="text-warm-400 text-xs uppercase tracking-wider mb-2">Track by</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {options.map(u => (
                      <button
                        key={u}
                        onClick={() => { setHabit(h => ({ ...h, unit: u })); setCustomUnit('') }}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          habit.unit === u && !customUnit
                            ? 'bg-sage-500 text-white'
                            : 'bg-warm-100 text-warm-500 hover:bg-warm-200'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                    <button
                      onClick={() => setCustomUnit(customUnit || ' ')}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        customUnit
                          ? 'bg-sage-500 text-white'
                          : 'bg-warm-100 text-warm-500 hover:bg-warm-200'
                      }`}
                    >
                      custom
                    </button>
                  </div>
                  {customUnit !== '' && (
                    <input
                      type="text"
                      value={customUnit.trim()}
                      onChange={e => {
                        setCustomUnit(e.target.value)
                        setHabit(h => ({ ...h, unit: e.target.value.trim() || h.unit }))
                      }}
                      placeholder="e.g. ounces, sessions"
                      autoFocus
                      className="mt-3 w-48 mx-auto block p-2 rounded-xl bg-warm-50 border border-warm-100 text-warm-900 text-center text-sm placeholder:text-warm-300 outline-none focus:border-sage-400"
                    />
                  )}
                </div>
              )}

              <LayersEditor
                layers={habit.layers}
                showLayers={showLayers}
                setShowLayers={setShowLayers}
                newLayerName={newLayerName}
                setNewLayerName={setNewLayerName}
                newLayerUnit={newLayerUnit}
                setNewLayerUnit={setNewLayerUnit}
                onAdd={() => {
                  if (newLayerName.trim() && newLayerUnit.trim()) {
                    setHabit(h => ({ ...h, layers: [...h.layers, { id: Date.now().toString(36), name: newLayerName.trim(), unit: newLayerUnit.trim() }] }))
                    setNewLayerName('')
                    setNewLayerUnit('')
                  }
                }}
                onRemove={(id) => setHabit(h => ({ ...h, layers: h.layers.filter(l => l.id !== id) }))}
              />

              <button
                onClick={() => setStep(5)}
                className="w-full bg-sage-500 text-white py-3.5 px-6 rounded-2xl font-medium text-lg hover:bg-sage-600 transition-colors shadow-lg shadow-sage-500/20 mb-3"
              >
                Set a starting goal
              </button>
              <button
                onClick={() => onComplete({ ...habit })}
                className="w-full text-warm-500 py-3 px-6 rounded-2xl font-medium text-sm hover:text-warm-700 transition-colors"
              >
                I already do this — track my baseline first
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── Step 5: Build goal picker (honest negotiation) ──
  if (step === 5) {
    const hasLayers = habit.layers.length > 0
    const allLayerGoalsSet = hasLayers && habit.layers.every(l => (layerGoals[l.id] || 0) > 0)

    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center p-6 relative">
        <BackButton onClick={() => { setStep(4); setBuildGoal(null) }} />
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-warm-900 mb-3">
            Be honest with yourself.
          </h2>
          <p className="text-warm-500 mb-2 text-sm leading-relaxed">
            Pick a goal you are 100% confident you will succeed at. The point is to succeed each day at the goal you set. Don't worry about how much of an improvement you can make, just make an improvement.
          </p>
          <p className="text-warm-400 mb-8 text-sm leading-relaxed">
            If you're still not sure what's a good goal, set a goal that seems pointless — a number that you just know you will not fail, even if it feels trivial. Building habits is about a gradual process that is unnoticeable, which is exactly how bad habits come to be in the first place.
          </p>

          {hasLayers ? (
            <div className="space-y-6 mb-8">
              {habit.layers.map(l => (
                <div key={l.id} className="bg-white rounded-2xl p-4 border border-warm-100">
                  <p className="text-sm font-medium text-warm-700 mb-3">{l.name} <span className="text-warm-400 font-normal">({l.unit})</span></p>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setLayerGoals(g => ({ ...g, [l.id]: Math.max(0, (g[l.id] || 1) - 1) }))}
                      className="w-10 h-10 rounded-full border-2 border-warm-200 flex items-center justify-center text-xl text-warm-500 hover:border-sage-400 transition-colors"
                    >−</button>
                    <div className="text-4xl font-bold text-warm-900">{layerGoals[l.id] || 0}</div>
                    <button
                      onClick={() => setLayerGoals(g => ({ ...g, [l.id]: (g[l.id] || 0) + 1 }))}
                      className="w-10 h-10 rounded-full border-2 border-warm-200 flex items-center justify-center text-xl text-warm-500 hover:border-sage-400 transition-colors"
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setBuildGoal(g => Math.max(0.1, Math.round(((g || 1) - 0.1) * 10) / 10))}
                className="w-12 h-12 rounded-full border-2 border-warm-200 flex items-center justify-center text-xl text-warm-500 hover:border-sage-400 transition-colors"
              >−</button>
              <div>
                <div className="text-5xl font-bold text-warm-900">{buildGoal || 1}</div>
                <div className="text-warm-500 text-sm mt-1">{habit.unit}</div>
              </div>
              <button
                onClick={() => setBuildGoal(g => Math.round(((g || 1) + 0.1) * 10) / 10)}
                className="w-12 h-12 rounded-full border-2 border-warm-200 flex items-center justify-center text-xl text-warm-500 hover:border-sage-400 transition-colors"
              >+</button>
            </div>
          )}

          <p className="text-warm-400 text-xs mb-6 italic" />

          <button
            onClick={() => {
              if (hasLayers) {
                const totalGoal = Object.values(layerGoals).reduce((s, v) => s + (v || 0), 0)
                onComplete({ ...habit, skipBaseline: true, startingGoal: totalGoal, startingLayerGoals: layerGoals })
              } else {
                onComplete({ ...habit, skipBaseline: true, startingGoal: buildGoal || 1 })
              }
            }}
            disabled={hasLayers ? !allLayerGoalsSet : false}
            className="w-full bg-sage-500 text-white py-3.5 px-6 rounded-2xl font-medium text-lg hover:bg-sage-600 transition-colors shadow-lg shadow-sage-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            I can do this — let's go
          </button>
        </div>
      </div>
    )
  }

  return null
}

function LayersEditor({ layers, showLayers, setShowLayers, newLayerName, setNewLayerName, newLayerUnit, setNewLayerUnit, onAdd, onRemove }) {
  return (
    <div className="mb-6">
      {!showLayers ? (
        <button
          onClick={() => setShowLayers(true)}
          className="text-sm text-sage-600 hover:text-sage-700 transition-colors"
        >
          + Add layers <span className="text-warm-400">(optional)</span>
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-warm-100 p-4 text-left">
          <p className="text-sm font-medium text-warm-700 mb-1">Layers</p>
          <p className="text-xs text-warm-400 mb-3">
            Break this habit into parts you want to track separately.
          </p>

          {/* Existing layers */}
          {layers.length > 0 && (
            <div className="space-y-2 mb-3">
              {layers.map(l => (
                <div key={l.id} className="flex items-center justify-between p-2.5 bg-warm-50 rounded-xl">
                  <div>
                    <span className="text-sm font-medium text-warm-800">{l.name}</span>
                    <span className="text-xs text-warm-400 ml-2">({l.unit})</span>
                  </div>
                  <button
                    onClick={() => onRemove(l.id)}
                    className="text-warm-300 hover:text-red-400 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new layer */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newLayerName}
              onChange={e => setNewLayerName(e.target.value)}
              placeholder="e.g. Running"
              className="flex-1 p-2 rounded-xl bg-warm-50 border border-warm-100 text-warm-900 text-sm placeholder:text-warm-300 outline-none focus:border-sage-400"
            />
            <input
              type="text"
              value={newLayerUnit}
              onChange={e => setNewLayerUnit(e.target.value)}
              placeholder="e.g. miles"
              className="w-24 p-2 rounded-xl bg-warm-50 border border-warm-100 text-warm-900 text-sm placeholder:text-warm-300 outline-none focus:border-sage-400"
            />
            <button
              onClick={onAdd}
              disabled={!newLayerName.trim() || !newLayerUnit.trim()}
              className="px-3 py-2 bg-sage-500 text-white rounded-xl text-sm font-medium hover:bg-sage-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
