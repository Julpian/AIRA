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

  // Kita tidak butuh lagi useEffect & state mounted untuk seluruh layout
  // Next.js App Router sudah bisa handle usePathname di server dengan baik.

  const isFormPage =
    pathname.includes("/inspection/") &&
    !pathname.endsWith("/dashboard") &&
    !pathname.endsWith("/scan-nfc");

  const currentYear = new Date().getFullYear();

  return (
    <RequireRole roles={["inspector"]}>
      <div className="flex min-h-screen bg-[#F9FAFB] antialiased selection:bg-blue-100">
        
        {/* SIDEBAR DESKTOP */}
        {!isFormPage && (
          <div className="hidden lg:block">
            <SidebarInspector />
          </div>
        )}

        {/* MAIN CONTENT */}
        <main
          className={`
            flex-1 min-h-screen w-full transition-all duration-300 flex flex-col
            ${!isFormPage ? "lg:ml-64" : "lg:ml-0"}
          `}
        >
          <div
            className={`
              max-w-7xl mx-auto w-full flex-1
              ${isFormPage ? "p-0" : "p-4 md:p-8 pb-20 lg:pb-12"}
            `}
          >
            <div className={isFormPage ? "p-5 md:p-10" : ""}>
              {children}
            </div>
          </div>

          {/* FOOTER */}
          {!isFormPage && (
            <footer className="w-full py-6 px-4 text-center text-xs md:text-sm text-gray-500 border-t border-gray-100 mt-auto mb-20 lg:mb-0">
              {/* Gunakan suppressHydrationWarning di sini karena Date() bisa beda antara server/client */}
              <p suppressHydrationWarning>
                Develop by <span className="font-medium text-gray-700">Lutfi Julpian | Yayang Lufiana</span> &copy; {currentYear}
              </p>
            </footer>
          )}
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