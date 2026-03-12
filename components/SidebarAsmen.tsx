"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGrid, 
  FileCheck, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Settings, 
  CalendarCheck,
  ShieldCheck
} from "lucide-react";
import { logout } from "@/services/auth";

export default function SidebarAsmen() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  const isActive = (href: string) =>
    pathname === href || (href !== "/asmen" && pathname.startsWith(href));

  const menu = [
    { label: "Main Navigation", type: "label" },
    { label: "Dashboard", href: "/asmen", icon: LayoutGrid },
    { label: "Sign Jadwal", href: "/asmen/schedule", icon: CalendarCheck },
    { label: "User Management", type: "label" },
    { label: "My Profile", href: "/profile", icon: User },
  ];

  return (
    <>
      {/* MOBILE BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
        <span className="font-bold text-indigo-400 text-xl tracking-tighter cursor-default">AIRA</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 bg-slate-800 rounded-lg">
          {mobileOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-indigo-400" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: mobileOpen || isDesktop ? 0 : -280 }}
        className="fixed top-0 left-0 z-50 h-screen w-64 bg-[#0f172a] border-r border-white/5 text-slate-400 flex flex-col transition-shadow duration-300"
      >
        <div className="px-8 py-8 flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold tracking-tight leading-none text-lg">ASMEN <span className="text-indigo-500">PANEL</span></h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-semibold">AIRA System</p>
          </div>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto space-y-1 custom-scrollbar">
          {menu.map((item, idx) => {
            if (item.type === "label") {
              return <p key={idx} className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-4 mt-6 mb-2">{item.label}</p>;
            }
            const active = isActive(item.href!);
            const Icon = item.icon!;

            return (
              <Link key={item.label} href={item.href!} onClick={() => setMobileOpen(false)}>
                <div className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1 ${active ? "bg-indigo-500/10 text-indigo-400 font-semibold ring-1 ring-indigo-500/20" : "hover:bg-white/5 hover:text-slate-200"}`}>
                  <Icon size={18} className={active ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400"} />
                  <span className="text-sm">{item.label}</span>
                  {active && <div className="ml-auto w-1 h-4 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={logout} className="group w-full flex items-center justify-center gap-3 bg-red-500/5 hover:bg-red-500/10 text-red-500/70 hover:text-red-500 py-3 rounded-xl transition-all border border-red-500/10 font-semibold text-sm">
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
          </button>
        </div>
      </motion.aside>
    </>
  );
}