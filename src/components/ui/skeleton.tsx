import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-muted/30 border border-border/20",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
        "before:animate-[shimmer_2s_infinite]",
        className,
      )}
      {...props}
    />
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 space-y-4", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3" style={{ animationDelay: `${i * 0.1}s` }}>
          <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg self-center" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTable };
