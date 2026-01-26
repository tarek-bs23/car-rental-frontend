import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../contexts/AppContext'
import { TopBar } from '../layout/TopBar'
import { BottomNav } from '../layout/BottomNav'
import { Button } from '../ui/button'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import Star from 'lucide-react/dist/esm/icons/star'
import Award from 'lucide-react/dist/esm/icons/award'
import Clock from 'lucide-react/dist/esm/icons/clock'
import Calendar from 'lucide-react/dist/esm/icons/calendar'
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right'
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2'
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle'
import X from 'lucide-react/dist/esm/icons/x'
import Loader2 from 'lucide-react/dist/esm/icons/loader-2'
import { format, addDays } from 'date-fns'
import { motion } from 'motion/react'
import { Calendar as CalendarComponent } from '../ui/calendar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet'
import { searchDrivers, PricingType } from '../../lib/driverSearch'
import type { Driver } from '../../contexts/AppContext'
import { toast } from 'sonner'

export function DriverSearch() {
  const navigate = useNavigate()
  const { selectedCity } = useApp()
  const [selectedDuration, setSelectedDuration] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily')

  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [startTime, setStartTime] = useState<string>('10:00')
  const [endTime, setEndTime] = useState<string>('18:00')
  const [showDatePicker, setShowDatePicker] = useState(false)

  const [results, setResults] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [datesApplied, setDatesApplied] = useState(false)
  const [total, setTotal] = useState(0)

  const durations = [
    { id: 'hourly', label: 'Hourly', icon: Clock, description: 'Short trips' },
    { id: 'daily', label: 'Daily', icon: Calendar, description: '1-6 days' },
    { id: 'weekly', label: 'Weekly', icon: Calendar, description: '7 days' },
    { id: 'monthly', label: 'Monthly', icon: Calendar, description: '30 days' },
  ]

  function checkDriverAvailability(driverId: string, start: Date, end: Date) {
    const unavailableDrivers = ['2', '4']
    const hasConflict = unavailableDrivers.includes(driverId)

    if (hasConflict) {
      const conflictDay = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) / 2)
      return {
        available: false,
        conflictDate: addDays(start, conflictDay)
      }
    }

    return { available: true, conflictDate: null }
  }

  function getBookingPeriod() {
    if (!startDate) return null

    switch (selectedDuration) {
      case 'hourly':
        return {
          start: startDate,
          end: startDate
        }
      case 'daily':
        return {
          start: startDate,
          end: endDate || startDate
        }
      case 'weekly':
        return {
          start: startDate,
          end: addDays(startDate, 7)
        }
      case 'monthly':
        return {
          start: startDate,
          end: addDays(startDate, 30)
        }
    }
  }

  const buildSearchDates = useCallback(() => {
    const period = getBookingPeriod()
    if (!period) return null

    let startISO: string
    let endISO: string

    if (selectedDuration === 'hourly') {
      const [startHour, startMin] = startTime.split(':').map(Number)
      const [endHour, endMin] = endTime.split(':').map(Number)
      const start = new Date(period.start)
      start.setHours(startHour, startMin, 0, 0)
      const end = new Date(period.start)
      end.setHours(endHour, endMin, 0, 0)
      startISO = start.toISOString()
      endISO = end.toISOString()
    } else {
      startISO = period.start.toISOString()
      endISO = period.end.toISOString()
    }

    return { startISO, endISO }
  }, [selectedDuration, startTime, endTime])

  const getPricingType = useCallback(() => {
    switch (selectedDuration) {
      case 'hourly': return PricingType.HOURLY
      case 'daily': return PricingType.DAILY
      case 'weekly': return PricingType.WEEKLY
      case 'monthly': return PricingType.MONTHLY
    }
  }, [selectedDuration])

  const fetchDrivers = useCallback(async () => {
    const dates = buildSearchDates()
    if (!selectedCity || !dates) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await searchDrivers({
        city: selectedCity,
        startDate: dates.startISO,
        endDate: dates.endISO,
        pricingType: getPricingType(),
        page: 1,
        limit: 20,
      })

      setResults(result.drivers)
      setTotal(result.total ?? result.drivers.length)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load drivers'
      setError(message)
      setResults([])
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [selectedCity, buildSearchDates, getPricingType])

  function handleApplyDates() {
    if (!startDate || (selectedDuration === 'daily' && !endDate)) return

    setShowDatePicker(false)
    setDatesApplied(true)
    setResults([])
    setError(null)

    fetchDrivers()
  }

  const sortedDrivers = startDate ? [...results].sort((a, b) => {
    const period = getBookingPeriod()
    if (!period) return 0

    const aAvailability = checkDriverAvailability(a.id, period.start, period.end)
    const bAvailability = checkDriverAvailability(b.id, period.start, period.end)

    if (aAvailability.available && !bAvailability.available) return -1
    if (!aAvailability.available && bAvailability.available) return 1
    return 0
  }) : results

  function getPrice(driver: Driver) {
    const period = getBookingPeriod()
    if (!period || !startDate) {
      return { amount: driver.pricePerHour, unit: '/hr' }
    }

    switch (selectedDuration) {
      case 'hourly':
        const [startHr, startMin] = startTime.split(':').map(Number)
        const [endHr, endMin] = endTime.split(':').map(Number)
        const hours = (endHr - startHr) + (endMin - startMin) / 60
        return { amount: Math.ceil(driver.pricePerHour * hours), unit: '' }
      case 'daily':
        const days = endDate ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1) : 1
        return { amount: driver.pricePerHour * 8 * days, unit: '' }
      case 'weekly':
        return { amount: driver.pricePerHour * 8 * 7, unit: '' }
      case 'monthly':
        return { amount: driver.pricePerHour * 8 * 30, unit: '' }
      default:
        return { amount: driver.pricePerHour, unit: '/hr' }
    }
  }

  function handleDurationChange(newDuration: 'hourly' | 'daily' | 'weekly' | 'monthly') {
    setSelectedDuration(newDuration)
    setStartDate(undefined)
    setEndDate(undefined)
    setDatesApplied(false)
    setResults([])
    setError(null)
    setShowDatePicker(false)
  }

  function formatBookingPeriod() {
    if (!startDate) return 'Select dates'

    const period = getBookingPeriod()
    if (!period) return 'Select dates'

    if (selectedDuration === 'hourly') {
      return `${format(startDate, 'MMM d')} • ${startTime} - ${endTime}`
    } else if (selectedDuration === 'daily') {
      if (endDate) {
        return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`
      }
      return format(startDate, 'MMM d, yyyy')
    } else if (selectedDuration === 'weekly') {
      return `${format(period.start, 'MMM d')} - ${format(period.end, 'MMM d')}`
    } else {
      return `${format(period.start, 'MMM d')} - ${format(period.end, 'MMM d')}`
    }
  }

  const hasSelectedDates = startDate !== undefined

  return (
    <div className="min-h-screen bg-white pb-20">
      <TopBar />

      <div className="pt-14">
        {/* Header */}
        <div className="px-6 py-6 border-b border-neutral-100">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-green-600 rounded-full" />
              <h1 className="text-2xl font-bold text-neutral-900">
                Book a Driver
              </h1>
            </div>
            <p className="text-neutral-600">Select your service period to see available drivers</p>
          </div>
        </div>

        {/* Duration Filter - Premium Design */}
        <div className="border-b border-neutral-100 bg-gradient-to-br from-neutral-50 to-white sticky top-14 z-10 shadow-sm">
          <div className="px-6 py-5">
            <div className="max-w-2xl mx-auto">
              <p className="text-sm font-semibold text-neutral-700 mb-3">Service Duration</p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {durations.map((duration) => {
                  const Icon = duration.icon;
                  const isSelected = selectedDuration === duration.id;
                  return (
                    <button
                      key={duration.id}
                      onClick={() => handleDurationChange(duration.id as any)}
                      className={`p-3 rounded-xl border-2 transition-all ${isSelected
                        ? 'border-green-600 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
                        }`}
                    >
                      <Icon className={`w-5 h-5 mb-1.5 mx-auto ${isSelected ? 'text-green-600' : 'text-neutral-500'
                        }`} />
                      <p className={`text-xs font-semibold mb-0.5 ${isSelected ? 'text-neutral-900' : 'text-neutral-700'
                        }`}>
                        {duration.label}
                      </p>
                      <p className={`text-[10px] ${isSelected ? 'text-neutral-600' : 'text-neutral-500'
                        }`}>
                        {duration.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Date Selection Button */}
              <button
                onClick={() => setShowDatePicker(true)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${hasSelectedDates
                  ? 'border-green-600 bg-gradient-to-br from-green-50 to-emerald-50'
                  : 'border-neutral-300 bg-white hover:border-green-600 hover:shadow-md'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${hasSelectedDates ? 'bg-green-600' : 'bg-neutral-100'
                      }`}>
                      <Calendar className={`w-6 h-6 ${hasSelectedDates ? 'text-white' : 'text-neutral-500'
                        }`} />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 font-medium mb-0.5">
                        {selectedDuration === 'hourly' && 'Select Date & Time'}
                        {selectedDuration === 'daily' && 'Select Dates'}
                        {selectedDuration === 'weekly' && 'Select Start Date (7 days)'}
                        {selectedDuration === 'monthly' && 'Select Start Date (30 days)'}
                      </p>
                      <p className={`font-semibold ${hasSelectedDates ? 'text-neutral-900' : 'text-neutral-500'
                        }`}>
                        {formatBookingPeriod()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </div>
              </button>

              {/* Clear Selection */}
              {hasSelectedDates && (
                <button
                  onClick={() => {
                    setStartDate(undefined);
                    setEndDate(undefined);
                    setDatesApplied(false);
                    setResults([]);
                    setError(null);
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear dates
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Driver Grid or Empty State */}
        <div className="px-6 py-6">
          <div className="max-w-2xl mx-auto">
            {!hasSelectedDates ? (
              // Empty state - no dates selected
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Select Your Service Period
                </h3>
                <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                  Choose your service duration and dates above to see available drivers in {selectedCity}
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                <p className="text-neutral-600">Loading drivers...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Failed to Load</h3>
                <p className="text-neutral-600 mb-4">{error}</p>
                <Button onClick={fetchDrivers} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : sortedDrivers.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Drivers Found</h3>
                <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                  Try adjusting your dates to find available drivers.
                </p>
              </div>
            ) : (
              // Show drivers with availability
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-neutral-600">
                    <span className="font-semibold text-neutral-900">{total || sortedDrivers.length}</span> drivers found
                  </p>
                  {(() => {
                    const period = getBookingPeriod();
                    if (!period) return null;
                    const availableCount = sortedDrivers.filter(d =>
                      checkDriverAvailability(d.id, period.start, period.end).available
                    ).length;
                    return (
                      <p className="text-sm">
                        <span className="font-semibold text-green-600">{availableCount} available</span>
                        {availableCount < sortedDrivers.length && (
                          <span className="text-neutral-500"> • {sortedDrivers.length - availableCount} unavailable</span>
                        )}
                      </p>
                    );
                  })()}
                </div>

                <div className="space-y-4">
                  {sortedDrivers.map((driver, index) => {
                    const price = getPrice(driver);
                    const period = getBookingPeriod();
                    const availability = period ? checkDriverAvailability(driver.id, period.start, period.end) : { available: true, conflictDate: null };

                    return (
                      <motion.button
                        key={driver.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        onClick={() => {
                          if (availability.available) {
                            navigate(`/driver/${driver.id}?duration=${selectedDuration}&startDate=${startDate?.toISOString()}&endDate=${endDate?.toISOString() || startDate?.toISOString()}&startTime=${startTime}&endTime=${endTime}`);
                          }
                        }}
                        className="w-full group"
                        disabled={!availability.available}
                      >
                        <div className={`bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300 ${availability.available
                          ? 'border-neutral-200 hover:shadow-xl hover:border-neutral-300'
                          : 'border-red-200 opacity-75'
                          }`}>
                          {/* Image Section */}
                          <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                            <ImageWithFallback
                              src={driver.image}
                              alt={driver.name}
                              className={`w-full h-full object-cover transition-transform duration-500 ${availability.available ? 'group-hover:scale-105' : 'grayscale'
                                }`}
                            />

                            {/* Availability Badge - Top Priority */}
                            <div className="absolute top-3 left-3">
                              {availability.available ? (
                                <div className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-2 rounded-full shadow-lg">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span className="text-xs font-bold">Available</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-2 rounded-full shadow-lg">
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="text-xs font-bold">Not Available</span>
                                </div>
                              )}
                            </div>

                            {/* Verified Badge */}
                            <div className="absolute top-3 right-3">
                              <span className="bg-neutral-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                Verified
                              </span>
                            </div>

                            {/* Quick Stats */}
                            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                              <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-semibold text-neutral-900">{driver.rating}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                                <Clock className="w-3.5 h-3.5 text-neutral-600" />
                                <span className="text-xs font-medium text-neutral-900">{driver.experience}y exp</span>
                              </div>
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="p-5">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className={`font-semibold mb-1 text-lg transition-colors ${availability.available
                                  ? 'text-neutral-900 group-hover:text-green-600'
                                  : 'text-neutral-600'
                                  }`}>
                                  {driver.name}
                                </h3>
                                <p className="text-sm text-neutral-500">
                                  {driver.compatibleVehicles.slice(0, 2).join(' • ')}
                                </p>
                              </div>
                              {availability.available && (
                                <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                              )}
                            </div>

                            {/* Conflict Message or Pricing */}
                            {!availability.available && availability.conflictDate ? (
                              <div className="pt-4 border-t border-red-100">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                  <p className="text-xs font-semibold text-red-800 mb-1">
                                    Already booked on {format(availability.conflictDate, 'MMM d, yyyy')}
                                  </p>
                                  <p className="text-xs text-red-700">
                                    Try selecting different dates
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                                <div>
                                  <p className="text-sm text-neutral-500">
                                    {price.unit ? 'From' : 'Total'}
                                  </p>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-neutral-900">${price.amount}</span>
                                    {price.unit && <span className="text-sm text-neutral-500">{price.unit}</span>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-neutral-600">
                                  <span className="text-xs">{driver.reviewCount} reviews</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Date Picker Modal */}
      <Sheet open={showDatePicker} onOpenChange={setShowDatePicker}>
        <SheetContent side="bottom" className="h-auto max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <SheetHeader className="mb-6">
            <SheetTitle>
              {selectedDuration === 'hourly' && 'Select Date & Time'}
              {selectedDuration === 'daily' && 'Select Service Dates'}
              {selectedDuration === 'weekly' && 'Select Start Date'}
              {selectedDuration === 'monthly' && 'Select Start Date'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            {/* Calendar for start date (and end date for daily) */}
            {selectedDuration === 'daily' ? (
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-3">Service Dates</p>
                <CalendarComponent
                  mode="range"
                  selected={{ from: startDate, to: endDate }}
                  onSelect={(range: any) => {
                    setStartDate(range?.from);
                    setEndDate(range?.to);
                  }}
                  numberOfMonths={1}
                  disabled={(date) => date < new Date()}
                  className="rounded-xl border"
                />
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-3">
                  {selectedDuration === 'hourly' && 'Select Date'}
                  {selectedDuration === 'weekly' && 'Start Date (service runs for 7 days)'}
                  {selectedDuration === 'monthly' && 'Start Date (service runs for 30 days)'}
                </p>
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-xl border"
                />
              </div>
            )}

            {/* Time pickers for hourly */}
            {selectedDuration === 'hourly' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-3 border-2 border-neutral-200 rounded-xl focus:border-green-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-3 border-2 border-neutral-200 rounded-xl focus:border-green-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Summary */}
            {startDate && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-600/20 rounded-xl p-4">
                <p className="text-sm font-semibold text-neutral-900 mb-2">Service Period Summary</p>
                <p className="text-neutral-700">
                  {selectedDuration === 'hourly' && `${format(startDate, 'MMM d, yyyy')} • ${startTime} - ${endTime}`}
                  {selectedDuration === 'daily' && endDate && `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`}
                  {selectedDuration === 'daily' && !endDate && format(startDate, 'MMM d, yyyy')}
                  {selectedDuration === 'weekly' && `${format(startDate, 'MMM d')} - ${format(addDays(startDate, 7), 'MMM d, yyyy')} (7 days)`}
                  {selectedDuration === 'monthly' && `${format(startDate, 'MMM d')} - ${format(addDays(startDate, 30), 'MMM d, yyyy')} (30 days)`}
                </p>
              </div>
            )}

            <Button
              onClick={handleApplyDates}
              className="w-full h-12"
              disabled={!startDate || (selectedDuration === 'daily' && !endDate)}
            >
              Apply Dates
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <BottomNav />
    </div>
  );
}
