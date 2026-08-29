import { cn } from "@/lib/utils";

type ContentContainerProps = React.ComponentProps<"div"> & {
  size?: "default" | "narrow";
};

export function ContentContainer({
  className,
  size = "default",
  ...props
}: ContentContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10",
        size === "default"
          ? "max-w-(--content-max-width)"
          : "max-w-(--content-narrow-width)",
        className,
      )}
      {...props}
    />
  );
}
