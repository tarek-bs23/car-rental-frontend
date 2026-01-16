import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ChevronLeft, Calendar, CreditCard, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { format, differenceInHours, differenceInDays } from 'date-fns';

export function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bookings, vehicles, drivers, bodyguards } = useApp();

  const booking = bookings.find(b => b.id === id);

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Booking not found</p>
      </div>
    );
  }

  const vehicle = vehicles.find(v => v.id === booking.vehicleId);
  const driver = drivers.find(d => d.id === booking.driverId);
  const bodyguard = bodyguards.find(b => b.id === booking.bodyguardId);

  // Calculate rental period details
  const getRentalPeriodInfo = () => {
    const duration = booking.duration || 'daily';
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    const startTime = booking.startTime || '09:00';
    const endTime = booking.endTime || '17:00';

    let durationText = '';
    let periodText = '';
    
    if (duration === 'hourly') {
      // Combine date and time for accurate hour calculation
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const startDateTime = new Date(startDate);
      startDateTime.setHours(startHour, startMinute, 0, 0);
      
      const endDateTime = new Date(endDate);
      endDateTime.setHours(endHour, endMinute, 0, 0);
      
      const hours = differenceInHours(endDateTime, startDateTime);
      durationText = `${hours} hours`;
      periodText = `${format(startDateTime, 'MMM d, yyyy')} ${startTime} - ${endTime}`;
    } else if (duration === 'daily') {
      const days = Math.max(1, differenceInDays(endDate, startDate));
      durationText = `${days} ${days === 1 ? 'day' : 'days'}`;
      periodText = `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
    } else if (duration === 'weekly') {
      durationText = '7 days';
      periodText = `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
    } else if (duration === 'monthly') {
      durationText = '30 days';
      periodText = `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
    }

    return { durationText, periodText, duration };
  };

  const rentalInfo = getRentalPeriodInfo();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
          <span className="ml-2">Booking Details</span>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4 max-w-md mx-auto">
        {/* Status Banner */}
        <div className={`rounded-xl p-4 border ${getStatusColor(booking.status)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-75">Status</p>
              <p className="capitalize">{booking.status}</p>
            </div>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status}
            </Badge>
          </div>
        </div>

        {/* Booking ID */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Booking ID</p>
          <p className="text-gray-900">{booking.id}</p>
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
                <p className="text-sm text-gray-600 mt-1">
                  {booking.driverHours} hours • ${driver.pricePerHour}/hour
                </p>
              </div>
            </div>
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
                <p className="text-sm text-gray-600 mt-1">
                  {booking.bodyguardHours} hours • ${bodyguard.pricePerHour}/hour
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rental Period */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">Rental Period</h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {rentalInfo.durationText}
            </Badge>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                {rentalInfo.duration === 'hourly' ? (
                  <Clock className="w-5 h-5 text-white" />
                ) : (
                  <Calendar className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {rentalInfo.duration === 'hourly' && 'Hourly Rental'}
                  {rentalInfo.duration === 'daily' && 'Daily Rental'}
                  {rentalInfo.duration === 'weekly' && 'Weekly Rental'}
                  {rentalInfo.duration === 'monthly' && 'Monthly Rental'}
                </p>
                <p className="text-sm text-gray-700">
                  {rentalInfo.periodText}
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-600">Pickup</p>
              </div>
              <p className="text-sm text-gray-900">
                {new Date(booking.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              {booking.startTime && (
                <p className="text-xs text-gray-600 mt-0.5">{booking.startTime}</p>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-600">Return</p>
              </div>
              <p className="text-sm text-gray-900">
                {new Date(booking.endDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              {booking.endTime && (
                <p className="text-xs text-gray-600 mt-0.5">{booking.endTime}</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h2 className="text-gray-900">Payment Information</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">Total Paid</span>
            </div>
            <span className="text-gray-900">${booking.totalAmount}</span>
          </div>
        </div>

        {/* Refund Status */}
        {booking.status === 'cancelled' && booking.refundStatus && (
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-900 mb-2">Refund Status</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-800">Status</span>
                    <span className="capitalize text-yellow-900">{booking.refundStatus}</span>
                  </div>
                  {booking.refundAmount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-yellow-800">Amount</span>
                      <span className="text-yellow-900">${booking.refundAmount}</span>
                    </div>
                  )}
                  <p className="text-xs text-yellow-700 mt-2">
                    Refund will be processed within 5-7 business days
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Support */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/support/contact')}
        >
          Contact Support
        </Button>
      </div>

      {/* Actions */}
      {booking.status === 'confirmed' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
          <div className="max-w-md mx-auto">
            <Button
              variant="destructive"
              className="w-full h-12"
              onClick={() => navigate(`/booking/${booking.id}/cancel`)}
            >
              Cancel Booking
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}