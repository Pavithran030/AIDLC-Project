import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api/auth.api'
import toast from 'react-hot-toast'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
      toast.success('Reset link sent if that email is registered')
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-ink mb-2">🗂️ Syncwork</h1>
          <p className="text-ink-muted text-sm">Reset your password</p>
        </div>
        {sent ? (
          <div className="bg-white border border-paper-border rounded-lg p-8 shadow-paper text-center space-y-4">
            <div className="text-4xl">📬</div>
            <p className="font-serif text-lg text-ink">Check your inbox</p>
            <p className="text-sm text-ink-muted">A reset link has been sent. The link expires in 1 hour.</p>
            <Link to="/login" className="btn-ink inline-block mt-2 text-sm">Back to sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-paper-border rounded-lg p-8 shadow-paper space-y-4" data-testid="forgot-password-form">
            <p className="text-sm text-ink-muted">Enter your email and we'll send you a reset link.</p>
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Email</label>
              <input type="email" className="notebook-input" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" data-testid="forgot-email-input" />
            </div>
            <button type="submit" className="btn-ink w-full" disabled={loading} data-testid="forgot-submit-button">
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}
        <p className="text-center text-sm text-ink-muted mt-4">
          <Link to="/login" className="text-ink underline hover:text-ink-light">← Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
