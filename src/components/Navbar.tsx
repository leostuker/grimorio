import React, { useState } from 'react';
import {
  Plus,
  Upload,
  HelpCircle,
  Users,
  Search,
  Download,
  MoreVertical,
  X,
} from 'lucide-react';
import { MetadataBanco } from '../types';
import { GrimoireIcon } from './GrimoireIcon';

interface NavbarProps {
  metadata: MetadataBanco | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenNewSpell: () => void;
  onOpenImportCSV: () => void;
  onOpenManageEntities: () => void;
  onOpenDocSchema: () => void;
  onExportCSV: () => void;
  onOpenDbStatus?: () => void;
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
  onOpenDbStatus,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const isPostgres = metadata?.statusConexao?.modo === 'postgres';

  return (
    <header id="main-navbar" className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-13 gap-2 sm:gap-4">
          
          {/* Logo with Grimoire Icon & Compact Connection Pill */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="p-1.5 rounded-lg bg-indigo-950/50 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <GrimoireIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-indigo-400" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-wider text-slate-100 uppercase">
                Grimório
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                5e
              </span>
            </div>

            {/* Compact Connection Status Pill (Clean, without occupying a full banner row) */}
            {metadata?.statusConexao && (
              <button
                id="btn-nav-db-status"
                type="button"
                onClick={onOpenDbStatus}
                className={`ml-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                  isPostgres
                    ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50'
                    : 'bg-amber-950/60 border-amber-500/30 text-amber-300 hover:bg-amber-900/50'
                }`}
                title={
                  isPostgres
                    ? 'PostgreSQL 16 Conectado. Clique para ver detalhes da conexão.'
                    : 'Operando em Memória Local. Clique para ver status do banco.'
                }
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isPostgres ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="hidden sm:inline">
                  {isPostgres ? 'PostgreSQL' : 'Memória'}
                </span>
                <span className="sm:hidden">
                  {isPostgres ? 'Online' : 'Offline'}
                </span>
              </button>
            )}
          </div>

          {/* Search Input (Desktop / Tablet) */}
          <div className="flex-1 max-w-sm lg:max-w-md hidden sm:block">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="navbar-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar magia por nome, descrição..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile Search Toggle */}
            <button
              id="btn-mobile-search-toggle"
              type="button"
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              className={`p-1.5 rounded sm:hidden text-slate-300 transition-colors ${
                mobileSearchOpen ? 'bg-indigo-600 text-white' : 'bg-slate-900 hover:bg-slate-800'
              }`}
              title="Buscar magias"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Manage entities */}
            <button
              id="btn-nav-manage-entities"
              onClick={onOpenManageEntities}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 text-xs font-medium transition-colors"
              title="Gerenciar Classes e Livros"
            >
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Classes & Livros</span>
            </button>

            {/* Import CSV */}
            <button
              id="btn-nav-import-csv"
              onClick={onOpenImportCSV}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 text-xs font-medium transition-colors"
              title="Importar Arquivo CSV"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Importar CSV</span>
            </button>

            {/* Export CSV */}
            <button
              id="btn-nav-export-csv"
              onClick={onExportCSV}
              className="hidden md:flex p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 text-xs font-medium transition-colors"
              title="Exportar Magias em CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Primary Action: Nova Magia */}
            <button
              id="btn-nav-new-spell"
              onClick={onOpenNewSpell}
              className="px-2.5 sm:px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden xs:inline">Nova Magia</span>
              <span className="xs:hidden">Nova</span>
            </button>

            {/* Doc Schema (Desktop) */}
            <button
              id="btn-nav-doc-schema"
              onClick={onOpenDocSchema}
              className="hidden md:flex p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
              title="Documentação do Schema e CSV"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Mobile More Options Menu Toggle */}
            <div className="relative md:hidden">
              <button
                id="btn-mobile-more-menu"
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                title="Mais opções"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {mobileMenuOpen && (
                <div
                  id="mobile-dropdown-menu"
                  className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-md shadow-2xl py-1 text-xs text-slate-200 z-50 animate-in fade-in"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <button
                    type="button"
                    onClick={onOpenManageEntities}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Classes & Livros</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenImportCSV}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Importar CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={onExportCSV}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Exportar CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenDocSchema}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 border-t border-slate-800/80 text-slate-400 hover:text-indigo-300"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Documentação</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Search Row (Expandable) */}
        {mobileSearchOpen && (
          <div className="pb-2.5 pt-1 sm:hidden animate-in fade-in">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="navbar-mobile-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar magia por nome, descrição..."
                autoFocus
                className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-indigo-500/50 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
