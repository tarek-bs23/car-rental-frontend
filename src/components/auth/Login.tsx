import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useApp, User } from '../../contexts/AppContext';
import { toast } from 'sonner';
import { apiJson } from '../../lib/api';
import { endpoints } from '../../lib/endpoints';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    city?: { id: string; name: string };
  };
}

export function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await apiJson<LoginResponse>({
        path: endpoints.auth.loginUser,
        method: 'POST',
        body: { email: email.trim(), password },
        skipAuth: true,
      });

      const apiUser = response.user;
      const mappedUser: User = {
        id: apiUser.id,
        email: apiUser.email,
        name: apiUser.firstName && apiUser.lastName
          ? `${apiUser.firstName} ${apiUser.lastName}`
          : apiUser.email.split('@')[0],
        phone: apiUser.phoneNumber || '',
        city: apiUser.city?.name || '',
      };

      login(response.token, mappedUser);
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, isLoading, login, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col px-6 py-8">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-gray-900">Welcome Back</h1>
            <p className="text-gray-600">Log in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Forgot password?
            </button>

            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => navigate('/register')}
              className="text-gray-600"
            >
              Don't have an account?{' '}
              <span className="text-blue-600 hover:text-blue-700">Sign Up</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
