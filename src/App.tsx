import React, { useState, useEffect } from 'react';
import { User, Supervision } from './types';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import SystemAdminDashboard from './components/SystemAdminDashboard';
import SupervisionForm from './components/SupervisionForm';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sipro_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [supervisions, setSupervisions] = useState<Supervision[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupervision, setSelectedSupervision] = useState<Supervision | null>(null);

  // Sync state to localstorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sipro_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sipro_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchSupervisions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('supervisions').select('*').order('date', { ascending: false });
        if (error) throw error;
        
        if (data) {
          const transformed: Supervision[] = data.map((d: any) => {
            // We stored the JSON representation in the `notes` column to bypass strict SQL schema limitations
            if (d.notes && d.notes.startsWith('{')) {
              try {
                const parsed = JSON.parse(d.notes);
                return {
                  ...parsed,
                  id: d.id, // preserve UUID
                  teacherId: d.teacher_id,
                  date: d.date,
                };
              } catch (e) {
                // Ignore parse errors
              }
            }
            return null;
          }).filter(Boolean) as Supervision[];
          
          setSupervisions(transformed);
        }
      } catch (err) {
        console.error('Error fetching supervisions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchSupervisions();
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsFormOpen(false);
    setSelectedSupervision(null);
  };

  const handleStartNewSupervision = (teacherId?: string) => {
    setSelectedSupervision(null);
    setIsFormOpen(true);
    
    // If a teacherId is pre-selected, we can prefill it in the form
    if (teacherId) {
      setTimeout(() => {
        const teacherSelect = document.querySelector('select');
        if (teacherSelect) {
          teacherSelect.value = teacherId;
          const event = new Event('change', { bubbles: true });
          teacherSelect.dispatchEvent(event);
        }
      }, 50);
    }
  };

  const handleEditSupervision = (supervision: Supervision) => {
    setSelectedSupervision(supervision);
    setIsFormOpen(true);
  };

  const handleDeleteSupervision = async (id: string) => {
    // If it's a UUID we delete from DB. If it's a local 'sup-xxx' string that hasn't synced properly (rare but possible), just filter.
    if (id.includes('-')) {
      try {
        await supabase.from('supervisions').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting supervision:', err);
      }
    }
    const filtered = supervisions.filter(s => s.id !== id);
    setSupervisions(filtered);
  };

  const handleSaveSupervision = async (updatedSup: Supervision) => {
    try {
      const exists = supervisions.some(s => s.id === updatedSup.id);
      const isUUID = updatedSup.id.includes('-') && updatedSup.id.length > 20;

      // Map UI status to DB Enum Status
      const dbStatus = updatedSup.status === 'Draft' ? 'Sedang Berjalan' : 'Selesai';
      
      const payload = {
        teacher_id: updatedSup.teacherId,
        date: updatedSup.date,
        category: 'Pelaksanaan Pembelajaran',
        status: dbStatus,
        score: updatedSup.finalScore,
        notes: JSON.stringify(updatedSup), // Serialize full object to notes
        feedback: updatedSup.generalFeedback || 'No feedback'
      };

      if (exists && isUUID) {
        const { error } = await supabase.from('supervisions').update(payload).eq('id', updatedSup.id);
        if (error) throw error;
        setSupervisions(prev => prev.map(s => s.id === updatedSup.id ? updatedSup : s));
      } else {
        const { data, error } = await supabase.from('supervisions').insert([payload]).select().single();
        if (error) throw error;
        if (data) {
          updatedSup.id = data.id; // Get the generated UUID
          setSupervisions(prev => [updatedSup, ...prev.filter(s => s.id !== updatedSup.id)]);
        }
      }
      setIsFormOpen(false);
      setSelectedSupervision(null);
    } catch (err) {
      console.error('Error saving supervision:', err);
      alert('Gagal menyimpan ke database Supabase. Periksa log konsol.');
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen">
      <AnimatePresence mode="wait">
        {!currentUser ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen"
          >
            <Login onLoginSuccess={handleLoginSuccess} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen"
          >
            {currentUser.role === 'admin' ? (
              <SystemAdminDashboard
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            ) : currentUser.role === 'pengawas' || currentUser.role === 'kepsek' ? (
              isFormOpen ? (
                <SupervisionForm
                  supervision={selectedSupervision}
                  onSave={handleSaveSupervision}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setSelectedSupervision(null);
                  }}
                  currentUser={currentUser}
                />
              ) : (
                <AdminDashboard
                  currentUser={currentUser}
                  supervisions={supervisions}
                  onStartNewSupervision={handleStartNewSupervision}
                  onEditSupervision={handleEditSupervision}
                  onDeleteSupervision={handleDeleteSupervision}
                  onLogout={handleLogout}
                />
              )
            ) : (
              <TeacherDashboard
                currentUser={currentUser}
                supervisions={supervisions}
                onLogout={handleLogout}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
