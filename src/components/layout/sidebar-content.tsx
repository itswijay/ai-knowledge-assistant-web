import { Building2, ChevronsUpDown, Plus } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { AppNavigation } from "@/components/layout/app-navigation";
import { ThemeMenu } from "@/components/layout/theme-menu";
import { UserMenu } from "@/components/layout/user-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function getAccountInitial(email: string | null) {
  return email?.charAt(0).toUpperCase() || "A";
}

export function SidebarContent({ userEmail }: { userEmail: string | null }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center px-4">
        <Brand />
      </div>

      <div className="px-3 pb-4">
        <Button
          className="w-full justify-start border-sidebar-border bg-sidebar text-sidebar-foreground"
          disabled
          size="lg"
          variant="outline"
        >
          <Plus aria-hidden="true" data-icon="inline-start" />
          New assistant
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <AppNavigation />
      </div>

      <div className="shrink-0 space-y-3 border-t border-sidebar-border p-3">
        <button
          type="button"
          disabled
          className="flex h-11 w-full cursor-not-allowed items-center gap-2.5 rounded-md px-2 text-left opacity-55"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-background/70">
            <Building2 aria-hidden="true" className="size-3.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium">Organization</span>
            <span className="block truncate text-xs text-sidebar-foreground/55">
              None selected
            </span>
          </span>
          <ChevronsUpDown aria-hidden="true" className="size-3.5" />
        </button>

        <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
          <Avatar size="sm">
            <AvatarFallback>{getAccountInitial(userEmail)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">Account</p>
            <p className="truncate text-xs text-sidebar-foreground/55">
              {userEmail ?? "Signed in"}
            </p>
          </div>
          <ThemeMenu />
          <UserMenu email={userEmail} />
        </div>
      </div>
    </div>
  );
}
