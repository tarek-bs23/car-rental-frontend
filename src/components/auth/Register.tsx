import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../ui/select';
import { toast } from 'sonner';
import { apiJson } from '../../lib/api';
import { endpoints } from '../../lib/endpoints';

const IS_VERIFY_EMAIL_ENABLED = false;

interface City {
  id: string;
  name: string;
}

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  cityId: string;
}

interface CitiesResponse {
  statusCode: number;
  message: string;
  data: City[];
}


export function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    cityId: '',
  });
  const [selectedCityId, setSelectedCityId] = useState<string | undefined>(undefined);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(true);
  const [citiesError, setCitiesError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCities() {
      setIsCitiesLoading(true);
      setCitiesError(null);

      try {
        const response = await apiJson<CitiesResponse>({
          path: endpoints.auth.publicCities,
        });

        if (!isMounted) return;

        setCities(response.data || []);

        if (!selectedCityId && response.data && response.data.length > 0) {
          const firstCityId = response.data[0].id;
          setSelectedCityId(firstCityId);
          setFormData(prev => ({ ...prev, cityId: firstCityId }));
        }
      } catch (error) {
        if (!isMounted) return;

        const message = error instanceof Error ? error.message : 'Failed to load cities';
        setCitiesError(message);
      } finally {
        if (!isMounted) return;
        setIsCitiesLoading(false);
      }
    }

    loadCities();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFieldChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCityChange = useCallback((value: string) => {
    setSelectedCityId(value);
    setFormData(prev => ({ ...prev, cityId: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        cityId: formData.cityId || undefined,
      };

      await apiJson({
        path: endpoints.auth.registerUser,
        method: 'POST',
        body: payload,
      });

      toast.success('Account created successfully. Please log in.');

      if (IS_VERIFY_EMAIL_ENABLED) {
        navigate('/verify-email');
        return;
      }

      navigate('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create account';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, navigate]);

  const isSubmitDisabled =
    !agreedToTerms || isSubmitting || isCitiesLoading || !formData.cityId || !formData.firstName || !formData.lastName;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col px-6 py-8 pb-24 overflow-auto">
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-gray-900">Create Account</h1>
            <p className="text-gray-600">Sign up to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1 234 567 8900"
                value={formData.phoneNumber}
                onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select
                value={selectedCityId}
                onValueChange={handleCityChange}
                disabled={isCitiesLoading || !!citiesError}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isCitiesLoading ? 'Loading cities...' : citiesError ? 'Failed to load cities' : 'Select your city'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>

            <Button type="submit" className="w-full h-12" disabled={isSubmitDisabled}>
              Create Account
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-600"
            >
              Already have an account?{' '}
              <span className="text-blue-600 hover:text-blue-700">Log In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
