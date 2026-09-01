import React from 'react';
import {
  Clock,
  Compass,
  Hourglass,
  Shield,
  Layers,
  Crosshair,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { MagiaCompleta } from '../types';
import {
  formatCirculo,
  getEscolaColor,
  getTipoDanoBadgeClass,
  formatDanoFormula,
  stripMarkdown,
} from '../utils/magicHelpers';
import ReactMarkdown from 'react-markdown';

export type PrintTheme = 'parchment' | 'eco_white' | 'dark_arcane';
export type CardSize = 'card_standard' | 'card_medium' | 'grimoire_sheet';

interface SpellPrintCardProps {
  magia: MagiaCompleta;
  theme?: PrintTheme;
  cardSize?: CardSize;
  id?: string;
  className?: string;
}

export const SpellPrintCard: React.FC<SpellPrintCardProps> = ({
  magia,
  theme = 'parchment',
  cardSize = 'card_standard',
  id,
  className = '',
}) => {
  const danoFormula = formatDanoFormula(
    magia.dado_dano,
    magia.numero_dados_dano,
    magia.bonus_dano
  );

  // Esquemas de cores conforme o tema escolhido
  const themeStyles = {
    parchment: {
      wrapper: 'bg-[#fcf8ee] text-stone-900 border-[#8a6d3b] shadow-sm',
      headerBg: 'bg-[#ede3cc] border-b border-[#8a6d3b]/50',
      title: 'text-[#4a1c1a]',
      subtitle: 'text-[#704214]',
      subBox: 'bg-[#f4ebd0] border-[#d8c7a1]',
      badgePill: 'bg-[#ede0c4] text-[#5c3c10] border-[#cbb78d]',
      bodyText: 'text-stone-800',
      divider: 'border-[#cbb78d]',
      footerBg: 'bg-[#f4ebd0] border-t border-[#8a6d3b]/40 text-stone-700',
      iconColor: 'text-[#8a4e1d]',
    },
    eco_white: {
      wrapper: 'bg-white text-black border-stone-800 shadow-none',
      headerBg: 'bg-stone-100 border-b border-stone-800',
      title: 'text-black',
      subtitle: 'text-stone-700',
      subBox: 'bg-stone-50 border-stone-300',
      badgePill: 'bg-white text-stone-900 border-stone-400',
      bodyText: 'text-stone-900',
      divider: 'border-stone-300',
      footerBg: 'bg-stone-50 border-t border-stone-300 text-stone-800',
      iconColor: 'text-stone-700',
    },
    dark_arcane: {
      wrapper: 'bg-slate-900 text-slate-100 border-indigo-700/60 shadow-md',
      headerBg: 'bg-slate-950 border-b border-indigo-800/50',
      title: 'text-indigo-300',
      subtitle: 'text-slate-400',
      subBox: 'bg-slate-950/80 border-slate-800',
      badgePill: 'bg-indigo-950/70 text-indigo-300 border-indigo-700/50',
      bodyText: 'text-slate-300',
      divider: 'border-slate-800',
      footerBg: 'bg-slate-950/90 border-t border-slate-800 text-slate-400',
      iconColor: 'text-indigo-400',
    },
  }[theme];

  // Configuração dimensional baseada no formato
  const sizeStyles = {
    card_standard: 'w-[320px] min-h-[440px] text-xs p-3.5',
    card_medium: 'w-[420px] min-h-[520px] text-sm p-4',
    grimoire_sheet: 'w-full min-h-[220px] text-xs p-4 mb-4',
  }[cardSize];

  return (
    <div
      id={id || `print-card-${magia.id_magia}`}
      className={`relative rounded-lg border-2 flex flex-col justify-between overflow-hidden font-sans print:break-inside-avoid ${themeStyles.wrapper} ${sizeStyles} ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-current/20">
          <div className="flex-1 min-w-0">
            <h3
              className={`font-black text-base leading-tight tracking-tight uppercase ${themeStyles.title}`}
              style={{ fontFamily: 'Cinzel, Georgia, serif' }}
            >
              {magia.nome_magia}
            </h3>
            <p className={`text-[11px] font-semibold italic mt-0.5 ${themeStyles.subtitle}`}>
              {formatCirculo(magia.circulo)} de {magia.escola}
            </p>
          </div>
          <span
            className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${themeStyles.badgePill}`}
          >
            {magia.circulo === 0 ? 'Truque' : `${magia.circulo}º Círculo`}
          </span>
        </div>

        {/* Metadados Essenciais de Conjuração em Grade */}
        <div
          className={`grid grid-cols-2 gap-1.5 p-2 my-2 rounded border text-[10px] font-medium leading-tight ${themeStyles.subBox}`}
        >
          <div className="flex items-center gap-1 truncate">
            <Clock className={`w-3 h-3 shrink-0 ${themeStyles.iconColor}`} />
            <span>
              <strong>Tempo:</strong> {magia.tempo}
            </span>
          </div>

          <div className="flex items-center gap-1 truncate">
            <Compass className={`w-3 h-3 shrink-0 ${themeStyles.iconColor}`} />
            <span>
              <strong>Alcance:</strong> {magia.alcance}
              {magia.forma ? ` (${magia.forma})` : ''}
            </span>
          </div>

          <div className="flex items-center gap-1 truncate">
            <Hourglass className={`w-3 h-3 shrink-0 ${themeStyles.iconColor}`} />
            <span>
              <strong>Duração:</strong> {magia.duracao}
            </span>
          </div>

          <div className="flex items-center gap-1 truncate">
            <Layers className={`w-3 h-3 shrink-0 ${themeStyles.iconColor}`} />
            <span>
              <strong>Comp:</strong>{' '}
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

        {/* Tags de Combate / Regras */}
        <div className="flex flex-wrap gap-1 mb-2">
          {magia.concentracao && (
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${themeStyles.badgePill}`}
            >
              Concentração
            </span>
          )}

          {magia.salvaguarda && (
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${themeStyles.badgePill}`}
            >
              Salvaguarda: {magia.atributo_salvaguarda || 'Sim'}
            </span>
          )}

          {magia.ataque && (
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${themeStyles.badgePill}`}
            >
              Ataque Mágico
            </span>
          )}

          {danoFormula && (
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono border ${themeStyles.badgePill}`}
            >
              Dano: {danoFormula}
            </span>
          )}

          {magia.tipos_dano &&
            magia.tipos_dano.map((td) => (
              <span
                key={td}
                className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${themeStyles.badgePill}`}
              >
                {td}
              </span>
            ))}
        </div>

        {/* Detalhes do Componente Material se houver */}
        {magia.componente_material && magia.descricao_material && (
          <div className="text-[10px] italic mb-1.5 opacity-85 leading-snug">
            <strong>Material:</strong> {magia.descricao_material}
          </div>
        )}

        {/* Descrição Formatada */}
        <div
          className={`text-[11px] leading-relaxed line-clamp-8 ${themeStyles.bodyText}`}
        >
          <p className="whitespace-pre-line">{stripMarkdown(magia.descricao)}</p>
        </div>
      </div>

      {/* Footer: Classes & Livro de Referência */}
      <div className="pt-2 mt-2 border-t border-current/20 flex items-center justify-between text-[9px] opacity-80">
        <div className="truncate pr-1">
          <strong>Classes:</strong>{' '}
          {magia.conjuradores && magia.conjuradores.length > 0
            ? magia.conjuradores.map((c) => c.classe).join(', ')
            : 'Qualquer'}
        </div>
        {magia.nome_livro && (
          <div className="shrink-0 italic">
            {magia.nome_livro}
          </div>
        )}
      </div>
    </div>
  );
};
