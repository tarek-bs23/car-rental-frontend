import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { apiJson } from '../../lib/api';
import { endpoints } from '../../lib/endpoints';
import { ChevronLeft } from 'lucide-react';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !email.trim()) return;

    setIsLoading(true);

    try {
      await apiJson({
        path: endpoints.auth.forgotPassword,
        method: 'POST',
        body: { email: email.trim() },
        skipAuth: true,
      });

      toast.success('OTP sent to your email');
      navigate('/verify-otp', { state: { email: email.trim() } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send OTP';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [email, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="ml-2">Forgot Password</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 py-8">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-gray-900">Reset Password</h1>
            <p className="text-gray-600">
              Enter your email address and we'll send you an OTP to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send OTP'}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-600"
            >
              Remember your password?{' '}
              <span className="text-blue-600 hover:text-blue-700">Log In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
