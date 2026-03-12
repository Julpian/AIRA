"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Zap, ShieldCheck, BarChart3, Clock, ArrowRight, PlayCircle } from "lucide-react";

// ================= STYLES (Apple Minimalist) =================
const theme = {
  colors: {
    label: "#1d1d1f",
    secondaryLabel: "#86868b",
    accent: "#0071e3",
    bg: "#ffffff",
    secondaryBg: "#f5f5f7",
    border: "rgba(0,0,0,0.1)",
  },
  animation: {
    spring: { type: "spring", stiffness: 100, damping: 20 },
    bounce: { type: "spring", stiffness: 300, damping: 10 },
  }
};

// ================= COMPONENTS =================

const NavItem = ({ label }: { label: string }) => (
  <a href="#" className="text-[13px] font-medium text-[#1d1d1f]/80 hover:text-[#0071e3] transition-colors">
    {label}
  </a>
);

export default function Home() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  // Efek parallax halus untuk hero
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-[#1d1d1f]">
      
      {/* 🍎 NAVIGATION */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/70 backdrop-blur-xl border-b py-3" : "bg-transparent py-5"
      }`}>
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Image src="/logo-aira.png" alt="Logo" width={20} height={20} />
              </div>
              <span className="text-lg font-bold tracking-tight">AIRA</span>
            </motion.div>
            
            <div className="hidden md:flex items-center gap-6">
              {["Fitur", "Solusi", "Klien", "Bantuan"].map(item => <NavItem key={item} label={item} />)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/login")}
              className="text-sm font-medium hover:text-[#0071e3] transition-all"
            >
              Sign In
            </button>
            <button className="bg-[#1d1d1f] text-white text-[13px] font-medium px-4 py-2 rounded-full hover:bg-black/80 transition-all shadow-sm">
              Coba Gratis
            </button>
          </div>
        </div>
      </nav>

      {/* 🍎 HERO SECTION */}
      <section className="relative pt-44 pb-20 overflow-hidden">
        <motion.div style={{ y: y1, opacity }} className="absolute inset-0 -z-10 flex justify-center">
          <div className="w-[800px] h-[400px] bg-[#0071e3]/5 blur-[120px] rounded-full" />
        </motion.div>

        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-6xl md:text-[84px] font-bold tracking-[-0.04em] leading-[1.05] mb-8">
              Cerdas. Presisi. <br />
              <span className="text-[#0071e3]">Sangat Manusiawi.</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-[#86868b] font-medium leading-relaxed mb-12">
              Transformasi pelaporan AHU Anda dari tumpukan kertas menjadi dashboard digital yang intuitif.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => router.push("/login")}
                className="w-full sm:w-auto bg-[#0071e3] text-white text-lg font-semibold px-10 py-4 rounded-full hover:bg-[#0077ed] transition-all shadow-lg shadow-blue-500/20"
              >
                Mulai Sekarang
              </button>
              <button className="flex items-center gap-2 text-lg font-semibold hover:text-[#0071e3] transition-all group">
                <PlayCircle className="text-[#0071e3] group-hover:scale-110 transition-transform" />
                Lihat Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🍎 PRODUCT PREVIEW */}
      <section className="px-6 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-[1100px] mx-auto relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-blue-100/50 to-transparent blur-3xl -z-10 scale-95 transition-transform group-hover:scale-100" />
          <div className="bg-white rounded-[32px] p-4 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.15)] border border-black/5">
            <Image
              src="/dashboard-preview.png"
              alt="Dashboard"
              width={1400}
              height={900}
              className="rounded-[20px] w-full h-auto"
            />
          </div>
        </motion.div>
      </section>

      {/* 🍎 FEATURES GRID (Modern Apple Style) */}
      <section className="bg-[#f5f5f7] py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-20 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Kelebihan yang <br/>terasa sejak hari pertama.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureItem 
              icon={<Zap className="w-6 h-6" />}
              title="Respons Cepat"
              desc="Notifikasi real-time jika ada anomali pada sistem AHU Anda."
            />
            <FeatureItem 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Audit Aman"
              desc="Laporan digital terenkripsi yang siap kapanpun audit dilakukan."
            />
            <FeatureItem 
              icon={<BarChart3 className="w-6 h-6" />}
              title="Visual Data"
              desc="Grafik indah yang memudahkan pengambilan keputusan tim."
            />
            <FeatureItem 
              icon={<Clock className="w-6 h-6" />}
              title="Auto-Report"
              desc="Jadwal inspeksi yang diatur secara otomatis tanpa terlewat."
            />
          </div>
        </div>
      </section>

      {/* 🍎 FOOTER */}
      <footer className="py-12 border-t border-[#d2d2d7]">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[12px] text-[#86868b] flex gap-8">
            <p>© 2026 {SITE_NAME}</p>
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
          <div className="text-[12px] text-[#86868b]">
            Dibuat dengan dedikasi untuk industri 4.0
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-[24px] shadow-sm border border-transparent hover:border-[#0071e3]/10 transition-all h-full"
    >
      <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3] mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-[#86868b] leading-relaxed text-sm font-medium">{desc}</p>
    </motion.div>
  );
}

const SITE_NAME = "AIRA System";