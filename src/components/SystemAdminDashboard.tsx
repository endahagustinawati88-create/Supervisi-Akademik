import React, { useState, useEffect } from 'react';
import { User, AppSettings, InstrumentItem } from '../types';
import { Settings, Users, LogOut, Plus, Trash2, ShieldCheck, Edit, BookOpen, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { getInstrumentItems, saveInstrumentItems, getCategories, saveCategories, Category } from '../data';

interface Props {
  currentUser: User;
  onLogout: () => void;
}

export default function SystemAdminDashboard({ currentUser, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<'settings' | 'teachers' | 'supervisors' | 'instruments'>('settings');
  const [isLoading, setIsLoading] = useState(true);

  // App Settings
  const [appSettings, setAppSettings] = useState<AppSettings>({
    appName: 'SIPRO-BELAJAR',
    schoolName: 'SMP Negeri 1 Telaga',
    themeColor: 'emerald'
  });

  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Teachers State
  const [localTeachers, setLocalTeachers] = useState<User[]>([]);

  // Supervisors State (Pengawas & Kepsek)
  const [localSupervisors, setLocalSupervisors] = useState<User[]>([]);

  // Instruments State
  const [localInstruments, setLocalInstruments] = useState<InstrumentItem[]>(getInstrumentItems());
  const [localCategories, setLocalCategories] = useState<Category[]>(getCategories());
  const [newInstrumentText, setNewInstrumentText] = useState('');
  const [newInstrumentCategory, setNewInstrumentCategory] = useState(localCategories[0]?.id || 'I_PENDAHULUAN');
  const [editingInstrument, setEditingInstrument] = useState<InstrumentItem | null>(null);

  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryLabel) return;
    const newId = newCategoryLabel.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const newCategories = [...localCategories, { id: newId, label: newCategoryLabel }];
    setLocalCategories(newCategories);
    saveCategories(newCategories);
    setNewCategoryLabel('');
    if (!newInstrumentCategory) {
      setNewInstrumentCategory(newId);
    }
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const newCategories = localCategories.map(c => c.id === editingCategory.id ? editingCategory : c);
    setLocalCategories(newCategories);
    saveCategories(newCategories);
    
    // Also update labels in instruments
    const newInstruments = localInstruments.map(i => {
      if (i.category === editingCategory.id) {
        return { ...i, categoryLabel: editingCategory.label };
      }
      return i;
    });
    setLocalInstruments(newInstruments);
    saveInstrumentItems(newInstruments);
    
    setEditingCategory(null);
  };

  const confirmDeleteCategory = (id: string) => {
    const newCategories = localCategories.filter(c => c.id !== id);
    setLocalCategories(newCategories);
    saveCategories(newCategories);
    
    const newInstruments = localInstruments.filter(i => i.category !== id);
    setLocalInstruments(newInstruments);
    saveInstrumentItems(newInstruments);
    
    if (newInstrumentCategory === id && newCategories.length > 0) {
      setNewInstrumentCategory(newCategories[0].id);
    }
    setCategoryToDelete(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch Settings
        const { data: settingsData } = await supabase.from('app_settings').select('*').eq('id', 1).single();
        if (settingsData) {
          setAppSettings({
            appName: settingsData.app_name,
            schoolName: settingsData.school_name,
            themeColor: settingsData.theme_color
          });
        }

        // Fetch Users
        const { data: usersData } = await supabase.from('users').select('*');
        if (usersData) {
          const teachers = usersData.filter(u => u.role === 'guru').map(mapDbToUser);
          const supervisors = usersData.filter(u => u.role === 'pengawas' || u.role === 'kepsek').map(mapDbToUser);
          setLocalTeachers(teachers);
          setLocalSupervisors(supervisors);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const mapDbToUser = (data: any): User => ({
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
  });

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('app_settings').upsert({
        id: 1,
        app_name: appSettings.appName,
        school_name: appSettings.schoolName,
        theme_color: appSettings.themeColor
      });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // -- Add Teacher
  const [newTeacher, setNewTeacher] = useState({ 
    name: '', nip: '', subject: '', className: '',
    driveUrl: '', supervisionSchedule: '',
    topic: '', timeAllocation: '', targetPhase: ''
  });
  
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.nip) return;
    
    const payload = {
      id: newTeacher.nip,
      username: newTeacher.nip,
      name: newTeacher.name,
      role: 'guru',
      nip: newTeacher.nip,
      school_name: appSettings.schoolName,
      class_name: newTeacher.className,
      subject: newTeacher.subject,
      drive_url: newTeacher.driveUrl || null,
      supervision_schedule: newTeacher.supervisionSchedule || null,
      module_topic: newTeacher.topic || null,
      module_time_allocation: newTeacher.timeAllocation || null,
      module_target_phase: newTeacher.targetPhase || null
    };

    try {
      const { data, error } = await supabase.from('users').insert([payload]).select().single();
      if (error) throw error;
      if (data) {
        setLocalTeachers([...localTeachers, mapDbToUser(data)]);
        setNewTeacher({ name: '', nip: '', subject: '', className: '', driveUrl: '', supervisionSchedule: '', topic: '', timeAllocation: '', targetPhase: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleDeleteTeacher = async (id: string) => {
    try {
      await supabase.from('users').delete().eq('id', id);
      setLocalTeachers(localTeachers.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // -- Add Supervisor/Kepsek
  const [newSupervisor, setNewSupervisor] = useState({ name: '', nip: '', role: 'pengawas' as 'pengawas' | 'kepsek' });
  const handleAddSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupervisor.name || !newSupervisor.nip) return;

    const role = newSupervisor.role;
    const id = role === 'kepsek' ? 'kepsek_' + newSupervisor.nip : newSupervisor.nip;
    const username = role === 'kepsek' ? 'kepsek' : newSupervisor.nip;

    const payload = {
      id,
      username,
      name: newSupervisor.name,
      role,
      nip: newSupervisor.nip,
      school_name: appSettings.schoolName
    };

    try {
      const { data, error } = await supabase.from('users').insert([payload]).select().single();
      if (error) throw error;
      if (data) {
        setLocalSupervisors([...localSupervisors, mapDbToUser(data)]);
        setNewSupervisor({ name: '', nip: '', role: 'pengawas' });
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleDeleteSupervisor = async (id: string) => {
    try {
      await supabase.from('users').delete().eq('id', id);
      setLocalSupervisors(localSupervisors.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'I_PENDAHULUAN': 'I. Kegiatan Pendahuluan',
      'II_A_MATERI': 'II.A. Penguasaan Materi',
      'II_B_STRATEGI': 'II.B. Strategi Pembelajaran',
      'II_C_MEDIA': 'II.C. Pemanfaatan Sumber Belajar/Media',
      'II_D_ABAD21': 'II.D. Pembelajaran Abad 21',
      'II_E_KETERLIBATAN': 'II.E. Keterlibatan Siswa & Diferensiasi',
      'II_F_BAHASA': 'II.F. Penggunaan Bahasa',
      'III_PENUTUP': 'III. Kegiatan Penutup'
    };
    return labels[category] || category;
  };

  const handleAddInstrument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstrumentText) return;
    
    const newId = localInstruments.length > 0 ? Math.max(...localInstruments.map(i => i.id)) + 1 : 1;
    const newItem: InstrumentItem = {
      id: newId,
      category: newInstrumentCategory,
      categoryLabel: getCategoryLabel(newInstrumentCategory),
      text: newInstrumentText
    };
    
    const updated = [...localInstruments, newItem];
    setLocalInstruments(updated);
    saveInstrumentItems(updated);
    setNewInstrumentText('');
  };

  const handleUpdateInstrument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstrument || !editingInstrument.text) return;
    
    const updated = localInstruments.map(i => i.id === editingInstrument.id ? {
      ...editingInstrument,
      categoryLabel: getCategoryLabel(editingInstrument.category)
    } : i);
    setLocalInstruments(updated);
    saveInstrumentItems(updated);
    setEditingInstrument(null);
  };

  const handleDeleteInstrument = (id: number) => {
    const updated = localInstruments.filter(i => i.id !== id);
    setLocalInstruments(updated);
    saveInstrumentItems(updated);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">Memuat pengaturan...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">

        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
              <ShieldCheck className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">System Admin</h1>
              <span className="text-[10px] text-slate-400">Pengaturan & Master Data</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-xs text-red-400 font-medium"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-xl mb-8 overflow-x-auto border border-slate-800">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'settings' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" /> Pengaturan Tampilan
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'teachers' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> Data Guru
          </button>
          <button
            onClick={() => setActiveTab('supervisors')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'supervisors' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Data Pengawas & Kepsek
          </button>
          <button
            onClick={() => setActiveTab('instruments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'instruments' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Indikator Penilaian
          </button>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'settings' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white">Pengaturan Tampilan Aplikasi</h2>
                <p className="text-sm text-slate-400">Sesuaikan identitas sekolah dan judul aplikasi.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nama Aplikasi</label>
                  <input
                    type="text"
                    value={appSettings.appName}
                    onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nama Sekolah</label>
                  <input
                    type="text"
                    value={appSettings.schoolName}
                    onChange={(e) => setAppSettings({ ...appSettings, schoolName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                
                <div className="pt-4">
                  <button type="submit" className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors">
                    Simpan Pengaturan
                  </button>
                  {settingsSuccess && <span className="ml-4 text-xs text-emerald-400">Berhasil disimpan!</span>}
                </div>
              </form>
            </div>
          )}

          {activeTab === 'teachers' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
                <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-400"/> Tambah Guru</h3>
                <form onSubmit={handleAddTeacher} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nama Lengkap</label>
                    <input required type="text" value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="Cth: Budi Santoso, S.Pd"/>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">NIP (Username Login)</label>
                    <input required type="text" value={newTeacher.nip} onChange={e => setNewTeacher({...newTeacher, nip: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="18 digit NIP"/>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Mata Pelajaran</label>
                    <input type="text" value={newTeacher.subject} onChange={e => setNewTeacher({...newTeacher, subject: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="Cth: Matematika"/>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Kelas Binaan</label>
                    <input type="text" value={newTeacher.className} onChange={e => setNewTeacher({...newTeacher, className: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="Cth: VII-A"/>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">URL Google Drive (Modul Ajar)</label>
                    <input type="url" value={newTeacher.driveUrl} onChange={e => setNewTeacher({...newTeacher, driveUrl: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="https://docs.google.com/..."/>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Jadwal Supervisi</label>
                    <input type="text" value={newTeacher.supervisionSchedule} onChange={e => setNewTeacher({...newTeacher, supervisionSchedule: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="Cth: Senin, 20 Juli 2026 / 08:00 - 09:30"/>
                  </div>
                  <div className="border-t border-slate-800 pt-3">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Identitas Modul Ajar</span>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Topik / Materi</label>
                        <input type="text" value={newTeacher.topic} onChange={e => setNewTeacher({...newTeacher, topic: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="Cth: Persamaan Kuadrat"/>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Alokasi Waktu</label>
                          <input type="text" value={newTeacher.timeAllocation} onChange={e => setNewTeacher({...newTeacher, timeAllocation: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="Cth: 2 x 40 Menit"/>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Fase Sasaran</label>
                          <input type="text" value={newTeacher.targetPhase} onChange={e => setNewTeacher({...newTeacher, targetPhase: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="Cth: Fase A"/>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                    Simpan Guru
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-md font-bold text-white mb-4">Daftar Guru ({localTeachers.length})</h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {localTeachers.map(t => (
                    <div key={t.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white">{t.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">NIP: {t.nip}</span>
                          {t.subject && <span>Mapel: {t.subject}</span>}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteTeacher(t.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {localTeachers.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm">Belum ada data guru.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'supervisors' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
                <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-indigo-400"/> Tambah Pejabat</h3>
                <form onSubmit={handleAddSupervisor} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nama Lengkap</label>
                    <input required type="text" value={newSupervisor.name} onChange={e => setNewSupervisor({...newSupervisor, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="Cth: Dr. Ahmad, M.Pd"/>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">NIP</label>
                    <input required type="text" value={newSupervisor.nip} onChange={e => setNewSupervisor({...newSupervisor, nip: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="18 digit NIP"/>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Jabatan</label>
                    <select value={newSupervisor.role} onChange={e => setNewSupervisor({...newSupervisor, role: e.target.value as 'pengawas' | 'kepsek'})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none">
                      <option value="pengawas">Pengawas (Supervisor)</option>
                      <option value="kepsek">Kepala Sekolah</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/50 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                    Simpan Pejabat
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-md font-bold text-white mb-4">Daftar Pengawas & Kepsek ({localSupervisors.length})</h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {localSupervisors.map(s => (
                    <div key={s.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-sm font-semibold text-white">{s.name}</div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${s.role === 'kepsek' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}`}>
                            {s.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">NIP: {s.nip}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteSupervisor(s.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {localSupervisors.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm">Belum ada data pengawas/kepsek.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'instruments' && (
            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Kelola Kategori</h2>
                <form onSubmit={handleAddCategory} className="flex gap-4 mb-4">
                  <input
                    type="text"
                    value={newCategoryLabel}
                    onChange={e => setNewCategoryLabel(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="Masukkan nama kategori baru (mis. IV. Tindak Lanjut)"
                    required
                  />
                  <button type="submit" className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Tambah
                  </button>
                </form>
                <div className="space-y-2">
                  {localCategories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-xl">
                      {editingCategory?.id === cat.id ? (
                        <form onSubmit={handleUpdateCategory} className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editingCategory.label}
                            onChange={e => setEditingCategory({ ...editingCategory, label: e.target.value })}
                            className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
                            autoFocus
                          />
                          <button type="submit" className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg">Simpan</button>
                          <button type="button" onClick={() => setEditingCategory(null)} className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-lg">Batal</button>
                        </form>
                      ) : (
                        <>
                          {categoryToDelete === cat.id ? (
                            <div className="flex-1 flex items-center justify-between">
                              <span className="text-xs text-red-400">Hapus kategori beserta instrumennya?</span>
                              <div className="flex gap-2">
                                <button onClick={() => confirmDeleteCategory(cat.id)} className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-lg">Ya, Hapus</button>
                                <button onClick={() => setCategoryToDelete(null)} className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-lg">Batal</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm text-slate-200 font-medium">{cat.label}</span>
                              <div className="flex gap-2">
                                <button onClick={() => setEditingCategory(cat)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => setCategoryToDelete(cat.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  {localCategories.length === 0 && (
                    <div className="text-center py-4 text-slate-500 text-sm">Belum ada kategori.</div>
                  )}
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Indikator Penilaian Supervisi</h2>
                <form onSubmit={handleAddInstrument} className="space-y-4 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Kategori</label>
                      <select
                        value={newInstrumentCategory}
                        onChange={e => setNewInstrumentCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        required
                      >
                        {localCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Teks Indikator</label>
                      <input
                        type="text"
                        value={newInstrumentText}
                        onChange={e => setNewInstrumentText(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        placeholder="Masukkan teks indikator..."
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Tambah Indikator
                    </button>
                  </div>
                </form>
                <div className="space-y-4">
                  {localCategories.map(categoryObj => {
                    const category = categoryObj.id;
                    const itemsInCategory = localInstruments.filter(i => i.category === category);
                    if (itemsInCategory.length === 0) return null;
                    return (
                    <div key={category} className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                      <div className="bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-300 border-b border-slate-800">
                        {categoryObj.label}
                      </div>
                      <div className="divide-y divide-slate-800/50">
                        {itemsInCategory.map((item, index) => (
                          <div key={item.id} className="p-3 flex items-start justify-between gap-4 hover:bg-slate-900/30 transition-colors">
                            <div className="flex gap-3 flex-1">
                              <span className="text-slate-500 text-sm font-mono mt-0.5">{index + 1}.</span>
                              {editingInstrument?.id === item.id ? (
                                <form onSubmit={handleUpdateInstrument} className="flex-1 flex gap-2">
                                  <input
                                    type="text"
                                    value={editingInstrument.text}
                                    onChange={e => setEditingInstrument({ ...editingInstrument, text: e.target.value })}
                                    className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
                                    autoFocus
                                  />
                                  <button type="submit" className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg">Simpan</button>
                                  <button type="button" onClick={() => setEditingInstrument(null)} className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-lg">Batal</button>
                                </form>
                              ) : (
                                <p className="text-sm text-slate-300 leading-relaxed">{item.text}</p>
                              )}
                            </div>
                            {!editingInstrument && (
                              <div className="flex items-center gap-1">
                                <button onClick={() => setEditingInstrument(item)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteInstrument(item.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ); })}
                  {localInstruments.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm">Belum ada indikator penilaian.</div>
                  )}
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </main>
    </div>
  );
}
