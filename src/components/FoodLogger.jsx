import { useState } from 'react'
import FoodSearchModal from './FoodSearchModal'
import { getMessage } from '../messages'

export default function FoodLogger({ habit, todayEntry, currentGoal, isBaseline, onLog, onFinalize }) {
  const [showSearch, setShowSearch] = useState(false)
  const [showReflection, setShowReflection] = useState(false)
  const [reflectionNote, setReflectionNote] = useState('')
  const [showSuccessReflection, setShowSuccessReflection] = useState(false)
  const [successNote, setSuccessNote] = useState('')

  const foodItems = todayEntry?.foodItems || []
  const total = Math.round(foodItems.reduce((sum, f) => sum + f.score, 0) * 10) / 10
  const logged = foodItems.length > 0
  const finalized = todayEntry?.finalized === true
  const isReduce = habit.direction === 'reduce'
  const missedGoal = logged && currentGoal != null &&
    (isReduce ? total > currentGoal : total < currentGoal)

  const handleAddFood = (food) => {
    const updated = [...foodItems, food]
    const newTotal = Math.round(updated.reduce((sum, f) => sum + f.score, 0) * 10) / 10
    onLog(newTotal, updated)
    setShowSearch(false)
  }

  const handleRemoveFood = (index) => {
    const updated = foodItems.filter((_, i) => i !== index)
    const newTotal = Math.round(updated.reduce((sum, f) => sum + f.score, 0) * 10) / 10
    onLog(updated.length > 0 ? newTotal : null, updated.length > 0 ? updated : [])
  }

  const handleDoneLogging = () => {
    if (isBaseline) {
      onFinalize(true)
      return
    }
    if (missedGoal) {
      setShowReflection(true)
    } else {
      setShowSuccessReflection(true)
    }
  }

  // Finalized view — show summary
  if (finalized) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-warm-100">
        <p className="text-sm text-warm-400 uppercase tracking-wider mb-4">
          {isBaseline ? "Today's log" : "How'd it go today?"}
        </p>
        <p className="text-5xl font-bold text-warm-900 mb-1">{total}</p>
        <p className="text-warm-500 mb-2">junkfoods</p>

        {/* Food breakdown */}
        {foodItems.length > 0 && (
          <div className="mt-4 mb-4 text-left">
            {foodItems.map((food, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-warm-600">
                  {food.icon} {food.name}{food.qty > 1 ? ` ×${food.qty}` : ''}
                </span>
                <span className="text-warm-400 font-medium">{food.score}</span>
              </div>
            ))}
          </div>
        )}

        {!isBaseline && (
          <p className="text-warm-600 italic text-sm px-4 mb-4">
            {getMessage(total, currentGoal, habit)}
          </p>
        )}

        <button
          onClick={() => onFinalize(false)}
          className="mt-2 text-sm text-warm-400 hover:text-warm-600 transition-colors"
        >
          Edit
        </button>
      </div>
    )
  }

  // Active logging view
  return (
    <>
      <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-warm-100">
        <p className="text-sm text-warm-400 uppercase tracking-wider mb-4">
          {isBaseline ? "What did you eat today?" : "Log as you go"}
        </p>

        {/* Running total */}
        <p className="text-5xl font-bold text-warm-900 mb-1">{total}</p>
        <p className="text-warm-500 mb-6">junkfoods</p>

        {/* Food list */}
        {foodItems.length > 0 && (
          <div className="text-left mb-6 space-y-1">
            {foodItems.map((food, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-warm-50">
                <span className="text-sm text-warm-700">
                  {food.icon} {food.name}{food.qty > 1 ? ` ×${food.qty}` : ''}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-warm-400 font-medium">{food.score}</span>
                  <button
                    onClick={() => handleRemoveFood(i)}
                    className="text-warm-300 hover:text-red-400 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add food button */}
        <button
          onClick={() => setShowSearch(true)}
          className="w-full py-3 rounded-2xl font-medium border-2 border-dashed border-warm-200 text-warm-400 hover:border-sage-400 hover:text-sage-500 transition-colors mb-4"
        >
          + Add food
        </button>

        {/* Done logging */}
        <button
          onClick={handleDoneLogging}
          disabled={!logged}
          className="w-full bg-sage-500 text-white py-3.5 rounded-2xl font-medium hover:bg-sage-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Done logging
        </button>
      </div>

      {/* Food search modal */}
      {showSearch && (
        <FoodSearchModal
          onAdd={handleAddFood}
          onClose={() => setShowSearch(false)}
          habit={habit}
        />
      )}

      {/* Reflection prompt when goal was missed (active phase only) */}
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

      {/* Success reflection when goal was hit (active phase only) */}
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
  )
}
