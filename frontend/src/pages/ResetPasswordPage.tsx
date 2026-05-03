import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/auth.api'
import { PasswordInput } from '../components/ui/PasswordInput'
import toast from 'react-hot-toast'

export function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token') || ''

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-4">
        <div className="w-full max-w-sm bg-white border border-paper-border rounded-lg p-8 shadow-paper text-center">
          <p className="text-todo-DEFAULT font-serif text-lg mb-2">Invalid link</p>
          <p className="text-sm text-ink-muted mb-4">
            This reset link is missing a token. Please request a new one.
          </p>
          <Link to="/forgot-password" className="btn-ink inline-block text-sm">
            Request new link
          </Link>
        </div>
      </div>
    )
  }

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

    setLoading(true)
    try {
      const { data } = await authApi.resetPassword(token, password)
      toast.success(data.message)
      navigate('/login?reset=true')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-ink mb-2">🗂️ Syncwork</h1>
          <p className="text-ink-muted text-sm">Set a new password</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-paper-border rounded-lg p-8 shadow-paper space-y-4"
          data-testid="reset-password-form"
        >
          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">
              New Password
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              data-testid="reset-password-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">
              Confirm New Password
            </label>
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              placeholder="Repeat your new password"
              autoComplete="new-password"
              data-testid="reset-confirm-input"
            />
          </div>

          <button
            type="submit"
            className="btn-ink w-full"
            disabled={loading}
            data-testid="reset-submit-button"
          >
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-4">
          <Link to="/login" className="text-ink underline hover:text-ink-light">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
