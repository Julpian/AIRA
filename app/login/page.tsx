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

/* ✅ TYPE FIX (ganti any) */
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

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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

  return (
    <div className={`${inter.className} min-h-screen bg-[#fbfbfd] text-[#1d1d1f] flex items-center justify-center`}>
      
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#0066cc]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#5e5ce6]/5 blur-[120px] rounded-full" />
      </div>

      <main className="w-full max-w-[1000px] md:px-6">
        
        {/* DESKTOP */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden md:flex bg-white/70 backdrop-blur-3xl border border-white/40 shadow-xl rounded-3xl overflow-hidden min-h-[600px]"
        >
          {/* LEFT */}
          <div className="w-[40%] bg-[#f5f5f7]/50 p-12 flex flex-col justify-between border-r">
            <div>
              <Image src="/logo-kf.png" alt="Logo" width={130} height={50} className="mb-12" />
              <h2 className="text-3xl font-bold mb-4">
                Manajemen AHU <br />dalam satu sistem.
              </h2>
              <p className="text-gray-500 text-sm">
                AIRA System memberikan kendali penuh terhadap unit udara industri Anda.
              </p>
            </div>

            <div className="flex items-center gap-3 text-sm bg-white p-3 rounded-xl">
              <ShieldCheck size={16} className="text-blue-600" />
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
        <div className="md:hidden px-6">
          <div className="text-center mb-8">
            <Image src="/logo-kf.png" alt="Logo" width={120} height={45} className="mx-auto mb-4" />
            <h1 className="text-xl font-bold">AIRA System</h1>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
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
    </div>
  );
}

/* ✅ FIXED: no more any */
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
      {/* Username */}
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="NPP"
        className="w-full px-4 py-3 rounded-xl bg-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
        required
      />

      {/* Password */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-3 rounded-xl bg-gray-100 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-red-500 text-sm text-center"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : "Masuk"}
        {!loading && <ChevronRight size={16} />}
      </button>
    </form>
  );
}