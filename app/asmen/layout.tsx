"use client";

import dynamic from "next/dynamic";
import RequireRole from "@/components/RequireRole";

const SidebarAsmen = dynamic(() => import("@/components/SidebarAsmen"), {
  ssr: false,
});

export default function AsmenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <SidebarAsmen />

      <main className="flex-1 lg:ml-64 min-h-screen w-full transition-all duration-300">
        <div className="p-4 md:p-8 pt-24 lg:pt-8">
          <RequireRole roles={["AssistantManager"]}>
            {children}
          </RequireRole>
        </div>
      </main>
    </div>
  );
}