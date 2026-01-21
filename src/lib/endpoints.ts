const API_VERSION = '/api/v1'

export const endpoints = {
  auth: {
    registerUser: `${API_VERSION}/auth/user/register`,
    loginUser: `${API_VERSION}/auth/user/login`,
    forgotPassword: `${API_VERSION}/auth/user/forgot-password`,
    verifyOtp: `${API_VERSION}/auth/user/verify-otp`,
    resetPassword: `${API_VERSION}/auth/user/reset-password`,
    profile: `${API_VERSION}/auth/user/profile`,
    logout: `${API_VERSION}/auth/user/logout`,
    publicCities: `${API_VERSION}/auth/public/cities`,
  },
  bookings: {
    history: `${API_VERSION}/booking/history`,
  },
  search: {
    vehicles: `${API_VERSION}/search/vehicles`,
    vehicleDetails: (id: string) => `${API_VERSION}/search/vehicles/${id}`,
    drivers: `${API_VERSION}/search/drivers`,
    driverDetails: (id: string) => `${API_VERSION}/search/drivers/${id}`,
    bodyguards: `${API_VERSION}/search/bodyguards`,
    bodyguardDetails: (id: string) => `${API_VERSION}/search/bodyguards/${id}`,
  },
  cart: {
    root: `${API_VERSION}/cart`,
    items: `${API_VERSION}/cart/items`,
  },
  checkout: `${API_VERSION}/checkout`,
  checkoutConfirm: `${API_VERSION}/checkout/confirm`,
  checkoutById: (intentId: string) => `${API_VERSION}/checkout/${intentId}`,
}


