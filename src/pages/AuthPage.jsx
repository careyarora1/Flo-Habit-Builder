import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const err = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password)

    if (err) {
      setError(typeof err.message === 'string' ? err.message : String(err.message || err))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Steel bridge plate title with rivets inside letters */}
            <svg viewBox="0 0 300 110" style={{ width: '375px', margin: '0 auto', overflow: 'visible', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))' }}>
              <defs>
                {/* Steel plate gradient - wider spaced bands */}
                <linearGradient id="steelPlate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d8d8d8" />
                  <stop offset="25%" stopColor="#a0a0a0" />
                  <stop offset="50%" stopColor="#c8c8c8" />
                  <stop offset="75%" stopColor="#888888" />
                  <stop offset="100%" stopColor="#b0b0b0" />
                </linearGradient>
                {/* Brushed steel texture - wider spacing */}
                <filter id="brushed">
                  <feTurbulence type="fractalNoise" baseFrequency="0.4 0.02" numOctaves="3" result="noise" />
                  <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
                  <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="brushed" />
                  <feComposite in="brushed" in2="SourceGraphic" operator="in" />
                </filter>
                {/* Outline glow filter - traces the letter shape with a soft white glow offset a bit from the edge */}
                <filter id="letterGlow" x="-15%" y="-15%" width="130%" height="130%">
                  <feMorphology operator="dilate" radius="3.5" in="SourceAlpha" result="expanded" />
                  <feGaussianBlur in="expanded" stdDeviation="5" result="blurred" />
                  <feFlood floodColor="#ffffff" floodOpacity="0.35" result="glowColor" />
                  <feComposite in="glowColor" in2="blurred" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* Subtitle glow - smaller */}
                <filter id="subtitleGlow" x="-10%" y="-20%" width="120%" height="140%">
                  <feMorphology operator="dilate" radius="2" in="SourceAlpha" result="expanded" />
                  <feGaussianBlur in="expanded" stdDeviation="3" result="blurred" />
                  <feFlood floodColor="#ffffff" floodOpacity="0.25" result="glowColor" />
                  <feComposite in="glowColor" in2="blurred" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* Rivet/bolt radial gradient */}
                <radialGradient id="rivet" cx="40%" cy="35%">
                  <stop offset="0%" stopColor="#d8d8d8" />
                  <stop offset="40%" stopColor="#a0a0a0" />
                  <stop offset="70%" stopColor="#686868" />
                  <stop offset="100%" stopColor="#484848" />
                </radialGradient>
              </defs>

              {/* FLO text with outline glow */}
              <g filter="url(#letterGlow)">
                <text x="150" y="62" textAnchor="middle"
                  fontFamily="'Impact', 'Arial Black', sans-serif"
                  fontSize="72" fontWeight="900" letterSpacing="12"
                  fill="url(#steelPlate)"
                  stroke="#555" strokeWidth="1.5"
                  filter="url(#brushed)">
                  FLO
                </text>
              </g>
              {/* Highlight edge on top */}
              <text x="150" y="61" textAnchor="middle"
                fontFamily="'Impact', 'Arial Black', sans-serif"
                fontSize="72" fontWeight="900" letterSpacing="12"
                fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5">
                FLO
              </text>

              {/* Rivets on the F */}
              <circle cx="67" cy="25" r="4" fill="url(#rivet)" stroke="#444" strokeWidth="0.5" />
              <line x1="64" y1="22" x2="70" y2="28" stroke="#555" strokeWidth="1" />
              <line x1="70" y1="22" x2="64" y2="28" stroke="#555" strokeWidth="1" />
              <circle cx="82" cy="50" r="3.5" fill="url(#rivet)" stroke="#444" strokeWidth="0.5" />
              <line x1="79.5" y1="47.5" x2="84.5" y2="52.5" stroke="#555" strokeWidth="0.8" />
              <line x1="84.5" y1="47.5" x2="79.5" y2="52.5" stroke="#555" strokeWidth="0.8" />

              {/* Rivets on the L */}
              <circle cx="128" cy="25" r="4" fill="url(#rivet)" stroke="#444" strokeWidth="0.5" />
              <line x1="125" y1="22" x2="131" y2="28" stroke="#555" strokeWidth="1" />
              <line x1="131" y1="22" x2="125" y2="28" stroke="#555" strokeWidth="1" />
              <circle cx="128" cy="55" r="3.5" fill="url(#rivet)" stroke="#444" strokeWidth="0.5" />
              <line x1="125.5" y1="52.5" x2="130.5" y2="57.5" stroke="#555" strokeWidth="0.8" />
              <line x1="130.5" y1="52.5" x2="125.5" y2="57.5" stroke="#555" strokeWidth="0.8" />

              {/* Rivets on the O */}
              <circle cx="190" cy="25" r="4" fill="url(#rivet)" stroke="#444" strokeWidth="0.5" />
              <line x1="187" y1="22" x2="193" y2="28" stroke="#555" strokeWidth="1" />
              <line x1="193" y1="22" x2="187" y2="28" stroke="#555" strokeWidth="1" />
              <circle cx="210" cy="50" r="3.5" fill="url(#rivet)" stroke="#444" strokeWidth="0.5" />
              <line x1="207.5" y1="47.5" x2="212.5" y2="52.5" stroke="#555" strokeWidth="0.8" />
              <line x1="212.5" y1="47.5" x2="207.5" y2="52.5" stroke="#555" strokeWidth="0.8" />

              {/* Habit Builder subtitle with outline glow */}
              <g filter="url(#subtitleGlow)">
                <text x="150" y="90" textAnchor="middle"
                  fontFamily="'Impact', 'Arial Black', sans-serif"
                  fontSize="22" fontWeight="700" letterSpacing="4"
                  fill="url(#steelPlate)"
                  stroke="#666" strokeWidth="0.5"
                  filter="url(#brushed)">
                  Habit Builder
                </text>
              </g>

              {/* Small rivets on subtitle */}
              <circle cx="62" cy="84" r="2.5" fill="url(#rivet)" stroke="#444" strokeWidth="0.4" />
              <line x1="60.5" y1="82.5" x2="63.5" y2="85.5" stroke="#555" strokeWidth="0.6" />
              <line x1="63.5" y1="82.5" x2="60.5" y2="85.5" stroke="#555" strokeWidth="0.6" />
              <circle cx="238" cy="84" r="2.5" fill="url(#rivet)" stroke="#444" strokeWidth="0.4" />
              <line x1="236.5" y1="82.5" x2="239.5" y2="85.5" stroke="#555" strokeWidth="0.6" />
              <line x1="239.5" y1="82.5" x2="236.5" y2="85.5" stroke="#555" strokeWidth="0.6" />
            </svg>
          </div>
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

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-warm-50 border border-warm-100 text-warm-900 placeholder:text-warm-300 outline-none focus:border-sage-400 rounded-xl p-3 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 transition-colors"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>

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
