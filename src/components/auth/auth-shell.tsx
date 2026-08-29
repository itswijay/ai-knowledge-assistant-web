import { Brand } from "@/components/layout/brand";
import { ThemeMenu } from "@/components/layout/theme-menu";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background">
      <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
        <Brand />
        <ThemeMenu />
      </header>
      <main className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-md items-center px-4 py-8 sm:px-6">
        <div className="w-full rounded-lg border bg-card p-5 shadow-xs sm:p-7">
          {children}
        </div>
      </main>
    </div>
  );
}
