import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px] mt-2" />
      </div>

      <div className="grid gap-4">
        <div className="rounded-lg border p-4">
          <Skeleton className="h-5 w-[120px] mb-2" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
    </div>
  )
}