"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutGrid, ClipboardList, ScanLine, User, LogOut, Settings } from "lucide-react";
import { logout } from "@/services/auth";

export default function SidebarInspector() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const menu = [
    { label: "Dashboard", href: "/inspection/dashboard", icon: LayoutGrid },
    { label: "Scan NFC", href: "/inspection/scan-nfc", icon: ScanLine },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <motion.aside
      className="fixed top-0 left-0 z-50 h-screen w-64 bg-[#0f172a] border-r border-white/5 text-slate-400 flex flex-col"
    >
      <div className="px-8 py-8 flex items-center gap-3">
        <div className="h-9 w-9 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
          <ScanLine size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold tracking-tight leading-none text-lg">AIRA <span className="text-teal-500 font-light">FIELD</span></h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-semibold">Inspector Panel</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menu.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href}>
              <div className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1 ${active ? "bg-teal-500/10 text-teal-400 font-semibold ring-1 ring-teal-500/20" : "hover:bg-white/5 hover:text-slate-200"}`}>
                <Icon size={18} className={active ? "text-teal-400" : "text-slate-500 group-hover:text-teal-400"} />
                <span className="text-sm">{item.label}</span>
                {active && <div className="ml-auto w-1 h-4 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button onClick={logout} className="group w-full flex items-center justify-center gap-3 bg-red-500/5 hover:bg-red-500/10 text-red-500/70 py-3 rounded-xl transition-all border border-red-500/10 font-semibold text-sm">
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
        </button>
      </div>
    </motion.aside>
  );
}