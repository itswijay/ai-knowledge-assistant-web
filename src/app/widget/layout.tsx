import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "kdok chat",
  description: "Floating AI knowledge assistant powered by kdok",
};

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full bg-background text-foreground antialiased overflow-hidden flex flex-col">
      {children}
    </div>
  );
}
