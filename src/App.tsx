import { useState, useEffect, useCallback } from 'react';
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

function AppRoutes() {
  const { user } = useApp();

  return (
    <Routes>
      {/* Auth Routes - redirect to home if already logged in */}
      <Route path="/launch" element={user ? <Navigate to="/" replace /> : <AppLaunch />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/verify-email" element={user ? <Navigate to="/" replace /> : <VerifyEmail />} />
      <Route path="/welcome" element={user ? <Navigate to="/" replace /> : <Welcome />} />

      {/* Home - Services Selection */}
      <Route path="/" element={<Services />} />

      {/* Vehicles */}
      <Route path="/vehicles" element={<VehicleSearch />} />
      <Route path="/vehicle/:id" element={<VehicleDetails />} />

      {/* Drivers */}
      <Route path="/drivers" element={<DriverSearch />} />
      <Route path="/driver/:id" element={<DriverDetails />} />

      {/* Bodyguards */}
      <Route path="/bodyguards" element={<BodyguardSearch />} />
      <Route path="/bodyguard/:id" element={<BodyguardDetails />} />

      {/* Booking Flow */}
      <Route path="/booking/addons" element={<AddOnsSelection />} />
      <Route path="/booking/driver" element={<AddOnsSelection />} />
      <Route path="/booking/bodyguard" element={<AddOnsSelection />} />
      <Route path="/booking/cart" element={<ServiceCart />} />
      <Route path="/booking/summary" element={<BookingSummary />} />
      <Route path="/booking/payment" element={<Payment />} />
      <Route path="/booking/confirmation" element={<BookingConfirmation />} />

      {/* Bookings Management */}
      <Route path="/bookings" element={<MyBookings />} />
      <Route path="/booking/:id" element={<BookingDetails />} />
      <Route path="/booking/:id/cancel" element={<CancelBooking />} />

      {/* Account */}
      <Route path="/account" element={<Account />} />
      <Route path="/account/profile" element={<EditProfile />} />
      <Route path="/account/payments" element={<PaymentHistory />} />

      {/* Default redirect - send to home if logged in, launch if not */}
      <Route path="*" element={<Navigate to={user ? "/" : "/launch"} replace />}
      />
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