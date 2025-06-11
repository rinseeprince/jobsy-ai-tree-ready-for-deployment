import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-6">
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}
