"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/api";
import { 
  ChevronLeft, 
  Camera, 
  ShieldCheck, 
  User as UserIcon, 
  Key,
  LogOut,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Profile = {
  id: string;
  npp: string;
  name: string;
  jabatan: string;
  role: string;
  avatar_url?: string;
};

const API_BASE = "http://localhost:8080";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const avatarSrc = avatarPreview
    ? `${API_BASE}${avatarPreview}?t=${Date.now()}`
    : "/avatar-default.png";

  useEffect(() => {
    (async () => {
      const res = await apiFetch<Profile>("/profile");
      setProfile(res);
      setName(res.name);
      setAvatarPreview(res.avatar_url ?? null);
    })();
  }, []);

  const saveProfile = async () => {
    try {
      setLoading(true);
      await apiFetch("/profile", {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
      alert("Profil berhasil diperbarui");
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    const auth = JSON.parse(localStorage.getItem("ahu_auth") || "{}");
    const form = new FormData();
    form.append("avatar", file);

    const res = await fetch(`${API_BASE}/api/profile/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${auth.token}` },
      body: form,
    });

    const data = await res.json();
    setAvatarPreview(data.avatar_url);
  };

  if (!profile) return (
    <div className="flex h-screen items-center justify-center bg-[#F2F2F7]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-24 font-sans antialiased">
      
      {/* IOS TOP BAR */}
      <nav className="sticky top-0 z-30 flex items-center justify-between bg-[#F2F2F7]/80 px-4 py-4 backdrop-blur-xl">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-[17px] text-blue-500"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
          <span>Kembali</span>
        </button>
        <h1 className="text-[17px] font-semibold text-black">Profil</h1>
        <button 
          onClick={saveProfile}
          disabled={loading}
          className="text-[17px] font-semibold text-blue-500 disabled:opacity-50"
        >
          {loading ? "..." : "Selesai"}
        </button>
      </nav>

      <div className="mx-auto max-w-lg px-4 pt-4">
        
        {/* AVATAR SECTION */}
        <div className="flex flex-col items-center py-6">
          <div className="relative group">
            <img
              src={avatarSrc}
              className="h-24 w-24 rounded-full border border-gray-200 bg-white object-cover shadow-sm"
              alt="Profile"
            />
            <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-500 text-white shadow-lg ring-4 ring-[#F2F2F7] active:scale-90 transition-transform">
              <Camera size={16} />
              <input hidden type="file" accept="image/*" onChange={(e) => e.target.files && uploadAvatar(e.target.files[0])} />
            </label>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-black">{profile.name}</h2>
          <p className="text-[14px] font-medium text-[#8E8E93] uppercase tracking-wide">{profile.jabatan}</p>
        </div>

        {/* INFO GROUP */}
        <div className="mt-4 overflow-hidden rounded-[14px] bg-white shadow-sm border border-gray-200/50">
          <InfoRow label="NPP" value={profile.npp} icon={<UserIcon size={18} className="text-gray-400" />} />
          <InfoRow label="Role" value={profile.role} isCaps />
          <InfoRow label="Jabatan" value={profile.jabatan} noBorder />
        </div>

        <p className="px-4 py-2 text-[13px] text-[#8E8E93]">Detail identitas resmi yang terdaftar pada sistem AHU.</p>

        {/* SECURITY GROUP */}
        <div className="mt-6 overflow-hidden rounded-[14px] bg-white shadow-sm border border-gray-200/50">
          <button 
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex w-full items-center justify-between px-4 py-3 active:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500 text-white">
                <Key size={16} />
              </div>
              <span className="text-[17px] text-black">Ubah Password</span>
            </div>
            <div className={`transform transition-transform duration-300 ${showPasswordForm ? 'rotate-90' : ''}`}>
               <ChevronLeft size={20} className="rotate-180 text-gray-300" />
            </div>
          </button>

          <AnimatePresence>
            {showPasswordForm && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-gray-50/50 px-4"
              >
                <div className="py-4 space-y-3">
                  <input
                    type="password"
                    placeholder="Password Lama"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[15px] outline-none focus:ring-1 focus:ring-blue-500"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Password Baru"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[15px] outline-none focus:ring-1 focus:ring-blue-500"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button 
                    onClick={() => {}} 
                    className="w-full rounded-lg bg-blue-500 py-2.5 font-semibold text-white shadow-sm active:bg-blue-600"
                  >
                    Update Password
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* LOGOUT */}
        <div className="mt-8 overflow-hidden rounded-[14px] bg-white shadow-sm border border-gray-200/50">
          <button className="flex w-full items-center justify-center gap-2 px-4 py-3 text-[17px] font-semibold text-red-500 active:bg-red-50 transition-colors">
            <LogOut size={20} />
            <span>Keluar Akun</span>
          </button>
        </div>

        <footer className="mt-10 text-center">
          <div className="flex items-center justify-center gap-1.5 opacity-30">
             <ShieldCheck size={14} className="text-black" />
             <span className="text-[11px] font-bold text-black uppercase tracking-widest">AHU Precision System v2.0</span>
          </div>
        </footer>

      </div>
    </div>
  );
}

function InfoRow({ label, value, noBorder, isCaps, icon }: { label: string; value: string; noBorder?: boolean; isCaps?: boolean; icon?: React.ReactNode }) {
  return (
    <div className={`flex items-center justify-between ml-4 py-3 pr-4 ${!noBorder ? 'border-b border-gray-100' : ''}`}>
      <div className="flex items-center gap-3">
        {icon && icon}
        <span className="text-[17px] text-black">{label}</span>
      </div>
      <span className={`text-[17px] text-[#8E8E93] ${isCaps ? 'uppercase' : ''}`}>{value}</span>
    </div>
  );
}