import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { ChevronLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

export function CancelBooking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bookings, cancelBooking } = useApp();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const booking = bookings.find(b => b.id === id);

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Booking not found</p>
      </div>
    );
  }

  // Calculate refund based on cancellation time
  // In real app, this would be based on actual booking date
  const refundPercentage = 100; // Example: full refund
  const refundAmount = (booking.totalAmount * refundPercentage) / 100;

  const handleConfirmCancel = () => {
    cancelBooking(booking.id, refundAmount);
    setCancelled(true);
    setShowConfirmDialog(false);
    
    setTimeout(() => {
      navigate('/bookings');
    }, 2000);
  };

  if (cancelled) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto">
                <CheckCircle2 className="w-full h-full text-green-600" />
              </div>
              
              <div>
                <h1 className="text-gray-900">Booking Cancelled</h1>
                <p className="text-gray-600 mt-2">
                  Your booking has been successfully cancelled
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Refund Amount</p>
                <p className="text-gray-900">${refundAmount}</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Your refund will be processed within 5-7 business days to your original payment method.
                </p>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/bookings')}
              className="w-full h-12"
            >
              Back to My Bookings
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
          <span className="ml-2">Cancel Booking</span>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        {/* Warning */}
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-yellow-900 mb-2">Are you sure?</h3>
              <p className="text-sm text-yellow-800">
                You are about to cancel booking #{booking.id.slice(-6)}
              </p>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h2 className="text-gray-900">Booking Details</h2>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID</span>
              <span className="text-gray-900">{booking.id.slice(-6)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="text-gray-900">${booking.totalAmount}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Booking Date</span>
              <span className="text-gray-900">
                {new Date(booking.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h2 className="text-gray-900">Cancellation Policy</h2>
          
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="text-green-700 mb-1">Full Refund (100%)</h4>
              <p className="text-xs text-green-600">
                Cancel 48+ hours before pickup
              </p>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="text-yellow-700 mb-1">Partial Refund (50%)</h4>
              <p className="text-xs text-yellow-600">
                Cancel 24-48 hours before pickup
              </p>
            </div>
            
            <div className="p-3 bg-red-50 rounded-lg">
              <h4 className="text-red-700 mb-1">No Refund (0%)</h4>
              <p className="text-xs text-red-600">
                Cancel less than 24 hours before pickup
              </p>
            </div>
          </div>
        </div>

        {/* Estimated Refund */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="text-center">
            <p className="text-sm text-blue-700 mb-1">Estimated Refund</p>
            <p className="text-blue-900">${refundAmount}</p>
            <p className="text-xs text-blue-600 mt-2">
              {refundPercentage}% of ${booking.totalAmount}
            </p>
          </div>
        </div>

        {/* Refund Timeline */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-gray-900 mb-3">Refund Timeline</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Cancellation processed immediately</li>
            <li>• Refund initiated within 24 hours</li>
            <li>• Amount credited in 5-7 business days</li>
          </ul>
        </div>
      </div>

      {/* Sticky CTAs */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
        <div className="max-w-md mx-auto space-y-2">
          <Button
            variant="destructive"
            className="w-full h-12"
            onClick={() => setShowConfirmDialog(true)}
          >
            Cancel Booking
          </Button>
          <Button
            variant="outline"
            className="w-full h-12"
            onClick={() => navigate(-1)}
          >
            Keep Booking
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Cancellation</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your booking will be cancelled and a refund of ${refundAmount} will be processed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
