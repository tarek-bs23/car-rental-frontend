import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ChevronLeft, Star, Check, Car, Fuel, Users, Calendar, Clock, Shield, Award, AlertCircle, X, ChevronRight, FileText, Cog } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Avatar } from '../ui/avatar';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';

interface Review {
  id: string;
  userName: string;
  userImage: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}

export function VehicleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vehicles, addToCart } = useApp();
  const [searchParams] = useSearchParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReviews, setShowReviews] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>(
    (searchParams.get('duration') as 'hourly' | 'daily' | 'weekly' | 'monthly') || 'daily'
  );
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [includeFuel, setIncludeFuel] = useState(true); // true = fuel included (higher price), false = add fuel charges (lower base price)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const vehicle = vehicles.find(v => v.id === id);

  // Get dates from URL
  const urlStartDate = searchParams.get('startDate');
  const urlEndDate = searchParams.get('endDate');
  const urlStartTime = searchParams.get('startTime') || '10:00';
  const urlEndTime = searchParams.get('endTime') || '18:00';

  // Initialize dates from URL if available
  useEffect(() => {
    if (urlStartDate) {
      setStartDate(new Date(urlStartDate));
    }
    if (urlEndDate) {
      setEndDate(new Date(urlEndDate));
    }
  }, [urlStartDate, urlEndDate]);

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: '1',
      userName: 'Sarah Johnson',
      userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Absolutely amazing experience! The car was in perfect condition, super clean, and drove like a dream. The booking process was seamless.',
      helpful: 24
    },
    {
      id: '2',
      userName: 'Michael Chen',
      userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      rating: 5,
      date: '1 month ago',
      comment: 'Premium luxury at its finest. The vehicle exceeded all expectations. Highly recommended for special occasions!',
      helpful: 18
    },
    {
      id: '3',
      userName: 'Emily Rodriguez',
      userImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      rating: 4,
      date: '1 month ago',
      comment: 'Great car and smooth ride. Only minor issue was pickup timing, but overall excellent service.',
      helpful: 12
    },
    {
      id: '4',
      userName: 'David Park',
      userImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      rating: 5,
      date: '2 months ago',
      comment: 'Worth every penny! The comfort and features are top-notch. Will definitely rent again.',
      helpful: 31
    },
  ];

  const ratingBreakdown = [
    { stars: 5, count: 98, percentage: 79 },
    { stars: 4, count: 18, percentage: 15 },
    { stars: 3, count: 5, percentage: 4 },
    { stars: 2, count: 2, percentage: 1 },
    { stars: 1, count: 1, percentage: 1 },
  ];

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Vehicle not found</p>
      </div>
    );
  }

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swiped left
      if (selectedImageIndex < vehicle.images.length - 1) {
        setSelectedImageIndex(selectedImageIndex + 1);
      }
    }

    if (touchStart - touchEnd < -75) {
      // Swiped right
      if (selectedImageIndex > 0) {
        setSelectedImageIndex(selectedImageIndex - 1);
      }
    }
  };

  // Get image category label
  const getImageCategory = (index: number) => {
    const allExterior = vehicle.imageCategories.exterior;
    const allInterior = vehicle.imageCategories.interior;
    const allRegistration = vehicle.imageCategories.registration;
    
    if (allExterior.includes(vehicle.images[index])) return 'Exterior';
    if (allInterior.includes(vehicle.images[index])) return 'Interior';
    if (allRegistration.includes(vehicle.images[index])) return 'Registration';
    return 'Exterior';
  };

  // Calculate pricing based on fuel option
  // If fuel is included (includeFuel = true), price is higher
  // If fuel is not included (includeFuel = false), base price is lower
  const fuelSurcharge = {
    daily: 50,
    weekly: 300,
    monthly: 1000
  };

  const getPrice = () => {
    let basePrice = 0;
    
    if (selectedDuration === 'hourly') {
      return vehicle.pricePerHour; // Hourly doesn't have fuel option
    } else if (selectedDuration === 'daily') {
      basePrice = vehicle.pricePerDay;
    } else if (selectedDuration === 'weekly') {
      basePrice = vehicle.pricePerWeek;
    } else if (selectedDuration === 'monthly') {
      basePrice = vehicle.pricePerMonth;
    }

    // If fuel is NOT included, reduce the base price
    // If fuel IS included, keep the full price
    if (includeFuel) {
      return basePrice; // Full price with fuel
    } else {
      return basePrice - (selectedDuration === 'daily' ? fuelSurcharge.daily : 
                         selectedDuration === 'weekly' ? fuelSurcharge.weekly : 
                         fuelSurcharge.monthly); // Reduced price without fuel
    }
  };

  const getFuelChargeText = () => {
    if (selectedDuration === 'daily') return `$${fuelSurcharge.daily}/day`;
    if (selectedDuration === 'weekly') return `$${fuelSurcharge.weekly}/week`;
    if (selectedDuration === 'monthly') return `$${fuelSurcharge.monthly}/month`;
    return '';
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Premium Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-100">
        <div className="flex items-center justify-between h-14 px-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Premium Image Gallery */}
      <div className="relative bg-neutral-900">
        <div 
          className="aspect-[4/3] relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <ImageWithFallback
            src={vehicle.images[selectedImageIndex]}
            alt={vehicle.name}
            className="w-full h-full object-cover"
          />
          
          {/* Verified Badge */}
          <div className="absolute top-4 left-6">
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg">
              <Shield className="w-4 h-4 text-[#b8941f]" />
              <span className="text-sm font-semibold">Verified</span>
            </div>
          </div>

          {/* Image Category Badge */}
          <div className="absolute top-4 right-6">
            <div className="bg-neutral-900/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-white text-xs font-medium">
                {getImageCategory(selectedImageIndex)}
              </span>
            </div>
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 right-6">
            <div className="bg-neutral-900/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-white text-sm font-medium">
                {selectedImageIndex + 1} / {vehicle.images.length}
              </span>
            </div>
          </div>
        </div>
        
        {/* Thumbnail Gallery */}
        {vehicle.images.length > 1 && (
          <div className="flex gap-2 p-4 overflow-x-auto bg-neutral-900">
            {vehicle.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  index === selectedImageIndex 
                    ? 'border-[#d4af37] scale-105' 
                    : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
              >
                <ImageWithFallback
                  src={image}
                  alt={`${vehicle.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        {/* Title & Rating */}
        <div className="space-y-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{vehicle.name}</h1>
            <p className="text-lg text-gray-600">{vehicle.category}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowReviews(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2.5 rounded-xl border border-yellow-200 hover:border-yellow-300 transition-all"
            >
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">{vehicle.rating}</span>
              <span className="text-gray-600">({vehicle.reviewCount} reviews)</span>
            </button>
            
            {/* Ownership Badge */}
            <Badge className={vehicle.ownershipType === 'platform' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}>
              {vehicle.ownershipType === 'platform' ? 'Platform Owned' : 'Agent Owned'}
            </Badge>
          </div>
        </div>

        {/* Agent Information Section (for agent-owned vehicles) */}
        {vehicle.ownershipType === 'agent' && vehicle.agent && (
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-200">
            <div className="flex items-start gap-4">
              <div className="relative">
                <ImageWithFallback
                  src={vehicle.agent.image}
                  alt={vehicle.agent.name}
                  className="w-16 h-16 rounded-xl object-cover shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-[#d4af37] to-[#b8941f] text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md border-2 border-white">
                  <Shield className="w-3 h-3" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{vehicle.agent.name}</h3>
                    <p className="text-sm text-gray-600">Vehicle Agent</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white/70 backdrop-blur rounded-lg px-2 py-2">
                    <p className="text-xs text-gray-600 mb-0.5">Vehicles</p>
                    <p className="font-bold text-gray-900">{vehicle.agent.vehiclesOwned}</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur rounded-lg px-2 py-2">
                    <p className="text-xs text-gray-600 mb-0.5">Coverage Area</p>
                    <p className="font-bold text-gray-900 text-xs">{vehicle.agent.coverageArea.join(', ')}</p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Member since {vehicle.agent.memberSince}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIN Number Section */}
        <div className="bg-gradient-to-br from-gray-50 to-neutral-50 rounded-2xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-700" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-1">Vehicle Identification Number</p>
              <p className="font-mono font-semibold text-gray-900 tracking-wide">{vehicle.vin}</p>
            </div>
          </div>
        </div>

        {/* Tabs for Content Organization */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Selected Booking Period Display */}
            {startDate && (
              <div className="bg-gradient-to-br from-[#d4af37]/10 to-[#b8941f]/10 rounded-2xl p-5 border-2 border-[#d4af37]/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#d4af37] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Your Booking Period</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {selectedDuration === 'hourly' && `${format(startDate, 'MMM d, yyyy')} • ${urlStartTime} - ${urlEndTime}`}
                      {selectedDuration === 'daily' && endDate && `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`}
                      {selectedDuration === 'daily' && !endDate && format(startDate, 'MMM d, yyyy')}
                      {selectedDuration === 'weekly' && `${format(startDate, 'MMM d')} - ${format(addDays(startDate, 7), 'MMM d, yyyy')} (7 days)`}
                      {selectedDuration === 'monthly' && `${format(startDate, 'MMM d')} - ${format(addDays(startDate, 30), 'MMM d, yyyy')} (30 days)`}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Total Price</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${getPrice()}
                          <span className="text-sm font-normal text-gray-600 ml-1">
                            {selectedDuration === 'hourly' && '/hr'}
                            {selectedDuration === 'daily' && '/day'}
                            {selectedDuration === 'weekly' && '/week'}
                            {selectedDuration === 'monthly' && '/month'}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-[#d4af37] hover:text-[#b8941f] font-medium"
                      >
                        Change dates
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Key Specifications */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Seats</p>
                  <p className="text-lg font-semibold text-gray-900">{vehicle.seats}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <Fuel className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Fuel Type</p>
                  <p className="text-lg font-semibold text-gray-900">{vehicle.fuelType}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Cog className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Transmission</p>
                  <p className="text-sm font-semibold text-gray-900">{vehicle.transmission}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Insurance</p>
                  <p className="text-sm font-semibold text-gray-900">Included</p>
                </div>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                What's Included
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700">Comprehensive Insurance</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700">24/7 Roadside Assistance</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700">Free Cancellation (24hrs notice)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700">Sanitized & Inspected</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Premium Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {vehicle.features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Select your preferred rental duration. Longer rentals get better rates!
            </p>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setSelectedDuration('hourly')}
                className={`p-5 rounded-xl border-2 transition-all text-left ${
                  selectedDuration === 'hourly'
                    ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-100'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${selectedDuration === 'hourly' ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className={`text-sm font-medium ${selectedDuration === 'hourly' ? 'text-blue-900' : 'text-gray-600'}`}>
                      Hourly Rate
                    </span>
                  </div>
                  <span className={`text-2xl font-bold ${selectedDuration === 'hourly' ? 'text-blue-900' : 'text-gray-900'}`}>
                    ${vehicle.pricePerHour}
                  </span>
                </div>
                <p className={`text-xs ${selectedDuration === 'hourly' ? 'text-blue-700' : 'text-gray-500'}`}>
                  Perfect for short trips (minimum 3 hours)
                </p>
                {selectedDuration === 'hourly' && (
                  <div className="mt-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">Selected</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => setSelectedDuration('daily')}
                className={`p-5 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                  selectedDuration === 'daily'
                    ? 'border-blue-600 bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg'
                    : 'border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-300'
                }`}
              >
                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className={`w-4 h-4 ${selectedDuration === 'daily' ? 'text-blue-100' : 'text-blue-600'}`} />
                    <span className={`text-sm font-medium ${selectedDuration === 'daily' ? 'text-white' : 'text-blue-900'}`}>
                      Daily Rate
                    </span>
                  </div>
                  <span className={`text-2xl font-bold ${selectedDuration === 'daily' ? 'text-white' : 'text-blue-900'}`}>
                    ${vehicle.pricePerDay}
                  </span>
                </div>
                <p className={`text-xs ${selectedDuration === 'daily' ? 'text-blue-100' : 'text-blue-700'}`}>
                  Best value for day trips
                </p>
                {selectedDuration === 'daily' && (
                  <div className="mt-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-white" />
                    <span className="text-sm text-white font-medium">Selected</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => setSelectedDuration('weekly')}
                className={`p-5 rounded-xl border-2 transition-all text-left ${
                  selectedDuration === 'weekly'
                    ? 'border-green-600 bg-green-50 shadow-lg shadow-green-100'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${selectedDuration === 'weekly' ? 'text-green-900' : 'text-gray-600'}`}>
                    Weekly Rate
                  </span>
                  <span className={`text-2xl font-bold ${selectedDuration === 'weekly' ? 'text-green-900' : 'text-gray-900'}`}>
                    ${vehicle.pricePerWeek}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`text-xs ${selectedDuration === 'weekly' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'}`}>
                    Save ${(vehicle.pricePerDay * 7) - vehicle.pricePerWeek}
                  </Badge>
                  <span className={`text-xs ${selectedDuration === 'weekly' ? 'text-green-700' : 'text-gray-500'}`}>
                    vs daily rate
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
                className={`p-5 rounded-xl border-2 transition-all text-left ${
                  selectedDuration === 'monthly'
                    ? 'border-purple-600 bg-purple-50 shadow-lg shadow-purple-100'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${selectedDuration === 'monthly' ? 'text-purple-900' : 'text-gray-600'}`}>
                    Monthly Rate
                  </span>
                  <span className={`text-2xl font-bold ${selectedDuration === 'monthly' ? 'text-purple-900' : 'text-gray-900'}`}>
                    ${vehicle.pricePerMonth}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`text-xs ${selectedDuration === 'monthly' ? 'bg-purple-600 text-white' : 'bg-green-100 text-green-700'}`}>
                    Save ${(vehicle.pricePerDay * 30) - vehicle.pricePerMonth}
                  </Badge>
                  <span className={`text-xs ${selectedDuration === 'monthly' ? 'text-purple-700' : 'text-gray-500'}`}>
                    vs daily rate
                  </span>
                </div>
                {selectedDuration === 'monthly' && (
                  <div className="mt-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-700 font-medium">Selected</span>
                  </div>
                )}
              </button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Fuel Option - Only for Daily/Weekly/Monthly */}
        {selectedDuration !== 'hourly' && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Fuel className="w-5 h-5 text-green-600" />
              Fuel Options
            </h3>
            
            <div className="space-y-3">
              {/* Option 1: Fuel Included */}
              <button
                onClick={() => setIncludeFuel(true)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  includeFuel
                    ? 'border-green-600 bg-white shadow-md'
                    : 'border-green-200 bg-white/50 hover:border-green-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                      includeFuel
                        ? 'border-green-600 bg-green-600'
                        : 'border-gray-300'
                    }`}>
                      {includeFuel && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Fuel Included</p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Full tank provided and returned. No fuel charges during rental.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ${selectedDuration === 'daily' ? vehicle.pricePerDay :
                        selectedDuration === 'weekly' ? vehicle.pricePerWeek :
                        vehicle.pricePerMonth}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedDuration === 'daily' ? '/day' :
                       selectedDuration === 'weekly' ? '/week' : '/month'}
                    </p>
                  </div>
                </div>
                {includeFuel && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-green-700">
                    <Check className="w-3 h-3" />
                    <span className="font-medium">Current Selection</span>
                  </div>
                )}
              </button>

              {/* Option 2: Pay for Fuel */}
              <button
                onClick={() => setIncludeFuel(false)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  !includeFuel
                    ? 'border-blue-600 bg-white shadow-md'
                    : 'border-green-200 bg-white/50 hover:border-green-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                      !includeFuel
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {!includeFuel && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Pay for Fuel Separately</p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Lower base rate. Add {getFuelChargeText()} for fuel costs.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ${selectedDuration === 'daily' ? vehicle.pricePerDay - fuelSurcharge.daily :
                        selectedDuration === 'weekly' ? vehicle.pricePerWeek - fuelSurcharge.weekly :
                        vehicle.pricePerMonth - fuelSurcharge.monthly}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedDuration === 'daily' ? '/day' :
                       selectedDuration === 'weekly' ? '/week' : '/month'}
                    </p>
                  </div>
                </div>
                {!includeFuel && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-blue-700">
                      <Check className="w-3 h-3" />
                      <span className="font-medium">Current Selection</span>
                    </div>
                    <div className="bg-blue-50 px-3 py-2 rounded-lg">
                      <p className="text-xs text-blue-800">
                        + {getFuelChargeText()} fuel charges apply based on usage
                      </p>
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reviews Sheet */}
      <Sheet open={showReviews} onOpenChange={setShowReviews}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Ratings & Reviews</SheetTitle>
            <SheetDescription>
              See what other customers are saying about this vehicle
            </SheetDescription>
          </SheetHeader>

          {/* Overall Rating */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6 border border-yellow-200">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-1">{vehicle.rating}</div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${star <= Math.floor(vehicle.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600">{vehicle.reviewCount} reviews</div>
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

      {/* Premium Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 p-4 shadow-2xl safe-area-bottom z-10">
        <div className="max-w-2xl mx-auto">
          {/* Fuel charge notice for non-included fuel */}
          {selectedDuration !== 'hourly' && !includeFuel && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
              <p className="text-xs text-blue-800">
                + {getFuelChargeText()} fuel charges will apply based on usage
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium mb-1">
                {selectedDuration === 'hourly' && 'Hourly Rate'}
                {selectedDuration === 'daily' && (includeFuel ? 'Daily Rate (Fuel Included)' : 'Daily Rate (Fuel Extra)')}
                {selectedDuration === 'weekly' && (includeFuel ? 'Weekly Rate (Fuel Included)' : 'Weekly Rate (Fuel Extra)')}
                {selectedDuration === 'monthly' && (includeFuel ? 'Monthly Rate (Fuel Included)' : 'Monthly Rate (Fuel Extra)')}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${getPrice()}
                <span className="text-base font-normal text-gray-500">
                  /{selectedDuration === 'hourly' ? 'hr' : selectedDuration === 'daily' ? 'day' : selectedDuration === 'weekly' ? 'week' : 'month'}
                </span>
              </p>
            </div>
            <Button
              onClick={() => {
                addToCart({
                  type: 'vehicle',
                  serviceId: vehicle.id,
                  duration: selectedDuration,
                  startDate: new Date(),
                  endDate: null,
                  startTime: '09:00',
                  endTime: '17:00',
                });
                toast.success('Vehicle added to cart!');
                navigate('/booking/cart');
              }}
              className="h-14 px-10 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/30"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}