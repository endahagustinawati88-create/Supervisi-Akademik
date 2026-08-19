import React, { useState, useEffect } from 'react';
import { User, Supervision, PredicateType, SupervisionCategory } from '../types';
import { getInstrumentItems, getCategories } from '../data';
import { getUsers } from '../data';
import { 
  Users, Award, Calendar, BookOpen, Search, Filter, ClipboardList, 
  Plus, ArrowUpRight, BarChart3, Clock, Trash2, Edit2, Eye, UserPlus, X, LogOut, Download 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { generateSupervisionPDF } from '../lib/pdfGenerator';
import InstrumentViewer from './InstrumentViewer';

interface AdminDashboardProps {
  currentUser: User;
  supervisions: Supervision[];
  onStartNewSupervision: (teacherId?: string) => void;
  onEditSupervision: (supervision: Supervision) => void;
  onDeleteSupervision: (id: string) => void;
  onLogout: () => void;
}

export default function AdminDashboard({
  currentUser,
  supervisions,
  onStartNewSupervision,
  onEditSupervision,
  onDeleteSupervision,
  onLogout
}: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPredicate, setSelectedPredicate] = useState<string>('All');
  const [viewingDetailSupervision, setViewingDetailSupervision] = useState<Supervision | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'instruments'>('dashboard');
  
  const [localTeachers, setLocalTeachers] = useState<User[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoadingTeachers(true);
      try {
        const users = getUsers();
        const mappedTeachers = users.filter((u: any) => u.role === 'guru').map((d: any) => ({
            id: d.id,
            username: d.username,
            name: d.name,
            role: d.role,
            nip: d.nip,
            schoolName: d.schoolName,
            className: d.className,
            subject: d.subject,
            photoUrl: d.photoUrl,
            driveUrl: d.driveUrl,
            supervisionSchedule: d.supervisionSchedule,
            moduleIdentity: d.topic ? {
              topic: d.topic,
              timeAllocation: d.timeAllocation,
              targetPhase: d.targetPhase
            } : undefined
        }));
        setLocalTeachers(mappedTeachers);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, []);

  // Calculate dynamic teacher statistics based on localTeachers + supervisions
  const teacherStats = localTeachers.map(teacher => {
    const teacherSups = supervisions
      .filter(s => s.teacherId === teacher.id && s.status === 'Submitted')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const latestSup = teacherSups[0] || null;

    return {
      teacher,
      latestScore: latestSup ? latestSup.finalScore : null,
      latestPredicate: latestSup ? latestSup.predicate : null,
      latestDate: latestSup ? latestSup.date : null,
      supervisionCount: teacherSups.length,
      latestId: latestSup ? latestSup.id : null,
      latestSupRecord: latestSup
    };
  });


  // KPI calculations
  const totalTeachers = localTeachers.length;
  const activeSupervisions = supervisions.filter(s => s.status === 'Submitted');
  const totalSupervisionsCount = supervisions.length;
  const avgScore = activeSupervisions.length > 0 
    ? Math.round((activeSupervisions.reduce((sum, s) => sum + s.finalScore, 0) / activeSupervisions.length) * 10) / 10
    : 0;

  // Aspect averages calculation for school analytics
  const allInstruments = getInstrumentItems();
  const allCategories = getCategories();
  
  const categories = allCategories.map(cat => ({
    key: cat.id,
    label: cat.label.replace(/^[IVX]+\.?\s*/, ''), // Remove I., II.A., etc.
    itemIds: allInstruments.filter(i => i.category === cat.id).map(i => i.id)
  }));

  const aspectAveragesData = categories.map(cat => {
    let totalScoreInAspect = 0;
    let totalPointsCount = 0;

    activeSupervisions.forEach(sup => {
      cat.itemIds.forEach(id => {
        const score = sup.scores[id];
        if (score !== undefined) {
          totalScoreInAspect += score;
          totalPointsCount += 4; // Max score per item is 4
        }
      });
    });

    const percentValue = totalPointsCount > 0 
      ? Math.round((totalScoreInAspect / totalPointsCount) * 1000) / 10
      : 0;

    return {
      aspect: cat.label,
      Persentase: percentValue,
      scoreText: totalPointsCount > 0 ? `${percentValue}%` : '0%'
    };
  });

  // Filtered teachers
  const filteredTeacherStats = teacherStats.filter(stat => {
    const matchesSearch = stat.teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          stat.teacher.nip?.includes(searchTerm) || 
                          stat.teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPredicate = selectedPredicate === 'All' || 
                             (selectedPredicate === 'Belum' && !stat.latestPredicate) ||
                             (stat.latestPredicate === selectedPredicate);

    return matchesSearch && matchesPredicate;
  });

  const getPredicateBadgeColor = (pred: PredicateType | 'Belum' | null) => {
    switch (pred) {
      case 'Sangat Baik': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'Baik': return 'bg-sky-500/10 border-sky-500/30 text-sky-400';
      case 'Cukup': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'Kurang': return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
      default: return 'bg-slate-700/30 border-slate-700/50 text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Dynamic colorful dashboard navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-4 py-3.5 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-500/10">
            A
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {currentUser.role === 'admin' ? 'Dashboard Pengawas' : 'Dashboard Kepala Sekolah'}
            </span>
            <span className="text-sm font-extrabold text-white">{currentUser.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === 'dashboard' ? 'instruments' : 'dashboard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all h-9 cursor-pointer ${
              activeTab === 'instruments' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span className="hidden xs:inline">{activeTab === 'dashboard' ? 'Indikator Penilaian' : 'Kembali ke Dashboard'}</span>
          </button>

          <button 
            onClick={() => onStartNewSupervision()}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1 shadow-lg shadow-emerald-500/15 cursor-pointer h-9"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden xs:inline">Observasi Baru</span>
          </button>
          
          <button 
            onClick={onLogout}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-xl text-rose-400 cursor-pointer h-9 w-9 flex items-center justify-center transition-colors"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {activeTab === 'instruments' ? (
          <InstrumentViewer currentUser={currentUser} />
        ) : (
          <>
        
        {/* Real-time stats widgets */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Jumlah Guru</span>
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-3xl font-black text-white">{totalTeachers}</span>
              <span className="text-[10px] text-slate-400 font-medium">Orang Aktif</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Rata-Rata Nilai</span>
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-3xl font-black text-emerald-400">{avgScore}%</span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
                {avgScore >= 86 ? 'Sangat Baik' : avgScore >= 70 ? 'Baik' : 'Cukup'}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-2 font-medium">
              Dari {activeSupervisions.length} lembar disubmit
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Sangat Baik (A)</span>
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-3xl font-black text-sky-400">
                {activeSupervisions.filter(s => s.predicate === 'Sangat Baik').length}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Guru</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-sky-400 h-full"
                style={{ width: `${totalTeachers > 0 ? (activeSupervisions.filter(s => s.predicate === 'Sangat Baik').length / totalTeachers) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Observasi</span>
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-3xl font-black text-indigo-400">{totalSupervisionsCount}</span>
              <span className="text-[10px] text-slate-400 font-medium">Draft & Selesai</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-indigo-400 h-full"
                style={{ width: `${totalSupervisionsCount > 0 ? (activeSupervisions.length / totalSupervisionsCount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </section>

        {/* School aspect averages chart */}
        {activeSupervisions.length > 0 && (
          <section className="bg-slate-900/50 border border-slate-800/70 p-4 md:p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <BarChart3 className="w-4.5 h-4.5 text-indigo-400" />
                  Analisis Kelemahan & Kelebihan Kinerja Guru Sekolah
                </h2>
                <p className="text-[10px] text-slate-400 font-medium">Berdasarkan hasil rata-rata penguasaan butir pada instrumen supervisi</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aspectAveragesData} layout="vertical" margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} />
                  <YAxis dataKey="aspect" type="category" stroke="#64748b" fontSize={9} width={110} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#10b981', fontSize: '11px' }}
                  />
                  <Bar dataKey="Persentase" radius={[0, 4, 4, 0]}>
                    {aspectAveragesData.map((entry, index) => {
                      // Color spectrum from warm red to deep emerald depending on score
                      let color = '#3b82f6'; // default blue
                      if (entry.Persentase >= 85) color = '#10b981'; // emerald
                      else if (entry.Persentase >= 70) color = '#0ea5e9'; // sky
                      else if (entry.Persentase >= 55) color = '#f59e0b'; // amber
                      else if (entry.Persentase > 0) color = '#f43f5e'; // rose
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Real-time Monitoring List Header */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-emerald-400" />
                Daftar Progres Guru & Status Observasi Real-Time
              </h2>
              <p className="text-[10px] text-slate-400">Pilih guru untuk melakukan penilaian, mengedit draf, atau mengunduh laporan.</p>
            </div>

            {/* Quick search & filters */}
            <div className="flex gap-2 w-full sm:w-auto shrink-0">
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari Guru / NIP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl pl-8.5 pr-2 py-2 focus:outline-none focus:border-slate-700"
                />
              </div>

              <select
                value={selectedPredicate}
                onChange={(e) => setSelectedPredicate(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-2 focus:outline-none"
              >
                <option value="All">Semua Status</option>
                <option value="Sangat Baik">Sangat Baik</option>
                <option value="Baik">Baik</option>
                <option value="Cukup">Cukup</option>
                <option value="Kurang">Kurang</option>
                <option value="Belum">Belum Diobservasi</option>
              </select>
            </div>
          </div>

          {/* Grid layout of teacher cards - mobile optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeacherStats.map(({ teacher, latestScore, latestPredicate, latestDate, supervisionCount, latestSupRecord }) => (
              <div 
                key={teacher.id}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all relative overflow-hidden"
              >
                {/* Background tag if never observed */}
                {!latestPredicate && (
                  <div className="absolute top-0 right-0 bg-slate-800/80 text-slate-500 text-[8px] font-bold px-2.5 py-0.5 rounded-bl-lg uppercase">
                    Mulai Observasi
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <img 
                      src={teacher.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100'} 
                      alt={teacher.name}
                      className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-800"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-xs truncate leading-tight">{teacher.name}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">NIP. {teacher.nip}</p>
                      <p className="text-[10px] text-emerald-400 font-bold mt-1 inline-block bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {teacher.subject} • Kelas {teacher.className}
                      </p>
                    </div>
                  </div>

                  {/* Supervision Progress Status */}
                  <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-semibold">Hasil Terakhir:</span>
                      {latestScore !== null ? (
                        <span className="font-extrabold text-emerald-400">{latestScore}%</span>
                      ) : (
                        <span className="text-slate-500 italic">Belum ada</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-semibold">Predikat Kinerja:</span>
                      <span className={`px-2 py-0.5 rounded-[4px] border text-[8px] font-bold ${getPredicateBadgeColor(latestPredicate)}`}>
                        {latestPredicate || 'BELUM OBSERVASI'}
                      </span>
                    </div>

                    {latestDate && (
                      <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1 border-t border-slate-800/60">
                        <span className="font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" /> {latestDate}
                        </span>
                        <span className="font-bold text-indigo-400">{supervisionCount}x Observasi</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions buttons */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-1.5 border-t border-slate-800/40">
                  {latestSupRecord ? (
                    <>
                      <button
                        onClick={() => setViewingDetailSupervision(latestSupRecord)}
                        className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg border border-slate-700/50 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Detail
                      </button>
                      <button
                        onClick={() => onEditSupervision(latestSupRecord)}
                        className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg border border-slate-700/50 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit TTD
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onStartNewSupervision(teacher.id)}
                      className="col-span-2 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-[10px] font-extrabold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Ambil Observasi Baru
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredTeacherStats.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                Tidak ada guru yang cocok dengan kriteria pencarian atau filter.
              </div>
            )}
          </div>
        </section>

        {/* History of supervisions logs */}
        {supervisions.length > 0 && (
          <section className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-4 space-y-3.5">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              Log Histori Observasi Terbaru (Real-Time Sync)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                    <th className="py-2.5">Tanggal</th>
                    <th className="py-2.5">Guru</th>
                    <th className="py-2.5">Mapel / Kelas</th>
                    <th className="py-2.5">Skor</th>
                    <th className="py-2.5 text-center">Predikat</th>
                    <th className="py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {supervisions.map((sup) => (
                    <tr key={sup.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="py-3 font-semibold">{sup.date}</td>
                      <td className="py-3 font-bold text-white">{sup.teacherName}</td>
                      <td className="py-3">{sup.subject} <span className="text-slate-500">({sup.className})</span></td>
                      <td className="py-3 font-extrabold text-emerald-400">{sup.finalScore}%</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${getPredicateBadgeColor(sup.predicate)}`}>
                          {sup.predicate}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-1.5">
                        <button
                          onClick={() => setViewingDetailSupervision(sup)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer inline-flex items-center"
                          title="Lihat Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => generateSupervisionPDF(sup)}
                          className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30 rounded-lg text-emerald-400 cursor-pointer inline-flex items-center"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditSupervision(sup)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer inline-flex items-center"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus data observasi ${sup.teacherName}?`)) {
                              onDeleteSupervision(sup.id);
                            }
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-rose-950 rounded-lg text-rose-400 cursor-pointer inline-flex items-center border border-transparent hover:border-rose-900"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
          </>
        )}
      </main>

      {/* Model Detail modal popup */}
      <AnimatePresence>
        {viewingDetailSupervision && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-850">
                <div>
                  <h3 className="font-extrabold text-white text-sm">Lembar Hasil Observasi</h3>
                  <p className="text-[10px] text-slate-400">{viewingDetailSupervision.teacherName} • {viewingDetailSupervision.date}</p>
                </div>
                <button 
                  onClick={() => setViewingDetailSupervision(null)}
                  className="p-1.5 hover:bg-slate-850 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content body */}
              <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
                {/* Score panel */}
                <div className="bg-gradient-to-tr from-slate-950 to-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Nilai Capaian</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-emerald-400">{viewingDetailSupervision.finalScore}%</span>
                      <span className="text-[11px] text-slate-500">({viewingDetailSupervision.totalScore}/192 Skor)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Predikat</span>
                    <span className={`px-2.5 py-1 rounded-lg border font-extrabold text-xs ${getPredicateBadgeColor(viewingDetailSupervision.predicate)}`}>
                      {viewingDetailSupervision.predicate}
                    </span>
                  </div>
                </div>

                {/* Info List */}
                <div className="grid grid-cols-2 gap-3.5 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/40">
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase">Mata Pelajaran</span>
                    <span className="font-bold text-white">{viewingDetailSupervision.subject}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase">Kelas / Fase</span>
                    <span className="font-bold text-white">{viewingDetailSupervision.className} / {viewingDetailSupervision.phaseSemester.split('/')[0]}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase">Sekolah</span>
                    <span className="font-bold text-white">{viewingDetailSupervision.schoolName}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase">Tanggal</span>
                    <span className="font-bold text-white">{viewingDetailSupervision.date}</span>
                  </div>
                </div>

                {/* Score details accordion list */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Komentar & Catatan Butir Unggulan:</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {Object.entries(viewingDetailSupervision.notes).map(([id, text]) => {
                      const item = getInstrumentItems().find(i => i.id === Number(id));
                      return (
                        <div key={id} className="bg-slate-950/40 border-l-2 border-emerald-500 p-2 rounded-r-lg">
                          <span className="block text-[9px] text-emerald-400 font-bold">Butir {id}: {item?.text.slice(0, 50)}...</span>
                          <p className="text-slate-300 italic mt-0.5 font-medium">"{text}"</p>
                        </div>
                      );
                    })}
                    {Object.keys(viewingDetailSupervision.notes).length === 0 && (
                      <p className="text-[10px] text-slate-500 italic">Tidak ada catatan butir khusus yang dicatat.</p>
                    )}
                  </div>
                </div>

                {/* Feedback Panel */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Masukan Umum:</span>
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 mt-1 leading-relaxed text-slate-300">
                      {viewingDetailSupervision.generalFeedback || 'Tidak ada masukan tertulis.'}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-semibold">Tindak Lanjut Rekomendasi:</span>
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 mt-1 leading-relaxed text-slate-300">
                      {viewingDetailSupervision.followUp || 'Tidak ada rekomendasi tindak lanjut.'}
                    </div>
                  </div>
                </div>

                {/* Signature info */}
                <div className="pt-3 border-t border-slate-800 flex justify-between text-[10px]">
                  <div>
                    <span className="block text-slate-500">Pengawas Pendamping:</span>
                    <span className="font-bold text-white block">{viewingDetailSupervision.supervisorName}</span>
                    <span className="text-slate-500">NIP. {viewingDetailSupervision.supervisorNip}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-slate-500">Kepala Sekolah:</span>
                    <span className="font-bold text-white block">{viewingDetailSupervision.headmasterName}</span>
                    <span className="text-slate-500">NIP. {viewingDetailSupervision.headmasterNip}</span>
                  </div>
                </div>
              </div>

              {/* Close Button footer */}
              <div className="p-4 bg-slate-850 border-t border-slate-800 flex justify-end gap-2 shrink-0">
                <button 
                  onClick={() => {
                    const printUrl = window.open('', '_blank');
                    if (printUrl) {
                      const allInstruments = getInstrumentItems();
                      let currentCategory = '';
                      
                      const tableRows = allInstruments.map(item => {
                        const score = viewingDetailSupervision.scores[item.id] || 0;
                        const note = viewingDetailSupervision.notes[item.id] || '-';
                        let categoryHeader = '';
                        
                        if (item.category !== currentCategory) {
                          currentCategory = item.category;
                          categoryHeader = `
                            <tr class="category-row">
                              <td colspan="4">${item.categoryLabel}</td>
                            </tr>
                          `;
                        }

                        // Only show answered items? Or all items? The requirement says "hasil cetak pdf disajikan dengan Instrumen, catatan dan skor hasil observasi". Show all is usually best for a form, but let's show all items since it's an evaluation form. Or maybe just the ones with scores. Let's show all.
                        return `
                          ${categoryHeader}
                          <tr>
                            <td style="text-align: center;">${item.id}</td>
                            <td>${item.text}</td>
                            <td style="text-align: center; font-weight: bold;">${score > 0 ? score : '-'}</td>
                            <td>${note}</td>
                          </tr>
                        `;
                      }).join('');

                      printUrl.document.write(`
                        <html>
                          <head>
                            <title>Cetak Hasil Supervisi - ${viewingDetailSupervision.teacherName}</title>
                            <style>
                              body { font-family: sans-serif; padding: 20px 40px; color: #111; line-height: 1.5; font-size: 12px; }
                              .header { text-align: center; margin-bottom: 20px; border-bottom: 3px double #000; padding-bottom: 10px; }
                              .title { font-size: 16px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
                              .grid { display: grid; grid-template-columns: 150px 1fr; margin-bottom: 20px; gap: 5px; font-size: 13px; }
                              .label { font-weight: bold; }
                              .score-box { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; border: 1px solid #ccc; page-break-inside: avoid; }
                              .score-large { font-size: 24px; font-weight: bold; color: #2e7d32; }
                              .section-title { font-size: 14px; font-weight: bold; border-bottom: 1px solid #aaa; margin-top: 20px; padding-bottom: 4px; text-transform: uppercase; page-break-after: avoid; }
                              .signatures { display: flex; justify-content: space-between; margin-top: 50px; page-break-inside: avoid; }
                              .sig-col { text-align: center; width: 200px; }
                              .sig-line { border-bottom: 1px solid #000; margin-top: 50px; font-weight: bold; }
                              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; margin-top: 10px; font-size: 11px; }
                              th, td { border: 1px solid #000; padding: 6px 8px; }
                              th { background-color: #eee; font-weight: bold; text-align: center; }
                              .category-row { background-color: #e0e0e0; font-weight: bold; font-size: 12px; }
                              p { margin: 5px 0 15px 0; }
                              @media print {
                                body { padding: 0; }
                              }
                            </style>
                          </head>
                          <body>
                            <div class="header">
                              <div class="title">Instrumen Supervisi Observasi Proses Pembelajaran</div>
                              <div>SIPRO-BELAJAR SMP NEGERI 1 TELAGA</div>
                            </div>
                            
                            <div class="grid">
                              <div class="label">Nama Sekolah:</div><div>${viewingDetailSupervision.schoolName}</div>
                              <div class="label">Nama Guru:</div><div>${viewingDetailSupervision.teacherName}</div>
                              <div class="label">Mata Pelajaran:</div><div>${viewingDetailSupervision.subject}</div>
                              <div class="label">Kelas/Fase/Semester:</div><div>${viewingDetailSupervision.className} / ${viewingDetailSupervision.phaseSemester}</div>
                              <div class="label">Hari / Tanggal:</div><div>${viewingDetailSupervision.date}</div>
                            </div>

                            <table>
                              <thead>
                                <tr>
                                  <th style="width: 30px;">No</th>
                                  <th>Aspek yang Diamati</th>
                                  <th style="width: 50px;">Skor (1-4)</th>
                                  <th style="width: 25%;">Catatan</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${tableRows}
                              </tbody>
                            </table>

                            <div class="score-box">
                              <div>NILAI AKHIR OBSERVASI</div>
                              <div class="score-large">${viewingDetailSupervision.finalScore}%</div>
                              <div style="font-weight: bold; margin-top: 5px">Predikat: ${viewingDetailSupervision.predicate}</div>
                              <div style="font-size: 11px; color: #555">(Skor Diperoleh: ${viewingDetailSupervision.totalScore} dari skor maksimal 192)</div>
                            </div>

                            <div class="section-title">Masukan terhadap pelaksanaan Proses Pembelajaran secara Umum</div>
                            <p>${viewingDetailSupervision.generalFeedback || '-'}</p>

                            <div class="section-title">Tindak Lanjut Rekomendasi</div>
                            <p>${viewingDetailSupervision.followUp || '-'}</p>

                            <div class="signatures">
                              <div class="sig-col">
                                <div>Pengawas Pendamping</div>
                                <div class="sig-line">${viewingDetailSupervision.supervisorName}</div>
                                <div>NIP. ${viewingDetailSupervision.supervisorNip}</div>
                              </div>
                              <div class="sig-col">
                                <div>Kepala Sekolah</div>
                                <div class="sig-line">${viewingDetailSupervision.headmasterName}</div>
                                <div>NIP. ${viewingDetailSupervision.headmasterNip}</div>
                              </div>
                              <div class="sig-col">
                                <div>Guru Kelas / Mapel</div>
                                <div class="sig-line">${viewingDetailSupervision.teacherName}</div>
                                <div>NIP. ${viewingDetailSupervision.teacherId}</div>
                              </div>
                            </div>

                            <script>window.print();</script>
                          </body>
                        </html>
                      `);
                      printUrl.document.close();
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold text-xs cursor-pointer transition-colors"
                >
                  Cetak PDF Laporan
                </button>
                <button 
                  onClick={() => setViewingDetailSupervision(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-xs cursor-pointer transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
