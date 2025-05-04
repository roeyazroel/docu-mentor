"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentsLoading() {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto px-6 max-w-[1400px]">
        {/* Header Section */}
        <div className="pt-24 pb-10 mb-10 border-b border-border">
          <Skeleton className="h-12 w-64" />
        </div>

        {/* Control Bar */}
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
          <Skeleton className="h-10 w-full md:w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border p-6 bg-card"
            >
              <Skeleton className="h-6 w-2/3 mb-4" />
              <Skeleton className="h-4 w-1/4 mb-3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
