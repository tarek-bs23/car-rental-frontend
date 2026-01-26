import React, { useState, useEffect, useCallback, PropsWithChildren } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { Toaster } from './components/ui/sonner';
import { SplashScreen } from './components/ui/SplashScreen';


// Auth
import { AppLaunch } from './components/auth/AppLaunch';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { VerifyEmail } from './components/auth/VerifyEmail';
import { Welcome } from './components/auth/Welcome';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { VerifyOtp } from './components/auth/VerifyOtp';
import { ResetPassword } from './components/auth/ResetPassword';

// Home
import { Services } from './components/home/Services';

// Search & Discovery
import { VehicleSearch } from './components/search/VehicleSearch';
import { VehicleDetails } from './components/search/VehicleDetails';

// Drivers
import { DriverSearch } from './components/drivers/DriverSearch';
import { DriverDetails } from './components/drivers/DriverDetails';

// Bodyguards
import { BodyguardSearch } from './components/bodyguards/BodyguardSearch';
import { BodyguardDetails } from './components/bodyguards/BodyguardDetails';

// Booking Flow
import { AddOnsSelection } from './components/booking/AddOnsSelection';
import { ServiceCart } from './components/booking/ServiceCart';
import { BookingSummary } from './components/booking/BookingSummary';
import { Payment } from './components/booking/Payment';
import { BookingConfirmation } from './components/booking/Confirmation';

// Bookings Management
import { MyBookings } from './components/bookings/MyBookings';
import { BookingDetails } from './components/bookings/BookingDetails';
import { CancelBooking } from './components/bookings/CancelBooking';

// Account
import { Account } from './components/account/Account';
import { EditProfile } from './components/account/EditProfile';
import { PaymentHistory } from './components/account/PaymentHistory';

function RequireAuth({ children }: PropsWithChildren) {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/launch" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useApp();

  return (
    <Routes>
      {/* Public Auth Routes - redirect to home if already logged in */}
      <Route path="/launch" element={isAuthenticated ? <Navigate to="/" replace /> : <AppLaunch />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/verify-email" element={isAuthenticated ? <Navigate to="/" replace /> : <VerifyEmail />} />
      <Route path="/welcome" element={isAuthenticated ? <Navigate to="/" replace /> : <Welcome />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />} />
      <Route path="/verify-otp" element={isAuthenticated ? <Navigate to="/" replace /> : <VerifyOtp />} />
      <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/" replace /> : <ResetPassword />} />

      {/* Protected Routes */}
      {/* Home - Services Selection */}
      <Route path="/" element={<RequireAuth><Services /></RequireAuth>} />

      {/* Vehicles */}
      <Route path="/vehicles" element={<RequireAuth><VehicleSearch /></RequireAuth>} />
      <Route path="/vehicle/:id" element={<RequireAuth><VehicleDetails /></RequireAuth>} />

      {/* Drivers */}
      <Route path="/drivers" element={<RequireAuth><DriverSearch /></RequireAuth>} />
      <Route path="/driver/:id" element={<RequireAuth><DriverDetails /></RequireAuth>} />

      {/* Bodyguards */}
      <Route path="/bodyguards" element={<RequireAuth><BodyguardSearch /></RequireAuth>} />
      <Route path="/bodyguard/:id" element={<RequireAuth><BodyguardDetails /></RequireAuth>} />

      {/* Booking Flow */}
      <Route path="/booking/addons" element={<RequireAuth><AddOnsSelection /></RequireAuth>} />
      <Route path="/booking/driver" element={<RequireAuth><AddOnsSelection /></RequireAuth>} />
      <Route path="/booking/bodyguard" element={<RequireAuth><AddOnsSelection /></RequireAuth>} />
      <Route path="/booking/cart" element={<RequireAuth><ServiceCart /></RequireAuth>} />
      <Route path="/booking/summary" element={<RequireAuth><BookingSummary /></RequireAuth>} />
      <Route path="/booking/payment" element={<RequireAuth><Payment /></RequireAuth>} />
      <Route path="/booking/confirmation" element={<RequireAuth><BookingConfirmation /></RequireAuth>} />

      {/* Bookings Management */}
      <Route path="/bookings" element={<RequireAuth><MyBookings /></RequireAuth>} />
      <Route path="/booking/:id" element={<RequireAuth><BookingDetails /></RequireAuth>} />
      <Route path="/booking/:id/cancel" element={<RequireAuth><CancelBooking /></RequireAuth>} />

      {/* Account */}
      <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
      <Route path="/account/profile" element={<RequireAuth><EditProfile /></RequireAuth>} />
      <Route path="/account/payments" element={<RequireAuth><PaymentHistory /></RequireAuth>} />

      {/* Default redirect - send to home if logged in, launch if not */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/launch"} replace />} />
    </Routes>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  }, []);

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
  );
}

export default App;