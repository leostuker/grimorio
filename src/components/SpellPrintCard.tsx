import React from 'react';
import {
  Clock,
  Compass,
  Hourglass,
  Layers,
} from 'lucide-react';
import { MagiaCompleta } from '../types';
import {
  formatCirculo,
  formatDanoFormula,
} from '../utils/magicHelpers';
import ReactMarkdown from 'react-markdown';

export type PrintTheme = 'parchment' | 'eco_white' | 'dark_arcane';
export type CardSize = 'card_standard' | 'card_medium' | 'grimoire_sheet';

interface SpellPrintCardProps {
  magia: MagiaCompleta;
  theme?: PrintTheme;
  cardSize?: CardSize;
  isWide?: boolean;
  id?: string;
  className?: string;
}

export const SpellPrintCard: React.FC<SpellPrintCardProps> = ({
  magia,
  theme = 'parchment',
  cardSize = 'card_standard',
  isWide = false,
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
      wrapper: 'bg-[#fcf8ee] text-[#2c1d11] border-[#8a6d3b] shadow-xs print:shadow-none print:border-[#8a6d3b]',
      headerBg: 'bg-[#ede3cc] border-b border-[#8a6d3b]/60',
      title: 'text-[#4a1c1a]',
      subtitle: 'text-[#6b3f17]',
      subBox: 'bg-[#f4ebd0] border-[#d8c7a1]',
      badgePill: 'bg-[#ede0c4] text-[#4a2e0e] border-[#cbb78d]',
      bodyText: 'text-[#2a1d15]',
      divider: 'border-[#cbb78d]',
      footerBg: 'bg-[#f4ebd0] border-t border-[#8a6d3b]/40 text-[#4a3424]',
      iconColor: 'text-[#8a4e1d]',
    },
    eco_white: {
      wrapper: 'bg-white text-black border-stone-800 shadow-none print:border-black',
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

  return (
    <div
      id={id || `print-card-${magia.id_magia}`}
      className={`relative rounded-lg border-2 flex flex-col justify-between overflow-hidden font-sans print-card-break print:break-inside-avoid print:page-break-inside-avoid ${themeStyles.wrapper} p-3.5 sm:p-4 text-xs ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-current/20">
          <div className="flex-1 min-w-0">
            <h3
              className={`font-black text-sm sm:text-base leading-tight tracking-tight uppercase ${themeStyles.title}`}
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
          className={`grid ${isWide ? 'grid-cols-4' : 'grid-cols-2'} gap-1.5 p-2 my-2 rounded border text-[10px] font-medium leading-tight ${themeStyles.subBox}`}
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
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${themeStyles.badgePill}`}
            >
              Concentração
            </span>
          )}

          {magia.salvaguarda && (
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${themeStyles.badgePill}`}
            >
              Salvaguarda: {magia.atributo_salvaguarda || 'Sim'}
            </span>
          )}

          {magia.ataque && (
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${themeStyles.badgePill}`}
            >
              Ataque Mágico
            </span>
          )}

          {danoFormula && (
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono border ${themeStyles.badgePill}`}
            >
              Dano: {danoFormula}
            </span>
          )}

          {magia.tipos_dano &&
            magia.tipos_dano.map((td) => (
              <span
                key={td}
                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${themeStyles.badgePill}`}
              >
                {td}
              </span>
            ))}
        </div>

        {/* Detalhes do Componente Material se houver */}
        {magia.componente_material && magia.descricao_material && (
          <div className="text-[10px] italic mb-2 opacity-90 leading-snug">
            <strong>Material:</strong> {magia.descricao_material}
          </div>
        )}

        {/* Descrição com suporte Completo a Markdown */}
        <div
          className={`spell-card-markdown text-[11px] leading-relaxed my-1.5 ${themeStyles.bodyText}`}
        >
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-inherit">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-inherit">{children}</em>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-3.5 mb-1.5 space-y-0.5">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-3.5 mb-1.5 space-y-0.5">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="leading-snug">{children}</li>
              ),
              h1: ({ children }) => (
                <h4 className="font-bold uppercase tracking-tight text-[11px] mt-2 mb-0.5">
                  {children}
                </h4>
              ),
              h2: ({ children }) => (
                <h4 className="font-bold uppercase tracking-tight text-[11px] mt-2 mb-0.5">
                  {children}
                </h4>
              ),
              h3: ({ children }) => (
                <h5 className="font-bold text-[10.5px] mt-1.5 mb-0.5">
                  {children}
                </h5>
              ),
              h4: ({ children }) => (
                <h5 className="font-bold text-[10.5px] mt-1.5 mb-0.5">
                  {children}
                </h5>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-current/30 pl-2 my-1.5 italic opacity-90">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-1.5 border border-current/20 rounded">
                  <table className="min-w-full text-[10px] text-left border-collapse">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border-b border-current/20 p-1 font-bold bg-current/5">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border-b border-current/10 p-1">{children}</td>
              ),
              code: ({ children }) => (
                <code className="bg-current/10 px-1 py-0.5 rounded font-mono text-[10px]">
                  {children}
                </code>
              ),
            }}
          >
            {magia.descricao || ''}
          </ReactMarkdown>
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
          <div className="shrink-0 italic font-medium">
            {magia.nome_livro}
          </div>
        )}
      </div>
    </div>
  );
};
