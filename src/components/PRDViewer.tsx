import React, { useState } from 'react';
import { prdSections, prdDocumentMeta, sqlDdlScript } from '../data/prdDocument';
import { ERDVisualizer } from './ERDVisualizer';
import {
  FileText,
  Database,
  Code2,
  Copy,
  Check,
  Download,
  BookOpen,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Cpu
} from 'lucide-react';

export const PRDViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DOCUMENT' | 'ERD' | 'SQL_DDL'>('DOCUMENT');
  const [activeSectionId, setActiveSectionId] = useState<string>(prdSections[0].id);
  const [copiedSql, setCopiedSql] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlDdlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    let md = `# ${prdDocumentMeta.title}\n`;
    md += `## ${prdDocumentMeta.systemName}\n`;
    md += `*Versi: ${prdDocumentMeta.documentVersion} | Analis: ${prdDocumentMeta.author} | Status: ${prdDocumentMeta.status}*\n\n`;
    md += `---\n\n`;

    prdSections.forEach((sec) => {
      md += `## ${sec.number} ${sec.title}\n`;
      if (sec.subtitle) md += `*${sec.subtitle}*\n\n`;
      md += `${sec.content}\n\n`;
    });

    md += `## 8.0 Lampiran Skrip SQL DDL Database Relasional\n\`\`\`sql\n${sqlDdlScript}\n\`\`\`\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PRD_Sistem_Informasi_Absensi_${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([sqlDdlScript], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `schema_absensi_presensihub_${new Date().toISOString().split('T')[0]}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeSection = prdSections.find(s => s.id === activeSectionId) || prdSections[0];

  const filteredSections = searchQuery
    ? prdSections.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : prdSections;

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Tabs */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-full text-xs font-medium">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>System Analyst Deliverable Specification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {prdDocumentMeta.title}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              {prdDocumentMeta.systemName} — Spesifikasi arsitektur menyeluruh mencakup RBAC Multi-Role (Admin, HRD, Karyawan, Manajemen), Mobile Fast Response, dan Skema Database Relasional 3NF.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
              <span className="bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                Versi: <strong className="text-amber-300 font-mono">{prdDocumentMeta.documentVersion}</strong>
              </span>
              <span className="bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                Penyusun: <strong className="text-white">{prdDocumentMeta.author}</strong>
              </span>
              <span className="bg-emerald-900/60 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-700/50 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {prdDocumentMeta.status}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={handleDownloadMarkdown}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PRD (.md)</span>
            </button>
            <button
              onClick={handleDownloadSql}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Download DDL (.sql)</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-800 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('DOCUMENT')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'DOCUMENT'
                ? 'bg-white text-slate-900 shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Dokumen PRD Lengkap (Analisis Sistem)</span>
          </button>
          <button
            onClick={() => setActiveTab('ERD')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'ERD'
                ? 'bg-white text-slate-900 shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Arsitektur ERD & Kamus Data</span>
          </button>
          <button
            onClick={() => setActiveTab('SQL_DDL')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'SQL_DDL'
                ? 'bg-white text-slate-900 shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Skrip SQL DDL (PostgreSQL Schema)</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'DOCUMENT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Table of Contents Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4 sticky top-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Daftar Isi PRD
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {prdSections.length} Bagian
              </span>
            </div>

            {/* Quick search in sections */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari bagian / istilah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <nav className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredSections.map((sec) => {
                const isCurrent = sec.id === activeSectionId;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all flex items-start gap-2 ${
                      isCurrent
                        ? 'bg-indigo-50 text-indigo-900 font-semibold border-l-3 border-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="font-mono text-indigo-600 shrink-0 text-[11px]">
                      {sec.number}
                    </span>
                    <span className="line-clamp-2 leading-relaxed">
                      {sec.title}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                Kompatibilitas Smartphone
              </div>
              <p className="text-slate-500 leading-snug">
                Semua use case dirancang mobile-first: Fast Tap check-in &lt; 5 detik, geofence radius test, dan responsive print template.
              </p>
            </div>
          </div>

          {/* Section Detail Reader */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-200 pb-5">
              <div className="text-xs font-mono font-bold text-indigo-600 mb-1">
                SECTION {activeSection.number}
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                {activeSection.title}
              </h2>
              {activeSection.subtitle && (
                <p className="text-sm text-slate-500 mt-1 italic">
                  {activeSection.subtitle}
                </p>
              )}
            </div>

            {/* Render Content Markdown / Structured View */}
            <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-4">
              {activeSection.content.split('\n\n').map((paragraph, idx) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;

                // Simple table parsing
                if (trimmed.startsWith('|')) {
                  const rows = trimmed.split('\n').filter(r => r.trim().startsWith('|'));
                  const headerRow = rows[0].split('|').map(c => c.trim()).filter(Boolean);
                  const dataRows = rows.slice(2); // Skip header and separator

                  return (
                    <div key={idx} className="overflow-x-auto my-4 border border-slate-200 rounded-lg shadow-2xs">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 font-semibold text-slate-700">
                          <tr>
                            {headerRow.map((h, hi) => (
                              <th key={hi} className="p-2.5 border-b border-slate-200">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {dataRows.map((dr, dri) => {
                            const cells = dr.split('|').map(c => c.trim()).filter(Boolean);
                            return (
                              <tr key={dri} className="hover:bg-slate-50">
                                {cells.map((cell, ci) => (
                                  <td key={ci} className="p-2.5 text-slate-700">{cell}</td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                if (trimmed.startsWith('###')) {
                  return (
                    <h3 key={idx} className="text-base font-bold text-slate-900 pt-3 border-t border-slate-100">
                      {trimmed.replace('###', '').trim()}
                    </h3>
                  );
                }

                if (trimmed.startsWith('*') || trimmed.startsWith('1.')) {
                  const listItems = trimmed.split('\n');
                  return (
                    <ul key={idx} className="space-y-1.5 list-disc pl-5 my-2">
                      {listItems.map((li, liIndex) => {
                        const cleanLi = li.replace(/^[\*\-\d\.]+\s*/, '').trim();
                        return (
                          <li key={liIndex} className="text-slate-700 leading-relaxed">
                            {cleanLi}
                          </li>
                        );
                      })}
                    </ul>
                  );
                }

                return (
                  <p key={idx} className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {trimmed}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ERD Tab */}
      {activeTab === 'ERD' && <ERDVisualizer />}

      {/* SQL DDL Tab */}
      {activeTab === 'SQL_DDL' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                <Code2 className="w-4 h-4" />
                <span>Production-Ready Relational DDL Script (PostgreSQL / Relasional)</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Skema Database Relasional Terstruktur (10 Tabel Terhubung)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Memenuhi kaidah Third Normal Form (3NF), Foreign Keys, Check Constraints, dan Indeks Performa.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySql}
                className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin SQL DDL</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadSql}
                className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .sql</span>
              </button>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 font-mono text-xs leading-relaxed text-slate-200 p-5 overflow-x-auto max-h-[600px]">
            <pre>
              <code>{sqlDdlScript}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
