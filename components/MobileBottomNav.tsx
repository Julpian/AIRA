"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { logout } from "@/services/auth";

type ItemProps = {
  href?: string;
  iconSrc: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

function NavItem({ href, iconSrc, label, active, onClick }: ItemProps) {
  const base = "flex flex-col items-center justify-center gap-1 transition-all duration-300";

  if (onClick) {
    return (
      <button onClick={onClick} className={`${base} active:scale-90`}>
        <div className="relative p-1">
           <img src={iconSrc} alt={label} className="w-6 h-6 grayscale opacity-60 group-active:opacity-100" />
        </div>
        <span className="text-[10px] font-bold text-gray-400">{label}</span>
      </button>
    );
  }

  return (
    <Link href={href!} className="relative group">
      <div className={`${base} ${active ? "scale-110" : "hover:opacity-70"}`}>
        <div className="relative">
          <img 
            src={iconSrc} 
            alt={label} 
            className={`w-6 h-6 transition-all ${active ? "brightness-100" : "grayscale opacity-50"}`} 
          />
          {/* Dot Indikator Apple Style */}
          {active && (
            <motion.div 
              layoutId="nav-dot"
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"
            />
          )}
        </div>
        <span className={`text-[10px] tracking-tight font-bold ${active ? "text-blue-500" : "text-gray-400"}`}>
          {label}
        </span>
      </div>
    </Link>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/inspection/dashboard" && pathname.startsWith(href));

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 px-6 pb-6 pt-2 pointer-events-none">
      <div
        className="
          mx-auto max-w-md h-20
          bg-white/80 backdrop-blur-2xl
          border border-white/40
          shadow-[0_8px_32px_rgba(0,0,0,0.08)]
          rounded-[2.5rem]
          grid grid-cols-5 items-center
          pointer-events-auto
          px-2
        "
      >
        <NavItem
          href="/inspection/dashboard"
          iconSrc="/IconMobile/home.png"
          label="Home"
          active={isActive("/inspection/dashboard")}
        />

        <NavItem
          href="/inspection/tasks"
          iconSrc="/IconMobile/task.png"
          label="Tasks"
          active={isActive("/inspection/tasks")}
        />

        {/* CENTER SCAN BUTTON - Floating Apple Style */}
        <div className="flex flex-col items-center justify-center -translate-y-2">
          <Link href="/inspection/scan-nfc">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className="
                h-14 w-14 rounded-2xl
                bg-gradient-to-br from-blue-500 to-blue-600
                flex items-center justify-center
                shadow-lg shadow-blue-200
                border-2 border-white
              "
            >
              <img
                src="/IconMobile/NFC.png"
                alt="Scan"
                className="w-7 h-7 brightness-0 invert"
              />
            </motion.div>
          </Link>
          <span className="text-[10px] font-bold text-blue-500 mt-1">Scan</span>
        </div>

        <NavItem
          href="/profile"
          iconSrc="/IconMobile/profil.png"
          label="Profile"
          active={isActive("/profile")}
        />

        <NavItem
          iconSrc="/IconMobile/logout.png"
          label="Logout"
          onClick={logout}
        />
      </div>
    </div>
  );
}