import React, { forwardRef } from 'react';
import {
  Clock,
  Compass,
  Hourglass,
  Layers,
  Shield,
  Crosshair,
  Flame,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { MagiaCompleta } from '../types';
import {
  formatCirculo,
  getEscolaColor,
  getTipoDanoBadgeClass,
  formatDanoFormula,
  formatAtributoNome,
} from '../utils/magicHelpers';
import { MarkdownRenderer } from './MarkdownRenderer';
import { GrimoireIcon } from './GrimoireIcon';

export type CardTheme = 'dark' | 'parchment' | 'clean';
export type CardFormat = 'standard' | 'wide'; // standard = 89x146mm, wide = 178x146mm

interface PrintableSpellCardProps {
  magia: MagiaCompleta;
  format?: CardFormat;
  theme?: CardTheme;
  showCutGuides?: boolean;
  onToggleFormat?: (id_magia: number) => void;
  onDownloadPng?: (magia: MagiaCompleta) => void;
  isExporting?: boolean;
}

export const PrintableSpellCard = forwardRef<HTMLDivElement, PrintableSpellCardProps>(
  (
    {
      magia,
      format = 'standard',
      theme = 'dark',
      showCutGuides = true,
      onToggleFormat,
      onDownloadPng,
      isExporting = false,
    },
    ref
  ) => {
    const isWide = format === 'wide';
    const escolaColor = getEscolaColor(magia.escola);
    const danoFormula = formatDanoFormula(
      magia.dado_dano,
      magia.numero_dados_dano,
      magia.bonus_dano
    );

    // Dynamic theme styling
    const getThemeStyles = () => {
      switch (theme) {
        case 'parchment':
          return {
            container:
              'bg-[#fcf7ec] text-[#2b2118] border-[#9c7a4b]/60 shadow-md',
            innerFrame:
              'border-[#9c7a4b]/40 bg-gradient-to-b from-[#f9f2e0]/60 to-[#f3e9d2]/80',
            headerBg: 'bg-[#9c7a4b]/15 text-[#3d2714] border-[#9c7a4b]/30',
            headerTitle: 'text-[#2b1e10]',
            subHeader: 'text-[#614b35]',
            badge: 'bg-[#9c7a4b]/20 text-[#3d2714] border-[#9c7a4b]/40',
            specsBox:
              'bg-[#f4ebd5]/90 border-[#d4c29d] text-[#332415]',
            specsIcon: 'text-[#8b6534]',
            rulesBadge:
              'bg-[#ece0c3] text-[#3b2713] border-[#caa872]',
            divider: 'border-[#d4c29d]',
            markdownClass: 'text-[#2c1f13]',
            footerText: 'text-[#6b543d]',
            tagBadge: 'bg-[#ede1c7] text-[#3d2a17] border-[#ccae76]',
            schoolAccent: 'text-[#7d481b]',
          };
        case 'clean':
          return {
            container: 'bg-white text-slate-900 border-slate-300 shadow-md',
            innerFrame: 'border-slate-200 bg-slate-50/50',
            headerBg: 'bg-slate-100 text-slate-800 border-slate-200',
            headerTitle: 'text-slate-900',
            subHeader: 'text-slate-600',
            badge: 'bg-slate-100 text-slate-800 border-slate-300',
            specsBox: 'bg-slate-100/90 border-slate-200 text-slate-800',
            specsIcon: 'text-slate-600',
            rulesBadge: 'bg-slate-100 text-slate-800 border-slate-300',
            divider: 'border-slate-200',
            markdownClass: 'text-slate-800',
            footerText: 'text-slate-500',
            tagBadge: 'bg-slate-100 text-slate-700 border-slate-200',
            schoolAccent: 'text-slate-700',
          };
        case 'dark':
        default:
          return {
            container:
              'bg-slate-950 text-slate-100 border-slate-800 shadow-xl',
            innerFrame:
              'border-slate-800/80 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95',
            headerBg: 'bg-slate-900/90 text-slate-100 border-slate-800',
            headerTitle: 'text-slate-100',
            subHeader: 'text-indigo-300',
            badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50',
            specsBox:
              'bg-slate-950/80 border-slate-800/90 text-slate-200',
            specsIcon: 'text-indigo-400',
            rulesBadge:
              'bg-slate-900/90 text-slate-200 border-slate-700/80',
            divider: 'border-slate-800',
            markdownClass: 'text-slate-200',
            footerText: 'text-slate-400',
            tagBadge: 'bg-slate-800 text-slate-300 border-slate-700',
            schoolAccent: 'text-indigo-400',
          };
      }
    };

    const st = getThemeStyles();

    return (
      <div
        ref={ref}
        id={`print-card-${magia.id_magia}`}
        className={`relative box-border shrink-0 flex flex-col justify-between select-text transition-all ${
          st.container
        } ${showCutGuides ? 'outline-1 outline-dashed outline-indigo-500/30' : ''}`}
        style={{
          width: isWide ? '178mm' : '89mm',
          height: '146mm',
          minWidth: isWide ? '178mm' : '89mm',
          maxWidth: isWide ? '178mm' : '89mm',
          minHeight: '146mm',
          maxHeight: '146mm',
          padding: '2.5mm',
          boxSizing: 'border-box',
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          overflow: 'hidden',
          borderRadius: '3.5mm',
        }}
      >
        {/* Inner Ornate Frame Container */}
        <div
          className={`w-full h-full rounded-[2.5mm] border flex flex-col justify-between p-[2.5mm] box-border overflow-hidden relative ${st.innerFrame}`}
        >
          {/* Top Arcane Corner Accents */}
          <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-indigo-400/40 pointer-events-none" />
          <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-indigo-400/40 pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-indigo-400/40 pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-indigo-400/40 pointer-events-none" />

          {/* CARD TOP HEADER */}
          <div className="shrink-0 space-y-1">
            {/* Upper Ribbon: Círculo, Escola, Dimensão */}
            <div className="flex items-center justify-between gap-1 border-b pb-1 border-slate-700/40">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9.5px] font-black tracking-wide px-1.5 py-0.2 rounded border uppercase font-mono bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
                  {formatCirculo(magia.circulo)}
                </span>
                <span
                  className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded border uppercase ${escolaColor.badge}`}
                >
                  {magia.escola}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[8.5px] font-mono tracking-tighter opacity-60">
                  {isWide ? '178×146mm' : '89×146mm'}
                </span>
                {magia.nome_livro && (
                  <span
                    className="text-[8.5px] px-1 py-0.2 rounded bg-black/20 border border-black/10 font-medium truncate max-w-[90px]"
                    title={magia.nome_livro}
                  >
                    {magia.nome_livro}
                  </span>
                )}
              </div>
            </div>

            {/* Spell Name Title */}
            <div className="flex items-center justify-between gap-2">
              <h2
                className={`font-extrabold tracking-tight leading-tight line-clamp-1 ${
                  isWide ? 'text-[15px]' : 'text-[13.5px]'
                } ${st.headerTitle}`}
                title={magia.nome_magia}
              >
                {magia.nome_magia}
              </h2>
            </div>

            {/* Compact Specs Grid (Tempo, Alcance, Duração, Componentes) */}
            <div
              className={`grid ${
                isWide ? 'grid-cols-4' : 'grid-cols-2'
              } gap-1 p-1 rounded border text-[9px] ${st.specsBox}`}
            >
              <div className="flex items-center gap-1 min-w-0">
                <Clock className={`w-2.5 h-2.5 shrink-0 ${st.specsIcon}`} />
                <span className="truncate">
                  <strong className="font-semibold">Tempo:</strong> {magia.tempo}
                </span>
              </div>

              <div className="flex items-center gap-1 min-w-0">
                <Compass className={`w-2.5 h-2.5 shrink-0 ${st.specsIcon}`} />
                <span className="truncate">
                  <strong className="font-semibold">Alcance:</strong> {magia.alcance}
                  {magia.forma ? ` (${magia.forma})` : ''}
                </span>
              </div>

              <div className="flex items-center gap-1 min-w-0">
                <Hourglass className={`w-2.5 h-2.5 shrink-0 ${st.specsIcon}`} />
                <span className="truncate">
                  <strong className="font-semibold">Duração:</strong> {magia.duracao}
                </span>
              </div>

              <div className="flex items-center gap-1 min-w-0">
                <Layers className={`w-2.5 h-2.5 shrink-0 ${st.specsIcon}`} />
                <span className="truncate font-mono">
                  <strong className="font-sans font-semibold">Comp:</strong>{' '}
                  {[
                    magia.componente_verbal ? 'V' : null,
                    magia.componente_somatico ? 'S' : null,
                    magia.componente_material ? 'M' : null,
                  ]
                    .filter(Boolean)
                    .join(', ') || 'Nenhum'}
                </span>
              </div>
            </div>

            {/* Material description if any (compact strip) */}
            {magia.componente_material && magia.descricao_material && (
              <div className="text-[8px] italic leading-tight opacity-80 px-1 py-0.5 rounded bg-black/10 border border-black/10 truncate">
                <span className="font-semibold not-italic">Material:</span>{' '}
                {magia.descricao_material}
                {magia.valor_material ? ` (${magia.valor_material} PO)` : ''}
                {magia.consumo_material ? ' [Consome]' : ''}
              </div>
            )}

            {/* Quick Rule Tags (Concentração, Salvaguarda, Ataque, Dano) */}
            <div className="flex flex-wrap items-center gap-0.5 text-[8.5px]">
              {magia.concentracao && (
                <span className="px-1 py-0.2 rounded font-semibold bg-indigo-950/70 text-indigo-300 border border-indigo-700/50">
                  Concentração
                </span>
              )}

              {magia.salvaguarda && (
                <span className="px-1 py-0.2 rounded font-semibold bg-cyan-950/70 text-cyan-300 border border-cyan-700/50 flex items-center gap-0.5">
                  <Shield className="w-2 h-2" />
                  Salv: {magia.atributo_salvaguarda || 'Sim'}
                </span>
              )}

              {magia.ataque && (
                <span className="px-1 py-0.2 rounded font-semibold bg-rose-950/70 text-rose-300 border border-rose-700/50 flex items-center gap-0.5">
                  <Crosshair className="w-2 h-2" />
                  Ataque
                </span>
              )}

              {danoFormula && (
                <span className="px-1 py-0.2 rounded font-bold font-mono bg-violet-950/80 text-violet-300 border border-violet-700/60">
                  {danoFormula}
                </span>
              )}

              {magia.tipos_dano &&
                magia.tipos_dano.map((td) => (
                  <span
                    key={td}
                    className={`px-1 py-0.2 rounded font-semibold border ${getTipoDanoBadgeClass(
                      td
                    )}`}
                  >
                    {td}
                  </span>
                ))}
            </div>
          </div>

          {/* CARD MIDDLE BODY: MARKDOWN DESCRIPTION (Scroll/fit container) */}
          <div
            className={`flex-1 min-h-0 my-1 overflow-y-auto pr-0.5 text-[9.5px] leading-snug ${
              isWide ? 'columns-2 gap-3.5 rule-divider' : ''
            }`}
          >
            <div className={`spell-card-markdown ${st.markdownClass}`}>
              <MarkdownRenderer
                content={magia.descricao}
                className="text-[9.5px] leading-snug space-y-1.5"
              />
            </div>
          </div>

          {/* CARD BOTTOM FOOTER: CONJURADORES & METADATA */}
          <div className="shrink-0 pt-1 border-t border-slate-700/40 flex items-center justify-between text-[8.5px]">
            <div className="flex items-center gap-1 overflow-hidden flex-wrap max-w-[85%]">
              <span className="font-semibold opacity-70">Classes:</span>
              {magia.conjuradores && magia.conjuradores.length > 0 ? (
                magia.conjuradores.map((c) => (
                  <span
                    key={c.id_conjurador}
                    className={`px-1 py-0.2 rounded font-medium ${st.tagBadge}`}
                  >
                    {c.classe}
                  </span>
                ))
              ) : (
                <span className="italic opacity-50">Qualquer</span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0 opacity-60">
              <GrimoireIcon className="w-2.5 h-2.5 text-indigo-400" />
              <span className="font-mono text-[7.5px]">#{magia.id_magia}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrintableSpellCard.displayName = 'PrintableSpellCard';
