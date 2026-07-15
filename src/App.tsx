import React, { useState, useEffect } from 'react';
import { User, Supervision } from './types';
import { initialSupervisions } from './data';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import SupervisionForm from './components/SupervisionForm';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sipro_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [supervisions, setSupervisions] = useState<Supervision[]>(() => {
    const saved = localStorage.getItem('sipro_supervisions');
    return saved ? JSON.parse(saved) : initialSupervisions;
  });

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
    localStorage.setItem('sipro_supervisions', JSON.stringify(supervisions));
  }, [supervisions]);

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
      // We pass custom temporary state inside the form component
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

  const handleDeleteSupervision = (id: string) => {
    const filtered = supervisions.filter(s => s.id !== id);
    setSupervisions(filtered);
  };

  const handleSaveSupervision = (updatedSup: Supervision) => {
    // Find if already exists
    const exists = supervisions.some(s => s.id === updatedSup.id);
    if (exists) {
      setSupervisions(prev => prev.map(s => s.id === updatedSup.id ? updatedSup : s));
    } else {
      setSupervisions(prev => [updatedSup, ...prev]);
    }
    setIsFormOpen(false);
    setSelectedSupervision(null);
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
