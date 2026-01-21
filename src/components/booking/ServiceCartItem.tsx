import { X } from 'lucide-react';
import React from 'react';

interface ServiceCartItemProps {
  type: 'vehicle' | 'driver' | 'bodyguard';
  serviceName: string;
  serviceImage: string;
  serviceDetails: string;
  basePricePerDay?: number;
  basePricePerHour?: number;
  duration: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'halfday' | 'fullday';
  startDate: Date;
  endDate: Date | null;
  startTime: string;
  endTime: string;
  onDurationChange: (duration: any) => void;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date | null) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onRemove: () => void;
}

const colorMap = {
  vehicle: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-600'
  },
  driver: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    badge: 'bg-green-600'
  },
  bodyguard: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    badge: 'bg-purple-600'
  }
};

export function ServiceCartItem({
  type,
  serviceName,
  serviceImage,
  serviceDetails,
  duration,
  onRemove
}: ServiceCartItemProps) {
  const colors = colorMap[type];

  const getTypeLabel = () => {
    if (type === 'vehicle') return 'Vehicle';
    if (type === 'driver') return 'Driver';
    return 'Security';
  };

  return (
    <div className={`${colors.bg} rounded-xl p-4 border ${colors.border}`}>
      <div className="flex items-start gap-3">
        <img
          src={serviceImage}
          alt={serviceName}
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <div>
              <div className={`text-xs ${colors.text} font-medium mb-1`}>{getTypeLabel()}</div>
              <h3 className="font-semibold text-gray-900">{serviceName}</h3>
              <p className="text-xs text-gray-600">{serviceDetails}</p>
            </div>
            <button
              onClick={onRemove}
              className="p-1 hover:bg-red-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-red-600" />
            </button>
          </div>

          <div className="mt-3">
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 ${colors.badge} text-white rounded text-xs font-medium`}>
              <span>
                {duration === 'hourly' && '8 hours'}
                {duration === 'daily' && '3 days'}
                {duration === 'weekly' && '7 days'}
                {duration === 'monthly' && '30 days'}
                {duration === 'halfday' && '12 hours'}
                {duration === 'fullday' && '24 hours'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}