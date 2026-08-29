import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

type ErrorStateProps = React.ComponentProps<"div"> & {
  title?: string;
  description: string;
  action?: React.ReactNode;
};

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex min-h-64 flex-col items-center justify-center rounded-lg border bg-card px-6 py-10 text-center",
        className,
      )}
      {...props}
    >
      <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
        <AlertTriangle aria-hidden="true" className="size-5" />
      </div>
      <h2 className="font-heading text-base font-semibold text-card-foreground">
        {title}
      </h2>
      <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
