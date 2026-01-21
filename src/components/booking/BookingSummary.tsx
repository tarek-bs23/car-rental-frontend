import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ChevronLeft, AlertCircle, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { format } from 'date-fns';
import React from 'react';

export function BookingSummary() {
  const navigate = useNavigate();
  const { vehicles, drivers, bodyguards, cart, loadCart } = useApp();

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const vehicleItem = cart.find(item => item.type === 'vehicle');
  const driverItem = cart.find(item => item.type === 'driver');
  const bodyguardItem = cart.find(item => item.type === 'bodyguard');

  const vehicle = vehicleItem ? vehicles.find(v => v.id === vehicleItem.serviceId) : null;
  const driver = driverItem ? drivers.find(d => d.id === driverItem.serviceId) : null;
  const bodyguard = bodyguardItem ? bodyguards.find(b => b.id === bodyguardItem.serviceId) : null;

  // Check if we have at least one service selected
  if (cart.length === 0) {
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

  // Use backend cart pricing (no manual recalculation)
  const vehiclePrice = cart
    .filter(item => item.type === 'vehicle')
    .reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);

  const driverPrice = cart
    .filter(item => item.type === 'driver')
    .reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);

  const bodyguardPrice = cart
    .filter(item => item.type === 'bodyguard')
    .reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);

  const subtotal = vehiclePrice + driverPrice + bodyguardPrice;
  const total = subtotal;

  const handleProceedToPayment = () => {
    const params = new URLSearchParams({
      total: total.toFixed(2),
    });

    if (vehicleItem) {
      params.set('vehicleId', vehicleItem.serviceId);
      params.set('duration', vehicleItem.duration);
      params.set('startDate', vehicleItem.startDate.toISOString());
      if (vehicleItem.endDate) params.set('endDate', vehicleItem.endDate.toISOString());
      params.set('startTime', vehicleItem.startTime);
      params.set('endTime', vehicleItem.endTime);
    } else if (driverItem) {
      params.set('driverId', driverItem.serviceId);
      params.set('duration', driverItem.duration);
      params.set('startDate', driverItem.startDate.toISOString());
      if (driverItem.endDate) params.set('endDate', driverItem.endDate.toISOString());
      params.set('startTime', driverItem.startTime);
      params.set('endTime', driverItem.endTime);
    } else if (bodyguardItem) {
      params.set('bodyguardId', bodyguardItem.serviceId);
      params.set('duration', bodyguardItem.duration);
      params.set('startDate', bodyguardItem.startDate.toISOString());
      if (bodyguardItem.endDate) params.set('endDate', bodyguardItem.endDate.toISOString());
      params.set('startTime', bodyguardItem.startTime);
      params.set('endTime', bodyguardItem.endTime);
    }

    if (driverItem) {
      params.set('driverId', driverItem.serviceId);
    }

    if (bodyguardItem) {
      params.set('bodyguardId', bodyguardItem.serviceId);
    }

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
        {vehicleItem && (
          <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <h2 className="text-gray-900">Vehicle</h2>
            </div>
            <div className="flex gap-3">
              <ImageWithFallback
                src={vehicle?.image || vehicleItem.thumbnail || 'https://via.placeholder.com/150'}
                alt={vehicle?.name || vehicleItem.displayName || 'Vehicle'}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-gray-900">
                  {vehicle?.name || vehicleItem.displayName || 'Vehicle'}
                </h3>
                <p className="text-sm text-gray-500">
                  {vehicle
                    ? vehicle.category
                    : vehicleItem.serviceDetails || 'Vehicle rental'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {vehicle
                    ? `${vehicle.seats} seats • ${vehicle.fuelType}`
                    : null}
                </p>
              </div>
            </div>

            {/* Rental Period Display */}
            {vehicleItem.startDate && (
              <div className="mt-4 pt-4 border-t border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Rental Period</span>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Start:</span>{' '}
                  {format(vehicleItem.startDate, 'MMM d, yyyy')} at {vehicleItem.startTime}
                </div>
                {vehicleItem.endDate && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">End:</span>{' '}
                    {format(vehicleItem.endDate, 'MMM d, yyyy')} at {vehicleItem.endTime}
                  </div>
                )}
                {vehicleItem.durationDisplay && (
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    {vehicleItem.durationDisplay}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Driver Details */}
        {driverItem && (
          <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <h2 className="text-gray-900">Professional Driver</h2>
            </div>
            <div className="flex gap-3">
              <ImageWithFallback
                src={driver?.image || 'https://via.placeholder.com/150'}
                alt={driver?.name || driverItem.displayName || 'Driver'}
                className="w-16 h-16 object-cover rounded-full"
              />
              <div className="flex-1">
                <h3 className="text-gray-900">
                  {driver?.name || driverItem.displayName || 'Driver'}
                </h3>
                <p className="text-sm text-gray-500">
                  {driver
                    ? `${driver.experience} years experience`
                    : driverItem.serviceDetails || 'Professional driver'}
                </p>
                {driverItem.durationDisplay && (
                  <p className="text-sm text-green-600 mt-1 font-medium">
                    {driverItem.durationDisplay}
                  </p>
                )}
              </div>
            </div>

            {/* Service Period Display */}
            {driverItem.startDate && (
              <div className="mt-4 pt-4 border-t border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Service Period</span>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Start:</span>{' '}
                  {format(driverItem.startDate, 'MMM d, yyyy')} at {driverItem.startTime}
                </div>
                {driverItem.endDate && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">End:</span>{' '}
                    {format(driverItem.endDate, 'MMM d, yyyy')} at {driverItem.endTime}
                  </div>
                )}
                {driverItem.durationDisplay && (
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    {driverItem.durationDisplay}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bodyguard Details */}
        {bodyguardItem && (
          <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <h2 className="text-gray-900">Security Service</h2>
            </div>
            <div className="flex gap-3">
              <ImageWithFallback
                src={bodyguard?.image || 'https://via.placeholder.com/150'}
                alt={bodyguard?.name || bodyguardItem.displayName || 'Security'}
                className="w-16 h-16 object-cover rounded-full"
              />
              <div className="flex-1">
                <h3 className="text-gray-900">
                  {bodyguard?.name || bodyguardItem.displayName || 'Security'}
                </h3>
                <p className="text-sm text-gray-500">
                  {bodyguard
                    ? `${bodyguard.securityLevel} Level`
                    : bodyguardItem.serviceDetails || 'Security service'}
                </p>
                {bodyguardItem.durationDisplay && (
                  <p className="text-sm text-purple-600 mt-1 font-medium">
                    {bodyguardItem.durationDisplay}
                  </p>
                )}
              </div>
            </div>

            {/* Service Period Display */}
            {bodyguardItem.startDate && (
              <div className="mt-4 pt-4 border-t border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">Service Period</span>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Start:</span>{' '}
                  {format(bodyguardItem.startDate, 'MMM d, yyyy')} at {bodyguardItem.startTime}
                </div>
                {bodyguardItem.endDate && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">End:</span>{' '}
                    {format(bodyguardItem.endDate, 'MMM d, yyyy')} at {bodyguardItem.endTime}
                  </div>
                )}
                {bodyguardItem.durationDisplay && (
                  <p className="text-xs text-purple-600 mt-2 font-medium">
                    {bodyguardItem.durationDisplay}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h2 className="text-gray-900">Cost Breakdown</h2>

          <div className="space-y-2">
            {vehicleItem && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Vehicle rental ({vehicleItem.durationDisplay || vehicleItem.duration})
                </span>
                <span className="text-gray-900">
                  ${vehiclePrice.toFixed(2)}
                </span>
              </div>
            )}

            {driverItem && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Driver service ({driverItem.durationDisplay || driverItem.duration})
                  </span>
                  <span className="text-gray-900">
                    ${driverPrice.toFixed(2)}
                  </span>
                </div>
              </>
            )}

            {bodyguardItem && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Bodyguard service ({bodyguardItem.durationDisplay || bodyguardItem.duration})
                  </span>
                  <span className="text-gray-900">
                    ${bodyguardPrice.toFixed(2)}
                  </span>
                </div>
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