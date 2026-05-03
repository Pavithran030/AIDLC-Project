import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-ink text-paper px-6 py-3 flex items-center justify-between shadow-md">
      <span
        className="font-serif text-xl font-semibold cursor-pointer"
        onClick={() => navigate('/boards')}
      >
        🗂️ Syncwork
      </span>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-paper/80">{user.display_name}</span>
          <button
            className="btn-ghost text-paper/80 border-paper/30 hover:bg-ink-light text-sm"
            onClick={handleLogout}
            data-testid="logout-button"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  )
}
