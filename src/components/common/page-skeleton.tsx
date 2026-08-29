import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-label="Loading page"
      aria-live="polite"
      className={cn("space-y-6", className)}
    >
      <div className="space-y-2 border-b pb-5">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-36 w-full rounded-lg" />
        ))}
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
