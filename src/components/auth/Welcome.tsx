import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Success Animation */}
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-3">
            <h1 className="text-gray-900">Welcome Aboard!</h1>
            <p className="text-gray-600">
              Your account has been created successfully. Start exploring premium vehicles and services.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Button 
              onClick={() => navigate('/profile-setup')}
              className="w-full h-12"
            >
              Complete Profile
            </Button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full text-gray-600 hover:text-gray-700"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
