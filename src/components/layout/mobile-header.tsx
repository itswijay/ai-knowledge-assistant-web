"use client";

import { Menu } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { SidebarContent } from "@/components/layout/sidebar-content";
import { ThemeMenu } from "@/components/layout/theme-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-(--mobile-header-height) items-center justify-between border-b bg-background/95 px-4 supports-backdrop-filter:backdrop-blur-sm lg:hidden">
      <Brand compact />
      <div className="flex items-center gap-1">
        <ThemeMenu />
        <Sheet>
          <SheetTrigger asChild>
            <Button aria-label="Open navigation" size="icon" variant="ghost">
              <Menu aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent
            className="w-[min(19rem,calc(100vw-2rem))] gap-0 bg-sidebar p-0"
            side="left"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>Application navigation</SheetDescription>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
