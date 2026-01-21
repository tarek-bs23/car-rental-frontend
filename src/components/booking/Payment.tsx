import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { ChevronLeft, CreditCard, Lock } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { PremiumLoader } from '../ui/PremiumLoader';
import React from 'react';
import { apiJson } from '../../lib/api';
import { endpoints } from '../../lib/endpoints';

export function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { savedPaymentMethods } = useApp();
  const [selectedPayment, setSelectedPayment] = useState(
    savedPaymentMethods[0]?.id || ''
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const total = searchParams.get('total') || '0';

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      type CheckoutResponse = {
        statusCode: number;
        message: string;
        data: {
          intentId: string;
          status: string;
          totalAmount: number;
          currency: string;
          paymentStatus: string;
          paymentAttemptId: string;
          timestamp: string;
        };
      };

      type CheckoutConfirmResponse = {
        statusCode: number;
        message: string;
        data: {
          intentId: string;
          status: string;
          paymentStatus: string;
          externalPaymentId?: string;
          timestamp: string;
        };
      };

      const response = await apiJson<CheckoutResponse>({
        path: endpoints.checkout,
        method: 'POST',
        body: {
          paymentMethod: 'CREDIT_CARD',
        },
      });

      const intentId = response?.data?.intentId;

      if (!intentId) {
        throw new Error('Missing intentId from checkout response');
      }

      // Simulate payment processing
      setTimeout(async () => {
        try {
          await apiJson<CheckoutConfirmResponse>({
            path: endpoints.checkoutConfirm,
            method: 'POST',
            body: {
              intentId,
              simulateSuccess: true,
              externalPaymentId: 'pi_test_123456',
            },
          });

          navigate(`/booking/confirmation?intentId=${intentId}`);
        } catch (error) {
          console.error('Checkout confirm failed:', error);
          alert(error instanceof Error ? error.message : 'Payment confirmation failed. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      }, 2000);
    } catch (error) {
      console.error('Checkout failed:', error);
      alert(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
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


        {/* Security Notice */}
        <div className="bg-gray-100 rounded-xl p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-900">Secure Payment</p>
            <p className="text-xs text-gray-600 mt-1">
              Your payment information is encrypted and secure. We use Stripe for payment processing.
            </p>
          </div>
        </div>

        {/* Billing Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
          <h3 className="text-gray-900 mb-3">Billing Summary</h3>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">${total}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Taxes & Fees</span>
            <span className="text-gray-900">$0</span>
          </div>

          <div className="pt-2 border-t border-gray-200 flex justify-between">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">${total}</span>
          </div>
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