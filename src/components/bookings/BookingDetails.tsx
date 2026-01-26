import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left'
import Calendar from 'lucide-react/dist/esm/icons/calendar'
import CreditCard from 'lucide-react/dist/esm/icons/credit-card'
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle'
import Clock from 'lucide-react/dist/esm/icons/clock'
import Loader2 from 'lucide-react/dist/esm/icons/loader-2'
import { Badge } from '../ui/badge'
import { format, differenceInHours, differenceInDays } from 'date-fns'
import { useState, useEffect } from 'react'
import { apiJson } from '../../lib/api'
import { endpoints } from '../../lib/endpoints'
import { getVehicleDetails } from '../../lib/vehicleSearch'
import { getDriverDetails } from '../../lib/driverSearch'
import { getBodyguardDetails } from '../../lib/bodyguardSearch'
import type { Vehicle, Driver, Bodyguard } from '../../contexts/AppContext'
import { BookingStatus } from '../../enums/booking'

interface BookingService {
  bookingType: 'VEHICLE' | 'DRIVER' | 'BODYGUARD'
  bookingId: string
  serviceId: string
  startDate: string
  endDate: string
  pricingType: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
  price: number
  status: string
}

interface BookingDetailsResponse {
  statusCode: number
  message: string
  data: {
    rootBookingId: string
    bookingId: string
    services: BookingService[]
    costBreakdown: {
      vehicle: number
      driver: number
      bodyguard: number
      total: number
    }
  }
}

export function BookingDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [bookingData, setBookingData] = useState<BookingDetailsResponse['data'] | null>(null)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [driver, setDriver] = useState<Driver | null>(null)
  const [bodyguard, setBodyguard] = useState<Bodyguard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError('Booking ID is required')
      setIsLoading(false)
      return
    }

    const bookingId = id
    let cancelled = false

    async function fetchBookingDetails() {
      setIsLoading(true)
      setError(null)

      try {
        const path = endpoints.bookings.details(bookingId)
        const response = await apiJson<BookingDetailsResponse>({ path })

        if (cancelled) return

        setBookingData(response.data)

        const vehicleService = response.data.services.find(s => s.bookingType === 'VEHICLE')
        const driverService = response.data.services.find(s => s.bookingType === 'DRIVER')
        const bodyguardService = response.data.services.find(s => s.bookingType === 'BODYGUARD')

        if (vehicleService) {
          try {
            const vehicleDetails = await getVehicleDetails(vehicleService.serviceId)
            if (!cancelled) setVehicle(vehicleDetails)
          } catch (err) {
            console.error('Failed to fetch vehicle details:', err)
          }
        }

        if (driverService) {
          try {
            const driverDetails = await getDriverDetails(driverService.serviceId)
            if (!cancelled) setDriver(driverDetails)
          } catch (err) {
            console.error('Failed to fetch driver details:', err)
          }
        }

        if (bodyguardService) {
          try {
            const bodyguardDetails = await getBodyguardDetails(bodyguardService.serviceId)
            if (!cancelled) setBodyguard(bodyguardDetails)
          } catch (err) {
            console.error('Failed to fetch bodyguard details:', err)
          }
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load booking details');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchBookingDetails();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">{error || 'Booking not found'}</p>
      </div>
    );
  }

  const vehicleService = bookingData.services.find(s => s.bookingType === 'VEHICLE');
  const driverService = bookingData.services.find(s => s.bookingType === 'DRIVER');
  const bodyguardService = bookingData.services.find(s => s.bookingType === 'BODYGUARD');

  const getRentalPeriodInfo = (service: BookingService | undefined) => {
    if (!service) return { durationText: '', periodText: '', duration: 'daily' as const };

    const duration = service.pricingType.toLowerCase() as 'hourly' | 'daily' | 'weekly' | 'monthly';
    const startDate = new Date(service.startDate);
    const endDate = new Date(service.endDate);

    let durationText = '';
    let periodText = '';

    if (duration === 'hourly') {
      const hours = differenceInHours(endDate, startDate);
      durationText = `${hours} hours`;
      periodText = `${format(startDate, 'MMM d, yyyy HH:mm')} - ${format(endDate, 'MMM d, yyyy HH:mm')}`;
    } else if (duration === 'daily') {
      const days = Math.max(1, differenceInDays(endDate, startDate));
      durationText = `${days} ${days === 1 ? 'day' : 'days'}`;
      periodText = `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
    } else if (duration === 'weekly') {
      const weeks = Math.max(1, Math.ceil(differenceInDays(endDate, startDate) / 7));
      durationText = `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
      periodText = `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
    } else if (duration === 'monthly') {
      const months = Math.max(1, Math.ceil(differenceInDays(endDate, startDate) / 30));
      durationText = `${months} ${months === 1 ? 'month' : 'months'}`;
      periodText = `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
    }

    return { durationText, periodText, duration };
  };

  const primaryService = vehicleService || driverService || bodyguardService;
  const rentalInfo = getRentalPeriodInfo(primaryService);

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(/_/g, '-');
    switch (normalizedStatus) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled-by-user':
      case 'cancelled-by-agent':
      case 'cancelled-by-admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending-agent-approval':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'refund-pending':
      case 'refunded':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const primaryStatus = primaryService?.status || '';

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
        <div className={`rounded-xl p-4 border ${getStatusColor(primaryStatus)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-75">Status</p>
              <p className="capitalize">{formatStatus(primaryStatus)}</p>
            </div>
            <Badge className={getStatusColor(primaryStatus)}>
              {formatStatus(primaryStatus)}
            </Badge>
          </div>
        </div>

        {/* Booking ID */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Booking ID</p>
          <p className="text-gray-900">{bookingData.bookingId}</p>
        </div>

        {/* Vehicle Details */}
        {vehicle && vehicleService && (
          <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <h2 className="text-gray-900">Vehicle</h2>
              <Badge className={`ml-auto ${getStatusColor(vehicleService.status)}`}>
                {formatStatus(vehicleService.status)}
              </Badge>
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
                <p className="text-sm font-medium text-gray-900 mt-2">
                  ${vehicleService.price} ({vehicleService.pricingType})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Driver Details */}
        {driver && driverService && (
          <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <h2 className="text-gray-900">Professional Driver</h2>
              <Badge className={`ml-auto ${getStatusColor(driverService.status)}`}>
                {formatStatus(driverService.status)}
              </Badge>
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
                <p className="text-sm font-medium text-gray-900 mt-2">
                  ${driverService.price} ({driverService.pricingType})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bodyguard Details */}
        {bodyguard && bodyguardService && (
          <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <h2 className="text-gray-900">Security Service</h2>
              <Badge className={`ml-auto ${getStatusColor(bodyguardService.status)}`}>
                {formatStatus(bodyguardService.status)}
              </Badge>
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
                <p className="text-sm font-medium text-gray-900 mt-2">
                  ${bodyguardService.price} ({bodyguardService.pricingType})
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

          {primaryService && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-600">Start</p>
                </div>
                <p className="text-sm text-gray-900">
                  {format(new Date(primaryService.startDate), 'MMM d, yyyy')}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {format(new Date(primaryService.startDate), 'HH:mm')}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-600">End</p>
                </div>
                <p className="text-sm text-gray-900">
                  {format(new Date(primaryService.endDate), 'MMM d, yyyy')}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {format(new Date(primaryService.endDate), 'HH:mm')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h2 className="text-gray-900">Payment Information</h2>
          <div className="space-y-2">
            {bookingData.costBreakdown.vehicle > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Vehicle</span>
                <span className="text-gray-900">${bookingData.costBreakdown.vehicle}</span>
              </div>
            )}
            {bookingData.costBreakdown.driver > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Driver</span>
                <span className="text-gray-900">${bookingData.costBreakdown.driver}</span>
              </div>
            )}
            {bookingData.costBreakdown.bodyguard > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Bodyguard</span>
                <span className="text-gray-900">${bookingData.costBreakdown.bodyguard}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">Total</span>
                </div>
                <span className="font-semibold text-gray-900">${bookingData.costBreakdown.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Refund Status */}
        {(primaryStatus.includes('CANCELLED') || primaryStatus.includes('REFUND')) && (
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-900 mb-2">Refund Status</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-800">Status</span>
                    <span className="capitalize text-yellow-900">{formatStatus(primaryStatus)}</span>
                  </div>
                  <p className="text-xs text-yellow-700 mt-2">
                    {primaryStatus.includes('REFUNDED')
                      ? 'Refund has been processed'
                      : 'Refund will be processed within 5-7 business days'}
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
      {primaryStatus === BookingStatus.CONFIRMED && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
          <div className="max-w-md mx-auto">
            <Button
              variant="destructive"
              className="w-full h-12"
              onClick={() => navigate(`/booking/${bookingData.rootBookingId}/cancel`)}
            >
              Cancel Booking
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}