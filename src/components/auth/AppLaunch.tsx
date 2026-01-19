import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import React from 'react';


export function AppLaunch() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Hero Visual */}
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-blue-600 rounded-3xl flex items-center justify-center">
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-gray-900">Luxury Rentals</h1>
            <p className="text-gray-600">
              Premium vehicles, professional drivers, and security services at your fingertips
            </p>
          </div>

          {/* Hero Image */}
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800"
              alt="Luxury vehicle"
              className="w-full h-64 object-cover"
            />
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/register')}
              className="w-full h-12"
            >
              Sign Up
            </Button>

            <button
              onClick={() => navigate('/login')}
              className="w-full text-blue-600 hover:text-blue-700"
            >
              Already have an account? Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
