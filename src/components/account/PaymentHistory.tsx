import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../contexts/AppContext'
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left'
import CreditCard from 'lucide-react/dist/esm/icons/credit-card'
import Download from 'lucide-react/dist/esm/icons/download'
import { Button } from '../ui/button'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

export function PaymentHistory() {
  const navigate = useNavigate()
  const { bookings, vehicles, drivers, bodyguards } = useApp()
  const [activeTab, setActiveTab] = useState('all')

  const paymentHistory = useMemo(() => {
    return bookings
      .filter(b => b.status === 'completed' || b.status === 'confirmed')
      .map(booking => {
        const vehicle = booking.vehicleId ? vehicles.find(v => v.id === booking.vehicleId) : null
        const driver = booking.driverId ? drivers.find(d => d.id === booking.driverId) : null
        const bodyguard = booking.bodyguardId ? bodyguards.find(b => b.id === booking.bodyguardId) : null

        return {
          ...booking,
          vehicle,
          driver,
          bodyguard,
          paymentDate: booking.createdAt,
          paymentMethod: 'Visa ••••4242',
          receiptId: `RCP-${booking.id}`,
        }
      })
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
  }, [bookings, vehicles, drivers, bodyguards])

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  function getServiceDescription(payment: typeof paymentHistory[0]) {
    const services = []
    if (payment.vehicle) services.push(payment.vehicle.name)
    if (payment.driver) services.push('Driver Service')
    if (payment.bodyguard) services.push('Security Service')
    return services.join(' + ')
  }

  function handleDownloadReceipt(receiptId: string) {
    const link = document.createElement('a')
    link.href = '#'
    link.download = `${receiptId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const displayPayments = activeTab === 'all' 
    ? paymentHistory 
    : paymentHistory.filter(p => p.status === activeTab)

  const totalSpent = useMemo(() => 
    paymentHistory.reduce((sum, p) => sum + p.totalAmount, 0),
    [paymentHistory]
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="ml-2">Payment History</span>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4 max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Total Spent</p>
            <p className="text-2xl text-gray-900">
              ${totalSpent.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Transactions</p>
            <p className="text-2xl text-gray-900">{paymentHistory.length}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          {displayPayments.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No payment history</p>
              <p className="text-sm text-gray-400 mt-1">
                Your completed bookings will appear here
              </p>
            </div>
          ) : (
            displayPayments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded-xl p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-gray-900">{getServiceDescription(payment)}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(payment.paymentDate)} at {formatTime(payment.paymentDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-gray-900">
                      ${payment.totalAmount}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      payment.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {payment.status === 'completed' ? 'Completed' : 'Confirmed'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Booking ID</span>
                    <span className="text-gray-900">{payment.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment Method</span>
                    <span className="text-gray-900">{payment.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Receipt ID</span>
                    <span className="text-gray-900">{payment.receiptId}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/booking/${payment.id}`)}
                  >
                    View Booking
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownloadReceipt(payment.receiptId)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Receipt
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {paymentHistory.length > 0 ? (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => alert('Export feature coming soon')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Payment History
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
