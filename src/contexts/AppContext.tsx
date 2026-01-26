import React, { createContext, useContext, useState, type ReactNode, useEffect, useMemo, useCallback } from 'react'
import { mockVehicles, mockDrivers, mockBodyguards } from '../data/mockData'
import { apiJson } from '../lib/api'
import { endpoints } from '../lib/endpoints'

export interface Vehicle {
  id: string
  name: string
  category: string
  image: string
  images: string[]
  imageCategories: {
    exterior: string[]
    interior: string[]
    registration: string[]
  }
  vin: string
  seats: number
  fuelType: string
  transmission: string
  features: string[]
  pricePerDay: number
  pricePerHour: number
  pricePerWeek: number
  pricePerMonth: number
  rating: number
  reviewCount: number
  city: string
  ownershipType: 'agent' | 'platform'
  agent?: {
    id: string
    name: string
    image: string
    vehiclesOwned: number
    coverageArea: string[]
    memberSince: string
  }
  year?: number
  vehicleType?: string
  luxuryClass?: string
  description?: string
  isAvailable?: boolean
}

export interface Driver {
  id: string
  name: string
  image: string
  experience: number
  compatibleVehicles: string[]
  pricePerHour: number
  pricePerDay?: number
  pricePerWeek?: number
  pricePerMonth?: number
  rating: number
  reviewCount: number
  city: string
  license: {
    number: string
    class: string
    expiryDate: string
    issuingState: string
  }
  availabilityStatus?: string
  email?: string
  phoneNumber?: string
}

export interface Bodyguard {
  id: string
  name: string
  image: string
  experience: number
  securityLevel: string
  teamSize: number
  teamMembers: {
    name: string
    image: string
    role: string
  }[]
  pricePerHour: number
  rating: number
  city: string
  pricePerDay?: number
  pricePerWeek?: number
  pricePerMonth?: number
  availabilityStatus?: string
}

export interface Booking {
  id: string
  vehicleId?: string
  driverId?: string
  bodyguardId?: string
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  duration?: 'hourly' | 'daily' | 'weekly' | 'monthly'
  driverHours?: number
  bodyguardHours?: number
  totalAmount: number
  status: 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
  refundStatus?: 'pending' | 'approved' | 'processed'
  refundAmount?: number
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  city: string
  profileImage?: string
}

export interface CartItem {
  type: 'vehicle' | 'driver' | 'bodyguard'
  serviceId: string
  duration: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'halfday' | 'fullday'
  startDate: Date
  endDate: Date | null
  startTime: string
  endTime: string
  unitPrice?: number
  quantity?: number
  totalPrice?: number
  currency?: string
  backendItemId?: string
  displayName?: string
  thumbnail?: string
  serviceDetails?: string
  durationDisplay?: string
}

interface BackendCartItem {
  id: string
  itemType: 'VEHICLE' | 'DRIVER' | 'BODYGUARD'
  vehicleId?: string
  driverId?: string
  bodyguardId?: string
  cityId?: string
  startDate: string
  endDate: string | null
  pricingType: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
  duration?: string
  startTime?: string
  endTime?: string
  unitPrice: number
  quantity: number
  totalPrice: number
  currency: string
  status?: string
  displayName?: string
  thumbnail?: string
}

interface BackendCartData {
  id: string
  status: string
  items: BackendCartItem[]
  costBreakdown: {
    vehicle: number
    driver: number
    bodyguard: number
    total: number
  }
  totalPrice: number
  currency: string
}

interface BackendCartResponse {
  statusCode: number
  message: string
  data: BackendCartData
}

interface AppContextType {
  user: User | null
  setUser: (user: User | null) => void
  accessToken: string | null
  setAccessToken: (token: string | null) => void
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  selectedCity: string
  setSelectedCity: (city: string) => void
  bookings: Booking[]
  addBooking: (booking: Booking) => void
  cancelBooking: (bookingId: string, refundAmount: number) => void
  vehicles: Vehicle[]
  upsertVehicles: (items: Vehicle[]) => void
  drivers: Driver[]
  bodyguards: Bodyguard[]
  savedPaymentMethods: PaymentMethod[]
  addPaymentMethod: (method: PaymentMethod) => void
  removePaymentMethod: (id: string) => void
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (type: 'vehicle' | 'driver' | 'bodyguard') => void
  updateCartItem: (item: CartItem) => void
  clearCart: () => void
  loadCart: () => Promise<void>
}

export interface PaymentMethod {
  id: string
  type: 'card'
  last4: string
  brand: string
  isDefault: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

const STORAGE_VERSION = 'v1'

function getLocalStorage(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(`${key}:${STORAGE_VERSION}`) || localStorage.getItem(key)
  } catch {
    return null
  }
}

function setLocalStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${key}:${STORAGE_VERSION}`, value)
  } catch {
    // Storage quota exceeded or disabled
  }
}

function removeLocalStorage(key: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(`${key}:${STORAGE_VERSION}`)
    localStorage.removeItem(key)
  } catch {
    // Storage disabled
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = getLocalStorage('user')
    if (!savedUser) return null
    try {
      return JSON.parse(savedUser)
    } catch {
      return null
    }
  })

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return getLocalStorage('accessToken')
  })

  const [selectedCity, setSelectedCity] = useState('New York')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [savedPaymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'card', last4: '4242', brand: 'Visa', isDefault: true }
  ])

  const isAuthenticated = !!accessToken && !!user

  useEffect(() => {
    if (user) {
      setLocalStorage('user', JSON.stringify(user))
    } else {
      removeLocalStorage('user')
    }
  }, [user])

  useEffect(() => {
    if (accessToken) {
      setLocalStorage('accessToken', accessToken)
    } else {
      removeLocalStorage('accessToken')
    }
  }, [accessToken])

  const login = useCallback((token: string, userData: User) => {
    setLocalStorage('accessToken', token)
    setLocalStorage('user', JSON.stringify(userData))
    setAccessToken(token)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    setAccessToken(null)
    setUser(null)
  }, [])

  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles)
  const drivers = useMemo(() => mockDrivers, [])
  const bodyguards = useMemo(() => mockBodyguards, [])

  const upsertVehicles = useCallback((items: Vehicle[]) => {
    setVehicles(curr => {
      const vehicleMap = new Map(curr.map(v => [v.id, v]))
      items.forEach(item => vehicleMap.set(item.id, item))
      return Array.from(vehicleMap.values())
    })
  }, [])

  const addBooking = useCallback((booking: Booking) => {
    setBookings(curr => [...curr, booking])
  }, [])

  const cancelBooking = useCallback((bookingId: string, refundAmount: number) => {
    setBookings(curr => curr.map(b =>
      b.id === bookingId
        ? { ...b, status: 'cancelled' as const, refundStatus: 'pending' as const, refundAmount }
        : b
    ))
  }, [])

  const addPaymentMethod = useCallback((method: PaymentMethod) => {
    setPaymentMethods(curr => [...curr, method])
  }, [])

  const removePaymentMethod = useCallback((id: string) => {
    setPaymentMethods(curr => curr.filter(m => m.id !== id))
  }, [])

  const [cart, setCart] = useState<CartItem[]>([])

  const transformBackendCartItem = useCallback((item: BackendCartItem): CartItem | null => {
    let type: 'vehicle' | 'driver' | 'bodyguard'
    let serviceId: string

    if (item.itemType === 'VEHICLE' && item.vehicleId) {
      type = 'vehicle'
      serviceId = item.vehicleId
    } else if (item.itemType === 'DRIVER' && item.driverId) {
      type = 'driver'
      serviceId = item.driverId
    } else if (item.itemType === 'BODYGUARD' && item.bodyguardId) {
      type = 'bodyguard'
      serviceId = item.bodyguardId
    } else {
      return null
    }

    let duration: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'halfday' | 'fullday'
    switch (item.pricingType) {
      case 'HOURLY':
        duration = 'hourly'
        break
      case 'DAILY':
        duration = 'daily'
        break
      case 'WEEKLY':
        duration = 'weekly'
        break
      case 'MONTHLY':
        duration = 'monthly'
        break
      default:
        duration = 'daily'
    }

    const startDateObj = new Date(item.startDate)
    const endDateObj = item.endDate ? new Date(item.endDate) : null

    function extractTimeFromISO(isoString: string): string {
      const date = new Date(isoString)
      const hours = String(date.getUTCHours()).padStart(2, '0')
      const minutes = String(date.getUTCMinutes()).padStart(2, '0')
      return `${hours}:${minutes}`
    }

    const endTimeValue = item.endTime || (item.endDate ? extractTimeFromISO(item.endDate) : '17:00')

    let serviceDetails = ''
    if (type === 'vehicle') {
      serviceDetails = `${item.pricingType.toLowerCase()} rental`
    } else if (type === 'driver') {
      serviceDetails = 'Professional driver'
    } else if (type === 'bodyguard') {
      serviceDetails = 'Security service'
    }

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
      displayName: item.displayName,
      thumbnail: item.thumbnail,
      serviceDetails,
      durationDisplay: item.duration,
    }
  }, [])

  const loadCart = useCallback(async (token: string) => {
    if (!token) {
      setCart([])
      return
    }

    try {
      const response = await apiJson<BackendCartResponse>({
        path: endpoints.cart.root,
        token,
      })

      let cartItems: BackendCartItem[] = []

      if (response?.data?.items && Array.isArray(response.data.items)) {
        cartItems = response.data.items
      }

      const transformedCart = cartItems
        .map(transformBackendCartItem)
        .filter((item): item is CartItem => item !== null)

      setCart(transformedCart)
    } catch (error) {
      console.error('Failed to load cart:', error)
      setCart([])
    }
  }, [transformBackendCartItem])

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      loadCart(accessToken)
    } else {
      setCart([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken])

  const addToCart = useCallback((item: CartItem) => {
    setCart(curr => {
      const existingIndex = curr.findIndex(cartItem => cartItem.type === item.type)
      if (existingIndex >= 0) {
        const newCart = [...curr]
        newCart[existingIndex] = item
        return newCart
      }
      return [...curr, item]
    })
  }, [])

  const removeFromCart = useCallback((type: 'vehicle' | 'driver' | 'bodyguard') => {
    setCart(curr => curr.filter(item => item.type !== type))
  }, [])

  const updateCartItem = useCallback((item: CartItem) => {
    setCart(curr => curr.map(cartItem => cartItem.type === item.type ? item : cartItem))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

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
  )
}