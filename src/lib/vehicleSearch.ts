import { apiJson } from './api'
import { endpoints } from './endpoints'
import type { Vehicle } from '../contexts/AppContext'

export const PricingType = {
  HOURLY: 'HOURLY',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
} as const

export type PricingTypeValue = (typeof PricingType)[keyof typeof PricingType]

export const VehicleType = {
  SEDAN: 'SEDAN',
  SUV: 'SUV',
  HATCHBACK: 'HATCHBACK',
  VAN: 'VAN',
  TRUCK: 'TRUCK',
  LUXURY: 'LUXURY',
  ELECTRIC: 'ELECTRIC',
  CONVERTIBLE: 'CONVERTIBLE',
  PICKUP: 'PICKUP',
} as const

export type VehicleTypeValue = (typeof VehicleType)[keyof typeof VehicleType]

export const FuelType = {
  PETROL: 'PETROL',
  DIESEL: 'DIESEL',
  HYBRID: 'HYBRID',
  ELECTRIC: 'ELECTRIC',
  CNG: 'CNG',
  LPG: 'LPG',
} as const

export const LuxuryClass = {
  STANDARD: 'STANDARD',
  PREMIUM: 'PREMIUM',
  LUXURY: 'LUXURY',
  ELITE: 'ELITE',
} as const

interface ApiPricing {
  amount: number
  currency: string
}

interface ApiVehicle {
  _id: string
  make: string
  vehicleModel: string
  year: number
  vehicleType: string
  seatingCapacity: number
  fuelType: string
  luxuryClass?: string
  description?: string
  photos: string[]
  pricing: {
    HOURLY?: ApiPricing
    DAILY?: ApiPricing
    WEEKLY?: ApiPricing
    MONTHLY?: ApiPricing
  }
  cities: string[]
  isAvailable: boolean
}

interface ApiVehicleSearchResponse {
  statusCode: number
  message: string
  data: {
    data: ApiVehicle[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface ApiVehicleDetailResponse {
  statusCode: number
  message: string
  data: ApiVehicle
}

export interface VehicleSearchParams {
  city: string
  startDate: string
  endDate: string
  pricingType: PricingTypeValue
  vehicleType?: VehicleTypeValue
  minPrice?: number
  maxPrice?: number
  seatingCapacity?: number
  fuelType?: string
  luxuryClass?: string
  page?: number
  limit?: number
}

export interface VehicleSearchResult {
  vehicles: Vehicle[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

function mapApiVehicleToVehicle(apiVehicle: ApiVehicle): Vehicle {
  const name = `${apiVehicle.make} ${apiVehicle.vehicleModel}`
  const photos = apiVehicle.photos || []

  return {
    id: apiVehicle._id,
    name,
    category: apiVehicle.vehicleType || 'Unknown',
    image: photos[0] || '',
    images: photos,
    imageCategories: {
      exterior: photos.slice(0, Math.ceil(photos.length / 2)),
      interior: photos.slice(Math.ceil(photos.length / 2)),
      registration: [],
    },
    vin: '',
    seats: apiVehicle.seatingCapacity || 4,
    fuelType: apiVehicle.fuelType || 'Unknown',
    transmission: 'Automatic',
    features: [],
    pricePerDay: apiVehicle.pricing?.DAILY?.amount || 0,
    pricePerHour: apiVehicle.pricing?.HOURLY?.amount || 0,
    pricePerWeek: apiVehicle.pricing?.WEEKLY?.amount || 0,
    pricePerMonth: apiVehicle.pricing?.MONTHLY?.amount || 0,
    rating: 0,
    reviewCount: 0,
    city: apiVehicle.cities[0] || '',
    ownershipType: 'platform',
    year: apiVehicle.year,
    vehicleType: apiVehicle.vehicleType,
    luxuryClass: apiVehicle.luxuryClass,
    description: apiVehicle.description,
    isAvailable: apiVehicle.isAvailable,
  }
}

export async function searchVehicles(params: VehicleSearchParams): Promise<VehicleSearchResult> {
  const queryParams = new URLSearchParams()

  queryParams.set('city', params.city)
  queryParams.set('startDate', params.startDate)
  queryParams.set('endDate', params.endDate)
  queryParams.set('pricingType', params.pricingType)

  if (params.vehicleType) queryParams.set('vehicleType', params.vehicleType)
  if (params.minPrice !== undefined) queryParams.set('minPrice', String(params.minPrice))
  if (params.maxPrice !== undefined) queryParams.set('maxPrice', String(params.maxPrice))
  if (params.seatingCapacity !== undefined) queryParams.set('seatingCapacity', String(params.seatingCapacity))
  if (params.fuelType) queryParams.set('fuelType', params.fuelType)
  if (params.luxuryClass) queryParams.set('luxuryClass', params.luxuryClass)

  queryParams.set('page', String(params.page || 1))
  queryParams.set('limit', String(params.limit || 10))

  const path = `${endpoints.search.vehicles}?${queryParams.toString()}`
  const response = await apiJson<ApiVehicleSearchResponse>({ path })

  const vehicles = response.data.data.map(mapApiVehicleToVehicle)

  return {
    vehicles,
    total: response.data.total,
    page: response.data.page,
    limit: response.data.limit,
    totalPages: response.data.totalPages,
    hasMore: response.data.page < response.data.totalPages,
  }
}

export async function getVehicleDetails(id: string): Promise<Vehicle> {
  const path = endpoints.search.vehicleDetails(id)
  const response = await apiJson<ApiVehicleDetailResponse>({ path })

  return mapApiVehicleToVehicle(response.data)
}
