import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { PasswordInput } from '../components/ui/PasswordInput'
import toast from 'react-hot-toast'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [displayName, setDisplayName] = useState('')
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      await register(email, password, displayName)
      // Redirect to login with a flag so it shows a success banner
      navigate('/login?registered=true')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-ink mb-2">🗂️ Syncwork</h1>
          <p className="text-ink-muted text-sm">Create your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-paper-border rounded-lg p-8 shadow-paper space-y-4"
          data-testid="register-form"
        >
          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">
              Display Name
            </label>
            <input
              className="notebook-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder="Your name"
              data-testid="register-name-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">
              Email
            </label>
            <input
              type="email"
              className="notebook-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              data-testid="register-email-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">
              Password
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              data-testid="register-password-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">
              Confirm Password
            </label>
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              placeholder="Repeat your password"
              autoComplete="new-password"
              data-testid="register-confirm-input"
            />
          </div>

          <button
            type="submit"
            className="btn-ink w-full mt-2"
            disabled={isLoading}
            data-testid="register-submit-button"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-ink underline hover:text-ink-light">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
