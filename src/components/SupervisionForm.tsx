import React, { useState, useEffect } from 'react';
import { InstrumentItem, User, Supervision, PredicateType } from '../types';
import { getInstrumentItems, getCategories } from '../data';
import { getUsers } from '../data';
import { 
  ArrowLeft, Save, CheckCircle, CheckCircle2, Award, 
  Calendar, BookOpen, Layers, Edit3, ClipboardList, PenTool, Check, AlertTriangle, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SupervisionFormProps {
  supervision?: Supervision | null; // null if creating new
  onSave: (supervision: Supervision) => void;
  onCancel: () => void;
  currentUser: User;
}

const TABS = [
  { id: 'identity', label: '1. Identitas', icon: Calendar },
  { id: 'instruments', label: '2. Instrumen Observasi', icon: Layers },
  { id: 'summary', label: '3. Feedback & Tanda Tangan', icon: Edit3 },
];

export default function SupervisionForm({ supervision, onSave, onCancel, currentUser }: SupervisionFormProps) {
  const [activeTab, setActiveTab] = useState('identity');
  const [teachers, setTeachers] = useState<User[]>([]);
  
  // Form Identitas State
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [schoolName, setSchoolName] = useState('SMP Negeri 1 Telaga');
  const [className, setClassName] = useState('');
  const [phaseSemester, setPhaseSemester] = useState('Fase A / Ganjil');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Supervision scores state: item.id -> score
  const [scores, setScores] = useState<Record<number, number>>({});
  // Supervision notes state: item.id -> string notes
  const [itemNotes, setItemNotes] = useState<Record<number, string>>({});
  
  // Feedback state
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [pengawasUser, setPengawasUser] = useState<User | null>(null);
  const [kepsekUser, setKepsekUser] = useState<User | null>(null);
  
  // Signature placeholders state
  const [signedSupervisor, setSignedSupervisor] = useState(false);
  const [signedTeacher, setSignedTeacher] = useState(false);
  const [signedHeadmaster, setSignedHeadmaster] = useState(false);

  // Active sub-sections for Kegiatan Inti (A-F)
  const allCategories = getCategories();
  const allInstruments = getInstrumentItems();
  const [activeCategory, setActiveCategory] = useState(allCategories[0]?.id);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = getUsers();
      if (data) {
        setTeachers(data.filter(d => d.role === 'guru'));
        const pengawasData = data.find(d => d.role === 'pengawas');
        if (pengawasData) setPengawasUser(pengawasData);
        const kepsekData = data.find(d => d.role === 'kepsek');
        if (kepsekData) setKepsekUser(kepsekData);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (supervision) {
      setSelectedTeacherId(supervision.teacherId);
      setSchoolName(supervision.schoolName);
      setClassName(supervision.className);
      setPhaseSemester(supervision.phaseSemester);
      setSubject(supervision.subject);
      setDate(supervision.date);
      setScores(supervision.scores);
      setItemNotes(supervision.notes);
      setGeneralFeedback(supervision.generalFeedback);
      setFollowUp(supervision.followUp);
      setSignedSupervisor(true);
      setSignedTeacher(true);
      setSignedHeadmaster(true);
    } else {
      // Default initial scores (all empty or set default empty)
      const initial: Record<number, number> = {};
      getInstrumentItems().forEach(item => {
        initial[item.id] = 4; // prefill with 4 as standard default, or empty. Let's prefill with 4 to save time for admin, but allow changing
      });
      setScores(initial);
    }
  }, [supervision]);

  // Handle teacher change to auto-fill subject and class if available
  const handleTeacherChange = (id: string) => {
    setSelectedTeacherId(id);
    const teacher = teachers.find(t => t.id === id);
    if (teacher) {
      if (teacher.className) setClassName(teacher.className);
      if (teacher.subject) setSubject(teacher.subject);
    }
  };

  // Calculation Metrics
  const answeredCount = getInstrumentItems().filter(item => scores[item.id] !== undefined && scores[item.id] > 0).length;
  const totalScore = getInstrumentItems().reduce((sum, item) => sum + (scores[item.id] || 0), 0);
  const maxPossibleScore = 48 * 4; // 192
  const finalScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100 * 10) / 10 : 0;

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const instruments = getInstrumentItems();
      
      const detailedScores = Object.entries(scores).map(([id, score]) => {
        const item = instruments.find(i => i.id === Number(id));
        return {
          id,
          kriteria: item ? item.text : 'Unknown',
          skor: score,
          catatan: itemNotes[Number(id)] || '-'
        };
      });

      const response = await fetch('/api/generate-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detailedScores,
          totalScore
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.feedback) setGeneralFeedback(data.feedback);
        if (data.followUp) setFollowUp(data.followUp);
      } else {
        alert('Gagal menghasilkan AI feedback. Pastikan API key valid.');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan koneksi saat memanggil AI.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Determine Predicate
  let predicate: PredicateType = 'Kurang';
  if (finalScore >= 86) predicate = 'Sangat Baik';
  else if (finalScore >= 70) predicate = 'Baik';
  else if (finalScore >= 55) predicate = 'Cukup';

  const getPredicateColor = (pred: PredicateType) => {
    switch (pred) {
      case 'Sangat Baik': return 'bg-emerald-500 text-white border-emerald-400';
      case 'Baik': return 'bg-sky-500 text-white border-sky-400';
      case 'Cukup': return 'bg-amber-500 text-slate-900 border-amber-400';
      case 'Kurang': return 'bg-rose-500 text-white border-rose-400';
    }
  };

  const handleScoreChange = (itemId: number, score: number) => {
    setScores(prev => ({ ...prev, [itemId]: score }));
  };

  const handleNoteChange = (itemId: number, note: string) => {
    setItemNotes(prev => ({ ...prev, [itemId]: note }));
  };

  const handleSubmit = (status: 'Draft' | 'Submitted') => {
    if (!selectedTeacherId) {
      alert('Silakan pilih Guru terlebih dahulu!');
      setActiveTab('identity');
      return;
    }
    if (!className || !subject) {
      alert('Silakan isi Kelas dan Mata Pelajaran!');
      setActiveTab('identity');
      return;
    }

    const teacher = teachers.find(t => t.id === selectedTeacherId);
    const teacherName = teacher ? teacher.name : 'Guru Tamu';

    const payload: Supervision = {
      id: supervision?.id || `sup-${Date.now()}`,
      teacherId: selectedTeacherId,
      teacherName,
      schoolName,
      className,
      phaseSemester,
      subject,
      date,
      scores,
      notes: itemNotes,
      totalScore,
      finalScore,
      predicate,
      generalFeedback,
      followUp,
      supervisorName: currentUser.role === 'pengawas' ? currentUser.name : (pengawasUser?.name || 'Pengawas'),
      supervisorNip: currentUser.role === 'pengawas' ? (currentUser.nip || '-') : (pengawasUser?.nip || '-'),
      headmasterName: kepsekUser?.name || 'Kepala Sekolah',
      headmasterNip: kepsekUser?.nip || '-',
      status,
      createdAt: supervision?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(payload);
  };

  const scoreLabels: Record<number, string> = {
    4: 'Sesuai / Dilakukan & Efektif',
    3: 'Sebagian besar dilakukan dengan Efektif',
    2: 'Sebagian besar dilakukan namun Belum Efektif',
    1: 'Sebagian Kecil dilakukan & Tidak Efektif',
  };

  // Render score selector button
  const renderScoreButtons = (itemId: number) => {
    const currentScore = scores[itemId];
    return (
      <div className="grid grid-cols-4 gap-2 mt-3">
        {[4, 3, 2, 1].map((s) => {
          const isSelected = currentScore === s;
          let activeClass = '';
          if (isSelected) {
            if (s === 4) activeClass = 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-900/40 font-semibold';
            else if (s === 3) activeClass = 'bg-sky-600 border-sky-400 text-white shadow-md shadow-sky-900/40 font-semibold';
            else if (s === 2) activeClass = 'bg-amber-500 border-amber-300 text-slate-900 shadow-md shadow-amber-900/20 font-semibold';
            else if (s === 1) activeClass = 'bg-rose-600 border-rose-400 text-white shadow-md shadow-rose-900/40 font-semibold';
          } else {
            activeClass = 'bg-slate-900/40 hover:bg-slate-800 border-slate-700/60 text-slate-300';
          }

          return (
            <button
              key={s}
              type="button"
              onClick={() => handleScoreChange(itemId, s)}
              className={`py-2 px-1 text-center rounded-xl border text-xs transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer min-h-[44px] ${activeClass}`}
            >
              <span className="text-base font-bold">{s}</span>
              <span className="text-[9px] line-clamp-1 xs:block hidden opacity-80 font-normal">
                {s === 4 ? 'Sempurna' : s === 3 ? 'Efektif' : s === 2 ? 'Kurang' : 'Buruk'}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-slate-900 min-h-screen text-slate-100 font-sans pb-12">
      {/* Top sticky scoring banner */}
      <div className="sticky top-0 z-20 bg-slate-800/90 backdrop-blur border-b border-slate-700/50 px-4 py-3 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">
              {supervision ? 'Edit Hasil Observasi' : 'Observasi Pembelajaran Baru'}
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              Instrumen Supervisi 48 Butir
            </p>
          </div>
        </div>

        {/* Real-time score calculator */}
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700/60 px-3 py-1.5 rounded-xl">
          <div className="text-right">
            <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Nilai Akhir</span>
            <span className="text-sm font-extrabold text-emerald-400">{finalScore}%</span>
          </div>
          <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPredicateColor(predicate)}`}>
            {predicate}
          </div>
        </div>
      </div>

      {/* Progress completion bar */}
      <div className="w-full h-1.5 bg-slate-800">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${(answeredCount / 48) * 100}%` }}
        ></div>
      </div>

      {/* Responsive Horizontal Tab List for Mobile */}
      <div className="bg-slate-800 border-b border-slate-700/40 overflow-x-auto scrollbar-none flex gap-1 px-4 py-2 shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500 text-emerald-400' 
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form content with animation */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'identity' && (
            <motion.div
              key="identity"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4 bg-slate-800/50 border border-slate-700/30 rounded-2xl p-5"
            >
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-emerald-400" />
                Informasi & Identitas Guru
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Guru yang Diobservasi
                  </label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => handleTeacherChange(e.target.value)}
                    disabled={!!supervision}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer disabled:opacity-60"
                  >
                    <option value="">-- Pilih Guru --</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} (NIP. {teacher.nip})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Bahasa Inggris"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sekolah
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kelas / Rombel
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: VIII-A"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kelas / Fase / Semester
                  </label>
                  <select
                    value={phaseSemester}
                    onChange={(e) => setPhaseSemester(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                  >
                    <option value="Fase A / Ganjil">Fase A / Semester Ganjil</option>
                    <option value="Fase A / Genap">Fase A / Semester Genap</option>
                    <option value="Fase B / Ganjil">Fase B / Semester Ganjil</option>
                    <option value="Fase B / Genap">Fase B / Semester Genap</option>
                    <option value="Fase C / Ganjil">Fase C / Semester Ganjil</option>
                    <option value="Fase C / Genap">Fase C / Semester Genap</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Pelaksanaan
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              {/* Guide */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl mt-4 flex gap-3">
                <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1.5 text-slate-300">
                  <p className="font-bold text-emerald-300">Panduan Skor Observasi:</p>
                  <p>• <b>Skor 4</b>: Sesuai / Dilakukan dan efektif.</p>
                  <p>• <b>Skor 3</b>: Sebagian besar dilakukan dengan efektif.</p>
                  <p>• <b>Skor 2</b>: Sebagian besar dilakukan namun belum efektif.</p>
                  <p>• <b>Skor 1</b>: Sebagian Kecil dilakukan dan tidak efektif.</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('instruments')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Lanjut ke Instrumen Observasi →
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'instruments' && (
            <motion.div
              key="instruments"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div className="bg-slate-800 border border-slate-700/40 overflow-x-auto scrollbar-none flex gap-1 px-4 py-2 shrink-0 rounded-xl mb-4">
                {allCategories.map((cat, idx) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer ${activeCategory === cat.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {idx + 1}. {cat.label}
                  </button>
                ))}
              </div>

              <div className="bg-slate-800/80 border border-slate-700/40 rounded-2xl p-4">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                    {allCategories.find(c => c.id === activeCategory)?.label}
                  </h2>
                </div>
                <div className="space-y-3.5">
                  {allInstruments.filter(i => i.category === activeCategory).map(item => (
                    <div key={item.id} className="bg-slate-800/40 border border-slate-700/30 p-4 rounded-2xl space-y-2">
                      <div className="flex items-start gap-2.5">
                        <span className="text-xs font-bold bg-slate-900 border border-slate-700 text-slate-300 w-6 h-6 rounded-full flex items-center justify-center shrink-0">{item.id}</span>
                        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">{item.text}</p>
                      </div>
                      {renderScoreButtons(item.id)}
                      <input
                        type="text"
                        placeholder="Catatan khusus (opsional)"
                        value={itemNotes[item.id] || ''}
                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 mt-1"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center py-2 bg-slate-950/30 p-3 rounded-xl border border-slate-800 mt-4">
                  <span className="text-[10px] text-slate-400 font-bold">Navigasi Kategori</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      disabled={allCategories.findIndex(c => c.id === activeCategory) === 0}
                      onClick={() => {
                        const idx = allCategories.findIndex(c => c.id === activeCategory);
                        if (idx > 0) setActiveCategory(allCategories[idx - 1].id);
                      }}
                      className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs disabled:opacity-40 cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={allCategories.findIndex(c => c.id === activeCategory) === allCategories.length - 1}
                      onClick={() => {
                        const idx = allCategories.findIndex(c => c.id === activeCategory);
                        if (idx < allCategories.length - 1) setActiveCategory(allCategories[idx + 1].id);
                      }}
                      className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs disabled:opacity-40 cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-800 mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('identity')}
                    className="text-slate-400 hover:text-white px-4 py-2 text-xs font-semibold cursor-pointer"
                  >
                    ← Kembali
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('summary')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-indigo-500/20"
                  >
                    Lanjut ke Tanda Tangan →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-5"
            >
              <div className="bg-slate-800/80 border border-slate-700/40 rounded-2xl p-5 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-emerald-400" />
                      Ulasan Umum, Rekomendasi & Tanda Tangan
                    </h2>
                    <p className="text-xs text-slate-300 mt-1">
                      Selesaikan pengisian instrumen dengan memberikan masukan dan rencana tindak lanjut pengembangan kompetensi guru.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI || answeredCount === 0}
                    className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 hover:text-indigo-200 border border-indigo-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {isGeneratingAI ? (
                      <span className="animate-pulse">Menghasilkan...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Buat Otomatis dengan AI
                      </>
                    )}
                  </button>
                </div>
                
                {answeredCount < 48 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 text-xs text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>Beberapa butir belum dinilai (Baru {answeredCount} dari 48 butir). Anda tetap dapat menyimpan draf, tetapi sebaiknya lengkapi untuk hasil akurat.</p>
                  </div>
                )}
              </div>

              {/* Feedback Textareas */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Masukan terhadap Pelaksanaan Proses Pembelajaran secara Umum
                  </label>
                  <textarea
                    rows={4}
                    value={generalFeedback}
                    onChange={(e) => setGeneralFeedback(e.target.value)}
                    placeholder="Tuliskan masukan umum, kelebihan, dan area pengembangan yang diamati di dalam kelas..."
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Tindak Lanjut Pengembangan
                  </label>
                  <textarea
                    rows={3}
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    placeholder="Langkah konkret atau tindak lanjut yang harus dilakukan guru pasca observasi..."
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Virtual Signatures section */}
              <div className="bg-slate-850 border border-slate-750 rounded-2xl p-4 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-emerald-400" />
                  Lembar Tanda Tangan Digital (Simulasi)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Supervisor */}
                  <div className="bg-slate-900/60 p-3.5 border border-slate-800 rounded-xl flex flex-col justify-between min-h-[140px]">
                    <div className="text-center text-[10px] text-slate-400 font-bold uppercase">Pengawas Pendamping</div>
                    <div className="my-2 h-14 flex items-center justify-center border-b border-dashed border-slate-750">
                      {signedSupervisor ? (
                        <span className="text-xs text-emerald-400 font-bold italic tracking-wider flex items-center gap-1">
                          <Check className="w-4 h-4 text-emerald-500" /> TTD DIGITAL (Imran Tululi)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-600 italic">Belum Ditandatangani</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSignedSupervisor(!signedSupervisor)}
                      className={`w-full py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                        signedSupervisor ? 'bg-slate-800 hover:bg-slate-750 text-slate-300' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      }`}
                    >
                      {signedSupervisor ? 'Batalkan Tanda Tangan' : 'Simulasi Tanda Tangan'}
                    </button>
                  </div>

                  {/* Teacher */}
                  <div className="bg-slate-900/60 p-3.5 border border-slate-800 rounded-xl flex flex-col justify-between min-h-[140px]">
                    <div className="text-center text-[10px] text-slate-400 font-bold uppercase">Guru Kelas / Mapel</div>
                    <div className="my-2 h-14 flex items-center justify-center border-b border-dashed border-slate-750">
                      {signedTeacher ? (
                        <span className="text-xs text-emerald-400 font-bold italic tracking-wider flex items-center gap-1">
                          <Check className="w-4 h-4 text-emerald-500" /> TTD DIGITAL (Guru Terkait)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-600 italic">Belum Ditandatangani</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSignedTeacher(!signedTeacher)}
                      className={`w-full py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                        signedTeacher ? 'bg-slate-800 hover:bg-slate-750 text-slate-300' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      }`}
                    >
                      {signedTeacher ? 'Batalkan Tanda Tangan' : 'Simulasi Tanda Tangan'}
                    </button>
                  </div>

                  {/* Headmaster */}
                  <div className="bg-slate-900/60 p-3.5 border border-slate-800 rounded-xl flex flex-col justify-between min-h-[140px]">
                    <div className="text-center text-[10px] text-slate-400 font-bold uppercase">Kepala Satpen</div>
                    <div className="my-2 h-14 flex items-center justify-center border-b border-dashed border-slate-750">
                      {signedHeadmaster ? (
                        <span className="text-xs text-emerald-400 font-bold italic tracking-wider flex items-center gap-1">
                          <Check className="w-4 h-4 text-emerald-500" /> TTD DIGITAL (Kepala Sekolah)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-600 italic">Belum Ditandatangani</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSignedHeadmaster(!signedHeadmaster)}
                      className={`w-full py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                        signedHeadmaster ? 'bg-slate-800 hover:bg-slate-750 text-slate-300' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      }`}
                    >
                      {signedHeadmaster ? 'Batalkan Tanda Tangan' : 'Simulasi Tanda Tangan'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => handleSubmit('Draft')}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Save className="w-4.5 h-4.5 text-slate-400" />
                  Simpan sebagai Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('Submitted')}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99] shadow-lg shadow-emerald-500/10"
                >
                  <CheckCircle className="w-4.5 h-4.5 text-slate-950" />
                  Selesaikan & Submit Real-Time
                </button>
              </div>

              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => setActiveTab('instruments')}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  ← Kembali ke Kegiatan Penutup
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
