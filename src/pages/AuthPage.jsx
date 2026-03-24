import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const err = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password)

    if (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-warm-900">Flo</h1>
          <p className="text-warm-500">Habit Builder</p>
        </div>

        <form onSubmit={handleSubmit} className="steel-plate rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-warm-900 text-center">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h2>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-400/10 rounded-lg p-2">{error}</p>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-warm-50 border border-warm-100 text-warm-900 placeholder:text-warm-300 outline-none focus:border-sage-400 rounded-xl p-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-warm-50 border border-warm-100 text-warm-900 placeholder:text-warm-300 outline-none focus:border-sage-400 rounded-xl p-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage-500 text-white py-3.5 rounded-2xl font-medium text-lg hover:bg-sage-600 transition-colors disabled:opacity-50"
          >
            {loading ? '...' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>

          <p className="text-center text-sm text-warm-400">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
              className="text-sage-400 hover:text-sage-300 font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
