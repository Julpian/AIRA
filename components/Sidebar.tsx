"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  User,
  Database,
  Building2,
  MapPin,
  Fan,
  CalendarClock,
  Users,
  Activity,
  LogOut,
  ChevronDown,
  CalendarDays,
  FileText,
  PlusSquare,
  Menu,
  X,
  Settings,
  ClipboardCheck,
} from "lucide-react";
import { logout } from "@/services/auth";
import { apiFetch } from "@/services/api";

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    "Master Data": pathname.startsWith("/admin/master"),
    "Forms": pathname.startsWith("/admin/forms"),
  });

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  const toggleSubMenu = (label: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));

  // 🔥 UPDATE: "My Profile" dihapus dari sini
  const menu = [
    { type: "label", label: "Main Navigation" },
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
    { 
      label: "Review Laporan", 
      href: "/admin/spv/inspection",
      icon: ClipboardCheck 
    },
    
    { type: "label", label: "Asset Management" },
    {
      label: "Master Data",
      icon: Database,
      children: [
        { label: "Gedung", href: "/admin/master/gedung", icon: Building2 },
        { label: "Location", href: "/admin/master/location", icon: MapPin },
        { label: "AHU", href: "/admin/master/ahu", icon: Fan },
      ],
    },
    
    { type: "label", label: "Operational" },
    { label: "Schedule Plan", href: "/admin/schedule-plan", icon: CalendarClock },
    { label: "Schedule Inspector", href: "/admin/schedule-inspector", icon: CalendarDays },
    
    { type: "label", label: "System" },
    { label: "User Management", href: "/admin/users", icon: Users },
    { label: "Audit Trail", href: "/admin/audit-trails", icon: Activity },
    {
      label: "Forms Management",
      icon: FileText,
      children: [
        { label: "Form Template", href: "/admin/forms", icon: FileText },
        { label: "Create Form", href: "/admin/forms/create", icon: PlusSquare },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Gagal mencatat audit logout:", err);
    } finally {
      logout();
    }
  };

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
        <span className="font-bold text-teal-400 tracking-tighter text-xl">AIRA</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 bg-slate-800 rounded-lg">
          {mobileOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-teal-400" />}
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
        {/* LOGO AREA */}
        <div className="px-8 py-8 flex items-center gap-3">
          <div className="h-8 w-8 bg-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Settings size={20} className="text-slate-900" />
          </div>
          <div>
            <h1 className="text-white font-bold tracking-tight leading-none text-lg">
              AIRA <span className="text-teal-500">SYSTEM</span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-semibold">Industrial Hub</p>
          </div>
        </div>

        {/* NAVIGATION Area */}
        <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar space-y-1">
          {menu.map((item, idx) => {
            if (item.type === "label") {
              return (
                <p key={idx} className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-4 mt-6 mb-2">
                  {item.label}
                </p>
              );
            }

            if (item.href) {
              const active = isActive(item.href);
              const Icon = item.icon!;
              return (
                <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)}>
                  <div className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 mb-1 ${active ? "bg-teal-500/10 text-teal-400 font-semibold ring-1 ring-teal-500/20" : "hover:bg-white/5 hover:text-slate-200"}`}>
                    <Icon size={20} className={active ? "text-teal-400" : "text-slate-500 group-hover:text-teal-400"} />
                    <span className="text-sm">{item.label}</span>
                    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]" />}
                  </div>
                </Link>
              );
            }

            if (item.children) {
              const Icon = item.icon!;
              const isOpen = openSubMenus[item.label];
              const isChildActive = item.children.some(c => isActive(c.href));
              return (
                <div key={item.label} className="mb-1">
                  <button onClick={() => toggleSubMenu(item.label)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isChildActive && !isOpen ? "bg-white/5 text-teal-400" : "hover:bg-white/5 hover:text-slate-200"}`}>
                    <Icon size={20} className={isChildActive ? "text-teal-400" : "text-slate-500"} />
                    <span className="text-sm">{item.label}</span>
                    <ChevronDown size={14} className={`ml-auto transition-transform ${isOpen ? "rotate-180 text-teal-400" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-slate-900/30 rounded-xl mt-1 mx-2">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const active = isActive(child.href);
                          return (
                            <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)}>
                              <div className={`flex items-center gap-3 pl-10 pr-4 py-2.5 text-xs transition-colors rounded-lg ${active ? "text-teal-400 font-bold bg-teal-500/5" : "text-slate-500 hover:text-slate-200"}`}>
                                <ChildIcon size={14} />
                                {child.label}
                              </div>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            return null;
          })}
        </nav>

        {/* 🔥 FOOTER AREA (Sign Out & Profile Icon) */}
        <div className="p-4 border-t border-white/5 bg-[#0f172a] flex items-center gap-2">
          {/* Tombol Profile Ikon */}
          <Link href="/profile" onClick={() => setMobileOpen(false)}>
            <div className={`p-3 rounded-xl transition-all border border-white/5 flex items-center justify-center ${isActive("/profile") ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-white/5 text-slate-400 hover:text-teal-400 hover:bg-white/10"}`}>
              <User size={18} />
            </div>
          </Link>

          {/* Tombol Sign Out */}
          <button 
            onClick={handleLogout} 
            className="group flex-1 flex items-center justify-center gap-3 bg-red-500/5 hover:bg-red-500/10 text-red-500/70 hover:text-red-500 py-3 rounded-xl transition-all border border-red-500/10 font-semibold text-sm"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </>
  );
}