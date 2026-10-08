import React, { useState } from 'react';
import { User, Department, OfficeLocation, WorkShift, AuditLog, UserRole } from '../../types';
import {
  Users,
  Building,
  MapPin,
  Shield,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Key,
  ShieldAlert,
  Save,
  X
} from 'lucide-react';

interface AdminViewProps {
  currentUser: User;
  users: User[];
  departments: Department[];
  locations: OfficeLocation[];
  shifts: WorkShift[];
  auditLogs: AuditLog[];
  onAddUser: (user: Partial<User>) => void;
  onUpdateUser: (userId: number, updates: Partial<User>) => void;
  onAddLocation: (loc: Partial<OfficeLocation>) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  users,
  departments,
  locations,
  shifts,
  auditLogs,
  onAddUser,
  onUpdateUser,
  onAddLocation,
}) => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'LOCATIONS' | 'AUDIT'>('USERS');
  const [searchUser, setSearchUser] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserNik, setNewUserNik] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('KARYAWAN');
  const [newUserDeptId, setNewUserDeptId] = useState<number>(departments[0]?.id || 1);
  const [newUserShiftId, setNewUserShiftId] = useState<number>(shifts[0]?.id || 1);
  const [newUserLocationId, setNewUserLocationId] = useState<number>(locations[0]?.id || 1);

  // New Location Form State
  const [newLocName, setNewLocName] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');
  const [newLocLat, setNewLocLat] = useState('-6.200000');
  const [newLocLng, setNewLocLng] = useState('106.816666');
  const [newLocRadius, setNewLocRadius] = useState(100);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserNik) return;

    onAddUser({
      name: newUserName,
      email: newUserEmail,
      phone: newUserPhone || '081234567890',
      employeeIdNumber: newUserNik,
      role: newUserRole,
      departmentId: Number(newUserDeptId),
      positionId: 5,
      shiftId: Number(newUserShiftId),
      assignedLocationId: Number(newUserLocationId),
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      joinDate: new Date().toISOString().split('T')[0],
    });

    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserNik('');
  };

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName || !newLocAddress) return;

    onAddLocation({
      name: newLocName,
      address: newLocAddress,
      latitude: parseFloat(newLocLat),
      longitude: parseFloat(newLocLng),
      radiusMeters: Number(newLocRadius),
      isActive: true,
    });

    setShowAddLocationModal(false);
    setNewLocName('');
    setNewLocAddress('');
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.employeeIdNumber.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Admin Title Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs mb-1">
            <Shield className="w-4 h-4" />
            <span>Administrator Control Center & Master Data</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            Kelola Pengguna, Lokasi Kantor & Jejak Audit
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Pengelolaan hak akses pengguna (RBAC), radius geofencing presensi, dan rekam jejak audit sistem.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-700 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'USERS'
                ? 'bg-white text-indigo-600 shadow-sm font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kelola User ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('LOCATIONS')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'LOCATIONS'
                ? 'bg-white text-indigo-600 shadow-sm font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Lokasi Geofence ({locations.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'AUDIT'
                ? 'bg-white text-indigo-600 shadow-sm font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: KELOLA USER */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari user, NIK, atau email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah User Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Peran (Role)</th>
                  <th className="py-3 px-4">Departemen</th>
                  <th className="py-3 px-4">Shift & Penugasan Kantor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const dept = departments.find(d => d.id === u.departmentId);
                  const loc = locations.find(l => l.id === u.assignedLocationId);
                  const sh = shifts.find(s => s.id === u.shiftId);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatarUrl}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {u.employeeIdNumber} • {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'HRD'
                            ? 'bg-sky-100 text-sky-800'
                            : u.role === 'MANAJEMEN'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {dept?.name || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{sh?.name || '-'}</div>
                        <div className="text-[11px] text-slate-400">{loc?.name || '-'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {u.isActive ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onUpdateUser(u.id, { isActive: !u.isActive })}
                          className="px-2.5 py-1 text-[11px] font-medium rounded border border-slate-300 hover:bg-slate-100 transition-colors"
                        >
                          {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LOKASI GEOFENCE */}
      {activeTab === 'LOCATIONS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Titik Koordinat Kantor & Radius Geofencing
              </h3>
              <p className="text-xs text-slate-500">
                Pusat dan kantor cabang tempat presensi kehadiran karyawan dapat divalidasi.
              </p>
            </div>
            <button
              onClick={() => setShowAddLocationModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Lokasi</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((loc) => (
              <div key={loc.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <h4 className="font-bold text-slate-900 text-sm">{loc.name}</h4>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    Radius {loc.radiusMeters} Meter
                  </span>
                </div>
                <p className="text-xs text-slate-600">{loc.address}</p>
                <div className="text-[11px] font-mono text-slate-500 bg-white p-2 rounded border border-slate-200 flex justify-between">
                  <span>Lat: {loc.latitude}</span>
                  <span>Lng: {loc.longitude}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Rekam Jejak Keamanan Sistem (Audit Trail Logs)
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan riwayat autentikasi dan manipulasi data untuk akuntabilitas operasional.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.userName}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                      {log.role}
                    </span>
                    <span className="font-mono text-indigo-600 font-bold text-[11px]">
                      [{log.action}]
                    </span>
                  </div>
                  <div className="text-slate-600">{log.details}</div>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-mono shrink-0">
                  <div>{log.timestamp}</div>
                  <div>IP: {log.ipAddress}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add User */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Pendaftaran User Baru
              </h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIK / NIP</label>
                  <input
                    type="text"
                    required
                    placeholder="EMP-005"
                    value={newUserNik}
                    onChange={(e) => setNewUserNik(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peran Akses (Role)</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="KARYAWAN">KARYAWAN</option>
                    <option value="HRD">HRD</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAJEMEN">MANAJEMEN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Farhan Alamsyah"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Korporat</label>
                  <input
                    type="email"
                    required
                    placeholder="user@perusahaan.co.id"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Handphone</label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxxx"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departemen</label>
                  <select
                    value={newUserDeptId}
                    onChange={(e) => setNewUserDeptId(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shift</label>
                  <select
                    value={newUserShiftId}
                    onChange={(e) => setNewUserShiftId(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {shifts.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lokasi Kantor</label>
                  <select
                    value={newUserLocationId}
                    onChange={(e) => setNewUserLocationId(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-sm"
                >
                  Simpan User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Location */}
      {showAddLocationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Tambah Lokasi Kantor Geofence
              </h3>
              <button onClick={() => setShowAddLocationModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kantor / Gedung</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kantor Cabang Bandung"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Fisik Lengkap</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jl. Asia Afrika No. 10..."
                  value={newLocAddress}
                  onChange={(e) => setNewLocAddress(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="text"
                    required
                    value={newLocLat}
                    onChange={(e) => setNewLocLat(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="text"
                    required
                    value={newLocLng}
                    onChange={(e) => setNewLocLng(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Radius (m)</label>
                  <input
                    type="number"
                    required
                    value={newLocRadius}
                    onChange={(e) => setNewLocRadius(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddLocationModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-sm"
                >
                  Simpan Lokasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
