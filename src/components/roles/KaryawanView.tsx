import React, { useState, useEffect, useRef } from 'react';
import { User, AttendanceRecord, OfficeLocation, WorkShift, LeaveRequest } from '../../types';
import {
  Clock,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Send,
  History,
  Shield,
  FileCheck,
  Smartphone,
  Sparkles,
  RefreshCw,
  LogOut,
  LogIn
} from 'lucide-react';

interface KaryawanViewProps {
  currentUser: User;
  attendances: AttendanceRecord[];
  locations: OfficeLocation[];
  shifts: WorkShift[];
  leaveRequests: LeaveRequest[];
  onCheckIn: (record: Partial<AttendanceRecord>) => void;
  onCheckOut: (attendanceId: number) => void;
  onSubmitLeave: (leave: Partial<LeaveRequest>) => void;
}

export const KaryawanView: React.FC<KaryawanViewProps> = ({
  currentUser,
  attendances,
  locations,
  shifts,
  leaveRequests,
  onCheckIn,
  onCheckOut,
  onSubmitLeave,
}) => {
  const [activeTab, setActiveTab] = useState<'ABSEN' | 'RIWAYAT' | 'CUTI'>('ABSEN');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Simulated vs Real GPS State
  const [simulatedDistanceMeters, setSimulatedDistanceMeters] = useState<number>(14);
  const [workMode, setWorkMode] = useState<'WFO' | 'WFH'>('WFO');
  const [notes, setNotes] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Leave form state
  const [leaveType, setLeaveType] = useState<any>('CUTI_TAHUNAN');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSuccessMsg, setLeaveSuccessMsg] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const assignedLocation = locations.find(l => l.id === currentUser.assignedLocationId) || locations[0];
  const assignedShift = shifts.find(s => s.id === currentUser.shiftId) || shifts[0];

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendances.find(
    a => a.userId === currentUser.id && a.workDate === todayStr
  );

  // Digital clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Camera stream handler
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 480, height: 480 }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        throw new Error('Webcam not supported');
      }
    } catch (err) {
      // Fallback simulated snapshot for environments without camera access
      setCameraError('Kamera fisik tidak diizinkan atau tidak terdeteksi. Sistem mengaktifkan mode simulasi verifikasi wajah.');
      setCapturedPhoto(currentUser.avatarUrl);
      setCameraActive(false);
    }
  };

  const captureSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 300, 300);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(dataUrl);
      }
      stopCamera();
    } else {
      setCapturedPhoto(currentUser.avatarUrl);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const isInsideRadius = simulatedDistanceMeters <= assignedLocation.radiusMeters;

  const handleDoCheckIn = () => {
    const nowTimeStr = currentTime.toTimeString().split(' ')[0];
    const isLate = nowTimeStr > assignedShift.lateThresholdTime;

    let lateMins = 0;
    if (isLate) {
      const [nowH, nowM] = nowTimeStr.split(':').map(Number);
      const [shiftH, shiftM] = assignedShift.startTime.split(':').map(Number);
      lateMins = Math.max(0, (nowH * 60 + nowM) - (shiftH * 60 + shiftM));
    }

    onCheckIn({
      userId: currentUser.id,
      workDate: todayStr,
      checkInTime: nowTimeStr,
      checkInLat: assignedLocation.latitude,
      checkInLng: assignedLocation.longitude,
      checkInDistanceMeters: simulatedDistanceMeters,
      checkInPhoto: capturedPhoto || currentUser.avatarUrl,
      workMode: workMode,
      status: isLate ? 'LATE' : 'PRESENT',
      lateMinutes: lateMins,
      workHoursTotal: 0,
      notes: notes || (isInsideRadius ? 'Hadir via Smartphone Geofencing' : 'Hadir luar radius dengan catatan'),
      isVerified: true,
    });

    setActionSuccessMsg(`Presensi Masuk Berhasil dicatat pukul ${nowTimeStr} WIB! Status: ${isLate ? `Terlambat ${lateMins} menit` : 'Tepat Waktu'}.`);
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  const handleDoCheckOut = () => {
    if (!todayAttendance) return;
    onCheckOut(todayAttendance.id);
    setActionSuccessMsg(`Presensi Pulang Berhasil dicatat! Jam kerja harian telah dikalkulasi.`);
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason) return;

    onSubmitLeave({
      userId: currentUser.id,
      type: leaveType,
      startDate,
      endDate,
      totalDays: 1,
      reason: leaveReason,
      attachmentName: leaveType === 'SAKIT' ? 'surat_keterangan_dokter.pdf' : undefined,
      status: 'PENDING',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });

    setLeaveReason('');
    setLeaveSuccessMsg(true);
    setTimeout(() => setLeaveSuccessMsg(false), 4000);
  };

  // User's own attendance list
  const userAttendances = attendances.filter(a => a.userId === currentUser.id);
  const userLeaves = leaveRequests.filter(l => l.userId === currentUser.id);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Employee Greeting Card */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-white/50 shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-500/40 text-indigo-200 px-2 py-0.5 rounded-full font-mono">
                {currentUser.employeeIdNumber}
              </span>
              <span className="text-[11px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Karyawan Aktif
              </span>
            </div>
            <h2 className="text-lg font-bold truncate mt-0.5">{currentUser.name}</h2>
            <p className="text-xs text-indigo-200 truncate">
              {assignedShift.name} ({assignedShift.startTime} - {assignedShift.endTime})
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Thumb-friendly mobile tabs) */}
      <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold text-slate-700">
        <button
          onClick={() => setActiveTab('ABSEN')}
          className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'ABSEN'
              ? 'bg-white text-indigo-600 shadow-sm font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Presensi Cepat</span>
        </button>
        <button
          onClick={() => setActiveTab('RIWAYAT')}
          className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'RIWAYAT'
              ? 'bg-white text-indigo-600 shadow-sm font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat ({userAttendances.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('CUTI')}
          className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'CUTI'
              ? 'bg-white text-indigo-600 shadow-sm font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Ajukan Izin/Cuti</span>
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: ABSEN (SMARTPHONE FAST ATTENDANCE ENGINE) */}
      {activeTab === 'ABSEN' && (
        <div className="space-y-4">
          {/* Live Digital Clock & Shift Status Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              WAKTU SERVER INDONESIA (WIB)
            </span>
            <div className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
              {currentTime.toLocaleTimeString('id-ID', { hour12: false })}
            </div>
            <div className="text-xs text-slate-500">
              {currentTime.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>

            {/* Shift Rules Badge */}
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
              <span>Batas Masuk Tepat Waktu: <strong>{assignedShift.lateThresholdTime} WIB</strong></span>
            </div>
          </div>

          {/* Today's Status Overview */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase text-slate-500">Status Kehadiran Hari Ini</span>
              {todayAttendance ? (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  todayAttendance.status === 'PRESENT'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {todayAttendance.status === 'PRESENT' ? '✓ Tepat Waktu' : `⚠ Terlambat (${todayAttendance.lateMinutes} mnt)`}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  Belum Presensi
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[11px] text-slate-400 font-medium">Jam Masuk (Check-In)</div>
                <div className="text-base font-bold font-mono text-slate-800 mt-1">
                  {todayAttendance?.checkInTime || '-- : -- : --'}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[11px] text-slate-400 font-medium">Jam Pulang (Check-Out)</div>
                <div className="text-base font-bold font-mono text-slate-800 mt-1">
                  {todayAttendance?.checkOutTime || '-- : -- : --'}
                </div>
              </div>
            </div>
          </div>

          {/* GPS Geofence & Location Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Geofencing Lokasi Kantor</span>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isInsideRadius
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {isInsideRadius ? '✓ Dalam Radius' : '✕ Di Luar Radius'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-100">
              <div className="font-semibold text-slate-800">{assignedLocation.name}</div>
              <div className="text-slate-500 text-[11px] leading-tight">{assignedLocation.address}</div>
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600 font-mono">
                <span>Jarak Anda: <strong>{simulatedDistanceMeters} meter</strong></span>
                <span>Radius Maksimal: <strong>{assignedLocation.radiusMeters} meter</strong></span>
              </div>
            </div>

            {/* Simulation controls for demo testing */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
              <span>Simulasi Jarak Demo:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSimulatedDistanceMeters(14)}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                    simulatedDistanceMeters === 14
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Di Kantor (14m)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedDistanceMeters(180)}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                    simulatedDistanceMeters === 180
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Luar Kantor (180m)
                </button>
              </div>
            </div>
          </div>

          {/* Camera Selfie Verification Section */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span>Verifikasi Foto Wajah (Selfie Real-time)</span>
              </div>
              {capturedPhoto && (
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Foto Terambil
                </span>
              )}
            </div>

            {cameraError && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                {cameraError}
              </div>
            )}

            <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-xl text-center relative overflow-hidden min-h-[190px]">
              {cameraActive ? (
                <div className="relative w-full max-w-[240px] aspect-square rounded-lg overflow-hidden border-2 border-indigo-500 shadow">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={captureSnapshot}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" /> Jepret Foto
                  </button>
                </div>
              ) : capturedPhoto ? (
                <div className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md">
                  <img
                    src={capturedPhoto}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setCapturedPhoto(null);
                      startCamera();
                    }}
                    className="absolute bottom-1 right-1 p-1 bg-slate-900/80 text-white rounded text-[10px]"
                    title="Foto Ulang"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="text-slate-400 space-y-2 py-4">
                  <Camera className="w-8 h-8 mx-auto text-slate-500" />
                  <p className="text-xs">Ambil foto selfie untuk melengkapi bukti absensi fisik</p>
                  <button
                    onClick={startCamera}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow inline-flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" /> Buka Kamera Depan
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Fast Tap Button (Check-In or Check-Out) */}
          <div className="pt-2">
            {!todayAttendance ? (
              <button
                onClick={handleDoCheckIn}
                disabled={!isInsideRadius}
                className={`w-full py-4 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all ${
                  isInsideRadius
                    ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white shadow-emerald-600/20'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <LogIn className="w-5 h-5" />
                <span>CHECK-IN MASUK SEKARANG</span>
              </button>
            ) : !todayAttendance.checkOutTime ? (
              <button
                onClick={handleDoCheckOut}
                className="w-full py-4 rounded-2xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>CHECK-OUT PULANG SEKARANG</span>
              </button>
            ) : (
              <div className="p-4 bg-slate-100 rounded-2xl text-center text-xs font-medium text-slate-600 border border-slate-200">
                🎉 Anda telah menyelesaikan seluruh sesi presensi hari ini. Terima kasih atas dedikasi Anda!
              </div>
            )}

            {!isInsideRadius && !todayAttendance && (
              <p className="text-[11px] text-rose-600 text-center mt-2">
                ⚠ Anda berada di luar radius kantor ({simulatedDistanceMeters}m &gt; {assignedLocation.radiusMeters}m). Dekati kantor atau hubungi HRD jika tugas dinas luar.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT KEHADIRAN PRIBADI */}
      {activeTab === 'RIWAYAT' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">
              Riwayat Kehadiran Anda
            </h3>
            <span className="text-xs text-slate-500">
              Total: {userAttendances.length} Hari
            </span>
          </div>

          <div className="space-y-2.5">
            {userAttendances.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <span>{rec.workDate}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.status === 'PRESENT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {rec.status === 'PRESENT' ? 'TEPAT WAKTU' : `TERLAMBAT (${rec.lateMinutes} mnt)`}
                    </span>
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    Masuk: {rec.checkInTime || '-'} | Pulang: {rec.checkOutTime || 'Belum Pulang'}
                  </div>
                  {rec.notes && (
                    <div className="text-[11px] text-slate-600 italic">
                      "{rec.notes}"
                    </div>
                  )}
                </div>

                {rec.workHoursTotal > 0 && (
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">Total Kerja</span>
                    <span className="font-mono font-bold text-indigo-700 text-xs">
                      {rec.workHoursTotal} Jam
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AJUKAN CUTI / IZIN / LEMBUR */}
      {activeTab === 'CUTI' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Formulir Pengajuan Cuti, Izin & Lembur
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Permohonan akan langsung masuk ke antrean verifikasi Divisi HRD.
            </p>
          </div>

          {leaveSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pengajuan berhasil dikirim! Menunggu persetujuan HRD.</span>
            </div>
          )}

          <form onSubmit={handleLeaveSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jenis Permohonan
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="CUTI_TAHUNAN">Cuti Tahunan (Tahunan Reguler)</option>
                <option value="IZIN">Izin Urusan Pribadi / Mendesak</option>
                <option value="SAKIT">Sakit (Wajib Lampiran Surat Dokter)</option>
                <option value="LEMBUR">Pengajuan Surat Perintah Lembur</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mulai Tanggal
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Alasan / Keperluan
              </label>
              <textarea
                rows={3}
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="Tuliskan alasan permohonan secara jelas..."
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Permohonan ke HRD</span>
            </button>
          </form>

          {/* User's existing requests */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              Status Pengajuan Anda Sebelumnya
            </span>
            {userLeaves.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada pengajuan cuti/izin.</p>
            ) : (
              userLeaves.map((l) => (
                <div
                  key={l.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-800">
                      {l.type.replace('_', ' ')} ({l.startDate} s/d {l.endDate})
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">
                      "{l.reason}"
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    l.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : l.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {l.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
