import React, { useState } from 'react';
import { databaseSchemaTables } from '../data/mockData';
import { SchemaTable } from '../types';
import { Database, Key, Link2, Table, Info, Search } from 'lucide-react';

export const ERDVisualizer: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<SchemaTable>(databaseSchemaTables[5]); // users table by default
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTables = databaseSchemaTables.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-1">
              <Database className="w-4 h-4" />
              <span>Arsitektur Relasional Database Terstruktur (3NF)</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Entity Relationship Diagram (ERD) & Skema Tabel
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl">
              Struktur skema basis data relational mencakup 10 tabel inti dengan integritas referensial penuh (Primary Key, Foreign Key, Check Constraints, dan Indeks Kinerja).
            </p>
          </div>
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari tabel / kolom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Relational Visual Grid of Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Selector List */}
        <div className="lg:col-span-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1 mb-2">
            Daftar Tabel ({databaseSchemaTables.length})
          </h3>
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredTables.map((table) => {
              const isSelected = selectedTable.name === table.name;
              const pkCount = table.columns.filter(c => c.isPrimary).length;
              const fkCount = table.columns.filter(c => c.isForeign).length;

              return (
                <button
                  key={table.name}
                  onClick={() => setSelectedTable(table)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all text-sm flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-500 shadow-sm text-indigo-950 font-medium'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`p-2 rounded-lg mt-0.5 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Table className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-mono font-semibold text-slate-900 flex items-center gap-1.5">
                        {table.name}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {table.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-[11px] shrink-0">
                    <span className="text-amber-700 font-mono bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      PK: {pkCount}
                    </span>
                    {fkCount > 0 && (
                      <span className="text-indigo-700 font-mono bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                        FK: {fkCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Relationship Cardinality Summary Box */}
          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs space-y-2 mt-4">
            <div className="font-semibold text-amber-400 flex items-center gap-1.5">
              <Link2 className="w-4 h-4" />
              <span>Kardinalitas Relasi Kunci:</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 font-mono text-[11px]">
              <li>• <span className="text-emerald-400">roles (1)</span> ──&lt; <span className="text-sky-300">users (N)</span></li>
              <li>• <span className="text-emerald-400">departments (1)</span> ──&lt; <span className="text-sky-300">users (N)</span></li>
              <li>• <span className="text-emerald-400">office_locations (1)</span> ──&lt; <span className="text-sky-300">users (N)</span></li>
              <li>• <span className="text-emerald-400">work_shifts (1)</span> ──&lt; <span className="text-sky-300">users (N)</span></li>
              <li>• <span className="text-emerald-400">users (1)</span> ──&lt; <span className="text-sky-300">attendances (N)</span></li>
              <li>• <span className="text-emerald-400">users (1)</span> ──&lt; <span className="text-sky-300">leave_requests (N)</span></li>
              <li>• <span className="text-emerald-400">attendances (1)</span> ──&lt; <span className="text-sky-300">corrections (N)</span></li>
            </ul>
          </div>
        </div>

        {/* Selected Table Detail View */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded text-xs font-mono font-bold">
                  TABLE
                </span>
                <h3 className="font-mono text-xl font-bold text-slate-900">
                  {selectedTable.name}
                </h3>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {selectedTable.description}
              </p>
            </div>
            <div className="text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              Total: {selectedTable.columns.length} Kolom
            </div>
          </div>

          {/* Column Structure Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/70 text-slate-600 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Kolom</th>
                  <th className="py-3 px-4">Tipe Data</th>
                  <th className="py-3 px-4">Atribut / Constraint</th>
                  <th className="py-3 px-4">Keterangan Fungsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedTable.columns.map((col) => (
                  <tr key={col.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        {col.name}
                        {col.isPrimary && (
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-sans">
                            <Key className="w-3 h-3" /> PK
                          </span>
                        )}
                        {col.isForeign && (
                          <span className="flex items-center gap-0.5 text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 font-sans">
                            <Link2 className="w-3 h-3" /> FK
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-indigo-700">
                      {col.type}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {col.references && (
                        <span className="text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded block mb-1">
                          ↳ {col.references}
                        </span>
                      )}
                      {col.isNullable ? (
                        <span className="text-slate-400">NULL</span>
                      ) : (
                        <span className="text-slate-700 font-medium">NOT NULL</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {col.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              Sesuai standar SQL ANSI & PostgreSQL 15+ dengan dukungan indexing otomatis.
            </span>
            <span className="font-mono text-slate-400">Storage Engine: Relational ACID</span>
          </div>
        </div>
      </div>
    </div>
  );
};
