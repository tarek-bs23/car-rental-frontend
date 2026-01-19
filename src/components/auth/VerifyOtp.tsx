import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { apiJson } from '../../lib/api';
import { endpoints } from '../../lib/endpoints';
import { ChevronLeft } from 'lucide-react';

interface VerifyOtpResponse {
  resetToken: string;
}

export function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = (location.state as { email?: string })?.email || '';

  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !email.trim() || !otp.trim()) return;

    setIsLoading(true);

    try {
      const response = await apiJson<VerifyOtpResponse>({
        path: endpoints.auth.verifyOtp,
        method: 'POST',
        body: { email: email.trim(), otp: otp.trim() },
        skipAuth: true,
      });

      toast.success('OTP verified successfully');
      navigate('/reset-password', { state: { resetToken: response.resetToken } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid OTP';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [email, otp, isLoading, navigate]);

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
          <span className="ml-2">Verify OTP</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 py-8">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-gray-900">Enter OTP</h1>
            <p className="text-gray-600">
              We've sent a verification code to your email. Please enter it below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!emailFromState && (
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
            )}

            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                autoFocus
              />
            </div>

            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-blue-600 hover:text-blue-700"
            >
              Didn't receive a code? Resend
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
