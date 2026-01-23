import { apiJson } from './api'
import { endpoints } from './endpoints'
import type { Bodyguard } from '../contexts/AppContext'
import { PricingType, type PricingTypeValue } from './vehicleSearch'

interface ApiPricing {
  amount: number
  currency: string
}

interface ApiBodyguard {
  id: string
  firstName: string
  lastName: string
  yearsOfExperience: number
  securityLevel: string
  profilePhoto?: string
  pricing?: {
    HOURLY?: ApiPricing
    DAILY?: ApiPricing
    WEEKLY?: ApiPricing
    MONTHLY?: ApiPricing
  }
  city?: string
  availabilityStatus?: string
}

interface ApiBodyguardSearchResponse {
  statusCode: number
  message: string
  data: {
    data: ApiBodyguard[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface ApiBodyguardDetail extends ApiBodyguard {
  email?: string
  phoneNumber?: string
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
  teamMembers?: {
    name: string
    role: string
    photo?: string
    experience?: number
    _id?: string
  }[]
  cities?: {
    id: string
    name: string
    country: string
    countryCode: string
  }[]
  availabilityStatus: string
  isActive: boolean
}

interface ApiBodyguardDetailResponse {
  statusCode: number
  message: string
  data: ApiBodyguardDetail
}

export interface BodyguardSearchParams {
  city: string
  startDate: string
  endDate: string
  pricingType: PricingTypeValue
  page?: number
  limit?: number
}

export interface BodyguardSearchResult {
  bodyguards: Bodyguard[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

function mapApiBodyguard(apiBodyguard: ApiBodyguard): Bodyguard {
  const fullName = `${apiBodyguard.firstName} ${apiBodyguard.lastName}`.trim()

  return {
    id: apiBodyguard.id,
    name: fullName || apiBodyguard.firstName || apiBodyguard.lastName || 'Bodyguard',
    image: apiBodyguard.profilePhoto || '',
    experience: apiBodyguard.yearsOfExperience,
    securityLevel: apiBodyguard.securityLevel,
    teamSize: 1,
    teamMembers: [],
    pricePerHour: apiBodyguard.pricing?.HOURLY?.amount || 0,
    rating: 0,
    city: apiBodyguard.city || '',
    availabilityStatus: apiBodyguard.availabilityStatus,
  }
}

export async function searchBodyguards(params: BodyguardSearchParams): Promise<BodyguardSearchResult> {
  const queryParams = new URLSearchParams()

  queryParams.set('city', params.city)
  queryParams.set('startDate', params.startDate)
  queryParams.set('endDate', params.endDate)
  queryParams.set('pricingType', params.pricingType)
  queryParams.set('page', String(params.page || 1))
  queryParams.set('limit', String(params.limit || 10))

  const path = `${endpoints.search.bodyguards}?${queryParams.toString()}`
  const response = await apiJson<ApiBodyguardSearchResponse>({ path })

  const bodyguards = response.data.data.map(mapApiBodyguard)

  return {
    bodyguards,
    total: response.data.total,
    page: response.data.page,
    limit: response.data.limit,
    totalPages: response.data.totalPages,
    hasMore: response.data.page < response.data.totalPages,
  }
}

export async function getBodyguardDetails(id: string): Promise<Bodyguard> {
  const path = endpoints.search.bodyguardDetails(id)
  const response = await apiJson<ApiBodyguardDetailResponse>({ path })
  const apiBodyguard = response.data

  const base = mapApiBodyguard(apiBodyguard)
  const pricing = apiBodyguard.pricingModel?.pricing || apiBodyguard.pricing

  return {
    ...base,
    pricePerHour: pricing?.HOURLY?.amount ?? base.pricePerHour,
    pricePerDay: pricing?.DAILY?.amount ?? base.pricePerDay,
    pricePerWeek: pricing?.WEEKLY?.amount ?? base.pricePerWeek,
    pricePerMonth: pricing?.MONTHLY?.amount ?? base.pricePerMonth,
    city:
      apiBodyguard.cities && apiBodyguard.cities.length > 0
        ? apiBodyguard.cities[0].id
        : base.city,
    availabilityStatus: apiBodyguard.availabilityStatus || base.availabilityStatus,
    teamSize: apiBodyguard.teamMembers?.length || base.teamSize,
    teamMembers:
      apiBodyguard.teamMembers?.map(member => ({
        name: member.name,
        image: member.photo || '',
        role: member.role,
      })) || base.teamMembers,
  }
}

export { PricingType }

