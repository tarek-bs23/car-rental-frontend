import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { ChevronLeft, CreditCard, Lock } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { PremiumLoader } from '../ui/PremiumLoader';
import React from 'react';

export function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { savedPaymentMethods, addBooking } = useApp();
  const [selectedPayment, setSelectedPayment] = useState(
    savedPaymentMethods[0]?.id || ''
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const total = searchParams.get('total') || '0';
  const vehicleId = searchParams.get('vehicleId');
  const driverId = searchParams.get('driverId');
  const bodyguardId = searchParams.get('bodyguardId');
  const driverHours = parseInt(searchParams.get('driverHours') || '0');
  const bodyguardHours = parseInt(searchParams.get('bodyguardHours') || '0');
  const duration = searchParams.get('duration') as 'hourly' | 'daily' | 'weekly' | 'monthly' || 'daily';
  const startDate = searchParams.get('startDate');
  const startTime = searchParams.get('startTime');
  const endDate = searchParams.get('endDate');
  const endTime = searchParams.get('endTime');

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const bookingId = `BK${Date.now()}`;

      // Create booking
      addBooking({
        id: bookingId,
        vehicleId: vehicleId || undefined,
        driverId: driverId || undefined,
        bodyguardId: bodyguardId || undefined,
        driverHours: driverHours || undefined,
        bodyguardHours: bodyguardHours || undefined,
        startDate: startDate || new Date().toISOString(),
        endDate: endDate || new Date(Date.now() + 86400000).toISOString(),
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        duration: duration || 'daily',
        totalAmount: parseFloat(total),
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      });

      setIsProcessing(false);
      navigate(`/booking/confirmation?bookingId=${bookingId}`);
    }, 2000);
  };

  // Show loading overlay when processing
  if (isProcessing) {
    return (
      <PremiumLoader
        fullScreen
        size="lg"
        text="Processing your payment securely..."
      />
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
          <span className="ml-2">Payment</span>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        {/* Amount from Booking Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <p className="text-sm text-gray-500 mb-1">Total Amount</p>
          <p className="text-gray-900">${total}</p>
        </div>

        {/* Payment Methods (kept static) */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <h2 className="text-gray-900">Payment Method</h2>

          <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
            {savedPaymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
              >
                <RadioGroupItem value={method.id} id={method.id} />
                <Label htmlFor={method.id} className="flex items-center gap-3 flex-1 cursor-pointer">
                  <div className="w-10 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{method.brand} •••• {method.last4}</p>
                    {method.isDefault && (
                      <p className="text-xs text-blue-600">Default</p>
                    )}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/payment/add-method')}
          >
            Add New Payment Method
          </Button>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <Button
            onClick={handlePayment}
            className="w-full h-12"
            disabled={!selectedPayment}
          >
            Pay ${total}
          </Button>
        </div>
      </div>
    </div>
  );
}