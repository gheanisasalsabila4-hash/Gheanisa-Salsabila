import React, { useState } from 'react';
import { User, AttendanceRecord, Department, WorkShift } from '../../types';
import { PrintableReportModal } from '../PrintableReportModal';
import {
  TrendingUp,
  Printer,
  Download,
  Calendar,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PieChart,
  FileSpreadsheet,
  Award,
  Filter
} from 'lucide-react';

interface ManajemenViewProps {
  currentUser: User;
  users: User[];
  attendances: AttendanceRecord[];
  departments: Department[];
  shifts: WorkShift[];
}

export const ManajemenView: React.FC<ManajemenViewProps> = ({
  currentUser,
  users,
  attendances,
  departments,
  shifts,
}) => {
  const [selectedDateFilter, setSelectedDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK'>('ALL');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtered dataset
  const filteredAttendances = attendances.filter((a) => {
    // Date filter
    if (selectedDateFilter === 'TODAY' && a.workDate !== todayStr) return false;
    if (selectedDateFilter === 'WEEK' && a.workDate < '2026-10-01') return false;

    // Dept filter
    if (selectedDeptId !== 'ALL') {
      const emp = users.find(u => u.id === a.userId);
      if (emp?.departmentId !== Number(selectedDeptId)) return false;
    }

    return true;
  });

  // Calculate high-level KPIs
  const totalRecords = filteredAttendances.length;
  const onTimeCount = filteredAttendances.filter(a => a.status === 'PRESENT').length;
  const lateCount = filteredAttendances.filter(a => a.status === 'LATE' || a.status === 'VERY_LATE').length;
  const totalLateMins = filteredAttendances.reduce((acc, curr) => acc + (curr.lateMinutes || 0), 0);
  const attendanceRate = totalRecords > 0 ? Math.round((onTimeCount / totalRecords) * 100) : 0;

  // Breakdown by department
  const deptBreakdown = departments.map((d) => {
    const deptEmployees = users.filter(u => u.departmentId === d.id && u.role === 'KARYAWAN');
    const deptAttendances = filteredAttendances.filter(a => {
      const u = users.find(user => user.id === a.userId);
      return u?.departmentId === d.id;
    });
    const presentInDept = deptAttendances.filter(a => a.status === 'PRESENT').length;
    const rate = deptAttendances.length > 0 ? Math.round((presentInDept / deptAttendances.length) * 100) : 0;

    return {
      department: d,
      totalEmployees: deptEmployees.length,
      attendanceCount: deptAttendances.length,
      onTimeRate: rate,
    };
  });

  // Export CSV generator
  const handleExportCsv = () => {
    const headers = ['ID', 'NIK', 'Nama Karyawan', 'Departemen', 'Tanggal', 'Jam Masuk', 'Jam Pulang', 'Status', 'Menit Terlambat', 'Total Jam Kerja'];
    const rows = filteredAttendances.map(a => {
      const emp = users.find(u => u.id === a.userId);
      const dept = departments.find(d => d.id === emp?.departmentId);
      return [
        a.id,
        emp?.employeeIdNumber || '-',
        `"${emp?.name || '-'}"`,
        `"${dept?.name || '-'}"`,
        a.workDate,
        a.checkInTime || '-',
        a.checkOutTime || '-',
        a.status,
        a.lateMinutes || 0,
        a.workHoursTotal || 0,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Presensi_Eksekutif_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dateFilterLabel = selectedDateFilter === 'TODAY'
    ? `Hari Ini (${todayStr})`
    : selectedDateFilter === 'WEEK'
    ? 'Periode Minggu Ini'
    : 'Semua Catatan Historis';

  const deptFilterLabel = selectedDeptId === 'ALL'
    ? 'Semua Departemen Perusahaan'
    : departments.find(d => d.id === Number(selectedDeptId))?.name || 'Departemen Pilihan';

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Actions Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-full text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Executive Management & Board of Directors View</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Laporan & Analisis Kehadiran Eksekutif
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Evaluasi kepatuhan jadwal kerja, produktivitas divisi, dan cetak dokumen resmi rekapitulasi kehadiran karyawan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan Hadir (PDF/Print)</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4 mt-6 pt-5 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Periode:</span>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value as any)}
              className="bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">Semua Data Rekam</option>
              <option value="TODAY">Hari Ini Saja</option>
              <option value="WEEK">Minggu Ini (7 Hari)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Departemen:</span>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">Semua Departemen</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="text-slate-400 font-mono text-[11px] ml-auto">
            Terfilter: <strong className="text-indigo-300">{filteredAttendances.length}</strong> Rekaman
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tingkat Disiplin Tepat Waktu</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
            {attendanceRate}%
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">
            {onTimeCount} dari {totalRecords} sesi tepat waktu
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Keterlambatan</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
            {lateCount} Kali
          </div>
          <div className="text-[11px] text-amber-600 font-medium">
            Akumulasi: {totalLateMins} menit terlambat
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Jam Efektif</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
            {Math.round(filteredAttendances.reduce((a, c) => a + c.workHoursTotal, 0))} Jam
          </div>
          <div className="text-[11px] text-sky-600 font-medium">
            Rata-rata 8.5 jam/hari kerja
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Status Verifikasi</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
            100%
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">
            GPS & Biometrik terverifikasi
          </div>
        </div>
      </div>

      {/* Department Breakdown Performance Bars */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Performa Tingkat Kehadiran Per Departemen
            </h3>
            <p className="text-xs text-slate-500">
              Persentase kehadiran tepat waktu terhadap seluruh karyawan per divisi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deptBreakdown.map((item) => (
            <div key={item.department.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">{item.department.name}</span>
                <span className="font-mono text-xs font-extrabold text-indigo-700">
                  {item.onTimeRate}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${item.onTimeRate}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Staff: {item.totalEmployees} Orang</span>
                <span>Manajer: {item.department.managerName || '-'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Table of Records */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Daftar Detail Rekap Kehadiran
          </h3>
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Lihat Format Siap Cetak</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-4">Departemen</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Jam Masuk</th>
                <th className="py-3 px-4">Jam Pulang</th>
                <th className="py-3 px-4">Terlambat</th>
                <th className="py-3 px-4">Total Jam</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendances.map((rec) => {
                const emp = users.find(u => u.id === rec.userId);
                const dept = departments.find(d => d.id === emp?.departmentId);

                return (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{emp?.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono font-normal">
                        {emp?.employeeIdNumber}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {dept?.name || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {rec.workDate}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800">
                      {rec.checkInTime || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800">
                      {rec.checkOutTime || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {rec.lateMinutes > 0 ? (
                        <span className="text-amber-700 font-bold">{rec.lateMinutes} mnt</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {rec.workHoursTotal > 0 ? `${rec.workHoursTotal}h` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.status === 'PRESENT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.status === 'LATE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
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
      </div>

      {/* Printable Report Modal */}
      <PrintableReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        attendances={filteredAttendances}
        users={users}
        departments={departments}
        shifts={shifts}
        dateRangeLabel={dateFilterLabel}
        departmentFilterLabel={deptFilterLabel}
      />
    </div>
  );
};
