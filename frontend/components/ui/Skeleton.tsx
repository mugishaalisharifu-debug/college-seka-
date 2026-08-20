import React from "react";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80 ${className}`}
    />
  );
}

export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs p-5 space-y-4"
        >
          <Skeleton className="w-full h-44 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="w-1/3 h-4" />
            <Skeleton className="w-3/4 h-5" />
            <Skeleton className="w-1/2 h-3" />
          </div>
          <Skeleton className="w-full h-12 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 6,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="w-full border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <Skeleton className="w-48 h-6" />
        <Skeleton className="w-32 h-8 rounded-xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center justify-between gap-4 py-2 border-b border-zinc-100/50 dark:border-zinc-800/50"
          >
            {Array.from({ length: cols }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={`h-4 ${
                  colIndex === 0 ? "w-1/4" : colIndex === 1 ? "w-1/3" : "w-1/6"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between"
        >
          <div className="space-y-2 w-2/3">
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-1/2 h-6" />
          </div>
          <Skeleton className="w-10 h-10 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
