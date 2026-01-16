import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ChevronLeft, Plus, Search, X, ShoppingCart } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { Input } from '../ui/input';
import { ServiceCartItem } from './ServiceCartItem';

export function AddOnsSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicleId');
  const { vehicles, drivers, bodyguards } = useApp();

  // Vehicle state
  const [vehicleDuration, setVehicleDuration] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>(
    (searchParams.get('duration') as any) || 'daily'
  );
  const [vehicleStartDate, setVehicleStartDate] = useState<Date>(
    searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : new Date()
  );
  const [vehicleEndDate, setVehicleEndDate] = useState<Date | null>(
    searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : null
  );
  const [vehicleStartTime, setVehicleStartTime] = useState(searchParams.get('startTime') || '09:00');
  const [vehicleEndTime, setVehicleEndTime] = useState(searchParams.get('endTime') || '17:00');

  // Driver state
  const [addDriver, setAddDriver] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [driverDuration, setDriverDuration] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily');
  const [driverStartDate, setDriverStartDate] = useState<Date>(new Date());
  const [driverEndDate, setDriverEndDate] = useState<Date | null>(null);
  const [driverStartTime, setDriverStartTime] = useState('09:00');
  const [driverEndTime, setDriverEndTime] = useState('17:00');

  // Bodyguard state
  const [addBodyguard, setAddBodyguard] = useState(false);
  const [selectedBodyguard, setSelectedBodyguard] = useState<string | null>(null);
  const [bodyguardDuration, setBodyguardDuration] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily');
  const [bodyguardStartDate, setBodyguardStartDate] = useState<Date>(new Date());
  const [bodyguardEndDate, setBodyguardEndDate] = useState<Date | null>(null);
  const [bodyguardStartTime, setBodyguardStartTime] = useState('09:00');
  const [bodyguardEndTime, setBodyguardEndTime] = useState('17:00');

  // Modal states
  const [showDriverSelector, setShowDriverSelector] = useState(false);
  const [showBodyguardSelector, setShowBodyguardSelector] = useState(false);
  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [bodyguardSearchQuery, setBodyguardSearchQuery] = useState('');

  const vehicle = vehicleId ? vehicles.find(v => v.id === vehicleId) : null;
  const driver = selectedDriver ? drivers.find(d => d.id === selectedDriver) : null;
  const bodyguard = selectedBodyguard ? bodyguards.find(b => b.id === selectedBodyguard) : null;

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vehicle not found</p>
          <Button onClick={() => navigate('/vehicles')}>Back to Vehicles</Button>
        </div>
      </div>
    );
  }

  // Calculate total price
  const calculateVehiclePrice = () => {
    if (!vehicle) return 0;
    if (vehicleDuration === 'hourly') {
      const hours = 8; // simplified
      return Math.ceil((vehicle.pricePerDay / 24) * hours);
    } else if (vehicleDuration === 'daily') {
      return vehicle.pricePerDay * 3; // simplified
    } else if (vehicleDuration === 'weekly') {
      return vehicle.pricePerDay * 7;
    } else {
      return vehicle.pricePerDay * 30;
    }
  };

  const calculateDriverPrice = () => {
    if (!driver) return 0;
    if (driverDuration === 'hourly') return driver.pricePerHour * 8;
    else if (driverDuration === 'daily') return driver.pricePerHour * 24 * 3;
    else if (driverDuration === 'weekly') return driver.pricePerHour * 24 * 7;
    else return driver.pricePerHour * 24 * 30;
  };

  const calculateBodyguardPrice = () => {
    if (!bodyguard) return 0;
    if (bodyguardDuration === 'hourly') return bodyguard.pricePerHour * 8;
    else if (bodyguardDuration === 'daily') return bodyguard.pricePerHour * 24 * 3;
    else if (bodyguardDuration === 'weekly') return bodyguard.pricePerHour * 24 * 7;
    else return bodyguard.pricePerHour * 24 * 30;
  };

  const total = calculateVehiclePrice() + calculateDriverPrice() + calculateBodyguardPrice();

  const handleContinue = () => {
    const params = new URLSearchParams();
    
    // Vehicle params
    if (vehicle) {
      params.set('vehicleId', vehicle.id);
      params.set('vehicleDuration', vehicleDuration);
      params.set('vehicleStartDate', vehicleStartDate.toISOString());
      if (vehicleEndDate) params.set('vehicleEndDate', vehicleEndDate.toISOString());
      params.set('vehicleStartTime', vehicleStartTime);
      params.set('vehicleEndTime', vehicleEndTime);
    }

    // Driver params
    if (addDriver && selectedDriver) {
      params.set('driverId', selectedDriver);
      params.set('driverDuration', driverDuration);
      params.set('driverStartDate', driverStartDate.toISOString());
      if (driverEndDate) params.set('driverEndDate', driverEndDate.toISOString());
      params.set('driverStartTime', driverStartTime);
      params.set('driverEndTime', driverEndTime);
    }

    // Bodyguard params
    if (addBodyguard && selectedBodyguard) {
      params.set('bodyguardId', selectedBodyguard);
      params.set('bodyguardDuration', bodyguardDuration);
      params.set('bodyguardStartDate', bodyguardStartDate.toISOString());
      if (bodyguardEndDate) params.set('bodyguardEndDate', bodyguardEndDate.toISOString());
      params.set('bodyguardStartTime', bodyguardStartTime);
      params.set('bodyguardEndTime', bodyguardEndTime);
    }

    navigate(`/booking/summary?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="ml-2">Service Cart</span>
          <div className="ml-auto flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">
              {1 + (addDriver && selectedDriver ? 1 : 0) + (addBodyguard && selectedBodyguard ? 1 : 0)} items
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4 max-w-md mx-auto">
        {/* Cart header */}
        <div className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] rounded-xl p-5 text-white">
          <h2 className="text-xl mb-1">Your Services</h2>
          <p className="text-sm text-white/80">
            Customize booking period for each service independently
          </p>
        </div>

        {/* Vehicle cart item */}
        {vehicle && (
          <ServiceCartItem
            type="vehicle"
            serviceName={vehicle.name}
            serviceImage={vehicle.image}
            serviceDetails={`${vehicle.category} • ${vehicle.seats} seats`}
            basePricePerDay={vehicle.pricePerDay}
            duration={vehicleDuration}
            startDate={vehicleStartDate}
            endDate={vehicleEndDate}
            startTime={vehicleStartTime}
            endTime={vehicleEndTime}
            onDurationChange={setVehicleDuration}
            onStartDateChange={setVehicleStartDate}
            onEndDateChange={setVehicleEndDate}
            onStartTimeChange={setVehicleStartTime}
            onEndTimeChange={setVehicleEndTime}
          />
        )}

        {/* Driver cart item */}
        {addDriver && driver && (
          <ServiceCartItem
            type="driver"
            serviceName={driver.name}
            serviceImage={driver.image}
            serviceDetails={`${driver.experience} years experience`}
            basePricePerHour={driver.pricePerHour}
            duration={driverDuration}
            startDate={driverStartDate}
            endDate={driverEndDate}
            startTime={driverStartTime}
            endTime={driverEndTime}
            onDurationChange={setDriverDuration}
            onStartDateChange={setDriverStartDate}
            onEndDateChange={setDriverEndDate}
            onStartTimeChange={setDriverStartTime}
            onEndTimeChange={setDriverEndTime}
            onRemove={() => {
              setAddDriver(false);
              setSelectedDriver(null);
            }}
          />
        )}

        {/* Bodyguard cart item */}
        {addBodyguard && bodyguard && (
          <ServiceCartItem
            type="bodyguard"
            serviceName={bodyguard.name}
            serviceImage={bodyguard.image}
            serviceDetails={`${bodyguard.securityLevel} • ${bodyguard.experience}y exp`}
            basePricePerHour={bodyguard.pricePerHour}
            duration={bodyguardDuration}
            startDate={bodyguardStartDate}
            endDate={bodyguardEndDate}
            startTime={bodyguardStartTime}
            endTime={bodyguardEndTime}
            onDurationChange={setBodyguardDuration}
            onStartDateChange={setBodyguardStartDate}
            onEndDateChange={setBodyguardEndDate}
            onStartTimeChange={setBodyguardStartTime}
            onEndTimeChange={setBodyguardEndTime}
            onRemove={() => {
              setAddBodyguard(false);
              setSelectedBodyguard(null);
            }}
          />
        )}

        {/* Add driver section */}
        {!addDriver && (
          <button
            onClick={() => setShowDriverSelector(true)}
            className="w-full bg-white rounded-xl p-4 shadow-sm border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-gray-900 font-medium">Add Professional Driver</h3>
                <p className="text-sm text-gray-600">From ${drivers[0]?.pricePerHour}/hour</p>
              </div>
            </div>
          </button>
        )}

        {/* Add bodyguard section */}
        {!addBodyguard && (
          <button
            onClick={() => setShowBodyguardSelector(true)}
            className="w-full bg-white rounded-xl p-4 shadow-sm border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-gray-900 font-medium">Add Security Service</h3>
                <p className="text-sm text-gray-600">From ${bodyguards[0]?.pricePerHour}/hour</p>
              </div>
            </div>
          </button>
        )}

        {/* Total price card */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl text-gray-900 font-bold">${total}</p>
            </div>
            <Button onClick={handleContinue} size="lg">
              Continue to Summary
            </Button>
          </div>
        </div>
      </div>

      {/* Driver Selector Modal */}
      <Sheet open={showDriverSelector} onOpenChange={setShowDriverSelector}>
        <SheetContent side="bottom" className="h-[85vh]" aria-describedby={undefined}>
          <SheetHeader className="mb-4">
            <SheetTitle>Select a Driver</SheetTitle>
          </SheetHeader>
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search drivers by name..."
                value={driverSearchQuery}
                onChange={(e) => setDriverSearchQuery(e.target.value)}
                className="pl-10"
              />
              {driverSearchQuery && (
                <button
                  onClick={() => setDriverSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 180px)' }}>
            {drivers
              .filter(d => d.name.toLowerCase().includes(driverSearchQuery.toLowerCase()))
              .map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setSelectedDriver(d.id);
                    setAddDriver(true);
                    setShowDriverSelector(false);
                    setDriverSearchQuery('');
                  }}
                  className="w-full p-4 border-2 border-gray-200 hover:border-green-600 rounded-xl transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <ImageWithFallback
                      src={d.image}
                      alt={d.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{d.name}</p>
                      <p className="text-sm text-gray-600">{d.experience} years experience</p>
                      <p className="text-sm text-green-600 font-medium mt-1">${d.pricePerHour}/hour</p>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Bodyguard Selector Modal */}
      <Sheet open={showBodyguardSelector} onOpenChange={setShowBodyguardSelector}>
        <SheetContent side="bottom" className="h-[85vh]" aria-describedby={undefined}>
          <SheetHeader className="mb-4">
            <SheetTitle>Select a Security Service</SheetTitle>
          </SheetHeader>
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search security services..."
                value={bodyguardSearchQuery}
                onChange={(e) => setBodyguardSearchQuery(e.target.value)}
                className="pl-10"
              />
              {bodyguardSearchQuery && (
                <button
                  onClick={() => setBodyguardSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 180px)' }}>
            {bodyguards
              .filter(b => b.name.toLowerCase().includes(bodyguardSearchQuery.toLowerCase()))
              .map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBodyguard(b.id);
                    setAddBodyguard(true);
                    setShowBodyguardSelector(false);
                    setBodyguardSearchQuery('');
                  }}
                  className="w-full p-4 border-2 border-gray-200 hover:border-purple-600 rounded-xl transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <ImageWithFallback
                      src={b.image}
                      alt={b.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{b.name}</p>
                      <p className="text-sm text-gray-600">{b.securityLevel} • {b.experience}y exp</p>
                      <p className="text-sm text-purple-600 font-medium mt-1">${b.pricePerHour}/hour</p>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}