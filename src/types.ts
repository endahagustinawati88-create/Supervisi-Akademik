export type UserRole = 'admin' | 'guru';

export interface User {
  id: string; // 'admin' or NIP for guru
  username: string;
  name: string;
  role: UserRole;
  nip?: string;
  schoolName?: string;
  className?: string;
  subject?: string;
  photoUrl?: string;
}

export type SupervisionCategory = 
  | 'I_PENDAHULUAN'
  | 'II_A_MATERI'
  | 'II_B_STRATEGI'
  | 'II_C_MEDIA'
  | 'II_D_ABAD21'
  | 'II_E_KETERLIBATAN'
  | 'II_F_BAHASA'
  | 'III_PENUTUP';

export interface InstrumentItem {
  id: number;
  category: SupervisionCategory;
  categoryLabel: string;
  text: string;
}

export type PredicateType = 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';

export interface Supervision {
  id: string;
  teacherId: string; // NIP
  teacherName: string;
  schoolName: string;
  className: string;
  phaseSemester: string;
  subject: string;
  date: string;
  scores: Record<number, number>; // id (1-48) -> score (1-4)
  notes: Record<number, string>; // id (1-48) -> comment (optional)
  totalScore: number; // sum of scores
  finalScore: number; // (totalScore / 192) * 100
  predicate: PredicateType;
  generalFeedback: string;
  followUp: string;
  supervisorName: string;
  supervisorNip: string;
  headmasterName: string;
  headmasterNip: string;
  status: 'Draft' | 'Submitted';
  createdAt: string;
  updatedAt: string;
}

export interface TeacherProgress {
  teacherId: string;
  teacherName: string;
  nip: string;
  subject: string;
  className: string;
  lastSupervisionDate?: string;
  lastScore?: number;
  lastPredicate?: PredicateType;
  supervisionCount: number;
  history: {
    supervisionId: string;
    date: string;
    score: number;
    predicate: PredicateType;
  }[];
}
