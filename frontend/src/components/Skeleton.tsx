"use client";

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="skeleton h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-7 w-1/3" />
        <div className="skeleton h-2.5 w-full rounded-full" />
        <div className="flex justify-between">
          <div className="skeleton h-4 w-1/4" />
          <div className="skeleton h-4 w-1/5" />
        </div>
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
      <div className="skeleton h-10 w-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-5 w-1/2" />
        <div className="skeleton h-4 w-1/3" />
      </div>
      <div className="skeleton h-8 w-20 rounded-lg" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <div className="skeleton h-8 w-1/3 mb-6" />
      <ListItemSkeleton />
      <ListItemSkeleton />
      <ListItemSkeleton />
    </div>
  );
}
