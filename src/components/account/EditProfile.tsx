import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ChevronLeft, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface FormData {
  name: string;
  email: string;
  phone: string;
}

export function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useApp();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    }
  }, [user]);

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    if (!user) return;

    setUser({
      ...user,
      ...formData,
    });

    toast.success('Profile updated successfully');
    navigate('/account');
  }, [formData, navigate, setUser, user]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="ml-2">Edit Profile</span>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        {/* Profile Photo */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-sm text-gray-500">Tap to change photo</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-gray-900">Personal Information</h2>
          
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {/* Additional Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-gray-900">Preferences</h2>
          
          <div className="space-y-3">
            <button
              onClick={() => toast.info('Change password feature coming soon')}
              className="w-full text-left text-blue-600 hover:text-blue-700"
            >
              Change Password
            </button>
            <button
              onClick={() => toast.info('Language settings coming soon')}
              className="w-full text-left text-blue-600 hover:text-blue-700"
            >
              Language Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleSave}
            className="w-full h-12"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
