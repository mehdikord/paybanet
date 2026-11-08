import { ListSkeleton } from "@/components/data/list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function SellerSectionSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6" aria-busy="true">
      <Skeleton className="h-11 w-full max-w-lg rounded-xl" />
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-10 w-full" />
      <ListSkeleton />
    </div>
  );
}
