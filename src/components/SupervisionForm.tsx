import React, { useState, useEffect } from 'react';
import { InstrumentItem, User, Supervision, PredicateType } from '../types';
import { INSTRUMENT_ITEMS, DUMMY_TEACHERS } from '../data';
import { 
  ArrowLeft, Save, CheckCircle, Award, 
  Calendar, BookOpen, Layers, Edit3, ClipboardList, PenTool, Check, AlertTriangle 
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
  { id: 'pendahuluan', label: '2. Pendahuluan', icon: BookOpen },
  { id: 'inti', label: '3. Kegiatan Inti', icon: Layers },
  { id: 'penutup', label: '4. Penutup', icon: ClipboardList },
  { id: 'summary', label: '5. Feedback & Tanda Tangan', icon: Edit3 },
];

export default function SupervisionForm({ supervision, onSave, onCancel, currentUser }: SupervisionFormProps) {
  const [activeTab, setActiveTab] = useState('identity');
  
  // Form Identitas State
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [schoolName, setSchoolName] = useState('SMP Negeri 1 Telaga');
  const [className, setClassName] = useState('');
  const [phaseSemester, setPhaseSemester] = useState('Fase D / Ganjil');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Supervision scores state: item.id -> score
  const [scores, setScores] = useState<Record<number, number>>({});
  // Supervision notes state: item.id -> string notes
  const [itemNotes, setItemNotes] = useState<Record<number, string>>({});
  
  // Feedback state
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [followUp, setFollowUp] = useState('');
  
  // Signature placeholders state
  const [signedSupervisor, setSignedSupervisor] = useState(false);
  const [signedTeacher, setSignedTeacher] = useState(false);
  const [signedHeadmaster, setSignedHeadmaster] = useState(false);

  // Active sub-sections for Kegiatan Inti (A-F)
  const [activeIntiSection, setActiveIntiSection] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F'>('A');

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
      INSTRUMENT_ITEMS.forEach(item => {
        initial[item.id] = 4; // prefill with 4 as standard default, or empty. Let's prefill with 4 to save time for admin, but allow changing
      });
      setScores(initial);
    }
  }, [supervision]);

  // Handle teacher change to auto-fill subject and class if available
  const handleTeacherChange = (id: string) => {
    setSelectedTeacherId(id);
    const teacher = DUMMY_TEACHERS.find(t => t.id === id);
    if (teacher) {
      if (teacher.className) setClassName(teacher.className);
      if (teacher.subject) setSubject(teacher.subject);
    }
  };

  // Calculation Metrics
  const answeredCount = INSTRUMENT_ITEMS.filter(item => scores[item.id] !== undefined && scores[item.id] > 0).length;
  const totalScore = INSTRUMENT_ITEMS.reduce((sum, item) => sum + (scores[item.id] || 0), 0);
  const maxPossibleScore = 48 * 4; // 192
  const finalScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100 * 10) / 10 : 0;

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

    const teacher = DUMMY_TEACHERS.find(t => t.id === selectedTeacherId);
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
      supervisorName: 'Imran Tululi, S.Pd, M.Pd',
      supervisorNip: '197101241992021001',
      headmasterName: 'Dra. Hj. Rosmin Katili, M.Pd',
      headmasterNip: '196805141994032002',
      status,
      createdAt: supervision?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(payload);
  };

  // Group items by category for easy display
  const pendahuluanItems = INSTRUMENT_ITEMS.filter(i => i.category === 'I_PENDAHULUAN');
  const penutupItems = INSTRUMENT_ITEMS.filter(i => i.category === 'III_PENUTUP');
  
  const intiA_Items = INSTRUMENT_ITEMS.filter(i => i.category === 'II_A_MATERI');
  const intiB_Items = INSTRUMENT_ITEMS.filter(i => i.category === 'II_B_STRATEGI');
  const intiC_Items = INSTRUMENT_ITEMS.filter(i => i.category === 'II_C_MEDIA');
  const intiD_Items = INSTRUMENT_ITEMS.filter(i => i.category === 'II_D_ABAD21');
  const intiE_Items = INSTRUMENT_ITEMS.filter(i => i.category === 'II_E_KETERLIBATAN');
  const intiF_Items = INSTRUMENT_ITEMS.filter(i => i.category === 'II_F_BAHASA');

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
                    {DUMMY_TEACHERS.map((teacher) => (
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
                    <option value="Fase D / Ganjil">Fase D / Semester Ganjil</option>
                    <option value="Fase D / Genap">Fase D / Semester Genap</option>
                    <option value="Fase E / Ganjil">Fase E / Semester Ganjil</option>
                    <option value="Fase E / Genap">Fase E / Semester Genap</option>
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
                  onClick={() => setActiveTab('pendahuluan')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Lanjut ke Pendahuluan →
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'pendahuluan' && (
            <motion.div
              key="pendahuluan"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div className="bg-slate-800/80 border border-slate-700/40 rounded-2xl p-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  I. Kegiatan Pendahuluan (Butir 1-8)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Guru menyiapkan kesiapan belajar, melakukan apersepsi, menyampaikan tujuan, dan mengelola KSE.</p>
              </div>

              <div className="space-y-3.5">
                {pendahuluanItems.map((item) => (
                  <div key={item.id} className="bg-slate-800/40 border border-slate-700/30 p-4 rounded-2xl space-y-2">
                    <div className="flex items-start gap-2.5">
                      <span className="text-xs font-bold bg-slate-900 border border-slate-700 text-slate-300 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                        {item.id}
                      </span>
                      <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">{item.text}</p>
                    </div>

                    {renderScoreButtons(item.id)}

                    {/* Collapsible item-specific comment textfield */}
                    <div className="pt-2">
                      <input
                        type="text"
                        placeholder="Deskripsi / catatan khusus untuk butir ini (opsional)"
                        value={itemNotes[item.id] || ''}
                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-slate-700 text-[11px] text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('identity')}
                  className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  ← Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('inti')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  Lanjut ke Kegiatan Inti →
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'inti' && (
            <motion.div
              key="inti"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div className="bg-slate-800/80 border border-slate-700/40 rounded-2xl p-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  II. Kegiatan Inti (Butir 9-42)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Mengukur penguasaan materi, penerapan strategi mendidik, abad-21, diferensiasi dan KSE.</p>
              </div>

              {/* Sub-aspect selectors in Kegiatan Inti */}
              <div className="flex flex-wrap gap-1 bg-slate-950/60 p-1 border border-slate-800 rounded-xl overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveIntiSection('A')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer ${activeIntiSection === 'A' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  A. Materi (9-13)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIntiSection('B')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer ${activeIntiSection === 'B' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  B. Strategi (14-23)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIntiSection('C')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer ${activeIntiSection === 'C' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  C. Media (24-25)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIntiSection('D')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer ${activeIntiSection === 'D' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  D. Abad 21 (26-31)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIntiSection('E')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer ${activeIntiSection === 'E' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  E. Diferensiasi (32-39)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIntiSection('F')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer ${activeIntiSection === 'F' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  F. Bahasa (40-42)
                </button>
              </div>

              {/* Render dynamic sub-sections of Kegiatan Inti */}
              <div className="space-y-3">
                {activeIntiSection === 'A' && (
                  <div className="space-y-3.5">
                    <div className="text-xs font-bold text-slate-300 bg-slate-800/40 px-3 py-1.5 rounded-lg">A. Guru menguasai materi yang diajarkan</div>
                    {intiA_Items.map(item => (
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
                          className="w-full bg-slate-950/50 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activeIntiSection === 'B' && (
                  <div className="space-y-3.5">
                    <div className="text-xs font-bold text-slate-300 bg-slate-800/40 px-3 py-1.5 rounded-lg">B. Guru menerapkan strategi pembelajaran yang mendidik</div>
                    {intiB_Items.map(item => (
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
                          className="w-full bg-slate-950/50 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activeIntiSection === 'C' && (
                  <div className="space-y-3.5">
                    <div className="text-xs font-bold text-slate-300 bg-slate-800/40 px-3 py-1.5 rounded-lg">C. Guru memanfaatkan sumber belajar / media dalam pembelajaran</div>
                    {intiC_Items.map(item => (
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
                          className="w-full bg-slate-950/50 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activeIntiSection === 'D' && (
                  <div className="space-y-3.5">
                    <div className="text-xs font-bold text-slate-300 bg-slate-800/40 px-3 py-1.5 rounded-lg">D. Implementasi Keterampilan Pembelajaran Abad 21</div>
                    {intiD_Items.map(item => (
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
                          className="w-full bg-slate-950/50 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activeIntiSection === 'E' && (
                  <div className="space-y-3.5">
                    <div className="text-xs font-bold text-slate-300 bg-slate-800/40 px-3 py-1.5 rounded-lg">E. Guru memicu dan/atau memelihara keterlibatan peserta didik (Diferensiasi)</div>
                    {intiE_Items.map(item => (
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
                          className="w-full bg-slate-950/50 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activeIntiSection === 'F' && (
                  <div className="space-y-3.5">
                    <div className="text-xs font-bold text-slate-300 bg-slate-800/40 px-3 py-1.5 rounded-lg">F. Guru menggunakan bahasa yang benar dan tepat dalam pembelajaran</div>
                    {intiF_Items.map(item => (
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
                          className="w-full bg-slate-950/50 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sub navigation controls for Inti sections */}
              <div className="flex justify-between items-center py-2 bg-slate-950/30 p-3 rounded-xl border border-slate-800 mt-2">
                <span className="text-[10px] text-slate-400 font-bold">Sub-Bagian Inti</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    disabled={activeIntiSection === 'A'}
                    onClick={() => {
                      const order: ('A'|'B'|'C'|'D'|'E'|'F')[] = ['A', 'B', 'C', 'D', 'E', 'F'];
                      const idx = order.indexOf(activeIntiSection);
                      setActiveIntiSection(order[idx - 1]);
                    }}
                    className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs disabled:opacity-40 cursor-pointer"
                  >
                    ← Back Section
                  </button>
                  <button
                    type="button"
                    disabled={activeIntiSection === 'F'}
                    onClick={() => {
                      const order: ('A'|'B'|'C'|'D'|'E'|'F')[] = ['A', 'B', 'C', 'D', 'E', 'F'];
                      const idx = order.indexOf(activeIntiSection);
                      setActiveIntiSection(order[idx + 1]);
                    }}
                    className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs disabled:opacity-40 cursor-pointer"
                  >
                    Next Section →
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('pendahuluan')}
                  className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  ← Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('penutup')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  Lanjut ke Penutup →
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'penutup' && (
            <motion.div
              key="penutup"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div className="bg-slate-800/80 border border-slate-700/40 rounded-2xl p-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-emerald-400" />
                  III. Kegiatan Penutup (Butir 43-48)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Guru mengakhiri pembelajaran dengan kesimpulan, refleksi diri, tindak lanjut dan penutup.</p>
              </div>

              <div className="space-y-3.5">
                {penutupItems.map((item) => (
                  <div key={item.id} className="bg-slate-800/40 border border-slate-700/30 p-4 rounded-2xl space-y-2">
                    <div className="flex items-start gap-2.5">
                      <span className="text-xs font-bold bg-slate-900 border border-slate-700 text-slate-300 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                        {item.id}
                      </span>
                      <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">{item.text}</p>
                    </div>

                    {renderScoreButtons(item.id)}

                    <div className="pt-2">
                      <input
                        type="text"
                        placeholder="Catatan khusus (opsional)"
                        value={itemNotes[item.id] || ''}
                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('inti')}
                  className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  ← Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('summary')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  Feedback & Selesai →
                </button>
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
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-emerald-400" />
                  Ulasan Umum, Rekomendasi & Tanda Tangan
                </h2>
                <p className="text-xs text-slate-300">
                  Selesaikan pengisian instrumen dengan memberikan masukan dan rencana tindak lanjut pengembangan kompetensi guru.
                </p>
                
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
                  onClick={() => setActiveTab('penutup')}
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
