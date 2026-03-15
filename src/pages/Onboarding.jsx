import { useState } from 'react'
import BackButton from '../components/BackButton'
import JunkfoodGuide from '../components/JunkfoodGuide'

const presets = [
  { name: 'Junk food', unit: 'junkfoods', direction: 'reduce', icon: '🍔', unitOptions: ['junkfoods', 'items', 'times'] },
  { name: 'Soda / sugary drinks', unit: 'drinks', direction: 'reduce', icon: '🥤', unitOptions: ['drinks', 'cans', 'bottles', 'ounces'] },
  { name: 'Smoking', unit: 'cigarettes', direction: 'reduce', icon: '🚬', unitOptions: ['cigarettes', 'puffs', 'packs'] },
  { name: 'Screen time', unit: 'hours', direction: 'reduce', icon: '📱', unitOptions: ['hours', 'minutes'] },
  { name: 'Social media', unit: 'hours', direction: 'reduce', icon: '📲', unitOptions: ['hours', 'minutes'] },
  { name: 'Exercise', unit: 'minutes', direction: 'build', icon: '💪', unitOptions: ['minutes', 'hours', 'sessions'] },
  { name: 'Reading', unit: 'minutes', direction: 'build', icon: '📖', unitOptions: ['minutes', 'pages', 'chapters'] },
  { name: 'Water intake', unit: 'glasses', direction: 'build', icon: '💧', unitOptions: ['glasses', 'ounces', 'bottles', 'liters'] },
]

export default function Onboarding({ onComplete, startStep = 0 }) {
  const [screen, setScreen] = useState(startStep === 0 ? 'welcome' : 'presets')

  const [habit, setHabit] = useState({ name: '', unit: '', direction: 'reduce' })
  const [showCustom, setShowCustom] = useState(false)
  const [customUnit, setCustomUnit] = useState('')
  const [step, setStep] = useState(1) // 1 = presets, 2 = junkfood guide (if applicable), 3 = confirm

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
  if (screen === 'presets') {
    if (step === 1) {
      return (
        <div className="min-h-screen bg-warm-50 flex flex-col items-center p-6 pt-16">
          <div className="max-w-md w-full">
            <h2 className="text-2xl font-bold text-warm-900 mb-2">
              What do you want to work on?
            </h2>
            <p className="text-warm-500 mb-8">Pick a habit to get started.</p>

            <div className="grid gap-3">
              {presets.map(p => (
                <button
                  key={p.name}
                  onClick={() => {
                    setHabit({ name: p.name, unit: p.unit, direction: p.direction })
                    setStep(p.name === 'Junk food' ? 2 : 3)
                  }}
                  className="flex items-center gap-3 p-4 bg-white rounded-2xl text-left hover:shadow-md transition-all border border-warm-100"
                >
                  <span className="text-2xl">{p.icon}</span>
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
                  className="p-4 bg-white/50 rounded-2xl text-warm-400 border border-dashed border-warm-200 hover:border-warm-300 transition-colors"
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
                    onClick={() => {
                      if (habit.name && habit.unit) setStep(3)
                    }}
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

    // Step 2: Junkfood scoring guide (only for Junk food habit)
    if (step === 2) {
      return (
        <JunkfoodGuide
          onBack={() => setStep(1)}
          onContinue={() => setStep(3)}
        />
      )
    }

    // Step 3: confirm unit & start
    const preset = presets.find(p => p.name === habit.name)
    const options = preset?.unitOptions || []

    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center p-6 relative">
        <BackButton onClick={() => setStep(1)} />
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-warm-900 mb-6">
            For the first seven days, just track what you naturally do.
          </h2>

          {options.length > 0 && (
            <div className="mb-8">
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

          <button
            onClick={() => onComplete({ ...habit })}
            className="w-full bg-sage-500 text-white py-3.5 px-6 rounded-2xl font-medium text-lg hover:bg-sage-600 transition-colors shadow-lg shadow-sage-500/20"
          >
            Start tracking
          </button>
        </div>
      </div>
    )
  }

  return null
}
