import React, { useState } from 'react';
import { User } from '../types';
import { BookOpen, UserCheck, Shield, Key, FileText, AlertCircle, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

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
      const { data, error: sbError } = await supabase
        .from('users')
        .select('*')
        .eq('username', cleanUser)
        .single();

      if (sbError || !data) {
        setError('Pengguna tidak ditemukan di database.');
        setIsLoading(false);
        return;
      }

      // Validasi password hardcode sesuai role (untuk prototype)
      const role = data.role;
      const isValidPassword = 
        (role === 'guru' && cleanPass === '123') || 
        (role !== 'guru' && cleanPass === '1');

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

  const quickLogin = (type: 'admin' | 'pengawas' | 'kepsek' | 'guru1' | 'guru2') => {
    if (type === 'admin') {
      setUsername('admin');
      setPassword('1');
    } else if (type === 'pengawas') {
      setUsername('pengawas');
      setPassword('1');
    } else if (type === 'kepsek') {
      setUsername('kepsek');
      setPassword('1');
    } else if (type === 'guru1') {
      setUsername('198808122015032001'); // Pastikan NIP ini di-seed
      setPassword('123');
    } else if (type === 'guru2') {
      setUsername('199002152019031002'); // Pastikan NIP ini di-seed
      setPassword('123');
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
                placeholder="Masukkan 'admin', 'kepsek', atau NIP Anda"
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

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700/60"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-slate-800 text-slate-400">Uji Coba Cepat (Dummy)</span>
          </div>
        </div>

        {/* Quick Demo Access Buttons */}
        <div className="grid grid-cols-1 gap-2.5">
          <button
            type="button"
            onClick={() => quickLogin('admin')}
            className="w-full py-2 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl text-left flex items-center justify-between text-xs text-red-300 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-400" />
              <div>
                <span className="font-semibold block text-red-200">Login sebagai System Admin</span>
                <span className="text-[10px] text-slate-400">User: admin | Pass: 1</span>
              </div>
            </div>
            <span className="text-[10px] bg-red-500/20 px-2 py-0.5 rounded text-red-300 font-bold uppercase">Admin</span>
          </button>

          <button
            type="button"
            onClick={() => quickLogin('pengawas')}
            className="w-full py-2 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl text-left flex items-center justify-between text-xs text-indigo-300 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="font-semibold block text-indigo-200">Login sebagai Pengawas</span>
                <span className="text-[10px] text-slate-400">User: pengawas | Pass: 1</span>
              </div>
            </div>
            <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-300 font-bold uppercase">Pengawas</span>
          </button>
          
          <button
            type="button"
            onClick={() => quickLogin('kepsek')}
            className="w-full py-2 px-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 rounded-xl text-left flex items-center justify-between text-xs text-purple-300 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <div>
                <span className="font-semibold block text-purple-200">Login sebagai Kepala Sekolah</span>
                <span className="text-[10px] text-slate-400">User: kepsek | Pass: 1</span>
              </div>
            </div>
            <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded text-purple-300 font-bold uppercase">Kepsek</span>
          </button>

          <button
            type="button"
            onClick={() => quickLogin('guru1')}
            className="w-full py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl text-left flex items-center justify-between text-xs text-emerald-300 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-semibold block text-emerald-200">Endah Agustinawati, S.Pd</span>
                <span className="text-[10px] text-slate-400">NIP: 1988...2001 | Pass: 123</span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 font-bold uppercase">Guru</span>
          </button>

          <button
            type="button"
            onClick={() => quickLogin('guru2')}
            className="w-full py-2 px-3 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 hover:border-teal-500/50 rounded-xl text-left flex items-center justify-between text-xs text-teal-300 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" />
              <div>
                <span className="font-semibold block text-teal-200">Ahmad Subagio, S.Pd</span>
                <span className="text-[10px] text-slate-400">NIP: 1990...1002 | Pass: 123</span>
              </div>
            </div>
            <span className="text-[10px] bg-teal-500/20 px-2 py-0.5 rounded text-teal-300 font-bold uppercase">Guru</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-[10px] text-slate-500">
          SIPRO-BELAJAR SMP Negeri 1 Telaga &copy; 2026.
          <br />
          Pengawas Pendamping: Imran Tululi, S.Pd, M.Pd
        </div>
      </motion.div>
    </div>
  );
}
