import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { mockVehicles, mockDrivers, mockBodyguards } from '../data/mockData';
import { apiJson } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export interface Vehicle {
  id: string;
  name: string;
  category: string;
  image: string;
  images: string[];
  imageCategories: {
    exterior: string[];
    interior: string[];
    registration: string[];
  };
  vin: string;
  seats: number;
  fuelType: string;
  transmission: string;
  features: string[];
  pricePerDay: number;
  pricePerHour: number;
  pricePerWeek: number;
  pricePerMonth: number;
  rating: number;
  reviewCount: number;
  city: string;
  ownershipType: 'agent' | 'platform';
  agent?: {
    id: string;
    name: string;
    image: string;
    vehiclesOwned: number;
    coverageArea: string[];
    memberSince: string;
  };
  year?: number;
  vehicleType?: string;
  luxuryClass?: string;
  description?: string;
  isAvailable?: boolean;
}

export interface Driver {
  id: string;
  name: string;
  image: string;
  experience: number;
  compatibleVehicles: string[];
  pricePerHour: number;
  rating: number;
  reviewCount: number;
  city: string;
  license: {
    number: string;
    class: string;
    expiryDate: string;
    issuingState: string;
  };
}

export interface Bodyguard {
  id: string;
  name: string;
  image: string;
  experience: number;
  securityLevel: string;
  teamSize: number;
  teamMembers: {
    name: string;
    image: string;
    role: string;
  }[];
  pricePerHour: number;
  rating: number;
  city: string;
}

export interface Booking {
  id: string;
  vehicleId?: string;
  driverId?: string;
  bodyguardId?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  duration?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  driverHours?: number;
  bodyguardHours?: number;
  totalAmount: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  refundStatus?: 'pending' | 'approved' | 'processed';
  refundAmount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  profileImage?: string;
}

export interface CartItem {
  type: 'vehicle' | 'driver' | 'bodyguard';
  serviceId: string;
  duration: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'halfday' | 'fullday';
  startDate: Date;
  endDate: Date | null;
  startTime: string;
  endTime: string;
  // Pricing information from backend cart (optional so existing client-only usages still type-check)
  unitPrice?: number;
  quantity?: number;
  totalPrice?: number;
  currency?: string;
  backendItemId?: string;
}

interface BackendCartItem {
  id: string;
  itemType: 'VEHICLE' | 'DRIVER' | 'BODYGUARD';
  vehicleId?: string;
  driverId?: string;
  bodyguardId?: string;
  startDate: string;
  endDate: string | null;
  pricingType: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  startTime?: string;
  endTime?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  currency: string;
}

interface BackendCartData {
  id: string;
  status: string;
  items: BackendCartItem[];
  costBreakdown: {
    vehicle: number;
    driver: number;
    bodyguard: number;
    total: number;
  };
  totalPrice: number;
  currency: string;
}

interface BackendCartResponse {
  statusCode: number;
  message: string;
  data: BackendCartData;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string, refundAmount: number) => void;
  vehicles: Vehicle[];
  upsertVehicles: (items: Vehicle[]) => void;
  drivers: Driver[];
  bodyguards: Bodyguard[];
  savedPaymentMethods: PaymentMethod[];
  addPaymentMethod: (method: PaymentMethod) => void;
  removePaymentMethod: (id: string) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (type: 'vehicle' | 'driver' | 'bodyguard') => void;
  updateCartItem: (item: CartItem) => void;
  clearCart: () => void;
  loadCart: () => Promise<void>;
}

export interface PaymentMethod {
  id: string;
  type: 'card';
  last4: string;
  brand: string;
  isDefault: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('accessToken');
  });

  const [selectedCity, setSelectedCity] = useState('New York');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [savedPaymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'card', last4: '4242', brand: 'Visa', isDefault: true }
  ]);

  const isAuthenticated = useMemo(() => !!accessToken && !!user, [accessToken, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    } else {
      localStorage.removeItem('accessToken');
    }
  }, [accessToken]);

  const login = useCallback((token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const drivers = useMemo(() => mockDrivers, []);
  const bodyguards = useMemo(() => mockBodyguards, []);

  const upsertVehicles = useCallback((items: Vehicle[]) => {
    setVehicles(prev => {
      const vehicleMap = new Map(prev.map(v => [v.id, v]));
      items.forEach(item => vehicleMap.set(item.id, item));
      return Array.from(vehicleMap.values());
    });
  }, []);

  const addBooking = useCallback((booking: Booking) => {
    setBookings(prev => [...prev, booking]);
  }, []);

  const cancelBooking = useCallback((bookingId: string, refundAmount: number) => {
    setBookings(prev => prev.map(b =>
      b.id === bookingId
        ? { ...b, status: 'cancelled' as const, refundStatus: 'pending' as const, refundAmount }
        : b
    ));
  }, []);

  const addPaymentMethod = useCallback((method: PaymentMethod) => {
    setPaymentMethods(prev => [...prev, method]);
  }, []);

  const removePaymentMethod = useCallback((id: string) => {
    setPaymentMethods(prev => prev.filter(m => m.id !== id));
  }, []);

  const [cart, setCart] = useState<CartItem[]>([]);

  const transformBackendCartItem = useCallback((item: BackendCartItem): CartItem | null => {
    let type: 'vehicle' | 'driver' | 'bodyguard';
    let serviceId: string;

    if (item.itemType === 'VEHICLE' && item.vehicleId) {
      type = 'vehicle';
      serviceId = item.vehicleId;
    } else if (item.itemType === 'DRIVER' && item.driverId) {
      type = 'driver';
      serviceId = item.driverId;
    } else if (item.itemType === 'BODYGUARD' && item.bodyguardId) {
      type = 'bodyguard';
      serviceId = item.bodyguardId;
    } else {
      return null;
    }

    let duration: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'halfday' | 'fullday';
    switch (item.pricingType) {
      case 'HOURLY':
        duration = 'hourly';
        break;
      case 'DAILY':
        duration = 'daily';
        break;
      case 'WEEKLY':
        duration = 'weekly';
        break;
      case 'MONTHLY':
        duration = 'monthly';
        break;
      default:
        duration = 'daily';
    }

    const startDateObj = new Date(item.startDate);
    const endDateObj = item.endDate ? new Date(item.endDate) : null;

    const extractTimeFromISO = (isoString: string): string => {
      const date = new Date(isoString);
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    const endTimeValue = item.endTime || (item.endDate ? extractTimeFromISO(item.endDate) : '17:00');

    return {
      type,
      serviceId,
      duration,
      startDate: startDateObj,
      endDate: endDateObj,
      startTime: item.startTime || extractTimeFromISO(item.startDate),
      endTime: endTimeValue,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      currency: item.currency,
      backendItemId: item.id,
    };
  }, []);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart([]);
      return;
    }

    try {
      const response = await apiJson<BackendCartResponse>({
        path: endpoints.cart.root,
      });

      let cartItems: BackendCartItem[] = [];

      if (response?.data?.items && Array.isArray(response.data.items)) {
        cartItems = response.data.items;
      }

      const transformedCart = cartItems
        .map(transformBackendCartItem)
        .filter((item): item is CartItem => item !== null);

      setCart(transformedCart);
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCart([]);
    }
  }, [isAuthenticated, transformBackendCartItem]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setCart([]);
    }
  }, [isAuthenticated, loadCart]);

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(cartItem => cartItem.type === item.type);
      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex] = item;
        return newCart;
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((type: 'vehicle' | 'driver' | 'bodyguard') => {
    setCart(prev => prev.filter(item => item.type !== type));
  }, []);

  const updateCartItem = useCallback((item: CartItem) => {
    setCart(prev => prev.map(cartItem => cartItem.type === item.type ? item : cartItem));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        accessToken,
        setAccessToken,
        isAuthenticated,
        login,
        logout,
        selectedCity,
        setSelectedCity,
        bookings,
        addBooking,
        cancelBooking,
        vehicles,
        upsertVehicles,
        drivers,
        bodyguards,
        savedPaymentMethods,
        addPaymentMethod,
        removePaymentMethod,
        cart,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        loadCart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};