import { Avatar } from '../ui/avatar';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp, type Driver } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  ChevronLeft,
  Star,
  Award,
  Shield,
  Check,
  Clock,
  MapPin,
  Phone,
  Mail,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../ui/sheet';
import { Progress } from '../ui/progress';
import React from 'react';
import { getDriverDetails } from '../../lib/driverSearch';

interface Review {
  id: string;
  userName: string;
  userImage: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}


export function DriverDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { drivers, cart, addToCart, bookings } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiDriver, setApiDriver] = useState<Driver | null>(null);
  const [showReviews, setShowReviews] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<'hourly' | 'halfday' | 'fullday' | 'weekly' | 'monthly'>('hourly');

  const contextDriver = drivers.find(d => d.id === id);
  const driver = apiDriver || contextDriver;

  React.useEffect(() => {
    if (!id || contextDriver) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getDriverDetails(id)
      .then((data) => {
        if (cancelled) return;
        setApiDriver(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load driver');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, contextDriver]);

  // Check if vehicle is in cart OR user has active vehicle booking for bundle discount
  const hasVehicleInCart = cart.some(item => item.type === 'vehicle');
  const hasActiveVehicleBooking = bookings.some(
    booking => booking.vehicleId && (booking.status === 'confirmed' || booking.status === 'completed')
  );
  const qualifiesForDiscount = hasVehicleInCart || hasActiveVehicleBooking;
  const DRIVER_DISCOUNT = 0.10; // 10% off

  const reviews: Review[] = [
    {
      id: '1',
      userName: 'Robert Williams',
      userImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      rating: 5,
      date: '1 week ago',
      comment: 'Exceptional service! Very professional, punctual, and made our trip extremely comfortable. Highly recommended!',
      helpful: 18
    },
    {
      id: '2',
      userName: 'Lisa Anderson',
      userImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Best driver experience I\'ve had. Courteous, knowledgeable about the area, and very safe driving.',
      helpful: 15
    },
    {
      id: '3',
      userName: 'Marcus Johnson',
      userImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      rating: 5,
      date: '3 weeks ago',
      comment: 'Absolutely amazing! Very professional and made our family feel safe and comfortable throughout the entire journey.',
      helpful: 22
    },
    {
      id: '4',
      userName: 'Jennifer Lee',
      userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      rating: 5,
      date: '1 month ago',
      comment: 'Outstanding chauffeur service. Arrived early, very courteous, and drove smoothly. Will definitely book again!',
      helpful: 19
    },
    {
      id: '5',
      userName: 'Thomas Brown',
      userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      rating: 4,
      date: '1 month ago',
      comment: 'Great driver with excellent knowledge of the city. Professional and friendly. Only minor delay at pickup.',
      helpful: 8
    },
    {
      id: '6',
      userName: 'Amanda Martinez',
      userImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      rating: 5,
      date: '2 months ago',
      comment: 'Perfect for our corporate event. Very professional demeanor and excellent time management.',
      helpful: 14
    },
  ];

  const ratingBreakdown = [
    { stars: 5, count: 145, percentage: 92 },
    { stars: 4, count: 10, percentage: 6 },
    { stars: 3, count: 2, percentage: 1 },
    { stars: 2, count: 1, percentage: 1 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
        <p className="text-neutral-600">Loading driver details...</p>
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

  if (!driver) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Driver not found</p>
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
          <span className="font-medium">Driver Profile</span>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="relative">
              <ImageWithFallback
                src={driver.image}
                alt={driver.name}
                className="w-28 h-28 rounded-2xl object-cover shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full w-11 h-11 flex items-center justify-center shadow-lg border-4 border-white">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{driver.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-green-50 text-green-700 border border-green-200 px-3 py-1">
                  <Shield className="w-3.5 h-3.5 mr-1.5" />
                  Verified Professional
                </Badge>
              </div>

              <button
                onClick={() => setShowReviews(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-br from-yellow-50 to-orange-50 px-4 py-2.5 rounded-xl border border-yellow-200 hover:border-yellow-300 transition-all hover:shadow-md"
              >
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-bold text-gray-900">{driver.rating}</span>
                <span className="text-gray-600">({driver.reviewCount} reviews)</span>
              </button>
            </div>
          </div>

          {/* Premium Stats Row */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 mb-3">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{driver.experience}</p>
              <p className="text-sm text-gray-500">Years Experience</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 mb-3">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{driver.rating}</p>
              <p className="text-sm text-gray-500">Average Rating</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-green-100 mb-3">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{driver.reviewCount}</p>
              <p className="text-sm text-gray-500">Total Reviews</p>
            </div>
          </div>
        </div>

        {/* Driver License Information */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Driving License Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">License Number</p>
              <p className="font-mono font-semibold text-gray-900">{driver.license.number}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">License Class</p>
              <p className="font-semibold text-gray-900">{driver.license.class}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Expiry Date</p>
              <p className="font-semibold text-gray-900">{driver.license.expiryDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Issuing State</p>
              <p className="font-semibold text-gray-900">{driver.license.issuingState}</p>
            </div>
          </div>
        </div>

        {/* Compatible Vehicles */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            Compatible Vehicles
          </h3>
          <div className="flex flex-wrap gap-2">
            {driver.compatibleVehicles.map((type, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200"
              >
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Services */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Professional Services
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700">Airport Transfers</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700">Corporate Events</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700">Long Distance Travel</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700">City Tours & Sightseeing</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700">24/7 Availability</span>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Certifications & Training</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Professional Chauffeur License
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Defensive Driving Certified
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                First Aid & CPR Certified
              </Badge>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Select Service Duration</h3>
          <p className="text-sm text-gray-600 mb-4">
            Choose your preferred booking duration. Longer bookings offer better value!
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setSelectedDuration('hourly')}
              className={`w-full p-5 rounded-xl border-2 transition-all text-left ${selectedDuration === 'hourly'
                ? 'border-green-600 bg-green-50 shadow-lg shadow-green-100'
                : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${selectedDuration === 'hourly' ? 'text-green-600' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${selectedDuration === 'hourly' ? 'text-green-900' : 'text-gray-600'}`}>
                    Hourly Rate
                  </span>
                </div>
                <span className={`text-2xl font-bold ${selectedDuration === 'hourly' ? 'text-green-900' : 'text-gray-900'}`}>
                  ${driver.pricePerHour}/hr
                </span>
              </div>
              <p className={`text-xs ${selectedDuration === 'hourly' ? 'text-green-700' : 'text-gray-500'}`}>
                Flexible option (minimum 3 hours)
              </p>
              {selectedDuration === 'hourly' && (
                <div className="mt-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">Selected</span>
                </div>
              )}
            </button>

            <button
              onClick={() => setSelectedDuration('halfday')}
              className={`w-full p-5 rounded-xl border-2 transition-all text-left ${selectedDuration === 'halfday'
                ? 'border-green-600 bg-green-50 shadow-lg shadow-green-100'
                : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${selectedDuration === 'halfday' ? 'text-green-900' : 'text-gray-600'}`}>
                  Half Day (12 hours)
                </span>
                <span className={`text-2xl font-bold ${selectedDuration === 'halfday' ? 'text-green-900' : 'text-gray-900'}`}>
                  ${driver.pricePerHour * 12}
                </span>
              </div>
              <p className={`text-xs ${selectedDuration === 'halfday' ? 'text-green-700' : 'text-gray-500'}`}>
                Perfect for short trips
              </p>
              {selectedDuration === 'halfday' && (
                <div className="mt-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">Selected</span>
                </div>
              )}
            </button>

            <button
              onClick={() => setSelectedDuration('fullday')}
              className={`w-full p-5 rounded-xl border-2 transition-all text-left relative overflow-hidden ${selectedDuration === 'fullday'
                ? 'border-green-600 bg-gradient-to-br from-green-600 to-green-700 shadow-lg'
                : 'border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-300'
                }`}
            >
              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                BEST VALUE
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${selectedDuration === 'fullday' ? 'text-white' : 'text-green-900'}`}>
                  Full Day (24 hours)
                </span>
                <span className={`text-2xl font-bold ${selectedDuration === 'fullday' ? 'text-white' : 'text-green-900'}`}>
                  ${driver.pricePerHour * 24}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`text-xs ${selectedDuration === 'fullday' ? 'bg-green-900 text-white' : 'bg-green-600 text-white'}`}>
                  Save ${driver.pricePerHour * 0.5}
                </Badge>
                <span className={`text-xs ${selectedDuration === 'fullday' ? 'text-green-100' : 'text-green-700'}`}>
                  vs hourly rate
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
              className={`w-full p-5 rounded-xl border-2 transition-all text-left relative overflow-hidden ${selectedDuration === 'weekly'
                ? 'border-green-600 bg-green-50 shadow-lg shadow-green-100'
                : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${selectedDuration === 'weekly' ? 'text-green-900' : 'text-gray-600'}`}>
                  Weekly (7 days)
                </span>
                <span className={`text-2xl font-bold ${selectedDuration === 'weekly' ? 'text-green-900' : 'text-gray-900'}`}>
                  ${driver.pricePerHour * 24 * 7}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`text-xs ${selectedDuration === 'weekly' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  Extended Service
                </Badge>
                <span className={`text-xs ${selectedDuration === 'weekly' ? 'text-green-700' : 'text-gray-500'}`}>
                  Multi-day coverage
                </span>
              </div>
              {selectedDuration === 'weekly' && (
                <div className="mt-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">Selected</span>
                </div>
              )}
            </button>

            <button
              onClick={() => setSelectedDuration('monthly')}
              className={`w-full p-5 rounded-xl border-2 transition-all text-left relative overflow-hidden ${selectedDuration === 'monthly'
                ? 'border-green-600 bg-gradient-to-br from-green-600 to-green-700 shadow-lg'
                : 'border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-300'
                }`}
            >
              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                PREMIUM
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${selectedDuration === 'monthly' ? 'text-white' : 'text-green-900'}`}>
                  Monthly (30 days)
                </span>
                <span className={`text-2xl font-bold ${selectedDuration === 'monthly' ? 'text-white' : 'text-green-900'}`}>
                  ${driver.pricePerHour * 24 * 30}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`text-xs ${selectedDuration === 'monthly' ? 'bg-green-900 text-white' : 'bg-green-600 text-white'}`}>
                  Long-Term Service
                </Badge>
                <span className={`text-xs ${selectedDuration === 'monthly' ? 'text-green-100' : 'text-green-700'}`}>
                  Maximum flexibility
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
              See what customers are saying about this driver
            </SheetDescription>
          </SheetHeader>

          {/* Overall Rating */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6 border border-yellow-200">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-1">{driver.rating}</div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= Math.floor(driver.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600">{driver.reviewCount} reviews</div>
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
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-green-800 font-medium">
                10% bundle discount will be applied at checkout
              </p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium mb-1">
                {selectedDuration === 'hourly' && 'Hourly Rate'}
                {selectedDuration === 'halfday' && 'Half Day (12 hours)'}
                {selectedDuration === 'fullday' && 'Full Day (24 hours)'}
                {selectedDuration === 'weekly' && 'Weekly (7 days)'}
                {selectedDuration === 'monthly' && 'Monthly (30 days)'}
                {qualifiesForDiscount && ' (before discount)'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${selectedDuration === 'hourly' && driver.pricePerHour}
                {selectedDuration === 'halfday' && driver.pricePerHour * 12}
                {selectedDuration === 'fullday' && driver.pricePerHour * 24}
                {selectedDuration === 'weekly' && driver.pricePerHour * 24 * 7}
                {selectedDuration === 'monthly' && driver.pricePerHour * 24 * 30}
                <span className="text-base font-normal text-gray-500">
                  {selectedDuration === 'hourly' ? '/hr' : ' total'}
                </span>
              </p>
            </div>
            <div className="relative">
              {qualifiesForDiscount && (
                <div className="absolute -top-3 -right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  10% OFF
                </div>
              )}
              <Button
                onClick={() => {
                  addToCart({
                    type: 'driver',
                    serviceId: driver.id,
                    duration: selectedDuration,
                    startDate: new Date(),
                    endDate: null,
                    startTime: '09:00',
                    endTime: '17:00',
                  });
                  toast.success('Driver added to cart!');
                  navigate('/booking/cart');
                }}
                className="h-14 px-10 text-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-600/30"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}