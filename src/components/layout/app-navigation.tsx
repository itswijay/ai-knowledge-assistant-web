"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, House, Settings2, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
};

const primaryItems: NavigationItem[] = [
  { label: "Home", href: "/", icon: House },
  { label: "Assistants", href: "/assistants", icon: Bot, disabled: true },
];

const settingsItems: NavigationItem[] = [
  {
    label: "Organization settings",
    href: "/settings",
    icon: Settings2,
    disabled: true,
  },
];

function NavigationLink({ item }: { item: NavigationItem }) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(`${item.href}/`));
  const Icon = item.icon;
  const className = cn(
    "flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm font-medium outline-none transition-colors",
    isActive
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-sidebar-foreground/72 hover:bg-sidebar-accent/65 hover:text-sidebar-foreground",
    item.disabled && "cursor-not-allowed opacity-45",
  );

  if (item.disabled) {
    return (
      <span aria-disabled="true" className={className}>
        <Icon aria-hidden="true" className="size-4" />
        <span className="truncate">{item.label}</span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        className,
        "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
      )}
    >
      <Icon aria-hidden="true" className="size-4" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function AppNavigation() {
  return (
    <nav aria-label="Primary" className="space-y-5">
      <div className="space-y-1">
        {primaryItems.map((item) => (
          <NavigationLink item={item} key={item.href} />
        ))}
      </div>
      <div className="space-y-1">
        <p className="px-2.5 pb-1 text-xs font-medium text-sidebar-foreground/48">
          Organization
        </p>
        {settingsItems.map((item) => (
          <NavigationLink item={item} key={item.href} />
        ))}
      </div>
    </nav>
  );
}
