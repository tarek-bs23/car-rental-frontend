import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { CheckCircle2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export function BookingConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId') || 'BK123456';

  useEffect(() => {
    // Celebration confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const handleCopyBookingId = () => {
    navigator.clipboard.writeText(bookingId);
    toast.success('Booking ID copied!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Success Icon */}
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto">
              <CheckCircle2 className="w-full h-full text-green-600" />
            </div>
            
            <div>
              <h1 className="text-gray-900">Booking Confirmed!</h1>
              <p className="text-gray-600 mt-2">
                Your reservation has been successfully confirmed
              </p>
            </div>
          </div>

          {/* Booking ID */}
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Booking ID</p>
              <div className="flex items-center gap-2">
                <p className="text-gray-900">{bookingId}</p>
                <button
                  onClick={handleCopyBookingId}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-2">
              <p className="text-sm text-gray-600">
                A confirmation email has been sent to your registered email address.
              </p>
              <p className="text-sm text-gray-600">
                Please save your booking ID for future reference.
              </p>
            </div>
          </div>

          {/* Quick Summary */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-2">
            <h3 className="text-blue-900">What's Next?</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Check your email for booking details</li>
              <li>• View your booking in "My Bookings"</li>
              <li>• Contact support if you need assistance</li>
            </ul>
          </div>

          {/* CTAs */}
          <div className="space-y-3 pt-4">
            <Button 
              onClick={() => navigate('/bookings')}
              className="w-full h-12"
            >
              View My Bookings
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full h-12"
            >
              Book Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
