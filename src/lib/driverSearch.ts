import { apiJson } from './api'
import { endpoints } from './endpoints'
import type { Driver } from '../contexts/AppContext'
import { PricingType, type PricingTypeValue } from './vehicleSearch'

interface ApiPricing {
  amount: number
  currency: string
}

interface ApiDriver {
  id: string
  firstName: string
  lastName: string
  yearsOfExperience: number
  compatibleVehicleTypes: string[]
  profilePhoto?: string
  pricing: {
    HOURLY?: ApiPricing
    DAILY?: ApiPricing
    WEEKLY?: ApiPricing
    MONTHLY?: ApiPricing
  }
  city: string
  availabilityStatus?: string
  email?: string
  phoneNumber?: string
}

interface ApiDriverSearchResponse {
  statusCode: number
  message: string
  data: {
    data: ApiDriver[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface ApiDriverDetailResponse {
  statusCode: number
  message: string
  data: ApiDriver & {
    licenseNumber?: string
    pricingModel?: {
      id: string
      name: string
      description?: string
      pricing: {
        HOURLY?: ApiPricing
        DAILY?: ApiPricing
        WEEKLY?: ApiPricing
        MONTHLY?: ApiPricing
      }
    }
    city: {
      id: string
      name: string
      country: string
      countryCode: string
    }
    availabilityStatus: string
    isActive: boolean
  }
}

export interface DriverSearchParams {
  city: string
  startDate: string
  endDate: string
  pricingType: PricingTypeValue
  page?: number
  limit?: number
}

export interface DriverSearchResult {
  drivers: Driver[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

function mapApiDriverBase(apiDriver: ApiDriver): Driver {
  const fullName = `${apiDriver.firstName} ${apiDriver.lastName}`.trim()

  return {
    id: apiDriver.id,
    name: fullName || apiDriver.firstName || apiDriver.lastName || 'Driver',
    image: apiDriver.profilePhoto || '',
    experience: apiDriver.yearsOfExperience,
    compatibleVehicles: apiDriver.compatibleVehicleTypes || [],
    pricePerHour: apiDriver.pricing?.HOURLY?.amount || 0,
    pricePerDay: apiDriver.pricing?.DAILY?.amount,
    pricePerWeek: apiDriver.pricing?.WEEKLY?.amount,
    pricePerMonth: apiDriver.pricing?.MONTHLY?.amount,
    rating: 0,
    reviewCount: 0,
    city: apiDriver.city,
    license: {
      number: '',
      class: 'Professional',
      expiryDate: 'N/A',
      issuingState: 'N/A',
    },
    availabilityStatus: apiDriver.availabilityStatus,
    email: apiDriver.email,
    phoneNumber: apiDriver.phoneNumber,
  }
}

export async function searchDrivers(params: DriverSearchParams): Promise<DriverSearchResult> {
  const queryParams = new URLSearchParams()

  queryParams.set('city', params.city)
  queryParams.set('startDate', params.startDate)
  queryParams.set('endDate', params.endDate)
  queryParams.set('pricingType', params.pricingType)
  queryParams.set('page', String(params.page || 1))
  queryParams.set('limit', String(params.limit || 10))

  const path = `${endpoints.search.drivers}?${queryParams.toString()}`
  const response = await apiJson<ApiDriverSearchResponse>({ path })

  const drivers = response.data.data.map(mapApiDriverBase)

  return {
    drivers,
    total: response.data.total,
    page: response.data.page,
    limit: response.data.limit,
    totalPages: response.data.totalPages,
    hasMore: response.data.page < response.data.totalPages,
  }
}

export async function getDriverDetails(id: string): Promise<Driver> {
  const path = endpoints.search.driverDetails(id)
  const response = await apiJson<ApiDriverDetailResponse>({ path })
  const apiDriver = response.data

  const base = mapApiDriverBase(apiDriver)

  const pricing = apiDriver.pricingModel?.pricing || apiDriver.pricing

  return {
    ...base,
    pricePerHour: pricing?.HOURLY?.amount ?? base.pricePerHour,
    pricePerDay: pricing?.DAILY?.amount ?? base.pricePerDay,
    pricePerWeek: pricing?.WEEKLY?.amount ?? base.pricePerWeek,
    pricePerMonth: pricing?.MONTHLY?.amount ?? base.pricePerMonth,
    city: apiDriver.city?.id || base.city,
    availabilityStatus: apiDriver.availabilityStatus || base.availabilityStatus,
    license: {
      number: apiDriver.licenseNumber || base.license.number,
      class: apiDriver.pricingModel?.name || base.license.class,
      expiryDate: base.license.expiryDate,
      issuingState: apiDriver.city?.countryCode || base.license.issuingState,
    },
  }
}

export { PricingType }

