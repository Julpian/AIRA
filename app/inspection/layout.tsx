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
  const pathname = usePathname();

  // Logika: Sembunyikan Nav jika berada di path form inspeksi
  const isFormPage = pathname.includes("/inspection/") && 
                     !pathname.endsWith("/dashboard") && 
                     !pathname.endsWith("/scan-nfc");

  return (
    <RequireRole roles={["inspector"]}>
      {/* Background iOS Light Mode */}
      <div className="flex min-h-screen bg-[#F2F2F7] antialiased selection:bg-blue-100">
        
        {/* SIDEBAR: Desktop Only - White Apple Style */}
        {!isFormPage && (
          <div className="hidden lg:block">
            <SidebarInspector />
          </div>
        )}

        <main 
          className={`
            flex-1 min-h-screen w-full transition-all duration-500 ease-in-out
            ${!isFormPage ? 'lg:ml-64' : 'lg:ml-0'}
          `}
        >
          {/* Container Content */}
          <div 
            className={`
              max-w-[1400px] mx-auto
              ${isFormPage ? 'p-0' : 'p-4 md:p-8 pb-32 lg:pb-12'}
            `}
          >
            {/* Di halaman form, kita beri padding yang berbeda agar 
              inputan terlihat lebih lega seperti aplikasi native iOS 
            */}
            <div className={isFormPage ? "p-5 md:p-10" : ""}>
              {children}
            </div>
          </div>
        </main>

        {/* MOBILE BOTTOM NAV: Glassmorphism Blur khas Apple */}
        {!isFormPage && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
            {/* Pastikan MobileBottomNav kamu menggunakan:
              bg-white/80 backdrop-blur-xl border-t border-gray-200/50 
            */}
            <MobileBottomNav />
          </div>
        )}
      </div>
    </RequireRole>
  );
}