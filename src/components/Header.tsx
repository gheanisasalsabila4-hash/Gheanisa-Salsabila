import React from 'react';
import { UserRole, User } from '../types';
import {
  FileText,
  PlayCircle,
  Smartphone,
  Monitor,
  Shield,
  Briefcase,
  Users,
  Award,
  Sparkles,
  Clock
} from 'lucide-react';

interface HeaderProps {
  currentMainMode: 'PRD' | 'PROTOTYPE';
  onSelectMainMode: (mode: 'PRD' | 'PROTOTYPE') => void;
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  currentUser: User;
  isMobileDeviceFrame: boolean;
  onToggleDeviceFrame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMainMode,
  onSelectMainMode,
  activeRole,
  onSelectRole,
  currentUser,
  isMobileDeviceFrame,
  onToggleDeviceFrame,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-2xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 font-black text-lg">
              PH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  PresensiHub Enterprise
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Sisfor Absensi
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Sistem Analisis PRD, Skema Relasional 3NF &amp; Prototipe Multi-Role
              </p>
            </div>
          </div>

          {/* Mode Switcher: PRD vs LIVE PROTOTYPE */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold text-slate-700 border border-slate-200">
              <button
                onClick={() => onSelectMainMode('PRD')}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  currentMainMode === 'PRD'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Dokumen PRD &amp; Database</span>
              </button>
              <button
                onClick={() => onSelectMainMode('PROTOTYPE')}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  currentMainMode === 'PROTOTYPE'
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Live Prototipe Sistem</span>
              </button>
            </div>
          </div>
        </div>

        {/* Second Row: Role Simulator & Device View Toggle when in PROTOTYPE mode */}
        {currentMainMode === 'PROTOTYPE' && (
          <div className="pt-2 pb-3 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                Simulasi Peran:
              </span>

              {/* Admin Button */}
              <button
                onClick={() => onSelectRole('ADMIN')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                  activeRole === 'ADMIN'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>

              {/* HRD Button */}
              <button
                onClick={() => onSelectRole('HRD')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                  activeRole === 'HRD'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Divisi HRD</span>
              </button>

              {/* Karyawan Button */}
              <button
                onClick={() => onSelectRole('KARYAWAN')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                  activeRole === 'KARYAWAN'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Karyawan</span>
              </button>

              {/* Manajemen Button */}
              <button
                onClick={() => onSelectRole('MANAJEMEN')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                  activeRole === 'MANAJEMEN'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Manajemen</span>
              </button>
            </div>

            {/* Right side: Device preview toggle & Active user avatar */}
            <div className="flex items-center gap-3 self-end lg:self-center">
              {/* Smartphone Frame Toggle */}
              <button
                onClick={onToggleDeviceFrame}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 border transition-all ${
                  isMobileDeviceFrame
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
                title="Beralih antara tampilan smartphone mockup atau full desktop"
              >
                {isMobileDeviceFrame ? (
                  <>
                    <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Mode Desktop Luas</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mode Smartphone Mockup</span>
                  </>
                )}
              </button>

              {/* Current User Badge */}
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-300"
                />
                <div className="hidden sm:block text-left">
                  <div className="font-bold text-slate-900 leading-tight">
                    {currentUser.name.split(',')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {currentUser.role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
