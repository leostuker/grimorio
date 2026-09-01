import React, { useState } from 'react';
import {
  Filter,
  X,
  RotateCcw,
  Sparkles,
  Flame,
  Shield,
  Book,
  Users,
  Swords,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCheck,
} from 'lucide-react';
import {
  FiltrosMagia,
  MetadataBanco,
  Escola,
  TipoDano,
  Atributo,
  Forma,
  ESCOLAS,
  TIPOS_DANO,
  ATRIBUTOS,
  FORMAS,
} from '../types';
import { formatCirculo, getEscolaColor, getTipoDanoBadgeClass } from '../utils/magicHelpers';

interface FilterSidebarProps {
  filtros: FiltrosMagia;
  metadata: MetadataBanco | null;
  onChangeFiltros: (novosFiltros: FiltrosMagia) => void;
  onResetFiltros: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  totalResultados: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filtros,
  metadata,
  onChangeFiltros,
  onResetFiltros,
  isOpenMobile,
  onCloseMobile,
  totalResultados,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    circulo: true,
    escola: true,
    conjuradores: true,
    dano: true,
    livros: false,
    componentes: false,
    regras: false,
    formas: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters =
    Boolean(filtros.busca) ||
    (filtros.circulos && filtros.circulos.length > 0) ||
    (filtros.escolas && filtros.escolas.length > 0) ||
    (filtros.conjuradores_ids && filtros.conjuradores_ids.length > 0) ||
    (filtros.tipos_dano && filtros.tipos_dano.length > 0) ||
    (filtros.livros_ids && filtros.livros_ids.length > 0) ||
    typeof filtros.concentracao === 'boolean' ||
    typeof filtros.salvaguarda === 'boolean' ||
    Boolean(filtros.atributo_salvaguarda && filtros.atributo_salvaguarda !== 'todos') ||
    typeof filtros.ataque === 'boolean' ||
    typeof filtros.componente_verbal === 'boolean' ||
    typeof filtros.componente_somatico === 'boolean' ||
    typeof filtros.componente_material === 'boolean' ||
    typeof filtros.consumo_material === 'boolean' ||
    Boolean(filtros.forma && filtros.forma !== 'todos');

  // Handlers para toggles de arrays
  const toggleCirculo = (c: number) => {
    const current = filtros.circulos || [];
    const next = current.includes(c) ? current.filter((x) => x !== c) : [...current, c];
    onChangeFiltros({ ...filtros, circulos: next.length ? next : undefined });
  };

  const toggleEscola = (e: Escola) => {
    const current = filtros.escolas || [];
    const next = current.includes(e) ? current.filter((x) => x !== e) : [...current, e];
    onChangeFiltros({ ...filtros, escolas: next.length ? next : undefined });
  };

  const toggleConjurador = (id: number) => {
    const current = filtros.conjuradores_ids || [];
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    onChangeFiltros({ ...filtros, conjuradores_ids: next.length ? next : undefined });
  };

  const toggleTipoDano = (td: TipoDano) => {
    const current = filtros.tipos_dano || [];
    const next = current.includes(td) ? current.filter((x) => x !== td) : [...current, td];
    onChangeFiltros({ ...filtros, tipos_dano: next.length ? next : undefined });
  };

  // Botão "Qualquer" / Selecionar Todos os Danos
  const todosDanosSelecionados =
    filtros.tipos_dano &&
    filtros.tipos_dano.length === TIPOS_DANO.length;

  const toggleTodosDanos = () => {
    if (todosDanosSelecionados) {
      // Se todos estão selecionados, limpa o filtro de dano
      onChangeFiltros({ ...filtros, tipos_dano: undefined });
    } else {
      // Seleciona todos os 13 tipos de dano
      onChangeFiltros({ ...filtros, tipos_dano: [...TIPOS_DANO] });
    }
  };

  const toggleLivro = (id: number) => {
    const current = filtros.livros_ids || [];
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    onChangeFiltros({ ...filtros, livros_ids: next.length ? next : undefined });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Filtros Avançados</h2>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-semibold text-indigo-400 border border-slate-700">
            {totalResultados}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              id="btn-clear-filters"
              onClick={onResetFiltros}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium hover:underline transition-all"
              title="Limpar todos os filtros"
            >
              <RotateCcw className="w-3 h-3" />
              Limpar
            </button>
          )}
          {isOpenMobile && (
            <button
              id="btn-close-filter-mobile"
              onClick={onCloseMobile}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-sm">
        
        {/* 1. Círculo */}
        <div className="border-b border-slate-800/80 pb-4">
          <button
            onClick={() => toggleSection('circulo')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Círculo de Magia
            </span>
            {openSections.circulo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSections.circulo && (
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => {
                const selected = filtros.circulos?.includes(c);
                return (
                  <button
                    key={c}
                    id={`filter-circulo-${c}`}
                    type="button"
                    onClick={() => toggleCirculo(c)}
                    className={`py-1.5 rounded text-xs font-bold transition-all border ${
                      selected
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm shadow-indigo-500/20'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    {c === 0 ? 'T' : c}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Escolas de Magia (Strict ENUM - 3 Colunas de Largura Fixa) */}
        <div className="border-b border-slate-800/80 pb-4">
          <button
            onClick={() => toggleSection('escola')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5"
          >
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" /> Escolas ({ESCOLAS.length})
            </span>
            {openSections.escola ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSections.escola && (
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {ESCOLAS.map((escola) => {
                const selected = filtros.escolas?.includes(escola);
                const colors = getEscolaColor(escola);
                return (
                  <button
                    key={escola}
                    id={`filter-escola-${escola}`}
                    type="button"
                    onClick={() => toggleEscola(escola)}
                    className={`w-full py-1.5 px-1 text-center justify-center flex items-center rounded text-[11px] font-medium whitespace-nowrap border transition-all ${
                      selected
                        ? `${colors.badge} font-bold ring-1 ring-indigo-400/50 shadow-xs`
                        : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                    title={escola}
                  >
                    {escola}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Conjuradores (N:M - 3 Colunas de Largura Fixa) */}
        <div className="border-b border-slate-800/80 pb-4">
          <button
            onClick={() => toggleSection('conjuradores')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5"
          >
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" /> Conjuradores ({metadata?.conjuradores.length || 0})
            </span>
            {openSections.conjuradores ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSections.conjuradores && (
            <div className="grid grid-cols-3 gap-1.5 pt-1 max-h-56 overflow-y-auto pr-0.5">
              {(metadata?.conjuradores || []).map((c) => {
                const selected = filtros.conjuradores_ids?.includes(c.id_conjurador);
                return (
                  <button
                    key={c.id_conjurador}
                    id={`filter-conjurador-${c.id_conjurador}`}
                    type="button"
                    onClick={() => toggleConjurador(c.id_conjurador)}
                    className={`w-full py-1.5 px-1 text-center justify-center flex items-center rounded text-[11px] font-medium whitespace-nowrap border transition-all ${
                      selected
                        ? 'bg-emerald-950 text-emerald-200 border-emerald-600 font-bold shadow-xs'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                    title={c.classe}
                  >
                    {c.classe}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Tipos de Dano (N:M - Strict ENUM - 3 Colunas de Largura Fixa) */}
        <div className="border-b border-slate-800/80 pb-4">
          <div className="w-full flex items-center justify-between mb-2.5">
            <button
              onClick={() => toggleSection('dano')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider"
            >
              <Flame className="w-3.5 h-3.5 text-indigo-400" /> Tipos de Dano ({TIPOS_DANO.length})
              {openSections.dano ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </button>
            <button
              type="button"
              id="btn-filter-dano-qualquer"
              onClick={toggleTodosDanos}
              className={`text-[11px] font-semibold px-2 py-0.5 rounded border transition-all flex items-center gap-1 ${
                todosDanosSelecionados
                  ? 'bg-indigo-600 text-white border-indigo-400 font-bold shadow-xs'
                  : 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60 hover:bg-indigo-900/80 hover:text-indigo-200'
              }`}
              title="Selecionar todos os tipos de dano ou desmarcar"
            >
              <CheckCheck className="w-3 h-3" />
              {todosDanosSelecionados ? 'Desmarcar Todos' : 'Qualquer (Todos)'}
            </button>
          </div>
          {openSections.dano && (
            <div className="space-y-2 pt-1">
              {/* Botão de Destaque 'Qualquer / Todos os Danos' */}
              <button
                type="button"
                id="filter-dano-qualquer-pill"
                onClick={toggleTodosDanos}
                className={`w-full text-center py-1.5 px-3 rounded text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  todosDanosSelecionados
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400 shadow-sm shadow-indigo-500/25'
                    : 'bg-slate-900/90 text-indigo-300 border-indigo-900/60 hover:border-indigo-600 hover:bg-indigo-950/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{todosDanosSelecionados ? '✓ Todos os Danos Selecionados' : 'Qualquer Dano (Selecionar Todos)'}</span>
              </button>

              <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-0.5">
                {TIPOS_DANO.map((td) => {
                  const selected = filtros.tipos_dano?.includes(td);
                  const badgeClass = getTipoDanoBadgeClass(td);
                  return (
                    <button
                      key={td}
                      id={`filter-dano-${td}`}
                      type="button"
                      onClick={() => toggleTipoDano(td)}
                      className={`w-full py-1.5 px-1 text-center justify-center flex items-center rounded text-[11px] font-medium whitespace-nowrap border transition-all ${
                        selected
                          ? `${badgeClass} font-bold ring-1 ring-indigo-400/50 shadow-xs`
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                      }`}
                      title={td}
                    >
                      {td}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 5. Livros (Dinâmico do Banco) */}
        <div className="border-b border-slate-800/80 pb-4">
          <button
            onClick={() => toggleSection('livros')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5"
          >
            <span className="flex items-center gap-1.5">
              <Book className="w-3.5 h-3.5 text-indigo-400" /> Livros de Origem
            </span>
            {openSections.livros ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSections.livros && (
            <div className="space-y-1.5 pt-1">
              {(metadata?.livros || []).map((l) => {
                const selected = filtros.livros_ids?.includes(l.id_livro);
                return (
                  <button
                    key={l.id_livro}
                    id={`filter-livro-${l.id_livro}`}
                    type="button"
                    onClick={() => toggleLivro(l.id_livro)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs border transition-all truncate block ${
                      selected
                        ? 'bg-indigo-950/80 text-indigo-200 border-indigo-600 font-bold'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    {l.nome_livro}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. Componentes (V, S, M) */}
        <div className="border-b border-slate-800/80 pb-4">
          <button
            onClick={() => toggleSection('componentes')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5"
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-pink-400" /> Componentes
            </span>
            {openSections.componentes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSections.componentes && (
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Verbal (V)</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      onChangeFiltros({
                        ...filtros,
                        componente_verbal: filtros.componente_verbal === true ? undefined : true,
                      })
                    }
                    className={`px-2.5 py-1 rounded text-xs border transition-all ${
                      filtros.componente_verbal === true
                        ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-xs'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    Sim
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Somático (S)</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      onChangeFiltros({
                        ...filtros,
                        componente_somatico: filtros.componente_somatico === true ? undefined : true,
                      })
                    }
                    className={`px-2.5 py-1 rounded text-xs border transition-all ${
                      filtros.componente_somatico === true
                        ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-xs'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    Sim
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Material (M)</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      onChangeFiltros({
                        ...filtros,
                        componente_material: filtros.componente_material === true ? undefined : true,
                      })
                    }
                    className={`px-2.5 py-1 rounded text-xs border transition-all ${
                      filtros.componente_material === true
                        ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-xs'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    Sim
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Consome Material</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      onChangeFiltros({
                        ...filtros,
                        consumo_material: filtros.consumo_material === true ? undefined : true,
                      })
                    }
                    className={`px-2.5 py-1 rounded text-xs border transition-all ${
                      filtros.consumo_material === true
                        ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-xs'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    Sim
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 7. Regras Especiais (Concentração, Salvaguarda, Ataque) */}
        <div className="border-b border-slate-800/80 pb-4">
          <button
            onClick={() => toggleSection('regras')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5"
          >
            <span className="flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-rose-400" /> Combate & Regras
            </span>
            {openSections.regras ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSections.regras && (
            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Concentração</span>
                <button
                  type="button"
                  onClick={() =>
                    onChangeFiltros({
                      ...filtros,
                      concentracao: filtros.concentracao === true ? undefined : true,
                    })
                  }
                  className={`px-2.5 py-1 rounded text-xs border transition-all ${
                    filtros.concentracao === true
                      ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-xs'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Exige Concentração
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Ataque com Magia</span>
                <button
                  type="button"
                  onClick={() =>
                    onChangeFiltros({
                      ...filtros,
                      ataque: filtros.ataque === true ? undefined : true,
                    })
                  }
                  className={`px-2.5 py-1 rounded text-xs border transition-all ${
                    filtros.ataque === true
                      ? 'bg-rose-600 text-white font-bold border-rose-500 shadow-xs'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Exige Ataque
                </button>
              </div>

              <div>
                <span className="text-slate-300 block mb-1.5">Teste de Salvaguarda (Resistência)</span>
                <div className="grid grid-cols-3 gap-1">
                  {ATRIBUTOS.map((attr) => {
                    const selected = filtros.atributo_salvaguarda === attr;
                    return (
                      <button
                        key={attr}
                        type="button"
                        onClick={() =>
                          onChangeFiltros({
                            ...filtros,
                            atributo_salvaguarda: selected ? undefined : attr,
                            salvaguarda: selected ? undefined : true,
                          })
                        }
                        className={`py-1 rounded text-xs font-semibold border transition-all ${
                          selected
                            ? 'bg-cyan-600 text-white border-cyan-400 shadow-xs'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {attr}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 8. Formas de Área */}
        <div className="pb-4">
          <button
            onClick={() => toggleSection('formas')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5"
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-400" /> Formas de Área
            </span>
            {openSections.formas ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSections.formas && (
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {FORMAS.map((forma) => {
                const selected = filtros.forma === forma;
                return (
                  <button
                    key={forma}
                    type="button"
                    onClick={() =>
                      onChangeFiltros({
                        ...filtros,
                        forma: selected ? undefined : forma,
                      })
                    }
                    className={`w-full py-1.5 px-1 text-center justify-center flex items-center rounded text-[11px] font-medium whitespace-nowrap border transition-all ${
                      selected
                        ? 'bg-teal-950 text-teal-200 border-teal-500 font-bold shadow-xs'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    {forma}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        id="desktop-filter-sidebar"
        className="hidden md:block w-80 lg:w-84 xl:w-92 shrink-0 bg-slate-950 border-r border-slate-800 h-[calc(100vh-4rem)] sticky top-16"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div
          id="mobile-filter-drawer-backdrop"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        >
          <div
            id="mobile-filter-drawer"
            className="w-[340px] max-w-[90vw] h-full bg-slate-950 border-r border-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
