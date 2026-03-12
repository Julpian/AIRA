"use client";

import { useEffect, useState } from "react"; // Tambahkan ini
import Sidebar from "@/components/Sidebar";
import RequireRole from "@/components/RequireRole";
import { ADMIN_ROLES } from "@/services/role";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // State untuk memastikan komponen sudah terpasang di browser
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame); // Cleanup untuk keamanan
  }, []);

  // Jika belum mounted (masih proses server-side), render skeleton/kosong saja
  // agar HTML server dan client tetap sinkron di awal
  if (!mounted) {
    return <div className="min-h-screen bg-[#0f172a]" />;
  }

  return (
    <RequireRole roles={ADMIN_ROLES}>
      <div className="flex min-h-screen bg-[#0f172a]">
        <Sidebar />

        <main className="flex-1 lg:ml-64 min-h-screen w-full">
          <div className="p-4 md:p-8 pt-20 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </RequireRole>
  );
}