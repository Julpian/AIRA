"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import SidebarInspector from "@/components/SidebarInspector";
import RequireRole from "@/components/RequireRole";
import MobileBottomNav from "@/components/MobileBottomNav";

// Helper sederhana untuk mendeteksi apakah kita di client atau server
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function InspectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  
  // Menggunakan useSyncExternalStore adalah cara modern untuk menghindari 
  // error "set-state-in-effect" saat menangani masalah hydration.
  const isClient = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const currentYear = new Date().getFullYear();

  // Deteksi halaman form
  const isFormPage =
    pathname.includes("/inspection/") &&
    !pathname.endsWith("/dashboard") &&
    !pathname.endsWith("/scan-nfc");

  // Jika masih di server (Hydration phase), render shell minimalis
  if (!isClient) {
    return <div className="min-h-screen bg-[#F8F9FA]" />;
  }

  return (
    <RequireRole roles={["inspector"]}>
      <div className="flex flex-col min-h-screen bg-[#F8F9FA] antialiased selection:bg-blue-100">

        {/* SIDEBAR DESKTOP */}
        {!isFormPage && (
          <aside className="hidden lg:block">
            <SidebarInspector />
          </aside>
        )}

        {/* MAIN CONTENT */}
        <main
          className={`
            flex-1 flex flex-col transition-all duration-300
            ${!isFormPage ? "lg:ml-64" : "lg:ml-0"}
          `}
        >
          {/* WRAPPER */}
          <div
            className={`
              w-full max-w-md mx-auto flex-1 flex flex-col
              ${isFormPage ? "p-0" : "px-4 pt-6 pb-28"}
            `}
          >
            {/* CONTENT */}
            <div
              className={`flex-1 ${
                isFormPage ? "bg-white min-h-screen p-5" : ""
              }`}
            >
              {children}
            </div>

            {/* FOOTER MOBILE */}
            {!isFormPage && (
              <footer className="w-full py-10 px-6 text-center mt-auto">
                <div className="h-px w-8 bg-gray-200 mx-auto mb-4" />
                <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-[0.15em]">
                  Developed by <br />
                  <span className="font-bold text-gray-600 mt-1 inline-block">
                    Lutfi Julpian | Yayang Lufiana
                  </span>
                  <br />
                  <span className="opacity-50 mt-1 inline-block">
                    &copy; {currentYear} AIRA SYSTEM
                  </span>
                </p>
              </footer>
            )}
          </div>

          {/* FOOTER DESKTOP */}
          {!isFormPage && (
            <footer className="w-full py-6 px-4 text-center text-xs md:text-sm text-gray-500 border-t border-gray-100 mt-auto mb-20 lg:mb-0">
              <p>
                Developed by{" "}
                <span className="font-medium text-gray-700">
                  Lutfi Julpian | Yayang Lufiana
                </span>{" "}
                &copy; {currentYear}
              </p>
            </footer>
          )}
        </main>

        {/* BOTTOM NAV */}
        {!isFormPage && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
            <MobileBottomNav />
          </nav>
        )}
      </div>
    </RequireRole>
  );
}