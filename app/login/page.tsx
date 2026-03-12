"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/api";
import { saveAuth } from "@/services/auth";
import { getDashboardRoute, Role } from "@/services/role";

type LoginResponse = {
  token: string;
  role: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      setError("Server sedang mati, harus di aktifkan sama Lutfi Julpian Terimakasih.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] text-[#1D1D1F] font-sans">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        
        {/* Card Login */}
        <div className="w-full max-auto max-w-[400px] bg-white p-10 rounded-[22px] shadow-sm border border-gray-200/50">
          
          <div className="text-center mb-8">
            <h1 className="text-[28px] font-semibold tracking-tight mb-2">Masuk</h1>
            <p className="text-[#86868B] text-sm">Gunakan akun NPP Anda untuk melanjutkan.</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
            className="space-y-4"
          >
            {/* Input Group */}
            <div className="space-y-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="NPP"
                className="w-full px-4 py-3 bg-[#F5F5F7] border border-transparent rounded-xl focus:border-[#0071E3] focus:bg-white focus:ring-4 focus:ring-[#0071E3]/10 transition-all outline-none text-[17px]"
                required
              />
              
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata Sandi"
                className="w-full px-4 py-3 bg-[#F5F5F7] border border-transparent rounded-xl focus:border-[#0071E3] focus:bg-white focus:ring-4 focus:ring-[#0071E3]/10 transition-all outline-none text-[17px]"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-[#FF3B30] text-xs text-center font-medium mt-2">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-[17px]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                "Lanjutkan"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
             <a href="#" className="text-[#0066CC] hover:underline text-sm">Lupa kata sandi?</a>
          </div>
        </div>
      </div>

      {/* Footer / Credit */}
      <footer className="py-8 text-center">
        <p className="text-[#86868B] text-[12px] tracking-wide uppercase font-medium">
          Developed by 
          <span className="text-[#1D1D1F]"> Yayang Lutfiana | Lutfi Julpian</span>
        </p>
      </footer>
    </div>
  );
}