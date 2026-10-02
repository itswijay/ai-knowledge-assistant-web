import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Assistant } from "@/types/domain";

export function AssistantCard({ assistant }: { assistant: Assistant }) {
  const initial = assistant.name.charAt(0).toUpperCase() || "A";

  const formattedDate = (() => {
    try {
      return new Date(assistant.updatedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return assistant.updatedAt;
    }
  })();

  return (
    <Link
      href={`/assistants/${assistant.id}`}
      className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs transition-all hover:border-sidebar-ring hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Avatar
            size="default"
            className="border"
            style={{ borderColor: assistant.primaryColor }}
          >
            {assistant.logoUrl ? (
              <AvatarImage src={assistant.logoUrl} alt={assistant.name} />
            ) : null}
            <AvatarFallback
              style={{
                backgroundColor: `${assistant.primaryColor}15`,
                color: assistant.primaryColor,
              }}
              className="font-medium text-xs"
            >
              {initial}
            </AvatarFallback>
          </Avatar>

          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: assistant.primaryColor }}
            title={`Primary color: ${assistant.primaryColor}`}
          />
        </div>

        <div>
          <h3 className="font-heading text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {assistant.name}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {assistant.description || "No description provided."}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <span>Updated {formattedDate}</span>
        <span className="flex items-center gap-1 font-medium text-foreground group-hover:text-primary transition-colors">
          Open
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
