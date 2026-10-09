"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Code2,
  LayoutDashboard,
  MessageSquare,
  Palette,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type WorkspaceTab = {
  label: string;
  segment: string;
  icon: LucideIcon;
};

const tabs: WorkspaceTab[] = [
  { label: "Overview", segment: "", icon: LayoutDashboard },
  { label: "Knowledge", segment: "knowledge", icon: BookOpen },
  { label: "Playground", segment: "playground", icon: MessageSquare },
  { label: "Appearance", segment: "appearance", icon: Palette },
  { label: "Widget", segment: "widget", icon: Code2 },
  { label: "Settings", segment: "settings", icon: Settings },
];

export function AssistantWorkspaceNav({ assistantId }: { assistantId: string }) {
  const pathname = usePathname();
  const basePath = `/assistants/${assistantId}`;

  return (
    <nav
      aria-label="Assistant workspace"
      className="flex items-center gap-1 overflow-x-auto border-b border-border pb-px"
    >
      {tabs.map((tab) => {
        const href = tab.segment ? `${basePath}/${tab.segment}` : basePath;
        const isActive =
          tab.segment === ""
            ? pathname === basePath
            : pathname.startsWith(`${basePath}/${tab.segment}`);

        const Icon = tab.icon;

        return (
          <Link
            key={tab.label}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap transition-colors outline-none",
              isActive
                ? "border-primary text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-sm",
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
