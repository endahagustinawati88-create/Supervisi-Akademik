import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Supervision, User } from '../types';
import { getInstrumentItems, getCategories } from '../data';

export const generateSupervisionPDF = (sup: Supervision) => {
  const doc = new jsPDF();
  const allInstruments = getInstrumentItems();
  const allCategories = getCategories();

  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text('Laporan Hasil Supervisi Pembelajaran', 14, 20);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Guru: ${sup.teacherName}`, 14, 30);
  doc.text(`Tanggal: ${sup.date}`, 14, 36);
  doc.text(`Mata Pelajaran: ${sup.subject} (${sup.className})`, 14, 42);
  doc.text(`Fase/Semester: ${sup.phaseSemester}`, 14, 48);

  doc.text(`Total Skor: ${sup.totalScore}`, 120, 30);
  doc.text(`Nilai Akhir: ${sup.finalScore}%`, 120, 36);
  doc.text(`Predikat: ${sup.predicate}`, 120, 42);

  // General Feedback
  doc.setFont("helvetica", "bold");
  doc.text('Umpan Balik & Tindak Lanjut', 14, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  const feedbackSplit = doc.splitTextToSize(`Feedback: ${sup.generalFeedback || '-'}`, 180);
  doc.text(feedbackSplit, 14, 68);
  
  let currentY = 68 + (feedbackSplit.length * 5);
  
  const followupSplit = doc.splitTextToSize(`Tindak Lanjut: ${sup.followUp || '-'}`, 180);
  doc.text(followupSplit, 14, currentY + 2);

  currentY += (followupSplit.length * 5) + 10;

  // Table Data
  const tableData: any[] = [];

  allCategories.forEach(cat => {
    const items = allInstruments.filter(i => i.category === cat.id);
    if (items.length > 0) {
      tableData.push([{ content: cat.label, colSpan: 4, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);
      items.forEach((item, index) => {
        const score = sup.scores[item.id] !== undefined ? sup.scores[item.id] : '-';
        const note = sup.notes[item.id] || '-';
        tableData.push([
          index + 1,
          item.text,
          score,
          note
        ]);
      });
    }
  });

  autoTable(doc, {
    startY: currentY,
    head: [['No', 'Indikator', 'Skor', 'Catatan']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] }, // indigo-600
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 90 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 65 }
    },
    didParseCell: function(data) {
        if (data.row.raw[0] && data.row.raw[0].content) {
            // It's a category header, no specific formatting needed since styles are in data
        }
    }
  });

  // Footer / Signatures
  const finalY = (doc as any).lastAutoTable.finalY || currentY;
  
  if (finalY + 40 > doc.internal.pageSize.getHeight()) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY = finalY + 20;
  }

  doc.setFontSize(10);
  doc.text('Mengetahui,', 14, currentY);
  doc.text('Kepala Sekolah', 14, currentY + 5);
  doc.text('Supervisor', 120, currentY + 5);

  doc.setFont("helvetica", "bold");
  doc.text(sup.headmasterName || '_______________________', 14, currentY + 30);
  doc.text(sup.supervisorName || '_______________________', 120, currentY + 30);

  doc.setFont("helvetica", "normal");
  doc.text(`NIP. ${sup.headmasterNip || '_________________'}`, 14, currentY + 35);
  doc.text(`NIP. ${sup.supervisorNip || '_________________'}`, 120, currentY + 35);

  doc.save(`Laporan_Supervisi_${sup.teacherName.replace(/\s+/g, '_')}_${sup.date}.pdf`);
};
