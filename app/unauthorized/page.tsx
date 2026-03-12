export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-6">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center border border-slate-200">
        
        <div className="mb-4">
          <h1 className="text-4xl font-bold text-red-600">403</h1>
          <p className="text-lg font-semibold text-slate-700 mt-1">
            Access Denied
          </p>
        </div>

        <p className="text-sm text-slate-500 mb-6">
          Anda tidak memiliki izin untuk mengakses halaman ini.  
          Silakan kembali ke halaman login atau hubungi administrator jika
          merasa ini adalah kesalahan.
        </p>

        <a
          href="/login"
          className="inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-500 transition"
        >
          Kembali ke Login
        </a>
      </div>
    </div>
  );
}