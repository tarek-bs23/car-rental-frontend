import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { ChevronLeft, ShoppingCart, AlertCircle } from 'lucide-react';
import { ServiceCartItem } from './ServiceCartItem';
import React, { useEffect } from 'react';

export function ServiceCart() {
  const navigate = useNavigate();
  const { cart, vehicles, drivers, bodyguards, updateCartItem, removeFromCart, bookings, loadCart } = useApp();

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const vehicleItem = cart.find(item => item.type === 'vehicle');
  const driverItem = cart.find(item => item.type === 'driver');
  const bodyguardItem = cart.find(item => item.type === 'bodyguard');

  const vehicle = vehicleItem ? vehicles.find(v => v.id === vehicleItem.serviceId) : null;
  const driver = driverItem ? drivers.find(d => d.id === driverItem.serviceId) : null;
  const bodyguard = bodyguardItem ? bodyguards.find(b => b.id === bodyguardItem.serviceId) : null;

  // Check if user has active vehicle bookings (confirmed or completed)
  const hasActiveVehicleBooking = bookings.some(
    booking => booking.vehicleId && (booking.status === 'confirmed' || booking.status === 'completed')
  );

  // Check if vehicle exists in cart OR user has active vehicle booking for bundle discount eligibility
  const hasVehicle = !!vehicleItem || hasActiveVehicleBooking;

  // Check driver-vehicle compatibility
  const isDriverCompatible = !vehicle || !driver ||
    driver.compatibleVehicles.includes('All Types') ||
    driver.compatibleVehicles.includes(vehicle.category);

  const hasCompatibilityIssue = vehicle && driver && !isDriverCompatible;

  // Discount rates
  const DRIVER_DISCOUNT = 0.10; // 10% off
  const BODYGUARD_DISCOUNT = 0.15; // 15% off

  // Use pricing attached to cart items from backend (no re-calculation)
  const vehiclePrice = cart
    .filter(item => item.type === 'vehicle')
    .reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);

  const driverOriginalPrice = cart
    .filter(item => item.type === 'driver')
    .reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);

  const bodyguardOriginalPrice = cart
    .filter(item => item.type === 'bodyguard')
    .reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);

  const subtotal = vehiclePrice + driverOriginalPrice + bodyguardOriginalPrice;
  const total = subtotal;
  const totalDiscount = 0;

  const handleContinue = () => {
    // Navigate to booking summary with all cart items
    const params = new URLSearchParams();

    if (vehicleItem && vehicle) {
      params.set('vehicleId', vehicle.id);
      params.set('vehicleDuration', vehicleItem.duration);
      params.set('vehicleStartDate', vehicleItem.startDate.toISOString());
      if (vehicleItem.endDate) params.set('vehicleEndDate', vehicleItem.endDate.toISOString());
      params.set('vehicleStartTime', vehicleItem.startTime);
      params.set('vehicleEndTime', vehicleItem.endTime);
    }

    if (driverItem && driver) {
      params.set('driverId', driver.id);
      params.set('driverDuration', driverItem.duration);
      params.set('driverStartDate', driverItem.startDate.toISOString());
      if (driverItem.endDate) params.set('driverEndDate', driverItem.endDate.toISOString());
      params.set('driverStartTime', driverItem.startTime);
      params.set('driverEndTime', driverItem.endTime);
    }

    if (bodyguardItem && bodyguard) {
      params.set('bodyguardId', bodyguard.id);
      params.set('bodyguardDuration', bodyguardItem.duration);
      params.set('bodyguardStartDate', bodyguardItem.startDate.toISOString());
      if (bodyguardItem.endDate) params.set('bodyguardEndDate', bodyguardItem.endDate.toISOString());
      params.set('bodyguardStartTime', bodyguardItem.startTime);
      params.set('bodyguardEndTime', bodyguardItem.endTime);
    }

    navigate(`/booking/summary?${params.toString()}`);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Start booking by browsing our services</p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/vehicles')} className="w-full">
              Browse Vehicles
            </Button>
            <Button onClick={() => navigate('/drivers')} variant="outline" className="w-full">
              Browse Drivers
            </Button>
            <Button onClick={() => navigate('/bodyguards')} variant="outline" className="w-full">
              Browse Security
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          <span className="ml-2">Service Cart</span>
          <div className="ml-auto flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">{cart.length} items</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4 max-w-md mx-auto">
        {/* Cart header */}
        <div className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] rounded-xl p-5 text-white">
          <h2 className="text-xl mb-1">Your Services</h2>
          <p className="text-sm text-white/80">
            Customize booking period for each service independently
          </p>
          {hasVehicle && (driverItem || bodyguardItem) && (
            <div className="mt-3 p-2 bg-white/20 rounded-lg">
              <p className="text-xs font-medium">💰 Bundle discount active!</p>
            </div>
          )}
        </div>

        {/* Compatibility Warning */}
        {hasCompatibilityIssue && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Compatibility Issue</h3>
                <p className="text-sm text-red-800 mb-3">
                  {driver?.name} is not qualified to drive {vehicle?.category} vehicles. They can only drive: {driver?.compatibleVehicles.join(', ')}.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                    onClick={() => navigate('/drivers')}
                  >
                    Find Compatible Driver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                    onClick={() => navigate('/vehicles')}
                  >
                    Change Vehicle
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle cart item */}
        {vehicleItem && (
          <ServiceCartItem
            type="vehicle"
            serviceName={vehicle?.name || vehicleItem.displayName || 'Vehicle'}
            serviceImage={vehicle?.image || vehicleItem.thumbnail || 'https://via.placeholder.com/150'}
            serviceDetails={vehicle ? `${vehicle.category} • ${vehicle.seats} seats` : vehicleItem.serviceDetails || 'Vehicle rental'}
            basePricePerDay={vehicle?.pricePerDay || vehicleItem.unitPrice}
            duration={vehicleItem.duration}
            durationDisplay={vehicleItem.durationDisplay}
            startDate={vehicleItem.startDate}
            endDate={vehicleItem.endDate}
            startTime={vehicleItem.startTime}
            endTime={vehicleItem.endTime}
            onDurationChange={(duration) => updateCartItem({ ...vehicleItem, duration })}
            onStartDateChange={(startDate) => updateCartItem({ ...vehicleItem, startDate })}
            onEndDateChange={(endDate) => updateCartItem({ ...vehicleItem, endDate })}
            onStartTimeChange={(startTime) => updateCartItem({ ...vehicleItem, startTime })}
            onEndTimeChange={(endTime) => updateCartItem({ ...vehicleItem, endTime })}
            onRemove={() => removeFromCart('vehicle')}
          />
        )}

        {/* Driver cart item */}
        {driverItem && (
          <div className="relative">
            {hasVehicle && (
              <div className="absolute -top-2 -right-2 z-10 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                10% OFF
              </div>
            )}
            <ServiceCartItem
              type="driver"
              serviceName={driver?.name || driverItem.displayName || 'Driver'}
              serviceImage={driver?.image || driverItem.thumbnail || 'https://via.placeholder.com/150'}
              serviceDetails={driver ? `${driver.experience} years experience` : driverItem.serviceDetails || 'Professional driver'}
              basePricePerHour={driver?.pricePerHour || driverItem.unitPrice}
              duration={driverItem.duration}
              durationDisplay={driverItem.durationDisplay}
              startDate={driverItem.startDate}
              endDate={driverItem.endDate}
              startTime={driverItem.startTime}
              endTime={driverItem.endTime}
              onDurationChange={(duration) => updateCartItem({ ...driverItem, duration })}
              onStartDateChange={(startDate) => updateCartItem({ ...driverItem, startDate })}
              onEndDateChange={(endDate) => updateCartItem({ ...driverItem, endDate })}
              onStartTimeChange={(startTime) => updateCartItem({ ...driverItem, startTime })}
              onEndTimeChange={(endTime) => updateCartItem({ ...driverItem, endTime })}
              onRemove={() => removeFromCart('driver')}
            />
          </div>
        )}

        {/* Bodyguard cart item */}
        {bodyguardItem && (
          <div className="relative">
            {hasVehicle && (
              <div className="absolute -top-2 -right-2 z-10 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                15% OFF
              </div>
            )}
            <ServiceCartItem
              type="bodyguard"
              serviceName={bodyguard?.name || bodyguardItem.displayName || 'Security'}
              serviceImage={bodyguard?.image || bodyguardItem.thumbnail || 'https://via.placeholder.com/150'}
              serviceDetails={bodyguard ? `${bodyguard.securityLevel} • ${bodyguard.experience}y exp` : bodyguardItem.serviceDetails || 'Security service'}
              basePricePerHour={bodyguard?.pricePerHour || bodyguardItem.unitPrice}
              duration={bodyguardItem.duration}
              durationDisplay={bodyguardItem.durationDisplay}
              startDate={bodyguardItem.startDate}
              endDate={bodyguardItem.endDate}
              startTime={bodyguardItem.startTime}
              endTime={bodyguardItem.endTime}
              onDurationChange={(duration) => updateCartItem({ ...bodyguardItem, duration })}
              onStartDateChange={(startDate) => updateCartItem({ ...bodyguardItem, startDate })}
              onEndDateChange={(endDate) => updateCartItem({ ...bodyguardItem, endDate })}
              onStartTimeChange={(startTime) => updateCartItem({ ...bodyguardItem, startTime })}
              onEndTimeChange={(endTime) => updateCartItem({ ...bodyguardItem, endTime })}
              onRemove={() => removeFromCart('bodyguard')}
            />
          </div>
        )}

        {/* Continue browsing */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Want to add more services?</p>
          <div className="grid grid-cols-3 gap-2">
            {!vehicleItem && (
              <button
                onClick={() => navigate('/vehicles')}
                className="py-2 px-3 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100 transition-colors"
              >
                + Vehicle
              </button>
            )}
            {!driverItem && (
              <button
                onClick={() => navigate('/drivers')}
                className="py-2 px-3 bg-green-50 text-green-600 rounded-lg text-xs hover:bg-green-100 transition-colors"
              >
                + Driver
                {hasVehicle && <div className="text-[10px]">10% off</div>}
              </button>
            )}
            {!bodyguardItem && (
              <button
                onClick={() => navigate('/bodyguards')}
                className="py-2 px-3 bg-purple-50 text-purple-600 rounded-lg text-xs hover:bg-purple-100 transition-colors"
              >
                + Security
                {hasVehicle && <div className="text-[10px]">15% off</div>}
              </button>
            )}
          </div>
        </div>

        {/* Total price card */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-gray-200">
          <div className="space-y-3">
            {/* Subtotal */}
            {totalDiscount > 0 && (
              <div className="space-y-2 pb-3 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                </div>

                {/* Bundle discount badge */}
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-green-900">Bundle Discount Applied</p>
                    <p className="text-xs text-green-700">
                      {driverItem && 'Driver 10% off'}
                      {driverItem && bodyguardItem && ' + '}
                      {bodyguardItem && 'Security 15% off'}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-green-600">-${totalDiscount.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl text-gray-900 font-bold">${total.toFixed(2)}</p>
                {totalDiscount > 0 && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    You save ${totalDiscount.toFixed(2)}!
                  </p>
                )}
              </div>
              <Button onClick={handleContinue} size="lg">
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}