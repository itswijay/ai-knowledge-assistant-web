import { MobileHeader } from "@/components/layout/mobile-header";
import { SidebarContent } from "@/components/layout/sidebar-content";

export function AppShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string | null;
}) {
  return (
    <div className="min-h-svh bg-background">
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-100 -translate-y-20 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background shadow-md transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to content
      </a>
      <div className="lg:grid lg:min-h-svh lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-svh border-r border-sidebar-border lg:block">
          <SidebarContent userEmail={userEmail} />
        </aside>
        <div className="min-w-0">
          <MobileHeader userEmail={userEmail} />
          <main id="main-content" tabIndex={-1} className="min-w-0 outline-none">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
