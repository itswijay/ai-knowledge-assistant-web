import Link from "next/link";
import { BookOpenText } from "lucide-react";

import { cn } from "@/lib/utils";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="inline-flex min-w-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-xs">
        <BookOpenText aria-hidden="true" className="size-4.5" />
      </span>
      <span
        className={cn(
          "truncate font-heading text-sm font-semibold text-sidebar-foreground",
          compact && "hidden min-[390px]:inline",
        )}
      >
        Knowledge Assistant
      </span>
    </Link>
  );
}
