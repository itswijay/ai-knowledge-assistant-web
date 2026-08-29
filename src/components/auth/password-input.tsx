"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const PasswordInput = forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(function PasswordInput({ className, ...props }, ref) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={isVisible ? "text" : "password"}
        className={cn("h-10 pr-10", className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1"
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((visible) => !visible)}
      >
        {isVisible ? (
          <EyeOff aria-hidden="true" />
        ) : (
          <Eye aria-hidden="true" />
        )}
      </Button>
    </div>
  );
});
