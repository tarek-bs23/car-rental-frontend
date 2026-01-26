import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../contexts/AppContext'
import { Button } from '../ui/button'
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left'
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle'
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2'
import Loader2 from 'lucide-react/dist/esm/icons/loader-2'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { apiJson } from '../../lib/api'
import { endpoints } from '../../lib/endpoints'
import { Textarea } from '../ui/textarea'
import { toast } from 'sonner'

interface EstimatedRefundResponse {
  statusCode: number
  message: string
  data: {
    bookingId: string
    bookingDate: string
    totalAmount: number
    estimatedRefundAmount: number
    refundTier: string
    refundPercentage: number
    currency: string
  }
}

interface CancelBookingResponse {
  statusCode: number
  message: string
  data: {
    rootBookingId: string
    bookingId: string
    services: Array<{
      bookingType: string
      bookingId: string
      serviceId: string
      startDate: string
      endDate: string
      pricingType: string
      price: number
      status: string
    }>
    costBreakdown: {
      vehicle: number
      driver: number
      bodyguard: number
      total: number
    }
  }
}

export function CancelBooking() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { bookings, cancelBooking } = useApp()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [estimate, setEstimate] = useState<EstimatedRefundResponse['data'] | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [estimateError, setEstimateError] = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [cancelResponse, setCancelResponse] = useState<CancelBookingResponse['data'] | null>(null)

  const booking = bookings.find(b => b.id === id)

  useEffect(() => {
    if (!id) return

    const bookingId = id
    let cancelledRequest = false

    async function fetchEstimate() {
      setIsEstimating(true)
      setEstimateError(null)

      try {
        const path = endpoints.bookings.estimatedRefund(bookingId)
        const response = await apiJson<EstimatedRefundResponse>({ path })
        if (!cancelledRequest) setEstimate(response.data)
      } catch (err) {
        if (!cancelledRequest) {
          setEstimate(null)
          setEstimateError(err instanceof Error ? err.message : 'Failed to load refund estimate')
        }
      } finally {
        if (!cancelledRequest) setIsEstimating(false)
      }
    }

    fetchEstimate();

    return () => {
      cancelledRequest = true;
    };
  }, [id]);

  const formatMoney = useMemo(() => {
    return (amount: number, currency?: string) => {
      if (!currency) return `$${amount}`;
      try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
      } catch {
        return `${currency} ${amount}`;
      }
    };
  }, []);

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Booking ID is required</p>
      </div>
    );
  }

  const totalAmount = estimate?.totalAmount ?? booking?.totalAmount ?? 0;
  const refundPercentage = estimate?.refundPercentage ?? 100;
  const refundAmount = estimate?.estimatedRefundAmount ?? ((totalAmount * refundPercentage) / 100);
  const currency = estimate?.currency;
  const bookingDisplayId = estimate?.bookingId ?? booking?.id.slice(-6) ?? id.slice(-6);
  const bookingDate = estimate?.bookingDate ?? booking?.createdAt;
  const refundTier = estimate?.refundTier;

  const handleConfirmCancel = async () => {
    if (!id) return;

    if (!cancellationReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    setIsCancelling(true);
    setCancelError(null);

    try {
      const path = endpoints.bookings.cancel(id);
      const response = await apiJson<CancelBookingResponse>({
        path,
        method: 'POST',
        body: {
          reason: cancellationReason.trim(),
        },
      });

      setCancelResponse(response.data);
      cancelBooking(booking?.id ?? id, refundAmount);
      setCancelled(true);
      setShowConfirmDialog(false);

      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel booking';
      setCancelError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCancelling(false);
    }
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
                <p className="text-gray-900">{formatMoney(refundAmount, currency)}</p>
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
                You are about to cancel booking #{bookingDisplayId}
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
              <span className="text-gray-900">{bookingDisplayId}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="text-gray-900">{formatMoney(totalAmount, currency)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Booking Date</span>
              <span className="text-gray-900">
                {bookingDate ? new Date(bookingDate).toLocaleDateString() : '—'}
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
            {isEstimating ? (
              <div className="flex items-center justify-center gap-2 text-blue-800">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Calculating…</span>
              </div>
            ) : (
              <>
                <p className="text-blue-900">{formatMoney(refundAmount, currency)}</p>
                <p className="text-xs text-blue-600 mt-2">
                  {refundTier ? `${refundTier} • ` : ''}
                  {refundPercentage}% of {formatMoney(totalAmount, currency)}
                  {estimateError ? ` • ${estimateError}` : ''}
                </p>
              </>
            )}
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
              This action cannot be undone. Your booking will be cancelled and a refund of {formatMoney(refundAmount, currency)} will be processed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Reason for cancellation
              </label>
              <Textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g., Change of travel plans"
                className="min-h-[80px]"
                disabled={isCancelling}
              />
            </div>
            {cancelError && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {cancelError}
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-red-600 hover:bg-red-700"
              disabled={isCancelling || !cancellationReason.trim()}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Confirm Cancel'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
