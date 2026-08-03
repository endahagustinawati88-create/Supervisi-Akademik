import { InstrumentItem, User, Supervision } from './types';

export const DEFAULT_INSTRUMENT_ITEMS: InstrumentItem[] = [
  // I. Kegiatan Pendahuluan (1-8)
  {
    id: 1,
    category: 'I_PENDAHULUAN',
    categoryLabel: 'I. Kegiatan Pendahuluan',
    text: 'Menyampaikan salam dan menyiapkan fisik dan psikis peserta didik dalam mengawali kegiatan pembelajaran'
  },
  {
    id: 2,
    category: 'I_PENDAHULUAN',
    categoryLabel: 'I. Kegiatan Pendahuluan',
    text: 'Guru menyampaikan dan mengingatkan keyakinan kelas yang telah disepakati bersama'
  },
  {
    id: 3,
    category: 'I_PENDAHULUAN',
    categoryLabel: 'I. Kegiatan Pendahuluan',
    text: 'Guru mengajukan pertanyaan sebagai asesmen formatif di awal pembelajaran untuk menilai kesiapan setiap individu peserta didik mempelajari materi yang telah dirancang'
  },
  {
    id: 4,
    category: 'I_PENDAHULUAN',
    categoryLabel: 'I. Kegiatan Pendahuluan',
    text: 'Memberikan apersepsi dengan cara menghubungkan materi pembelajaran dengan pengalaman peserta didik'
  },
  {
    id: 5,
    category: 'I_PENDAHULUAN',
    categoryLabel: 'I. Kegiatan Pendahuluan',
    text: 'Menyampaikan tujuan pembelajaran, dan kompetensi yang akan dicapai oleh peserta didik'
  },
  {
    id: 6,
    category: 'I_PENDAHULUAN',
    categoryLabel: 'I. Kegiatan Pendahuluan',
    text: 'Menyampaikan manfaat pembelajaran'
  },
  {
    id: 7,
    category: 'I_PENDAHULUAN',
    categoryLabel: 'I. Kegiatan Pendahuluan',
    text: 'Menyampaikan langkah-langkah kegiatan pembelajaran dan kompetensi yang akan dinilai yang mencerminkan tujuan pembelajaran'
  },
  {
    id: 8,
    category: 'I_PENDAHULUAN',
    categoryLabel: 'I. Kegiatan Pendahuluan',
    text: 'Guru mengelola kesadaran sosial dan emosional (KSE) siswa untuk fokus pada materi yang akan diajarkan.'
  },

  // II. Kegiatan Inti - A. Menguasai materi (9-13)
  {
    id: 9,
    category: 'II_A_MATERI',
    categoryLabel: 'II.A. Penguasaan Materi',
    text: 'Kemampuan menyesuaikan materi dengan tujuan pembelajaran'
  },
  {
    id: 10,
    category: 'II_A_MATERI',
    categoryLabel: 'II.A. Penguasaan Materi',
    text: 'Kemampuan mengaitkan materi dengan pengetahuan lain yang diintegrasikan secara relevan dengan perkembangan Iptek, budaya positif dan kehidupan nyata sehari - hari'
  },
  {
    id: 11,
    category: 'II_A_MATERI',
    categoryLabel: 'II.A. Penguasaan Materi',
    text: 'Menggunakan pertanyaan terbuka yang menstimulasi pemikiran yang mendalam.'
  },
  {
    id: 12,
    category: 'II_A_MATERI',
    categoryLabel: 'II.A. Penguasaan Materi',
    text: 'Memotivasi peserta didik untuk berpartisipasi aktif agar terbangun sikap pembelajar mandiri.'
  },
  {
    id: 13,
    category: 'II_A_MATERI',
    categoryLabel: 'II.A. Penguasaan Materi',
    text: 'Guru menyajikan materi secara sistematis (mudah ke sulit, dari konkrit ke abstrak)'
  },

  // II. Kegiatan Inti - B. Menerapkan strategi pembelajaran yang mendidik (14-23)
  {
    id: 14,
    category: 'II_B_STRATEGI',
    categoryLabel: 'II.B. Strategi Pembelajaran',
    text: 'Melaksanakan pembelajaran mengikuti kerangka Alur Tujuan Pembelajaran'
  },
  {
    id: 15,
    category: 'II_B_STRATEGI',
    categoryLabel: 'II.B. Strategi Pembelajaran',
    text: 'Guru melaksanakan pembelajaran sesuai dengan kompetensi yang akan dicapai. Menggunakan kelompok berbeda'
  },
  {
    id: 16,
    category: 'II_B_STRATEGI',
    categoryLabel: 'II.B. Strategi Pembelajaran',
    text: 'Guru melaksanakan pembelajaran yang menumbuhkan partisipasi aktif murid dalam mengajukan pertanyaan'
  },
  {
    id: 17,
    category: 'II_B_STRATEGI',
    categoryLabel: 'II.B. Strategi Pembelajaran',
    text: 'Guru melaksanakan pembelajaran yang menumbuhkan partisipasi aktif murid dalam mengemukakan pendapat (mendorong dan menumbuhkan KSE siswa)'
  },
  {
    id: 18,
    category: 'II_B_STRATEGI',
    categoryLabel: 'II.B. Strategi Pembelajaran',
    text: 'Menguasai pengelolaan kelas dengan baik.'
  },
  {
    id: 19,
    category: 'II_B_STRATEGI',
    categoryLabel: 'II.B. Strategi Pembelajaran',
    text: 'Melaksanakan asesmen formatif dalam Proses Pembelajaran'
  },
  {
    id: 20,
    category: 'II_B_STRATEGI',
    categoryLabel: 'II.B. Strategi Pembelajaran',
    text: 'Melaksanakan umpan balik pelaksanaan proses pembelajaran'
  },
  {
    id: 21,
    category: 'II_B_STRATEGI',
    categoryLabel: 'II.B. Strategi Pembelajaran',
    text: 'Pembelajaran yang dilaksanakan menumbuhkan kemampuan berliterasi dan numerasi'
  },
  {
    id: 22,
    category: 'II_B_STRATEGI',
    categoryLabel: 'II.B. Strategi Pembelajaran',
    text: 'Guru melaksanakan pembelajaran yang memungkinkan tumbuhnya kebiasaan dan sikap positif (nurturant effect) (Menumbuhkan KSE Siswa)'
  },
  {
    id: 23,
    category: 'II_B_STRATEGI',
    categoryLabel: 'II.B. Strategi Pembelajaran',
    text: 'Melaksanakan pembelajaran sesuai dengan alokasi waktu yang direncanakan'
  },

  // II. Kegiatan Inti - C. Memanfaatkan sumber belajar/media (24-25)
  {
    id: 24,
    category: 'II_C_MEDIA',
    categoryLabel: 'II.C. Pemanfaatan Sumber Belajar/Media',
    text: 'Menunjukkan keterampilan dalam menggunakan sumber dan media pembelajaran sehingga menghasilkan pesan yang menarik dan bermakna'
  },
  {
    id: 25,
    category: 'II_C_MEDIA',
    categoryLabel: 'II.C. Pemanfaatan Sumber Belajar/Media',
    text: 'Melibatkan peserta didik dalam pemanfaatan media dan sumber pembelajaran'
  },

  // II. Kegiatan Inti - D. Implementasi Keterampilan Abad 21 (26-31)
  {
    id: 26,
    category: 'II_D_ABAD21',
    categoryLabel: 'II.D. Pembelajaran Abad 21',
    text: 'Pembelajaran yang dilaksanakan bersifat interaktif sehingga memiliki kemampuan komunikatif dan kerjasama yang baik (communication)'
  },
  {
    id: 27,
    category: 'II_D_ABAD21',
    categoryLabel: 'II.D. Pembelajaran Abad 21',
    text: 'Pembelajaran yang dilaksanakan menantang sehingga memunculkan kemampuan berpikir kritis dan penyelesaian masalah. (critical thinking and problem solving)'
  },
  {
    id: 28,
    category: 'II_D_ABAD21',
    categoryLabel: 'II.D. Pembelajaran Abad 21',
    text: 'Pembelajaran mendorong peserta didik untuk membiasakan bekerja sama secara berpasangan atau kelompok (collaboration)'
  },
  {
    id: 29,
    category: 'II_D_ABAD21',
    categoryLabel: 'II.D. Pembelajaran Abad 21',
    text: 'Pendidik memberikan ruang yang cukup bagi prakarsa, kreativitas, kemandirian sesuai bakat, minat, dan perkembangan fisik, serta psikologis peserta didik. (creativity and innovation)'
  },
  {
    id: 30,
    category: 'II_D_ABAD21',
    categoryLabel: 'II.D. Pembelajaran Abad 21',
    text: 'Guru menciptakan suasana kelas yang kondusif untuk proses belajar mengajar (sesuai dengan kesepakatan kelas dan KSE).'
  },
  {
    id: 31,
    category: 'II_D_ABAD21',
    categoryLabel: 'II.D. Pembelajaran Abad 21',
    text: 'Guru menerapkan prinsip disiplin positif (reinforcement atau pembentukan perilaku adaptif) dalam menegakkan aturan kelas yang telah disepakati bersama.'
  },

  // II. Kegiatan Inti - E. Memicu/memelihara keterlibatan (32-39)
  {
    id: 32,
    category: 'II_E_KETERLIBATAN',
    categoryLabel: 'II.E. Keterlibatan Siswa & Diferensiasi',
    text: 'Melaksanakan pembelajaran yang berpusat pada siswa'
  },
  {
    id: 33,
    category: 'II_E_KETERLIBATAN',
    categoryLabel: 'II.E. Keterlibatan Siswa & Diferensiasi',
    text: 'Guru memberikan perhatian dan bantuan ekstra kepada peserta didik sesuai dengan kebutuhan belajarnya'
  },
  {
    id: 34,
    category: 'II_E_KETERLIBATAN',
    categoryLabel: 'II.E. Keterlibatan Siswa & Diferensiasi',
    text: 'Guru senantiasa memberikan umpan balik langsung yang mendorong kemampuan peserta didik untuk terus belajar dan meningkatkan kemampuannya'
  },
  {
    id: 35,
    category: 'II_E_KETERLIBATAN',
    categoryLabel: 'II.E. Keterlibatan Siswa & Diferensiasi',
    text: 'Guru memberikan respon positif terhadap partisipasi peserta didik'
  },
  {
    id: 36,
    category: 'II_E_KETERLIBATAN',
    categoryLabel: 'II.E. Keterlibatan Siswa & Diferensiasi',
    text: 'Guru melaksanakan praktik adaptasi pengajaran sebagai respon atas umpan balik dan respon murid terhadap kebutuhan belajarnya. Guru dapat memberikan konten materi yang sama namun tingkat kesulitan yang berbeda dalam capaian pembelajaran yang sama di beberapa kelompok (Diferensiasi Konten)'
  },
  {
    id: 37,
    category: 'II_E_KETERLIBATAN',
    categoryLabel: 'II.E. Keterlibatan Siswa & Diferensiasi',
    text: 'Guru memberi penjelasan dalam kelompok yang berbeda dengan proses diferensiasi yang terstruktur tentang materi pelajaran, serta pemberian contoh tentang cara menerapkannya. (Diferensiasi Proses)'
  },
  {
    id: 38,
    category: 'II_E_KETERLIBATAN',
    categoryLabel: 'II.E. Keterlibatan Siswa & Diferensiasi',
    text: 'Guru melaksanakan Penilaian Produk melalui Projek/ Hasil Produk siswa yang berbeda dalam mencapaian kompetensi pembelajaran yang sama . (Diferensiasi Produk)'
  },
  {
    id: 39,
    category: 'II_E_KETERLIBATAN',
    categoryLabel: 'II.E. Keterlibatan Siswa & Diferensiasi',
    text: 'Menumbuhkan keceriaan dan antusiasme peserta didik dalam pembelajaran'
  },

  // II. Kegiatan Inti - F. Penggunaan Bahasa (40-42)
  {
    id: 40,
    category: 'II_F_BAHASA',
    categoryLabel: 'II.F. Penggunaan Bahasa',
    text: 'Menggunakan bahasa Indonesia yang baik, benar, dan kontekstual'
  },
  {
    id: 41,
    category: 'II_F_BAHASA',
    categoryLabel: 'II.F. Penggunaan Bahasa',
    text: 'Menggunakan pilihan kata yang mudah dipahami oleh peserta didik'
  },
  {
    id: 42,
    category: 'II_F_BAHASA',
    categoryLabel: 'II.F. Penggunaan Bahasa',
    text: 'Menyampaikan pesan dan gaya yang sesuai'
  },

  // III. Kegiatan Penutup (43-48)
  {
    id: 43,
    category: 'III_PENUTUP',
    categoryLabel: 'III. Kegiatan Penutup',
    text: 'Membuat rangkuman dan/atau kesimpulan dengan melibatkan peserta didik'
  },
  {
    id: 44,
    category: 'III_PENUTUP',
    categoryLabel: 'III. Kegiatan Penutup',
    text: 'Melakukan refleksi pembelajaran (kebermaknaan pembelajaran) untuk memahami kekuatan diri dan area yang perlu dikembangkan.'
  },
  {
    id: 45,
    category: 'III_PENUTUP',
    categoryLabel: 'III. Kegiatan Penutup',
    text: 'Melaksanakan Asesmen sumatif / penilaian pembelajaran di akhir pembelajaran berdasarkan tujuan pembelajaran (bila pembelajaran diakhir pertemuan).'
  },
  {
    id: 46,
    category: 'III_PENUTUP',
    categoryLabel: 'III. Kegiatan Penutup',
    text: 'Melaksanakan tindak lanjut dengan memberikan arahan kegiatan lanjutan atau tugas'
  },
  {
    id: 47,
    category: 'III_PENUTUP',
    categoryLabel: 'III. Kegiatan Penutup',
    text: 'Menyampaikan rencana pembelajaran berikutnya'
  },
  {
    id: 48,
    category: 'III_PENUTUP',
    categoryLabel: 'III. Kegiatan Penutup',
    text: 'Menutup Pembelajaran'
  }
];

export interface Category {
  id: string;
  label: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'I_PENDAHULUAN', label: 'I. Kegiatan Pendahuluan' },
  { id: 'II_A_MATERI', label: 'II.A. Penguasaan Materi' },
  { id: 'II_B_STRATEGI', label: 'II.B. Strategi Pembelajaran' },
  { id: 'II_C_MEDIA', label: 'II.C. Pemanfaatan Sumber Belajar/Media' },
  { id: 'II_D_ABAD21', label: 'II.D. Pembelajaran Abad 21' },
  { id: 'II_E_KETERLIBATAN', label: 'II.E. Keterlibatan Siswa & Diferensiasi' },
  { id: 'II_F_BAHASA', label: 'II.F. Penggunaan Bahasa' },
  { id: 'III_PENUTUP', label: 'III. Kegiatan Penutup' },
];

export const getCategories = (): Category[] => {
  const saved = localStorage.getItem('sipro_categories');
  if (saved) return JSON.parse(saved);
  return DEFAULT_CATEGORIES;
};

export const saveCategories = (categories: Category[]) => {
  localStorage.setItem('sipro_categories', JSON.stringify(categories));
};

export const getInstrumentItems = (): InstrumentItem[] => {
  const saved = localStorage.getItem('sipro_instruments');
  return saved ? JSON.parse(saved) : DEFAULT_INSTRUMENT_ITEMS;
};

export const saveInstrumentItems = (items: InstrumentItem[]) => {
  localStorage.setItem('sipro_instruments', JSON.stringify(items));
};

export const DUMMY_ADMIN: User = {
  id: 'admin',
  username: 'admin',
  name: 'System Administrator',
  role: 'admin',
  schoolName: 'SMP Negeri 1 Telaga'
};

export const DUMMY_SUPERVISOR: User = {
  id: 'pengawas',
  username: 'pengawas',
  name: 'Imran Tululi, S.Pd, M.Pd',
  role: 'pengawas',
  nip: '197101241992021001',
  schoolName: 'SMP Negeri 1 Telaga'
};

export const DUMMY_HEADMASTER: User = {
  id: '196805141994032002',
  username: '196805141994032002',
  name: 'Dra. Hj. Rosmin Katili, M.Pd',
  role: 'kepsek',
  nip: '196805141994032002',
  schoolName: 'SMP Negeri 1 Telaga'
};

export const DUMMY_TEACHERS: User[] = [
  {
    id: '198808122015032001',
    username: '198808122015032001',
    name: 'Endah Agustinawati, S.Pd',
    role: 'guru',
    nip: '198808122015032001',
    schoolName: 'SMP Negeri 1 Telaga',
    className: 'VIII-A',
    subject: 'Bahasa Inggris',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    driveUrl: 'https://docs.google.com/document/d/1x2y3z/edit',
    supervisionSchedule: 'Rabu, 15 Juli 2026 / 08:30 - 10:00',
    moduleIdentity: {
      topic: 'Narrative Text: Fables',
      timeAllocation: '2 x 40 Menit',
      targetPhase: 'Fase A'
    }
  },
  {
    id: '199002152019031002',
    username: '199002152019031002',
    name: 'Ahmad Subagio, S.Pd',
    role: 'guru',
    nip: '199002152019031002',
    schoolName: 'SMP Negeri 1 Telaga',
    className: 'IX-C',
    subject: 'Matematika',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    driveUrl: 'https://docs.google.com/document/d/4a5b6c/edit',
    supervisionSchedule: 'Jumat, 17 Juli 2026 / 10:15 - 11:45',
    moduleIdentity: {
      topic: 'Persamaan Kuadrat',
      timeAllocation: '2 x 40 Menit',
      targetPhase: 'Fase A'
    }
  },
  {
    id: '198504012010012005',
    username: '198504012010012005',
    name: 'Siti Rahma, M.Pd',
    role: 'guru',
    nip: '198504012010012005',
    schoolName: 'SMP Negeri 1 Telaga',
    className: 'VII-B',
    subject: 'IPA Terpadu',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    driveUrl: 'https://docs.google.com/document/d/7p8q9r/edit',
    supervisionSchedule: 'Senin, 20 Juli 2026 / 07:30 - 09:00',
    moduleIdentity: {
      topic: 'Sistem Organisasi Kehidupan',
      timeAllocation: '2 x 40 Menit',
      targetPhase: 'Fase A'
    }
  },
  {
    id: '199211052020121003',
    username: '199211052020121003',
    name: 'Rian Hidayat, S.Kom',
    role: 'guru',
    nip: '199211052020121003',
    schoolName: 'SMP Negeri 1 Telaga',
    className: 'IX-A',
    subject: 'Informatika',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    driveUrl: 'https://docs.google.com/document/d/9x0y1z/edit',
    supervisionSchedule: 'Kamis, 23 Juli 2026 / 13:00 - 14:30',
    moduleIdentity: {
      topic: 'Berpikir Komputasional',
      timeAllocation: '2 x 40 Menit',
      targetPhase: 'Fase A'
    }
  }
];

// Helper to generate some high/mid scores for a dummy supervision log
function generateScores(baseScore: number, noiseRange: number): Record<number, number> {
  const scores: Record<number, number> = {};
  for (let i = 1; i <= 48; i++) {
    const offset = Math.floor(Math.random() * (noiseRange * 2 + 1)) - noiseRange;
    let score = baseScore + offset;
    if (score > 4) score = 4;
    if (score < 1) score = 1;
    scores[i] = score;
  }
  return scores;
}

export const initialSupervisions: Supervision[] = [
  {
    id: 'sup-001',
    teacherId: '198808122015032001',
    teacherName: 'Endah Agustinawati, S.Pd',
    schoolName: 'SMP Negeri 1 Telaga',
    className: 'VIII-A',
    phaseSemester: 'Fase A / Ganjil',
    subject: 'Bahasa Inggris',
    date: '2026-06-10',
    scores: {
      ...generateScores(4, 1),
      1: 4, 2: 4, 3: 3, 4: 4, 5: 4, 6: 4, 7: 3, 8: 4, // Pendahuluan
      9: 4, 10: 4, 11: 3, 12: 4, 13: 4, // Inti - Materi
      24: 4, 25: 4, // Inti - Media
      40: 4, 41: 4, 42: 4, // Inti - Bahasa
    },
    notes: {
      3: 'Pertanyaan pemantik berjalan sangat baik, namun ada 2 murid yang pasif.',
      11: 'Guru aktif menggali gagasan kritis murid.',
      24: 'Slide interaktif berbasis Canva sangat memukau dan meningkatkan fokus.',
    },
    totalScore: 172, // sum
    finalScore: Math.round((172 / 192) * 100 * 10) / 10, // 89.6%
    predicate: 'Sangat Baik',
    generalFeedback: 'Secara keseluruhan proses pembelajaran sangat dinamis dan berpusat pada siswa. Integrasi KSE di awal pembelajaran memberikan kesiapan mental yang luar biasa bagi peserta didik.',
    followUp: 'Melanjutkan diferensiasi produk dengan menyediakan lebih banyak opsi presentasi bagi peserta didik.',
    supervisorName: 'Imran Tululi, S.Pd, M.Pd',
    supervisorNip: '197101241992021001',
    headmasterName: 'Dra. Hj. Rosmin Katili, M.Pd',
    headmasterNip: '196805141994032002',
    status: 'Submitted',
    createdAt: '2026-06-10T10:00:00Z',
    updatedAt: '2026-06-10T11:30:00Z'
  },
  {
    id: 'sup-002',
    teacherId: '199002152019031002',
    teacherName: 'Ahmad Subagio, S.Pd',
    schoolName: 'SMP Negeri 1 Telaga',
    className: 'IX-C',
    phaseSemester: 'Fase A / Genap',
    subject: 'Matematika',
    date: '2026-06-15',
    scores: {
      ...generateScores(3, 1),
      1: 3, 2: 3, 3: 2, 4: 3, 5: 3, 6: 2, 7: 3, 8: 3,
      14: 3, 15: 3, 16: 2, 17: 2, 18: 3, 19: 3, 20: 3, 21: 4, 22: 3, 23: 3,
    },
    notes: {
      3: 'Asesmen awal masih terlalu umum, perlu lebih personal.',
      16: 'Pertanyaan pasif didominasi oleh barisan depan.',
    },
    totalScore: 142,
    finalScore: Math.round((142 / 192) * 100 * 10) / 10, // 74.0%
    predicate: 'Baik',
    generalFeedback: 'Guru menguasai konsep matematika dengan matang dan tertata. Penanaman numerasi berjalan efektif melalui latihan soal kontekstual.',
    followUp: 'Meningkatkan pelibatan aktif siswa di barisan belakang melalui kerja kelompok heterogen.',
    supervisorName: 'Imran Tululi, S.Pd, M.Pd',
    supervisorNip: '197101241992021001',
    headmasterName: 'Dra. Hj. Rosmin Katili, M.Pd',
    headmasterNip: '196805141994032002',
    status: 'Submitted',
    createdAt: '2026-06-15T09:00:00Z',
    updatedAt: '2026-06-15T10:15:00Z'
  },
  {
    id: 'sup-003',
    teacherId: '198504012010012005',
    teacherName: 'Siti Rahma, M.Pd',
    schoolName: 'SMP Negeri 1 Telaga',
    className: 'VII-B',
    phaseSemester: 'Fase A / Ganjil',
    subject: 'IPA Terpadu',
    date: '2026-07-02',
    scores: generateScores(3, 0), // Flat 3, sum 144
    notes: {},
    totalScore: 144,
    finalScore: Math.round((144 / 192) * 100 * 10) / 10, // 75.0%
    predicate: 'Baik',
    generalFeedback: 'Metode eksperimen berjalan tertib. Media nyata yang dibawa membantu pemahaman konkret tentang materi pencemaran lingkungan.',
    followUp: 'Lebih mengoptimalkan pemanfaatan IT sebagai media pelaporan hasil praktikum siswa.',
    supervisorName: 'Imran Tululi, S.Pd, M.Pd',
    supervisorNip: '197101241992021001',
    headmasterName: 'Dra. Hj. Rosmin Katili, M.Pd',
    headmasterNip: '196805141994032002',
    status: 'Submitted',
    createdAt: '2026-07-02T08:15:00Z',
    updatedAt: '2026-07-02T10:00:00Z'
  }
];
