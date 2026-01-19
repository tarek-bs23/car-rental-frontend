import React from 'react'
import { Skeleton } from '../ui/skeleton'

export function VehicleCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[16/10]">
        <Skeleton className="h-full w-full rounded-none" />

        {/* Left badge */}
        <Skeleton className="absolute top-3 left-3 h-8 w-24 rounded-full" />

        {/* Right badge */}
        <Skeleton className="absolute top-3 right-3 h-7 w-20 rounded-full" />

        {/* Bottom badges */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2">
          <Skeleton className="h-7 w-14 rounded-full" />
          <Skeleton className="h-7 w-12 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title row */}
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-5 w-5 mt-1 rounded-full" />
        </div>

        {/* Divider / price row */}
        <div className="border-t pt-4 flex justify-between items-end gap-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-7 w-24" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

