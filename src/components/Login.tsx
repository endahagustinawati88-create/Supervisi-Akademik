import React, { useState } from 'react';
import { User } from '../types';
import { BookOpen, UserCheck, Key, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { getUsers } from '../data';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setError('Username/NIP dan password wajib diisi');
      setIsLoading(false);
      return;
    }

    try {
      const users = getUsers();
      const data = users.find(u => u.username === cleanUser);

      if (!data) {
        setError('Pengguna tidak ditemukan di database.');
        setIsLoading(false);
        return;
      }

      // Validasi password hardcode sesuai role (untuk prototype)
      const role = data.role;
      const isValidPassword = 
        (role === 'kepsek' && cleanPass === '12345') ||
        (role === 'guru' && cleanPass === '123') || 
        (role !== 'guru' && role !== 'kepsek' && cleanPass === '1');

      if (!isValidPassword) {
        setError('Password salah.');
        setIsLoading(false);
        return;
      }

      // Transform DB row to User object
      const loggedUser: User = {
        id: data.id,
        username: data.username,
        name: data.name,
        role: data.role,
        nip: data.nip,
        schoolName: data.school_name,
        className: data.class_name,
        subject: data.subject,
        photoUrl: data.photo_url,
        driveUrl: data.drive_url,
        supervisionSchedule: data.supervision_schedule,
        moduleIdentity: data.module_topic ? {
          topic: data.module_topic,
          timeAllocation: data.module_time_allocation,
          targetPhase: data.module_target_phase
        } : undefined
      };

      onLoginSuccess(loggedUser);
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan koneksi.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-slate-800/90 border border-slate-700/50 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8"
      >
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center tracking-tight">
            SIPRO-BELAJAR
          </h1>
          <p className="text-xs text-slate-400 text-center mt-1">
            Sistem Supervisi Observasi Pembelajaran Real-Time
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-300 leading-relaxed font-medium">{error}</p>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Username / NIP
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <UserCheck className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                placeholder="Masukkan 'admin', 'pengawas', atau NIP Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900/60 text-white text-sm pl-10 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Key className="w-4.5 h-4.5" />
              </span>
              <input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/60 text-white text-sm pl-10 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl text-sm transition-all transform active:scale-[0.98] shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            Masuk ke Dashboard
          </button>
        </form>


        {/* Footer info */}
        
      </motion.div>
    </div>
  );
}
