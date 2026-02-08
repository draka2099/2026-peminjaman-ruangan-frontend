import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn } from 'lucide-react';

// Sesuai dengan data dari DatabaseSeeder.cs
const quickFillCredentials = [
  { label: 'Admin', email: 'admin@kampus.ac.id', password: 'admin123' },
  { label: 'Dosen', email: 'budi.santoso@kampus.ac.id', password: 'dosen123' },
  { label: 'Mahasiswa', email: 'ahmad.rizki@student.kampus.ac.id', password: 'mahasiswa123' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Email atau password salah');
      }
    } catch {
      setError('Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (cred: typeof quickFillCredentials[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image with Overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("images/Gedung 5 PENS-thumbnail.jpg")',
          }}
        />
        <div className="absolute inset-0 bg-blue-600 opacity-80" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          <h1 className="text-5xl font-bold mb-4">PENS Booking</h1>
          <p className="text-xl text-blue-100 text-center max-w-md">
            Sistem Peminjaman Ruangan Kampus
          </p>
          <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-xl">
            <p className="text-blue-100 text-center">
              Kelola peminjaman ruangan dengan mudah dan efisien
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600">PENS Booking</h1>
            <p className="text-gray-500">Sistem Peminjaman Ruangan Kampus</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Selamat Datang</h2>
              <p className="text-gray-500 mt-2">Masuk ke akun Anda</p>
            </div>

            {/* Quick Fill Buttons */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2 text-center">Quick Login:</p>
              <div className="flex gap-2 justify-center">
                {quickFillCredentials.map((cred) => (
                  <button
                    key={cred.label}
                    type="button"
                    onClick={() => handleQuickFill(cred)}
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                  >
                    {cred.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@kampus.ac.id"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={20} />
                    Masuk
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            © 2026 PENS Booking. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
