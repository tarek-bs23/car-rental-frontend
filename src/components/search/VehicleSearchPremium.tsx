import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../contexts/AppContext'
import { TopBar } from '../layout/TopBar'
import { BottomNav } from '../layout/BottomNav'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import Star from 'lucide-react/dist/esm/icons/star'
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right'
import Shield from 'lucide-react/dist/esm/icons/shield'
import Users from 'lucide-react/dist/esm/icons/users'
import Zap from 'lucide-react/dist/esm/icons/zap'
import { motion } from 'motion/react'

export function VehicleSearch() {
  const navigate = useNavigate()
  const { vehicles, selectedCity } = useApp()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'Sedan', label: 'Sedan' },
    { id: 'SUV', label: 'SUV' },
    { id: 'Sports', label: 'Sports' },
    { id: 'Luxury', label: 'Luxury' },
  ]

  const filteredVehicles = useMemo(() => 
    vehicles.filter(v => {
      if (v.city !== selectedCity) return false
      if (selectedCategory !== 'all' && v.category !== selectedCategory) return false
      return true
    }),
    [vehicles, selectedCity, selectedCategory]
  )

  return (
    <div className="min-h-screen bg-white pb-20">
      <TopBar />
      
      <div className="pt-14">
        <div className="px-6 py-6 border-b border-neutral-100">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-[#d4af37] rounded-full" />
              <h1 className="text-2xl font-bold text-neutral-900">
                Available in {selectedCity}
              </h1>
            </div>
            <p className="text-neutral-600">{filteredVehicles.length} vehicles ready for you</p>
          </div>
        </div>

        <div className="border-b border-neutral-100 bg-white sticky top-14 z-10">
          <div className="px-6 py-4 overflow-x-auto">
            <div className="flex gap-2 max-w-2xl mx-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-5 py-2.5 rounded-full whitespace-nowrap transition-all font-medium ${
                    selectedCategory === category.id
                      ? 'bg-neutral-900 text-white shadow-lg'
                      : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="max-w-2xl mx-auto space-y-4">
            {filteredVehicles.map((vehicle, index) => (
              <motion.button
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                className="w-full group"
              >
                <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-neutral-300 transition-all duration-300">
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                    <ImageWithFallback
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-sm">
                        <Shield className="w-3.5 h-3.5 text-[#b8941f]" />
                        <span className="text-xs font-semibold text-neutral-900">Verified</span>
                      </div>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="bg-neutral-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium">
                        {vehicle.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                        <Star className="w-3.5 h-3.5 fill-[#d4af37] text-[#d4af37]" />
                        <span className="text-xs font-semibold text-neutral-900">{vehicle.rating}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                        <Users className="w-3.5 h-3.5 text-neutral-600" />
                        <span className="text-xs font-medium text-neutral-900">{vehicle.seats}</span>
                      </div>
                      {vehicle.fuelType === 'Electric' ? (
                        <div className="flex items-center gap-1.5 bg-green-500/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                          <Zap className="w-3.5 h-3.5 text-white fill-white" />
                          <span className="text-xs font-medium text-white">Electric</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 mb-1 text-lg group-hover:text-[#b8941f] transition-colors">
                          {vehicle.name}
                        </h3>
                        <p className="text-sm text-neutral-500">{vehicle.transmission} • {vehicle.fuelType}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                      <div>
                        <p className="text-sm text-neutral-500">From</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-neutral-900">${vehicle.pricePerDay}</span>
                          <span className="text-sm text-neutral-500">/day</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-600">
                        <span className="text-xs">{vehicle.reviewCount} reviews</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}

            {filteredVehicles.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">No vehicles available</h3>
                <p className="text-neutral-600">Try adjusting your filters</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

  return (
    <div className="min-h-screen bg-white pb-20">
      <TopBar />
      
      <div className="pt-14">
        {/* Header */}
        <div className="px-6 py-6 border-b border-neutral-100">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-[#d4af37] rounded-full" />
              <h1 className="text-2xl font-bold text-neutral-900">
                Available in {selectedCity}
              </h1>
            </div>
            <p className="text-neutral-600">{filteredVehicles.length} vehicles ready for you</p>
          </div>
        </div>

        {/* Category Filter - Uber-inspired horizontal scroll */}
        <div className="border-b border-neutral-100 bg-white sticky top-14 z-10">
          <div className="px-6 py-4 overflow-x-auto">
            <div className="flex gap-2 max-w-2xl mx-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-5 py-2.5 rounded-full whitespace-nowrap transition-all font-medium ${
                    selectedCategory === category.id
                      ? 'bg-neutral-900 text-white shadow-lg'
                      : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="px-6 py-6">
          <div className="max-w-2xl mx-auto space-y-4">
            {filteredVehicles.map((vehicle, index) => (
              <motion.button
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                className="w-full group"
              >
                <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-neutral-300 transition-all duration-300">
                  {/* Image Section */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                    <ImageWithFallback
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Verified Badge */}
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-sm">
                        <Shield className="w-3.5 h-3.5 text-[#b8941f]" />
                        <span className="text-xs font-semibold text-neutral-900">Verified</span>
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="bg-neutral-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium">
                        {vehicle.category}
                      </span>
                    </div>

                    {/* Quick Stats */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                        <Star className="w-3.5 h-3.5 fill-[#d4af37] text-[#d4af37]" />
                        <span className="text-xs font-semibold text-neutral-900">{vehicle.rating}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                        <Users className="w-3.5 h-3.5 text-neutral-600" />
                        <span className="text-xs font-medium text-neutral-900">{vehicle.seats}</span>
                      </div>
                      {vehicle.fuelType === 'Electric' && (
                        <div className="flex items-center gap-1.5 bg-green-500/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                          <Zap className="w-3.5 h-3.5 text-white fill-white" />
                          <span className="text-xs font-medium text-white">Electric</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 mb-1 text-lg group-hover:text-[#b8941f] transition-colors">
                          {vehicle.name}
                        </h3>
                        <p className="text-sm text-neutral-500">{vehicle.transmission} • {vehicle.fuelType}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                      <div>
                        <p className="text-sm text-neutral-500">From</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-neutral-900">${vehicle.pricePerDay}</span>
                          <span className="text-sm text-neutral-500">/day</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-600">
                        <span className="text-xs">{vehicle.reviewCount} reviews</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}

            {filteredVehicles.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">No vehicles available</h3>
                <p className="text-neutral-600">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
