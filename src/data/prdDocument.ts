export interface PRDSection {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  content: string;
  subsections?: {
    id: string;
    title: string;
    content: string;
  }[];
}

export const prdDocumentMeta = {
  title: 'PRODUCT REQUIREMENT DOCUMENT (PRD)',
  systemName: 'PresensiHub Enterprise - Sistem Informasi Absensi Terintegrasi',
  documentVersion: 'v1.0.0-PROD-SPEC',
  author: 'Tim Senior System Analyst & Software Architect',
  status: 'Approved for Development',
  targetPlatform: 'Web-Based Responsive (Mobile-First / Smartphone Compatible PWA)',
  lastUpdated: 'Oktober 2026',
};

export const sqlDdlScript = `-- =====================================================================
-- PRESENSIHUB ENTERPRISE - POSTGRESQL / RELATIONAL DDL SCHEMA
-- Dibuat oleh: Senior System Analyst
-- Versi: 1.0.0 (3NF Compliant, Foreign Keys, Indexes, Constraints)
-- =====================================================================

-- 1. Tabel Master Peran (Roles)
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    role_code VARCHAR(30) UNIQUE NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Departemen (Departments)
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    dept_code VARCHAR(20) UNIQUE NOT NULL,
    dept_name VARCHAR(150) NOT NULL,
    manager_user_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Jabatan (Job Positions)
CREATE TABLE job_positions (
    id BIGSERIAL PRIMARY KEY,
    position_code VARCHAR(30) UNIQUE NOT NULL,
    position_name VARCHAR(150) NOT NULL,
    department_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_position_department FOREIGN KEY (department_id) 
        REFERENCES departments(id) ON DELETE RESTRICT
);

-- 4. Tabel Master Lokasi Kantor & Geofencing (Office Locations)
CREATE TABLE office_locations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    radius_meters INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Master Jam Kerja / Shift (Work Shifts)
CREATE TABLE work_shifts (
    id BIGSERIAL PRIMARY KEY,
    shift_name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    late_threshold_time TIME NOT NULL,
    is_night_shift BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Entitas Pengguna (Users / Employees)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    employee_id_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(25),
    role_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    position_id BIGINT NOT NULL,
    shift_id BIGINT NOT NULL,
    assigned_location_id BIGINT NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    join_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_user_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    CONSTRAINT fk_user_pos FOREIGN KEY (position_id) REFERENCES job_positions(id) ON DELETE RESTRICT,
    CONSTRAINT fk_user_shift FOREIGN KEY (shift_id) REFERENCES work_shifts(id) ON DELETE RESTRICT,
    CONSTRAINT fk_user_location FOREIGN KEY (assigned_location_id) REFERENCES office_locations(id) ON DELETE RESTRICT
);

-- Tambahkan circular FK untuk manager_user_id di departments
ALTER TABLE departments 
    ADD CONSTRAINT fk_department_manager FOREIGN KEY (manager_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 7. Tabel Transaksi Presensi Harian (Attendances)
CREATE TABLE attendances (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    shift_id BIGINT NOT NULL,
    work_date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    check_in_lat NUMERIC(10, 7),
    check_in_lng NUMERIC(10, 7),
    check_in_distance_meters INTEGER,
    check_in_photo_url TEXT,
    check_out_lat NUMERIC(10, 7),
    check_out_lng NUMERIC(10, 7),
    check_out_photo_url TEXT,
    work_mode VARCHAR(20) NOT NULL DEFAULT 'WFO' CHECK (work_mode IN ('WFO', 'WFH', 'OFFSHORE')),
    status VARCHAR(25) NOT NULL CHECK (status IN ('PRESENT', 'LATE', 'VERY_LATE', 'ABSENT', 'LEAVE', 'SICK')),
    late_minutes INTEGER NOT NULL DEFAULT 0,
    work_hours_total NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_work_date UNIQUE (user_id, work_date),
    CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_shift FOREIGN KEY (shift_id) REFERENCES work_shifts(id) ON DELETE RESTRICT
);

-- 8. Tabel Transaksi Permohonan Cuti / Izin / Sakit / Lembur (Leave Requests)
CREATE TABLE leave_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    leave_type VARCHAR(30) NOT NULL CHECK (leave_type IN ('CUTI_TAHUNAN', 'IZIN', 'SAKIT', 'LEMBUR', 'CUTI_MELAHIRKAN')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL DEFAULT 1,
    reason TEXT NOT NULL,
    attachment_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by_user_id BIGINT,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_leave_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_leave_reviewer FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 9. Tabel Koreksi Presensi Manual (Attendance Corrections)
CREATE TABLE attendance_corrections (
    id BIGSERIAL PRIMARY KEY,
    attendance_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    corrected_check_in TIME,
    corrected_check_out TIME,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approved_by_user_id BIGINT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_correction_attendance FOREIGN KEY (attendance_id) REFERENCES attendances(id) ON DELETE CASCADE,
    CONSTRAINT fk_correction_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_correction_reviewer FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 10. Tabel Rekam Jejak Keamanan Sistem (Audit Logs)
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    action_type VARCHAR(50) NOT NULL,
    target_entity VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================================
-- PERFORMANCE OPTIMIZATION INDEXES (FAST RESPONSE QUERIES)
-- =====================================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_dept_id ON users(department_id);
CREATE INDEX idx_users_nik ON users(employee_id_number);

CREATE INDEX idx_attendances_date_user ON attendances(work_date, user_id);
CREATE INDEX idx_attendances_status ON attendances(status);
CREATE INDEX idx_attendances_user_id ON attendances(user_id);

CREATE INDEX idx_leave_user_status ON leave_requests(user_id, status);
CREATE INDEX idx_leave_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
`;

export const prdSections: PRDSection[] = [
  {
    id: 'sec-1',
    number: '1.0',
    title: 'Ringkasan Eksekutif & Latar Belakang (Executive Summary)',
    subtitle: 'Konteks strategis, masalah bisnis, dan visi sistem',
    content: `
Sistem Informasi Absensi Terpadu (PresensiHub) dirancang untuk memecahkan kendala klasik pengelolaan presensi konvensional (mesin fingerprint statis, formulir manual kertas, atau rekap spreadsheet manual yang rawan human error dan kecurangan titip absen).

**Tantangan Utama Saat Ini:**
1. Ketergantungan pada hardware fisik di satu titik yang memicu antrean panjang saat jam masuk kantor.
2. Tidak adanya verifikasi biometrik realtime + lokasi presisi bagi karyawan lapangan, hybrid, maupun cabang.
3. Alur pengajuan izin, sakit, cuti, dan lembur lambat serta tidak sinkron otomatis dengan status kehadiran harian.
4. Tim Manajemen kesulitan mendapatkan laporan kehadiran konsolidasi lintas divisi secara instan, akurat, dan siap cetak (print-ready) saat evaluasi kinerja bulanan.

**Visi Solusi:**
Membangun platform aplikasi berbasis web modern yang **100% responsif dan optimal untuk smartphone (Mobile-First Web App / PWA)** dengan performa **fast response (< 300ms)**. Platform ini menghubungkan empat pilar aktor bisnis secara tersinkronisasi: **Admin**, **Divisi HRD**, **Karyawan**, dan **Manajemen**, didukung struktur database relasional enterprise-grade.
    `,
  },
  {
    id: 'sec-2',
    number: '2.0',
    title: 'Tujuan Bisnis & Parameter Keberhasilan (Objectives & OKR)',
    subtitle: 'Target kuantitatif yang dicapai pasca-implementasi sistem',
    content: `
Implementasi Sistem Informasi Absensi ini memiliki target strategis (Key Results):
* **Peningkatan Efisiensi Waktu Absen:** Mempersingkat waktu presensi karyawan dari rata-rata 3 menit antre menjadi < 5 detik langsung dari smartphone masing-masing.
* **Akurasi Validasi Kehadiran 99.8%:** Memadukan koordinat GPS Geofencing (radius 50-100 meter) dengan kamera selfie face-capture seketika untuk mengeliminasi potensi titip absen (buddy punching).
* **Otomasi Alur Persetujuan Cuti & Lembur:** Memangkas cycle-time persetujuan dari 2-3 hari kerja menjadi < 30 menit melalui notifikasi digital dan dashboard HRD.
* **Executive Ready Reporting:** Menyediakan laporan real-time yang dapat difilter per departemen/periode tanggal dan diekspor / dicetak langsung ke format PDF resmi bertanda tangan pimpinan dalam 1 klik.
    `,
  },
  {
    id: 'sec-3',
    number: '3.0',
    title: 'Aktor Sistem & Matriks Hak Akses (RBAC Matrix)',
    subtitle: 'Pemetaan otoritas dan hak akses 4 pilar pengguna',
    content: `
Sistem menerapkan prinsip **Role-Based Access Control (RBAC)** ketat untuk menjaga integritas data dan pemisahan tugas (*separation of duties*):

| Modul / Kemampuan | Admin | HRD | Karyawan | Manajemen |
| :--- | :---: | :---: | :---: | :---: |
| **Login & Kelola Profil Pribadi** | ✅ Penuh | ✅ Penuh | ✅ Penuh | ✅ Penuh |
| **Kelola Master User (CRUD Akun, NIK, Penempatan)** | ✅ Penuh | 👁️ Read-Only | ❌ No Access | 👁️ Read-Only |
| **Kelola Master Departemen, Jabatan, & Lokasi Kantor** | ✅ Penuh | 👁️ Read-Only | ❌ No Access | 👁️ Read-Only |
| **Kelola Master Shift & Jam Kerja Toleransi** | ✅ Penuh | ✅ Penuh | ❌ No Access | 👁️ Read-Only |
| **Melakukan Check-in / Check-out (Selfie + GPS)** | ✅ Bisa | ✅ Bisa | ✅ Prioritas Utama | ✅ Bisa |
| **Melihat Riwayat Absensi Pribadi** | ✅ Bisa | ✅ Bisa | ✅ Bisa | ✅ Bisa |
| **Mengajukan Cuti, Izin, Sakit, & Lembur** | ✅ Bisa | ✅ Bisa | ✅ Bisa | ✅ Bisa |
| **Verifikasi / Approval Cuti & Izin Karyawan** | 👁️ Monitoring | ✅ Eksekutor Utama | ❌ No Access | 👁️ Monitoring |
| **Monitoring Dashboard Kehadiran Realtime Hari Ini** | ✅ Akses | ✅ Akses Penuh | ❌ No Access | ✅ Akses Eksekutif |
| **Koreksi Data Absensi & Verifikasi Anomali** | ✅ Backup | ✅ Eksekutor Utama | ❌ Pengajuan saja | 👁️ View |
| **Mencetak Laporan Kehadiran Resmi (Print/PDF)** | 👁️ View/Export | ✅ Rekap Operasional | ❌ Slip Pribadi | ✅ **Cetak Laporan Lengkap** |
| **Akses System Audit Trail & Keamanan** | ✅ Penuh | ❌ No Access | ❌ No Access | 👁️ Ringkasan |
    `,
  },
  {
    id: 'sec-4',
    number: '4.0',
    title: 'Spesifikasi Kebutuhan Fungsional (Functional Requirements)',
    subtitle: 'Rincian fitur terstruktur berdasarkan modul aktor',
    content: `
Kebutuhan fungsional dikelompokkan ke dalam modul utama:

### 4.1 Modul Autentikasi & Akun
* **FR-AUTH-01:** Pengguna dapat melakukan login menggunakan Email korporat dan kata sandi terenkripsi.
* **FR-AUTH-02:** Sistem menerapkan otentikasi berbasis token JWT stateless dengan rotasi token dan auto-lockout bila salah kata sandi berulang kali.
* **FR-AUTH-03:** Sistem melakukan *role-dispatching* otomatis ke antarmuka dashboard sesuai hak akses (Admin, HRD, Karyawan, Manajemen).

### 4.2 Modul Karyawan (Self-Service Attendance Mobile)
* **FR-EMP-01:** Menampilkan jam digital real-time dengan status shift aktif hari ini (Jam Masuk, Jam Pulang, Batas Toleransi).
* **FR-EMP-02:** Tombol cepat satu ketukan (*fast response 1-tap*) untuk **Check-In** dan **Check-Out**.
* **FR-EMP-03:** Validasi GPS Geolocation secara client-side dan server-side: menghitung jarak radius meter ke titik kantor penugasan. Sistem mendeteksi status lokasi (Di Dalam Radius / Di Luar Radius).
* **FR-EMP-04:** Integrasi snapshot kamera selfie (WebRTC / Front Camera) sebagai bukti otentik kehadiran fisik.
* **FR-EMP-05:** Otomatisasi kalkulasi status: Tepat Waktu (*PRESENT*), Terlambat (*LATE* dengan menit keterlambatan), atau Sangat Terlambat (*VERY_LATE*).
* **FR-EMP-06:** Formulir pengajuan permohonan Cuti Tahunan, Izin, Sakit (unggah surat dokter), dan Pengajuan Lembur beserta pelacakan status (*PENDING / APPROVED / REJECTED*).
* **FR-EMP-07:** Riwayat absensi bulanan dan kalkulasi total jam kerja akumulatif.

### 4.3 Modul Divisi HRD (Human Resources Operations)
* **FR-HRD-01:** Live Attendance Monitor hari ini: persentase kehadiran, jumlah hadir tepat waktu, terlambat, izin/cuti, dan belum absen.
* **FR-HRD-02:** Antrean Persetujuan Cuti & Lembur: HRD dapat meninjau alasan, dokumen lampiran, riwayat cuti, lalu melakukan *Approve* atau *Reject* disertai catatan.
* **FR-HRD-03:** Pengaturan Jadwal & Rotasi Shift Karyawan: menetapkan jam masuk, toleransi keterlambatan, dan kebijakan malam.
* **FR-HRD-04:** Koreksi Presensi: HRD dapat memvalidasi permintaan koreksi absen jika karyawan mengalami kendala jaringan atau tugas luar kota.

### 4.4 Modul Manajemen (Executive Oversight & Report Printing)
* **FR-MGT-01:** Executive Scorecard: Tingkat kehadiran agregat perusahaan, rasio keterlambatan, dan distribusi per departemen.
* **FR-MGT-02:** Analisis tren disiplin kerja dan perbandingan performa kehadiran antar divisi.
* **FR-MGT-03:** **Mencetak Laporan Kehadiran:** Manajemen dapat memfilter laporan berdasarkan rentang tanggal (harian, mingguan, bulanan) dan pilihan departemen, lalu memicu fitur **Cetak Laporan Langsung (Print-to-PDF / Paper Print)** yang telah diformat standar korporat lengkap dengan kop surat, tabel ringkasan, dan kolom otorisasi tanda tangan direksi/manajer.

### 4.5 Modul Administrator (Master Data & System Integrity)
* **FR-ADM-01:** Manajemen User CRUD: Tambah, edit, nonaktifkan akun karyawan, ganti peran, ubah shift, dan reset kredensial.
* **FR-ADM-02:** Manajemen Master Departemen, Jabatan Fungsional, dan Titik Koordinat Kantor (Latitude, Longitude, Radius toleransi meter).
* **FR-ADM-03:** Audit Trail Viewer: Memonitor seluruh aktivitas manipulasi data, login, dan aksi krusial beserta IP Address dan stempel waktu.
    `,
  },
  {
    id: 'sec-5',
    number: '5.0',
    title: 'Kebutuhan Non-Fungsional (Non-Functional Requirements / NFR)',
    subtitle: 'Standar kualitas, kinerja smartphone, keamanan, dan keandalan',
    content: `
Kriteria mutu teknis arsitektur:

1. **Kecepatan & Responsivitas (Fast Response SLA):**
   * *API Latency:* Rata-rata respon endpoint transaksi absen < 200 ms pada koneksi 4G mobile.
   * *Page Load Time:* First Contentful Paint (FCP) < 1.2 detik pada layar smartphone.
   * *Optimized Payload:* Data foto selfie dikompresi di sisi browser (WebP / JPEG 75% quality) sebelum upload untuk menghemat bandwidth.

2. **Kompatibilitas Smartphone & Mobile-First Design:**
   * Antarmuka didesain ergonomis untuk jempol (*thumb-friendly zone*): tombol aksi check-in berukuran besar, navigasi bottom-bar, dan tata letak fleksibel untuk resolusi layar 360px hingga 4K.
   * Dukungan Progressive Web App (PWA) agar dapat di-install ke Home Screen perangkat Android dan iOS.

3. **Keamanan & Integritas Data:**
   * Enkripsi kata sandi menggunakan hashing modern (Argon2id atau Bcrypt dengan cost factor 12).
   * Geofencing anti-spoofing: Memverifikasi timestamp klien dengan server time (NTP sync) untuk mencegah manipulasi jam sistem perangkat.
   * Perlindungan HTTPS, CORS origin whitelist, dan CSRF protection.

4. **Ketersediaan & Reliabilitas:**
   * Target availability 99.9% uptime.
   * Database transaksi dilindungi constraint atomik untuk mencegah *double check-in* pada hari yang sama (Unique constraint pada user_id + work_date).
    `,
  },
  {
    id: 'sec-6',
    number: '6.0',
    title: 'Arsitektur Database Relasional (Well-Relation Database Design)',
    subtitle: 'Struktur entitas terstandarisasi, relasi foreign key, dan integritas referensial',
    content: `
Struktur database dirancang memenuhi kaidah **Third Normal Form (3NF)** guna menghilangkan anomali redundansi data dan menjamin integritas referensial antar tabel.

### Hubungan Antar Tabel (Relational Mapping & Cardinality):
1. **roles (1) ──< users (N):** Satu peran dimiliki oleh banyak user; tiap user wajib memiliki tepat 1 peran sistem.
2. **departments (1) ──< users (N):** Satu departemen menaungi banyak karyawan.
3. **departments (1) ──< job_positions (N):** Satu departemen memiliki beberapa variasi jabatan.
4. **departments (N) >── (1) users (manager):** Tiap departemen dapat dipimpin oleh seorang manajer.
5. **job_positions (1) ──< users (N):** Jabatan fungsional yang diemban karyawan.
6. **office_locations (1) ──< users (N):** Penugasan basis kantor fisik dan radius geofence karyawan.
7. **work_shifts (1) ──< users (N):** Jadwal jam kerja default karyawan.
8. **users (1) ──< attendances (N):** Catatan riwayat presensi harian karyawan (Unique constraint per user per work_date).
9. **work_shifts (1) ──< attendances (N):** Shift acuan saat transaksi absen dilakukan.
10. **users (1) ──< leave_requests (N):** Formulir permohonan cuti/izin/lembur yang diajukan.
11. **users (1) ──< leave_requests (reviewed_by):** Relasi reviewer HRD yang menyetujui permohonan.
12. **attendances (1) ──< attendance_corrections (N):** Log pengajuan koreksi jam absensi.
13. **users (1) ──< audit_logs (N):** Catatan jejak audit aktivitas pengguna.

*Seluruh skrip DDL SQL lengkap beserta indeks performa query reporting telah disertakan pada tab SQL DDL Generator.*
    `,
  },
  {
    id: 'sec-7',
    number: '7.0',
    title: 'Alur Proses Bisnis & Use Case (Business Flow & Logic)',
    subtitle: 'Siklus hidup operasional presensi dari tapping hingga pelaporan',
    content: `
### Alur 1: Proses Presensi Harian Karyawan (Check-in Workflow)
1. Karyawan membuka aplikasi melalui smartphone browser atau PWA shortcut.
2. Sistem mendeteksi koordinat GPS perangkat karyawan dan mencocokkannya dengan koordinat kantor penugasan menggunakan formula Haversine.
3. Kamera depan smartphone aktif. Karyawan mengambil foto selfie real-time sebagai bukti kehadiran.
4. Karyawan menekan tombol "Check-In Sekarang".
5. Sistem memvalidasi:
   - Jarak <= radius kantor (misal 100 meter): Lolos Geofencing.
   - Jam submit <= Batas toleransi shift: Status = \`PRESENT\` (Tepat Waktu).
   - Jam submit > Batas toleransi: Status = \`LATE\` (Hitung selisih menit terlambat).
6. Data disimpan secara instan, audit log tercatat, dan dashboard HRD/Manajemen ter-update real-time.

### Alur 2: Pengajuan & Persetujuan Cuti / Izin (Approval Workflow)
1. Karyawan mengisi formulir permohonan (Jenis Cuti/Izin/Sakit/Lembur, rentang tanggal, alasan, dan upload surat keterangan dokter jika sakit).
2. Tiket masuk antrean dengan status \`PENDING\`.
3. Divisi HRD menerima notifikasi di dashboard review.
4. HRD memeriksa kuota dan dokumen pendukung, lalu memilih \`APPROVE\` atau \`REJECT\`.
5. Apabila disetujui, sistem otomatis meng-generate record kehadiran kalender dengan status \`LEAVE\` / \`SICK\` pada tanggal bersangkutan sehingga karyawan tidak terhitung alpa (*ABSENT*).

### Alur 3: Evaluasi & Cetak Laporan Kehadiran (Management Reporting)
1. Manajemen membuka menu "Laporan Kehadiran Eksekutif".
2. Menentukan filter periode tanggal (cth. Bulan Berjalan) dan departemen target (cth. Semua Departemen atau Operasional).
3. Sistem menampilkan tabel konsolidasi kehadiran, persentase hadir, total menit terlambat, dan hari cuti.
4. Manajemen menekan tombol "Cetak Laporan / Print to PDF".
5. Sistem memunculkan jendela cetak berformat standar dokumen resmi (kop surat perusahaan, nomor dokumen, tabel terstruktur rapi tanpa elemen UI tombol, dan kolom tanda tangan basah pimpinan).
    `,
  },
];
