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
  RotateCcw,
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
import { FilterSidebar, countActiveFilters } from './components/FilterSidebar';
import { SpellCard } from './components/SpellCard';
import { SpellDetailModal } from './components/SpellDetailModal';
import { SpellFormModal } from './components/SpellFormModal';
import { CsvImportModal } from './components/CsvImportModal';
import { ManageEntitiesModal } from './components/ManageEntitiesModal';
import { SchemaDocModal } from './components/SchemaDocModal';
import { SecurityPinModal } from './components/SecurityPinModal';
import { DbConnectionModal } from './components/DbConnectionModal';
import { SpellSelectionStudioModal } from './components/SpellSelectionStudioModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { GrimoireIcon } from './components/GrimoireIcon';
import { formatCirculo, getEscolaColor } from './utils/magicHelpers';
import { Printer, CheckSquare, Square } from 'lucide-react';

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
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Deck de Cartas Selecionadas para Impressão & Exportação
  const [selectedSpellsMap, setSelectedSpellsMap] = useState<Record<number, MagiaCompleta>>({});

  const selectedSpellsList = useMemo(() => {
    return Object.values(selectedSpellsMap);
  }, [selectedSpellsMap]);

  const toggleSelectSpell = useCallback((magia: MagiaCompleta) => {
    setSelectedSpellsMap((prev) => {
      const next = { ...prev };
      if (next[magia.id_magia]) {
        delete next[magia.id_magia];
      } else {
        next[magia.id_magia] = magia;
      }
      return next;
    });
  }, []);

  const handleSelectAllVisible = useCallback(() => {
    setSelectedSpellsMap((prev) => {
      const next = { ...prev };
      magias.forEach((m) => {
        next[m.id_magia] = m;
      });
      return next;
    });
  }, [magias]);

  const handleClearSelection = useCallback(() => {
    setSelectedSpellsMap({});
  }, []);

  const handleRemoveSpellFromDeck = useCallback((id_magia: number) => {
    setSelectedSpellsMap((prev) => {
      const next = { ...prev };
      delete next[id_magia];
      return next;
    });
  }, []);

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

  const activeFiltersCount = useMemo(() => countActiveFilters(filtros), [filtros]);

  // Lista de pills de filtros ativos para visualização e remoção direta
  const activePills = useMemo(() => {
    const pills: { id: string; label: string; onRemove: () => void }[] = [];

    if (filtros.busca) {
      pills.push({
        id: 'busca',
        label: `Busca: "${filtros.busca}"`,
        onRemove: () => setFiltros((prev) => ({ ...prev, busca: '' })),
      });
    }

    if (filtros.circulos && filtros.circulos.length > 0) {
      filtros.circulos.forEach((c) => {
        pills.push({
          id: `circulo-${c}`,
          label: formatCirculo(c),
          onRemove: () =>
            setFiltros((prev) => {
              const next = prev.circulos?.filter((x) => x !== c);
              return { ...prev, circulos: next && next.length > 0 ? next : undefined };
            }),
        });
      });
    }

    if (filtros.escolas && filtros.escolas.length > 0) {
      filtros.escolas.forEach((e) => {
        pills.push({
          id: `escola-${e}`,
          label: e,
          onRemove: () =>
            setFiltros((prev) => {
              const next = prev.escolas?.filter((x) => x !== e);
              return { ...prev, escolas: next && next.length > 0 ? next : undefined };
            }),
        });
      });
    }

    if (filtros.conjuradores_ids && filtros.conjuradores_ids.length > 0) {
      filtros.conjuradores_ids.forEach((id) => {
        const conj = metadata?.conjuradores.find((c) => c.id_conjurador === id);
        pills.push({
          id: `conj-${id}`,
          label: conj ? conj.classe : `Classe #${id}`,
          onRemove: () =>
            setFiltros((prev) => {
              const next = prev.conjuradores_ids?.filter((x) => x !== id);
              return { ...prev, conjuradores_ids: next && next.length > 0 ? next : undefined };
            }),
        });
      });
    }

    if (filtros.tipos_dano && filtros.tipos_dano.length > 0) {
      filtros.tipos_dano.forEach((td) => {
        pills.push({
          id: `dano-${td}`,
          label: td,
          onRemove: () =>
            setFiltros((prev) => {
              const next = prev.tipos_dano?.filter((x) => x !== td);
              return { ...prev, tipos_dano: next && next.length > 0 ? next : undefined };
            }),
        });
      });
    }

    if (filtros.livros_ids && filtros.livros_ids.length > 0) {
      filtros.livros_ids.forEach((id) => {
        const livro = metadata?.livros.find((l) => l.id_livro === id);
        pills.push({
          id: `livro-${id}`,
          label: livro ? livro.nome_livro : `Livro #${id}`,
          onRemove: () =>
            setFiltros((prev) => {
              const next = prev.livros_ids?.filter((x) => x !== id);
              return { ...prev, livros_ids: next && next.length > 0 ? next : undefined };
            }),
        });
      });
    }

    if (typeof filtros.concentracao === 'boolean') {
      pills.push({
        id: 'concentracao',
        label: filtros.concentracao ? 'Concentração: Sim' : 'Concentração: Não',
        onRemove: () => setFiltros((prev) => ({ ...prev, concentracao: undefined })),
      });
    }

    if (typeof filtros.salvaguarda === 'boolean') {
      pills.push({
        id: 'salvaguarda',
        label: filtros.salvaguarda ? 'Salvaguarda: Sim' : 'Salvaguarda: Não',
        onRemove: () => setFiltros((prev) => ({ ...prev, salvaguarda: undefined })),
      });
    }

    if (filtros.atributo_salvaguarda && filtros.atributo_salvaguarda !== 'todos') {
      pills.push({
        id: 'atributo_salvaguarda',
        label: `Resistência: ${filtros.atributo_salvaguarda}`,
        onRemove: () => setFiltros((prev) => ({ ...prev, atributo_salvaguarda: undefined })),
      });
    }

    if (typeof filtros.ataque === 'boolean') {
      pills.push({
        id: 'ataque',
        label: filtros.ataque ? 'Ataque: Sim' : 'Ataque: Não',
        onRemove: () => setFiltros((prev) => ({ ...prev, ataque: undefined })),
      });
    }

    if (filtros.forma && filtros.forma !== 'todos') {
      pills.push({
        id: 'forma',
        label: `Área: ${filtros.forma}`,
        onRemove: () => setFiltros((prev) => ({ ...prev, forma: undefined })),
      });
    }

    return pills;
  }, [filtros, metadata]);

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Navbar with integrated compact DB status */}
      <Navbar
        metadata={metadata}
        searchTerm={filtros.busca || ''}
        onSearchChange={(val) => setFiltros({ ...filtros, busca: val })}
        onOpenNewSpell={handleOpenNewSpell}
        onOpenImportCSV={() => setIsCsvImportOpen(true)}
        onOpenManageEntities={() => setIsManageEntitiesOpen(true)}
        onOpenDocSchema={() => setIsDocSchemaOpen(true)}
        onExportCSV={handleExportCSV}
        onOpenDbStatus={() => setIsDbModalOpen(true)}
        selectedCount={selectedSpellsList.length}
        onOpenStudio={() => setIsStudioOpen(true)}
      />

      {/* Main Layout: Left Sidebar + Content Area */}
      <div id="app-main-layout" className="flex-1 flex max-w-[1440px] w-full mx-auto">
        
        {/* Left Filter Sidebar (Sticky, Collapsible on Desktop, Slide-over on Mobile) */}
        <FilterSidebar
          filtros={filtros}
          metadata={metadata}
          onChangeFiltros={setFiltros}
          onResetFiltros={resetAllFilters}
          isOpenMobile={isFilterOpen}
          onCloseMobile={() => setIsFilterOpen(false)}
          totalResultados={magias.length}
        />

        {/* Center/Right Main Content Area */}
        <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-6 flex flex-col">
          
          {/* Top Controls Bar */}
          <div className="flex flex-col gap-2.5 mb-4">
            
            {/* Main Controls Row */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              
              {/* Left: Mobile Filter Button & Magias Count */}
              <div className="flex items-center gap-2">
                {/* Filter toggle button for mobile/tablet screens */}
                <button
                  id="btn-toggle-filters-mobile"
                  type="button"
                  onClick={() => setIsFilterOpen(true)}
                  className={`lg:hidden px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    activeFiltersCount > 0
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-xs'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Filtros</span>
                  {activeFiltersCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="font-bold text-slate-200">
                    {magias.length}
                  </span>
                  <span>{magias.length === 1 ? 'magia encontrada' : 'magias encontradas'}</span>
                </div>
              </div>

              {/* Right: Sort, View switcher & Refresh */}
              <div className="flex items-center gap-2 ml-auto">
                
                {/* Sort selector */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300">
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  <select
                    id="select-sort-magias"
                    value={`${filtros.sort_by}-${filtros.sort_order}`}
                    onChange={(e) => {
                      const [sort_by, sort_order] = e.target.value.split('-') as [any, any];
                      setFiltros({ ...filtros, sort_by, sort_order });
                    }}
                    className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs font-medium"
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
                <div className="flex bg-slate-900 border border-slate-800 rounded p-0.5">
                  <button
                    id="btn-view-grid"
                    onClick={() => setViewMode('grid')}
                    className={`p-1 rounded transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Visualização em Grade"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id="btn-view-table"
                    onClick={() => setViewMode('table')}
                    className={`p-1 rounded transition-colors ${
                      viewMode === 'table'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Visualização em Tabela"
                  >
                    <ListIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Refresh button */}
                <button
                  id="btn-refresh-magias"
                  onClick={() => {
                    loadMagias();
                    loadMetadata();
                  }}
                  className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title="Recarregar do banco"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
                </button>

              </div>

            </div>

            {/* Active Filter Pills Bar (Removable with 1 tap) */}
            {activePills.length > 0 && (
              <div
                id="active-filters-bar"
                className="flex flex-wrap items-center gap-1.5 pt-1 text-xs animate-in fade-in duration-150"
              >
                <span className="text-[11px] text-slate-500 font-medium mr-0.5">
                  Ativos:
                </span>
                {activePills.map((pill) => (
                  <span
                    key={pill.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-700/40 text-indigo-200 text-[11px] font-medium"
                  >
                    <span>{pill.label}</span>
                    <button
                      type="button"
                      onClick={pill.onRemove}
                      className="hover:text-white p-0.5 rounded-full hover:bg-indigo-800/50 transition-colors"
                      title="Remover filtro"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
                <button
                  id="btn-clear-all-pills"
                  type="button"
                  onClick={resetAllFilters}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium ml-1 flex items-center gap-1 hover:underline"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  Limpar todos
                </button>
              </div>
            )}

            {/* Selection & Print Deck Toolbar */}
            <div
              id="deck-selection-toolbar"
              className={`flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg border transition-all ${
                selectedSpellsList.length > 0
                  ? 'bg-indigo-950/40 border-indigo-500/40 shadow-sm'
                  : 'bg-slate-900/40 border-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Deck de Impressão:</span>
                </span>
                
                {selectedSpellsList.length > 0 ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                    {selectedSpellsList.length} {selectedSpellsList.length === 1 ? 'carta selecionada' : 'cartas selecionadas'}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">
                    Nenhuma carta selecionada
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-select-all-visible"
                  type="button"
                  onClick={handleSelectAllVisible}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1"
                  title="Selecionar todas as magias filtradas no deck"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Selecionar Visíveis ({magias.length})</span>
                </button>

                {selectedSpellsList.length > 0 && (
                  <button
                    id="btn-clear-selection-deck"
                    type="button"
                    onClick={handleClearSelection}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
                    title="Limpar seleção"
                  >
                    Limpar
                  </button>
                )}

                <button
                  id="btn-open-deck-studio-main"
                  type="button"
                  onClick={() => setIsStudioOpen(true)}
                  className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
                    selectedSpellsList.length > 0
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 ring-1 ring-indigo-400/40 animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title="Abrir Estúdio para Visualizar, Escolher Formatos (89x146mm ou 178x146mm), Imprimir ou Exportar PNG"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Estúdio de Cartas {selectedSpellsList.length > 0 ? `(${selectedSpellsList.length})` : ''}</span>
                </button>
              </div>
            </div>

          </div>

        {/* Spell Content Grid or Table */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-300">Consultando PostgreSQL 16...</p>
            <span className="text-xs text-slate-500">Buscando magias e relações</span>
          </div>
        ) : magias.length === 0 ? (
          <div
            id="empty-state-magias"
            className="py-16 px-6 text-center rounded-lg bg-slate-900/40 border border-dashed border-slate-800 max-w-md mx-auto my-8"
          >
            <div className="w-14 h-14 mx-auto mb-3.5 p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center shadow-lg">
              <GrimoireIcon className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold text-slate-200 mb-1">Nenhuma magia encontrada</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Tente ajustar os filtros ativos ou cadastre uma nova magia no grimório.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {activePills.length > 0 && (
                <button
                  id="btn-empty-clear-filters"
                  onClick={resetAllFilters}
                  className="px-3.5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Limpar Filtros
                </button>
              )}
              <button
                id="btn-empty-new-spell"
                onClick={handleOpenNewSpell}
                className="px-3.5 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Nova Magia
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div
            id="grid-spells"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-4.5"
          >
            {magias.map((magia) => (
              <SpellCard
                key={magia.id_magia}
                magia={magia}
                onView={setSelectedSpellForView}
                onEdit={handleOpenEditSpell}
                onDelete={handleDeleteSpell}
                isSelected={Boolean(selectedSpellsMap[magia.id_magia])}
                onToggleSelect={toggleSelectSpell}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div
            id="table-spells-container"
            className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/80 shadow-lg"
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      id="checkbox-table-select-all"
                      type="checkbox"
                      checked={magias.length > 0 && magias.every((m) => selectedSpellsMap[m.id_magia])}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleSelectAllVisible();
                        } else {
                          setSelectedSpellsMap((prev) => {
                            const next = { ...prev };
                            magias.forEach((m) => delete next[m.id_magia]);
                            return next;
                          });
                        }
                      }}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      title="Selecionar todas as visíveis"
                    />
                  </th>
                  <th className="py-3 px-3 sm:px-4">Nome & Círculo</th>
                  <th className="py-3 px-3 sm:px-4">Escola</th>
                  <th className="py-3 px-3 sm:px-4 hidden md:table-cell">Tempo</th>
                  <th className="py-3 px-3 sm:px-4 hidden md:table-cell">Alcance</th>
                  <th className="py-3 px-3 sm:px-4 hidden lg:table-cell">Duração</th>
                  <th className="py-3 px-3 sm:px-4 hidden sm:table-cell">Comp.</th>
                  <th className="py-3 px-3 sm:px-4">Conjuradores</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {magias.map((m) => {
                  const escolaColors = getEscolaColor(m.escola);
                  const isSelected = Boolean(selectedSpellsMap[m.id_magia]);
                  return (
                    <tr
                      key={m.id_magia}
                      className={`transition-colors group cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/30 hover:bg-indigo-950/50'
                          : 'hover:bg-slate-850/80'
                      }`}
                      onClick={() => setSelectedSpellForView(m)}
                    >
                      <td
                        className="py-2.5 px-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectSpell(m);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-3 sm:px-4">
                        <div className={`font-bold transition-colors ${isSelected ? 'text-indigo-300' : 'text-slate-100 group-hover:text-indigo-400'}`}>
                          {m.nome_magia}
                        </div>
                        <span className="text-[10px] text-indigo-400 font-semibold">
                          {formatCirculo(m.circulo)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${escolaColors.badge}`}
                        >
                          {m.escola}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-slate-300 hidden md:table-cell">{m.tempo}</td>
                      <td className="py-2.5 px-3 sm:px-4 text-slate-300 hidden md:table-cell">{m.alcance}</td>
                      <td className="py-2.5 px-3 sm:px-4 text-slate-300 hidden lg:table-cell">
                        {m.duracao}
                        {m.concentracao && (
                          <span className="ml-1 text-[10px] text-indigo-400 font-semibold block">
                            (Concentração)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 font-mono font-semibold text-slate-300 hidden sm:table-cell">
                        {[
                          m.componente_verbal ? 'V' : null,
                          m.componente_somatico ? 'S' : null,
                          m.componente_material ? 'M' : null,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {(m.conjuradores || []).slice(0, 2).map((c) => (
                            <span
                              key={c.id_conjurador}
                              className="text-[10px] px-1 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium"
                            >
                              {c.classe}
                            </span>
                          ))}
                          {(m.conjuradores || []).length > 2 && (
                            <span className="text-[10px] px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                              +{(m.conjuradores || []).length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        className="py-2.5 px-3 sm:px-4 text-right space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleOpenEditSpell(m)}
                          className="px-2 py-1 rounded text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors text-[11px]"
                          title="Editar magia"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteSpell(m)}
                          className="px-2 py-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors text-[11px]"
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
        isSelected={Boolean(selectedSpellForView && selectedSpellsMap[selectedSpellForView.id_magia])}
        onToggleSelect={toggleSelectSpell}
        onOpenStudio={() => setIsStudioOpen(true)}
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

      {/* 6. Modal de Conexão e Diagnóstico do Banco de Dados PostgreSQL */}
      <DbConnectionModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        status={metadata?.statusConexao || null}
        onRefreshStatus={async () => {
          await loadMetadata();
          await loadMagias();
          addToast('info', 'Status Atualizado', 'Verificação de conexão com o banco realizada.');
        }}
      />

      {/* 7. Modal de Estúdio de Seleção de Cartas & Impressão / Exportação PNG */}
      <SpellSelectionStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        selectedSpells={selectedSpellsList}
        onRemoveSpell={handleRemoveSpellFromDeck}
        onClearAll={handleClearSelection}
      />

      {/* 8. Modal da Trava de Segurança (PIN 1998) */}
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
        actionDescription="Para apagar esta magia do banco de dados, digite a senha de segurança autorizada."
      />

      {/* Floating Action Button (FAB) when cards are selected */}
      {selectedSpellsList.length > 0 && !isStudioOpen && (
        <div
          id="btn-open-selection-deck-floating"
          className="fixed bottom-5 right-5 z-40 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <button
            type="button"
            onClick={() => setIsStudioOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/40 border border-indigo-400/40 transition-all hover:scale-105 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Deck de Cartas ({selectedSpellsList.length})</span>
          </button>
        </div>
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

    </div>
  );
}
