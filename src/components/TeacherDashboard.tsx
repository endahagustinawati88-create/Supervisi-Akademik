import React, { useState } from 'react';
import { User, Supervision, PredicateType } from '../types';
import { getInstrumentItems, getCategories } from '../data';
import { 
  Award, Calendar, BookOpen, Clock, ChevronRight, CheckCircle2,
  AlertCircle, MessageSquare, ListTodo, LogOut, Check, ChevronDown, UserCheck, HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface TeacherDashboardProps {
  currentUser: User;
  supervisions: Supervision[];
  onLogout: () => void;
}

export default function TeacherDashboard({
  currentUser,
  supervisions,
  onLogout
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'reflection'>('overview');
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('I_PENDAHULUAN');

  // Load teacher reflection from localStorage if any
  React.useEffect(() => {
    const saved = localStorage.getItem(`reflection_${currentUser.nip}`);
    if (saved) {
      setReflectionText(saved);
      setReflectionSaved(true);
    }
  }, [currentUser.nip]);

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`reflection_${currentUser.nip}`, reflectionText);
    setReflectionSaved(true);
    alert('Refleksi diri berhasil disimpan secara real-time!');
  };

  // Find all supervisions for this teacher
  const teacherSups = supervisions
    .filter(s => s.teacherId === currentUser.id && s.status === 'Submitted')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latestSup = teacherSups[0] || null;

  // Aspect-by-aspect calculation for this teacher's latest supervision
  const allInstruments = getInstrumentItems();
  const allCategories = getCategories();
  
  const categories = allCategories.map(cat => ({
    key: cat.id,
    label: cat.label.replace(/^[IVX]+\.?\s*/, ""),
    itemIds: allInstruments.filter(i => i.category === cat.id).map(i => i.id)
  }));

  const aspectRadarData = categories.map(cat => {
    let scoreSum = 0;
    let maxPossible = 0;
    if (latestSup) {
      cat.itemIds.forEach(id => {
        const score = latestSup.scores[id];
        if (score !== undefined) {
          scoreSum += score;
          maxPossible += 4;
        }
      });
    }
    const percentage = maxPossible > 0 ? Math.round((scoreSum / maxPossible) * 100) : 0;

    return {
      subject: cat.label,
      Persentase: percentage,
      fullMark: 100
    };
  });

  const getPredicateBadgeColor = (pred: PredicateType | null) => {
    switch (pred) {
      case 'Sangat Baik': return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
      case 'Baik': return 'bg-sky-500/15 border-sky-500/30 text-sky-400';
      case 'Cukup': return 'bg-amber-500/15 border-amber-500/30 text-amber-400';
      case 'Kurang': return 'bg-rose-500/15 border-rose-500/30 text-rose-400';
      default: return 'bg-slate-800 border-slate-700 text-slate-400';
    }
  };

  // Group instrument items by aspect for detail view
  const groupedItems = categories.map(cat => {
    const items = getInstrumentItems().filter(i => i.id >= cat.minId && i.id <= cat.maxId);
    return {
      ...cat,
      items
    };
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Dynamic colorful dashboard navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-4 py-3.5 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <img 
            src={currentUser.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100'} 
            alt={currentUser.name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-800"
            referrerPolicy="no-referrer"
          />
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dashboard Guru</span>
            <span className="text-sm font-extrabold text-white">{currentUser.name}</span>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-xl text-rose-400 cursor-pointer h-9 w-9 flex items-center justify-center transition-colors"
          title="Keluar"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Welcome message / profile panel */}
        <section className="bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 w-full">
            <h1 className="text-base font-extrabold text-white">Selamat Datang, {currentUser.name}!</h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pantau perkembangan kualitas proses belajar mengajar Anda di kelas <b>{currentUser.className || 'VIII-A'}</b> secara langsung dan penuhi rekomendasi perbaikan dari Pengawas Pendamping.
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-2 mb-3">
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full">
                NIP. {currentUser.nip}
              </span>
              <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold px-2.5 py-0.5 rounded-full">
                Mapel: {currentUser.subject}
              </span>
            </div>

            {/* Teacher Details from Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 border-t border-slate-700/50 pt-4">
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Informasi Pra-Observasi</span>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Jadwal Supervisi:</span>
                    <span className="text-slate-200 font-medium">{currentUser.supervisionSchedule || 'Belum dijadwalkan'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Link Modul Ajar / RPP:</span>
                    {currentUser.driveUrl ? (
                      <a href={currentUser.driveUrl} target="_blank" rel="noreferrer" className="text-emerald-400 font-medium hover:underline flex items-center gap-1">
                        Buka G-Drive <ChevronRight className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-500 italic">Belum ditautkan</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Identitas Modul Ajar</span>
                {currentUser.moduleIdentity ? (
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between items-start text-xs">
                      <span className="text-slate-400">Materi Pokok:</span>
                      <span className="text-slate-200 font-medium text-right max-w-[150px]">{currentUser.moduleIdentity.topic}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Alokasi Waktu:</span>
                      <span className="text-slate-200 font-medium">{currentUser.moduleIdentity.timeAllocation}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Fase Sasaran:</span>
                      <span className="text-slate-200 font-medium">{currentUser.moduleIdentity.targetPhase}</span>
                    </div>
                  </div>
                ) : (
                   <span className="text-xs text-slate-500 italic block mt-2">Identitas modul belum diisi.</span>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'overview' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Analisis Capaian
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'items' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Rincian 48 Butir
          </button>
          <button
            onClick={() => setActiveTab('reflection')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'reflection' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Lembar Refleksi Diri
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {latestSup ? (
              <>
                {/* Score Widget */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between sm:col-span-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hasil Observasi Terakhir</span>
                    <div className="flex items-baseline gap-2.5 mt-2">
                      <span className="text-4xl font-black text-emerald-400">{latestSup.finalScore}%</span>
                      <span className="text-xs text-slate-400 font-medium">({latestSup.totalScore} dari 192 skor maksimal)</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-3 font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Dilaksanakan pada {latestSup.date} oleh {latestSup.supervisorName}
                    </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between items-center text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Predikat Kinerja</span>
                    <div className={`mt-2.5 px-3.5 py-1.5 rounded-xl border text-sm font-extrabold ${getPredicateBadgeColor(latestSup.predicate)}`}>
                      {latestSup.predicate}
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase mt-3 tracking-wider">SMP NEGERI 1 TELAGA</span>
                  </div>
                </div>

                {/* Radar and Strength Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Radar Chart */}
                  <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl flex flex-col items-center">
                    <h3 className="text-xs font-bold text-white mb-3 self-start">Grafik Profil Kompetensi Mengajar</h3>
                    <div className="h-60 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={aspectRadarData}>
                          <PolarGrid stroke="#1e293b" />
                          <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                          <Radar name="Capaian Anda" dataKey="Persentase" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Highlights and comments */}
                  <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold text-white">Saran & Rekomendasi Pengawas</h3>
                    
                    <div className="space-y-3.5">
                      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Masukan Umum Pengawas
                        </span>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed italic">
                          "{latestSup.generalFeedback || 'Belum ada masukan umum tertulis.'}"
                        </p>
                      </div>

                      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Rencana Tindak Lanjut
                        </span>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-semibold">
                          {latestSup.followUp || 'Belum ada rekomendasi tindak lanjut.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Supervisor notes per item (if any) */}
                <div className="bg-slate-900/30 border border-slate-800/50 p-4 rounded-2xl space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    Catatan Deskripsi Butir Khusus Dari Pengawas
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Object.entries(latestSup.notes).map(([id, note]) => {
                      const item = getInstrumentItems().find(i => i.id === Number(id));
                      return (
                        <div key={id} className="bg-slate-950/40 border border-slate-800 p-3 rounded-xl space-y-1">
                          <span className="text-[9px] font-bold text-indigo-400 uppercase">Butir {id}: {item?.text.slice(0, 45)}...</span>
                          <p className="text-xs text-slate-200 italic font-medium">"{note}"</p>
                        </div>
                      );
                    })}
                    {Object.keys(latestSup.notes).length === 0 && (
                      <p className="text-xs text-slate-500 italic col-span-full py-4 text-center">Tidak ada catatan butir khusus.</p>
                    )}
                  </div>
                </div>

                {/* History list for this teacher */}
                {teacherSups.length > 1 && (
                  <div className="bg-slate-900/30 border border-slate-800/50 p-4 rounded-2xl space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Histori Riwayat Supervisi Anda</h3>
                    <div className="space-y-2">
                      {teacherSups.slice(1).map((sup) => (
                        <div key={sup.id} className="bg-slate-950/30 p-3 rounded-xl border border-slate-900 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <div>
                              <span className="text-xs font-bold text-white">{sup.date}</span>
                              <span className="text-[10px] text-slate-500 block">Supervisor: {sup.supervisorName}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-emerald-400">{sup.finalScore}%</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${getPredicateBadgeColor(sup.predicate)}`}>
                              {sup.predicate}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-slate-900/30 border border-dashed border-slate-800 p-12 rounded-2xl text-center space-y-3 text-slate-400">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
                <h3 className="font-bold text-white text-sm">Belum Ada Hasil Observasi</h3>
                <p className="text-xs max-w-sm mx-auto leading-relaxed">
                  Pengawas pendamping belum mengunggah atau mensubmit lembar observasi untuk NIP Anda. Silakan hubungi <b>Imran Tululi, S.Pd, M.Pd</b> selaku Pengawas Pendamping Anda.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Detail items list */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl">
              <h3 className="text-sm font-bold text-white">Nilai Rincian Per-Butir Instrumen</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Analisis hasil rincian 48 butir kompetensi berdasarkan penilaian supervisor.</p>
            </div>

            {latestSup ? (
              <div className="space-y-3">
                {groupedItems.map((aspect) => {
                  const isExpanded = expandedSection === aspect.key;
                  
                  // Calculate average for this aspect
                  let aspectScore = 0;
                  let aspectCount = 0;
                  aspect.items.forEach(item => {
                    const sc = latestSup.scores[item.id];
                    if (sc !== undefined) {
                      aspectScore += sc;
                      aspectCount += 4;
                    }
                  });
                  const aspectPercent = aspectCount > 0 ? Math.round((aspectScore / aspectCount) * 100) : 0;

                  return (
                    <div key={aspect.key} className="bg-slate-900/40 border border-slate-800/60 rounded-xl overflow-hidden">
                      {/* Aspect Header */}
                      <button
                        onClick={() => setExpandedSection(isExpanded ? null : aspect.key)}
                        className="w-full px-4 py-3 bg-slate-900 flex justify-between items-center text-left cursor-pointer hover:bg-slate-850 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${aspectPercent >= 85 ? 'bg-emerald-400' : aspectPercent >= 70 ? 'bg-sky-400' : 'bg-amber-400'}`}></span>
                          <div>
                            <span className="text-xs font-bold text-white block">{aspect.label}</span>
                            <span className="text-[10px] text-slate-400">{aspect.items.length} butir instrumen</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-extrabold text-emerald-400">{aspectPercent}% Capaian</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {/* Aspect items list */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden border-t border-slate-800 bg-slate-950/20"
                          >
                            <div className="p-4 divide-y divide-slate-800/50 space-y-3.5">
                              {aspect.items.map((item) => {
                                const score = latestSup.scores[item.id] || 0;
                                const note = latestSup.notes[item.id];
                                
                                let scoreColor = 'bg-slate-800 text-slate-300';
                                if (score === 4) scoreColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                                else if (score === 3) scoreColor = 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
                                else if (score === 2) scoreColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                                else if (score === 1) scoreColor = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';

                                return (
                                  <div key={item.id} className="pt-3.5 first:pt-0 space-y-1.5">
                                    <div className="flex justify-between items-start gap-4">
                                      <div className="flex items-start gap-2 text-xs">
                                        <span className="font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                                          {item.id}
                                        </span>
                                        <p className="text-slate-300 leading-relaxed font-medium">{item.text}</p>
                                      </div>

                                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black text-center shrink-0 min-w-[32px] ${scoreColor}`}>
                                        {score || '-'}
                                      </span>
                                    </div>

                                    {/* Small explanation label */}
                                    <p className="text-[10px] text-slate-500 ml-9">
                                      Kondisi: {score === 4 ? 'Dilakukan dan Sangat Efektif' : score === 3 ? 'Sebagian Besar Dilakukan Efektif' : score === 2 ? 'Dilakukan namun Belum Efektif' : 'Tidak Efektif / Belum Terpenuhi'}
                                    </p>

                                    {note && (
                                      <div className="ml-9 p-2 bg-slate-950/80 rounded-lg border border-slate-900 text-[10px] italic text-indigo-300 font-medium">
                                        Catatan Pengawas: "{note}"
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center italic py-8 bg-slate-900/10 border border-slate-800 rounded-2xl">
                Belum ada rincian karena belum ada lembar observasi yang disubmit.
              </p>
            )}
          </div>
        )}

        {/* Tab 3: Self-reflection form */}
        {activeTab === 'reflection' && (
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <ListTodo className="w-4.5 h-4.5 text-emerald-400" />
                Lembar Refleksi Diri & Tindak Lanjut Guru Mapel
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Tuliskan refleksi hasil supervisi dan langkah yang akan Anda tempuh untuk menaikkan kualitas KBM.</p>
            </div>

            <form onSubmit={handleSaveReflection} className="space-y-4 bg-slate-900/30 border border-slate-800/60 p-5 rounded-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Rencana Aksi & Refleksi Guru Mapel:
                </label>
                <textarea
                  rows={6}
                  required
                  value={reflectionText}
                  onChange={(e) => {
                    setReflectionText(e.target.value);
                    setReflectionSaved(false);
                  }}
                  placeholder="Misalnya: Saya akan mengoptimalkan asesmen formatif awal pembelajaran agar dapat merancang diferensiasi konten secara lebih efektif. Saya juga berencana melakukan sharing session dengan sejawat untuk strategi manajemen kelas..."
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {reflectionSaved && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                  <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>Refleksi tersimpan dengan sukses di sistem supervisi.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Simpan & Kirim Refleksi ke Pengawas
              </button>
            </form>

            {/* Interactive checklist of improvements */}
            <div className="bg-slate-900/30 border border-slate-800/60 p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Komitmen Peningkatan Kualitas (Checklist Mandiri)
              </h4>
              <p className="text-[10px] text-slate-400">Centang komitmen di bawah ini sesuai kesepakatan KSE dan Alur Tujuan Pembelajaran (ATP):</p>
              
              <div className="space-y-2 text-xs">
                {[
                  'Menyiapkan fisik dan psikis peserta didik secara teratur dengan penguatan KSE.',
                  'Memperkuat keyakinan kelas yang telah disepakati bersama secara konsisten.',
                  'Meningkatkan penggunaan pertanyaan terbuka yang memancing critical thinking.',
                  'Menggunakan kelompok belajar yang heterogen dan terdiferensiasi.',
                  'Memanfaatkan media inovatif (Canva, Phet, dll) secara terpadu di setiap pertemuan.'
                ].map((item, idx) => (
                  <label key={idx} className="flex items-start gap-2.5 p-2 bg-slate-950/40 border border-slate-800/60 rounded-lg cursor-pointer hover:bg-slate-950/80 transition-colors">
                    <input type="checkbox" className="mt-0.5 rounded text-emerald-500 bg-slate-900 border-slate-700 cursor-pointer" defaultChecked={idx < 2} />
                    <span className="text-slate-300 leading-relaxed text-[11px]">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
