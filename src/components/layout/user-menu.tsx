"use client";

import { useQueryClient } from "@tanstack/react-query";
import { EllipsisVertical, LoaderCircle, LogOut, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SELECTED_ORGANIZATION_STORAGE_KEY } from "@/lib/auth/storage";
import { createClient } from "@/lib/supabase/client";

export function UserMenu({ email }: { email: string | null }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      setIsSigningOut(false);
      toast.error("Unable to sign out. Please try again.");
      return;
    }

    queryClient.clear();
    window.localStorage.removeItem(SELECTED_ORGANIZATION_STORAGE_KEY);
    router.replace("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Open account menu" size="icon" variant="ghost">
          <EllipsisVertical aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" side="top">
        <DropdownMenuLabel className="min-w-0">
          <span className="block text-foreground">Signed in</span>
          <span className="mt-0.5 block truncate font-normal">
            {email ?? "Authenticated account"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <Settings2 aria-hidden="true" />
          Organization settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isSigningOut}
          onSelect={(event) => {
            event.preventDefault();
            void signOut();
          }}
        >
          {isSigningOut ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" />
          ) : (
            <LogOut aria-hidden="true" />
          )}
          {isSigningOut ? "Signing out" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
