import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { TopBar } from '../layout/TopBar';
import { BottomNav } from '../layout/BottomNav';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Calendar, Car } from 'lucide-react';

export function MyBookings() {
  const navigate = useNavigate();
  const { bookings, vehicles, drivers, bodyguards } = useApp();

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed');
  const pastBookings = bookings.filter(b => b.status !== 'confirmed');

  const renderBookingCard = (booking: typeof bookings[0]) => {
    const vehicle = vehicles.find(v => v.id === booking.vehicleId);
    const driver = drivers.find(d => d.id === booking.driverId);
    const bodyguard = bodyguards.find(b => b.id === booking.bodyguardId);

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'confirmed':
          return 'bg-green-100 text-green-800';
        case 'cancelled':
          return 'bg-red-100 text-red-800';
        case 'completed':
          return 'bg-blue-100 text-blue-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div
        key={booking.id}
        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        {vehicle && (
          <div className="relative aspect-[16/9]">
            <ImageWithFallback
              src={vehicle.image}
              alt={vehicle.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3">
              <Badge className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
            </div>
          </div>
        )}

        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-gray-900">Booking #{booking.id.slice(-6)}</h3>
              <p className="text-blue-600">${booking.totalAmount}</p>
            </div>
            {vehicle && (
              <p className="text-sm text-gray-600">{vehicle.name}</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date(booking.startDate).toLocaleDateString()}</span>
          </div>

          {(driver || bodyguard) && (
            <div className="flex gap-2 text-xs">
              {driver && (
                <Badge variant="secondary">Driver included</Badge>
              )}
              {bodyguard && (
                <Badge variant="secondary">Security included</Badge>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/booking/${booking.id}`)}
              className="flex-1"
            >
              View Details
            </Button>
            {booking.status === 'confirmed' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => navigate(`/booking/${booking.id}/cancel`)}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
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
              {upcomingBookings.length === 0 ? (
                <EmptyState type="upcoming" />
              ) : (
                upcomingBookings.map(renderBookingCard)
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastBookings.length === 0 ? (
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
