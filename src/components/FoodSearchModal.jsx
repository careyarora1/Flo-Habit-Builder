import { useState, useRef, useEffect } from 'react'
import { detectFoodFromImage, readFileAsBase64 } from '../utils/detectFood'

const AI_LIMIT_KEY_PREFIX = 'habit-ai-food-'

function getAiUsageToday() {
  const key = AI_LIMIT_KEY_PREFIX + new Date().toISOString().split('T')[0]
  return Number(localStorage.getItem(key) || 0)
}

function incrementAiUsage() {
  const key = AI_LIMIT_KEY_PREFIX + new Date().toISOString().split('T')[0]
  const count = getAiUsageToday() + 1
  localStorage.setItem(key, String(count))
  return count
}

const AI_DAILY_LIMIT = 5

export default function FoodSearchModal({ onAdd, onClose, habit }) {
  const [tab, setTab] = useState('manual') // manual | history | ai | camera
  // Manual entry
  const [foodName, setFoodName] = useState('')
  const [foodScore, setFoodScore] = useState('')
  // AI scoring
  const [aiDescription, setAiDescription] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiError, setAiError] = useState(null)
  const [aiUsedToday, setAiUsedToday] = useState(getAiUsageToday())
  // Camera
  const [analyzing, setAnalyzing] = useState(false)
  const [detectedFoods, setDetectedFoods] = useState(null)
  const [photoError, setPhotoError] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  // History search
  const [historyFilter, setHistoryFilter] = useState('')

  const nameInputRef = useRef(null)
  const aiInputRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (tab === 'manual' && nameInputRef.current) nameInputRef.current.focus()
    if (tab === 'ai' && aiInputRef.current) aiInputRef.current.focus()
  }, [tab])

  // Build unique history from all entries' foodItems
  const foodHistory = (() => {
    if (!habit?.entries) return []
    const seen = new Map()
    habit.entries.forEach(entry => {
      if (!entry.foodItems) return
      entry.foodItems.forEach(food => {
        const key = food.name.toLowerCase()
        if (!seen.has(key)) {
          seen.set(key, {
            name: food.name,
            score: food.baseScore || food.score,
            icon: food.icon || '🍽️',
          })
        }
      })
    })
    return Array.from(seen.values())
  })()

  // Build reference points for AI (user's personal scale)
  const referencePoints = foodHistory.map(f => ({ name: f.name, score: f.score }))

  const filteredHistory = historyFilter.trim()
    ? foodHistory.filter(f => f.name.toLowerCase().includes(historyFilter.toLowerCase()))
    : foodHistory

  // ── Manual entry handlers ──────────────────────
  const handleManualAdd = () => {
    const score = Number(foodScore)
    if (foodName.trim() && !isNaN(score) && score >= 0) {
      onAdd({
        name: foodName.trim(),
        score: Math.round(score * 10) / 10,
        qty: 1,
        icon: '🍽️',
        baseScore: Math.round(score * 10) / 10,
        custom: true,
      })
      setFoodName('')
      setFoodScore('')
    }
  }

  // ── History add ────────────────────────────────
  const handleHistoryAdd = (food) => {
    onAdd({
      name: food.name,
      score: food.score,
      qty: 1,
      icon: food.icon,
      baseScore: food.score,
    })
  }

  // ── AI scoring ─────────────────────────────────
  const handleAskAi = async () => {
    if (!aiDescription.trim() || aiLoading) return
    if (aiUsedToday >= AI_DAILY_LIMIT) return

    setAiLoading(true)
    setAiError(null)
    setAiResult(null)

    try {
      const response = await fetch('/api/score-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: aiDescription.trim(),
          referencePoints,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error || `Server error ${response.status}`)
      }

      const result = await response.json()
      setAiResult(result)
      const newCount = incrementAiUsage()
      setAiUsedToday(newCount)
    } catch (err) {
      setAiError(err.message)
    } finally {
      setAiLoading(false)
    }
  }

  const handleAddAiResult = () => {
    if (!aiResult) return
    onAdd({
      name: aiResult.name,
      score: aiResult.score,
      qty: 1,
      icon: '🤖',
      baseScore: aiResult.score,
      aiScored: true,
    })
    setAiDescription('')
    setAiResult(null)
  }

  // ── Camera ─────────────────────────────────────
  const handlePhotoCapture = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError(null)
    setAnalyzing(true)
    setDetectedFoods(null)
    setTab('camera')

    try {
      const base64 = await readFileAsBase64(file)
      setPhotoPreview(base64)
      const foods = await detectFoodFromImage(base64)
      setDetectedFoods(foods)
    } catch (err) {
      setPhotoError(err.message)
    } finally {
      setAnalyzing(false)
    }
    e.target.value = ''
  }

  const handleAddDetected = (food) => {
    onAdd({
      name: food.name,
      score: food.score,
      qty: 1,
      icon: food.icon || '🍽️',
      baseScore: food.score,
    })
    setDetectedFoods(prev => prev.filter(f => f !== food))
  }

  const handleAddAllDetected = () => {
    detectedFoods.forEach(food => {
      onAdd({
        name: food.name,
        score: food.score,
        qty: 1,
        icon: food.icon || '🍽️',
        baseScore: food.score,
      })
    })
    setDetectedFoods(null)
    setPhotoPreview(null)
    setTab('manual')
  }

  // ── Camera results overlay ─────────────────────
  if (tab === 'camera' && (analyzing || detectedFoods || photoError)) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
        <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col">
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-warm-900">
              {analyzing ? 'Analyzing...' : 'Detected foods'}
            </h3>
            <button
              onClick={() => { setDetectedFoods(null); setPhotoPreview(null); setPhotoError(null); setTab('manual') }}
              className="text-warm-400 hover:text-warm-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          {photoPreview && (
            <div className="px-4 pb-3">
              <img src={photoPreview} alt="Food photo" className="w-full h-40 object-cover rounded-xl" />
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {analyzing ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-3 border-sage-200 border-t-sage-500 rounded-full animate-spin mb-4" />
                <p className="text-warm-500 text-sm">Identifying your food...</p>
              </div>
            ) : photoError ? (
              <div className="text-center py-8">
                <p className="text-red-500 text-sm mb-4">{photoError}</p>
                <button
                  onClick={() => { setPhotoError(null); setDetectedFoods(null); setPhotoPreview(null); setTab('manual') }}
                  className="text-sm text-sage-600 font-medium"
                >
                  Go back
                </button>
              </div>
            ) : detectedFoods && detectedFoods.length > 0 ? (
              <>
                <div className="space-y-1 mb-4">
                  {detectedFoods.map((food, i) => (
                    <button
                      key={food.id || i}
                      onClick={() => handleAddDetected(food)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-warm-50 transition-colors text-left"
                    >
                      <span className="text-2xl">{food.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-warm-900 font-medium truncate">{food.name}</p>
                        <p className="text-xs text-warm-400">{food.note || 'Tap to add'}</p>
                      </div>
                      <span className="text-sm font-semibold text-sage-600 flex-shrink-0">{food.score}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleAddAllDetected}
                  className="w-full py-3 rounded-2xl font-medium bg-sage-500 text-white hover:bg-sage-600 transition-colors"
                >
                  Add all ({detectedFoods.length} item{detectedFoods.length === 1 ? '' : 's'})
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">🥗</p>
                <p className="text-warm-500 text-sm">No junk food detected in this photo.</p>
                <button
                  onClick={() => { setDetectedFoods(null); setPhotoPreview(null); setTab('manual') }}
                  className="mt-3 text-sm text-sage-600 font-medium"
                >
                  Go back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Main modal ─────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 pb-0 flex items-center justify-between">
          <h3 className="text-lg font-bold text-warm-900">Add food</h3>
          <button onClick={onClose} className="text-warm-400 hover:text-warm-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Tab bar */}
        <div className="px-4 pt-3 pb-2 flex gap-2">
          {[
            { id: 'manual', label: 'Manual', icon: '✏️' },
            ...(foodHistory.length > 0 ? [{ id: 'history', label: 'Recent', icon: '🕐' }] : []),
            { id: 'ai', label: 'Ask AI', icon: '🤖' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-sage-500 text-white'
                  : 'bg-warm-100 text-warm-500 hover:bg-warm-200'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
          {/* Camera button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-warm-100 text-warm-500 hover:bg-warm-200 transition-colors"
            title="Take a photo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">

          {/* ── Manual entry tab ──────────────── */}
          {tab === 'manual' && (
            <div className="pt-2">
              <input
                ref={nameInputRef}
                type="text"
                value={foodName}
                onChange={e => setFoodName(e.target.value)}
                placeholder="What did you eat?"
                className="w-full p-3 rounded-xl bg-warm-50 border border-warm-100 text-warm-900 placeholder:text-warm-300 outline-none focus:border-sage-400 mb-3"
              />
              <input
                type="text"
                inputMode="decimal"
                value={foodScore}
                onChange={e => {
                  const raw = e.target.value
                  if (raw === '' || /^\d*\.?\d{0,1}$/.test(raw)) setFoodScore(raw)
                }}
                placeholder="Junkfood score"
                className="w-full p-3 rounded-xl bg-warm-50 border border-warm-100 text-warm-900 placeholder:text-warm-300 outline-none focus:border-sage-400 mb-2"
              />
              <p className="text-xs text-warm-400 mb-5">
                Sugary stuff: 1g sugar = 0.1 · Everything else: you decide (McChicken = 1.0 is a good reference)
              </p>

              <button
                onClick={handleManualAdd}
                disabled={!foodName.trim() || !foodScore || Number(foodScore) < 0}
                className="w-full py-3 rounded-2xl font-medium bg-sage-500 text-white hover:bg-sage-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add
              </button>

              {/* Not sure? hint */}
              <p className="text-center text-xs text-warm-300 mt-4">
                Not sure what score to give? Try <button onClick={() => setTab('ai')} className="text-sage-500 font-medium">Ask AI</button>
              </p>
            </div>
          )}

          {/* ── History tab ───────────────────── */}
          {tab === 'history' && (
            <div className="pt-2">
              {foodHistory.length > 5 && (
                <input
                  type="text"
                  value={historyFilter}
                  onChange={e => setHistoryFilter(e.target.value)}
                  placeholder="Filter..."
                  className="w-full p-3 rounded-xl bg-warm-50 border border-warm-100 text-warm-900 placeholder:text-warm-300 outline-none focus:border-sage-400 mb-3"
                />
              )}

              {filteredHistory.length > 0 ? (
                <div className="space-y-1">
                  {filteredHistory.map((food, i) => (
                    <button
                      key={i}
                      onClick={() => handleHistoryAdd(food)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-warm-50 transition-colors text-left"
                    >
                      <span className="text-2xl">{food.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-warm-900 font-medium truncate">{food.name}</p>
                      </div>
                      <span className="text-sm font-semibold text-sage-600 flex-shrink-0">{food.score}</span>
                    </button>
                  ))}
                </div>
              ) : historyFilter ? (
                <p className="text-center text-warm-400 py-8 text-sm">No matches</p>
              ) : (
                <p className="text-center text-warm-400 py-8 text-sm">No food logged yet</p>
              )}
            </div>
          )}

          {/* ── Ask AI tab ────────────────────── */}
          {tab === 'ai' && (
            <div className="pt-2">
              <p className="text-sm text-warm-500 mb-3">
                Describe what you ate and AI will suggest a score based on your personal scale.
              </p>

              <textarea
                ref={aiInputRef}
                value={aiDescription}
                onChange={e => setAiDescription(e.target.value)}
                placeholder="e.g. large bowl of homemade mac and cheese, or 2 slices of leftover pizza"
                rows={3}
                className="w-full p-3 rounded-xl bg-warm-50 border border-warm-100 text-warm-900 text-sm placeholder:text-warm-300 outline-none focus:border-sage-400 resize-none mb-3"
              />

              {aiUsedToday >= AI_DAILY_LIMIT ? (
                <div className="text-center py-3">
                  <p className="text-warm-400 text-sm">You've used all {AI_DAILY_LIMIT} AI scores for today.</p>
                  <p className="text-xs text-warm-300 mt-1">Use manual entry or try again tomorrow.</p>
                </div>
              ) : (
                <button
                  onClick={handleAskAi}
                  disabled={!aiDescription.trim() || aiLoading}
                  className="w-full py-3 rounded-2xl font-medium bg-sage-500 text-white hover:bg-sage-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-2"
                >
                  {aiLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Thinking...
                    </span>
                  ) : (
                    'Get score'
                  )}
                </button>
              )}

              <p className="text-xs text-warm-300 text-center">
                {AI_DAILY_LIMIT - aiUsedToday} of {AI_DAILY_LIMIT} AI scores left today
              </p>

              {/* AI result */}
              {aiResult && (
                <div className="mt-4 bg-sage-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-warm-900">{aiResult.name}</p>
                    <span className="text-lg font-bold text-sage-600">{aiResult.score}</span>
                  </div>
                  {aiResult.reasoning && (
                    <p className="text-xs text-warm-500 mb-3">{aiResult.reasoning}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAiResult(null)}
                      className="flex-1 py-2 rounded-xl text-sm font-medium text-warm-500 border border-warm-200 hover:bg-warm-50 transition-colors"
                    >
                      Try again
                    </button>
                    <button
                      onClick={handleAddAiResult}
                      className="flex-1 py-2 rounded-xl text-sm font-medium bg-sage-500 text-white hover:bg-sage-600 transition-colors"
                    >
                      Add this
                    </button>
                  </div>
                </div>
              )}

              {/* AI error */}
              {aiError && (
                <div className="mt-4 text-center">
                  <p className="text-red-500 text-sm mb-2">{aiError}</p>
                  <button onClick={() => setAiError(null)} className="text-sm text-sage-600 font-medium">
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
