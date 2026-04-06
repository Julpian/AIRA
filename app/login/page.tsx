"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/api";
import { saveAuth } from "@/services/auth";
import { getDashboardRoute, Role } from "@/services/role";
import { Inter } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion"; // 🔥 PERBAIKAN: Ditambahkan AnimatePresence di sini
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

type LoginResponse = {
  token: string;
  role: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          npp: username,
          password,
        }),
      });

      const role = res.role as Role;
      saveAuth(res.token, role);
      router.replace(getDashboardRoute(role));
    } catch {
      setError("NPP atau kata sandi salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-[#ffffff] text-[#1d1d1f] antialiased selection:bg-blue-100`}>
      
      {/* 🍎 APPLE-STYLE SOFT BACKGROUND */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Menggunakan syntax bg-blue-500/3 sesuai saran linter untuk 0.03 opacity */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/3 blur-[120px] rounded-full" />
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 pt-10">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[380px]"
        >
          {/* 🍎 LOGO SECTION (REFINED) */}
          <div className="flex flex-col items-center mb-10 md:mb-12">
            <div className="transition-all duration-500 hover:scale-105">
              <Image
                src="/logo-kf.png" // 👈 PASTIKAN nama file & ekstensi (.png/.jpg) sama persis di folder public
                alt="Kimia Farma"
                width={160}  // Ukuran desktop (akan mengecil otomatis karena CSS)
                height={80}  // Sesuaikan dengan aspek rasio logo asli
                className="w-32 md:w-40 h-auto object-contain" // Kontrol ukuran via Tailwind
                priority
              />
            </div>

            <div className="text-center mt-6 space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                AIRA System
              </h1>
              <p className="text-[#86868b] text-sm font-medium">
                Masuk untuk manajemen unit AHU
              </p>
            </div>
          </div>

          {/* LOGIN CARD */}
          <div className="bg-white/70 backdrop-blur-2xl border border-[#d2d2d7]/50 rounded-[28px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                login();
              }}
              className="space-y-4"
            >
              {/* INPUT NPP */}
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="NPP"
                  className="w-full px-5 py-3.5 rounded-2xl bg-[#f5f5f7] border border-transparent focus:border-[#0066cc] focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none text-[15px] transition-all duration-300 placeholder:text-[#86868b]"
                  required
                />
              </div>

              {/* INPUT PASSWORD */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kata sandi"
                  className="w-full px-5 py-3.5 rounded-2xl bg-[#f5f5f7] border border-transparent focus:border-[#0066cc] focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none text-[15px] transition-all duration-300 placeholder:text-[#86868b] pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* ERROR MESSAGE DENGAN ANIMATE PRESENCE */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[#ff3b30] text-xs font-medium text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-[#0066cc] hover:bg-[#0077ed] text-white py-3.5 rounded-2xl text-[15px] font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* FOOTER */}
      <footer className="py-8 text-center">
        <p className="text-[#86868b] text-[11px] font-medium tracking-wide uppercase">
          Developed by{" "}
          <span className="text-[#1d1d1f]">
            Lutfi Julpian | Yayang Lutfiana
          </span>
          {" "}• Industrial Hub 2026
        </p>
      </footer>
    </div>
  );
}