import { MapPin, Bell, ShoppingCart } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const cities = ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Las Vegas'];

export function TopBar() {
  const { selectedCity, setSelectedCity, cart } = useApp();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
        <div className="flex items-center gap-2 flex-1">
          <MapPin className="w-5 h-5 text-blue-600" />
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="border-0 shadow-none p-0 h-auto focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Cart Icon */}
          <button 
            onClick={() => navigate('/booking/cart')}
            className="p-2 hover:bg-gray-100 rounded-full relative"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-[#d4af37] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
          
          {/* Notifications */}
          <button className="p-2 hover:bg-gray-100 rounded-full relative">
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}