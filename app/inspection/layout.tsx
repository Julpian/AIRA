"use client";

import { usePathname } from "next/navigation";
import SidebarInspector from "@/components/SidebarInspector";
import RequireRole from "@/components/RequireRole";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function InspectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";

  // ============================
  // LOGIC
  // ============================
  const isFormPage =
    pathname.includes("/inspection/") &&
    !pathname.endsWith("/dashboard") &&
    !pathname.endsWith("/scan-nfc");

  return (
    <RequireRole roles={["inspector"]}>
      <div className="flex min-h-screen bg-[#F9FAFB] antialiased selection:bg-blue-100">

        {/* SIDEBAR */}
        {!isFormPage && (
          <div className="hidden lg:block">
            <SidebarInspector />
          </div>
        )}

        <main
          className={`
            flex-1 min-h-screen w-full transition-all duration-300
            ${!isFormPage ? "lg:ml-64" : "lg:ml-0"}
          `}
        >
          <div
            className={`
              max-w-7xl mx-auto
              ${isFormPage ? "p-0" : "p-4 md:p-8 pb-32 lg:pb-12"}
            `}
          >
            <div className={isFormPage ? "p-5 md:p-10" : ""}>
              {children}
            </div>
          </div>
        </main>

        {/* MOBILE NAV */}
        {!isFormPage && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
            <MobileBottomNav />
          </div>
        )}
      </div>
    </RequireRole>
  );
}