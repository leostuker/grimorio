import React from 'react';
import {
  BookOpen,
  Plus,
  Upload,
  Database,
  FileSpreadsheet,
  HelpCircle,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react';
import { MetadataBanco } from '../types';

interface NavbarProps {
  metadata: MetadataBanco | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenNewSpell: () => void;
  onOpenImportCSV: () => void;
  onOpenManageEntities: () => void;
  onOpenDocSchema: () => void;
  onExportCSV: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  metadata,
  searchTerm,
  onSearchChange,
  onOpenNewSpell,
  onOpenImportCSV,
  onOpenManageEntities,
  onOpenDocSchema,
  onExportCSV,
}) => {
  return (
    <header id="main-navbar" className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 font-bold">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-slate-100 uppercase">Grimório</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                D&D 5e
              </span>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="navbar-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar magia por nome ou descrição..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-nav-manage-entities"
              onClick={onOpenManageEntities}
              className="p-2 sm:px-3 sm:py-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Gerenciar Classes e Livros"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span className="hidden lg:inline">Conjuradores & Livros</span>
            </button>

            <button
              id="btn-nav-import-csv"
              onClick={onOpenImportCSV}
              className="p-2 sm:px-3 sm:py-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Importar Arquivo CSV"
            >
              <Upload className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline">Importar CSV</span>
            </button>

            <button
              id="btn-nav-export-csv"
              onClick={onExportCSV}
              className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 text-xs font-medium transition-colors"
              title="Exportar Magias em CSV"
            >
              <Download className="w-4 h-4 text-slate-400" />
            </button>

            <button
              id="btn-nav-new-spell"
              onClick={onOpenNewSpell}
              className="px-3.5 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nova Magia</span>
            </button>

            <button
              id="btn-nav-doc-schema"
              onClick={onOpenDocSchema}
              className="p-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
              title="Documentação do Schema e CSV"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
