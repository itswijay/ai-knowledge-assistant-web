import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function AssistantListSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      aria-label="Loading assistants"
      aria-live="polite"
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="size-2.5 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-2/3" />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading assistants</span>
    </div>
  );
}
