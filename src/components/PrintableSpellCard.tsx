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
  formatDuracaoCard,
  formatComponentesCard,
} from '../utils/magicHelpers';
import { MarkdownRenderer } from './MarkdownRenderer';
import { GrimoireIcon } from './GrimoireIcon';

export type CardTheme = 'dark' | 'parchment' | 'clean';
export type CardFormat = 'standard' | 'wide'; // standard = 89x140mm, wide = 178x140mm

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

    // Dynamic theme styling with guaranteed high contrast & readable typography
    const getThemeStyles = () => {
      switch (theme) {
        case 'clean':
          return {
            container: 'bg-white text-slate-900 border-2 border-slate-700 shadow-sm',
            innerFrame: 'border border-slate-300 bg-white',
            headerBg: 'bg-slate-100 text-slate-900 border-b border-slate-300',
            headerTitle: 'text-slate-950 font-black',
            subHeader: 'text-slate-700',
            circleBadge: 'bg-indigo-100 text-indigo-950 border-indigo-300 font-bold',
            schoolBadge: 'bg-slate-100 text-slate-900 border-slate-400 font-bold',
            bookBadge: 'bg-slate-100 text-slate-700 border-slate-300 font-medium',
            specsBox: 'bg-slate-100 border-slate-300 text-slate-900 font-medium',
            specsIcon: 'text-slate-700',
            materialStrip: 'bg-slate-100/90 border-slate-300 text-slate-800',
            tagConcentracao: 'bg-indigo-100 text-indigo-950 border-indigo-300 font-bold',
            tagSalvaguarda: 'bg-cyan-100 text-cyan-950 border-cyan-300 font-bold',
            tagAtaque: 'bg-rose-100 text-rose-950 border-rose-300 font-bold',
            tagDano: 'bg-purple-100 text-purple-950 border-purple-300 font-bold font-mono',
            divider: 'border-slate-300',
            markdownClass: 'text-slate-900 font-normal',
            footerText: 'text-slate-700',
            tagBadge: 'bg-slate-100 text-slate-900 border-slate-300 font-semibold',
            schoolAccent: 'text-slate-800',
            cornerAccent: 'border-slate-400',
          };
        case 'parchment':
          return {
            container: 'bg-[#fcf8ec] text-[#24170d] border-2 border-[#7c5329] shadow-sm',
            innerFrame: 'border border-[#bfa275] bg-[#fbf6e8]',
            headerBg: 'bg-[#ede0c2] text-[#24170d] border-b border-[#caa976]',
            headerTitle: 'text-[#2e1805] font-black',
            subHeader: 'text-[#5e3814]',
            circleBadge: 'bg-[#ebd8b1] text-[#3b1f07] border-[#b8955c] font-bold',
            schoolBadge: 'bg-[#ebd8b1] text-[#3b1f07] border-[#b8955c] font-bold',
            bookBadge: 'bg-[#eddcb9] text-[#4d2f12] border-[#bfa275] font-medium',
            specsBox: 'bg-[#f2e6cb] border-[#caa976] text-[#24170d] font-medium',
            specsIcon: 'text-[#70431b]',
            materialStrip: 'bg-[#f2e6cb] border-[#caa976] text-[#2b1b0e]',
            tagConcentracao: 'bg-[#d8c397] text-[#2e1805] border-[#a8864f] font-bold',
            tagSalvaguarda: 'bg-[#d0dfd8] text-[#0f291f] border-[#81a99a] font-bold',
            tagAtaque: 'bg-[#e2c5c5] text-[#3d1212] border-[#ba8080] font-bold',
            tagDano: 'bg-[#d5c5e2] text-[#280f3d] border-[#9b7bb6] font-bold font-mono',
            divider: 'border-[#caa976]',
            markdownClass: 'text-[#20150c] font-normal',
            footerText: 'text-[#5e3814]',
            tagBadge: 'bg-[#ecdec0] text-[#261506] border-[#baa075] font-semibold',
            schoolAccent: 'text-[#70431b]',
            cornerAccent: 'border-[#9c7a4b]',
          };
        case 'dark':
        default:
          return {
            container: 'bg-slate-950 text-slate-100 border-2 border-slate-800 shadow-xl',
            innerFrame: 'border border-slate-800/80 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95',
            headerBg: 'bg-slate-900/90 text-slate-100 border-b border-slate-800',
            headerTitle: 'text-white font-extrabold',
            subHeader: 'text-indigo-300',
            circleBadge: 'bg-indigo-950/90 text-indigo-300 border-indigo-600/60 font-bold',
            schoolBadge: 'bg-slate-900 text-slate-100 border-slate-700 font-bold',
            bookBadge: 'bg-black/40 text-slate-300 border-slate-700 font-medium',
            specsBox: 'bg-slate-950/90 border-slate-800 text-slate-200 font-medium',
            specsIcon: 'text-indigo-400',
            materialStrip: 'bg-black/30 border-slate-800 text-slate-300',
            tagConcentracao: 'bg-indigo-950 text-indigo-300 border-indigo-700 font-semibold',
            tagSalvaguarda: 'bg-cyan-950 text-cyan-300 border-cyan-700 font-semibold',
            tagAtaque: 'bg-rose-950 text-rose-300 border-rose-700 font-semibold',
            tagDano: 'bg-violet-950 text-violet-300 border-violet-700 font-bold font-mono',
            divider: 'border-slate-800',
            markdownClass: 'text-slate-100 font-normal',
            footerText: 'text-slate-300',
            tagBadge: 'bg-slate-800 text-slate-200 border-slate-700 font-semibold',
            schoolAccent: 'text-indigo-400',
            cornerAccent: 'border-indigo-400/50',
          };
      }
    };

    const st = getThemeStyles();
    const duracaoFormatada = formatDuracaoCard(magia.duracao);
    const componentesFormatados = formatComponentesCard(magia);

    return (
      <div
        ref={ref}
        id={`print-card-${magia.id_magia}`}
        className={`relative box-border shrink-0 flex flex-col justify-between select-text transition-all ${
          st.container
        } ${showCutGuides ? 'outline-1 outline-dashed outline-indigo-500/30' : ''}`}
        style={{
          width: isWide ? '178mm' : '89mm',
          height: '140mm',
          minWidth: isWide ? '178mm' : '89mm',
          maxWidth: isWide ? '178mm' : '89mm',
          minHeight: '140mm',
          maxHeight: '140mm',
          padding: '2mm',
          boxSizing: 'border-box',
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          overflow: 'hidden',
          borderRadius: '3mm',
        }}
      >
        {/* Inner Ornate Frame Container */}
        <div
          className={`w-full h-full rounded-[2.2mm] border flex flex-col justify-between p-[2.2mm] box-border overflow-hidden relative ${st.innerFrame}`}
        >
          {/* Top Arcane Corner Accents */}
          <div className={`absolute top-1 left-1 w-2 h-2 border-t border-l pointer-events-none ${st.cornerAccent}`} />
          <div className={`absolute top-1 right-1 w-2 h-2 border-t border-r pointer-events-none ${st.cornerAccent}`} />
          <div className={`absolute bottom-1 left-1 w-2 h-2 border-b border-l pointer-events-none ${st.cornerAccent}`} />
          <div className={`absolute bottom-1 right-1 w-2 h-2 border-b border-r pointer-events-none ${st.cornerAccent}`} />

          {/* CARD TOP HEADER */}
          <div className="shrink-0 space-y-1">
            {/* Upper Ribbon: Círculo & Escola SEMPRE na mesma linha e Livro (sem tamanho da carta) */}
            <div className={`flex items-center justify-between gap-1.5 border-b pb-1 ${st.divider}`}>
              <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
                <span className={`text-[9.5px] font-black tracking-wide px-1.5 py-0.2 rounded border uppercase font-mono whitespace-nowrap ${st.circleBadge}`}>
                  {formatCirculo(magia.circulo)}
                </span>
                <span
                  className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded border uppercase whitespace-nowrap ${
                    theme === 'dark' ? escolaColor.badge : st.schoolBadge
                  }`}
                >
                  {magia.escola}
                </span>
              </div>

              {magia.nome_livro && (
                <span
                  className={`text-[8px] px-1.5 py-0.2 rounded border font-medium truncate max-w-[110px] ${st.bookBadge}`}
                  title={magia.nome_livro}
                >
                  {magia.nome_livro}
                </span>
              )}
            </div>

            {/* Spell Name Title */}
            <div className="flex items-center justify-between gap-2">
              <h2
                className={`font-black tracking-tight leading-tight line-clamp-1 ${
                  isWide ? 'text-[14.5px]' : 'text-[13px]'
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
                  <strong className="font-bold">Tempo:</strong> {magia.tempo}
                </span>
              </div>

              <div className="flex items-center gap-1 min-w-0">
                <Compass className={`w-2.5 h-2.5 shrink-0 ${st.specsIcon}`} />
                <span className="truncate">
                  <strong className="font-bold">Alcance:</strong> {magia.alcance}
                  {magia.forma ? ` (${magia.forma})` : ''}
                </span>
              </div>

              <div className="flex items-center gap-1 min-w-0">
                <Hourglass className={`w-2.5 h-2.5 shrink-0 ${st.specsIcon}`} />
                <span className="truncate" title={duracaoFormatada}>
                  <strong className="font-bold">Duração:</strong> {duracaoFormatada}
                </span>
              </div>

              <div className="flex items-center gap-1 min-w-0">
                <Layers className={`w-2.5 h-2.5 shrink-0 ${st.specsIcon}`} />
                <span className="truncate font-mono" title={componentesFormatados}>
                  <strong className="font-sans font-bold">Comp:</strong> {componentesFormatados}
                </span>
              </div>
            </div>

            {/* Material description if any (compact strip) */}
            {magia.componente_material && magia.descricao_material && (
              <div className={`text-[8px] italic leading-tight px-1.5 py-0.5 rounded border truncate ${st.materialStrip}`}>
                <span className="font-bold not-italic">Material:</span>{' '}
                {magia.descricao_material}
                {magia.valor_material ? ` (${magia.valor_material} PO)` : ''}
                {magia.consumo_material ? ' [Consome]' : ''}
              </div>
            )}

            {/* Quick Rule Tags (Salvaguarda, Ataque, Dano) */}
            {(magia.salvaguarda || magia.ataque || danoFormula || (magia.tipos_dano && magia.tipos_dano.length > 0)) && (
              <div className="flex flex-wrap items-center gap-0.5 text-[8.5px]">
                {magia.salvaguarda && (
                  <span className={`px-1.5 py-0.2 rounded font-bold border flex items-center gap-0.5 ${st.tagSalvaguarda}`}>
                    <Shield className="w-2 h-2" />
                    Salv: {magia.atributo_salvaguarda || 'Sim'}
                  </span>
                )}

                {magia.ataque && (
                  <span className={`px-1.5 py-0.2 rounded font-bold border flex items-center gap-0.5 ${st.tagAtaque}`}>
                    <Crosshair className="w-2 h-2" />
                    Ataque
                  </span>
                )}

                {danoFormula && (
                  <span className={`px-1.5 py-0.2 rounded font-black font-mono border ${st.tagDano}`}>
                    {danoFormula}
                  </span>
                )}

                {magia.tipos_dano &&
                  magia.tipos_dano.map((td) => (
                    <span
                      key={td}
                      className={`px-1 py-0.2 rounded font-bold border ${
                        theme === 'dark'
                          ? getTipoDanoBadgeClass(td)
                          : theme === 'clean'
                          ? 'bg-slate-100 text-slate-900 border-slate-300'
                          : 'bg-[#ebd8b1] text-[#331c07] border-[#caa976]'
                      }`}
                    >
                      {td}
                    </span>
                  ))}
              </div>
            )}
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
                theme={theme}
                className="text-[9.2px] leading-snug space-y-1"
              />
            </div>
          </div>

          {/* CARD BOTTOM FOOTER: CONJURADORES & METADATA */}
          <div className={`shrink-0 pt-1 border-t flex items-center justify-between text-[8px] ${st.divider}`}>
            <div className="flex items-center gap-1 overflow-hidden flex-wrap max-w-[85%]">
              <span className={`font-bold ${st.footerText}`}>Classes:</span>
              {magia.conjuradores && magia.conjuradores.length > 0 ? (
                magia.conjuradores.map((c) => (
                  <span
                    key={c.id_conjurador}
                    className={`px-1.5 py-0.2 rounded font-semibold ${st.tagBadge}`}
                  >
                    {c.classe}
                  </span>
                ))
              ) : (
                <span className="italic opacity-70">Qualquer</span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0 opacity-75">
              <GrimoireIcon className="w-2.5 h-2.5" />
              <span className="font-mono text-[7.5px] font-bold">#{magia.id_magia}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrintableSpellCard.displayName = 'PrintableSpellCard';
