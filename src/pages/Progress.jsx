import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function Progress({ data, onUpdateOutcome }) {
  const entries = data.entries.filter(e => e.actual != null)

  if (entries.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center p-6 pt-20 text-center">
        <p className="text-5xl mb-4">📊</p>
        <h2 className="text-xl font-bold text-warm-900 mb-2">Not enough data yet</h2>
        <p className="text-warm-500 max-w-sm">
          Log at least 2 days to see your trendline. Keep going — the picture will start to form.
        </p>
      </div>
    )
  }

  const chartData = entries.map(e => ({
    date: new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    actual: e.actual,
    goal: e.goal,
  }))

  // Stats
  const firstWeek = entries.slice(0, Math.min(7, Math.ceil(entries.length / 2)))
  const lastWeek = entries.slice(-Math.min(7, Math.ceil(entries.length / 2)))
  const firstAvg = firstWeek.reduce((s, e) => s + e.actual, 0) / firstWeek.length
  const lastAvg = lastWeek.reduce((s, e) => s + e.actual, 0) / lastWeek.length
  const isReduce = data.habit.direction === 'reduce'
  const changePercent = Math.round(((lastAvg - firstAvg) / firstAvg) * 100)
  const improving = isReduce ? changePercent < 0 : changePercent > 0

  return (
    <div className="flex flex-col items-center p-6">
      <div className="max-w-lg w-full">
        {/* Summary card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm steel-plate mb-6 text-center">
          <p className="text-sm text-warm-400 uppercase tracking-wider mb-1">Your trendline</p>
          <p className={`text-4xl font-bold ${improving ? 'text-sage-600' : 'text-coral-500'}`}>
            {changePercent > 0 ? '+' : ''}{changePercent}%
          </p>
          <p className="text-warm-500 text-sm mt-1">
            {improving
              ? isReduce
                ? `You've cut down from ~${Math.round(firstAvg)} to ~${Math.round(lastAvg)} ${data.habit.unit}`
                : `You've grown from ~${Math.round(firstAvg)} to ~${Math.round(lastAvg)} ${data.habit.unit}`
              : "Some days are harder. Look at the overall direction."
            }
          </p>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm steel-plate mb-6">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8d5b0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#8f6435' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#8f6435' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e8d5b0',
                  borderRadius: '12px',
                  fontSize: '14px',
                }}
              />
              <ReferenceLine
                y={data.habit.baseline}
                stroke="#d4b88a"
                strokeDasharray="5 5"
                label={{ value: 'Baseline', position: 'right', fill: '#b07d44', fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="goal"
                stroke="#b0ccb0"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Goal"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#4e7f4e"
                strokeWidth={3}
                dot={{ r: 4, fill: '#4e7f4e' }}
                name="Actual"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Journey stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 text-center steel-plate">
            <p className="text-2xl font-bold text-warm-900">{entries.length}</p>
            <p className="text-xs text-warm-400">Days tracked</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center steel-plate">
            <p className="text-2xl font-bold text-warm-900">{data.habit.baseline || '—'}</p>
            <p className="text-xs text-warm-400">Started at</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center steel-plate">
            <p className="text-2xl font-bold text-sage-600">{data.currentGoal}</p>
            <p className="text-xs text-warm-400">Current goal</p>
          </div>
        </div>

        {/* Desired outcome */}
        <DesiredOutcome
          outcome={data.habit.desiredOutcome}
          direction={data.habit.direction}
          onSave={onUpdateOutcome}
        />
      </div>
    </div>
  )
}

function DesiredOutcome({ outcome, direction, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(outcome || '')

  const label = direction === 'reduce' ? 'Where you want to end up' : 'What you\'re working towards'

  if (editing) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm steel-plate">
        <p className="text-sm text-warm-400 uppercase tracking-wider mb-3">{label}</p>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={3}
          autoFocus
          className="w-full p-3 rounded-xl bg-warm-50 steel-plate text-warm-900 placeholder:text-warm-300 outline-none focus:border-sage-400 resize-none mb-3"
          placeholder={direction === 'reduce' ? 'e.g. "Cut down to once a week"' : 'e.g. "30 minutes a day"'}
        />
        <div className="flex gap-2">
          <button
            onClick={() => { onSave(draft.trim()); setEditing(false) }}
            disabled={!draft.trim()}
            className="flex-1 py-2 rounded-xl bg-sage-500 text-white font-medium text-sm hover:bg-sage-600 transition-colors disabled:opacity-40"
          >
            Save
          </button>
          <button
            onClick={() => { setDraft(outcome || ''); setEditing(false) }}
            className="flex-1 py-2 rounded-xl bg-warm-100 text-warm-500 font-medium text-sm hover:bg-warm-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm steel-plate">
      <p className="text-sm text-warm-400 uppercase tracking-wider mb-2">{label}</p>
      {outcome ? (
        <p className="text-warm-900 font-medium text-lg mb-3">"{outcome}"</p>
      ) : (
        <p className="text-warm-300 italic mb-3">No goal set yet</p>
      )}
      <button
        onClick={() => { setDraft(outcome || ''); setEditing(true) }}
        className="text-sm text-sage-600 hover:text-sage-700 font-medium transition-colors"
      >
        {outcome ? 'Edit goal' : 'Set your end goal'}
      </button>
    </div>
  )
}
