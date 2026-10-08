import React, { useState } from 'react';
import { User, AttendanceRecord, LeaveRequest, WorkShift, Department } from '../../types';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertTriangle,
  FileCheck,
  Search,
  Filter,
  Check,
  X,
  UserCheck,
  ShieldCheck,
  Layers,
  MapPin
} from 'lucide-react';

interface HrdViewProps {
  currentUser: User;
  users: User[];
  attendances: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  shifts: WorkShift[];
  departments: Department[];
  onApproveLeave: (leaveId: number) => void;
  onRejectLeave: (leaveId: number, reason: string) => void;
  onUpdateAttendance: (attendanceId: number, updates: Partial<AttendanceRecord>) => void;
}

export const HrdView: React.FC<HrdViewProps> = ({
  currentUser,
  users,
  attendances,
  leaveRequests,
  shifts,
  departments,
  onApproveLeave,
  onRejectLeave,
  onUpdateAttendance,
}) => {
  const [activeTab, setActiveTab] = useState<'MONITORING' | 'APPROVAL' | 'SHIFTS'>('MONITORING');
  const [searchEmployee, setSearchEmployee] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [rejectModalLeaveId, setRejectModalLeaveId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendances = attendances.filter(a => a.workDate === todayStr);

  // Statistics calculation
  const totalEmployees = users.filter(u => u.isActive && u.role === 'KARYAWAN').length;
  const presentCount = todayAttendances.filter(a => a.status === 'PRESENT').length;
  const lateCount = todayAttendances.filter(a => a.status === 'LATE' || a.status === 'VERY_LATE').length;
  const leaveCount = todayAttendances.filter(a => a.status === 'LEAVE' || a.status === 'SICK').length;
  const pendingLeaves = leaveRequests.filter(l => l.status === 'PENDING').length;

  // Filtered employees for monitoring
  const filteredUsers = users.filter((u) => {
    if (u.role !== 'KARYAWAN') return false;
    const matchesSearch = u.name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
                          u.employeeIdNumber.toLowerCase().includes(searchEmployee.toLowerCase());
    const matchesDept = selectedDeptFilter === 'ALL' || u.departmentId === Number(selectedDeptFilter);
    return matchesSearch && matchesDept;
  });

  const handleConfirmReject = () => {
    if (rejectModalLeaveId) {
      onRejectLeave(rejectModalLeaveId, rejectReason || 'Tidak memenuhi kualifikasi kuota cuti.');
      setRejectModalLeaveId(null);
      setRejectReason('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Workspace Operasional Divisi Human Resource & Development</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            Monitoring & Pengelolaan Presensi Karyawan
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Kelola kehadiran harian, verifikasi geofencing GPS, dan proses antrean permohonan cuti/izin/lembur.
          </p>
        </div>

        {/* Sub-Tabs Nav */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-700 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('MONITORING')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'MONITORING'
                ? 'bg-white text-indigo-600 shadow-sm font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Monitoring Hari Ini</span>
          </button>
          <button
            onClick={() => setActiveTab('APPROVAL')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all relative ${
              activeTab === 'APPROVAL'
                ? 'bg-white text-indigo-600 shadow-sm font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Approval Cuti/Izin</span>
            {pendingLeaves > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingLeaves}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('SHIFTS')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'SHIFTS'
                ? 'bg-white text-indigo-600 shadow-sm font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Jadwal Shift</span>
          </button>
        </div>
      </div>

      {/* Daily Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Hadir Tepat Waktu</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{presentCount} Orang</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Presensi sebelum batas shift
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Terlambat Hadir</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{lateCount} Orang</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">
            Tercatat menit keterlambatan
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Izin / Cuti Hari Ini</span>
            <Calendar className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{leaveCount} Orang</div>
          <div className="text-[11px] text-sky-600 font-medium mt-1">
            Telah terverifikasi HRD
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Menunggu Approval</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{pendingLeaves} Pengajuan</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">
            Butuh tindakan HRD
          </div>
        </div>
      </div>

      {/* TAB 1: MONITORING REAL-TIME HARI INI */}
      {activeTab === 'MONITORING' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 bg-slate-50/60 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama karyawan / NIK..."
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-500 text-xs shrink-0">Departemen:</span>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="p-2 rounded-lg border border-slate-300 bg-white focus:outline-none text-xs"
              >
                <option value="ALL">Semua Departemen</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table List of Attendance */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Karyawan</th>
                  <th className="py-3 px-4">Departemen</th>
                  <th className="py-3 px-4">Jam Masuk</th>
                  <th className="py-3 px-4">Jam Pulang</th>
                  <th className="py-3 px-4">Geofence / Jarak</th>
                  <th className="py-3 px-4">Foto Selfie</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi HRD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((emp) => {
                  const empAttendance = todayAttendances.find(a => a.userId === emp.id);
                  const dept = departments.find(d => d.id === emp.departmentId);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={emp.avatarUrl}
                            alt={emp.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{emp.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{emp.employeeIdNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {dept?.name || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {empAttendance?.checkInTime || (
                          <span className="text-slate-400 font-normal">Belum Masuk</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800">
                        {empAttendance?.checkOutTime || (
                          <span className="text-slate-400 font-normal">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {empAttendance?.checkInDistanceMeters !== undefined ? (
                          <span className="font-mono text-slate-700 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            {empAttendance.checkInDistanceMeters}m
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {empAttendance?.checkInPhoto ? (
                          <div className="relative group w-7 h-7">
                            <img
                              src={empAttendance.checkInPhoto}
                              alt="Selfie"
                              className="w-7 h-7 rounded object-cover border border-slate-300 cursor-pointer shadow-2xs"
                            />
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {empAttendance ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            empAttendance.status === 'PRESENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : empAttendance.status === 'LATE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}>
                            {empAttendance.status === 'PRESENT'
                              ? 'TEPAT WAKTU'
                              : empAttendance.status === 'LATE'
                              ? `TERLAMBAT (+${empAttendance.lateMinutes}m)`
                              : empAttendance.status}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                            BELUM HADIR
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {empAttendance && (
                          <button
                            onClick={() => {
                              onUpdateAttendance(empAttendance.id, {
                                isVerified: !empAttendance.isVerified,
                                notes: 'Diverifikasi manual oleh Divisi HRD'
                              });
                            }}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                              empAttendance.isVerified
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {empAttendance.isVerified ? '✓ Terverifikasi' : 'Verifikasi'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: APPROVAL CUTI, IZIN & LEMBUR */}
      {activeTab === 'APPROVAL' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Antrean Permohonan Cuti, Izin & Lembur
              </h3>
              <p className="text-xs text-slate-500">
                Tinjau alasan dan kelayakan sebelum memberikan persetujuan operasional.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
              {leaveRequests.length} Pengajuan Tercatat
            </span>
          </div>

          <div className="space-y-3">
            {leaveRequests.map((req) => {
              const requester = users.find(u => u.id === req.userId);

              return (
                <div
                  key={req.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{requester?.name}</span>
                      <span className="text-slate-400 font-mono">({requester?.employeeIdNumber})</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        {req.type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-slate-600 flex items-center gap-4 text-[11px]">
                      <span>Periode: <strong>{req.startDate} s/d {req.endDate}</strong> ({req.totalDays} hari)</span>
                      <span>Diajukan: {req.submittedAt}</span>
                    </div>

                    <p className="text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200/80">
                      "{req.reason}"
                    </p>

                    {req.attachmentName && (
                      <div className="text-[11px] text-indigo-600 font-medium">
                        📎 Lampiran: {req.attachmentName}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {req.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => onApproveLeave(req.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1 shadow-sm transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Setujui (Approve)</span>
                        </button>
                        <button
                          onClick={() => setRejectModalLeaveId(req.id)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold flex items-center gap-1 shadow-sm transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Tolak (Reject)</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {req.status}
                        </span>
                        {req.reviewedBy && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            Oleh: {req.reviewedBy}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SHIFT JADWAL KERJA */}
      {activeTab === 'SHIFTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Master Jadwal Shift Kerja & Toleransi Keterlambatan
              </h3>
              <p className="text-xs text-slate-500">
                Aturan jam masuk, batas dispensasi toleransi, dan jam pulang untuk kalkulasi otomatis.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shifts.map((s) => (
              <div key={s.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                  {s.isNightShift && (
                    <span className="text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded font-mono">
                      Shift Malam
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 font-mono">
                  <div className="flex justify-between">
                    <span>Jam Masuk:</span>
                    <strong className="text-slate-900">{s.startTime} WIB</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Batas Toleransi:</span>
                    <strong className="text-amber-700">{s.lateThresholdTime} WIB</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Jam Pulang:</span>
                    <strong className="text-slate-900">{s.endTime} WIB</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                  Digunakan oleh divisi operasional & teknis.
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalLeaveId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Konfirmasi Penolakan Permohonan
            </h3>
            <p className="text-xs text-slate-500">
              Mohon berikan alasan penolakan yang jelas agar karyawan mendapatkan transparansi informasi.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Kuota cuti divisi pada tanggal tersebut telah penuh atau jadwal tugas operasional mendesak."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalLeaveId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg"
              >
                Tolak Permohonan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
