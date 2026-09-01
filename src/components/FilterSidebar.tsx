import React, { useState } from 'react';
import {
  Filter,
  X,
  RotateCcw,
  Sparkles,
  Flame,
  Shield,
  BookOpen,
  Users,
  Swords,
  Layers,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCheck,
  Clock,
  Hourglass,
  Zap,
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

export const countActiveFilters = (filtros: FiltrosMagia): number => {
  let count = 0;
  if (filtros.busca) count += 1;
  if (filtros.circulos && filtros.circulos.length > 0) count += filtros.circulos.length;
  if (filtros.escolas && filtros.escolas.length > 0) count += filtros.escolas.length;
  if (filtros.conjuradores_ids && filtros.conjuradores_ids.length > 0) count += filtros.conjuradores_ids.length;
  if (filtros.tipos_dano && filtros.tipos_dano.length > 0) count += filtros.tipos_dano.length;
  if (filtros.livros_ids && filtros.livros_ids.length > 0) count += filtros.livros_ids.length;
  if (typeof filtros.concentracao === 'boolean') count += 1;
  if (typeof filtros.salvaguarda === 'boolean') count += 1;
  if (filtros.atributo_salvaguarda && filtros.atributo_salvaguarda !== 'todos') count += 1;
  if (typeof filtros.ataque === 'boolean') count += 1;
  if (typeof filtros.componente_verbal === 'boolean') count += 1;
  if (typeof filtros.componente_somatico === 'boolean') count += 1;
  if (typeof filtros.componente_material === 'boolean') count += 1;
  if (typeof filtros.consumo_material === 'boolean') count += 1;
  if (filtros.forma && filtros.forma !== 'todos') count += 1;
  return count;
};

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filtros,
  metadata,
  onChangeFiltros,
  onResetFiltros,
  isOpenMobile,
  onCloseMobile,
  totalResultados,
}) => {
  // Estado para comprimir / colapsar a barra esquerda no desktop
  const [isCompressed, setIsCompressed] = useState(false);

  // Seções colapsáveis com padrão limpo
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    circulo: true,
    escola: true,
    conjuradores: true,
    dano: true,
    regras: false,
    componentes: false,
    livros: false,
    formas: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const activeCount = countActiveFilters(filtros);

  // Toggle Handlers
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

  const todosDanosSelecionados =
    filtros.tipos_dano && filtros.tipos_dano.length === TIPOS_DANO.length;

  const toggleTodosDanos = () => {
    if (todosDanosSelecionados) {
      onChangeFiltros({ ...filtros, tipos_dano: undefined });
    } else {
      onChangeFiltros({ ...filtros, tipos_dano: [...TIPOS_DANO] });
    }
  };

  const toggleLivro = (id: number) => {
    const current = filtros.livros_ids || [];
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    onChangeFiltros({ ...filtros, livros_ids: next.length ? next : undefined });
  };

  // Conteúdo completo dos filtros em estilo ultra-clean
  const filterBody = (
    <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4 text-xs">
      
      {/* 1. Círculo de Magia (Truque ao 9º) */}
      <div className="border-b border-slate-800/60 pb-3">
        <button
          type="button"
          onClick={() => toggleSection('circulo')}
          className="w-full flex items-center justify-between font-semibold text-slate-300 hover:text-slate-100 py-1"
        >
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Círculo</span>
          </span>
          <div className="flex items-center gap-1 text-slate-500">
            {filtros.circulos && filtros.circulos.length > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-bold text-[10px]">
                {filtros.circulos.length}
              </span>
            )}
            {openSections.circulo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {openSections.circulo && (
          <div className="grid grid-cols-5 gap-1 pt-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => {
              const selected = filtros.circulos?.includes(c);
              return (
                <button
                  key={c}
                  id={`filter-circulo-${c}`}
                  type="button"
                  onClick={() => toggleCirculo(c)}
                  className={`py-1 rounded text-center font-bold text-[11px] transition-all border ${
                    selected
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                  title={c === 0 ? 'Truques' : `${c}º Círculo`}
                >
                  {c === 0 ? 'T' : c}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Escolas de Magia */}
      <div className="border-b border-slate-800/60 pb-3">
        <button
          type="button"
          onClick={() => toggleSection('escola')}
          className="w-full flex items-center justify-between font-semibold text-slate-300 hover:text-slate-100 py-1"
        >
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Escolas</span>
          </span>
          <div className="flex items-center gap-1 text-slate-500">
            {filtros.escolas && filtros.escolas.length > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-bold text-[10px]">
                {filtros.escolas.length}
              </span>
            )}
            {openSections.escola ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {openSections.escola && (
          <div className="grid grid-cols-2 gap-1 pt-2">
            {ESCOLAS.map((escola) => {
              const selected = filtros.escolas?.includes(escola);
              const colors = getEscolaColor(escola);
              return (
                <button
                  key={escola}
                  id={`filter-escola-${escola}`}
                  type="button"
                  onClick={() => toggleEscola(escola)}
                  className={`py-1 px-2 text-left rounded text-[11px] truncate border transition-all ${
                    selected
                      ? `${colors.badge} font-bold ring-1 ring-indigo-400/40`
                      : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:border-slate-700'
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

      {/* 3. Conjuradores (Classes) */}
      <div className="border-b border-slate-800/60 pb-3">
        <button
          type="button"
          onClick={() => toggleSection('conjuradores')}
          className="w-full flex items-center justify-between font-semibold text-slate-300 hover:text-slate-100 py-1"
        >
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Conjuradores</span>
          </span>
          <div className="flex items-center gap-1 text-slate-500">
            {filtros.conjuradores_ids && filtros.conjuradores_ids.length > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-bold text-[10px]">
                {filtros.conjuradores_ids.length}
              </span>
            )}
            {openSections.conjuradores ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {openSections.conjuradores && (
          <div className="grid grid-cols-2 gap-1 pt-2 max-h-48 overflow-y-auto pr-0.5">
            {(metadata?.conjuradores || []).map((c) => {
              const selected = filtros.conjuradores_ids?.includes(c.id_conjurador);
              return (
                <button
                  key={c.id_conjurador}
                  id={`filter-conjurador-${c.id_conjurador}`}
                  type="button"
                  onClick={() => toggleConjurador(c.id_conjurador)}
                  className={`py-1 px-2 text-left rounded text-[11px] truncate border transition-all ${
                    selected
                      ? 'bg-emerald-950 text-emerald-200 border-emerald-600 font-bold'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:border-slate-700'
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

      {/* 4. Tipos de Dano */}
      <div className="border-b border-slate-800/60 pb-3">
        <div className="flex items-center justify-between py-1">
          <button
            type="button"
            onClick={() => toggleSection('dano')}
            className="flex items-center gap-1.5 font-semibold text-slate-300 hover:text-slate-100"
          >
            <Flame className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tipos de Dano</span>
            {openSections.dano ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
          </button>
          <button
            type="button"
            id="btn-filter-dano-qualquer-clean"
            onClick={toggleTodosDanos}
            className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
              todosDanosSelecionados
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'text-indigo-400 border-indigo-900/60 hover:bg-indigo-950/40'
            }`}
          >
            {todosDanosSelecionados ? 'Limpar' : 'Qualquer'}
          </button>
        </div>

        {openSections.dano && (
          <div className="grid grid-cols-2 gap-1 pt-2 max-h-48 overflow-y-auto pr-0.5">
            {TIPOS_DANO.map((td) => {
              const selected = filtros.tipos_dano?.includes(td);
              const badgeClass = getTipoDanoBadgeClass(td);
              return (
                <button
                  key={td}
                  id={`filter-dano-${td}`}
                  type="button"
                  onClick={() => toggleTipoDano(td)}
                  className={`py-1 px-2 text-left rounded text-[11px] truncate border transition-all ${
                    selected
                      ? `${badgeClass} font-bold ring-1 ring-indigo-400/30`
                      : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:border-slate-700'
                  }`}
                  title={td}
                >
                  {td}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Regras: Concentração, Ataque e Salvaguarda (estilo clean com relógio/ampulheta) */}
      <div className="border-b border-slate-800/60 pb-3">
        <button
          type="button"
          onClick={() => toggleSection('regras')}
          className="w-full flex items-center justify-between font-semibold text-slate-300 hover:text-slate-100 py-1"
        >
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Hourglass className="w-3.5 h-3.5 text-amber-400" />
            <span>Regras & Combate</span>
          </span>
          <div className="flex items-center gap-1 text-slate-500">
            {openSections.regras ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {openSections.regras && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Hourglass className="w-3 h-3 text-indigo-400" /> Concentração
              </span>
              <button
                type="button"
                onClick={() =>
                  onChangeFiltros({
                    ...filtros,
                    concentracao: filtros.concentracao === true ? undefined : true,
                  })
                }
                className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                  filtros.concentracao === true
                    ? 'bg-indigo-600 text-white border-indigo-400 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {filtros.concentracao === true ? 'Ativo' : 'Opcional'}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-rose-400" /> Ataque com Magia
              </span>
              <button
                type="button"
                onClick={() =>
                  onChangeFiltros({
                    ...filtros,
                    ataque: filtros.ataque === true ? undefined : true,
                  })
                }
                className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                  filtros.ataque === true
                    ? 'bg-rose-600 text-white border-rose-400 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {filtros.ataque === true ? 'Ativo' : 'Opcional'}
              </button>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] block mb-1">Resistência (Salvaguarda):</span>
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
                      className={`py-0.5 rounded text-center text-[10px] font-medium border transition-colors ${
                        selected
                          ? 'bg-cyan-600 text-white border-cyan-400 font-bold'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
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

      {/* 6. Componentes (V, S, M) */}
      <div className="border-b border-slate-800/60 pb-3">
        <button
          type="button"
          onClick={() => toggleSection('componentes')}
          className="w-full flex items-center justify-between font-semibold text-slate-300 hover:text-slate-100 py-1"
        >
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Layers className="w-3.5 h-3.5 text-pink-400" />
            <span>Componentes</span>
          </span>
          <div className="flex items-center gap-1 text-slate-500">
            {openSections.componentes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {openSections.componentes && (
          <div className="grid grid-cols-3 gap-1 pt-2">
            {[
              { key: 'componente_verbal', label: 'Verbal (V)' },
              { key: 'componente_somatico', label: 'Somático (S)' },
              { key: 'componente_material', label: 'Material (M)' },
            ].map((comp) => {
              const selected = (filtros as any)[comp.key] === true;
              return (
                <button
                  key={comp.key}
                  type="button"
                  onClick={() =>
                    onChangeFiltros({
                      ...filtros,
                      [comp.key]: selected ? undefined : true,
                    })
                  }
                  className={`py-1 px-1 rounded text-center text-[10px] font-medium border transition-colors truncate ${
                    selected
                      ? 'bg-indigo-600 text-white border-indigo-400 font-bold'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {comp.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. Livros de Origem */}
      <div className="border-b border-slate-800/60 pb-3">
        <button
          type="button"
          onClick={() => toggleSection('livros')}
          className="w-full flex items-center justify-between font-semibold text-slate-300 hover:text-slate-100 py-1"
        >
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Livros</span>
          </span>
          <div className="flex items-center gap-1 text-slate-500">
            {filtros.livros_ids && filtros.livros_ids.length > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-bold text-[10px]">
                {filtros.livros_ids.length}
              </span>
            )}
            {openSections.livros ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {openSections.livros && (
          <div className="space-y-1 pt-2 max-h-40 overflow-y-auto pr-0.5">
            {(metadata?.livros || []).map((l) => {
              const selected = filtros.livros_ids?.includes(l.id_livro);
              return (
                <button
                  key={l.id_livro}
                  id={`filter-livro-${l.id_livro}`}
                  type="button"
                  onClick={() => toggleLivro(l.id_livro)}
                  className={`w-full text-left py-1 px-2 rounded text-[11px] truncate border transition-colors ${
                    selected
                      ? 'bg-indigo-950 text-indigo-200 border-indigo-600 font-semibold'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200'
                  }`}
                  title={l.nome_livro}
                >
                  {l.nome_livro}
                </button>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );

  return (
    <>
      {/* 1. DESKTOP / TABLET SIDEBAR (Fixa na esquerda, compressível) */}
      <aside
        id="desktop-filter-sidebar"
        className={`hidden lg:flex flex-col bg-slate-950 border-r border-slate-800/80 transition-all duration-200 shrink-0 sticky top-13 h-[calc(100vh-3.25rem)] select-none ${
          isCompressed ? 'w-14' : 'w-64 xl:w-72'
        }`}
      >
        {/* Header da Sidebar */}
        <div className="p-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/90 shrink-0">
          {!isCompressed ? (
            <>
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Filtros
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                  {totalResultados}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={onResetFiltros}
                    className="p-1 rounded text-slate-400 hover:text-indigo-300 hover:bg-slate-800 text-[11px] transition-colors"
                    title="Limpar filtros"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsCompressed(true)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title="Comprimir barra de filtros"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            /* Modo Comprimido (Ícone + expandir) */
            <div className="w-full flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCompressed(false)}
                className="p-1.5 rounded bg-slate-900 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-all"
                title="Expandir filtros"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {activeCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Corpo quando expandido */}
        {!isCompressed ? (
          filterBody
        ) : (
          /* Mini ícones quando comprimido */
          <div className="flex-1 flex flex-col items-center py-4 gap-4 text-slate-400">
            <button
              onClick={() => setIsCompressed(false)}
              className="p-2 rounded hover:bg-slate-900 hover:text-indigo-300 transition-colors"
              title="Círculos de Magia"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCompressed(false)}
              className="p-2 rounded hover:bg-slate-900 hover:text-indigo-300 transition-colors"
              title="Escolas de Magia"
            >
              <Shield className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCompressed(false)}
              className="p-2 rounded hover:bg-slate-900 hover:text-emerald-300 transition-colors"
              title="Conjuradores"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCompressed(false)}
              className="p-2 rounded hover:bg-slate-900 hover:text-indigo-300 transition-colors"
              title="Tipos de Dano"
            >
              <Flame className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCompressed(false)}
              className="p-2 rounded hover:bg-slate-900 hover:text-amber-300 transition-colors"
              title="Regras e Combate"
            >
              <Hourglass className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* 2. MOBILE / TABLET SLIDE-OVER DRAWER (Quando em tela estreita) */}
      {isOpenMobile && (
        <div
          id="mobile-filter-drawer"
          className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-start animate-in fade-in duration-150"
          onClick={onCloseMobile}
        >
          <div
            className="w-[300px] sm:w-[340px] max-w-[85vw] h-full bg-slate-950 border-r border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Mobile */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Filtros
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                  {totalResultados} magias
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={onResetFiltros}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium px-1.5 py-0.5"
                  >
                    Limpar
                  </button>
                )}
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Corpo Mobile */}
            {filterBody}

            {/* Footer Mobile */}
            <div className="p-3 border-t border-slate-800 bg-slate-950">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs text-center shadow-sm"
              >
                Ver {totalResultados} {totalResultados === 1 ? 'Magia' : 'Magias'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
