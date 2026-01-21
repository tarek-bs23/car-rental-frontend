import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { TopBar } from '../layout/TopBar';
import { BottomNav } from '../layout/BottomNav';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Calendar, Car } from 'lucide-react';
import { apiJson } from '../../lib/api';
import { endpoints } from '../../lib/endpoints';
import { BookingStatus } from '../../enums/booking';

type BookingType = 'VEHICLE' | 'DRIVER' | 'BODYGUARD';

interface BookingHistoryItem {
  bookingType: BookingType;
  bookingId: string;
  displayName: string;
  thumbnail?: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  addons: string[];
  status: BookingStatus;
}

interface BookingHistoryResponse {
  statusCode: number;
  message: string;
  data: BookingHistoryItem[];
}

export function MyBookings() {
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();

  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setBookings([]);
      return;
    }

    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiJson<BookingHistoryResponse>({
          path: endpoints.bookings.history,
        });
        if (!mounted) return;
        setBookings(Array.isArray(res.data) ? res.data : []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load bookings');
        setBookings([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const now = new Date();

  const isPastBooking = (booking: BookingHistoryItem) => {
    const end = new Date(booking.endDate);
    if (!isNaN(end.getTime()) && end < now) return true;

    switch (booking.status) {
      case BookingStatus.COMPLETED:
      case BookingStatus.REFUNDED:
      case BookingStatus.CANCELLED_BY_USER:
      case BookingStatus.CANCELLED_BY_AGENT:
      case BookingStatus.CANCELLED_BY_ADMIN:
        return true;
      default:
        return false;
    }
  };

  const isUpcomingBooking = (booking: BookingHistoryItem) => !isPastBooking(booking);

  const upcomingBookings = bookings.filter(isUpcomingBooking);
  const pastBookings = bookings.filter(isPastBooking);

  const renderBookingCard = (booking: BookingHistoryItem) => {
    const getStatusColor = (status: BookingStatus) => {
      switch (status) {
        case BookingStatus.CONFIRMED:
        case BookingStatus.IN_PROGRESS:
          return 'bg-green-100 text-green-800';
        case BookingStatus.PENDING_AGENT_APPROVAL:
        case BookingStatus.REFUND_PENDING:
          return 'bg-yellow-100 text-yellow-800';
        case BookingStatus.CANCELLED_BY_USER:
        case BookingStatus.CANCELLED_BY_AGENT:
        case BookingStatus.CANCELLED_BY_ADMIN:
          return 'bg-red-100 text-red-800';
        case BookingStatus.COMPLETED:
        case BookingStatus.REFUNDED:
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div
        key={booking.bookingId}
        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        {booking.thumbnail && (
          <div className="relative aspect-[16/9]">
            <ImageWithFallback
              src={booking.thumbnail}
              alt={booking.displayName}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3">
              <Badge className={getStatusColor(booking.status)}>
                {booking.status.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
        )}

        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-gray-900">
                Booking #{booking.bookingId.slice(-6)}
              </h3>
              <p className="text-blue-600">${booking.totalPrice}</p>
            </div>
            <p className="text-sm text-gray-600">{booking.displayName}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(booking.startDate).toLocaleDateString()} -{' '}
              {new Date(booking.endDate).toLocaleDateString()}
            </span>
          </div>

          {booking.addons.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs">
              {booking.addons.includes('DRIVER') && (
                <Badge variant="secondary">Driver included</Badge>
              )}
              {booking.addons.includes('BODYGUARD') && (
                <Badge variant="secondary">Security included</Badge>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/booking/${booking.bookingId}`)}
              className="flex-1"
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = ({ type }: { type: 'upcoming' | 'past' }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Car className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-gray-900 mb-2">No {type} bookings</h3>
      <p className="text-sm text-gray-500 text-center mb-6">
        {type === 'upcoming'
          ? "You don't have any upcoming bookings yet"
          : "You don't have any past bookings"
        }
      </p>
      {type === 'upcoming' && (
        <Button onClick={() => navigate('/')}>
          Start Searching
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar />

      <div className="pt-14 px-4 pb-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-gray-900 mb-4">My Bookings</h1>

          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastBookings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {loading ? (
                <p className="text-sm text-gray-500">Loading bookings...</p>
              ) : error ? (
                <p className="text-sm text-red-500">{error}</p>
              ) : upcomingBookings.length === 0 ? (
                <EmptyState type="upcoming" />
              ) : (
                upcomingBookings.map(renderBookingCard)
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {loading ? (
                <p className="text-sm text-gray-500">Loading bookings...</p>
              ) : error ? (
                <p className="text-sm text-red-500">{error}</p>
              ) : pastBookings.length === 0 ? (
                <EmptyState type="past" />
              ) : (
                pastBookings.map(renderBookingCard)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
