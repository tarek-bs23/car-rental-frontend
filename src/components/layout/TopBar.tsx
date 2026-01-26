import MapPin from 'lucide-react/dist/esm/icons/map-pin'
import Bell from 'lucide-react/dist/esm/icons/bell'
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart'
import { useApp } from '../../contexts/AppContext'
import { useNavigate } from 'react-router-dom'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { useState, useEffect } from 'react'
import { apiJson } from '../../lib/api'
import { endpoints } from '../../lib/endpoints'

interface City {
  id: string
  name: string
}

interface CitiesResponse {
  statusCode: number
  message: string
  data: City[]
}

export function TopBar() {
  const { selectedCity, setSelectedCity, cart, user } = useApp()
  const navigate = useNavigate()
  const [cities, setCities] = useState<City[]>([])
  const [isCitiesLoading, setIsCitiesLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadCities() {
      setIsCitiesLoading(true)

      try {
        const response = await apiJson<CitiesResponse>({
          path: endpoints.auth.publicCities,
          skipAuth: true,
        })

        if (!isMounted) return

        setCities(response.data || [])
      } catch (error) {
        if (!isMounted) return
        console.error('Failed to load cities:', error)
      } finally {
        if (!isMounted) return
        setIsCitiesLoading(false)
      }
    }

    loadCities()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (cities.length === 0 || isCitiesLoading) return

    const currentCity = cities.find(city => city.id === selectedCity)
    if (currentCity) return

    if (user?.city) {
      const userCityExists = cities.find(city => city.id === user.city)
      if (userCityExists) {
        setSelectedCity(user.city)
        return
      }
    }

    const cityByName = cities.find(city => city.name === selectedCity)
    const defaultCity = cityByName || cities[0]
    if (defaultCity) {
      setSelectedCity(defaultCity.id)
    }
  }, [cities, isCitiesLoading, user?.city, selectedCity, setSelectedCity])

  const cartCount = cart.length

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
        <div className="flex items-center gap-2 flex-1">
          <MapPin className="w-5 h-5 text-blue-600" />
          <Select value={selectedCity} onValueChange={(cityId) => setSelectedCity(cityId)}>
            <SelectTrigger className="border-0 shadow-none p-0 h-auto focus:ring-0">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {isCitiesLoading ? (
                <SelectItem value="loading" disabled>Loading cities...</SelectItem>
              ) : (
                cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate('/booking/cart')}
            className="p-2 hover:bg-gray-100 rounded-full relative"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {cartCount > 0 ? (
              <span className="absolute top-0 right-0 w-5 h-5 bg-[#d4af37] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            ) : null}
          </button>

          <button className="p-2 hover:bg-gray-100 rounded-full relative">
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  )
}