"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  ArrowRight,
  Fingerprint,
  FileCheck,
  LayoutDashboard,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Database,
  Cpu,
  X
} from "lucide-react";

// ================= DATA =================
const TECH_STACK = ["Next.js 14", "Golang", "PostgreSQL", "Framer Motion", "TailwindCSS"];

const SLIDES = [
  {
    image: "/images/dashboard.png",
    title: "Real-time Monitoring",
    text: "Visualisasi data performa unit AHU secara presisi."
  },
  {
    image: "/images/nfc.jpeg",
    title: "NFC Validation",
    text: "Verifikasi fisik teknisi di lokasi unit melalui sensor NFC."
  },
  {
    image: "/images/form.jpeg",
    title: "Digital Forms",
    text: "Dokumentasi inspeksi terstruktur tanpa penggunaan kertas."
  },
  {
    image: "/images/approval.png",
    title: "Digital Approval",
    text: "Otorisasi laporan resmi menggunakan E-Signature."
  },
  {
    image: "/images/report.png",
    title: "Auto Reporting",
    text: "Pembuatan laporan PDF otomatis untuk standarisasi industri."
  }
];

export default function Home() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mencegah scroll saat modal terbuka
  useEffect(() => {
    document.body.style.overflow = isDetailOpen ? "hidden" : "unset";
  }, [isDetailOpen]);

  return (
    <div className="min-h-screen bg-[#ffffff] font-sans antialiased text-[#1d1d1f] selection:bg-[#0066cc]/10 selection:text-[#0066cc]">
      
      {/* 🍎 MODAL DETAIL PROYEK (RESPONSIF) */}
      <AnimatePresence>
        {isDetailOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f5f5f7]/90 backdrop-blur-2xl p-4 md:p-8"
            onClick={() => setIsDetailOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] md:rounded-[40px] shadow-3xl overflow-y-auto border border-black/5 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsDetailOpen(false)}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-full transition-colors z-10"
              >
                <X size={18} />
              </button>

              <div className="p-6 md:p-16">
                <span className="text-[#0066cc] font-semibold text-xs uppercase tracking-widest">Case Study</span>
                <h2 className="text-3xl md:text-5xl font-semibold mt-3 mb-6 tracking-tight">AIRA Industrial Hub</h2>
                
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 text-[#86868b] leading-relaxed text-sm md:text-base">
                  <div className="space-y-6">
                    <section>
                      <h4 className="text-[#1d1d1f] font-semibold mb-2">Latar Belakang</h4>
                      <p>Fasilitas produksi Kimia Farma Plant Banjaran memerlukan sistem monitoring AHU yang transparan sesuai standar industri farmasi.</p>
                    </section>
                    <section>
                      <h4 className="text-[#1d1d1f] font-semibold mb-2">Tantangan</h4>
                      <p>Sistem kertas manual berisiko tinggi terhadap kesalahan data dan memperlambat alur kerja persetujuan.</p>
                    </section>
                  </div>
                  <div className="space-y-6">
                    <section>
                      <h4 className="text-[#1d1d1f] font-semibold mb-2">Hasil Akhir</h4>
                      <div className="p-5 bg-[#f5f5f7] rounded-2xl border border-[#d2d2d7]/30">
                        <p className="text-3xl font-semibold text-[#0066cc] tracking-tight">70%</p>
                        <p className="text-xs font-medium">Alur kerja lebih cepat & akurat.</p>
                      </div>
                    </section>
                  </div>
                </div>

                <div className="mt-10 pt-10 border-t border-[#d2d2d7]/30">
                  <h4 className="text-[#1d1d1f] font-semibold mb-6">Visual Preview</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="aspect-video bg-[#f5f5f7] rounded-2xl overflow-hidden border border-black/5 relative">
                       <Image src="/images/dashboard.png" alt="Preview 1" fill className="object-cover opacity-90" />
                    </div>
                    <div className="aspect-video bg-[#f5f5f7] rounded-2xl overflow-hidden border border-black/5 relative">
                       <Image src="/images/approval.png" alt="Preview 2" fill className="object-cover opacity-90" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🍎 NAVIGATION (MOBILE OPTIMIZED) */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? "bg-white/80 backdrop-blur-xl border-b border-[#d2d2d7]/30 py-3" : "bg-transparent py-5 md:py-8"
      }`}>
        <div className="max-w-[1100px] mx-auto px-5 flex justify-between items-center">
          <div className="flex items-center gap-2 font-semibold text-base md:text-lg tracking-tight">
            <div className="w-7 h-7 bg-[#1d1d1f] rounded-lg flex items-center justify-center">
                <Zap className="text-white fill-white" size={14} />
            </div>
            AIRA <span className="text-[#86868b] font-normal">SYSTEM</span>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <button 
              onClick={() => router.push("/login")}
              className="hidden sm:block text-sm font-medium text-[#1d1d1f] hover:text-[#0066cc]"
            >
              Sign In
            </button>
            <button 
              onClick={() => router.push("/login")}
              className="bg-[#0066cc] text-white px-4 py-2 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-medium shadow-sm hover:bg-[#0077ed]"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* 🍎 HERO SECTION (RESPONSIF FONT & BUTTONS) */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 bg-[#f5f5f7]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="inline-block mb-4 text-[11px] md:text-[13px] font-semibold tracking-wider text-[#0066cc] uppercase"
          >
            Industrial Case Study
          </motion.span>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-[72px] font-semibold leading-[1.1] tracking-tight mb-6 md:mb-8 text-[#1d1d1f]"
          >
            AIRA: Digitalisasi AHU <br />
            <span className="text-[#86868b]">PT Kimia Farma Plant Banjaran.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-[#86868b] text-base md:text-2xl font-normal max-w-2xl mx-auto mb-10 md:mb-14 leading-relaxed"
          >
            Transformasi inspeksi Air Handling Unit berbasis NFC dan E-Signature untuk akurasi data industri farmasi.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6"
          >
            <button 
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto bg-[#0066cc] text-white px-8 py-3.5 rounded-full text-base md:text-lg font-medium shadow-lg shadow-blue-500/10 active:scale-95"
            >
              Mulai Demo
            </button>
            <button 
              onClick={() => setIsDetailOpen(true)}
              className="group flex items-center gap-2 text-[#0066cc] text-base md:text-lg font-medium hover:underline transition"
            >
              Lihat Detail Proyek <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* 🍎 SYSTEM PREVIEW (SLIDER) */}
      <section className="py-20 md:py-32 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <Slider />
        </div>
      </section>

      {/* 🍎 FEATURES GRID (STACK ON MOBILE) */}
      <section className="py-20 md:py-32 bg-[#f5f5f7]">
        <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20">
                <Feature
                    icon={<Fingerprint size={28} />}
                    title="NFC Validation"
                    desc="Verifikasi sensor fisik menjamin kehadiran teknisi di lokasi unit."
                />
                <Feature
                    icon={<FileCheck size={28} />}
                    title="E-Signature"
                    desc="Persetujuan digital aman sesuai regulasi industri farmasi."
                />
                <Feature
                    icon={<LayoutDashboard size={28} />}
                    title="Data Analytics"
                    desc="Pantau riwayat performa filter untuk pemeliharaan prediktif."
                />
            </div>
        </div>
      </section>

      {/* 🍎 IMPACT SECTION */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-12 md:mb-16 tracking-tight">Dampak Operasional</h2>
          <div className="space-y-6 md:space-y-8 text-left inline-block">
            <Impact text="Mencapai target 100% Digital Laporan (Paperless)" />
            <Impact text="Efisiensi alur kerja approval hingga 70%" />
            <Impact text="Integritas data inspeksi terjamin sistem" />
          </div>
        </div>
      </section>

      {/* 🍎 TECH STACK (RESPONSIF GRID) */}
      <section className="py-20 md:py-32 bg-[#f5f5f7] px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">Full-Stack Development.</h2>
            <p className="text-[#86868b] text-sm md:text-base leading-relaxed mb-8">
                Backend <strong>Golang</strong> & Frontend <strong>Next.js</strong> untuk sistem yang robust dan responsif.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {TECH_STACK.map(tech => (
                <span key={tech} className="px-4 py-1.5 bg-white border border-[#d2d2d7] rounded-full text-[11px] md:text-[12px] font-medium shadow-sm">
                    {tech}
                </span>
                ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#d2d2d7]/50 text-center md:text-left shadow-sm">
                <Code2 className="text-[#0066cc] mb-3 md:mb-4 mx-auto md:mx-0" size={24} />
                <p className="text-xs md:text-sm font-semibold">Clean Architecture</p>
             </div>
             <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#d2d2d7]/50 text-center md:text-left shadow-sm">
                <Database className="text-[#0066cc] mb-3 md:mb-4 mx-auto md:mx-0" size={24} />
                <p className="text-xs md:text-sm font-semibold">PostgreSQL Relational</p>
             </div>
          </div>
        </div>
      </section>

      {/* 🍎 FOOTER CTA */}
      <footer className="py-20 md:py-32 text-center bg-white border-t border-black/5">
        <h2 className="text-2xl md:text-4xl font-semibold mb-8 md:mb-10 tracking-tight px-6">Modernisasi Industri Farmasi.</h2>
        <button
          onClick={() => router.push("/login")}
          className="bg-[#1d1d1f] text-white px-8 py-3 md:px-10 md:py-3.5 rounded-full text-sm md:text-base font-medium hover:bg-black active:scale-95 transition"
        >
          Akses Dashboard
        </button>
        <div className="mt-20 text-[10px] md:text-[12px] text-[#86868b] font-medium tracking-tight">
            © 2026 Lutfi Julpian • Industrial Hub Project
        </div>
      </footer>
    </div>
  );
}

// ================= SUB-COMPONENTS =================

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center md:items-start text-center md:text-left px-4">
      <div className="mb-5 md:mb-6 text-[#1d1d1f]">{icon}</div>
      <h3 className="font-semibold text-lg md:text-xl mb-3 tracking-tight">{title}</h3>
      <p className="text-[#86868b] leading-relaxed text-sm font-normal">{desc}</p>
    </div>
  );
}

function Impact({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 md:gap-4 text-base md:text-xl font-medium text-[#1d1d1f]">
      <CheckCircle2 className="text-[#0066cc] flex-shrink-0" size={20} />
      <span>{text}</span>
    </div>
  );
}

function Slider() {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((p) => (p === 0 ? SLIDES.length - 1 : p - 1));
  const next = () => setIndex((p) => (p === SLIDES.length - 1 ? 0 : p + 1));

  return (
    <div className="relative group px-4 md:px-0">
      <div className="relative aspect-video w-full rounded-2xl md:rounded-[32px] overflow-hidden bg-[#f5f5f7] border border-[#d2d2d7]/50 shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative w-full h-full p-4 md:p-12"
          >
            <Image src={SLIDES[index].image} alt={SLIDES[index].title} fill className="object-contain" priority />
          </motion.div>
        </AnimatePresence>

        {/* CONTROLS (HIDE ON MOBILE IF NEEDED, OR SMALLER) */}
        <button onClick={prev} className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-md p-2 md:p-3 rounded-full opacity-0 group-hover:opacity-100 transition">
          <ChevronLeft size={16} className="md:w-5 md:h-5" />
        </button>
        <button onClick={next} className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-md p-2 md:p-3 rounded-full opacity-0 group-hover:opacity-100 transition">
          <ChevronRight size={16} className="md:w-5 md:h-5" />
        </button>
      </div>

      <div className="mt-8 text-center px-4">
        <h3 className="text-lg md:text-xl font-semibold mb-2">{SLIDES[index].title}</h3>
        <p className="text-[#86868b] text-xs md:text-base leading-relaxed">{SLIDES[index].text}</p>
      </div>

      <div className="flex justify-center gap-1.5 md:gap-2 mt-6 md:mt-8">
        {SLIDES.map((_, i) => (
          <div key={i} onClick={() => setIndex(i)} className={`h-1 rounded-full cursor-pointer transition-all duration-500 ${i === index ? "w-6 md:w-8 bg-[#1d1d1f]" : "w-1.5 bg-[#d2d2d7]"}`} />
        ))}
      </div>
    </div>
  );
}