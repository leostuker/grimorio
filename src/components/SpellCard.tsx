import React from 'react';
import {
  Clock,
  Compass,
  Hourglass,
  Shield,
  Layers,
  Crosshair,
} from 'lucide-react';
import { MagiaCompleta } from '../types';
import {
  formatCirculo,
  getEscolaColor,
  getTipoDanoBadgeClass,
  formatDanoFormula,
  stripMarkdown,
} from '../utils/magicHelpers';

interface SpellCardProps {
  magia: MagiaCompleta;
  onView: (magia: MagiaCompleta) => void;
  onEdit?: (magia: MagiaCompleta) => void;
  onDelete?: (magia: MagiaCompleta) => void;
}

export const SpellCard: React.FC<SpellCardProps> = ({
  magia,
  onView,
}) => {
  const escolaColor = getEscolaColor(magia.escola);
  const danoFormula = formatDanoFormula(
    magia.dado_dano,
    magia.numero_dados_dano,
    magia.bonus_dano
  );

  return (
    <div
      id={`spell-card-${magia.id_magia}`}
      onClick={() => onView(magia)}
      className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-md p-5 shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
            {formatCirculo(magia.circulo)}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded border whitespace-nowrap ${escolaColor.badge}`}
          >
            {magia.escola}
          </span>
        </div>

        <h3
          className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors truncate mb-2.5"
          title={magia.nome_magia}
        >
          {magia.nome_magia}
        </h3>

        {/* Quick Specs Grid */}
        <div className="grid grid-cols-2 gap-2 my-2.5 py-2.5 px-3 bg-slate-950/60 rounded border border-slate-800/60 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate" title={magia.tempo}>
              {magia.tempo}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Compass className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate" title={magia.alcance}>
              {magia.alcance}
              {magia.forma ? ` (${magia.forma})` : ''}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Hourglass className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span className="truncate" title={magia.duracao}>
              {magia.duracao}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span className="font-mono tracking-wider font-semibold">
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

        {/* Badges de Regras (Concentração, Salvaguarda, Ataque, Dano) */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {magia.concentracao && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-700/50">
              Concentração
            </span>
          )}

          {magia.salvaguarda && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-700/50 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Salv: {magia.atributo_salvaguarda || 'Sim'}
            </span>
          )}

          {magia.ataque && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-700/50 flex items-center gap-1">
              <Crosshair className="w-3 h-3" />
              Ataque
            </span>
          )}

          {danoFormula && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-700/60 font-mono">
              {danoFormula}
            </span>
          )}

          {magia.tipos_dano &&
            magia.tipos_dano.map((td) => (
              <span
                key={td}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getTipoDanoBadgeClass(
                  td
                )}`}
              >
                {td}
              </span>
            ))}
        </div>

        {/* Descrição com mais espaço */}
        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3">
          {stripMarkdown(magia.descricao)}
        </p>
      </div>

      {/* Footer: Classes em linha única sem scrollbar com indicador +N */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center gap-1.5 overflow-hidden text-xs">
        {magia.conjuradores && magia.conjuradores.length > 0 ? (
          <>
            {magia.conjuradores.slice(0, 3).map((c) => (
              <span
                key={c.id_conjurador}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium whitespace-nowrap"
              >
                {c.classe}
              </span>
            ))}
            {magia.conjuradores.length > 3 && (
              <span
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/80 font-medium whitespace-nowrap"
                title={magia.conjuradores.slice(3).map((c) => c.classe).join(', ')}
              >
                +{magia.conjuradores.length - 3}
              </span>
            )}
          </>
        ) : (
          <span className="text-[10px] text-slate-500 italic">Sem conjurador</span>
        )}
      </div>
    </div>
  );
};
