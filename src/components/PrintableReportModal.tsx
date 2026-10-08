import React from 'react';
import { User, AttendanceRecord, Department, WorkShift } from '../types';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';

interface PrintableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendances: AttendanceRecord[];
  users: User[];
  departments: Department[];
  shifts: WorkShift[];
  dateRangeLabel: string;
  departmentFilterLabel: string;
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({
  isOpen,
  onClose,
  attendances,
  users,
  departments,
  shifts,
  dateRangeLabel,
  departmentFilterLabel,
}) => {
  if (!isOpen) return null;

  const handleTriggerPrint = () => {
    window.print();
  };

  // Aggregated totals
  const totalEntries = attendances.length;
  const onTimeCount = attendances.filter(a => a.status === 'PRESENT').length;
  const lateCount = attendances.filter(a => a.status === 'LATE' || a.status === 'VERY_LATE').length;
  const leaveCount = attendances.filter(a => a.status === 'LEAVE' || a.status === 'SICK').length;
  const totalLateMinutes = attendances.reduce((acc, curr) => acc + (curr.lateMinutes || 0), 0);
  const totalWorkHours = attendances.reduce((acc, curr) => acc + (curr.workHoursTotal || 0), 0);
  const attendanceRate = totalEntries > 0 ? Math.round(((onTimeCount + lateCount) / totalEntries) * 100) : 0;

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-6 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Controls (Not printed) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold">Pratinjau Cetak Laporan Kehadiran Resmi</h3>
              <p className="text-[11px] text-slate-400">
                Format standar dokumen perusahaan siap cetak atau ekspor ke PDF.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerPrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen Sekarang (Print / PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper Area */}
        <div className="p-8 sm:p-12 overflow-y-auto font-sans bg-white text-slate-900 flex-1 print:p-0 print:m-0" id="printable-area">
          {/* Header Kop Surat Perusahaan */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-wider uppercase text-slate-900">
                PT NUSANTARA DIGITAL KREASI
              </h1>
              <p className="text-xs text-slate-600">
                Menara Sudirman Lantai 18, Jl. Jend. Sudirman Kav. 21, Jakarta Selatan 12930
              </p>
              <p className="text-xs text-slate-500">
                Telp: (021) 555-8900 • Email: info@perusahaan.co.id • Web: www.perusahaan.co.id
              </p>
            </div>
            <div className="text-center sm:text-right shrink-0">
              <span className="text-[10px] font-mono bg-slate-100 border border-slate-300 px-2 py-1 rounded block">
                DOC-ID: NDK/HRD/ATT/{new Date().getFullYear()}/{Math.floor(1000 + Math.random() * 9000)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Dicetak: {currentDateFormatted}
              </span>
            </div>
          </div>

          {/* Title of Document */}
          <div className="text-center my-6 space-y-1">
            <h2 className="text-lg font-extrabold uppercase tracking-wide text-slate-900 underline decoration-indigo-600 decoration-2 underline-offset-4">
              LAPORAN REKAPITULASI KEHADIRAN KARYAWAN
            </h2>
            <div className="text-xs text-slate-600 flex items-center justify-center gap-4 pt-1">
              <span>Periode: <strong>{dateRangeLabel}</strong></span>
              <span>•</span>
              <span>Departemen: <strong>{departmentFilterLabel}</strong></span>
            </div>
          </div>

          {/* Executive Metrics Summary Box */}
          <div className="grid grid-cols-4 gap-3 my-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Total Presensi</span>
              <strong className="text-base text-slate-900 font-bold">{totalEntries} Sesi</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Tepat Waktu</span>
              <strong className="text-base text-emerald-700 font-bold">{onTimeCount} Hari</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Keterlambatan</span>
              <strong className="text-base text-amber-700 font-bold">{lateCount} Kali ({totalLateMinutes} mnt)</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Tingkat Kehadiran</span>
              <strong className="text-base text-indigo-700 font-bold">{attendanceRate}%</strong>
            </div>
          </div>

          {/* Detail Attendance Table */}
          <div className="my-6 overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300 text-center w-10">No</th>
                  <th className="p-2 border-r border-slate-300">NIK</th>
                  <th className="p-2 border-r border-slate-300">Nama Karyawan</th>
                  <th className="p-2 border-r border-slate-300">Departemen</th>
                  <th className="p-2 border-r border-slate-300">Tanggal</th>
                  <th className="p-2 border-r border-slate-300 text-center">Masuk</th>
                  <th className="p-2 border-r border-slate-300 text-center">Pulang</th>
                  <th className="p-2 border-r border-slate-300 text-center">Terlambat</th>
                  <th className="p-2 border-r border-slate-300 text-center">Total Jam</th>
                  <th className="p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {attendances.map((rec, idx) => {
                  const emp = users.find(u => u.id === rec.userId);
                  const dept = departments.find(d => d.id === emp?.departmentId);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-200 text-center text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="p-2 border-r border-slate-200 font-mono text-slate-700">
                        {emp?.employeeIdNumber || '-'}
                      </td>
                      <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                        {emp?.name || 'Karyawan'}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-slate-600">
                        {dept?.name || '-'}
                      </td>
                      <td className="p-2 border-r border-slate-200 font-mono text-slate-700">
                        {rec.workDate}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-800">
                        {rec.checkInTime || '-'}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-800">
                        {rec.checkOutTime || '-'}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-700">
                        {rec.lateMinutes > 0 ? `${rec.lateMinutes} mnt` : '-'}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-800">
                        {rec.workHoursTotal > 0 ? `${rec.workHoursTotal}h` : '-'}
                      </td>
                      <td className="p-2 text-center font-semibold">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          rec.status === 'PRESENT'
                            ? 'text-emerald-800 bg-emerald-50'
                            : rec.status === 'LATE'
                            ? 'text-amber-800 bg-amber-50'
                            : 'text-sky-800 bg-sky-50'
                        }`}>
                          {rec.status === 'PRESENT' ? 'TEPAT WAKTU' : rec.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Official Signatures Section */}
          <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-xs text-center border-t border-slate-200">
            <div className="space-y-16">
              <div>
                <p className="text-slate-500">Disusun & Diperiksa Oleh:</p>
                <p className="font-bold text-slate-800 mt-0.5">Divisi Human Resource (HRD)</p>
              </div>
              <div className="border-t border-slate-400 w-48 mx-auto pt-1 font-bold text-slate-900">
                Siti Rahmawati, S.Psi
                <span className="block text-[10px] font-normal text-slate-500">HR & GA Specialist</span>
              </div>
            </div>

            <div className="space-y-16">
              <div>
                <p className="text-slate-500">Mengetahui & Menyetujui:</p>
                <p className="font-bold text-slate-800 mt-0.5">Manajemen / Direksi Operasional</p>
              </div>
              <div className="border-t border-slate-400 w-48 mx-auto pt-1 font-bold text-slate-900">
                Ir. Hendra Gunawan, MM
                <span className="block text-[10px] font-normal text-slate-500">Direktur Operasional</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            Dokumen ini dicetak secara otomatis dari PresensiHub Sistem Informasi Absensi Terintegrasi. Sah tanpa tanda cap fisik bila diverifikasi secara digital.
          </div>
        </div>
      </div>
    </div>
  );
};
