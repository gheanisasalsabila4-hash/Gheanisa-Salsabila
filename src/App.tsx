import React, { useState, useEffect } from 'react';
import {
  UserRole,
  User,
  AttendanceRecord,
  LeaveRequest,
  Department,
  OfficeLocation,
  WorkShift,
  AuditLog
} from './types';
import {
  initialUsers,
  initialDepartments,
  initialLocations,
  initialShifts,
  initialAttendances,
  initialLeaveRequests,
  initialAuditLogs
} from './data/mockData';
import { Header } from './components/Header';
import { PRDViewer } from './components/PRDViewer';
import { KaryawanView } from './components/roles/KaryawanView';
import { HrdView } from './components/roles/HrdView';
import { AdminView } from './components/roles/AdminView';
import { ManajemenView } from './components/roles/ManajemenView';
import { SmartphoneFrame } from './components/SmartphoneFrame';

export default function App() {
  const [mainMode, setMainMode] = useState<'PRD' | 'PROTOTYPE'>('PRD');
  const [activeRole, setActiveRole] = useState<UserRole>('KARYAWAN');
  const [isMobileDeviceFrame, setIsMobileDeviceFrame] = useState(false);

  // Core Relational State
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(initialAttendances);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [locations, setLocations] = useState<OfficeLocation[]>(initialLocations);
  const [shifts, setShifts] = useState<WorkShift[]>(initialShifts);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  // Time tracker for smartphone frame status bar
  const [currentTimeStr, setCurrentTimeStr] = useState('08:00');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Determine active logged-in user according to active role
  const currentUser = users.find(u => u.role === activeRole) || users[0];

  // Helper to log audit actions
  const logAudit = (action: string, entity: string, details: string) => {
    const newLog: AuditLog = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      action,
      targetEntity: entity,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      ipAddress: '192.168.1.' + Math.floor(10 + Math.random() * 90),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // CHECK-IN HANDLER
  const handleCheckIn = (record: Partial<AttendanceRecord>) => {
    const newRecord: AttendanceRecord = {
      id: Date.now(),
      userId: record.userId || currentUser.id,
      workDate: record.workDate || new Date().toISOString().split('T')[0],
      checkInTime: record.checkInTime,
      checkInLat: record.checkInLat,
      checkInLng: record.checkInLng,
      checkInDistanceMeters: record.checkInDistanceMeters,
      checkInPhoto: record.checkInPhoto,
      workMode: record.workMode || 'WFO',
      status: record.status || 'PRESENT',
      lateMinutes: record.lateMinutes || 0,
      workHoursTotal: 0,
      notes: record.notes,
      isVerified: true,
    };

    setAttendances(prev => [newRecord, ...prev]);
    logAudit(
      'CHECK_IN',
      'attendances',
      `Check-in tercatat: ${newRecord.checkInTime} WIB (Status: ${newRecord.status}, Jarak: ${newRecord.checkInDistanceMeters}m)`
    );
  };

  // CHECK-OUT HANDLER
  const handleCheckOut = (attendanceId: number) => {
    const nowTimeStr = new Date().toTimeString().split(' ')[0];

    setAttendances(prev =>
      prev.map(a => {
        if (a.id === attendanceId) {
          // Calculate work hours
          let totalHours = 8.5; // default fallback
          if (a.checkInTime) {
            const [inH, inM] = a.checkInTime.split(':').map(Number);
            const [outH, outM] = nowTimeStr.split(':').map(Number);
            const inMinutes = inH * 60 + inM;
            const outMinutes = outH * 60 + outM;
            totalHours = Math.max(0.1, Number(((outMinutes - inMinutes) / 60).toFixed(2)));
          }

          return {
            ...a,
            checkOutTime: nowTimeStr,
            workHoursTotal: totalHours,
          };
        }
        return a;
      })
    );

    logAudit('CHECK_OUT', 'attendances', `Check-out tercatat: ${nowTimeStr} WIB`);
  };

  // SUBMIT LEAVE
  const handleSubmitLeave = (leave: Partial<LeaveRequest>) => {
    const newLeave: LeaveRequest = {
      id: Date.now(),
      userId: leave.userId || currentUser.id,
      type: leave.type || 'CUTI_TAHUNAN',
      startDate: leave.startDate || '',
      endDate: leave.endDate || '',
      totalDays: leave.totalDays || 1,
      reason: leave.reason || '',
      attachmentName: leave.attachmentName,
      status: 'PENDING',
      submittedAt: leave.submittedAt || new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    setLeaveRequests(prev => [newLeave, ...prev]);
    logAudit('LEAVE_SUBMIT', 'leave_requests', `Pengajuan ${newLeave.type}: ${newLeave.startDate} s/d ${newLeave.endDate}`);
  };

  // APPROVE LEAVE (HRD)
  const handleApproveLeave = (leaveId: number) => {
    setLeaveRequests(prev =>
      prev.map(l => {
        if (l.id === leaveId) {
          return {
            ...l,
            status: 'APPROVED',
            reviewedBy: `${currentUser.name} (HRD)`,
            reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
          };
        }
        return l;
      })
    );

    const targetLeave = leaveRequests.find(l => l.id === leaveId);
    if (targetLeave) {
      // Auto-insert attendance record with LEAVE status on target dates
      const newAtt: AttendanceRecord = {
        id: Date.now(),
        userId: targetLeave.userId,
        workDate: targetLeave.startDate,
        workMode: 'WFH',
        status: targetLeave.type === 'SAKIT' ? 'SICK' : 'LEAVE',
        lateMinutes: 0,
        workHoursTotal: 0,
        notes: `Pengajuan disetujui HRD: ${targetLeave.reason}`,
        isVerified: true,
      };
      setAttendances(prev => [newAtt, ...prev]);
    }

    logAudit('LEAVE_APPROVE', 'leave_requests', `Menyetujui pengajuan ID #${leaveId}`);
  };

  // REJECT LEAVE (HRD)
  const handleRejectLeave = (leaveId: number, reason: string) => {
    setLeaveRequests(prev =>
      prev.map(l => {
        if (l.id === leaveId) {
          return {
            ...l,
            status: 'REJECTED',
            rejectionReason: reason,
            reviewedBy: `${currentUser.name} (HRD)`,
            reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
          };
        }
        return l;
      })
    );

    logAudit('LEAVE_REJECT', 'leave_requests', `Menolak permohonan ID #${leaveId}: ${reason}`);
  };

  // UPDATE ATTENDANCE (HRD/Admin manual verification)
  const handleUpdateAttendance = (attendanceId: number, updates: Partial<AttendanceRecord>) => {
    setAttendances(prev =>
      prev.map(a => (a.id === attendanceId ? { ...a, ...updates } : a))
    );
    logAudit('ATTENDANCE_UPDATE', 'attendances', `Koreksi/Verifikasi absensi ID #${attendanceId}`);
  };

  // ADD NEW USER (Admin)
  const handleAddUser = (newUserData: Partial<User>) => {
    const createdUser: User = {
      id: Date.now(),
      employeeIdNumber: newUserData.employeeIdNumber || `EMP-${Date.now().toString().slice(-4)}`,
      name: newUserData.name || '',
      email: newUserData.email || '',
      phone: newUserData.phone || '',
      role: newUserData.role || 'KARYAWAN',
      departmentId: newUserData.departmentId || 1,
      positionId: newUserData.positionId || 1,
      shiftId: newUserData.shiftId || 1,
      assignedLocationId: newUserData.assignedLocationId || 1,
      avatarUrl: newUserData.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      joinDate: newUserData.joinDate || new Date().toISOString().split('T')[0],
    };

    setUsers(prev => [createdUser, ...prev]);
    logAudit('USER_CREATE', 'users', `Mendaftarkan user baru ${createdUser.name} (${createdUser.employeeIdNumber})`);
  };

  // UPDATE USER (Admin)
  const handleUpdateUser = (userId: number, updates: Partial<User>) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, ...updates } : u))
    );
    logAudit('USER_UPDATE', 'users', `Memperbarui profil user ID #${userId}`);
  };

  // ADD LOCATION (Admin)
  const handleAddLocation = (loc: Partial<OfficeLocation>) => {
    const newLocation: OfficeLocation = {
      id: Date.now(),
      name: loc.name || 'Cabang Baru',
      address: loc.address || '',
      latitude: loc.latitude || -6.200000,
      longitude: loc.longitude || 106.816666,
      radiusMeters: loc.radiusMeters || 100,
      isActive: true,
    };

    setLocations(prev => [...prev, newLocation]);
    logAudit('LOCATION_CREATE', 'office_locations', `Menambahkan kantor ${newLocation.name} radius ${newLocation.radiusMeters}m`);
  };

  // Render role-specific workspace
  const renderRoleView = () => {
    switch (activeRole) {
      case 'KARYAWAN':
        return (
          <KaryawanView
            currentUser={currentUser}
            attendances={attendances}
            locations={locations}
            shifts={shifts}
            leaveRequests={leaveRequests}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onSubmitLeave={handleSubmitLeave}
          />
        );
      case 'HRD':
        return (
          <HrdView
            currentUser={currentUser}
            users={users}
            attendances={attendances}
            leaveRequests={leaveRequests}
            shifts={shifts}
            departments={departments}
            onApproveLeave={handleApproveLeave}
            onRejectLeave={handleRejectLeave}
            onUpdateAttendance={handleUpdateAttendance}
          />
        );
      case 'ADMIN':
        return (
          <AdminView
            currentUser={currentUser}
            users={users}
            departments={departments}
            locations={locations}
            shifts={shifts}
            auditLogs={auditLogs}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onAddLocation={handleAddLocation}
          />
        );
      case 'MANAJEMEN':
        return (
          <ManajemenView
            currentUser={currentUser}
            users={users}
            attendances={attendances}
            departments={departments}
            shifts={shifts}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Global Navigation Header */}
      <Header
        currentMainMode={mainMode}
        onSelectMainMode={setMainMode}
        activeRole={activeRole}
        onSelectRole={setActiveRole}
        currentUser={currentUser}
        isMobileDeviceFrame={isMobileDeviceFrame}
        onToggleDeviceFrame={() => setIsMobileDeviceFrame(!isMobileDeviceFrame)}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {mainMode === 'PRD' ? (
          <PRDViewer />
        ) : isMobileDeviceFrame ? (
          <SmartphoneFrame currentTimeStr={currentTimeStr}>
            {renderRoleView()}
          </SmartphoneFrame>
        ) : (
          <div>{renderRoleView()}</div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-700">PresensiHub Enterprise</strong> — Sistem Informasi Absensi Terpadu &amp; PRD Specification
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Standar Relasional 3NF</span>
            <span>•</span>
            <span>Mobile-First SLA &lt; 300ms</span>
            <span>•</span>
            <span>RBAC 4 Aktor</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
