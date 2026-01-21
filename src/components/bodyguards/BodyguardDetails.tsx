import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp, type Bodyguard } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ChevronLeft, Star, Check, Shield, Award, AlertCircle, Users, Loader2 } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Avatar } from '../ui/avatar';
import { toast } from 'sonner';
import { getBodyguardDetails } from '../../lib/bodyguardSearch';
import { apiJson } from '../../lib/api';
import { endpoints } from '../../lib/endpoints';

interface Review {
  id: string;
  userName: string;
  userImage: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}

export function BodyguardDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bodyguards, cart, addToCart, bookings, selectedCity } = useApp();
  const [searchParams] = useSearchParams();
  const [showReviews, setShowReviews] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<'hourly' | 'halfday' | 'fullday' | 'weekly' | 'monthly'>('hourly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiBodyguard, setApiBodyguard] = useState<Bodyguard | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const urlDuration = searchParams.get('duration') as 'hourly' | 'daily' | 'weekly' | 'monthly' | null;
  const urlStartDate = searchParams.get('startDate');
  const urlEndDate = searchParams.get('endDate');
  const urlStartTime = searchParams.get('startTime') || '09:00';
  const urlEndTime = searchParams.get('endTime') || '17:00';

  interface AddToCartResponse {
    statusCode: number;
    message: string;
    data: unknown;
  }

  const contextBodyguard = bodyguards.find(b => b.id === id);
  const bodyguard = apiBodyguard || contextBodyguard;

  useEffect(() => {
    if (!urlDuration) return;

    if (urlDuration === 'daily') {
      setSelectedDuration('fullday');
      return;
    }

    if (['hourly', 'weekly', 'monthly'].includes(urlDuration)) {
      setSelectedDuration(urlDuration as typeof selectedDuration);
    }
  }, [urlDuration]);

  useEffect(() => {
    if (!id || contextBodyguard) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getBodyguardDetails(id)
      .then((data) => {
        if (cancelled) return;
        setApiBodyguard(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load security service');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, contextBodyguard]);
  
  // Check if vehicle is in cart OR user has active vehicle booking for bundle discount
  const hasVehicleInCart = cart.some(item => item.type === 'vehicle');
  const hasActiveVehicleBooking = bookings.some(
    booking => booking.vehicleId && (booking.status === 'confirmed' || booking.status === 'completed')
  );
  const qualifiesForDiscount = hasVehicleInCart || hasActiveVehicleBooking;
  const BODYGUARD_DISCOUNT = 0.15; // 15% off

  const reviews: Review[] = [
    {
      id: '1',
      userName: 'James Peterson',
      userImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      rating: 5,
      date: '3 weeks ago',
      comment: 'Extremely professional and discrete service. Made us feel completely safe throughout our trip. Highly recommended!',
      helpful: 42
    },
    {
      id: '2',
      userName: 'Maria Garcia',
      userImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      rating: 5,
      date: '1 month ago',
      comment: 'Top-tier security service. Very professional team, excellent communication, and made our event run smoothly.',
      helpful: 35
    },
  ];

  const ratingBreakdown = [
    { stars: 5, count: 187, percentage: 95 },
    { stars: 4, count: 8, percentage: 4 },
    { stars: 3, count: 1, percentage: 1 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
        <p className="text-neutral-600">Loading security service details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-900">Failed to Load</h3>
        <p className="text-neutral-600 text-center">{error}</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  if (!bodyguard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Security service not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="font-medium">Security Profile</span>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="relative">
              <ImageWithFallback
                src={bodyguard.image}
                alt={bodyguard.name}
                className="w-28 h-28 rounded-2xl object-cover shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full w-11 h-11 flex items-center justify-center shadow-lg border-4 border-white">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{bodyguard.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1">
                  <Shield className="w-3.5 h-3.5 mr-1.5" />
                  {bodyguard.securityLevel} Security
                </Badge>
                <Badge className="bg-green-50 text-green-700 border border-green-200 px-3 py-1">
                  Certified Professional
                </Badge>
              </div>
              
              <button 
                onClick={() => setShowReviews(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-br from-yellow-50 to-orange-50 px-4 py-2.5 rounded-xl border border-yellow-200 hover:border-yellow-300 transition-all hover:shadow-md"
              >
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-bold text-gray-900">{bodyguard.rating}</span>
                <span className="text-gray-600">Perfect Rating</span>
              </button>
            </div>
          </div>
          
          {/* Premium Stats Row */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 mb-3">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{bodyguard.experience}</p>
              <p className="text-sm text-gray-500">Years Experience</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{bodyguard.teamSize}</p>
              <p className="text-sm text-gray-500">{bodyguard.teamSize === 1 ? 'Individual' : 'Team Size'}</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 mb-3">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{bodyguard.rating}</p>
              <p className="text-sm text-gray-500">Average Rating</p>
            </div>
          </div>
        </div>

        {/* Security Team Members */}
        {bodyguard.teamSize > 1 && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Security Team Members
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {bodyguard.teamMembers.map((member, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 bg-white/80 backdrop-blur rounded-xl p-4 border border-purple-100"
                >
                  <div className="relative">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-20 h-20 rounded-xl object-cover shadow-md"
                    />
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md border-2 border-white">
                        <Star className="w-3 h-3 fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{member.name}</h4>
                    <p className="text-sm text-purple-700 font-medium">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Single Agent Display */}
        {bodyguard.teamSize === 1 && bodyguard.teamMembers.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Security Professional
            </h3>
            <div className="flex items-center gap-4 bg-white/80 backdrop-blur rounded-xl p-4 border border-purple-100">
              <div className="relative">
                <ImageWithFallback
                  src={bodyguard.teamMembers[0].image}
                  alt={bodyguard.teamMembers[0].name}
                  className="w-24 h-24 rounded-xl object-cover shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md border-2 border-white">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{bodyguard.teamMembers[0].name}</h4>
                <p className="text-sm text-purple-700 font-medium mb-2">{bodyguard.teamMembers[0].role}</p>
                <p className="text-xs text-gray-600">{bodyguard.experience} years of professional security experience</p>
              </div>
            </div>
          </div>
        )}

        {/* Security Level Details */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Security Level: {bodyguard.securityLevel}
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            {bodyguard.securityLevel === 'VIP' && (
              <>
                <p>• Elite protection for high-profile clients and events</p>
                <p>• Advanced threat assessment and risk management</p>
                <p>• Coordinated team operations with secure communication</p>
                <p>• Armored vehicle escort capabilities</p>
              </>
            )}
            {bodyguard.securityLevel === 'Executive' && (
              <>
                <p>• Professional protection for corporate executives</p>
                <p>• Discrete and professional presence</p>
                <p>• Business event security expertise</p>
                <p>• Travel security coordination</p>
              </>
            )}
            {bodyguard.securityLevel === 'Standard' && (
              <>
                <p>• Reliable personal protection services</p>
                <p>• Event security and crowd management</p>
                <p>• Professional and courteous service</p>
                <p>• Flexible scheduling options</p>
              </>
            )}
          </div>
        </div>

        {/* Services Included */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            Included Services
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700">24/7 Personal Protection</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700">Threat Assessment & Planning</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700">Secure Transportation Escort</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700">Event Security Management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700">Confidentiality Guaranteed</span>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Certifications & Qualifications
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Licensed Security Professional
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Executive Protection Specialist
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Advanced Firearms Training
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Emergency Medical Response
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Counter-Terrorism Certified
              </Badge>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Booking Requirements</h4>
              <p className="text-sm text-gray-700">
                Security services require 24-hour advance booking and may require additional documentation for verification purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Select Service Duration</h3>
          <p className="text-sm text-gray-600 mb-4">
            Choose your preferred security coverage. Extended coverage available at better rates!
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setSelectedDuration('hourly')}
              className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                selectedDuration === 'hourly'
                  ? 'border-purple-600 bg-purple-50 shadow-lg shadow-purple-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className={`w-4 h-4 ${selectedDuration === 'hourly' ? 'text-purple-600' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${selectedDuration === 'hourly' ? 'text-purple-900' : 'text-gray-600'}`}>
                    Hourly Rate
                  </span>
                </div>
                <span className={`text-2xl font-bold ${selectedDuration === 'hourly' ? 'text-purple-900' : 'text-gray-900'}`}>
                  ${bodyguard.pricePerHour}/hr
                </span>
              </div>
              <p className={`text-xs ${selectedDuration === 'hourly' ? 'text-purple-700' : 'text-gray-500'}`}>
                Flexible protection (minimum 4 hours)
              </p>
              {selectedDuration === 'hourly' && (
                <div className="mt-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-700 font-medium">Selected</span>
                </div>
              )}
            </button>
            
            <button
              onClick={() => setSelectedDuration('halfday')}
              className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                selectedDuration === 'halfday'
                  ? 'border-purple-600 bg-purple-50 shadow-lg shadow-purple-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${selectedDuration === 'halfday' ? 'text-purple-900' : 'text-gray-600'}`}>
                  Half Day (12 hours)
                </span>
                <span className={`text-2xl font-bold ${selectedDuration === 'halfday' ? 'text-purple-900' : 'text-gray-900'}`}>
                  ${bodyguard.pricePerHour * 12}
                </span>
              </div>
              <p className={`text-xs ${selectedDuration === 'halfday' ? 'text-purple-700' : 'text-gray-500'}`}>
                Extended protection coverage
              </p>
              {selectedDuration === 'halfday' && (
                <div className="mt-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-700 font-medium">Selected</span>
                </div>
              )}
            </button>

            <button
              onClick={() => setSelectedDuration('fullday')}
              className={`w-full p-5 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                selectedDuration === 'fullday'
                  ? 'border-purple-600 bg-gradient-to-br from-purple-600 to-purple-700 shadow-lg'
                  : 'border-gray-200 bg-gradient-to-br from-purple-50 to-indigo-50 hover:border-purple-300'
              }`}
            >
              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                PREMIUM
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${selectedDuration === 'fullday' ? 'text-white' : 'text-purple-900'}`}>
                  24-Hour Security
                </span>
                <span className={`text-2xl font-bold ${selectedDuration === 'fullday' ? 'text-white' : 'text-purple-900'}`}>
                  ${bodyguard.pricePerHour * 24}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`text-xs ${selectedDuration === 'fullday' ? 'bg-purple-900 text-white' : 'bg-purple-600 text-white'}`}>
                  24/7 Protection
                </Badge>
                <span className={`text-xs ${selectedDuration === 'fullday' ? 'text-purple-100' : 'text-purple-700'}`}>
                  Round-the-clock coverage
                </span>
              </div>
              {selectedDuration === 'fullday' && (
                <div className="mt-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-white" />
                  <span className="text-sm text-white font-medium">Selected</span>
                </div>
              )}
            </button>

            <button
              onClick={() => setSelectedDuration('weekly')}
              className={`w-full p-5 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                selectedDuration === 'weekly'
                  ? 'border-purple-600 bg-purple-50 shadow-lg shadow-purple-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${selectedDuration === 'weekly' ? 'text-purple-900' : 'text-gray-600'}`}>
                  Weekly (7 days)
                </span>
                <span className={`text-2xl font-bold ${selectedDuration === 'weekly' ? 'text-purple-900' : 'text-gray-900'}`}>
                  ${bodyguard.pricePerHour * 24 * 7}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`text-xs ${selectedDuration === 'weekly' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  Save ${bodyguard.pricePerHour * 24}
                </Badge>
                <span className={`text-xs ${selectedDuration === 'weekly' ? 'text-purple-700' : 'text-gray-500'}`}>
                  vs daily rate
                </span>
              </div>
              {selectedDuration === 'weekly' && (
                <div className="mt-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-700 font-medium">Selected</span>
                </div>
              )}
            </button>

            <button
              onClick={() => setSelectedDuration('monthly')}
              className={`w-full p-5 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                selectedDuration === 'monthly'
                  ? 'border-purple-600 bg-gradient-to-br from-purple-600 to-purple-700 shadow-lg'
                  : 'border-gray-200 bg-gradient-to-br from-purple-50 to-indigo-50 hover:border-purple-300'
              }`}
            >
              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                BEST VALUE
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${selectedDuration === 'monthly' ? 'text-white' : 'text-purple-900'}`}>
                  Monthly (30 days)
                </span>
                <span className={`text-2xl font-bold ${selectedDuration === 'monthly' ? 'text-white' : 'text-purple-900'}`}>
                  ${bodyguard.pricePerHour * 24 * 30}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`text-xs ${selectedDuration === 'monthly' ? 'bg-purple-900 text-white' : 'bg-purple-600 text-white'}`}>
                  Maximum Savings
                </Badge>
                <span className={`text-xs ${selectedDuration === 'monthly' ? 'text-purple-100' : 'text-purple-700'}`}>
                  Long-term protection
                </span>
              </div>
              {selectedDuration === 'monthly' && (
                <div className="mt-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-white" />
                  <span className="text-sm text-white font-medium">Selected</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Sheet */}
      <Sheet open={showReviews} onOpenChange={setShowReviews}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Ratings & Reviews</SheetTitle>
            <SheetDescription>
              See what clients are saying about this security service
            </SheetDescription>
          </SheetHeader>

          {/* Overall Rating */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6 border border-yellow-200">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-1">{bodyguard.rating}</div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className="w-4 h-4 fill-yellow-400 text-yellow-400" 
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600">Perfect Rating</div>
              </div>
              
              <div className="flex-1 space-y-2">
                {ratingBreakdown.map((item) => (
                  <div key={item.stars} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-8">{item.stars}★</span>
                    <Progress value={item.percentage} className="h-2 flex-1" />
                    <span className="text-sm text-gray-500 w-8 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-12 h-12">
                    <ImageWithFallback
                      src={review.userImage}
                      alt={review.userName}
                      className="w-full h-full object-cover"
                    />
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">{review.userName}</span>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
                <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <span>Helpful ({review.helpful})</span>
                </button>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 p-4 shadow-2xl safe-area-bottom z-10">
        <div className="max-w-2xl mx-auto">
          {/* Bundle discount notice */}
          {qualifiesForDiscount && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-purple-800 font-medium">
                15% bundle discount will be applied at checkout
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium mb-1">
                {selectedDuration === 'hourly' && 'Hourly Rate'}
                {selectedDuration === 'halfday' && 'Half Day (12 hours)'}
                {selectedDuration === 'fullday' && '24-Hour Security'}
                {selectedDuration === 'weekly' && 'Weekly (7 days)'}
                {selectedDuration === 'monthly' && 'Monthly (30 days)'}
                {qualifiesForDiscount && ' (before discount)'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${selectedDuration === 'hourly' && bodyguard.pricePerHour}
                {selectedDuration === 'halfday' && bodyguard.pricePerHour * 12}
                {selectedDuration === 'fullday' && bodyguard.pricePerHour * 24}
                {selectedDuration === 'weekly' && bodyguard.pricePerHour * 24 * 7}
                {selectedDuration === 'monthly' && bodyguard.pricePerHour * 24 * 30}
                <span className="text-base font-normal text-gray-500">
                  {selectedDuration === 'hourly' ? '/hr' : ' total'}
                </span>
              </p>
            </div>
            <div className="relative">
              {qualifiesForDiscount && (
                <div className="absolute -top-3 -right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  15% OFF
                </div>
              )}
              <Button
                onClick={async () => {
                  if (!id) return;

                  const pricingType =
                    selectedDuration === 'hourly'
                      ? 'HOURLY'
                      : selectedDuration === 'weekly'
                        ? 'WEEKLY'
                        : selectedDuration === 'monthly'
                          ? 'MONTHLY'
                          : 'DAILY';

                  const start = urlStartDate || new Date().toISOString();
                  const end = urlEndDate || start;

                  setIsAddingToCart(true);
                  try {
                    const response = await apiJson<AddToCartResponse>({
                      path: endpoints.cart.items,
                      method: 'POST',
                      body: {
                        itemType: 'BODYGUARD',
                        city: selectedCity,
                        startDate: start,
                        endDate: end,
                        pricingType,
                        bodyguardId: id,
                      },
                    });

                    const startDateObj = urlStartDate ? new Date(urlStartDate) : new Date(start);
                    const endDateObj = urlEndDate ? new Date(urlEndDate) : null;

                    addToCart({
                      type: 'bodyguard',
                      serviceId: bodyguard.id,
                      duration: selectedDuration,
                      startDate: startDateObj,
                      endDate: endDateObj,
                      startTime: urlStartTime,
                      endTime: urlEndTime,
                    });

                    toast.success(response.message || 'Security service added to cart!');
                    navigate('/booking/cart');
                  } catch (error) {
                    const message =
                      error instanceof Error ? error.message : 'Failed to add to cart';
                    toast.error(message);
                  } finally {
                    setIsAddingToCart(false);
                  }
                }}
                disabled={isAddingToCart}
                className="h-14 px-10 text-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-600/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}