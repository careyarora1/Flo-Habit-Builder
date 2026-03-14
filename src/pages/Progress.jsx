import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function Progress({ data }) {
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
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-warm-100 mb-6 text-center">
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
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-warm-100 mb-6">
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
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center border border-warm-100">
            <p className="text-2xl font-bold text-warm-900">{entries.length}</p>
            <p className="text-xs text-warm-400">Days tracked</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-warm-100">
            <p className="text-2xl font-bold text-warm-900">{data.habit.baseline}</p>
            <p className="text-xs text-warm-400">Started at</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-warm-100">
            <p className="text-2xl font-bold text-sage-600">{data.currentGoal}</p>
            <p className="text-xs text-warm-400">Current goal</p>
          </div>
        </div>
      </div>
    </div>
  )
}
