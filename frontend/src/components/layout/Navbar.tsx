import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-ink text-paper px-4 sm:px-6 py-3 flex items-center justify-between shadow-md">
      <span className="font-serif text-lg sm:text-xl font-semibold cursor-pointer shrink-0" onClick={() => navigate('/boards')}>
        🗂️ Syncwork
      </span>
      {user && (
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <span className="text-xs sm:text-sm text-paper/80 truncate max-w-[100px] sm:max-w-none">{user.display_name}</span>
          <button className="text-xs sm:text-sm whitespace-nowrap shrink-0 bg-red-600 hover:bg-red-700 text-white border-none rounded px-3 py-1.5 cursor-pointer transition-colors" onClick={handleLogout} data-testid="logout-button">
            Sign out
          </button>
        </div>
      )}
    </nav>
  )
}
