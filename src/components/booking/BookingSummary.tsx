import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ChevronLeft, AlertCircle, Calendar, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { format, differenceInHours, differenceInDays } from 'date-fns';

export function BookingSummary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vehicles, drivers, bodyguards } = useApp();

  // Vehicle params
  const vehicleId = searchParams.get('vehicleId');
  const vehicleDuration = searchParams.get('vehicleDuration') as 'hourly' | 'daily' | 'weekly' | 'monthly' | null;
  const vehicleStartDate = searchParams.get('vehicleStartDate') ? new Date(searchParams.get('vehicleStartDate')!) : null;
  const vehicleEndDate = searchParams.get('vehicleEndDate') ? new Date(searchParams.get('vehicleEndDate')!) : null;
  const vehicleStartTime = searchParams.get('vehicleStartTime') || '09:00';
  const vehicleEndTime = searchParams.get('vehicleEndTime') || '17:00';

  // Driver params
  const driverId = searchParams.get('driverId');
  const driverDuration = searchParams.get('driverDuration') as 'hourly' | 'halfday' | 'fullday' | 'weekly' | 'monthly' | null;
  const driverStartDate = searchParams.get('driverStartDate') ? new Date(searchParams.get('driverStartDate')!) : null;
  const driverEndDate = searchParams.get('driverEndDate') ? new Date(searchParams.get('driverEndDate')!) : null;
  const driverStartTime = searchParams.get('driverStartTime') || '09:00';
  const driverEndTime = searchParams.get('driverEndTime') || '17:00';

  // Bodyguard params
  const bodyguardId = searchParams.get('bodyguardId');
  const bodyguardDuration = searchParams.get('bodyguardDuration') as 'hourly' | 'halfday' | 'fullday' | 'weekly' | 'monthly' | null;
  const bodyguardStartDate = searchParams.get('bodyguardStartDate') ? new Date(searchParams.get('bodyguardStartDate')!) : null;
  const bodyguardEndDate = searchParams.get('bodyguardEndDate') ? new Date(searchParams.get('bodyguardEndDate')!) : null;
  const bodyguardStartTime = searchParams.get('bodyguardStartTime') || '09:00';
  const bodyguardEndTime = searchParams.get('bodyguardEndTime') || '17:00';

  const vehicle = vehicleId ? vehicles.find(v => v.id === vehicleId) : null;
  const driver = driverId ? drivers.find(d => d.id === driverId) : null;
  const bodyguard = bodyguardId ? bodyguards.find(b => b.id === bodyguardId) : null;

  // Check if we have at least one service selected
  if (!vehicle && !driver && !bodyguard) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No services selected</p>
          <Button onClick={() => navigate('/')}>
            Back to Services
          </Button>
        </div>
      </div>
    );
  }

  // Calculate driver hours and pricing
  const calculateDriverPrice = () => {
    if (!driver || !driverDuration) return { price: 0, hours: 0, durationText: '' };

    let hours = 0;
    let durationText = '';

    if (driverDuration === 'hourly') {
      if (driverStartDate && driverEndDate && driverStartTime && driverEndTime) {
        const [startHour, startMinute] = driverStartTime.split(':').map(Number);
        const [endHour, endMinute] = driverEndTime.split(':').map(Number);
        
        const startDateTime = new Date(driverStartDate);
        startDateTime.setHours(startHour, startMinute, 0, 0);
        
        const endDateTime = new Date(driverEndDate);
        endDateTime.setHours(endHour, endMinute, 0, 0);
        
        hours = differenceInHours(endDateTime, startDateTime);
        durationText = `${hours} hours`;
      } else {
        hours = 3; // default minimum
        durationText = '3 hours';
      }
    } else if (driverDuration === 'halfday') {
      hours = 12;
      durationText = '12 hours (Half Day)';
    } else if (driverDuration === 'fullday') {
      hours = 24;
      durationText = '24 hours (Full Day)';
    } else if (driverDuration === 'weekly') {
      hours = 24 * 7; // 168 hours
      durationText = '7 days (Weekly)';
    } else if (driverDuration === 'monthly') {
      hours = 24 * 30; // 720 hours
      durationText = '30 days (Monthly)';
    }

    const price = driver.pricePerHour * hours;
    return { price, hours, durationText };
  };

  // Calculate bodyguard hours and pricing
  const calculateBodyguardPrice = () => {
    if (!bodyguard || !bodyguardDuration) return { price: 0, hours: 0, durationText: '' };

    let hours = 0;
    let durationText = '';

    if (bodyguardDuration === 'hourly') {
      if (bodyguardStartDate && bodyguardEndDate && bodyguardStartTime && bodyguardEndTime) {
        const [startHour, startMinute] = bodyguardStartTime.split(':').map(Number);
        const [endHour, endMinute] = bodyguardEndTime.split(':').map(Number);
        
        const startDateTime = new Date(bodyguardStartDate);
        startDateTime.setHours(startHour, startMinute, 0, 0);
        
        const endDateTime = new Date(bodyguardEndDate);
        endDateTime.setHours(endHour, endMinute, 0, 0);
        
        hours = differenceInHours(endDateTime, startDateTime);
        durationText = `${hours} hours`;
      } else {
        hours = 4; // default minimum
        durationText = '4 hours';
      }
    } else if (bodyguardDuration === 'halfday') {
      hours = 12;
      durationText = '12 hours (Half Day)';
    } else if (bodyguardDuration === 'fullday') {
      hours = 24;
      durationText = '24 hours (Full Day)';
    } else if (bodyguardDuration === 'weekly') {
      hours = 24 * 7; // 168 hours
      durationText = '7 days (Weekly)';
    } else if (bodyguardDuration === 'monthly') {
      hours = 24 * 30; // 720 hours
      durationText = '30 days (Monthly)';
    }

    const price = bodyguard.pricePerHour * hours;
    return { price, hours, durationText };
  };

  // Calculate vehicle rental period and pricing
  const calculateVehiclePrice = () => {
    if (!vehicle) return { price: 0, durationText: '', periodText: '' };

    let price = 0;
    let durationText = '';
    let periodText = '';

    if (vehicleDuration === 'hourly') {
      if (vehicleStartDate && vehicleEndDate) {
        // Combine date and time for accurate hour calculation
        const [startHour, startMinute] = vehicleStartTime.split(':').map(Number);
        const [endHour, endMinute] = vehicleEndTime.split(':').map(Number);
        
        const startDateTime = new Date(vehicleStartDate);
        startDateTime.setHours(startHour, startMinute, 0, 0);
        
        const endDateTime = new Date(vehicleEndDate);
        endDateTime.setHours(endHour, endMinute, 0, 0);
        
        const hours = differenceInHours(endDateTime, startDateTime);
        const hourlyRate = vehicle.pricePerDay / 24; // Convert daily rate to hourly
        price = Math.ceil(hours * hourlyRate);
        durationText = `${hours} hours`;
        periodText = `${format(startDateTime, 'MMM d, h:mm a')} - ${format(endDateTime, 'h:mm a')}`;
      } else {
        price = vehicle.pricePerDay / 24;
        durationText = '1 hour';
        periodText = 'Duration not set';
      }
    } else if (vehicleDuration === 'daily') {
      if (vehicleStartDate && vehicleEndDate) {
        const days = Math.max(1, differenceInDays(vehicleEndDate, vehicleStartDate) + 1); // +1 for inclusive days
        price = vehicle.pricePerDay * days;
        durationText = `${days} ${days === 1 ? 'day' : 'days'}`;
        periodText = `${format(vehicleStartDate, 'MMM d')} - ${format(vehicleEndDate, 'MMM d, yyyy')}`;
      } else {
        price = vehicle.pricePerDay;
        durationText = '1 day';
        periodText = 'Duration not set';
      }
    } else if (vehicleDuration === 'weekly') {
      price = vehicle.pricePerWeek || (vehicle.pricePerDay * 7);
      durationText = '7 days';
      if (vehicleStartDate) {
        const endDateCalc = new Date(vehicleStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        periodText = `${format(vehicleStartDate, 'MMM d')} - ${format(endDateCalc, 'MMM d, yyyy')}`;
      } else {
        periodText = 'Duration not set';
      }
    } else if (vehicleDuration === 'monthly') {
      price = vehicle.pricePerMonth || (vehicle.pricePerDay * 30);
      durationText = '30 days';
      if (vehicleStartDate) {
        const endDateCalc = new Date(vehicleStartDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        periodText = `${format(vehicleStartDate, 'MMM d')} - ${format(endDateCalc, 'MMM d, yyyy')}`;
      } else {
        periodText = 'Duration not set';
      }
    }

    return { price, durationText, periodText };
  };

  const vehiclePricing = calculateVehiclePrice();
  const vehiclePrice = vehiclePricing.price;
  
  const driverPricing = calculateDriverPrice();
  const driverPrice = driverPricing.price;
  const driverHours = driverPricing.hours;
  
  const bodyguardPricing = calculateBodyguardPrice();
  const bodyguardPrice = bodyguardPricing.price;
  const bodyguardHours = bodyguardPricing.hours;
  
  // Calculate bundle discounts (only when vehicle is in booking)
  const DRIVER_DISCOUNT = 0.10; // 10% off
  const BODYGUARD_DISCOUNT = 0.15; // 15% off
  
  const driverDiscount = vehicle && driver ? driverPrice * DRIVER_DISCOUNT : 0;
  const bodyguardDiscount = vehicle && bodyguard ? bodyguardPrice * BODYGUARD_DISCOUNT : 0;
  const totalDiscount = driverDiscount + bodyguardDiscount;
  
  const subtotal = vehiclePrice + driverPrice + bodyguardPrice;
  const total = subtotal - totalDiscount;

  const handleProceedToPayment = () => {
    const params = new URLSearchParams({
      total: total.toString(),
      ...(vehicleId && { vehicleId }),
      ...(driverId && { driverId, driverHours: driverHours.toString() }),
      ...(bodyguardId && { bodyguardId, bodyguardHours: bodyguardHours.toString() }),
      ...(vehicleDuration && { duration: vehicleDuration }),
      ...(vehicleStartDate && { startDate: vehicleStartDate.toISOString() }),
      ...(vehicleStartTime && { startTime: vehicleStartTime }),
      ...(vehicleEndDate && { endDate: vehicleEndDate.toISOString() }),
      ...(vehicleEndTime && { endTime: vehicleEndTime }),
    });
    navigate(`/booking/payment?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="ml-2">Booking Summary</span>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4 max-w-md mx-auto">
        {/* Booking Summary Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
          <h2 className="text-xl mb-2">Your Booking</h2>
          <p className="text-blue-100 text-sm">
            Review your selection before proceeding to payment
          </p>
        </div>

        {/* Vehicle Details */}
        {vehicle && (
          <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <h2 className="text-gray-900">Vehicle</h2>
            </div>
            <div className="flex gap-3">
              <ImageWithFallback
                src={vehicle.image}
                alt={vehicle.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-gray-900">{vehicle.name}</h3>
                <p className="text-sm text-gray-500">{vehicle.category}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {vehicle.seats} seats • {vehicle.fuelType}
                </p>
              </div>
            </div>
            
            {/* Rental Period Display */}
            {vehicleStartDate && (
              <div className="mt-4 pt-4 border-t border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Rental Period</span>
                </div>
                {vehicleDuration === 'hourly' && vehicleStartDate && vehicleEndDate ? (
                  <>
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Start:</span> {format(vehicleStartDate, 'MMM d, yyyy')} at {vehicleStartTime}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">End:</span> {format(vehicleEndDate, 'MMM d, yyyy')} at {vehicleEndTime}
                    </div>
                  </>
                ) : vehicleDuration === 'daily' && vehicleStartDate && vehicleEndDate ? (
                  <>
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Start:</span> {format(vehicleStartDate, 'MMM d, yyyy')} at {vehicleStartTime}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">End:</span> {format(vehicleEndDate, 'MMM d, yyyy')} at {vehicleEndTime}
                    </div>
                  </>
                ) : vehicleDuration === 'weekly' && vehicleStartDate ? (
                  <>
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Start:</span> {format(vehicleStartDate, 'MMM d, yyyy')} at {vehicleStartTime}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">End:</span> {format(new Date(vehicleStartDate.getTime() + 7 * 24 * 60 * 60 * 1000), 'MMM d, yyyy')} at {vehicleStartTime}
                    </div>
                  </>
                ) : vehicleDuration === 'monthly' && vehicleStartDate ? (
                  <>
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Start:</span> {format(vehicleStartDate, 'MMM d, yyyy')} at {vehicleStartTime}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">End:</span> {format(new Date(vehicleStartDate.getTime() + 30 * 24 * 60 * 60 * 1000), 'MMM d, yyyy')} at {vehicleStartTime}
                    </div>
                  </>
                ) : null}
                <p className="text-xs text-blue-600 mt-2 font-medium">{vehiclePricing.durationText}</p>
              </div>
            )}
          </div>
        )}

        {/* Driver Details */}
        {driver && (
          <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <h2 className="text-gray-900">Professional Driver</h2>
            </div>
            <div className="flex gap-3">
              <ImageWithFallback
                src={driver.image}
                alt={driver.name}
                className="w-16 h-16 object-cover rounded-full"
              />
              <div className="flex-1">
                <h3 className="text-gray-900">{driver.name}</h3>
                <p className="text-sm text-gray-500">{driver.experience} years experience</p>
                <p className="text-sm text-green-600 mt-1 font-medium">{driverPricing.durationText}</p>
              </div>
            </div>

            {/* Service Period Display */}
            {driverStartDate && (
              <div className="mt-4 pt-4 border-t border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Service Period</span>
                </div>
                {driverDuration === 'hourly' && driverStartDate && driverEndDate ? (
                  <>
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Start:</span> {format(driverStartDate, 'MMM d, yyyy')} at {driverStartTime}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">End:</span> {format(driverEndDate, 'MMM d, yyyy')} at {driverEndTime}
                    </div>
                  </>
                ) : driverDuration === 'halfday' || driverDuration === 'fullday' ? (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Date:</span> {format(driverStartDate, 'MMM d, yyyy')} at {driverStartTime}
                  </div>
                ) : driverDuration === 'weekly' ? (
                  <>
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Start:</span> {format(driverStartDate, 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">End:</span> {format(new Date(driverStartDate.getTime() + 7 * 24 * 60 * 60 * 1000), 'MMM d, yyyy')}
                    </div>
                  </>
                ) : driverDuration === 'monthly' ? (
                  <>
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Start:</span> {format(driverStartDate, 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">End:</span> {format(new Date(driverStartDate.getTime() + 30 * 24 * 60 * 60 * 1000), 'MMM d, yyyy')}
                    </div>
                  </>
                ) : null}
                <p className="text-xs text-green-600 mt-2 font-medium">{driverPricing.durationText}</p>
              </div>
            )}
          </div>
        )}

        {/* Bodyguard Details */}
        {bodyguard && (
          <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <h2 className="text-gray-900">Security Service</h2>
            </div>
            <div className="flex gap-3">
              <ImageWithFallback
                src={bodyguard.image}
                alt={bodyguard.name}
                className="w-16 h-16 object-cover rounded-full"
              />
              <div className="flex-1">
                <h3 className="text-gray-900">{bodyguard.name}</h3>
                <p className="text-sm text-gray-500">{bodyguard.securityLevel} Level</p>
                <p className="text-sm text-purple-600 mt-1 font-medium">{bodyguardPricing.durationText}</p>
              </div>
            </div>

            {/* Service Period Display */}
            {bodyguardStartDate && (
              <div className="mt-4 pt-4 border-t border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">Service Period</span>
                </div>
                {bodyguardDuration === 'hourly' && bodyguardStartDate && bodyguardEndDate ? (
                  <>
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Start:</span> {format(bodyguardStartDate, 'MMM d, yyyy')} at {bodyguardStartTime}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">End:</span> {format(bodyguardEndDate, 'MMM d, yyyy')} at {bodyguardEndTime}
                    </div>
                  </>
                ) : bodyguardDuration === 'halfday' || bodyguardDuration === 'fullday' ? (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Date:</span> {format(bodyguardStartDate, 'MMM d, yyyy')} at {bodyguardStartTime}
                  </div>
                ) : bodyguardDuration === 'weekly' ? (
                  <>
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Start:</span> {format(bodyguardStartDate, 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">End:</span> {format(new Date(bodyguardStartDate.getTime() + 7 * 24 * 60 * 60 * 1000), 'MMM d, yyyy')}
                    </div>
                  </>
                ) : bodyguardDuration === 'monthly' ? (
                  <>
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Start:</span> {format(bodyguardStartDate, 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">End:</span> {format(new Date(bodyguardStartDate.getTime() + 30 * 24 * 60 * 60 * 1000), 'MMM d, yyyy')}
                    </div>
                  </>
                ) : null}
                <p className="text-xs text-purple-600 mt-2 font-medium">{bodyguardPricing.durationText}</p>
              </div>
            )}
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h2 className="text-gray-900">Cost Breakdown</h2>
          
          <div className="space-y-2">
            {vehicle && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Vehicle rental ({vehiclePricing.durationText})</span>
                <span className="text-gray-900">${vehiclePrice.toFixed(2)}</span>
              </div>
            )}
            
            {driver && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Driver service ({driverHours}h)</span>
                  <span className="text-gray-900">${driverPrice.toFixed(2)}</span>
                </div>
                {driverDiscount > 0 && (
                  <div className="flex justify-between text-sm pl-4">
                    <span className="text-green-600">Bundle discount (10%)</span>
                    <span className="text-green-600">-${driverDiscount.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}
            
            {bodyguard && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bodyguard service ({bodyguardHours}h)</span>
                  <span className="text-gray-900">${bodyguardPrice.toFixed(2)}</span>
                </div>
                {bodyguardDiscount > 0 && (
                  <div className="flex justify-between text-sm pl-4">
                    <span className="text-green-600">Bundle discount (15%)</span>
                    <span className="text-green-600">-${bodyguardDiscount.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="pt-3 border-t border-gray-200 flex justify-between">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-blue-50 rounded-xl p-4">
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-start gap-2 text-left w-full">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900">Cancellation Policy</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Tap to view full policy
                  </p>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancellation Policy</DialogTitle>
                <DialogDescription className="space-y-3 pt-4">
                  <div>
                    <h4 className="text-green-700 mb-1">Full Refund</h4>
                    <p className="text-sm text-gray-600">
                      Cancel 48+ hours before pickup for 100% refund
                    </p>
                  </div>
                  <div>
                    <h4 className="text-yellow-700 mb-1">Partial Refund</h4>
                    <p className="text-sm text-gray-600">
                      Cancel 24-48 hours before: 50% refund
                    </p>
                  </div>
                  <div>
                    <h4 className="text-red-700 mb-1">No Refund</h4>
                    <p className="text-sm text-gray-600">
                      Cancel less than 24 hours before: No refund
                    </p>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm text-gray-500">Total amount</p>
            <p className="text-gray-900">${total}</p>
          </div>
          <Button
            onClick={handleProceedToPayment}
            className="h-12 px-8"
          >
            Proceed to Payment
          </Button>
        </div>
      </div>
    </div>
  );
}