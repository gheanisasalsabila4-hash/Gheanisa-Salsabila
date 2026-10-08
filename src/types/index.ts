export type UserRole = 'ADMIN' | 'HRD' | 'KARYAWAN' | 'MANAJEMEN';

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'VERY_LATE' | 'ABSENT' | 'LEAVE' | 'SICK';
export type WorkMode = 'WFO' | 'WFH' | 'OFFSHORE';
export type LeaveType = 'CUTI_TAHUNAN' | 'IZIN' | 'SAKIT' | 'LEMBUR' | 'CUTI_MELAHIRKAN';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Role {
  id: number;
  code: UserRole;
  name: string;
  description: string;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  managerName?: string;
}

export interface JobPosition {
  id: number;
  code: string;
  name: string;
  departmentId: number;
}

export interface OfficeLocation {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
}

export interface WorkShift {
  id: number;
  name: string;
  startTime: string; // "08:00"
  endTime: string;   // "17:00"
  lateThresholdTime: string; // "08:15"
  isNightShift: boolean;
}

export interface User {
  id: number;
  employeeIdNumber: string; // e.g. "EMP-2024-001"
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  departmentId: number;
  positionId: number;
  shiftId: number;
  assignedLocationId: number;
  avatarUrl: string;
  isActive: boolean;
  joinDate: string;
}

export interface AttendanceRecord {
  id: number;
  userId: number;
  workDate: string; // "YYYY-MM-DD"
  checkInTime?: string; // "HH:MM:SS"
  checkOutTime?: string; // "HH:MM:SS"
  checkInLat?: number;
  checkInLng?: number;
  checkInDistanceMeters?: number;
  checkInPhoto?: string;
  checkOutLat?: number;
  checkOutLng?: number;
  checkOutPhoto?: string;
  workMode: WorkMode;
  status: AttendanceStatus;
  lateMinutes: number;
  workHoursTotal: number;
  notes?: string;
  isVerified: boolean;
}

export interface LeaveRequest {
  id: number;
  userId: number;
  type: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachmentName?: string;
  status: LeaveStatus;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  role: UserRole;
  action: string;
  targetEntity: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface SchemaTableColumn {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  references?: string;
  isNullable?: boolean;
  description: string;
}

export interface SchemaTable {
  name: string;
  description: string;
  columns: SchemaTableColumn[];
}
