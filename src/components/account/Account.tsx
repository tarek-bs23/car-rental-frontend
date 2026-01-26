import { useNavigate } from 'react-router-dom'
import { useApp } from '../../contexts/AppContext'
import { TopBar } from '../layout/TopBar'
import { BottomNav } from '../layout/BottomNav'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import User from 'lucide-react/dist/esm/icons/user'
import CreditCard from 'lucide-react/dist/esm/icons/credit-card'
import Bell from 'lucide-react/dist/esm/icons/bell'
import HelpCircle from 'lucide-react/dist/esm/icons/help-circle'
import FileText from 'lucide-react/dist/esm/icons/file-text'
import LogOut from 'lucide-react/dist/esm/icons/log-out'
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right'
import Settings from 'lucide-react/dist/esm/icons/settings'
import { toast } from 'sonner'

const menuItems = [
  {
    icon: User,
    label: 'Edit Profile',
    path: '/account/profile',
  },
  {
    icon: CreditCard,
    label: 'Payment Methods',
    path: '/account/payments',
  },
  {
    icon: Bell,
    label: 'Notifications',
    path: '/account/notifications',
  },
  {
    icon: HelpCircle,
    label: 'Help & Support',
    path: '/support',
  },
  {
    icon: FileText,
    label: 'Terms & Privacy',
    path: '',
  },
]

export function Account() {
  const navigate = useNavigate()
  const { user, logout } = useApp()

  function handleLogout() {
    logout()
    toast.success('Logged out successfully')
    navigate('/launch')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <TopBar />
        <div className="pt-14 px-4 py-12">
          <div className="max-w-md mx-auto text-center space-y-4">
            <h2 className="text-gray-900">Not Logged In</h2>
            <p className="text-gray-600">Please log in to view your account</p>
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700"
            >
              Log In
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar />
      
      <div className="pt-14 px-4 pb-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-sm text-gray-500">{user.phone}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  onClick={() => item.path && navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors ${
                    index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="flex-1 text-left text-gray-900">{item.label}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              )
            })}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl shadow-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>

          <p className="text-center text-xs text-gray-400">
            Version 1.0.0
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
