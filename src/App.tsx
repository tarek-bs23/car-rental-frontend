import React, { useState, useCallback, useMemo, type PropsWithChildren } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './contexts/AppContext'
import { Toaster } from './components/ui/sonner'
import { SplashScreen } from './components/ui/SplashScreen'

import { AppLaunch } from './components/auth/AppLaunch'
import { Login } from './components/auth/Login'
import { Register } from './components/auth/Register'
import { VerifyEmail } from './components/auth/VerifyEmail'
import { Welcome } from './components/auth/Welcome'
import { ForgotPassword } from './components/auth/ForgotPassword'
import { VerifyOtp } from './components/auth/VerifyOtp'
import { ResetPassword } from './components/auth/ResetPassword'

import { Services } from './components/home/Services'

import { VehicleSearch } from './components/search/VehicleSearch'
import { VehicleDetails } from './components/search/VehicleDetails'

import { DriverSearch } from './components/drivers/DriverSearch'
import { DriverDetails } from './components/drivers/DriverDetails'

import { BodyguardSearch } from './components/bodyguards/BodyguardSearch'
import { BodyguardDetails } from './components/bodyguards/BodyguardDetails'

import { AddOnsSelection } from './components/booking/AddOnsSelection'
import { ServiceCart } from './components/booking/ServiceCart'
import { BookingSummary } from './components/booking/BookingSummary'
import { Payment } from './components/booking/Payment'
import { BookingConfirmation } from './components/booking/Confirmation'

import { MyBookings } from './components/bookings/MyBookings'
import { BookingDetails } from './components/bookings/BookingDetails'
import { CancelBooking } from './components/bookings/CancelBooking'

import { Account } from './components/account/Account'
import { EditProfile } from './components/account/EditProfile'
import { PaymentHistory } from './components/account/PaymentHistory'

function RequireAuth({ children }: PropsWithChildren) {
  const { isAuthenticated } = useApp()

  if (!isAuthenticated) {
    return <Navigate to="/launch" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: PropsWithChildren) {
  const { isAuthenticated } = useApp()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { isAuthenticated } = useApp()

  const defaultRedirect = useMemo(() => {
    return isAuthenticated ? "/" : "/launch"
  }, [isAuthenticated])

  return (
    <Routes>
      <Route path="/launch" element={<PublicRoute><AppLaunch /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
      <Route path="/welcome" element={<PublicRoute><Welcome /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/verify-otp" element={<PublicRoute><VerifyOtp /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

      <Route path="/" element={<RequireAuth><Services /></RequireAuth>} />

      <Route path="/vehicles" element={<RequireAuth><VehicleSearch /></RequireAuth>} />
      <Route path="/vehicle/:id" element={<RequireAuth><VehicleDetails /></RequireAuth>} />

      <Route path="/drivers" element={<RequireAuth><DriverSearch /></RequireAuth>} />
      <Route path="/driver/:id" element={<RequireAuth><DriverDetails /></RequireAuth>} />

      <Route path="/bodyguards" element={<RequireAuth><BodyguardSearch /></RequireAuth>} />
      <Route path="/bodyguard/:id" element={<RequireAuth><BodyguardDetails /></RequireAuth>} />

      <Route path="/booking/addons" element={<RequireAuth><AddOnsSelection /></RequireAuth>} />
      <Route path="/booking/driver" element={<RequireAuth><AddOnsSelection /></RequireAuth>} />
      <Route path="/booking/bodyguard" element={<RequireAuth><AddOnsSelection /></RequireAuth>} />
      <Route path="/booking/cart" element={<RequireAuth><ServiceCart /></RequireAuth>} />
      <Route path="/booking/summary" element={<RequireAuth><BookingSummary /></RequireAuth>} />
      <Route path="/booking/payment" element={<RequireAuth><Payment /></RequireAuth>} />
      <Route path="/booking/confirmation" element={<RequireAuth><BookingConfirmation /></RequireAuth>} />

      <Route path="/bookings" element={<RequireAuth><MyBookings /></RequireAuth>} />
      <Route path="/booking/:id" element={<RequireAuth><BookingDetails /></RequireAuth>} />
      <Route path="/booking/:id/cancel" element={<RequireAuth><CancelBooking /></RequireAuth>} />

      <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
      <Route path="/account/profile" element={<RequireAuth><EditProfile /></RequireAuth>} />
      <Route path="/account/payments" element={<RequireAuth><PaymentHistory /></RequireAuth>} />

      <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
    </Routes>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return true
    return !sessionStorage.getItem('hasSeenSplash')
  })

  const handleSplashComplete = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hasSeenSplash', 'true')
    }
    setShowSplash(false)
  }, [])

  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-white">
          {showSplash ? (
            <SplashScreen onComplete={handleSplashComplete} />
          ) : (
            <>
              <AppRoutes />
              <Toaster position="top-center" />
            </>
          )}
        </div>
      </Router>
    </AppProvider>
  )
}

export default App