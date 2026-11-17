import { jsPDF } from 'jspdf';
import { CampAppState } from '../types/camp';

async function dataUrlToPngDataUrl(srcDataUrl: string, width = 640, height = 400): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, width, height);
          // Object-cover math
          const scale = Math.max(width / img.width, height / img.height);
          const sw = img.width * scale;
          const sh = img.height * scale;
          const dx = (width - sw) / 2;
          const dy = (height - sh) / 2;
          ctx.drawImage(img, dx, dy, sw, sh);
          resolve(canvas.toDataURL('image/jpeg', 0.88));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = srcDataUrl;
    } catch {
      resolve(null);
    }
  });
}

export async function exportKeputusanPDF(state: CampAppState): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  const opr = state.oprData;

  // Header Banner
  doc.setFillColor(6, 44, 43);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setTextColor(253, 230, 138);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('SEKOLAH KEBANGSAAN LUPAK', pageWidth / 2, 7.5, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.text('LAPORAN KEPUTUSAN & PEMARKAHAN RASMI', pageWidth / 2, 14.5, { align: 'center' });

  doc.setTextColor(167, 243, 208);
  doc.setFontSize(8.5);
  doc.text('PROGRAM PERKHEMAHAN KOKURIKULUM SK LUPAK 2026 (24 - 26 NOVEMBER 2026)', pageWidth / 2, 20.5, {
    align: 'center',
  });

  let y = 30;

  // SECTION 1: KEPUTUSAN EXPLORACE (8 STESEN x 8 KUMPULAN)
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('1. KEPUTUSAN PEMARKAHAN AKTIVITI EXPLORACE (8 STESEN)', margin, y);
  y += 3;

  // Calculate rankings
  const groupRows = state.groups.map((grp) => {
    const stScores = state.stations.map((st) => state.exploraceScores[grp.id]?.[st.id] ?? 0);
    const totalExp = stScores.reduce((a, b) => a + b, 0);
    const ikh = state.ikhtiarScores[grp.id] || { kerjasama: 0, penyediaan: 0, rasa: 0 };
    const totalIkh = ikh.kerjasama + ikh.penyediaan + ikh.rasa;
    return {
      group: grp,
      stScores,
      totalExp,
      ikh,
      totalIkh,
      grandTotal: totalExp + totalIkh,
    };
  });

  const sortedByExp = [...groupRows].sort((a, b) => b.totalExp - a.totalExp);

  // Table header for Explorace
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.2);
  doc.text('KED', margin + 2, y + 4.2);
  doc.text('KUMPULAN', margin + 13, y + 4.2);

  const stCount = Math.min(state.stations.length, 8);
  const stColWidth = 14;
  const stStartX = margin + 56;
  for (let i = 0; i < stCount; i++) {
    const st = state.stations[i];
    doc.text(`S${i + 1}(${st.maxMarks})`, stStartX + i * stColWidth, y + 4.2, { align: 'center' });
  }
  doc.text('JUMLAH', pageWidth - margin - 3, y + 4.2, { align: 'right' });
  y += 6;

  const expRowH = 5.0;
  sortedByExp.forEach((row, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, expRowH, 'F');
    }
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.2);
    doc.setFont('helvetica', idx === 0 ? 'bold' : 'normal');
    doc.text(`#${idx + 1}`, margin + 2.5, y + 3.6);
    doc.text(row.group.name, margin + 13, y + 3.6);
    for (let i = 0; i < stCount; i++) {
      doc.text(String(row.stScores[i] ?? 0), stStartX + i * stColWidth, y + 3.6, { align: 'center' });
    }
    doc.setFont('helvetica', 'bold');
    doc.text(`${row.totalExp}`, pageWidth - margin - 5, y + 3.6, { align: 'right' });
    y += expRowH;
  });

  y += 4.5;

  // SECTION 2: BORANG PEMARKAHAN IKHTIAR HIDUP (MASAKAN RIMBA)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. KEPUTUSAN PEMARKAHAN IKHTIAR HIDUP & KESELURUHAN KUMPULAN', margin, y);
  y += 3;

  const sortedByIkh = [...groupRows].sort((a, b) => b.totalIkh - a.totalIkh);

  doc.setFillColor(6, 78, 59);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text('KED', margin + 2, y + 4.2);
  doc.text('KUMPULAN', margin + 13, y + 4.2);
  doc.text('KERJASAMA (30%)', 68, y + 4.2, { align: 'center' });
  doc.text('PENYEDIAAN (30%)', 99, y + 4.2, { align: 'center' });
  doc.text('RASA MASAKAN (40%)', 132, y + 4.2, { align: 'center' });
  doc.text('IKHTIAR (100%)', 162, y + 4.2, { align: 'center' });
  doc.text('KESELURUHAN', pageWidth - margin - 2, y + 4.2, { align: 'right' });
  y += 6;

  const ikhRowH = 5.0;
  sortedByIkh.forEach((row, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(240, 253, 244);
      doc.rect(margin, y, contentWidth, ikhRowH, 'F');
    }
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.2);
    doc.setFont('helvetica', idx === 0 ? 'bold' : 'normal');
    doc.text(`#${idx + 1}`, margin + 2.5, y + 3.6);
    doc.text(row.group.name, margin + 13, y + 3.6);
    doc.text(`${row.ikh.kerjasama} / 30`, 68, y + 3.6, { align: 'center' });
    doc.text(`${row.ikh.penyediaan} / 30`, 99, y + 3.6, { align: 'center' });
    doc.text(`${row.ikh.rasa} / 40`, 132, y + 3.6, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(`${row.totalIkh}%`, 162, y + 3.6, { align: 'center' });
    doc.text(`${row.grandTotal}`, pageWidth - margin - 5, y + 3.6, { align: 'right' });
    y += ikhRowH;
  });

  y += 4.5;

  // SECTION 3: PERTANDINGAN KAWAD KAKI ASAS (UNIT BERUNIFORM)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. KEPUTUSAN PERTANDINGAN KAWAD KAKI ASAS (UNIT BERUNIFORM)', margin, y);
  y += 3;

  const kawadRows = state.uniformUnits
    .map((u) => {
      const sc = state.kawadScores[u.id] || { arahan: 0, keseragaman: 0, nadaSuara: 0 };
      const total = sc.arahan + sc.keseragaman + sc.nadaSuara;
      return { unit: u, sc, total };
    })
    .sort((a, b) => b.total - a.total);

  doc.setFillColor(30, 58, 138);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text('KEDUDUKAN', margin + 2, y + 4.2);
  doc.text('UNIT BERUNIFORM', margin + 26, y + 4.2);
  doc.text('ARAHAN (40%)', 98, y + 4.2, { align: 'center' });
  doc.text('KESERAGAMAN (30%)', 130, y + 4.2, { align: 'center' });
  doc.text('NADA SUARA (30%)', 162, y + 4.2, { align: 'center' });
  doc.text('JUMLAH', pageWidth - margin - 2, y + 4.2, { align: 'right' });
  y += 6;

  const rankLabels = ['JOHAN', 'NAIB JOHAN', 'TEMPAT KE-3'];
  const kawadRowH = 5.2;
  kawadRows.forEach((row, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(239, 246, 255);
      doc.rect(margin, y, contentWidth, kawadRowH, 'F');
    }
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.2);
    doc.setFont('helvetica', 'bold');
    doc.text(rankLabels[idx] || `#${idx + 1}`, margin + 2, y + 3.7);
    doc.text(row.unit.name, margin + 26, y + 3.7);
    doc.setFont('helvetica', 'normal');
    doc.text(`${row.sc.arahan} / 40`, 98, y + 3.7, { align: 'center' });
    doc.text(`${row.sc.keseragaman} / 30`, 130, y + 3.7, { align: 'center' });
    doc.text(`${row.sc.nadaSuara} / 30`, 162, y + 3.7, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(`${row.total}%`, pageWidth - margin - 4, y + 3.7, { align: 'right' });
    y += kawadRowH;
  });

  y += 4.5;

  // SECTION 4: SENARAI PENERIMA ANUGERAH RASMI
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4. SENARAI RASMI PENERIMA ANUGERAH PERKHEMAHAN 2026', margin, y);
  y += 3;

  const drawAwardsHeader = (topY: number) => {
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, topY, contentWidth, 5.8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('BIL', margin + 2, topY + 4);
    doc.text('KATEGORI ANUGERAH', margin + 10, topY + 4);
    doc.text('PEMENANG / PENERIMA', margin + 68, topY + 4);
    doc.text('CATATAN', margin + 124, topY + 4);
    return topY + 5.8;
  };

  y = drawAwardsHeader(y);

  const allAwards = [...state.awards];
  const awardRowH = 4.6;
  allAwards.forEach((aw, idx) => {
    if (y + awardRowH > 282) {
      doc.addPage();
      y = 16;
      y = drawAwardsHeader(y);
    }
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, awardRowH, 'F');
    }
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(6.8);
    doc.setFont('helvetica', 'normal');
    doc.text(String(idx + 1), margin + 2.5, y + 3.3);

    const titleLine = doc.splitTextToSize(aw.title || '', 55)[0] || '';
    doc.text(titleLine, margin + 10, y + 3.3);

    doc.setFont('helvetica', 'bold');
    const winnerText = aw.winner && aw.winner.trim() ? aw.winner : '—';
    const winnerLine = doc.splitTextToSize(winnerText, 53)[0] || '';
    doc.text(winnerLine, margin + 68, y + 3.3);

    doc.setFont('helvetica', 'normal');
    const notesLine = doc.splitTextToSize(aw.notes || '', 60)[0] || '';
    doc.text(notesLine, margin + 124, y + 3.3);
    y += awardRowH;
  });

  // Signatures at bottom (never overlap table rows)
  if (y + 22 > 287) {
    doc.addPage();
    y = 24;
  }

  const sigY = Math.max(y + 11, 270);
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, sigY, margin + 54, sigY);
  doc.line(margin + 67, sigY, margin + 121, sigY);
  doc.line(pageWidth - margin - 54, sigY, pageWidth - margin, sigY);

  doc.setFontSize(7.2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(opr.disediakanOleh || 'PN JUHANI BINTI NORMAN', margin, sigY + 4.2);
  doc.text(opr.disemakOleh || 'EN HARUN BIN HJ SUNTRAK', margin + 67, sigY + 4.2);
  doc.text(opr.disahkanOleh || 'TN HJ SABLI BIN MD JANEH', pageWidth - margin - 54, sigY + 4.2);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(opr.jawatanPenyedia || 'Ketua AJK Penilaian SK Lupak', margin, sigY + 8);
  doc.text(opr.jawatanPenyemak || 'Penolong Kanan Kokurikulum', margin + 67, sigY + 8);
  doc.text(opr.jawatanPengesah || 'Guru Besar SK Lupak', pageWidth - margin - 54, sigY + 8);

  doc.save('Laporan_Keputusan_Perkhemahan_SK_Lupak_2026.pdf');
}

export async function exportOPRPDF(state: CampAppState): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const margin = 11;
  const contentWidth = pageWidth - margin * 2;
  const opr = state.oprData;

  // Top Header OPR Style
  doc.setFillColor(6, 44, 43);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(253, 230, 138);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('SEKOLAH KEBANGSAAN LUPAK', pageWidth / 2, 8.5, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13.5);
  doc.text('ONE PAGE REPORT (OPR) — LAPORAN AKTIVITI SEKOLAH', pageWidth / 2, 16, { align: 'center' });

  doc.setTextColor(167, 243, 208);
  doc.setFontSize(9);
  doc.text(opr.namaProgram.toUpperCase(), pageWidth / 2, 23, { align: 'center' });

  let y = 33;

  // Info Grid Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  const metaRows: [string, string, string, string][] = [
    ['NAMA PROGRAM', opr.namaProgram, 'TARIKH', opr.tarikh],
    ['ANJURAN', opr.anjuran, 'MASA', opr.masa],
    ['TEMPAT', opr.tempat, 'SASARAN', opr.sasaran],
    ['PENYELARAS', 'ALIF AKRAM BIN NOR KASANI', 'KEHADIRAN', opr.kehadiran],
  ];

  let my = y + 6;
  metaRows.forEach(([k1, v1, k2, v2]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${k1}:`, margin + 3, my);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(v1, 70)[0] || '', margin + 27, my);

    doc.setFont('helvetica', 'bold');
    doc.text(`${k2}:`, margin + 102, my);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(v2, 60)[0] || '', margin + 123, my);
    my += 7.5;
  });

  y += 38;

  // OBJEKTIF PROGRAM
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('OBJEKTIF PROGRAM', margin + 3, y + 4.2);
  y += 6;

  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 22);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  let oy = y + 4.8;
  opr.objektif.slice(0, 3).forEach((obj, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${obj}`, contentWidth - 6);
    doc.text(lines.slice(0, 2), margin + 3, oy);
    oy += lines.slice(0, 2).length * 4;
  });
  y += 25;

  // RINGKASAN IMPAK & KEPUTUSAN UTAMA
  doc.setFillColor(6, 78, 59);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('RINGKASAN PELAKSANAAN AKTIVITI & PENCAPAIAN UTAMA', margin + 3, y + 4.2);
  y += 6;

  doc.rect(margin, y, contentWidth, 24);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  const summaryLines = doc.splitTextToSize(opr.ringkasanAktiviti, contentWidth - 6);
  doc.text(summaryLines.slice(0, 3), margin + 3, y + 5);

  const expWinner = state.awards.find((a) => a.autoKey === 'EXPLORACE_TOP')?.winner || 'ALDEBARAN';
  const ikhWinner = state.awards.find((a) => a.autoKey === 'IKHTIAR_TOP')?.winner || 'ALTAIR';
  const kawadWinner = state.awards.find((a) => a.autoKey === 'KAWAD_1')?.winner || 'TUNAS KADET REMAJA SEKOLAH';

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text(
    `Keputusan Utama: Terbaik Explorace: ${expWinner}  |  Terbaik Masakan Rimba: ${ikhWinner}  |  Johan Kawad Kaki: ${kawadWinner}`,
    margin + 3,
    y + 20.5
  );
  y += 27;

  // KEKUATAN & PENAMBAHBAIKAN (2 Columns)
  const halfW = (contentWidth - 3) / 2;
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, y, halfW, 6, 'F');
  doc.rect(margin + halfW + 3, y, halfW, 6, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('KEKUATAN / IMPAK PROGRAM', margin + 3, y + 4.2);
  doc.text('CADANGAN PENAMBAHBAIKAN', margin + halfW + 6, y + 4.2);
  y += 6;

  doc.rect(margin, y, halfW, 18);
  doc.rect(margin + halfW + 3, y, halfW, 18);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(doc.splitTextToSize(opr.kekuatan, halfW - 6).slice(0, 3), margin + 3, y + 4.8);
  doc.text(doc.splitTextToSize(opr.penambahbaikan, halfW - 6).slice(0, 3), margin + halfW + 6, y + 4.8);
  y += 21;

  // LAPORAN BERGAMBAR (2x2 GRID)
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DOKUMENTASI BERGAMBAR AKTIVITI PERKHEMAHAN SK LUPAK 2026', margin + 3, y + 4.2);
  y += 8;

  const imgBoxW = (contentWidth - 4) / 2;
  const imgBoxH = 44;

  for (let i = 0; i < Math.min(4, opr.photos.length); i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = margin + col * (imgBoxW + 4);
    const by = y + row * (imgBoxH + 3);
    const photo = opr.photos[i];

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(bx, by, imgBoxW, imgBoxH, 1.5, 1.5, 'FD');

    const jpegUrl = await dataUrlToPngDataUrl(photo.dataUrl, 640, 340);
    if (jpegUrl) {
      doc.addImage(jpegUrl, 'JPEG', bx + 1.5, by + 1.5, imgBoxW - 3, 33);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(6, 78, 59);
    doc.text(photo.tag, bx + 2.5, by + 38);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(30, 41, 59);
    doc.text(doc.splitTextToSize(photo.caption, imgBoxW - 5)[0] || '', bx + 2.5, by + 42);
  }

  y += imgBoxH * 2 + 12;

  // PENGESAHAN SIGNATURES
  const sigY = Math.max(y + 10, 275);
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, sigY, margin + 54, sigY);
  doc.line(margin + 67, sigY, margin + 121, sigY);
  doc.line(pageWidth - margin - 54, sigY, pageWidth - margin, sigY);

  doc.setFontSize(7.2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Disediakan: ${opr.disediakanOleh}`, margin, sigY + 4.2);
  doc.text(`Disemak: ${opr.disemakOleh}`, margin + 67, sigY + 4.2);
  doc.text(`Disahkan: ${opr.disahkanOleh}`, pageWidth - margin - 54, sigY + 4.2);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(opr.jawatanPenyedia, margin, sigY + 8);
  doc.text(opr.jawatanPenyemak, margin + 67, sigY + 8);
  doc.text(opr.jawatanPengesah, pageWidth - margin - 54, sigY + 8);

  doc.save('OPR_Perkhemahan_Kokurikulum_SK_Lupak_2026.pdf');
}
