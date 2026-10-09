"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  Check,
  Code2,
  Copy,
  ExternalLink,
  Globe,
  Layers,
  MessageSquare,
  Sparkles,
  Smartphone,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAssistant } from "@/features/assistants/use-assistant";

export default function AssistantWidgetPage() {
  const params = useParams<{ assistantId: string }>();
  const assistantId = params.assistantId;
  const { assistant } = useAssistant(assistantId);

  const [position, setPosition] = React.useState<"bottom-right" | "bottom-left">("bottom-right");
  const [copiedScript, setCopiedScript] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [isSimulatedOpen, setIsSimulatedOpen] = React.useState(false);

  // Derive origin or fallback to kdok.app
  const appOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://kdok.app";

  if (!assistant) {
    return null;
  }

  const scriptTag = `<script src="${appOrigin}/widget.js" data-assistant-id="${assistant.id}"${
    position === "bottom-left" ? ' data-position="bottom-left"' : ""
  } defer></script>`;

  const directUrl = `${appOrigin}/widget/${assistant.id}`;

  const copyToClipboard = async (text: string, type: "script" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "script") {
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 2000);
        toast.success("Widget code copied to clipboard!");
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        toast.success("Direct link copied to clipboard!");
      }
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const primaryColor = assistant.primaryColor || "#2563EB";

  return (
    <div className="space-y-6">
      {/* Information Header */}
      <div className="rounded-xl border bg-muted/30 p-4 space-y-1.5">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
          <Code2 className="size-4 text-primary" aria-hidden="true" />
          <span>Dock to Website (Widget)</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Dock your grounded AI knowledge assistant onto any external website with a single line
          of JavaScript. Visitors can chat in a floating dock tailored to your brand colors and
          welcome greeting.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Embed Setup & Instructions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: 1-Click Code Snippet */}
          <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Code2 className="size-3.5" />
                </span>
                <h3 className="font-heading text-sm font-semibold text-foreground">
                  Embed Code Snippet
                </h3>
              </div>

              {/* Position Selector */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground text-[11px] mr-1">Position:</span>
                <button
                  type="button"
                  onClick={() => setPosition("bottom-right")}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    position === "bottom-right"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Bottom Right
                </button>
                <button
                  type="button"
                  onClick={() => setPosition("bottom-left")}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    position === "bottom-left"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Bottom Left
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Paste this tag into your website's HTML right before the closing{" "}
              <code className="text-[11px] bg-muted px-1 py-0.5 rounded font-mono">
                &lt;/body&gt;
              </code>{" "}
              tag:
            </p>

            <div className="relative group">
              <pre className="p-3.5 rounded-lg bg-muted/60 border border-border/80 font-mono text-xs overflow-x-auto text-foreground/90 whitespace-pre-wrap break-all select-all">
                {scriptTag}
              </pre>
              <Button
                type="button"
                size="xs"
                variant="secondary"
                onClick={() => copyToClipboard(scriptTag, "script")}
                className="absolute top-2.5 right-2.5 gap-1.5 shadow-2xs"
              >
                {copiedScript ? (
                  <>
                    <Check className="size-3 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copy Code</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Card 2: Direct Shareable Link */}
          <div className="rounded-xl border bg-card p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Globe className="size-3.5" />
              </span>
              <h3 className="font-heading text-sm font-semibold text-foreground">
                Direct Chat Link
              </h3>
            </div>

            <p className="text-xs text-muted-foreground">
              Share this standalone link directly with clients via WhatsApp, email, or your social
              media bio. No website required.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={directUrl}
                className="flex-1 h-9 px-3 rounded-md border border-input bg-muted/30 font-mono text-xs text-muted-foreground outline-none select-all"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(directUrl, "link")}
                className="gap-1.5 shrink-0"
              >
                {copiedLink ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                <span>{copiedLink ? "Copied" : "Copy"}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                asChild
                className="gap-1.5 shrink-0"
              >
                <a href={directUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  <span>Open</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Card 3: Platform Guides */}
          <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers className="size-3.5" />
              </span>
              <h3 className="font-heading text-sm font-semibold text-foreground">
                Platform Install Guides
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <details className="rounded-lg border border-border/80 bg-muted/20 p-3 group">
                <summary className="font-medium text-foreground cursor-pointer flex items-center justify-between">
                  <span>WordPress</span>
                  <span className="text-muted-foreground text-[11px] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="pt-2 text-muted-foreground space-y-1">
                  <p>1. Install the free plugin <strong>WPCode</strong> (or Header & Footer Scripts).</p>
                  <p>2. Paste the snippet into the <strong>Footer</strong> section.</p>
                  <p>3. Click Save Changes. The floating dock will appear on all pages.</p>
                </div>
              </details>

              <details className="rounded-lg border border-border/80 bg-muted/20 p-3 group">
                <summary className="font-medium text-foreground cursor-pointer flex items-center justify-between">
                  <span>Shopify</span>
                  <span className="text-muted-foreground text-[11px] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="pt-2 text-muted-foreground space-y-1">
                  <p>1. Go to <strong>Online Store → Themes → Edit code</strong>.</p>
                  <p>2. Open <code className="font-mono text-[11px]">theme.liquid</code>.</p>
                  <p>3. Paste the snippet directly before the <code className="font-mono text-[11px]">&lt;/body&gt;</code> tag and save.</p>
                </div>
              </details>

              <details className="rounded-lg border border-border/80 bg-muted/20 p-3 group">
                <summary className="font-medium text-foreground cursor-pointer flex items-center justify-between">
                  <span>Wix / Squarespace / Webflow</span>
                  <span className="text-muted-foreground text-[11px] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="pt-2 text-muted-foreground space-y-1">
                  <p>1. Navigate to <strong>Settings → Custom Code / Advanced</strong>.</p>
                  <p>2. Add a new code snippet set to load in the <strong>Body - End</strong>.</p>
                  <p>3. Paste the snippet and publish your changes.</p>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Simulator */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
          <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
            {/* Mock Browser Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-red-400/80" />
                <span className="size-2.5 rounded-full bg-amber-400/80" />
                <span className="size-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-background border border-border text-[11px] font-mono text-muted-foreground">
                <span>yourwebsite.com</span>
              </div>
              <Sparkles className="size-3.5 text-primary" />
            </div>

            {/* Mock Webpage Canvas */}
            <div className="relative h-[480px] bg-gradient-to-b from-background to-muted/20 p-5 flex flex-col justify-between overflow-hidden">
              {/* Mock website content */}
              <div className="space-y-4 opacity-50 select-none pointer-events-none">
                <div className="h-6 w-32 bg-foreground/15 rounded-md" />
                <div className="h-4 w-4/5 bg-foreground/10 rounded-md" />
                <div className="h-4 w-3/5 bg-foreground/10 rounded-md" />
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="h-20 bg-foreground/5 rounded-lg border border-border/50" />
                  <div className="h-20 bg-foreground/5 rounded-lg border border-border/50" />
                </div>
              </div>

              {/* Simulated Expanded Chat Iframe */}
              {isSimulatedOpen ? (
                <div
                  className={`absolute ${
                    position === "bottom-left" ? "left-4" : "right-4"
                  } bottom-18 w-[310px] h-[390px] rounded-xl border border-border/80 bg-background shadow-2xl overflow-hidden flex flex-col animate-in fade-in-50 zoom-in-95 duration-200 z-10`}
                >
                  <iframe
                    src={directUrl}
                    title="Simulated widget preview"
                    className="w-full h-full border-none"
                  />
                </div>
              ) : null}

              {/* Floating Dock Action Button */}
              <div
                className={`absolute bottom-4 ${
                  position === "bottom-left" ? "left-4" : "right-4"
                } z-20`}
              >
                <button
                  type="button"
                  onClick={() => setIsSimulatedOpen(!isSimulatedOpen)}
                  style={{ backgroundColor: primaryColor }}
                  className="size-12 rounded-full text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  title="Click to preview the dock"
                >
                  <MessageSquare className="size-5" />
                </button>
              </div>

              {/* Helper tip */}
              <div className="text-[11px] text-muted-foreground text-center bg-background/80 backdrop-blur-xs py-1.5 px-3 rounded-full border border-border/60 self-center">
                👉 Click the floating dock button to test the widget!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
