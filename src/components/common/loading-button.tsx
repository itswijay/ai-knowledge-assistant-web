import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type LoadingButtonProps = React.ComponentProps<typeof Button> & {
  isLoading?: boolean;
  loadingText?: string;
};

export function LoadingButton({
  isLoading = false,
  loadingText,
  children,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      aria-busy={isLoading}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <LoaderCircle aria-hidden="true" className="animate-spin" />
      ) : null}
      {isLoading && loadingText ? loadingText : children}
    </Button>
  );
}
