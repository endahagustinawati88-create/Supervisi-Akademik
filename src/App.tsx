import React, { useState, useEffect } from 'react';
import { User, Supervision } from './types';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import SystemAdminDashboard from './components/SystemAdminDashboard';
import SupervisionForm from './components/SupervisionForm';
import { motion, AnimatePresence } from 'motion/react';
import { getSupervisions, saveSupervisions } from './data';

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
        const supervisions = getSupervisions();
        // sort by date descending
        supervisions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setSupervisions(supervisions);
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
    const filtered = supervisions.filter(s => s.id !== id);
    setSupervisions(filtered);
    saveSupervisions(filtered);
  };

  const handleSaveSupervision = async (updatedSup: Supervision) => {
    try {
      let newSupervisions = [...supervisions];
      if (updatedSup.id && newSupervisions.some(s => s.id === updatedSup.id)) {
        newSupervisions = newSupervisions.map(s => s.id === updatedSup.id ? updatedSup : s);
      } else {
        if (!updatedSup.id) {
            updatedSup.id = 'sup-' + Date.now();
        }
        newSupervisions = [updatedSup, ...newSupervisions];
      }
      setSupervisions(newSupervisions);
      saveSupervisions(newSupervisions);
      
      setIsFormOpen(false);
      setSelectedSupervision(null);
    } catch (err) {
      console.error('Error saving supervision:', err);
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
