import { cn } from "@/lib/utils";

type EmptyStateProps = React.ComponentProps<"div"> & {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed bg-card px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div className="mb-4 flex size-10 items-center justify-center rounded-lg border bg-background text-muted-foreground [&_svg]:size-5">
          {icon}
        </div>
      ) : null}
      <h2 className="font-heading text-base font-semibold text-card-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
