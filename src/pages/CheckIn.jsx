import { useState } from 'react'
import { getCheckInMessage } from '../messages'

const reduceOptions = [
  { key: 'too-easy', label: 'I can cut more', emoji: '💪', desc: "Yesterday felt easy — push me further" },
  { key: 'about-right', label: 'Keep it the same', emoji: '👌', desc: "That pace feels right" },
  { key: 'too-hard', label: 'I need more room', emoji: '😮‍💨', desc: "Yesterday was a stretch — ease up a bit" },
]

const buildOptions = [
  { key: 'too-easy', label: 'I can do more', emoji: '💪', desc: "Yesterday felt easy — push me further" },
  { key: 'about-right', label: 'Keep it the same', emoji: '👌', desc: "That pace feels right" },
  { key: 'too-hard', label: 'I need to dial back', emoji: '😮‍💨', desc: "Yesterday was a stretch — ease up a bit" },
]

export default function CheckIn({ habit, yesterdayEntry, currentGoal, suggestGoal, onComplete }) {
  const options = habit.direction === 'reduce' ? reduceOptions : buildOptions
  const [step, setStep] = useState('difficulty') // 'difficulty' | 'message' | 'set-goal'
  const [selected, setSelected] = useState(null)
  const [goalInput, setGoalInput] = useState('')

  const handleSelect = (key) => {
    setSelected(key)
    setStep('message')
    const suggested = suggestGoal(key)
    setTimeout(() => {
      setGoalInput(String(suggested))
      setStep('set-goal')
    }, 2000)
  }

  // Step 2: Show compassionate message briefly
  if (step === 'message') {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <p className="text-5xl mb-6">{options.find(o => o.key === selected)?.emoji}</p>
          <p className="text-xl text-warm-700 font-medium">
            {getCheckInMessage(selected)}
          </p>
        </div>
      </div>
    )
  }

  // Step 3: Let user set today's goal
  if (step === 'set-goal') {
    const handleConfirm = () => {
      const val = Number(goalInput)
      if (!isNaN(val) && val >= 0) {
        onComplete(selected, val)
      }
    }

    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold text-warm-900 mb-2 text-center">
            Set today's goal
          </h2>
          <p className="text-warm-500 text-center mb-8">
            What feels doable for today?
          </p>

          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-warm-100">
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
            <p className="text-warm-400 mt-2 mb-6">{habit.unit}</p>
            <button
              onClick={handleConfirm}
              disabled={!goalInput || Number(goalInput) < 0}
              className="w-full bg-sage-500 text-white py-3.5 rounded-2xl font-medium hover:bg-sage-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Let's go
            </button>
          </div>

          <p className="text-xs text-warm-400 text-center mt-4">
            Yesterday: {yesterdayEntry.actual} {habit.unit} · Previous goal: {yesterdayEntry.goal} {habit.unit}
          </p>
        </div>
      </div>
    )
  }

  // Calculate progress from baseline for celebration
  const progressFromBaseline = habit.baseline
    ? Math.round(Math.abs((habit.baseline - yesterdayEntry.actual) / habit.baseline) * 100)
    : 0
  const isImproving = habit.direction === 'reduce'
    ? yesterdayEntry.actual < habit.baseline
    : yesterdayEntry.actual > habit.baseline

  // Step 1: How did yesterday feel?
  return (
    <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <h2 className="text-2xl font-bold text-warm-900 mb-2 text-center">
          Good morning
        </h2>
        <div className="text-center mb-10">
          <p className="text-warm-500">
            You logged <span className="font-semibold text-warm-700">{yesterdayEntry.actual} {habit.unit}</span> yesterday
          </p>
          {progressFromBaseline > 0 && isImproving && (
            <p className="text-sage-600 text-sm font-medium mt-1">
              That's {progressFromBaseline}% {habit.direction === 'reduce' ? 'less' : 'more'} than where you started
            </p>
          )}
        </div>

        <div className="grid gap-3">
          {options.map(o => (
            <button
              key={o.key}
              onClick={() => handleSelect(o.key)}
              className="flex items-center gap-4 p-5 bg-white rounded-2xl text-left hover:shadow-md transition-all border border-warm-100 active:scale-[0.98]"
            >
              <span className="text-3xl">{o.emoji}</span>
              <div className="font-medium text-warm-900">{o.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
