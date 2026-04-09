"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/api";
import { saveAuth } from "@/services/auth";
import { getDashboardRoute, Role } from "@/services/role";
import { Inter } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, ShieldCheck, ChevronRight } from "lucide-react";
import Image from "next/image";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type LoginResponse = {
  token: string;
  role: string;
};

type LoginFormProps = {
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  error: string | null;
  loading: boolean;
  onSubmit: () => void;
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
        body: JSON.stringify({ npp: username, password }),
      });

      const role = res.role as Role;
      saveAuth(res.token, role);
      router.replace(getDashboardRoute(role));
    } catch {
      setError("NPP atau kata sandi tidak terdaftar.");
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className={`${inter.className} min-h-screen bg-[#fbfbfd] text-[#1d1d1f] flex flex-col items-center justify-center relative overflow-hidden`}>
      
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#0066cc]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#5e5ce6]/5 blur-[120px] rounded-full" />
      </div>

      <main className="w-full max-w-[1000px] md:px-6 z-10">
        
        {/* DESKTOP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex bg-white/70 backdrop-blur-3xl border border-white/40 shadow-2xl rounded-[32px] overflow-hidden min-h-[600px]"
        >
          {/* LEFT */}
          <div className="w-[40%] bg-[#f5f5f7]/50 p-12 flex flex-col justify-between border-r border-gray-100">
            <div>
              <Image src="/logo-kf.png" alt="Logo" width={130} height={50} className="mb-12" />
              <h2 className="text-3xl font-bold mb-4">
                Manajemen AHU <br />dalam satu sistem.
              </h2>
              <p className="text-gray-500 text-sm">
                AIRA System memberikan kendali penuh terhadap unit udara industri Anda.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-400 bg-white/50 py-2 px-4 rounded-full w-fit">
              <ShieldCheck size={14} className="text-blue-600" />
              Enkripsi Enterprise
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex-1 p-16 flex flex-col justify-center">
            <div className="max-w-[320px] mx-auto w-full">
              <h1 className="text-2xl font-semibold mb-2">Selamat Datang</h1>
              <p className="text-gray-500 text-sm mb-8">Masuk dengan akun NPP Anda</p>

              <LoginForm
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                error={error}
                loading={loading}
                onSubmit={login}
              />
            </div>
          </div>
        </motion.div>

        {/* MOBILE */}
        <div className="md:hidden px-6 pt-12 pb-24">
          <div className="text-center mb-10">
            <Image src="/logo-kf.png" alt="Logo" width={120} height={45} className="mx-auto mb-6" />
            <h1 className="text-2xl font-bold">AIRA System</h1>
          </div>

          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
            <LoginForm
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              error={error}
              loading={loading}
              onSubmit={login}
            />
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="w-full py-8 text-center text-xs text-gray-400">
        <p>
          Developed by <span className="text-gray-600 font-medium">Lutfi Julpian | Yayang Lufiana</span>
        </p>
        <p className="mt-1 opacity-70">
          &copy; {currentYear} AIRA System
        </p>
      </footer>
    </div>
  );
}

function LoginForm({
  username,
  setUsername,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  error,
  loading,
  onSubmit,
}: LoginFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="NPP"
        className="w-full px-5 py-3.5 rounded-2xl bg-[#f5f5f7] focus:ring-4 focus:ring-blue-500/10 outline-none"
        required
      />

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-5 py-3.5 rounded-2xl bg-[#f5f5f7] focus:ring-4 focus:ring-blue-500/10 outline-none pr-12"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div className="text-red-500 text-sm text-center">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3.5 rounded-2xl flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : "Masuk"}
        {!loading && <ChevronRight size={18} />}
      </button>
    </form>
  );
}