import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
  Filter,
  Plus,
  BookOpen,
  Database,
  RefreshCw,
  Search,
  X,
  Shield,
  Layers,
  Upload,
} from 'lucide-react';
import {
  MagiaCompleta,
  MagiaPayload,
  MetadataBanco,
  FiltrosMagia,
  ResultadoImportacaoCSV,
} from './types';
import {
  fetchMetadata,
  fetchMagias,
  createMagiaAPI,
  updateMagiaAPI,
  deleteMagiaAPI,
  getSessionPin,
  setSessionPin,
} from './services/api';
import { Navbar } from './components/Navbar';
import { FilterSidebar } from './components/FilterSidebar';
import { SpellCard } from './components/SpellCard';
import { SpellDetailModal } from './components/SpellDetailModal';
import { SpellFormModal } from './components/SpellFormModal';
import { CsvImportModal } from './components/CsvImportModal';
import { ManageEntitiesModal } from './components/ManageEntitiesModal';
import { SchemaDocModal } from './components/SchemaDocModal';
import { SecurityPinModal } from './components/SecurityPinModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { formatCirculo, getEscolaColor } from './utils/magicHelpers';

export default function App() {
  // Estado de Dados
  const [metadata, setMetadata] = useState<MetadataBanco | null>(null);
  const [magias, setMagias] = useState<MagiaCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filtros
  const [filtros, setFiltros] = useState<FiltrosMagia>({
    busca: '',
    sort_by: 'nome_magia',
    sort_order: 'asc',
  });

  // Modais
  const [selectedSpellForView, setSelectedSpellForView] = useState<MagiaCompleta | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSpell, setEditingSpell] = useState<MagiaCompleta | null>(null);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [isManageEntitiesOpen, setIsManageEntitiesOpen] = useState(false);
  const [isDocSchemaOpen, setIsDocSchemaOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Trava de Segurança Modal
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'create' | 'edit' | 'delete' | 'import';
    target?: MagiaCompleta;
    payload?: MagiaPayload;
  } | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Carregar Metadados
  const loadMetadata = useCallback(async () => {
    try {
      const data = await fetchMetadata();
      setMetadata(data);
    } catch (err: any) {
      console.error('Erro ao carregar metadados:', err);
    }
  }, []);

  // Carregar Magias
  const loadMagias = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMagias(filtros);
      setMagias(data);
    } catch (err: any) {
      addToast('error', 'Falha ao buscar magias', err?.message);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);

  useEffect(() => {
    loadMagias();
  }, [loadMagias]);

  // Ações Administrativas com Trava de Segurança (PIN "1998")
  const handleOpenNewSpell = () => {
    setEditingSpell(null);
    setIsFormOpen(true);
  };

  const handleOpenEditSpell = (magia: MagiaCompleta) => {
    setSelectedSpellForView(null);
    setEditingSpell(magia);
    setIsFormOpen(true);
  };

  const handleOpenDuplicateSpell = (magia: MagiaCompleta) => {
    setSelectedSpellForView(null);
    setEditingSpell({
      ...magia,
      id_magia: 0,
      nome_magia: `${magia.nome_magia} (Cópia)`,
    });
    setIsFormOpen(true);
  };

  const handleDeleteSpell = (magia: MagiaCompleta) => {
    const currentPin = getSessionPin();
    if (currentPin === '1998') {
      executeDeleteSpell(magia, currentPin);
    } else {
      setPendingAction({ type: 'delete', target: magia });
      setIsPinModalOpen(true);
    }
  };

  const executeDeleteSpell = async (magia: MagiaCompleta, pin: string) => {
    try {
      await deleteMagiaAPI(magia.id_magia, pin);
      addToast('success', 'Magia apagada', `A magia "${magia.nome_magia}" foi removida com sucesso.`);
      setSelectedSpellForView(null);
      loadMagias();
      loadMetadata();
    } catch (err: any) {
      addToast('error', 'Erro ao apagar magia', err?.message);
    }
  };

  const handleFormSubmit = async (payload: MagiaPayload, pin: string) => {
    if (editingSpell && editingSpell.id_magia > 0) {
      // Atualizar
      await updateMagiaAPI(editingSpell.id_magia, payload, pin);
      addToast('success', 'Magia atualizada', `"${payload.nome_magia}" atualizada com sucesso no banco.`);
    } else {
      // Criar
      await createMagiaAPI(payload, pin);
      addToast('success', 'Magia cadastrada', `"${payload.nome_magia}" cadastrada com sucesso no banco.`);
    }
    loadMagias();
    loadMetadata();
  };

  const handlePinSuccess = (pin: string) => {
    if (pendingAction) {
      if (pendingAction.type === 'delete' && pendingAction.target) {
        executeDeleteSpell(pendingAction.target, pin);
      }
      setPendingAction(null);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/magias/export-csv', '_blank');
  };

  const resetAllFilters = () => {
    setFiltros({
      busca: '',
      sort_by: 'nome_magia',
      sort_order: 'asc',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        metadata={metadata}
        searchTerm={filtros.busca || ''}
        onSearchChange={(val) => setFiltros({ ...filtros, busca: val })}
        onOpenNewSpell={handleOpenNewSpell}
        onOpenImportCSV={() => setIsCsvImportOpen(true)}
        onOpenManageEntities={() => setIsManageEntitiesOpen(true)}
        onOpenDocSchema={() => setIsDocSchemaOpen(true)}
        onExportCSV={handleExportCSV}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Left Filter Sidebar */}
        <FilterSidebar
          filtros={filtros}
          metadata={metadata}
          onChangeFiltros={setFiltros}
          onResetFiltros={resetAllFilters}
          isOpenMobile={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
          totalResultados={magias.length}
        />

        {/* Center/Right Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            
            {/* Left summary & mobile filter trigger */}
            <div className="flex items-center gap-3">
              <button
                id="btn-open-filter-mobile"
                onClick={() => setIsMobileFilterOpen(true)}
                className="md:hidden px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400 flex items-center gap-1.5 shadow-sm"
              >
                <Filter className="w-4 h-4" />
                Filtros ({magias.length})
              </button>

              <div>
                <h1 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                  <span>Grimório de Magias</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-amber-400">
                    {magias.length} {magias.length === 1 ? 'magia' : 'magias'}
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Gerenciamento relacional integrado ao PostgreSQL 16
                </p>
              </div>
            </div>

            {/* Right sorting & view switcher */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              
              {/* Sort selector */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  id="select-sort-magias"
                  value={`${filtros.sort_by}-${filtros.sort_order}`}
                  onChange={(e) => {
                    const [sort_by, sort_order] = e.target.value.split('-') as [any, any];
                    setFiltros({ ...filtros, sort_by, sort_order });
                  }}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="nome_magia-asc" className="bg-slate-900">Nome (A - Z)</option>
                  <option value="nome_magia-desc" className="bg-slate-900">Nome (Z - A)</option>
                  <option value="circulo-asc" className="bg-slate-900">Círculo (Crescente)</option>
                  <option value="circulo-desc" className="bg-slate-900">Círculo (Decrescente)</option>
                  <option value="escola-asc" className="bg-slate-900">Escola (A - Z)</option>
                  <option value="id_magia-desc" className="bg-slate-900">Recentes primeiro</option>
                </select>
              </div>

              {/* View Switcher */}
              <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
                <button
                  id="btn-view-grid"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Visualização em Grade"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  id="btn-view-table"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'table'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Visualização em Tabela"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh button */}
              <button
                id="btn-refresh-magias"
                onClick={() => {
                  loadMagias();
                  loadMetadata();
                }}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Recarregar do banco"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
              </button>

            </div>

          </div>

          {/* Spell Content Grid or Table */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-300">Consultando PostgreSQL 16...</p>
              <span className="text-xs text-slate-500">Filtrando magias e cruzando tabelas de junção</span>
            </div>
          ) : magias.length === 0 ? (
            <div
              id="empty-state-magias"
              className="py-16 px-6 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 max-w-lg mx-auto"
            >
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-200 mb-1">Nenhuma magia encontrada</h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Tente ajustar os filtros avançados ou cadastre uma nova magia no banco de dados.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  id="btn-empty-clear-filters"
                  onClick={resetAllFilters}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Limpar Filtros
                </button>
                <button
                  id="btn-empty-new-spell"
                  onClick={handleOpenNewSpell}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" /> Cadastrar Nova Magia
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div
              id="grid-spells"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              {magias.map((magia) => (
                <SpellCard
                  key={magia.id_magia}
                  magia={magia}
                  onView={setSelectedSpellForView}
                  onEdit={handleOpenEditSpell}
                  onDelete={handleDeleteSpell}
                />
              ))}
            </div>
          ) : (
            /* Table View */
            <div
              id="table-spells-container"
              className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg"
            >
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Nome & Círculo</th>
                    <th className="py-3.5 px-4">Escola</th>
                    <th className="py-3.5 px-4">Tempo</th>
                    <th className="py-3.5 px-4">Alcance</th>
                    <th className="py-3.5 px-4">Duração</th>
                    <th className="py-3.5 px-4">Comp.</th>
                    <th className="py-3.5 px-4">Conjuradores</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {magias.map((m) => {
                    const escolaColors = getEscolaColor(m.escola);
                    return (
                      <tr
                        key={m.id_magia}
                        className="hover:bg-slate-850/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedSpellForView(m)}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                            {m.nome_magia}
                          </div>
                          <span className="text-[11px] text-amber-400 font-semibold">
                            {formatCirculo(m.circulo)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${escolaColors.badge}`}
                          >
                            {m.escola}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{m.tempo}</td>
                        <td className="py-3 px-4 text-slate-300">{m.alcance}</td>
                        <td className="py-3 px-4 text-slate-300">
                          {m.duracao}
                          {m.concentracao && (
                            <span className="ml-1 text-[10px] text-amber-400 font-semibold block">
                              (Concentração)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-300">
                          {[
                            m.componente_verbal ? 'V' : null,
                            m.componente_somatico ? 'S' : null,
                            m.componente_material ? 'M' : null,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {(m.conjuradores || []).slice(0, 2).map((c) => (
                              <span
                                key={c.id_conjurador}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium"
                              >
                                {c.classe}
                              </span>
                            ))}
                            {(m.conjuradores || []).length > 2 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                                +{(m.conjuradores || []).length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td
                          className="py-3 px-4 text-right space-x-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleOpenEditSpell(m)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                            title="Editar magia"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteSpell(m)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Apagar magia"
                          >
                            Apagar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </main>
      </div>

      {/* Modais do Sistema */}
      
      {/* 1. Modal de Detalhes da Magia */}
      <SpellDetailModal
        magia={selectedSpellForView}
        isOpen={Boolean(selectedSpellForView)}
        onClose={() => setSelectedSpellForView(null)}
        onEdit={handleOpenEditSpell}
        onDelete={handleDeleteSpell}
        onDuplicate={handleOpenDuplicateSpell}
      />

      {/* 2. Modal de Formulário (Criar/Editar) */}
      <SpellFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingSpell}
        metadata={metadata}
        isEditing={Boolean(editingSpell && editingSpell.id_magia > 0)}
      />

      {/* 3. Modal de Importação CSV */}
      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onSuccess={(res) => {
          addToast(
            'success',
            'Importação CSV Concluída',
            `${res.importadas} magias foram inseridas com sucesso no banco.`
          );
          loadMagias();
          loadMetadata();
        }}
      />

      {/* 4. Modal de Gerenciamento de Entidades (Conjuradores e Livros) */}
      <ManageEntitiesModal
        isOpen={isManageEntitiesOpen}
        onClose={() => setIsManageEntitiesOpen(false)}
        metadata={metadata}
        onEntityCreated={() => {
          loadMetadata();
          loadMagias();
        }}
      />

      {/* 5. Modal de Documentação do Schema & Deploy */}
      <SchemaDocModal
        isOpen={isDocSchemaOpen}
        onClose={() => setIsDocSchemaOpen(false)}
      />

      {/* 6. Modal da Trava de Segurança (PIN 1998) */}
      <SecurityPinModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={handlePinSuccess}
        actionTitle={
          pendingAction?.type === 'delete'
            ? `Apagar Magia "${pendingAction.target?.nome_magia}"`
            : 'Autorização Administrativa'
        }
        actionDescription="Para apagar esta magia do banco de dados, digite a senha de segurança configurada (1998)."
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

    </div>
  );
}
