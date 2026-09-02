import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown, FileCode, BookOpen, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ExportDropdownProps {
  label?: string;
  totalCount: number;
  filteredCount: number;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onExportExcel?: () => void;
  onExportDoc?: () => void;
  onExportJSON?: () => void;
  entityName?: string;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  label = 'Export Data',
  totalCount,
  filteredCount,
  onExportCSV,
  onExportPDF,
  onExportExcel,
  onExportDoc,
  onExportJSON,
  entityName = 'Records'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addToast } = useApp();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (format: string, callback?: () => void) => {
    if (!callback) return;
    setIsExporting(format);
    setIsOpen(false);
    try {
      callback();
      addToast(
        `${format.toUpperCase()} Export Generated`,
        `Exported ${filteredCount} ${entityName.toLowerCase()} to ${format.toUpperCase()} format.`,
        'success'
      );
    } catch (err) {
      addToast('Export Failed', `An error occurred while generating ${format}.`, 'error');
    } finally {
      setTimeout(() => setIsExporting(null), 800);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        id={`export-dropdown-trigger-${entityName.toLowerCase().replace(/\s+/g, '-')}`}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting !== null}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
        title={`Export ${filteredCount} filtered ${entityName}`}
      >
        <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span>{isExporting ? `Exporting ${isExporting.toUpperCase()}...` : label}</span>
        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono px-1.5 py-0.2 rounded">
          {filteredCount}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-72 origin-top-right rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>Export {entityName}</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold">Multi-Format</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Includes {filteredCount} matching records ({filteredCount === totalCount ? 'All' : 'Filtered'})
            </div>
          </div>

          <div className="space-y-1">
            {/* PDF */}
            <button
              id={`export-pdf-${entityName.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => handleExport('pdf', onExportPDF)}
              className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer group"
            >
              <div className="p-1.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/60 transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Executive PDF Report</span>
                  <span className="text-[9px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-1 py-0.2 rounded font-mono font-bold">.PDF</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Visual SOC landscape report with branding & styling
                </div>
              </div>
            </button>

            {/* Document (Word) */}
            {onExportDoc && (
              <button
                id={`export-doc-${entityName.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => handleExport('doc', onExportDoc)}
                className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer group"
              >
                <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 transition-colors">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>Document Report (Word)</span>
                    <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1 py-0.2 rounded font-mono font-bold">.DOC</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Editable executive briefing with sign-off & recommendations
                  </div>
                </div>
              </button>
            )}

            {/* Excel */}
            {onExportExcel && (
              <button
                id={`export-excel-${entityName.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => handleExport('excel', onExportExcel)}
                className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer group"
              >
                <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 transition-colors">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>Excel Workbook</span>
                    <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1 py-0.2 rounded font-mono font-bold">.XLS</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Structured styled workbook with headers & data grids
                  </div>
                </div>
              </button>
            )}

            {/* CSV */}
            <button
              id={`export-csv-${entityName.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => handleExport('csv', onExportCSV)}
              className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer group"
            >
              <div className="p-1.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/60 transition-colors">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>CSV Spreadsheet</span>
                  <span className="text-[9px] bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-1 py-0.2 rounded font-mono font-bold">.CSV</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  RFC-4180 standard raw data for ingestion & scripts
                </div>
              </div>
            </button>

            {/* JSON */}
            {onExportJSON && (
              <button
                id={`export-json-${entityName.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => handleExport('json', onExportJSON)}
                className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer group"
              >
                <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/60 transition-colors">
                  <FileCode className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>Structured JSON</span>
                    <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-1 py-0.2 rounded font-mono font-bold">.JSON</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Machine-readable telemetry payload for SIEM APIs
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

