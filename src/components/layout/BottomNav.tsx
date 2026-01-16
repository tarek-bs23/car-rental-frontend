import { Home, Calendar, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Home, label: 'Services' },
    { path: '/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/account', icon: User, label: 'Account' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || 
             location.pathname === '/vehicles' || 
             location.pathname === '/drivers' || 
             location.pathname === '/bodyguards' ||
             location.pathname.startsWith('/vehicle/') ||
             location.pathname.startsWith('/driver/') ||
             location.pathname.startsWith('/bodyguard/');
    }
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1"
            >
              <Icon 
                className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-500'}`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className={`text-xs ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}