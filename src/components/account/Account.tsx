import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { TopBar } from '../layout/TopBar';
import { BottomNav } from '../layout/BottomNav';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  User, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  FileText, 
  LogOut,
  ChevronRight,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

export function Account() {
  const navigate = useNavigate();
  const { user, setUser } = useApp();

  const handleLogout = () => {
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/launch');
  };

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
    );
  }

  const menuItems = [
    {
      icon: User,
      label: 'Edit Profile',
      onClick: () => navigate('/account/profile'),
    },
    {
      icon: CreditCard,
      label: 'Payment Methods',
      onClick: () => navigate('/account/payments'),
    },
    {
      icon: Bell,
      label: 'Notifications',
      onClick: () => navigate('/account/notifications'),
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      onClick: () => navigate('/support'),
    },
    {
      icon: FileText,
      label: 'Terms & Privacy',
      onClick: () => {},
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar />
      
      <div className="pt-14 px-4 pb-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Profile Header */}
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

          {/* Menu Items */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {menuItems.map((item, index) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors ${
                  index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <item.icon className="w-5 h-5 text-gray-600" />
                <span className="flex-1 text-left text-gray-900">{item.label}</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl shadow-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>

          {/* App Version */}
          <p className="text-center text-xs text-gray-400">
            Version 1.0.0
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
