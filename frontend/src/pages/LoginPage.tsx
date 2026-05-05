import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { PasswordInput } from '../components/ui/PasswordInput'
import toast from 'react-hot-toast'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const justRegistered = searchParams.get('registered') === 'true'
  const justReset = searchParams.get('reset') === 'true'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/boards')
    } catch (err: any) {
      toast.error(err?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-ink mb-2">🗂️ Syncwork</h1>
          <p className="text-ink-muted text-sm">Sign in to your workspace</p>
        </div>

        {justRegistered && (
          <div className="mb-4 px-4 py-3 rounded border border-green-300 bg-green-50 text-green-700 text-sm text-center">
            ✅ Account created! Please sign in below.
          </div>
        )}
        {justReset && (
          <div className="mb-4 px-4 py-3 rounded border border-green-300 bg-green-50 text-green-700 text-sm text-center">
            ✅ Password updated! Please sign in with your new password.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-paper-border rounded-lg p-8 shadow-paper space-y-4" data-testid="login-form">
          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Email</label>
            <input type="email" className="notebook-input" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" data-testid="login-email-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Password</label>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required data-testid="login-password-input" />
            <div className="text-right mt-1">
              <Link to="/forgot-password" className="text-xs text-ink-muted hover:text-ink underline">Forgot password?</Link>
            </div>
          </div>
          <button type="submit" className="btn-ink w-full mt-2" disabled={isLoading} data-testid="login-submit-button">
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-4">
          No account?{' '}
          <Link to="/register" className="text-ink underline hover:text-ink-light">Register</Link>
        </p>
      </div>
    </div>
  )
}
