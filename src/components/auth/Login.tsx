import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useApp } from '../../contexts/AppContext';
import { toast } from 'sonner';

export function Login() {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    setUser({
      id: '1',
      name: 'John Doe',
      email,
      phone: '+1 234 567 8900',
      city: 'New York',
    });

    toast.success('Successfully logged in!');
    navigate('/');
  }, [email, navigate, setUser]);

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
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Forgot password?
            </button>

            <Button type="submit" className="w-full h-12">
              Log In
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
