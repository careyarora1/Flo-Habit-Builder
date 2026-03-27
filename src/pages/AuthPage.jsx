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
  const [confirmationSent, setConfirmationSent] = useState(false)
  const [showTos, setShowTos] = useState(false)
  const [tosAgreed, setTosAgreed] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setConfirmationSent(false)

    if (mode === 'signup' && !tosAgreed) {
      setShowTos(true)
      return
    }

    setLoading(true)

    if (mode === 'login') {
      const err = await signIn(email, password)
      if (err) setError(typeof err.message === 'string' ? err.message : String(err.message || err))
    } else {
      const err = await signUp(email, password)
      if (err) {
        setError(typeof err.message === 'string' ? err.message : String(err.message || err))
      } else {
        setConfirmationSent(true)
      }
    }
    setLoading(false)
  }

  const handleTosAgree = async () => {
    setTosAgreed(true)
    setShowTos(false)
    setLoading(true)
    setError('')
    const err = await signUp(email, password)
    if (err) {
      setError(typeof err.message === 'string' ? err.message : String(err.message || err))
    } else {
      setConfirmationSent(true)
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
          {confirmationSent ? (
            <div className="text-center space-y-3 py-4">
              <p className="text-warm-900 font-medium text-lg">A confirmation has been sent to your email</p>
              <p className="text-warm-400 text-sm">Check your inbox and click the link to verify your account.</p>
              <button
                type="button"
                onClick={() => { setConfirmationSent(false); setMode('login') }}
                className="text-sage-400 hover:text-sage-300 font-medium text-sm mt-2"
              >
                Back to log in
              </button>
            </div>
          ) : (<>
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
          </>)}
        </form>
      </div>

      {showTos && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="steel-plate rounded-2xl p-6 max-w-sm w-full max-h-[85vh] flex flex-col">
            <h2 className="text-lg font-bold text-warm-900 text-center mb-4">Terms of Service</h2>
            <div className="overflow-y-auto flex-1 mb-4 text-sm text-warm-400 space-y-3 pr-1" style={{ maxHeight: '55vh' }}>
              <p className="font-semibold text-warm-900">Last updated: March 25, 2026</p>

              <p>By creating an account and using Flo Habit Builder ("the App"), you agree to the following terms. If you do not agree, do not use the App.</p>

              <p className="font-semibold text-warm-500">1. Nature of the App</p>
              <p>Flo Habit Builder is a personal productivity and habit-tracking tool. It is designed to help users set, monitor, and adjust personal goals over time. The App provides general wellness features only and is <strong className="text-warm-900">not intended to replace, substitute, or serve as any form of medical, psychological, psychiatric, or therapeutic treatment or advice.</strong></p>

              <p className="font-semibold text-warm-500">2. Not Medical or Professional Advice</p>
              <p>Nothing in this App constitutes medical advice, mental health counseling, diagnosis, or treatment. If you are experiencing mental health challenges, addiction, eating disorders, or any medical condition, please consult a qualified healthcare professional. <strong className="text-warm-900">Do not delay seeking professional help because of anything presented in this App.</strong></p>

              <p className="font-semibold text-warm-500">3. Use at Your Own Risk</p>
              <p>You use the App voluntarily and at your own risk. The developers and operators of Flo Habit Builder are not liable for any outcomes, decisions, or actions you take based on your use of the App.</p>

              <p className="font-semibold text-warm-500">4. User Accounts & Data</p>
              <p>You are responsible for maintaining the security of your account credentials. Your habit data is stored to provide the service. We do not sell your personal data to third parties.</p>

              <p className="font-semibold text-warm-500">5. Acceptable Use</p>
              <p>You agree not to misuse the App, attempt to gain unauthorized access to its systems, or use it for any unlawful purpose.</p>

              <p className="font-semibold text-warm-500">6. Limitation of Liability</p>
              <p>To the fullest extent permitted by law, Flo Habit Builder and its creators shall not be held liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the App.</p>

              <p className="font-semibold text-warm-500">7. Termination</p>
              <p>We may suspend or terminate your access to the App at our discretion, without notice, for conduct that violates these terms or is harmful to other users or the service.</p>
            </div>

            <label className="flex items-start gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                id="tos-check"
                className="mt-1 accent-sage-500"
                onChange={(e) => e.target.checked}
              />
              <span className="text-sm text-warm-400">
                I have read and agree to the <strong className="text-warm-900">Terms of Service</strong>
              </span>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowTos(false)}
                className="flex-1 py-2.5 rounded-xl border border-warm-100 text-warm-400 text-sm font-medium hover:bg-warm-100/30 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const checked = document.getElementById('tos-check').checked
                  if (!checked) {
                    setError('You must agree to the Terms of Service to create an account')
                    setShowTos(false)
                    return
                  }
                  handleTosAgree()
                }}
                className="flex-1 py-2.5 rounded-xl bg-sage-500 text-white text-sm font-medium hover:bg-sage-600 transition-colors"
              >
                I Agree & Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
