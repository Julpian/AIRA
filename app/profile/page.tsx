"use client";

import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/api";
import { 
  ChevronLeft, 
  Camera, 
  User as UserIcon, 
  Key,
  LogOut,
  ChevronRight,
  BadgeCheck,
  Briefcase,
  Fingerprint
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

type SidebarItemProps = {
  icon: ReactNode;
  label: string;
  active?: boolean;
  variant?: "default" | "danger";
  onClick?: () => void;
};

type InfoRowMobileProps = {
  label: string;
  value: string;
  editable?: boolean;
  onChange?: (value: string) => void;
  isCaps?: boolean;
  icon?: ReactNode;
};

type InputGroupProps = {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  isCaps?: boolean;
};

const API_BASE = "http://localhost:8080";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const avatarSrc = avatarPreview
    ? `${API_BASE}${avatarPreview}?t=${Date.now()}`
    : "/avatar-default.png";

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch<Profile>("/profile");
        setProfile(res);
        setName(res.name);
        setAvatarPreview(res.avatar_url ?? null);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
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
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="h-8 w-8 rounded-full border-4 border-blue-500/20 border-t-blue-500" 
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-black selection:bg-blue-100">
      
      {/* --- DESKTOP VIEW --- */}
      <div className="hidden md:block h-screen overflow-hidden">
        <div className="flex h-full max-w-6xl mx-auto py-10 px-6 gap-8">
          
          {/* Sidebar Menu (Desktop) */}
          <aside className="w-72 space-y-2">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors mb-6"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
              <span className="font-semibold">Kembali</span>
            </button>
            
            <div className="bg-white/50 backdrop-blur-md rounded-2xl p-2 border border-white/50 shadow-sm">
              <SidebarItem icon={<UserIcon size={18} />} label="Informasi Pribadi" active />
              <SidebarItem icon={<Key size={18} />} label="Keamanan" />
              <div className="h-px bg-gray-100 my-2 mx-4" />
              <SidebarItem 
                icon={<LogOut size={18} />} 
                label="Keluar Akun" 
                variant="danger" 
                onClick={() => router.push("/login")} 
              />
            </div>
          </aside>

          {/* Main Content (Desktop) */}
          <main className="flex-1 bg-white rounded-4xl shadow-xl border border-gray-200/50 overflow-y-auto no-scrollbar">
            <header className="p-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <h1 className="text-2xl font-bold tracking-tight">Informasi Pribadi</h1>
              <button 
                onClick={saveProfile}
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </header>

            <div className="p-8 max-w-2xl">
              {/* Avatar Desktop */}
              <div className="flex items-center gap-6 mb-10">
                <div className="relative h-28 w-28">
                  <Image 
                    src={avatarSrc} 
                    alt="Profile" 
                    fill 
                    className="rounded-full object-cover border-4 border-white shadow-md"
                    unoptimized // Karena API lokal biasanya tidak terdaftar di next.config images
                  />
                  <label className="absolute bottom-1 right-1 h-8 w-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors z-20">
                    <Camera size={16} className="text-gray-600" />
                    <input hidden type="file" accept="image/*" onChange={(e) => e.target.files && uploadAvatar(e.target.files[0])} />
                  </label>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{profile.name}</h3>
                  <p className="text-gray-500 font-medium">{profile.jabatan}</p>
                </div>
              </div>

              {/* Form Desktop */}
              <div className="grid grid-cols-2 gap-6">
                <InputGroup label="Nama Lengkap" value={name} onChange={setName} />
                <InputGroup label="NPP (Nomor Pokok Pegawai)" value={profile.npp} disabled />
                <InputGroup label="Role Akses" value={profile.role} disabled isCaps />
                <InputGroup label="Unit Kerja / Jabatan" value={profile.jabatan} disabled />
              </div>

              {/* Password Section Desktop */}
              <div className="mt-12 border-t pt-8">
                <h3 className="text-lg font-bold mb-4">Pengaturan Kata Sandi</h3>
                <div className="space-y-4">
                   <div className="flex gap-4">
                      <input type="password" placeholder="Password Lama" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors" />
                      <input type="password" placeholder="Password Baru" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors" />
                   </div>
                   <button className="text-blue-500 font-semibold text-sm hover:underline">Ubah Password</button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className="md:hidden">
        {/* IOS Navigation */}
        <nav className="sticky top-0 z-40 bg-[#F2F2F7]/80 backdrop-blur-xl border-b border-gray-200/50 px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center text-blue-500">
            <ChevronLeft size={24} strokeWidth={2.5} />
            <span className="text-[17px]">Kembali</span>
          </button>
          <span className="font-semibold text-[17px]">Profil</span>
          <button onClick={saveProfile} className="text-blue-500 font-semibold text-[17px]">Selesai</button>
        </nav>

        <div className="px-4 pb-12">
          {/* Mobile Header */}
          <div className="flex flex-col items-center pt-8 pb-6">
            <div className="relative h-24 w-24">
              <Image 
                src={avatarSrc} 
                alt="Profile" 
                fill 
                className="rounded-full border-2 border-white object-cover shadow-xl"
                unoptimized
              />
              <label className="absolute bottom-0 right-0 h-8 w-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg ring-4 ring-[#F2F2F7] active:scale-90 transition-transform z-20">
                <Camera size={16} />
                <input hidden type="file" accept="image/*" onChange={(e) => e.target.files && uploadAvatar(e.target.files[0])} />
              </label>
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-center">{profile.name}</h2>
            <p className="text-[14px] font-medium text-gray-500 uppercase tracking-widest mt-1">{profile.jabatan}</p>
          </div>

          {/* Identity Section (Mobile) */}
          <h3 className="px-4 py-2 text-[13px] text-gray-500 uppercase font-medium tracking-wide">Identitas Pegawai</h3>
          <div className="bg-white rounded-[18px] shadow-sm border border-gray-200/50 divide-y divide-gray-100 overflow-hidden">
             <InfoRowMobile label="Nama" value={name} editable onChange={setName} icon={<UserIcon size={18} className="text-blue-500" />} />
             <InfoRowMobile label="NPP" value={profile.npp} icon={<Fingerprint size={18} className="text-gray-400" />} />
             <InfoRowMobile label="Role" value={profile.role} isCaps icon={<BadgeCheck size={18} className="text-green-500" />} />
             <InfoRowMobile label="Jabatan" value={profile.jabatan} icon={<Briefcase size={18} className="text-orange-400" />} />
          </div>

          {/* Security Section (Mobile) */}
          <h3 className="mt-8 px-4 py-2 text-[13px] text-gray-500 uppercase font-medium tracking-wide">Keamanan</h3>
          <div className="bg-white rounded-[18px] shadow-sm border border-gray-200/50 overflow-hidden">
            <button 
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="flex w-full items-center justify-between px-4 py-4 active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-blue-200 shadow-lg">
                  <Key size={18} />
                </div>
                <span className="font-medium">Ubah Kata Sandi</span>
              </div>
              <ChevronRight size={20} className={`text-gray-300 transition-transform ${showPasswordForm ? 'rotate-90' : ''}`} />
            </button>

            <AnimatePresence>
              {showPasswordForm && (
                <motion.div 
                  initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                  className="overflow-hidden bg-gray-50/50 border-t border-gray-100"
                >
                  <div className="p-4 space-y-3">
                    <input type="password" placeholder="Password Lama" className="w-full h-12 rounded-xl border-none bg-white px-4 text-[16px] shadow-sm outline-none ring-1 ring-gray-200 focus:ring-blue-500" />
                    <input type="password" placeholder="Password Baru" className="w-full h-12 rounded-xl border-none bg-white px-4 text-[16px] shadow-sm outline-none ring-1 ring-gray-200 focus:ring-blue-500" />
                    <button className="w-full h-12 bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-100 active:scale-[0.98] transition-transform mt-2">
                      Simpan Password
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions (Mobile) */}
          <div className="mt-10">
            <button 
              onClick={() => router.push("/login")} // UPDATE DI SINI
              className="flex w-full items-center justify-center gap-2 bg-white text-red-500 h-14 rounded-[18px] font-bold border border-gray-200 shadow-sm active:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              <span>Keluar dari Akun</span>
            </button>
          </div>

          <p className="mt-8 text-center text-gray-400 text-xs">
            AHU Precision System v2.0.4<br/>Industrial Hub © 2026
          </p>
        </div>
      </div>
    </div>
  );
}

/** HELPER COMPONENTS **/

function SidebarItem({ icon, label, active, variant = "default", onClick }: SidebarItemProps) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' : 
      variant === "danger" ? 'text-red-500 hover:bg-red-50' : 'text-gray-600 hover:bg-gray-100'
    }`}>
      {icon}
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}

function InputGroup({ label, value, onChange, disabled, isCaps }: InputGroupProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">{label}</label>
      <input 
        disabled={disabled}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full px-4 py-3 rounded-xl border transition-all outline-none ${
          disabled ? 'bg-gray-50 border-gray-100 text-gray-500' : 'bg-white border-gray-200 focus:border-blue-500'
        } ${isCaps ? 'uppercase' : ''}`}
      />
    </div>
  );
}

function InfoRowMobile({
  label,
  value,
  editable,
  onChange,
  isCaps,
  icon,
}: InfoRowMobileProps) {
  return (
    <div className="flex items-center gap-4 px-4 py-4">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{label}</p>
        {editable ? (
          <input 
            value={value} 
            onChange={(e) => onChange?.(e.target.value)}
            className="text-[17px] font-medium text-black bg-transparent w-full outline-none"
          />
        ) : (
          <p className={`text-[17px] font-medium text-black ${isCaps ? 'uppercase' : ''}`}>{value}</p>
        )}
      </div>
    </div>
  );
}